import { AdManager, isDeveloperAccount } from './adManager';
import { UserPlanManager } from './userPlanManager';

interface AdCooldownData {
  userId: string;
  action: 'bills' | 'transactions';
  lastAdTime: Date;
  adsWatchedToday: number;
  cooldownActive: boolean;
  nextAdAvailableAt?: Date;
}

interface AdCooldownConfig {
  bills: {
    cooldownMinutes: number;
    maxAdsPerDay: number;
    rewardActions: number; // Quantas ações liberadas por ad
  };
  transactions: {
    cooldownMinutes: number;
    maxAdsPerDay: number;
    rewardActions: number;
  };
}

/**
 * Gerenciador de cooldown de anúncios para ações específicas
 * Implementa sistema de ads contextuais para bills e transactions
 */
export class AdCooldownManager {
  
  // Configuração de cooldown por ação
  private static readonly CONFIG: AdCooldownConfig = {
    bills: {
      cooldownMinutes: 30,        // 30 min entre ads para bills
      maxAdsPerDay: 6,           // Max 6 ads por dia para bills
      rewardActions: 3           // Cada ad libera 3 bills
    },
    transactions: {
      cooldownMinutes: 20,        // 20 min entre ads para transactions
      maxAdsPerDay: 8,           // Max 8 ads por dia para transactions
      rewardActions: 5           // Cada ad libera 5 transactions
    }
  };

  /**
   * Verifica se o usuário pode fazer uma ação (bill/transaction) ou precisa ver ad
   */
  static async canPerformAction(
    userId: string, 
    action: 'bills' | 'transactions'
  ): Promise<{
    allowed: boolean;
    reason: 'free_actions' | 'premium_plan' | 'need_ad' | 'cooldown_active' | 'developer_account';
    cooldownData?: AdCooldownData;
    minutesUntilNextAd?: number;
  }> {
    try {
      // Contas de desenvolvedor têm acesso ilimitado
      if (isDeveloperAccount(userId)) {
        console.log('🔧 [DEV] Conta desenvolvedor - acesso ilimitado');
        return { allowed: true, reason: 'developer_account' };
      }
      
      // Verificar se é usuário premium
      const shouldShowAds = await UserPlanManager.shouldShowAds(userId);
      if (!shouldShowAds) {
        return { allowed: true, reason: 'premium_plan' };
      }

      // Obter dados de cooldown
      const cooldownData = await this.getCooldownData(userId, action);
      const config = this.CONFIG[action];

      // Verificar se ainda tem ações gratuitas disponíveis
      const freeActionsRemaining = await this.getFreeActionsRemaining(userId, action);
      if (freeActionsRemaining > 0) {
        return { allowed: true, reason: 'free_actions' };
      }

      // Verificar se está em cooldown
      if (cooldownData.cooldownActive && cooldownData.nextAdAvailableAt) {
        const now = new Date();
        if (now < cooldownData.nextAdAvailableAt) {
          const minutesUntilNextAd = Math.ceil(
            (cooldownData.nextAdAvailableAt.getTime() - now.getTime()) / (1000 * 60)
          );
          return { 
            allowed: false, 
            reason: 'cooldown_active',
            cooldownData,
            minutesUntilNextAd 
          };
        } else {
          // Cooldown expirou, resetar
          cooldownData.cooldownActive = false;
          cooldownData.nextAdAvailableAt = undefined;
          await this.saveCooldownData(cooldownData);
        }
      }

      // Verificar se atingiu limite diário de ads
      if (cooldownData.adsWatchedToday >= config.maxAdsPerDay) {
        return { 
          allowed: false, 
          reason: 'need_ad',
          cooldownData 
        };
      }

      // Pode ver ad para liberar ações
      return { 
        allowed: false, 
        reason: 'need_ad',
        cooldownData 
      };

    } catch (error) {
      console.error('Erro ao verificar permissão de ação:', error);
      return { allowed: false, reason: 'need_ad' };
    }
  }

