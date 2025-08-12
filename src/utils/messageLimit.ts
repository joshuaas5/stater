// src/utils/messageLimit.ts
import { supabase } from '@/lib/supabase';
import { UserPlanManager } from './userPlanManager';
import { PlanType } from '@/types';

interface MessageLimitResult {
  allowed: boolean;
  messagesUsed: number;
  messagesRemaining: number;
  requiresUpgrade: boolean;
  reason: 'allowed' | 'limit_reached' | 'need_premium' | 'error';
}

/**
 * Sistema de limitação de mensagens para o Stater IA
 * - Usuários FREE: 3 mensagens gratuitas TOTAL (não por dia/semana)
 * - Usuários PREMIUM: Ilimitado
 * - Usuários TRIAL: Ilimitado durante o período
 */
export class MessageLimitManager {
  
  private static readonly FREE_MESSAGE_LIMIT = 3;
  
  /**
   * Verifica se o usuário pode enviar uma mensagem
   */
  static async canSendMessage(userId: string): Promise<MessageLimitResult> {
    try {
      console.log('📊 [MESSAGE_LIMIT] Verificando limite de mensagens para usuário:', userId);
      
      // 1. Verificar plano do usuário
      const userPlan = await UserPlanManager.getUserPlan(userId);
      console.log('📊 [MESSAGE_LIMIT] Plano do usuário:', userPlan);
      
      // 2. Se é premium (qualquer plano pago), permitir ilimitado
      if (userPlan.planType !== PlanType.FREE) {
        console.log('✅ [MESSAGE_LIMIT] Usuário premium - mensagens ilimitadas');
        return {
          allowed: true,
          messagesUsed: 0,
          messagesRemaining: -1, // Ilimitado
          requiresUpgrade: false,
          reason: 'allowed'
        };
      }
      
      // 3. Para usuários FREE, verificar contador de mensagens
      const messageCount = await this.getMessageCount(userId);
      const remaining = this.FREE_MESSAGE_LIMIT - messageCount;
      
      console.log(`📊 [MESSAGE_LIMIT] Usuário FREE - Mensagens usadas: ${messageCount}/${this.FREE_MESSAGE_LIMIT}`);
      
      if (messageCount >= this.FREE_MESSAGE_LIMIT) {
        console.log('🚫 [MESSAGE_LIMIT] Limite de mensagens gratuitas atingido');
        return {
          allowed: false,
          messagesUsed: messageCount,
          messagesRemaining: 0,
          requiresUpgrade: true,
          reason: 'limit_reached'
        };
      }
      
      return {
        allowed: true,
        messagesUsed: messageCount,
        messagesRemaining: remaining,
        requiresUpgrade: false,
        reason: 'allowed'
      };
      
    } catch (error) {
      console.error('❌ [MESSAGE_LIMIT] Erro ao verificar limite de mensagens:', error);
      return {
        allowed: false,
        messagesUsed: 0,
        messagesRemaining: 0,
        requiresUpgrade: false,
        reason: 'error'
      };
    }
  }
  
  /**
   * Incrementa o contador de mensagens do usuário
   */
  static async incrementMessageCount(userId: string): Promise<void> {
    try {
      console.log('📈 [MESSAGE_LIMIT] Incrementando contador de mensagens para:', userId);
      
      // Buscar contador atual
      const { data: existing, error: fetchError } = await supabase
        .from('user_message_count')
        .select('message_count')
        .eq('user_id', userId)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found
        throw fetchError;
      }
      
      if (existing) {
        // Atualizar contador existente
        const { error: updateError } = await supabase
          .from('user_message_count')
          .update({ 
            message_count: existing.message_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) throw updateError;
        console.log('📈 [MESSAGE_LIMIT] Contador atualizado:', existing.message_count + 1);
      } else {
        // Criar novo registro
        const { error: insertError } = await supabase
          .from('user_message_count')
          .insert({
            user_id: userId,
            message_count: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (insertError) throw insertError;
        console.log('📈 [MESSAGE_LIMIT] Contador criado: 1');
      }
      
    } catch (error) {
      console.error('❌ [MESSAGE_LIMIT] Erro ao incrementar contador:', error);
      throw error;
    }
  }
  
  /**
   * Obtém o contador atual de mensagens do usuário
   */
  private static async getMessageCount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('user_message_count')
        .select('message_count')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data?.message_count || 0;
    } catch (error) {
      console.error('❌ [MESSAGE_LIMIT] Erro ao buscar contador:', error);
      return 0;
    }
  }
  
  /**
   * Reset do contador (para uso administrativo)
   */
  static async resetMessageCount(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_message_count')
        .upsert({
          user_id: userId,
          message_count: 0,
          updated_at: new Date().toISOString()
        });
      
      if (error) throw error;
      console.log('🔄 [MESSAGE_LIMIT] Contador resetado para usuário:', userId);
    } catch (error) {
      console.error('❌ [MESSAGE_LIMIT] Erro ao resetar contador:', error);
      throw error;
    }
  }
}
