import { supabase } from '@/lib/supabase';
import { UserPlanManager } from './userPlanManager';

export interface RecurringLimitInfo {
  allowed: boolean;
  recurringRemaining: number;
  reason?: string;
}

export class RecurringTransactionLimitManager {
  private static readonly FREE_RECURRING_LIMIT = 2; // Usuários FREE têm 2 transações recorrentes por mês

  /**
   * Verifica se o usuário pode criar transação recorrente
   */
  static async canCreateRecurring(userId: string): Promise<RecurringLimitInfo> {
    try {
      console.log('🔍 [RECURRING_LIMIT] Verificando limite de transações recorrentes para usuário:', userId);

      // Verificar plano do usuário
      const userPlan = await UserPlanManager.getUserPlan(userId);
      
      // Usuários premium têm transações recorrentes sem limite
      if (userPlan !== 'free' as any) {
        console.log('✅ [RECURRING_LIMIT] Usuário premium - transações recorrentes sem limite');
        return { 
          allowed: true, 
          recurringRemaining: -1 // -1 = sem limite
        };
      }

      // Para usuários FREE, verificar limite mensal
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // Buscar transações recorrentes criadas no mês atual
      const { data, error } = await supabase
        .from('user_recurring_count')
        .select('recurring_count')
        .eq('user_id', userId)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ [RECURRING_LIMIT] Erro ao buscar contadores:', error);
        return { 
          allowed: false, 
          recurringRemaining: 0,
          reason: 'error' 
        };
      }

      const currentRecurring = data?.recurring_count || 0;
      const recurringRemaining = this.FREE_RECURRING_LIMIT - currentRecurring;

      if (recurringRemaining <= 0) {
        console.log('🚫 [RECURRING_LIMIT] Limite atingido:', currentRecurring);
        return { 
          allowed: false, 
          recurringRemaining: 0,
          reason: 'limit_reached' 
        };
      }

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
   * Incrementa o contador de transações recorrentes
   */
  static async incrementRecurringCount(userId: string): Promise<boolean> {
    try {
      console.log('📊 [RECURRING_LIMIT] Incrementando contador para usuário:', userId);

      const currentMonth = new Date();

      // Usar upsert para criar ou atualizar o contador
      const { error } = await supabase
        .from('user_recurring_count')
        .upsert({
          user_id: userId,
          recurring_count: 1,
          month_year: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,month_year',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ [RECURRING_LIMIT] Erro ao incrementar contador:', error);
        return false;
      }

      console.log('✅ [RECURRING_LIMIT] Contador incrementado com sucesso');
      return true;

    } catch (error) {
      console.error('❌ [RECURRING_LIMIT] Erro no incremento:', error);
      return false;
    }
  }

  /**
   * Adiciona transações recorrentes extras (usado pelo reward ad)
   */
  static async addExtraRecurring(userId: string, amount: number): Promise<boolean> {
    try {
      console.log(`🎁 [RECURRING_LIMIT] Adicionando ${amount} transações recorrentes extras para usuário:`, userId);

      const currentMonth = new Date();
      
      // Buscar contador atual
      const { data: currentData, error: fetchError } = await supabase
        .from('user_recurring_count')
        .select('recurring_count')
        .eq('user_id', userId)
        .eq('month_year', `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ [RECURRING_LIMIT] Erro ao buscar contador atual:', fetchError);
        return false;
      }

      const currentCount = currentData?.recurring_count || 0;
      const newCount = Math.max(0, currentCount - amount); // Reduz o contador (mais transações disponíveis)

      // Atualizar contador
      const { error } = await supabase
        .from('user_recurring_count')
        .upsert({
          user_id: userId,
          recurring_count: newCount,
          month_year: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,month_year'
        });

      if (error) {
        console.error('❌ [RECURRING_LIMIT] Erro ao adicionar transações recorrentes extras:', error);
        return false;
      }

      console.log(`✅ [RECURRING_LIMIT] ${amount} transações recorrentes extras adicionadas com sucesso`);
      return true;

    } catch (error) {
      console.error('❌ [RECURRING_LIMIT] Erro ao adicionar transações recorrentes extras:', error);
      return false;
    }
  }

  /**
   * Obtém o contador atual de transações recorrentes
   */
  static async getCurrentRecurringCount(userId: string): Promise<number> {
    try {
      const currentMonth = new Date();
      
      const { data, error } = await supabase
        .from('user_recurring_count')
        .select('recurring_count')
        .eq('user_id', userId)
        .eq('month_year', `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [RECURRING_LIMIT] Erro ao buscar contador:', error);
        return 0;
      }

      return data?.recurring_count || 0;
    } catch (error) {
      console.error('❌ [RECURRING_LIMIT] Erro ao obter contador:', error);
      return 0;
    }
  }
}
