import { supabase } from '@/lib/supabase';
import { getCurrentUser } from './localStorage';

/**
 * Limpa todas as notificações do usuário atual, tanto no localStorage quanto no Supabase (se possível)
 * @returns Promise que resolve para true se a operação foi bem-sucedida
 */
export const clearAllNotifications = async (): Promise<boolean> => {
  try {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Limpar do localStorage
    localStorage.setItem(`notifications_${user.id}`, JSON.stringify([]));
    
    // Tentar limpar do Supabase também (se possível)
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);
    } catch (supabaseError) {
      console.error('Erro ao limpar notificações do Supabase:', supabaseError);
      // Continuamos mesmo se falhar no Supabase, pois já limpamos localmente
    }
    
    // Disparar evento para atualizar a interface
    window.dispatchEvent(new CustomEvent('notificationsUpdated'));
    return true;
  } catch (error) {
    console.error('Erro ao limpar notificações:', error);
    return false;
  }
};
