import { getCurrentUser } from './localStorage';

/**
 * Envia um email com o resumo semanal para o usuário
 * @returns Promise<{success: boolean, message: string}>
 */
export const sendWeeklySummaryEmail = async (): Promise<{success: boolean, message: string}> => {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, message: 'Usuário não encontrado' };
  }

  try {
    // Simulação de envio de email - em produção, isso chamaria uma edge function do Supabase
    console.log(`Enviando resumo semanal para ${user.email}`);
    
    // Em um ambiente real, você chamaria a edge function assim:
    // const { data, error } = await supabase.functions.invoke('send-weekly-summary', {
    //   body: { userId: user.id, email: user.email }
    // });
    
    // Simulação de sucesso
    return { 
      success: true, 
      message: 'Email de resumo enviado com sucesso! Verifique sua caixa de entrada.'
    };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { 
      success: false, 
      message: 'Não foi possível enviar o email. Tente novamente mais tarde.'
    };
  }
};
