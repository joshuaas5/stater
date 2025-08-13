import { supabase } from '@/lib/supabase';

export interface BillCounterResult {
  shouldShowRewardAd: boolean;
  currentCount: number;
  nextRewardAt: number;
}

export class BillCounter {
  private static readonly REWARD_AD_INTERVAL = 3; // A cada 3 bills

  /**
   * Incrementa o contador de bills e verifica se deve mostrar reward ad
   */
  static async incrementAndCheck(userId: string): Promise<BillCounterResult> {
    try {
      console.log('📋 [BILL_COUNTER] Incrementando contador para userId:', userId);

      // Buscar contador atual do usuário
      const { data: existingCount, error: fetchError } = await supabase
        .from('user_bill_count')
        .select('*')
        .eq('user_id', userId)
        .single();

      let currentCount = 1;
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ [BILL_COUNTER] Erro ao buscar contador:', fetchError);
        return { shouldShowRewardAd: false, currentCount: 0, nextRewardAt: this.REWARD_AD_INTERVAL };
      }

      if (existingCount) {
        currentCount = existingCount.bill_count + 1;
        
        // Atualizar contador existente
        const { error: updateError } = await supabase
          .from('user_bill_count')
          .update({ 
            bill_count: currentCount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ [BILL_COUNTER] Erro ao atualizar contador:', updateError);
          return { shouldShowRewardAd: false, currentCount: currentCount - 1, nextRewardAt: this.REWARD_AD_INTERVAL };
        }
      } else {
        // Criar novo registro de contador
        const { error: insertError } = await supabase
          .from('user_bill_count')
          .insert({
            user_id: userId,
            bill_count: currentCount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('❌ [BILL_COUNTER] Erro ao criar contador:', insertError);
          return { shouldShowRewardAd: false, currentCount: 0, nextRewardAt: this.REWARD_AD_INTERVAL };
        }
      }

      console.log(`📋 [BILL_COUNTER] Contador atualizado: ${currentCount}`);

      // Verificar se deve mostrar reward ad
      const shouldShowRewardAd = currentCount % this.REWARD_AD_INTERVAL === 0;
      const nextRewardAt = this.REWARD_AD_INTERVAL - (currentCount % this.REWARD_AD_INTERVAL);

      console.log(`🎬 [BILL_COUNTER] Deve mostrar reward ad: ${shouldShowRewardAd} (próximo em ${nextRewardAt} bills)`);

      return {
        shouldShowRewardAd,
        currentCount,
        nextRewardAt: nextRewardAt === 0 ? this.REWARD_AD_INTERVAL : nextRewardAt
      };

    } catch (error) {
      console.error('❌ [BILL_COUNTER] Erro geral:', error);
      return { shouldShowRewardAd: false, currentCount: 0, nextRewardAt: this.REWARD_AD_INTERVAL };
    }
  }

  /**
   * Obtém o contador atual sem incrementar
   */
  static async getCurrentCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_bill_count')
        .select('bill_count')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [BILL_COUNTER] Erro ao buscar contador atual:', error);
        return 0;
      }

      return data?.bill_count || 0;
    } catch (error) {
      console.error('❌ [BILL_COUNTER] Erro ao obter contador atual:', error);
      return 0;
    }
  }

  /**
   * Reseta o contador (útil para testes ou administração)
   */
  static async resetCounter(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_bill_count')
        .update({ bill_count: 0, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ [BILL_COUNTER] Erro ao resetar contador:', error);
        return false;
      }

      console.log('✅ [BILL_COUNTER] Contador resetado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ [BILL_COUNTER] Erro ao resetar contador:', error);
      return false;
    }
  }
}