  /**
   * Executa o fluxo de assistir anúncio para liberar ações
   */
  static async watchAdForActions(
    userId: string,
    action: 'bills' | 'transactions'
  ): Promise<{
    success: boolean;
    actionsGranted: number;
    message: string;
    cooldownMinutes: number;
  }> {
    try {
      const config = this.CONFIG[action];
      
      // Verificar se pode assistir ad
      const permission = await this.canPerformAction(userId, action);
      if (permission.reason === 'cooldown_active') {
        return {
          success: false,
          actionsGranted: 0,
          message: `Aguarde ${permission.minutesUntilNextAd} minutos para próximo anúncio`,
          cooldownMinutes: permission.minutesUntilNextAd || 0
        };
      }

      // Assistir anúncio
      const adResult = await AdManager.showContextualAd(userId, action);
      if (!adResult.watched) {
        return {
          success: false,
          actionsGranted: 0,
          message: adResult.error || 'Falha ao carregar anúncio',
          cooldownMinutes: 0
        };
      }

      // Conceder ações e iniciar cooldown
      await this.grantActions(userId, action, config.rewardActions);
      
      const actionText = action === 'bills' ? 'contas' : 'transações';
      
      return {
        success: true,
        actionsGranted: config.rewardActions,
        message: `🎉 Você ganhou ${config.rewardActions} ${actionText}! Próximo anúncio em ${config.cooldownMinutes} min.`,
        cooldownMinutes: config.cooldownMinutes
      };

    } catch (error) {
      console.error('Erro ao assistir anúncio para ações:', error);
      return {
        success: false,
        actionsGranted: 0,
        message: 'Erro interno. Tente novamente.',
        cooldownMinutes: 0
      };
    }
  }

  /**
   * Consome uma ação (decrementa contador)
   */
  static async consumeAction(
    userId: string,
    action: 'bills' | 'transactions'
  ): Promise<{ success: boolean; remaining: number }> {
    try {
      const key = `freeActions_${userId}_${action}_${this.getTodayString()}`;
      const current = parseInt(localStorage.getItem(key) || '0');
      
      if (current > 0) {
        const remaining = current - 1;
        localStorage.setItem(key, remaining.toString());
        console.log(`✅ ${action} consumida. Restantes: ${remaining}`);
        return { success: true, remaining };
      }
      
      return { success: false, remaining: 0 };
      
    } catch (error) {
      console.error('Erro ao consumir ação:', error);
      return { success: false, remaining: 0 };
    }
  }

  /**
   * Obtém dados de cooldown do usuário
   */
  private static async getCooldownData(
    userId: string, 
    action: 'bills' | 'transactions'
  ): Promise<AdCooldownData> {
    try {
      const key = `adCooldown_${userId}_${action}_${this.getTodayString()}`;
      const data = localStorage.getItem(key);
      
      if (!data) {
        return {
          userId,
          action,
          lastAdTime: new Date(0),
          adsWatchedToday: 0,
          cooldownActive: false
        };
      }
      
      const parsed = JSON.parse(data);
      return {
        ...parsed,
        lastAdTime: new Date(parsed.lastAdTime),
        nextAdAvailableAt: parsed.nextAdAvailableAt ? new Date(parsed.nextAdAvailableAt) : undefined
      };
      
    } catch (error) {
      console.error('Erro ao obter dados de cooldown:', error);
      return {
        userId,
        action,
        lastAdTime: new Date(0),
        adsWatchedToday: 0,
        cooldownActive: false
      };
    }
  }

