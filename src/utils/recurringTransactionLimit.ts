import { supabase } from '@/lib/supabase';
import { UserPlanManager } from './userPlanManager';
import { PlanType } from '@/types';

export interface RecurringLimitInfo {
  allowed: boolean;
  recurringRemaining: number;
  reason?: string;
}

export class RecurringTransactionLimitManager {
  private static readonly FREE_RECURRING_LIMIT = 1; // Usuários FREE têm 1 transação recorrente por semana (após anúncio)
  private static readonly DAYS_PER_WEEK = 7;

  /**
   * Verifica se o usuário pode criar transação recorrente
   * NOVA LÓGICA: Primeira transação da semana requer anúncio, libera apenas 1
   */
  static async canCreateRecurring(userId: string): Promise<RecurringLimitInfo> {
    try {
      console.log('🔍 [RECURRING_LIMIT] Verificando limite de transações recorrentes para usuário:', userId);

      // Verificar plano do usuário
      const userPlan = await UserPlanManager.getUserPlan(userId);
      
      console.log(`📋 [RECURRING_LIMIT] Plano do usuário: ${userPlan.planType}`);
      
      // Usuários premium têm transações recorrentes sem limite
      if (userPlan.planType !== PlanType.FREE) {
        console.log('✅ [RECURRING_LIMIT] Usuário premium - transações recorrentes sem limite');
        return { 
          allowed: true, 
          recurringRemaining: -1 // -1 = sem limite
        };
      }

      console.log('📊 [RECURRING_LIMIT] Usuário FREE - verificando sistema de anúncio + limite semanal');

      // Para usuários FREE: sistema semanal baseado em anúncios
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay()); // Início da semana (domingo)
      currentWeekStart.setHours(0, 0, 0, 0);
      
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // Fim da semana (sábado)
      currentWeekEnd.setHours(23, 59, 59, 999);

      // Buscar registros da semana atual
      const { data, error } = await supabase
        .from('user_recurring_count')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', currentWeekStart.toISOString())
        .lte('created_at', currentWeekEnd.toISOString());

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ [RECURRING_LIMIT] Erro ao buscar contadores:', error);
        return { 
          allowed: false, 
          recurringRemaining: 0,
          reason: 'error' 
        };
      }

      const weeklyRecords = data || [];
      
      // Verificar se já assistiu ao anúncio nesta semana
      const hasWatchedAd = weeklyRecords.some(record => 
        record.month_year && record.month_year.includes('-AD')
      );

      // Contar transações recorrentes criadas (excluindo registros de anúncio)
      const recurringTransactions = weeklyRecords.filter(record => 
        record.recurring_count > 0 && (!record.month_year || !record.month_year.includes('-AD'))
      );

      const currentRecurring = recurringTransactions.length;

      // Se já atingiu o limite da semana (1 transação recorrente)
      if (currentRecurring >= this.FREE_RECURRING_LIMIT) {
        console.log('🚫 [RECURRING_LIMIT] Limite semanal atingido:', currentRecurring);
        return { 
          allowed: false, 
          recurringRemaining: 0,
          reason: 'limit_reached' 
        };
      }

      // Se não assistiu ao anúncio ainda nesta semana
      if (!hasWatchedAd) {
        console.log('📺 [RECURRING_LIMIT] Primeira transação recorrente da semana - anúncio obrigatório');
        return { 
          allowed: false, 
          recurringRemaining: 1,
          reason: 'ad_required' // Nova razão: anúncio obrigatório
        };
      }

