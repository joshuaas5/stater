import { UserPlanManager } from './userPlanManager';
import { UserJourneyManager } from './userJourneyManager';
import { RewardCooldownManager } from './rewardCooldownManager';
import { PlanType } from '@/types';
import { getCurrentUser } from '@/utils/localStorage';

export interface AdCooldown {
  lastAdShown: Date;
  cooldownMinutes: number;
}

export interface AdResult {
  success: boolean;
  reward?: string;
  error?: string;
}

export interface RewardedAdResult {
  success: boolean;
  rewardGranted: boolean;
  messagesGranted: number;
  error?: string;
}

export interface ContextualAdResult {
  watched: boolean;
  actionsGranted: number;
  error?: string;
  cooldownMinutes?: number;
}

// Contas de desenvolvedor que não veem ads nem limitações
const DEVELOPER_ACCOUNTS = [
  'joshuaas500@gmail.com',
  'joshua@stater.app'
];

/**
 * Verifica se é conta de desenvolvedor
 */
export function isDeveloperAccount(userId?: string): boolean {
  // TEMPORARIAMENTE DESABILITADO PARA INVESTIDORES - TODOS SÃO TRATADOS COMO DEV
  return true;
  
  try {
    const user = getCurrentUser();
    if (!user) return false;
    
    const email = user.email?.toLowerCase();
    return DEVELOPER_ACCOUNTS.includes(email || '');
  } catch {
    return false;
  }
}

/**
 * Gerenciador de anúncios estratégicos para monetização
 */
export class AdManager {
  
