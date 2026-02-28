import { supabase } from '@/lib/supabase';
import { UserPlanManager } from './userPlanManager';

export interface DownloadLimitInfo {
  allowed: boolean;
  downloadsRemaining: number;
  reason?: string;
}

export class ReportDownloadLimitManager {
  private static readonly FREE_DOWNLOAD_LIMIT = 3; // Usuários FREE têm 3 downloads por mês

  /**
   * Verifica se o usuário pode fazer download de relatório
   */
  static async canDownloadReport(userId: string): Promise<DownloadLimitInfo> {
    try {
      console.log('🔍 [DOWNLOAD_LIMIT] Verificando limite de download para usuário:', userId);

      // Verificar plano do usuário
      const userPlan = await UserPlanManager.getUserPlan(userId);
      
      // Usuários premium têm downloads sem limite
      if (userPlan !== 'free' as any) {
        console.log('✅ [DOWNLOAD_LIMIT] Usuário premium - downloads sem limite');
        return { 
          allowed: true, 
          downloadsRemaining: -1 // -1 = sem limite
        };
      }

      // Para usuários FREE, verificar limite mensal
      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      // Buscar downloads do mês atual
      const { data, error } = await supabase
        .from('user_download_count')
        .select('download_count')
        .eq('user_id', userId)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ [DOWNLOAD_LIMIT] Erro ao buscar contadores:', error);
        return { 
          allowed: false, 
          downloadsRemaining: 0,
          reason: 'error' 
        };
      }

      const currentDownloads = data?.download_count || 0;
      const downloadsRemaining = this.FREE_DOWNLOAD_LIMIT - currentDownloads;

      if (downloadsRemaining <= 0) {
        console.log('🚫 [DOWNLOAD_LIMIT] Limite atingido:', currentDownloads);
        return { 
          allowed: false, 
          downloadsRemaining: 0,
          reason: 'limit_reached' 
        };
      }

      console.log(`✅ [DOWNLOAD_LIMIT] Download permitido - Restantes: ${downloadsRemaining}`);
      return { 
        allowed: true, 
        downloadsRemaining 
      };

    } catch (error) {
      console.error('❌ [DOWNLOAD_LIMIT] Erro na verificação:', error);
      return { 
        allowed: false, 
        downloadsRemaining: 0,
        reason: 'error' 
      };
    }
  }

  /**
   * Incrementa o contador de downloads
   */
  static async incrementDownloadCount(userId: string): Promise<boolean> {
    try {
      console.log('📊 [DOWNLOAD_LIMIT] Incrementando contador para usuário:', userId);

      const currentMonth = new Date();
      const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);

      // Usar upsert para criar ou atualizar o contador
      const { error } = await supabase
        .from('user_download_count')
        .upsert({
          user_id: userId,
          download_count: 1,
          month_year: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,month_year',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ [DOWNLOAD_LIMIT] Erro ao incrementar contador:', error);
        return false;
      }

      console.log('✅ [DOWNLOAD_LIMIT] Contador incrementado com sucesso');
      return true;

    } catch (error) {
      console.error('❌ [DOWNLOAD_LIMIT] Erro no incremento:', error);
      return false;
    }
  }

  /**
   * Adiciona downloads extras (usado pelo reward ad)
   */
  static async addExtraDownloads(userId: string, amount: number): Promise<boolean> {
    try {
      console.log(`🎁 [DOWNLOAD_LIMIT] Adicionando ${amount} downloads extras para usuário:`, userId);

      const currentMonth = new Date();
      
      // Buscar contador atual
      const { data: currentData, error: fetchError } = await supabase
        .from('user_download_count')
        .select('download_count')
        .eq('user_id', userId)
        .eq('month_year', `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ [DOWNLOAD_LIMIT] Erro ao buscar contador atual:', fetchError);
        return false;
      }

      const currentCount = currentData?.download_count || 0;
      const newCount = Math.max(0, currentCount - amount); // Reduz o contador (mais downloads disponíveis)

      // Atualizar contador
      const { error } = await supabase
        .from('user_download_count')
        .upsert({
          user_id: userId,
          download_count: newCount,
          month_year: `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,month_year'
        });

      if (error) {
        console.error('❌ [DOWNLOAD_LIMIT] Erro ao adicionar downloads extras:', error);
        return false;
      }

      console.log(`✅ [DOWNLOAD_LIMIT] ${amount} downloads extras adicionados com sucesso`);
      return true;

    } catch (error) {
      console.error('❌ [DOWNLOAD_LIMIT] Erro ao adicionar downloads extras:', error);
      return false;
    }
  }

  /**
   * Obtém o contador atual de downloads
   */
  static async getCurrentDownloadCount(userId: string): Promise<number> {
    try {
      const currentMonth = new Date();
      
      const { data, error } = await supabase
        .from('user_download_count')
        .select('download_count')
        .eq('user_id', userId)
        .eq('month_year', `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [DOWNLOAD_LIMIT] Erro ao buscar contador:', error);
        return 0;
      }

      return data?.download_count || 0;
    } catch (error) {
      console.error('❌ [DOWNLOAD_LIMIT] Erro ao obter contador:', error);
      return 0;
    }
  }
}