      // Anúncio já foi assistido, pode criar transação
      const recurringRemaining = this.FREE_RECURRING_LIMIT - currentRecurring;
      console.log(`✅ [RECURRING_LIMIT] Transação recorrente permitida - Restantes: ${recurringRemaining}`);
      return { 
        allowed: true, 
        recurringRemaining 
      };

    } catch (error) {
      console.error('❌ [RECURRING_LIMIT] Erro na verificação:', error);
      return { 
        allowed: false, 
        recurringRemaining: 0,
        reason: 'error' 
      };
    }
  }

  /**
   * Incrementa o contador de transações recorrentes (sistema semanal)
   */
  static async incrementRecurringCount(userId: string): Promise<boolean> {
    try {
      console.log('📊 [RECURRING_LIMIT] Incrementando contador semanal para usuário:', userId);

      const now = new Date();

      // Criar registro individual para cada transação recorrente (permite rastreamento semanal)
      const { error } = await supabase
        .from('user_recurring_count')
        .insert({
          user_id: userId,
          recurring_count: 1, // Cada registro representa 1 transação recorrente
          month_year: `${now.getFullYear()}-W${this.getWeekNumber(now)}`, // Formato: 2025-W33
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ [RECURRING_LIMIT] Erro ao incrementar contador semanal:', error);
        return false;
      }

      console.log('✅ [RECURRING_LIMIT] Contador semanal incrementado com sucesso');
      return true;

    } catch (error) {
      console.error('❌ [RECURRING_LIMIT] Erro no incremento semanal:', error);
      return false;
    }
  }

  /**
   * Libera uma transação recorrente após assistir ao anúncio (sistema semanal)
   * Este método é chamado APÓS o usuário assistir ao anúncio com sucesso
   */
  static async unlockRecurringAfterAd(userId: string): Promise<boolean> {
    try {
      console.log('🎁 [RECURRING_LIMIT] Liberando transação recorrente após anúncio para usuário:', userId);

      const now = new Date();
      
      // Criar um registro especial indicando que o anúncio foi assistido esta semana
      const { error } = await supabase
        .from('user_recurring_count')
        .insert({
          user_id: userId,
          recurring_count: 0, // 0 = marca que o anúncio foi assistido (não conta no limite)
          month_year: `${now.getFullYear()}-W${this.getWeekNumber(now)}-AD`, // Marca especial para anúncio
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ [RECURRING_LIMIT] Erro ao registrar anúncio assistido:', error);
        return false;
      }

      console.log('✅ [RECURRING_LIMIT] Transação recorrente liberada após anúncio');
      return true;

    } catch (error) {
      console.error('❌ [RECURRING_LIMIT] Erro ao liberar transação recorrente:', error);
      return false;
    }
  }

  /**
   * Verifica se o usuário já assistiu ao anúncio nesta semana
   */
  static async hasWatchedAdThisWeek(userId: string): Promise<boolean> {
    try {
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);
      
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
      currentWeekEnd.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('user_recurring_count')
        .select('month_year')
        .eq('user_id', userId)
        .like('month_year', `%W${this.getWeekNumber(now)}-AD%`)
        .gte('created_at', currentWeekStart.toISOString())
        .lte('created_at', currentWeekEnd.toISOString());

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [RECURRING_LIMIT] Erro ao verificar anúncio:', error);
        return false;
      }

      return !!(data && data.length > 0);
    } catch (error) {
      console.error('❌ [RECURRING_LIMIT] Erro ao verificar anúncio semanal:', error);
      return false;
    }
  }

  /**
   * Obter número da semana no ano
   */
  private static getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Obtém o contador atual de transações recorrentes (sistema semanal)
   */
  static async getCurrentRecurringCount(userId: string): Promise<number> {
    try {
      const now = new Date();
      const currentWeekStart = new Date(now);
      currentWeekStart.setDate(now.getDate() - now.getDay());
      currentWeekStart.setHours(0, 0, 0, 0);
      
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
      currentWeekEnd.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('user_recurring_count')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', currentWeekStart.toISOString())
        .lte('created_at', currentWeekEnd.toISOString());

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [RECURRING_LIMIT] Erro ao buscar contador:', error);
        return 0;
      }

      // Contar apenas transações recorrentes (excluindo registros de anúncio)
      const recurringTransactions = (data || []).filter(record => 
        record.recurring_count > 0 && (!record.month_year || !record.month_year.includes('-AD'))
      );

      return recurringTransactions.length;
    } catch (error) {
      console.error('❌ [RECURRING_LIMIT] Erro ao obter contador:', error);
      return 0;
    }
  }
}
