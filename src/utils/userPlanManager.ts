import { PlanType, UserPlan, PlanFeatures, UserUsage, UserJourney, WeeklyUsage } from '@/types';
import { supabase } from '@/lib/supabase';

// Lista de usuários beta/especiais com acesso ilimitado
const BETA_USERS = [
  'joshuaas500@gmail.com',
  'pedro_hs5@hotmail.com',
  // Adicione outros emails aqui conforme necessário
];

// Configuração especial para usuários beta (acesso ilimitado)
const BETA_USER_FEATURES: PlanFeatures = {
  // Acesso ilimitado total
  dailyMessages: -1,          // Mensagens ilimitadas
  dailyAudioMinutes: -1,      // Áudio ilimitado
  weeklyImageScans: -1,       // 🔥 NOVO: Imagens ilimitadas
  weeklyPdfScans: -1,         // 🔥 NOVO: PDFs ilimitados
  monthlyExports: -1,         // Exports ilimitados
  
  // Todas funcionalidades liberadas
  telegramBot: true,          // Telegram liberado
  exportReports: true,        // Relatórios liberados
  ocrScanning: true,          // OCR liberado
  pdfProcessing: true,        // PDF liberado
  advancedAnalytics: true,    // Analytics avançado liberado
  prioritySupport: true,      // Suporte prioritário
  
  // Sem anúncios nem limitações
  adsRequired: false,         // Sem anúncios
  showBanner: false           // Sem banner
};

// Configuração dos limites e recursos por plano
export const PLAN_FEATURES: Record<PlanType, PlanFeatures> = {
  [PlanType.FREE]: {
    // Jornada progressiva de 3 dias
    dailyMessages: 3,           // 15 mensagens totais via jornada (1-5 mensagens + ads)
    dailyAudioMinutes: 3,       // 🔥 NOVO: 3 áudios para usuários FREE
    weeklyImageScans: 1,        // 🔥 NOVO: 1 imagem/OCR por semana para usuários FREE  
    weeklyPdfScans: 1,          // 🔥 NOVO: 1 PDF por semana para usuários FREE
    monthlyExports: 0,          // Exports: Bloqueado
    
    // Funcionalidades bloqueadas
    telegramBot: false,         // Telegram: Bloqueado
    exportReports: false,       // Relatórios: Bloqueados
    ocrScanning: true,          // 🔥 MUDANÇA: OCR liberado com limite de 1/semana
    pdfProcessing: true,        // 🔥 MUDANÇA: PDF liberado com limite de 1/semana
    advancedAnalytics: false,   // Analytics avançado: Bloqueado
    
    // Monetização ativa
    adsRequired: true,          // Anúncios obrigatórios
    showBanner: true            // Banner de upgrade
  },
  [PlanType.WEEKLY]: {
    // SEMANAL - R$ 8,90 - EXATAMENTE COMO DEFINIDO
    dailyMessages: 10,          // 10 mensagens de texto/dia
    dailyAudioMinutes: 3,       // 3 análises de áudio/dia
    weeklyImageScans: 20,       // 20 análises de fotos/semana
    weeklyPdfScans: 10,         // 10 leituras de PDFs/semana
    monthlyExports: 0,          // Sem exports
    
    // Funcionalidades liberadas
    telegramBot: true,          // Bot Telegram integrado (limites compartilhados)
    exportReports: false,       // Relatórios: Ainda bloqueados
    ocrScanning: true,          // OCR: Liberado
    pdfProcessing: true,        // PDF: Liberado no semanal
    advancedAnalytics: false,   // Analytics avançado: Ainda bloqueado
    
    // 100% livre de anúncios
    adsRequired: false,         // Sem anúncios
    showBanner: false           // Sem banner
  },
  [PlanType.MONTHLY]: {
    // MENSAL - R$ 15,90 - EXATAMENTE COMO DEFINIDO
    dailyMessages: 20,          // 20 mensagens de texto/dia
    dailyAudioMinutes: 10,      // 10 análises de áudio/dia
    weeklyImageScans: 50,       // 50 análises de fotos/semana
    weeklyPdfScans: 25,         // 25 leituras de PDFs/semana
    monthlyExports: -1,         // Exports ilimitados (PDF, XLSX, OFX, CSV)
    
    // Funcionalidades do semanal + relatórios
    telegramBot: true,          // Telegram: Liberado
    exportReports: true,        // Exportar relatórios liberado
    ocrScanning: true,          // OCR: Liberado
    pdfProcessing: true,        // PDF: Liberado
    advancedAnalytics: true,    // Análises financeiras avançadas
    
    // Premium sem anúncios
    adsRequired: false,         // Sem anúncios
    showBanner: false           // Sem banner
  },
  [PlanType.PRO]: {
    // PRO - R$ 29,90 - EXATAMENTE COMO DEFINIDO
    dailyMessages: 30,          // 30 mensagens de texto/dia
    dailyAudioMinutes: 15,      // 15 análises de áudio/dia
    weeklyImageScans: -1,       // Análises de fotos ilimitadas
    weeklyPdfScans: -1,         // Leituras de PDFs ilimitadas
    monthlyExports: -1,         // Exports ilimitados
    
    // Todas funcionalidades + PDFs
    telegramBot: true,          // Telegram: Liberado
    exportReports: true,        // Relatórios: Liberados
    ocrScanning: true,          // OCR avançado para documentos
    pdfProcessing: true,        // Leitura e análise de PDFs
    advancedAnalytics: true,    // Insights de despesas por categoria
    prioritySupport: true,      // Suporte prioritário
    
    // Experiência premium
    adsRequired: false,         // Sem anúncios
    showBanner: false           // Sem banner
  }
};

