// src/utils/reportCounter.ts
import { supabase } from '@/lib/supabase';

interface ReportCounterResult {
  shouldShowRewardAd: boolean;
  currentCount: number;
  nextRewardAt: number;
}

/**
 * Gerenciador de contador de relatórios para sistema de reward ads
 * - Usuários FREE: Podem baixar alguns relatórios, depois precisam ver reward ad
 * - Sistema similar ao BillCounter e TransactionCounter
 */
export class ReportCounter {
  private static readonly REWARD_AD_INTERVAL = 1; // AD A CADA 1 RELATÓRIO (desde o primeiro)
  private static readonly FREE_REPORTS_LIMIT = 0; // ZERO relatórios gratuitos - AD desde o primeiro

  /**
   * Incrementa o contador de reports e verifica se deve mostrar reward ad
   */
  static async incrementAndCheck(userId: string): Promise<ReportCounterResult> {
    try {
      console.log('📊 [REPORT_COUNTER] Incrementando contador para userId:', userId);

      // Buscar contador atual do usuário
      const { data: existingCount, error: fetchError } = await supabase
        .from('user_report_count')
        .select('*')
        .eq('user_id', userId)
        .single();

      let currentCount = 1;
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ [REPORT_COUNTER] Erro ao buscar contador:', fetchError);
        return { shouldShowRewardAd: false, currentCount: 0, nextRewardAt: this.REWARD_AD_INTERVAL };
      }

      if (existingCount) {
        currentCount = existingCount.report_count + 1;
        
        // Atualizar contador existente
        const { error: updateError } = await supabase
          .from('user_report_count')
          .update({ 
            report_count: currentCount,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('❌ [REPORT_COUNTER] Erro ao atualizar contador:', updateError);
          return { shouldShowRewardAd: false, currentCount: currentCount - 1, nextRewardAt: this.REWARD_AD_INTERVAL };
        }
      } else {
        // Criar novo registro de contador
        const { error: insertError } = await supabase
          .from('user_report_count')
          .insert({
            user_id: userId,
            report_count: currentCount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('❌ [REPORT_COUNTER] Erro ao criar contador:', insertError);
          return { shouldShowRewardAd: false, currentCount: 0, nextRewardAt: this.REWARD_AD_INTERVAL };
        }
      }

      console.log(`📊 [REPORT_COUNTER] Contador atualizado para ${currentCount}`);

      // Lógica para determinar quando mostrar reward ad
      // SEMPRE mostrar ad para qualquer relatório (desde o primeiro)
      const shouldShow = true; // SEMPRE mostrar ad para relatórios
      
      console.log(`🎬 [REPORT_COUNTER] Relatório ${currentCount} - SEMPRE mostrar ad`);
      
      return { 
        shouldShowRewardAd: shouldShow, 
        currentCount, 
        nextRewardAt: 1 // Sempre próximo ad = próximo relatório
      };

    } catch (error) {
      console.error('❌ [REPORT_COUNTER] Erro geral:', error);
      return { shouldShowRewardAd: false, currentCount: 0, nextRewardAt: this.REWARD_AD_INTERVAL };
    }
  }

  /**
   * Obtém o contador atual sem incrementar
   */
  static async getCurrentCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_report_count')
        .select('report_count')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [REPORT_COUNTER] Erro ao buscar contador atual:', error);
        return 0;
      }

      return data?.report_count || 0;
    } catch (error) {
      console.error('❌ [REPORT_COUNTER] Erro ao obter contador atual:', error);
      return 0;
    }
  }

  /**
   * Reseta o contador (útil para testes ou administração)
   */
  static async resetCounter(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_report_count')
        .update({ report_count: 0, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) {
        console.error('❌ [REPORT_COUNTER] Erro ao resetar contador:', error);
        return false;
      }

      console.log('✅ [REPORT_COUNTER] Contador resetado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ [REPORT_COUNTER] Erro ao resetar contador:', error);
      return false;
    }
  }
}
