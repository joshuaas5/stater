import { supabase } from '@/lib/supabase';
import { getCurrentUser, getUserPreferences } from './localStorage';

/**
 * Envia um email de teste para o usuário atual
 * @returns Promise com o resultado do envio
 */
export const sendTestEmail = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    const userPreferences = getUserPreferences();
    if (!userPreferences.notifications.emailNotifications) {
      return { 
        success: false, 
        message: 'Notificações por email estão desativadas. Ative-as nas preferências para receber emails.' 
      };
    }

    // Chamar a função Edge do Supabase
    const { data, error } = await supabase.functions.invoke('send-weekly-summary', {
      body: { userId: user.id }
    });

    if (error) {
      console.error('Erro ao enviar email de teste:', error);
      return { success: false, message: `Erro ao enviar email: ${error.message}` };
    }

    return { 
      success: true, 
      message: 'Email de teste enviado com sucesso! Verifique sua caixa de entrada.' 
    };
  } catch (error) {
    console.error('Erro ao enviar email de teste:', error);
    return { 
      success: false, 
      message: `Erro inesperado: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

/**
 * Solicita o envio do resumo semanal para o usuário atual
 * Versão local que não usa a edge function do Supabase para evitar erros CORS
 * @returns Promise com o resultado do envio
 */
export const requestWeeklySummary = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    const userPreferences = getUserPreferences();
    if (!userPreferences.notifications.weeklyEmailSummary || !userPreferences.notifications.emailNotifications) {
      return { 
        success: false, 
        message: 'Resumos semanais por email estão desativados. Ative-os nas preferências para receber.' 
      };
    }

    // Chamar a função Edge do Supabase
    const { data, error } = await supabase.functions.invoke('send-weekly-summary', {
      body: { userId: user.id }
    });

    if (error) {
      console.error('Erro ao solicitar resumo semanal:', error);
      return { success: false, message: `Erro ao enviar resumo: ${error.message}` };
    }

    return { 
      success: true, 
      message: 'Resumo semanal solicitado com sucesso! Verifique sua caixa de entrada.' 
    };
  } catch (error) {
    console.error('Erro ao solicitar resumo semanal:', error);
    return { 
      success: false, 
      message: `Erro inesperado: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