/**
 * Gerenciador central do sistema de planos e monetização
 */
export class UserPlanManager {
  
  /**
   * 🔥 UTILITÁRIOS PARA CÁLCULO DE SEMANA
   */
  
  /**
   * Obtém segunda-feira da semana para uma data
   */
  private static getMondayOfWeek(date: Date): string {
    const monday = new Date(date);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1); // Ajustar para segunda-feira
    monday.setDate(diff);
    return monday.toISOString().split('T')[0];
  }
  
  /**
   * Obtém domingo da semana para uma data
   */
  private static getSundayOfWeek(date: Date): string {
    const sunday = new Date(date);
    const day = sunday.getDay();
    const diff = sunday.getDate() - day + 7; // Próximo domingo
    sunday.setDate(diff);
    return sunday.toISOString().split('T')[0];
  }
  
  /**
   * Obtém ou cria registro de uso semanal
   */
  private static async getWeeklyUsage(userId: string): Promise<WeeklyUsage> {
    const today = new Date();
    const weekStart = this.getMondayOfWeek(today);
    const weekEnd = this.getSundayOfWeek(today);
    const localKey = `weeklyUsage_${userId}_${weekStart}`;
    
    try {
      // 🔍 [STEP 1] Primeiro tentar buscar no Supabase
      console.log(`🔍 [WEEKLY_USAGE] Buscando uso semanal para ${userId} (semana: ${weekStart})`);
      
      const { data, error } = await supabase
        .from('weekly_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('week_start', weekStart)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ [SUPABASE] Erro ao buscar uso semanal:', error);
        throw error; // Force fallback to localStorage
      }
      
      if (data) {
        console.log(`✅ [SUPABASE] Dados encontrados: PDF=${data.pdf_count}, Imagem=${data.image_count}`);
        const usage = {
          userId: data.user_id,
          weekStart: data.week_start,
          weekEnd: data.week_end,
          imageCount: data.image_count || 0,
          pdfCount: data.pdf_count || 0,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        };
        
        // Sincronizar com localStorage
        localStorage.setItem(localKey, JSON.stringify(usage));
        return usage;
      }
    } catch (supabaseError) {
      console.warn('⚠️ [SUPABASE] Erro ao acessar banco, usando localStorage:', supabaseError);
    }
    
    // 🔍 [STEP 2] Fallback para localStorage
    console.log(`💾 [LOCALSTORAGE] Tentando buscar dados locais para ${localKey}`);
    const localData = localStorage.getItem(localKey);
    
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        console.log(`✅ [LOCALSTORAGE] Dados encontrados: PDF=${parsed.pdfCount}, Imagem=${parsed.imageCount}`);
        return parsed;
      } catch (parseError) {
        console.error('❌ [LOCALSTORAGE] Erro ao parsear dados locais:', parseError);
      }
    }
    
    // 🔍 [STEP 3] Criar novo registro
    console.log(`🆕 [NEW_RECORD] Criando novo registro semanal para ${userId}`);
    const newUsage: WeeklyUsage = {
      userId,
      weekStart,
      weekEnd,
      imageCount: 0,
      pdfCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Salvar no localStorage primeiro (sempre funciona)
    localStorage.setItem(localKey, JSON.stringify(newUsage));
    console.log(`💾 [LOCALSTORAGE] Novo registro salvo localmente`);
    
    // Tentar salvar no Supabase (não bloquear se falhar)
    try {
      const { error: insertError } = await supabase
        .from('weekly_usage')
        .insert({
          user_id: userId,
          week_start: weekStart,
          week_end: weekEnd,
          image_count: 0,
          pdf_count: 0
        });
        
      if (insertError) {
        console.warn('⚠️ [SUPABASE] Erro ao inserir novo registro:', insertError.message);
      } else {
        console.log(`✅ [SUPABASE] Novo registro criado com sucesso`);
      }
    } catch (insertFail) {
      console.warn('⚠️ [SUPABASE] Falha completa ao inserir:', insertFail);
    }
    
    return newUsage;
  }
  
  /**
   * Atualiza uso semanal de forma robusta
   */
  private static async updateWeeklyUsage(usage: WeeklyUsage): Promise<boolean> {
    usage.updatedAt = new Date();
    const localKey = `weeklyUsage_${usage.userId}_${usage.weekStart}`;
    
    console.log(`🔄 [UPDATE] Atualizando uso semanal: PDF=${usage.pdfCount}, Imagem=${usage.imageCount}`);
    
    // ✅ [STEP 1] Salvar no localStorage SEMPRE (nunca falha)
    try {
      localStorage.setItem(localKey, JSON.stringify(usage));
      console.log(`💾 [LOCALSTORAGE] Dados atualizados localmente`);
    } catch (localError) {
      console.error('❌ [LOCALSTORAGE] Erro crítico ao salvar localmente:', localError);
      return false; // Se localStorage falhar, temos problema sério
    }
    
    // ✅ [STEP 2] Tentar sincronizar com Supabase (não bloqueante)
    try {
      const { error } = await supabase
        .from('weekly_usage')
        .upsert({
          user_id: usage.userId,
          week_start: usage.weekStart,
          week_end: usage.weekEnd,
          image_count: usage.imageCount,
          pdf_count: usage.pdfCount,
          updated_at: usage.updatedAt.toISOString()
        }, {
          onConflict: 'user_id,week_start'
        });
      
      if (error) {
        console.warn('⚠️ [SUPABASE] Erro ao sincronizar (não crítico):', error.message);
        return true; // LocalStorage foi salvo, que é o importante
      }
      
      console.log(`✅ [SUPABASE] Dados sincronizados com sucesso`);
      return true;
      
    } catch (supabaseError) {
      console.warn('⚠️ [SUPABASE] Falha na sincronização (usando localStorage):', supabaseError);
      return true; // LocalStorage funciona, então não é crítico
    }
  }
  
  /**
   * Verifica se um usuário é beta tester (acesso ilimitado)
   */
  static isBetaUser(userEmail: string): boolean {
    return BETA_USERS.includes(userEmail.toLowerCase());
  }

  /**
   * Obtém as features corretas baseado no plano e status beta
   */
  static getUserFeatures(planType: PlanType, userEmail?: string): PlanFeatures {
    // Se for beta user, retorna acesso ilimitado
    if (userEmail && this.isBetaUser(userEmail)) {
      console.log(`🚀 [BETA USER] Acesso ilimitado para: ${userEmail}`);
      return BETA_USER_FEATURES;
    }
    
    // Caso contrário, retorna features normais do plano
    return PLAN_FEATURES[planType];
  }
  
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
      // Verificar se é beta user primeiro (usando o auth do Supabase para obter email)
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email && this.isBetaUser(user.email)) {
          console.log(`🚀 [BETA USER] Acesso ilimitado à feature "${feature}" para: ${user.email}`);
          return true;
        }
      } catch (authError) {
        console.log('Auth check falhou, continuando com verificação normal do plano');
      }
      
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
    // TEMPORARIAMENTE DESABILITADO PARA INVESTIDORES - SEMPRE PERMITE
    return true;
    try {
      // Verificar se é beta user primeiro - acesso ilimitado
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email && this.isBetaUser(user.email)) {
          console.log(`🚀 [BETA USER] Limite diário ilimitado para "${action}" - usuário: ${user.email}`);
          return true;
        }
      } catch (authError) {
        console.log('Auth check falhou, continuando com verificação normal do plano');
      }
      
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
  static async incrementUsage(userId: string, action: 'messages' | 'transactions' | 'bills' | 'audio'): Promise<void> {
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
        case 'audio':
          usage.audioUsed++;
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
          adsWatched: 0,
          audioUsed: 0
        };
      }
      
      const parsed = JSON.parse(usageData);
      // Garantir compatibilidade com dados antigos
      return {
        ...parsed,
        audioUsed: parsed.audioUsed || 0
      };
      
    } catch (error) {
      console.error('Erro ao obter uso do dia:', error);
      return {
        userId,
        date,
        messagesUsed: 0,
        transactionsAdded: 0,
        billsAdded: 0,
        adsWatched: 0,
        audioUsed: 0
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

  // ========================================
  // NOVOS MÉTODOS PARA CONTROLE ESPECÍFICO
  // ========================================

  /**
   * Verifica e contabiliza uso de mensagens IA
   */
  static async checkAndUseMessage(userId: string): Promise<{ allowed: boolean; remaining: number }> {
    try {
      // Verificar se é beta user primeiro - acesso ilimitado
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email && this.isBetaUser(user.email)) {
          console.log(`🚀 [BETA USER] Mensagens ilimitadas para usuário: ${user.email}`);
          await this.incrementUsage(userId, 'messages');
          return { allowed: true, remaining: -1 };
        }
      } catch (authError) {
        console.log('Auth check falhou, continuando com verificação normal do plano');
      }
      
      const userPlan = await this.getUserPlan(userId);
      const features = PLAN_FEATURES[userPlan.planType];
      
      // Se for plano PRO (ilimitado)
      if (features.dailyMessages === -1) {
        await this.incrementUsage(userId, 'messages');
        return { allowed: true, remaining: -1 };
      }
      
      const today = new Date().toISOString().split('T')[0];
      const usage = await this.getTodayUsage(userId, today);
      
      // Verifica limite
      if (usage.messagesUsed >= features.dailyMessages) {
        return { allowed: false, remaining: 0 };
      }
      
      // Incrementa uso e permite
      await this.incrementUsage(userId, 'messages');
      const remaining = features.dailyMessages - (usage.messagesUsed + 1);
      
      return { allowed: true, remaining };
      
    } catch (error) {
      console.error('Erro ao verificar uso de mensagem:', error);
      return { allowed: false, remaining: 0 };
    }
  }

  /**
   * Verifica se pode usar funcionalidade de áudio
   */
  static async checkAudioAccess(userId: string, minutesNeeded: number = 1): Promise<boolean> {
    try {
      // Verificar se é beta user primeiro - acesso ilimitado
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email && this.isBetaUser(user.email)) {
          console.log(`🚀 [BETA USER] Acesso ilimitado ao áudio para usuário: ${user.email}`);
          return true;
        }
      } catch (authError) {
        console.log('Auth check falhou, continuando com verificação normal do plano');
      }
      
      const userPlan = await this.getUserPlan(userId);
      const features = PLAN_FEATURES[userPlan.planType];
      
      // Se áudio está bloqueado no plano
      if (features.dailyAudioMinutes === 0) {
        return false;
      }
      
      // Se é ilimitado
      if (features.dailyAudioMinutes === -1) {
        return true;
      }
      
      // Verificar uso diário (implementar quando tiver controle de áudio)
      return true; // Por enquanto, libera se o plano permite
      
    } catch (error) {
      console.error('Erro ao verificar acesso ao áudio:', error);
      return false;
    }
  }

  /**
   * Verifica se pode usar OCR/scanning
   */
  static async checkOcrAccess(userId: string): Promise<boolean> {
    try {
      // Verificar se é beta user primeiro - acesso ilimitado
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email && this.isBetaUser(user.email)) {
          console.log(`🚀 [BETA USER] Acesso ilimitado ao OCR para usuário: ${user.email}`);
          return true;
        }
      } catch (authError) {
        console.log('Auth check falhou, continuando com verificação normal do plano');
      }
      
      const userPlan = await this.getUserPlan(userId);
      const features = PLAN_FEATURES[userPlan.planType];
      
      return features.ocrScanning && features.weeklyImageScans !== 0;
      
    } catch (error) {
      console.error('Erro ao verificar acesso ao OCR:', error);
      return false;
    }
  }

  /**
   * Verifica se pode processar PDF
   */
  static async checkPdfAccess(userId: string, pagesNeeded: number = 1): Promise<boolean> {
    try {
      // Verificar se é beta user primeiro - acesso ilimitado
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email && this.isBetaUser(user.email)) {
          console.log(`🚀 [BETA USER] Acesso ilimitado ao PDF para usuário: ${user.email}`);
          return true;
        }
      } catch (authError) {
        console.log('Auth check falhou, continuando com verificação normal do plano');
      }
      
      const userPlan = await this.getUserPlan(userId);
      const features = PLAN_FEATURES[userPlan.planType];
      
      return features.pdfProcessing && features.weeklyPdfScans !== 0;
      
    } catch (error) {
      console.error('Erro ao verificar acesso ao PDF:', error);
      return false;
    }
  }

  /**
   * Verifica se pode exportar relatórios
   */
  static async checkExportAccess(userId: string): Promise<boolean> {
    try {
      // Verificar se é beta user primeiro - acesso ilimitado
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email && this.isBetaUser(user.email)) {
          console.log(`🚀 [BETA USER] Acesso ilimitado ao export para usuário: ${user.email}`);
          return true;
        }
      } catch (authError) {
        console.log('Auth check falhou, continuando com verificação normal do plano');
      }
      
      const userPlan = await this.getUserPlan(userId);
      const features = PLAN_FEATURES[userPlan.planType];
      
      return features.exportReports && features.monthlyExports !== 0;
      
    } catch (error) {
      console.error('Erro ao verificar acesso ao export:', error);
      return false;
    }
  }

  /**
   * Verifica se deve mostrar anúncios
   */
  static async shouldShowAds(userId: string): Promise<boolean> {
    // TEMPORARIAMENTE DESABILITADO PARA INVESTIDORES
    return false;
    
    try {
      // Verificar se é beta user primeiro - sem anúncios
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email && this.isBetaUser(user.email)) {
          console.log(`🚀 [BETA USER] Sem anúncios para usuário: ${user.email}`);
          return false;
        }
      } catch (authError) {
        console.log('Auth check falhou, continuando com verificação normal do plano');
      }
      
      const userPlan = await this.getUserPlan(userId);
      const features = PLAN_FEATURES[userPlan.planType];
      
      return features.adsRequired;
      
    } catch (error) {
      console.error('Erro ao verificar necessidade de anúncios:', error);
      return true; // Em caso de erro, mostrar anúncios por segurança
    }
  }

  /**
   * Verifica se deve mostrar banner de upgrade
   */
  static async shouldShowUpgradeBanner(userId: string): Promise<boolean> {
    // TEMPORARIAMENTE DESABILITADO PARA INVESTIDORES
    return false;
    try {
      // Verificar se é beta user primeiro - sem banner de upgrade
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email && this.isBetaUser(user.email)) {
          console.log(`🚀 [BETA USER] Sem banner de upgrade para usuário: ${user.email}`);
          return false;
        }
      } catch (authError) {
        console.log('Auth check falhou, continuando com verificação normal do plano');
      }
      
      const userPlan = await this.getUserPlan(userId);
      const features = PLAN_FEATURES[userPlan.planType];
      
      return features.showBanner || false;
      
    } catch (error) {
      console.error('Erro ao verificar banner de upgrade:', error);
      return true; // Em caso de erro, mostrar banner por segurança
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

  // 🔥 NOVAS FUNÇÕES DE VERIFICAÇÃO E CONTABILIZAÇÃO DE USO POR MÍDIA

  /**
   * Verifica e contabiliza uso de áudio (LIMITE: 3 para FREE)
   */
  static async checkAndUseAudio(userId: string): Promise<{ allowed: boolean; remaining: number; shouldShowPaywall: boolean }> {
    try {
      // Verificar se é beta user primeiro - acesso ilimitado
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email && this.isBetaUser(user.email)) {
          console.log(`🚀 [BETA USER] Áudio ilimitado para usuário: ${user.email}`);
          await this.incrementUsage(userId, 'audio');
          return { allowed: true, remaining: -1, shouldShowPaywall: false };
        }
      } catch (authError) {
        console.log('Auth check falhou, continuando com verificação normal do plano');
      }
      
      const userPlan = await this.getUserPlan(userId);
      const features = PLAN_FEATURES[userPlan.planType];
      
      // Se for plano com áudio ilimitado
      if (features.dailyAudioMinutes === -1) {
        await this.incrementUsage(userId, 'audio');
        return { allowed: true, remaining: -1, shouldShowPaywall: false };
      }
      
      const today = new Date().toISOString().split('T')[0];
      const usage = await this.getTodayUsage(userId, today);
      
      // Verifica limite
      if (usage.audioUsed >= features.dailyAudioMinutes) {
        console.log(`❌ [AUDIO LIMIT] Usuário ${userId} atingiu limite de áudio: ${usage.audioUsed}/${features.dailyAudioMinutes}`);
        return { allowed: false, remaining: 0, shouldShowPaywall: true };
      }
      
      // Incrementa uso e permite
      await this.incrementUsage(userId, 'audio');
      const remaining = features.dailyAudioMinutes - (usage.audioUsed + 1);
      
      console.log(`✅ [AUDIO OK] Áudio permitido para usuário ${userId}. Restantes: ${remaining}`);
      return { allowed: true, remaining, shouldShowPaywall: false };
      
    } catch (error) {
      console.error('Erro ao verificar uso de áudio:', error);
      return { allowed: false, remaining: 0, shouldShowPaywall: true };
    }
  }

  /**
   * 🔥 NOVA VERIFICAÇÃO SEMANAL: PDF (LIMITE: 1 por semana para FREE)
   */
  static async checkAndUsePdf(userId: string): Promise<{ allowed: boolean; remaining: number; shouldShowPaywall: boolean }> {
    try {
      console.log(`🔍 [DEBUG_PDF] Iniciando checkAndUsePdf SEMANAL para usuário: ${userId}`);
      
      // Verificar se é beta user primeiro - acesso ilimitado
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email && this.isBetaUser(user.email)) {
          console.log(`🚀 [BETA USER] PDF ilimitado para usuário: ${user.email}`);
          return { allowed: true, remaining: -1, shouldShowPaywall: false };
        }
      } catch (authError) {
        console.log('Auth check falhou, continuando com verificação normal do plano');
      }
      
      const userPlan = await this.getUserPlan(userId);
      const features = PLAN_FEATURES[userPlan.planType];
      console.log(`⚙️ [PLAN_FEATURES] Limite PDF semanal para ${userPlan.planType}: ${features.weeklyPdfScans}`);
      
      // Se for plano com PDF ilimitado
      if (features.weeklyPdfScans === -1) {
        console.log(`✅ [UNLIMITED] PDF ilimitado para plano ${userPlan.planType}`);
        return { allowed: true, remaining: -1, shouldShowPaywall: false };
      }
      
      // 🔍 Verificar uso semanal ANTES de permitir
      const weeklyUsage = await this.getWeeklyUsage(userId);
      console.log(`📊 [USAGE_CHECK] Uso atual de PDF: ${weeklyUsage.pdfCount}/${features.weeklyPdfScans} (semana: ${weeklyUsage.weekStart})`);
      
      // ❌ BLOQUEAR se limite já foi atingido
      if (weeklyUsage.pdfCount >= features.weeklyPdfScans) {
        console.log(`❌ [PDF LIMIT] BLOQUEADO: Usuário ${userId} atingiu limite de PDF semanal: ${weeklyUsage.pdfCount}/${features.weeklyPdfScans}`);
        return { allowed: false, remaining: 0, shouldShowPaywall: true };
      }
      
      // ✅ Incrementar uso APENAS se ainda há limite
      weeklyUsage.pdfCount++;
      const updateSuccess = await this.updateWeeklyUsage(weeklyUsage);
      
      if (!updateSuccess) {
        console.error(`❌ [PDF ERROR] Falha ao atualizar contador de uso para ${userId}`);
        return { allowed: false, remaining: 0, shouldShowPaywall: true };
      }
      
      const remaining = features.weeklyPdfScans - weeklyUsage.pdfCount;
      console.log(`✅ [PDF OK] PDF permitido para usuário ${userId}. Restantes: ${remaining}`);
      return { allowed: true, remaining, shouldShowPaywall: false };
      
    } catch (error) {
      console.error('Erro ao verificar uso de PDF:', error);
      return { allowed: false, remaining: 0, shouldShowPaywall: true };
    }
  }

  /**
   * 🔥 NOVA VERIFICAÇÃO SEMANAL: Imagem/OCR (LIMITE: 1 por semana para FREE)
   */
  static async checkAndUseImage(userId: string): Promise<{ allowed: boolean; remaining: number; shouldShowPaywall: boolean }> {
    try {
      console.log(`🔍 [DEBUG_IMAGE] Iniciando checkAndUseImage SEMANAL para usuário: ${userId}`);
      
      // Verificar se é beta user primeiro - acesso ilimitado
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email && this.isBetaUser(user.email)) {
          console.log(`🚀 [BETA USER] Imagem/OCR ilimitado para usuário: ${user.email}`);
          return { allowed: true, remaining: -1, shouldShowPaywall: false };
        }
      } catch (authError) {
        console.log('Auth check falhou, continuando com verificação normal do plano');
      }
      
      const userPlan = await this.getUserPlan(userId);
      const features = PLAN_FEATURES[userPlan.planType];
      console.log(`⚙️ [PLAN_FEATURES] Limite imagem semanal para ${userPlan.planType}: ${features.weeklyImageScans}`);
      
      // Se for plano com imagem ilimitada
      if (features.weeklyImageScans === -1) {
        console.log(`✅ [UNLIMITED] Imagem ilimitada para plano ${userPlan.planType}`);
        return { allowed: true, remaining: -1, shouldShowPaywall: false };
      }
      
      // 🔍 Verificar uso semanal ANTES de permitir
      const weeklyUsage = await this.getWeeklyUsage(userId);
      console.log(`📊 [USAGE_CHECK] Uso atual de imagem: ${weeklyUsage.imageCount}/${features.weeklyImageScans} (semana: ${weeklyUsage.weekStart})`);
      
      // ❌ BLOQUEAR se limite já foi atingido
      if (weeklyUsage.imageCount >= features.weeklyImageScans) {
        console.log(`❌ [IMAGE LIMIT] BLOQUEADO: Usuário ${userId} atingiu limite de imagem semanal: ${weeklyUsage.imageCount}/${features.weeklyImageScans}`);
        return { allowed: false, remaining: 0, shouldShowPaywall: true };
      }
      
      // ✅ Incrementar uso APENAS se ainda há limite
      weeklyUsage.imageCount++;
      const updateSuccess = await this.updateWeeklyUsage(weeklyUsage);
      
      if (!updateSuccess) {
        console.error(`❌ [IMAGE ERROR] Falha ao atualizar contador de uso para ${userId}`);
        return { allowed: false, remaining: 0, shouldShowPaywall: true };
      }
      
      const remaining = features.weeklyImageScans - weeklyUsage.imageCount;
      console.log(`✅ [IMAGE OK] Imagem permitida para usuário ${userId}. Restantes: ${remaining}`);
      return { allowed: true, remaining, shouldShowPaywall: false };
      
    } catch (error) {
      console.error('Erro ao verificar uso de imagem:', error);
      return { allowed: false, remaining: 0, shouldShowPaywall: true };
    }
  }
}