  /**
   * Salva dados de cooldown
   */
  private static async saveCooldownData(data: AdCooldownData): Promise<void> {
    try {
      const key = `adCooldown_${data.userId}_${data.action}_${this.getTodayString()}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados de cooldown:', error);
    }
  }

  /**
   * Concede ações gratuitas após assistir anúncio
   */
  private static async grantActions(
    userId: string,
    action: 'bills' | 'transactions',
    amount: number
  ): Promise<void> {
    try {
      const config = this.CONFIG[action];
      const now = new Date();
      
      // Atualizar ações gratuitas
      const actionsKey = `freeActions_${userId}_${action}_${this.getTodayString()}`;
      const currentActions = parseInt(localStorage.getItem(actionsKey) || '0');
      localStorage.setItem(actionsKey, (currentActions + amount).toString());
      
      // Atualizar cooldown
      const cooldownData = await this.getCooldownData(userId, action);
      cooldownData.lastAdTime = now;
      cooldownData.adsWatchedToday++;
      cooldownData.cooldownActive = true;
      cooldownData.nextAdAvailableAt = new Date(now.getTime() + (config.cooldownMinutes * 60 * 1000));
      
      await this.saveCooldownData(cooldownData);
      
      console.log(`🎁 Concedidas ${amount} ações de ${action} para usuário ${userId}`);
      
    } catch (error) {
      console.error('Erro ao conceder ações:', error);
    }
  }

  /**
   * Obtém ações gratuitas restantes
   */
  private static async getFreeActionsRemaining(
    userId: string,
    action: 'bills' | 'transactions'
  ): Promise<number> {
    try {
      const key = `freeActions_${userId}_${action}_${this.getTodayString()}`;
      return parseInt(localStorage.getItem(key) || '0');
    } catch (error) {
      console.error('Erro ao obter ações restantes:', error);
      return 0;
    }
  }

  /**
   * Obtém estatísticas de cooldown do usuário
   */
  static async getCooldownStats(userId: string): Promise<{
    bills: {
      freeActionsRemaining: number;
      adsWatchedToday: number;
      cooldownActive: boolean;
      minutesUntilNextAd?: number;
    };
    transactions: {
      freeActionsRemaining: number;
      adsWatchedToday: number;
      cooldownActive: boolean;
      minutesUntilNextAd?: number;
    };
  }> {
    const [billsData, transactionsData] = await Promise.all([
      this.getCooldownData(userId, 'bills'),
      this.getCooldownData(userId, 'transactions')
    ]);

    const [billsRemaining, transactionsRemaining] = await Promise.all([
      this.getFreeActionsRemaining(userId, 'bills'),
      this.getFreeActionsRemaining(userId, 'transactions')
    ]);

    const now = new Date();

    return {
      bills: {
        freeActionsRemaining: billsRemaining,
        adsWatchedToday: billsData.adsWatchedToday,
        cooldownActive: billsData.cooldownActive && 
          billsData.nextAdAvailableAt ? now < billsData.nextAdAvailableAt : false,
        minutesUntilNextAd: billsData.nextAdAvailableAt && now < billsData.nextAdAvailableAt
          ? Math.ceil((billsData.nextAdAvailableAt.getTime() - now.getTime()) / (1000 * 60))
          : undefined
      },
      transactions: {
        freeActionsRemaining: transactionsRemaining,
        adsWatchedToday: transactionsData.adsWatchedToday,
        cooldownActive: transactionsData.cooldownActive && 
          transactionsData.nextAdAvailableAt ? now < transactionsData.nextAdAvailableAt : false,
        minutesUntilNextAd: transactionsData.nextAdAvailableAt && now < transactionsData.nextAdAvailableAt
          ? Math.ceil((transactionsData.nextAdAvailableAt.getTime() - now.getTime()) / (1000 * 60))
          : undefined
      }
    };
  }

  /**
   * Reset diário dos dados (chamado automaticamente)
   */
  static async resetDailyData(userId: string): Promise<void> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      // Limpar dados do dia anterior
      const keysToRemove = [
        `adCooldown_${userId}_bills_${yesterdayString}`,
        `adCooldown_${userId}_transactions_${yesterdayString}`,
        `freeActions_${userId}_bills_${yesterdayString}`,
        `freeActions_${userId}_transactions_${yesterdayString}`
      ];

      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`🧹 Dados de cooldown do dia anterior limpos para usuário ${userId}`);
      
    } catch (error) {
      console.error('Erro ao resetar dados diários:', error);
    }
  }

  /**
   * Utilitário para obter string do dia atual
   */
  private static getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }
}