  /**
   * Verifica se deve mostrar anúncio para adicionar bill
   * Estratégia: Alternado (1º sem ad, 2º com ad, 3º sem ad...)
   */
  static async shouldShowAdForBill(userId: string): Promise<boolean> {
    try {
      // Contas de desenvolvedor nunca veem ads
      if (isDeveloperAccount(userId)) {
        console.log('🔧 [DEV] Conta desenvolvedor - sem ads');
        return false;
      }
      
      const userPlan = await UserPlanManager.getUserPlan(userId);
      
      // Usuários pagos não veem ads
      if (userPlan.planType !== PlanType.FREE) {
        return false;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const usage = await UserPlanManager.getTodayUsage(userId, today);
      
      // Primeira bill sempre sem ad (boa primeira impressão)
      if (usage.billsAdded === 0) {
        return false;
      }
      
      // A partir da segunda, alternar: par = com ad, ímpar = sem ad
      const isEvenBill = (usage.billsAdded + 1) % 2 === 0;
      
      if (isEvenBill) {
        // Verificar cooldown
        return await this.checkCooldown(userId, 'bills', 5); // 5 minutos
      }
      
      return false;
      
    } catch (error) {
      console.error('Erro ao verificar ad para bill:', error);
      return false;
    }
  }
  
  /**
   * Verifica se deve mostrar anúncio para adicionar transação
   * Estratégia: A cada 3ª transação
   */
  static async shouldShowAdForTransaction(userId: string): Promise<boolean> {
    try {
      // Contas de desenvolvedor nunca veem ads
      if (isDeveloperAccount(userId)) {
        console.log('🔧 [DEV] Conta desenvolvedor - sem ads');
        return false;
      }
      
      const userPlan = await UserPlanManager.getUserPlan(userId);
      
      // Usuários pagos não veem ads
      if (userPlan.planType !== PlanType.FREE) {
        return false;
      }
      
      const today = new Date().toISOString().split('T')[0];
      const usage = await UserPlanManager.getTodayUsage(userId, today);
      
      // A cada 3ª transação
      const isThirdTransaction = (usage.transactionsAdded + 1) % 3 === 0;
      
      if (isThirdTransaction) {
        // Verificar cooldown
        return await this.checkCooldown(userId, 'transactions', 3); // 3 minutos
      }
      
      return false;
      
    } catch (error) {
      console.error('Erro ao verificar ad para transação:', error);
      return false;
    }
  }
  
  /**
   * Verifica se deve mostrar anúncio para mensagens (jornada progressiva)
   */
  static async shouldShowAdForMessages(userId: string): Promise<{
    shouldShow: boolean;
    adsRequired: number;
    messagesReward: number;
    day: number;
  }> {
    try {
      // Contas de desenvolvedor nunca veem ads
      if (isDeveloperAccount(userId)) {
        console.log('🔧 [DEV] Conta desenvolvedor - sem limitações');
        return {
          shouldShow: false,
          adsRequired: 0,
          messagesReward: 999, // Mensagens ilimitadas
          day: 0
        };
      }
      
      const userPlan = await UserPlanManager.getUserPlan(userId);
      
      // Usuários pagos não veem ads
      if (userPlan.planType !== PlanType.FREE) {
        return {
          shouldShow: false,
          adsRequired: 0,
          messagesReward: 0,
          day: 0
        };
      }
      
      const journey = await UserPlanManager.getUserJourney(userId);
      
      // Jornada progressiva de 3 dias
      const journeyConfig = {
        1: { adsRequired: 1, messagesReward: 3 },
        2: { adsRequired: 2, messagesReward: 4 },
        3: { adsRequired: 3, messagesReward: 5 }
      };
      
      // Dia 4+ = paywall obrigatório
      if (journey.currentDay >= 4) {
        await UserPlanManager.updateUserJourney(userId, { hasReachedPaywall: true });
        return {
          shouldShow: false,
          adsRequired: 0,
          messagesReward: 0,
          day: journey.currentDay
        };
      }
      
      const dayConfig = journeyConfig[journey.currentDay as keyof typeof journeyConfig];
      
      if (!dayConfig) {
        return {
          shouldShow: false,
          adsRequired: 0,
          messagesReward: 0,
          day: journey.currentDay
        };
      }
      
      // Verificar se já assistiu os ads necessários hoje
      const shouldShow = journey.adsWatchedToday < dayConfig.adsRequired;
      
      return {
        shouldShow,
        adsRequired: dayConfig.adsRequired,
        messagesReward: dayConfig.messagesReward,
        day: journey.currentDay
      };
      
    } catch (error) {
      console.error('Erro ao verificar ad para mensagens:', error);
      return {
        shouldShow: false,
        adsRequired: 0,
        messagesReward: 0,
        day: 1
      };
    }
  }
  
  /**
   * Verifica cooldown entre anúncios da mesma categoria
   */
  static async checkCooldown(userId: string, category: 'bills' | 'transactions', cooldownMinutes: number): Promise<boolean> {
    try {
      const cooldownKey = `adCooldown_${userId}_${category}`;
      const cooldownData = localStorage.getItem(cooldownKey);
      
      if (!cooldownData) {
        return true; // Não há cooldown ativo
      }
      
      const cooldown: AdCooldown = JSON.parse(cooldownData);
      const now = new Date();
      const lastAd = new Date(cooldown.lastAdShown);
      const minutesSinceLastAd = (now.getTime() - lastAd.getTime()) / (1000 * 60);
      
      return minutesSinceLastAd >= cooldownMinutes;
      
    } catch (error) {
      console.error('Erro ao verificar cooldown:', error);
      return true; // Em caso de erro, permitir anúncio
    }
  }
  
  /**
   * Marca que um anúncio foi mostrado (para cooldown)
   */
  static async markAdShown(userId: string, category: 'bills' | 'transactions'): Promise<void> {
    try {
      const cooldownKey = `adCooldown_${userId}_${category}`;
      const cooldown: AdCooldown = {
        lastAdShown: new Date(),
        cooldownMinutes: category === 'bills' ? 5 : 3
      };
      
      localStorage.setItem(cooldownKey, JSON.stringify(cooldown));
      console.log(`🎬 Ad marcado como mostrado: ${category} para usuário ${userId}`);
      
    } catch (error) {
      console.error('Erro ao marcar ad como mostrado:', error);
    }
  }
  
  /**
   * Simula a exibição de um anúncio rewarded
   * TODO: Integrar com AdMob ou similar
   */
  static async showRewardedAd(type: 'bills' | 'transactions' | 'messages'): Promise<AdResult> {
    try {
      // Por enquanto, simular anúncio
      console.log(`🎬 Mostrando anúncio rewarded: ${type}`);
      
      // Simular tempo de anúncio (5-8 segundos)
      const adDuration = Math.random() * 3000 + 5000; // 5-8 segundos
      
      return new Promise((resolve) => {
        setTimeout(() => {
          // 90% de chance de sucesso (usuário assiste até o fim)
          const success = Math.random() > 0.1;
          
          if (success) {
            resolve({
              success: true,
              reward: this.getAdReward(type)
            });
          } else {
            resolve({
              success: false,
              error: 'Anúncio não foi assistido até o fim'
            });
          }
        }, adDuration);
      });
      
    } catch (error) {
      console.error('Erro ao mostrar anúncio:', error);
      return {
        success: false,
        error: 'Erro ao carregar anúncio'
      };
    }
  }
  
  /**
   * Define a recompensa baseada no tipo de anúncio
   */
  static getAdReward(type: 'bills' | 'transactions' | 'messages'): string {
    switch (type) {
      case 'bills':
        return 'Continue adicionando contas';
      case 'transactions':
        return 'Continue adicionando transações';
      case 'messages':
        return 'Mensagens liberadas para uso';
      default:
        return 'Obrigado por assistir!';
    }
  }
  
  /**
   * Processa a recompensa após assistir um anúncio
   */
  static async processAdReward(userId: string, type: 'bills' | 'transactions' | 'messages'): Promise<void> {
    try {
      // Marcar que o ad foi assistido
      if (type === 'bills' || type === 'transactions') {
        await this.markAdShown(userId, type);
      }
      
      // Para mensagens, atualizar jornada
      if (type === 'messages') {
        const journey = await UserPlanManager.getUserJourney(userId);
        await UserPlanManager.updateUserJourney(userId, {
          adsWatchedToday: journey.adsWatchedToday + 1
        });
        
        // Incrementar uso de ads
        const today = new Date().toISOString().split('T')[0];
        const usage = await UserPlanManager.getTodayUsage(userId, today);
        usage.adsWatched++;
        localStorage.setItem(`userUsage_${userId}_${today}`, JSON.stringify(usage));
      }
      
      console.log(`💰 Recompensa processada: ${type} para usuário ${userId}`);
      
    } catch (error) {
      console.error('Erro ao processar recompensa do ad:', error);
    }
  }
  
  /**
   * Verifica se o usuário atingiu o paywall
   */
  static async hasReachedPaywall(userId: string): Promise<boolean> {
    try {
      // Contas de desenvolvedor nunca atingem paywall
      if (isDeveloperAccount(userId)) {
        console.log('🔧 [DEV] Conta desenvolvedor - sem paywall');
        return false;
      }
      
      const journey = await UserPlanManager.getUserJourney(userId);
      return journey.currentDay >= 4 || journey.hasReachedPaywall;
      
    } catch (error) {
      console.error('Erro ao verificar paywall:', error);
      return false;
    }
  }
  
  /**
   * Força o usuário a atingir o paywall (para testes)
   */
  static async forcePaywall(userId: string): Promise<void> {
    try {
      await UserPlanManager.updateUserJourney(userId, {
        currentDay: 4,
        hasReachedPaywall: true
      });
      
      console.log(`🚫 Paywall forçado para usuário ${userId}`);
      
    } catch (error) {
      console.error('Erro ao forçar paywall:', error);
    }
  }

  // ========================================
  // SISTEMA DE ADS REWARDED (JORNADA 3 DIAS)
  // ========================================

  /**
   * Simula um anúncio rewarded para jornada (substituir por AdMob quando disponível)
   */
  static async showJourneyRewardedAd(): Promise<RewardedAdResult> {
    try {
      // Simular delay do anúncio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular 95% de sucesso (alguns ads podem falhar)
      const success = Math.random() > 0.05;
      
      if (!success) {
        return {
          success: false,
          rewardGranted: false,
          messagesGranted: 0,
          error: 'Anúncio não pôde ser carregado. Tente novamente.'
        };
      }
      
      console.log('🎬 Ad rewarded simulado com sucesso');
      
      return {
        success: true,
        rewardGranted: true,
        messagesGranted: 0, // Será definido pelo UserJourneyManager
      };
      
    } catch (error) {
      console.error('Erro ao mostrar ad rewarded:', error);
      return {
        success: false,
        rewardGranted: false,
        messagesGranted: 0,
        error: 'Erro interno do anúncio'
      };
    }
  }

  /**
   * Executa o fluxo completo de ad rewarded para mensagens
   */
  static async watchRewardedAdForMessages(userId: string): Promise<RewardedAdResult> {
    try {
      // Verificar se pode assistir ad
      const canWatch = await UserJourneyManager.canWatchAdForMessages(userId);
      if (!canWatch.canWatch) {
        return {
          success: false,
          rewardGranted: false,
          messagesGranted: 0,
          error: 'Não é possível assistir mais anúncios hoje'
        };
      }
      
      // Mostrar anúncio
      const adResult = await this.showJourneyRewardedAd();
      if (!adResult.success) {
        return adResult;
      }
      
      // Conceder recompensa
      const rewardResult = await UserJourneyManager.watchAdReward(userId);
      if (!rewardResult.success) {
        return {
          success: false,
          rewardGranted: false,
          messagesGranted: 0,
          error: 'Erro ao conceder recompensa'
        };
      }
      
      console.log(`✨ Recompensa concedida: ${rewardResult.messagesGranted} mensagens`);
      
      return {
        success: true,
        rewardGranted: true,
        messagesGranted: rewardResult.messagesGranted
      };
      
    } catch (error) {
      console.error('Erro no fluxo de ad rewarded:', error);
      return {
        success: false,
        rewardGranted: false,
        messagesGranted: 0,
        error: 'Erro interno'
      };
    }
  }

  /**
   * Verifica se o usuário precisa ver ads para continuar usando o app
   */
  static async needsRewardedAd(userId: string): Promise<{
    needsAd: boolean;
    reason: 'no_messages' | 'daily_limit' | 'paywall_time' | 'none';
    currentDay: number;
    adsWatched: number;
    adsRequired: number;
  }> {
    try {
      const canSend = await UserJourneyManager.canSendMessage(userId);
      
      if (canSend.reason === 'need_ad') {
        return {
          needsAd: true,
          reason: 'no_messages',
          currentDay: canSend.currentDay,
          adsWatched: canSend.adsWatched,
          adsRequired: canSend.adsRequired
        };
      }
      
      if (canSend.reason === 'paywall_required') {
        return {
          needsAd: false,
          reason: 'paywall_time',
          currentDay: canSend.currentDay,
          adsWatched: canSend.adsWatched,
          adsRequired: canSend.adsRequired
        };
      }
      
      return {
        needsAd: false,
        reason: 'none',
        currentDay: canSend.currentDay,
        adsWatched: canSend.adsWatched,
        adsRequired: canSend.adsRequired
      };
      
    } catch (error) {
      console.error('Erro ao verificar necessidade de ad:', error);
      return {
        needsAd: false,
        reason: 'none',
        currentDay: 1,
        adsWatched: 0,
        adsRequired: 0
      };
    }
  }

  /**
   * Mostra anúncio contextual para ações específicas (bills/transactions)
   */
  static async showContextualAd(
    userId: string, 
    action: 'bills' | 'transactions' | 'financial_analysis'
  ): Promise<ContextualAdResult> {
    try {
      console.log(`🎯 Exibindo anúncio contextual para ${action} - usuário: ${userId}`);
      
      // Verificar cooldown antes de mostrar o ad
      const cooldownStatus = await RewardCooldownManager.checkCooldownStatus(userId, action);
      
      if (cooldownStatus.isInCooldown) {
        const timeRemaining = RewardCooldownManager.formatRemainingTime(cooldownStatus.remainingMinutes || 0);
        console.log(`⏰ [COOLDOWN] Usuário em cooldown para ${action}. Tempo restante: ${timeRemaining}`);
        
        return {
          watched: false,
          actionsGranted: 0,
          error: `Aguarde ${timeRemaining} para assistir outro anúncio`,
          cooldownMinutes: cooldownStatus.remainingMinutes
        };
      }
      
      // Simular carregamento do anúncio
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simular sucesso do anúncio (95% taxa de sucesso)
      const adSuccess = Math.random() < 0.95;
      
      if (!adSuccess) {
        return {
          watched: false,
          actionsGranted: 0,
          error: 'Falha ao carregar anúncio. Tente novamente.'
        };
      }
      
      // Simular assistir anúncio de 30 segundos
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const rewardConfig = {
        bills: { actions: 3, cooldown: 30 },
        transactions: { actions: 5, cooldown: 20 },
        financial_analysis: { actions: 1, cooldown: 10080 } // 1 mensagem adicional por semana (7 dias)
      };
      
      const reward = rewardConfig[action];
      
      // Registrar o cooldown após assistir o ad
      const cooldownSet = await RewardCooldownManager.setRewardCooldown(userId, action);
      if (!cooldownSet) {
        console.warn(`⚠️ [COOLDOWN] Falha ao registrar cooldown para ${action}`);
      }
      
      console.log(`✅ Anúncio contextual assistido! ${reward.actions} ${action} liberadas`);
      
      return {
        watched: true,
        actionsGranted: reward.actions,
        cooldownMinutes: reward.cooldown
      };
      
    } catch (error) {
      console.error('Erro ao exibir anúncio contextual:', error);
      return {
        watched: false,
        actionsGranted: 0,
        error: 'Erro interno. Tente novamente.'
      };
    }
  }

  /**
   * Obtém estatísticas de anúncios contextuais
   */
  static async getContextualAdStats(userId: string): Promise<{
    billsAdsWatched: number;
    transactionsAdsWatched: number;
    totalActionsGranted: number;
  }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const billsAds = parseInt(localStorage.getItem(`contextualAds_${userId}_bills_${today}`) || '0');
      const transactionsAds = parseInt(localStorage.getItem(`contextualAds_${userId}_transactions_${today}`) || '0');
      
      return {
        billsAdsWatched: billsAds,
        transactionsAdsWatched: transactionsAds,
        totalActionsGranted: (billsAds * 3) + (transactionsAds * 5)
      };
      
    } catch (error) {
      console.error('Erro ao obter estatísticas de ads contextuais:', error);
      return {
        billsAdsWatched: 0,
        transactionsAdsWatched: 0,
        totalActionsGranted: 0
      };
    }
  }
}
