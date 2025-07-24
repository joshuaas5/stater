import { PlanType, UserPlan, PlanFeatures, UserUsage, UserJourney } from '@/types';

// Configuração dos limites e recursos por plano
export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  [PlanType.FREE]: {
    dailyMessages: 3,
    telegramBot: false,
    exportReports: false,
    ocrScanning: false,
    adsRequired: true
  },
  [PlanType.WEEKLY]: {
    dailyMessages: 50,
    telegramBot: true,
    exportReports: true,
    ocrScanning: false,
    adsRequired: false
  },
  [PlanType.MONTHLY]: {
    dailyMessages: 100,
    telegramBot: true,
    exportReports: true,
    ocrScanning: true,
    adsRequired: false
  },
  [PlanType.PRO]: {
    dailyMessages: -1, // Ilimitado
    telegramBot: true,
    exportReports: true,
    ocrScanning: true,
    adsRequired: false,
    prioritySupport: true
  }
};

/**
 * Gerenciador central do sistema de planos e monetização
 */
export class UserPlanManager {
  
  /**
   * Obtém o plano atual do usuário
   */
  static async getUserPlan(userId: string): Promise<UserPlan> {
    try {
      const planData = localStorage.getItem(`userPlan_${userId}`);
      
      if (!planData) {
        // Se não existe plano, criar plano FREE padrão
        const defaultPlan: UserPlan = {
          userId,
          planType: PlanType.FREE,
          isActive: true,
          startDate: new Date(),
          isOnTrial: false,
          paymentStatus: 'cancelled'
        };
        
        await this.saveUserPlan(defaultPlan);
        return defaultPlan;
      }
      
      const plan: UserPlan = JSON.parse(planData);
      
      // Verificar se o plano expirou
      if (plan.expiresAt && new Date() > new Date(plan.expiresAt)) {
        plan.planType = PlanType.FREE;
        plan.isActive = false;
        plan.paymentStatus = 'cancelled';
        await this.saveUserPlan(plan);
      }
      
      return plan;
      
    } catch (error) {
      console.error('Erro ao obter plano do usuário:', error);
      
      // Fallback para plano FREE em caso de erro
      return {
        userId,
        planType: PlanType.FREE,
        isActive: true,
        startDate: new Date(),
        isOnTrial: false,
        paymentStatus: 'cancelled'
      };
    }
  }
  
  /**
   * Salva o plano do usuário
   */
  static async saveUserPlan(plan: UserPlan): Promise<void> {
    try {
      localStorage.setItem(`userPlan_${plan.userId}`, JSON.stringify(plan));
      console.log(`💳 Plano ${plan.planType} salvo para usuário ${plan.userId}`);
    } catch (error) {
      console.error('Erro ao salvar plano do usuário:', error);
    }
  }
  
  /**
   * Verifica se o usuário tem acesso a uma funcionalidade específica
   */
  static async hasFeatureAccess(userId: string, feature: keyof PlanFeatures): Promise<boolean> {
    try {
      const userPlan = await this.getUserPlan(userId);
      const features = PLAN_FEATURES[userPlan.planType];
      
      return !!features[feature];
      
    } catch (error) {
      console.error('Erro ao verificar acesso à funcionalidade:', error);
      return false; // Negar acesso em caso de erro
    }
  }
  
  /**
   * Verifica se o usuário atingiu o limite diário de uma ação
   */
  static async checkDailyLimit(userId: string, action: 'messages' | 'transactions' | 'bills'): Promise<boolean> {
    try {
      const userPlan = await this.getUserPlan(userId);
      const features = PLAN_FEATURES[userPlan.planType];
      
      // Se for plano PRO com mensagens ilimitadas
      if (action === 'messages' && features.dailyMessages === -1) {
        return true;
      }
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const usage = await this.getTodayUsage(userId, today);
      
      switch (action) {
        case 'messages':
          return usage.messagesUsed < features.dailyMessages;
        case 'transactions':
          // Por enquanto, sem limite para transações (apenas mensagens têm limite)
          return true;
        case 'bills':
          // Por enquanto, sem limite para bills (apenas mensagens têm limite)
          return true;
        default:
          return false;
      }
      
    } catch (error) {
      console.error('Erro ao verificar limite diário:', error);
      return false; // Negar acesso em caso de erro
    }
  }
  
  /**
   * Incrementa o uso de uma ação específica
   */
  static async incrementUsage(userId: string, action: 'messages' | 'transactions' | 'bills'): Promise<void> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const usage = await this.getTodayUsage(userId, today);
      
