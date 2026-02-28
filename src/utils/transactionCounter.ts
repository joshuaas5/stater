import { supabase } from '@/lib/supabase';

export interface TransactionCounterResult {
  shouldShowRewardAd: boolean;
  currentCount: number;
  nextRewardAt: number;
}

export class TransactionCounter {
  private static readonly REWARD_AD_INTERVAL = 5; // A cada 5 transações

  /**
   * Incrementa o contador de transações e verifica se deve mostrar reward ad
   */
  static async incrementAndCheck(userId: string): Promise<TransactionCounterResult> {
    try {
      console.log('📊 [TRANSACTION_COUNTER] Incrementando contador para userId:', userId);

      // Buscar contador atual do usuário
      const { data: existingCount, error: fetchError } = await supabase
        .from('user_transaction_count')
        .select('*')
        .eq('user_id', userId)
        .single();

      let currentCount = 1;
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ [TRANSACTION_COUNTER] Erro ao buscar contador:', fetchError);
        return { shouldShowRewardAd: false, currentCount: 0, nextRewardAt: this.REWARD_AD_INTERVAL };
      }

      if (existingCount) {
        currentCount = existingCount.transaction_count + 1;
        
        // Atualizar contador existente
        const { error: updateError } = await supabase
          .from('user_transaction_count')
          .update({ 
            transaction_count: currentCount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ [TRANSACTION_COUNTER] Erro ao atualizar contador:', updateError);
          return { shouldShowRewardAd: false, currentCount: currentCount - 1, nextRewardAt: this.REWARD_AD_INTERVAL };
        }
      } else {
        // Criar novo registro de contador
        const { error: insertError } = await supabase
          .from('user_transaction_count')
          .insert({
            user_id: userId,
            transaction_count: currentCount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('❌ [TRANSACTION_COUNTER] Erro ao criar contador:', insertError);
          return { shouldShowRewardAd: false, currentCount: 0, nextRewardAt: this.REWARD_AD_INTERVAL };
        }
      }

      console.log(`📊 [TRANSACTION_COUNTER] Contador atualizado: ${currentCount}`);

      // Verificar se deve mostrar reward ad
      const shouldShowRewardAd = currentCount % this.REWARD_AD_INTERVAL === 0;
      const nextRewardAt = this.REWARD_AD_INTERVAL - (currentCount % this.REWARD_AD_INTERVAL);

      console.log(`🎬 [TRANSACTION_COUNTER] Deve mostrar reward ad: ${shouldShowRewardAd} (próximo em ${nextRewardAt} transações)`);

      return {
        shouldShowRewardAd,
        currentCount,
        nextRewardAt: nextRewardAt === 0 ? this.REWARD_AD_INTERVAL : nextRewardAt
      };

    } catch (error) {
      console.error('❌ [TRANSACTION_COUNTER] Erro geral:', error);
      return { shouldShowRewardAd: false, currentCount: 0, nextRewardAt: this.REWARD_AD_INTERVAL };
    }
  }

  /**
   * Obtém o contador atual sem incrementar
   */
  static async getCurrentCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_transaction_count')
        .select('transaction_count')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [TRANSACTION_COUNTER] Erro ao buscar contador atual:', error);
        return 0;
      }

      return data?.transaction_count || 0;
    } catch (error) {
      console.error('❌ [TRANSACTION_COUNTER] Erro ao obter contador atual:', error);
      return 0;
    }
  }

  /**
   * Reseta o contador (útil para testes ou administração)
   */
  static async resetCounter(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_transaction_count')
        .update({ transaction_count: 0, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ [TRANSACTION_COUNTER] Erro ao resetar contador:', error);
        return false;
      }

      console.log('✅ [TRANSACTION_COUNTER] Contador resetado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ [TRANSACTION_COUNTER] Erro ao resetar contador:', error);
      return false;
    }
  }
}
