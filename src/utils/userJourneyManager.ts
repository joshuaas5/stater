import { UserJourney, UserUsage } from '@/types';
import { UserPlanManager } from './userPlanManager';
import { isDeveloperAccount } from './adManager';

/**
 * Gerenciador da jornada progressiva de 3 dias para usuários FREE
 * 
 * ESTRATÉGIA:
 * - Dia 1: 1 ad rewarded → 3 mensagens
 * - Dia 2: 2 ads rewarded → 4 mensagens  
 * - Dia 3: 3 ads rewarded → 5 mensagens
 * - Dia 4+: Paywall obrigatório
 */
export class UserJourneyManager {
  
  /**
   * Configuração da jornada progressiva
   */
  private static readonly JOURNEY_CONFIG = {
    1: { adsRequired: 1, messagesGranted: 3 },
    2: { adsRequired: 2, messagesGranted: 4 },
    3: { adsRequired: 3, messagesGranted: 5 }
  } as const;

  /**
   * Obtém informações da jornada do usuário
   */
  static async getUserJourney(userId: string): Promise<UserJourney> {
    try {
      const journeyData = localStorage.getItem(`userJourney_${userId}`);
      
      if (!journeyData) {
        const newJourney: UserJourney = {
          userId,
          startDate: new Date(),
          currentDay: 1,
          adsWatchedToday: 0,
          messagesGrantedToday: 0,
          hasReachedPaywall: false,
          lastResetDate: new Date().toISOString().split('T')[0]
        };
        
        await this.saveUserJourney(newJourney);
        return newJourney;
      }
      
      const journey: UserJourney = JSON.parse(journeyData);
      
      // Verificar se precisa resetar para novo dia
      const today = new Date().toISOString().split('T')[0];
      if (journey.lastResetDate !== today) {
        journey.adsWatchedToday = 0;
        journey.messagesGrantedToday = 0;
        journey.lastResetDate = today;
        await this.saveUserJourney(journey);
      }
      
      // Calcular o dia atual baseado na data de início
      const startDate = new Date(journey.startDate);
      const todayDate = new Date();
      const daysDiff = Math.floor((todayDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      journey.currentDay = Math.max(1, daysDiff);
      
      // Se passou do dia 3, marcar paywall
      if (journey.currentDay > 3) {
        journey.hasReachedPaywall = true;
        await this.saveUserJourney(journey);
      }
      
      return journey;
      
    } catch (error) {
      console.error('Erro ao obter jornada do usuário:', error);
      const fallbackJourney: UserJourney = {
        userId,
        startDate: new Date(),
        currentDay: 1,
        adsWatchedToday: 0,
        messagesGrantedToday: 0,
        hasReachedPaywall: false,
        lastResetDate: new Date().toISOString().split('T')[0]
      };
      await this.saveUserJourney(fallbackJourney);
      return fallbackJourney;
    }
  }

  /**
   * Salva a jornada do usuário
   */
  static async saveUserJourney(journey: UserJourney): Promise<void> {
    try {
      localStorage.setItem(`userJourney_${journey.userId}`, JSON.stringify(journey));
      console.log(`🚀 Jornada salva - Dia ${journey.currentDay}, Ads: ${journey.adsWatchedToday}, Msgs: ${journey.messagesGrantedToday}`);
    } catch (error) {
      console.error('Erro ao salvar jornada:', error);
    }
  }

  /**
   * Atualiza a jornada do usuário
   */
  static async updateUserJourney(userId: string, updates: Partial<UserJourney>): Promise<void> {
    try {
      const journey = await this.getUserJourney(userId);
      const updatedJourney = { ...journey, ...updates };
      await this.saveUserJourney(updatedJourney);
      
      console.log(`🚀 Jornada atualizada para usuário ${userId}:`, updates);
    } catch (error) {
      console.error('Erro ao atualizar jornada:', error);
    }
  }

  /**
   * Verifica se o usuário precisa ver o paywall (dia 4+)
   */
  static async shouldShowPaywall(userId: string): Promise<boolean> {
    // TEMPORARIAMENTE DESABILITADO PARA INVESTIDORES
    return false;
    try {
      // VERIFICAÇÃO DE CONTA DE DESENVOLVEDOR - NUNCA PAYWALL
      if (isDeveloperAccount(userId)) {
        console.log(`🚀 [DEVELOPER ACCOUNT] Desenvolvedor nunca vê paywall`);
        return false;
      }
      
      const journey = await this.getUserJourney(userId);
      
      // Se já passou do dia 3, deve mostrar paywall
      if (journey.currentDay > 3) {
        return true;
      }
      
      // Se está nos dias 1-3, verificar se já esgotou as mensagens do dia
      const dayConfig = this.JOURNEY_CONFIG[journey.currentDay as keyof typeof this.JOURNEY_CONFIG];
      if (!dayConfig) return true; // Fallback para paywall se configuração não existe
      
      // Se já usou todas as mensagens concedidas hoje, precisa ver ad ou paywall
      const usage = await UserPlanManager.getTodayUsage(userId, new Date().toISOString().split('T')[0]);
      
      return usage.messagesUsed >= (journey.messagesGrantedToday || 0);
      
    } catch (error) {
      console.error('Erro ao verificar paywall:', error);
      return true; // Em caso de erro, mostrar paywall por segurança
    }
  }

  /**
   * Verifica se o usuário pode ver um ad rewarded para ganhar mensagens
   */
  static async canWatchAdForMessages(userId: string): Promise<{
    canWatch: boolean;
    adsNeeded: number;
    adsWatched: number;
    messagesWillGrant: number;
  }> {
    try {
      // VERIFICAÇÃO DE CONTA DE DESENVOLVEDOR - NÃO PRECISA DE ADS
      if (isDeveloperAccount(userId)) {
        console.log(`🚀 [DEVELOPER ACCOUNT] Desenvolvedor não precisa assistir ads`);
        return {
          canWatch: false, // Desenvolvedor não precisa de ads
          adsNeeded: 0,
          adsWatched: 0,
          messagesWillGrant: 0 // Já tem mensagens ilimitadas
        };
      }
      
      const journey = await this.getUserJourney(userId);
      
      // Se passou do dia 3, não pode mais ver ads
      if (journey.currentDay > 3) {
        return {
          canWatch: false,
          adsNeeded: 0,
          adsWatched: journey.adsWatchedToday,
          messagesWillGrant: 0
        };
      }
      
      const dayConfig = this.JOURNEY_CONFIG[journey.currentDay as keyof typeof this.JOURNEY_CONFIG];
      if (!dayConfig) {
        return {
          canWatch: false,
          adsNeeded: 0,
          adsWatched: journey.adsWatchedToday,
          messagesWillGrant: 0
        };
      }
      
      // Verificar se já assistiu todos os ads do dia
      const canWatch = journey.adsWatchedToday < dayConfig.adsRequired;
      
      return {
        canWatch,
        adsNeeded: dayConfig.adsRequired,
        adsWatched: journey.adsWatchedToday,
        messagesWillGrant: dayConfig.messagesGranted
      };
      
    } catch (error) {
      console.error('Erro ao verificar ads:', error);
      return {
        canWatch: false,
        adsNeeded: 0,
        adsWatched: 0,
        messagesWillGrant: 0
      };
    }
  }

  /**
   * Registra que o usuário assistiu um ad e concede mensagens
   */
  static async watchAdReward(userId: string): Promise<{
    success: boolean;
    messagesGranted: number;
    totalMessagesToday: number;
    isLastAdOfDay: boolean;
  }> {
    try {
      // VERIFICAÇÃO DE CONTA DE DESENVOLVEDOR - NÃO PRECISA DE ADS
      if (isDeveloperAccount(userId)) {
        console.log(`🚀 [DEVELOPER ACCOUNT] Desenvolvedor não precisa assistir ads`);
        return {
          success: false, // Não precisa de recompensa por ad
          messagesGranted: 0, // Já tem mensagens ilimitadas
          totalMessagesToday: -1, // Ilimitado
          isLastAdOfDay: false
        };
      }
      
      const journey = await this.getUserJourney(userId);
      const adCheck = await this.canWatchAdForMessages(userId);
      
      if (!adCheck.canWatch) {
        return {
          success: false,
          messagesGranted: 0,
          totalMessagesToday: journey.messagesGrantedToday,
          isLastAdOfDay: false
        };
      }
      
      // Incrementar ads assistidos
      journey.adsWatchedToday++;
      
      // Se completou todos os ads do dia, conceder mensagens
      const dayConfig = this.JOURNEY_CONFIG[journey.currentDay as keyof typeof this.JOURNEY_CONFIG];
      let messagesGranted = 0;
      
      if (journey.adsWatchedToday >= dayConfig!.adsRequired) {
        messagesGranted = dayConfig!.messagesGranted;
        journey.messagesGrantedToday = messagesGranted;
      }
      
      await this.saveUserJourney(journey);
      
      // Também atualizar o uso para refletir as mensagens concedidas
      const usage = await UserPlanManager.getTodayUsage(userId, new Date().toISOString().split('T')[0]);
      usage.adsWatched = journey.adsWatchedToday;
      localStorage.setItem(
        `userUsage_${userId}_${new Date().toISOString().split('T')[0]}`, 
        JSON.stringify(usage)
      );
      
      const isLastAdOfDay = journey.adsWatchedToday >= dayConfig!.adsRequired;
      
      console.log(`🎬 Ad assistido! Usuário ${userId} - Dia ${journey.currentDay} - Ad ${journey.adsWatchedToday}/${dayConfig!.adsRequired}`);
      if (messagesGranted > 0) {
        console.log(`✨ Mensagens concedidas: ${messagesGranted}`);
      }
      
      return {
        success: true,
        messagesGranted,
        totalMessagesToday: journey.messagesGrantedToday,
        isLastAdOfDay
      };
      
    } catch (error) {
      console.error('Erro ao registrar ad reward:', error);
      return {
        success: false,
        messagesGranted: 0,
        totalMessagesToday: 0,
        isLastAdOfDay: false
      };
    }
  }

  /**
   * Verifica se o usuário pode enviar uma mensagem baseado na jornada
   */
  static async canSendMessage(userId: string): Promise<{
    allowed: boolean;
    reason: 'allowed' | 'need_ad' | 'paywall_required' | 'developer_account';
    messagesUsed: number;
    messagesAvailable: number;
    adsWatched: number;
    adsRequired: number;
    currentDay: number;
  }> {
    // TEMPORARIAMENTE DESABILITADO PARA INVESTIDORES - SEMPRE PERMITE
    return {
      allowed: true,
      reason: 'allowed',
      messagesUsed: 0,
      messagesAvailable: -1, // Ilimitado
      adsWatched: 0,
      adsRequired: 0,
      currentDay: 1
    };
    try {
      // VERIFICAÇÃO DE CONTA DE DESENVOLVEDOR - ACESSO ILIMITADO
      if (isDeveloperAccount(userId)) {
        console.log(`🚀 [DEVELOPER ACCOUNT] Acesso ilimitado para mensagens`);
        return {
          allowed: true,
          reason: 'developer_account',
          messagesUsed: 0,
          messagesAvailable: -1, // Ilimitado
          adsWatched: 0,
          adsRequired: 0,
          currentDay: 1
        };
      }
      
      const journey = await this.getUserJourney(userId);
      const usage = await UserPlanManager.getTodayUsage(userId, new Date().toISOString().split('T')[0]);
      
      // Se passou do dia 3, paywall obrigatório
      if (journey.currentDay > 3) {
        return {
          allowed: false,
          reason: 'paywall_required',
          messagesUsed: usage.messagesUsed,
          messagesAvailable: 0,
          adsWatched: journey.adsWatchedToday,
          adsRequired: 0,
          currentDay: journey.currentDay
        };
      }
      
      const dayConfig = this.JOURNEY_CONFIG[journey.currentDay as keyof typeof this.JOURNEY_CONFIG];
      if (!dayConfig) {
        return {
          allowed: false,
          reason: 'paywall_required',
          messagesUsed: usage.messagesUsed,
          messagesAvailable: 0,
          adsWatched: journey.adsWatchedToday,
          adsRequired: 0,
          currentDay: journey.currentDay
        };
      }
      
      // Verificar se ainda tem mensagens disponíveis hoje
      const messagesAvailable = journey.messagesGrantedToday;
      const messagesUsed = usage.messagesUsed;
      
      if (messagesUsed < messagesAvailable) {
        // Pode enviar mensagem
        return {
          allowed: true,
          reason: 'allowed',
          messagesUsed,
          messagesAvailable,
          adsWatched: journey.adsWatchedToday,
          adsRequired: dayConfig.adsRequired,
          currentDay: journey.currentDay
        };
      }
      
      // Verificar se pode assistir ad para ganhar mais mensagens
      const adCheck = await this.canWatchAdForMessages(userId);
      if (adCheck.canWatch) {
        return {
          allowed: false,
          reason: 'need_ad',
          messagesUsed,
          messagesAvailable,
          adsWatched: journey.adsWatchedToday,
          adsRequired: dayConfig.adsRequired,
          currentDay: journey.currentDay
        };
      }
      
      // Não pode assistir mais ads, precisa de paywall
      return {
        allowed: false,
        reason: 'paywall_required',
        messagesUsed,
        messagesAvailable,
        adsWatched: journey.adsWatchedToday,
        adsRequired: dayConfig.adsRequired,
        currentDay: journey.currentDay
      };
      
    } catch (error) {
      console.error('Erro ao verificar se pode enviar mensagem:', error);
      return {
        allowed: false,
        reason: 'paywall_required',
        messagesUsed: 0,
        messagesAvailable: 0,
        adsWatched: 0,
        adsRequired: 0,
        currentDay: 1
      };
    }
  }

  /**
   * Obtém o status completo da jornada do usuário
   */
  static async getJourneyStatus(userId: string): Promise<{
    journey: UserJourney;
    usage: UserUsage;
    canSendMessage: boolean;
    canWatchAd: boolean;
    shouldShowPaywall: boolean;
    dayConfig: { adsRequired: number; messagesGranted: number } | null;
  }> {
    try {
      // VERIFICAÇÃO DE CONTA DE DESENVOLVEDOR - STATUS ESPECIAL
      if (isDeveloperAccount(userId)) {
        console.log(`🚀 [DEVELOPER ACCOUNT] Status especial para desenvolvedor`);
        const mockJourney: UserJourney = {
          userId,
          startDate: new Date(),
          currentDay: 1,
          adsWatchedToday: 0,
          messagesGrantedToday: -1, // Ilimitado
          hasReachedPaywall: false
        };
        const mockUsage: UserUsage = {
          userId,
          date: new Date().toISOString().split('T')[0],
          messagesUsed: 0,
          transactionsAdded: 0,
          billsAdded: 0,
          adsWatched: 0
        };
        
        return {
          journey: mockJourney,
          usage: mockUsage,
          canSendMessage: true, // Sempre pode enviar
          canWatchAd: false, // Não precisa de ads
          shouldShowPaywall: false, // Nunca paywall
          dayConfig: null // Não se aplica
        };
      }
      
      const journey = await this.getUserJourney(userId);
      const usage = await UserPlanManager.getTodayUsage(userId, new Date().toISOString().split('T')[0]);
      const messageCheck = await this.canSendMessage(userId);
      const adCheck = await this.canWatchAdForMessages(userId);
      const shouldShowPaywall = await this.shouldShowPaywall(userId);
      
      const dayConfig = journey.currentDay <= 3 
        ? this.JOURNEY_CONFIG[journey.currentDay as keyof typeof this.JOURNEY_CONFIG] || null
        : null;
      
      return {
        journey,
        usage,
        canSendMessage: messageCheck.allowed,
        canWatchAd: adCheck.canWatch,
        shouldShowPaywall,
        dayConfig
      };
      
    } catch (error) {
      console.error('Erro ao obter status da jornada:', error);
      throw error;
    }
  }

  /**
   * Força o usuário a ir para o paywall (usado quando teste grátis expira)
   */
  static async forcePaywall(userId: string): Promise<void> {
    try {
      await this.updateUserJourney(userId, {
        hasReachedPaywall: true,
        currentDay: 4 // Força para dia 4+ para acionar paywall
      });
      
      console.log(`🚫 Paywall forçado para usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao forçar paywall:', error);
    }
  }

  /**
   * Reseta a jornada do usuário (para debug ou testes)
   */
  static async resetJourney(userId: string): Promise<void> {
    try {
      localStorage.removeItem(`userJourney_${userId}`);
      console.log(`🔄 Jornada resetada para usuário ${userId}`);
    } catch (error) {
      console.error('Erro ao resetar jornada:', error);
    }
  }
}