      switch (action) {
        case 'messages':
          usage.messagesUsed++;
          break;
        case 'transactions':
          usage.transactionsAdded++;
          break;
        case 'bills':
          usage.billsAdded++;
          break;
      }
      
      localStorage.setItem(`userUsage_${userId}_${today}`, JSON.stringify(usage));
      console.log(`📊 Uso incrementado: ${action} para usuário ${userId}`);
      
    } catch (error) {
      console.error('Erro ao incrementar uso:', error);
    }
  }
  
  /**
   * Obtém o uso do usuário para um dia específico
   */
  static async getTodayUsage(userId: string, date: string): Promise<UserUsage> {
    try {
      const usageData = localStorage.getItem(`userUsage_${userId}_${date}`);
      
      if (!usageData) {
        return {
          userId,
          date,
          messagesUsed: 0,
          transactionsAdded: 0,
          billsAdded: 0,
          adsWatched: 0
        };
      }
      
      return JSON.parse(usageData);
      
    } catch (error) {
      console.error('Erro ao obter uso do dia:', error);
      return {
        userId,
        date,
        messagesUsed: 0,
        transactionsAdded: 0,
        billsAdded: 0,
        adsWatched: 0
      };
    }
  }
  
  /**
   * Obtém informações da jornada do usuário (para sistema de 3 dias)
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
          hasReachedPaywall: false
        };
        
        localStorage.setItem(`userJourney_${userId}`, JSON.stringify(newJourney));
        return newJourney;
      }
      
      const journey: UserJourney = JSON.parse(journeyData);
      
      // Calcular o dia atual baseado na data de início
      const startDate = new Date(journey.startDate);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      journey.currentDay = Math.max(1, daysDiff);
      
      return journey;
      
    } catch (error) {
      console.error('Erro ao obter jornada do usuário:', error);
      return {
        userId,
        startDate: new Date(),
        currentDay: 1,
        adsWatchedToday: 0,
        messagesGrantedToday: 0,
        hasReachedPaywall: false
      };
    }
  }
  
  /**
   * Atualiza a jornada do usuário
   */
  static async updateUserJourney(userId: string, updates: Partial<UserJourney>): Promise<void> {
    try {
      const journey = await this.getUserJourney(userId);
      const updatedJourney = { ...journey, ...updates };
      
      localStorage.setItem(`userJourney_${userId}`, JSON.stringify(updatedJourney));
      console.log(`🚀 Jornada atualizada para usuário ${userId}:`, updates);
      
    } catch (error) {
      console.error('Erro ao atualizar jornada do usuário:', error);
    }
  }
  
  /**
   * Ativa um plano premium para o usuário
   */
  static async activatePlan(
    userId: string, 
    planType: PlanType, 
    purchaseToken?: string,
    productId?: string,
    trialDays?: number
  ): Promise<void> {
    try {
      const now = new Date();
      const isOnTrial = !!trialDays;
      
      let expiresAt: Date;
      let trialEndsAt: Date | undefined;
      
      if (isOnTrial && trialDays) {
        // Teste grátis
        trialEndsAt = new Date(now.getTime() + (trialDays * 24 * 60 * 60 * 1000));
        
        // Após o trial, vira assinatura normal
        if (planType === PlanType.WEEKLY) {
          expiresAt = new Date(trialEndsAt.getTime() + (7 * 24 * 60 * 60 * 1000));
        } else {
          expiresAt = new Date(trialEndsAt.getTime() + (30 * 24 * 60 * 60 * 1000));
        }
      } else {
        // Assinatura normal
        if (planType === PlanType.WEEKLY) {
          expiresAt = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
        } else {
          expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        }
      }
      
      const plan: UserPlan = {
        userId,
        planType,
        isActive: true,
        startDate: now,
        expiresAt,
        trialEndsAt,
        isOnTrial,
        paymentStatus: 'active',
        purchaseToken,
        productId
      };
      
      await this.saveUserPlan(plan);
      console.log(`✅ Plano ${planType} ativado para usuário ${userId}`);
      
    } catch (error) {
      console.error('Erro ao ativar plano:', error);
    }
  }
  
  /**
   * Obtém estatísticas do plano atual
   */
  static async getPlanStats(userId: string): Promise<{
    plan: UserPlan;
    features: PlanFeatures;
    todayUsage: UserUsage;
    journey: UserJourney;
  }> {
    const [plan, todayUsage, journey] = await Promise.all([
      this.getUserPlan(userId),
      this.getTodayUsage(userId, new Date().toISOString().split('T')[0]),
      this.getUserJourney(userId)
    ]);
    
    const features = PLAN_FEATURES[plan.planType];
    
    return {
      plan,
      features,
      todayUsage,
      journey
    };
  }
}
