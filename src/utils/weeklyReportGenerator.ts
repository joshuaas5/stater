import { supabase } from '@/lib/supabase';
import { getCurrentUser, getBills } from './localStorage';
import { Bill } from '@/types';

/**
 * Gera e envia um relatório de vencimentos da semana para o email do usuário
 * @returns Promise com o resultado do envio
 */
export const generateWeeklyDueReport = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, message: 'Usuário não autenticado' };
    }

    // Buscar contas do usuário
    const bills = getBills();
    
    // Filtrar contas que vencem nos próximos 7 dias
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const upcomingBills = bills.filter(bill => {
      if (bill.isPaid) return false;
      
      const dueDate = new Date(bill.dueDate);
      return dueDate >= today && dueDate <= nextWeek;
    });
    
    // Ordenar por data de vencimento
    upcomingBills.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    // Calcular valor total
    const totalAmount = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);
    
    // Chamar a função Edge do Supabase para enviar o relatório
    const { data, error } = await supabase.functions.invoke('send-due-bills-report', {
      body: { 
        userId: user.id,
        upcomingBills,
        totalAmount,
        startDate: today.toISOString(),
        endDate: nextWeek.toISOString()
      }
    });

    if (error) {
      console.error('Erro ao enviar relatório de vencimentos:', error);
      return { success: false, message: `Erro ao enviar relatório: ${error.message}` };
    }

    // Criar uma notificação local sobre o relatório enviado
    const notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      type: 'weeklyReport',
      message: `Relatório de vencimentos da semana enviado para seu email (${upcomingBills.length} contas a vencer no valor total de R$ ${totalAmount.toFixed(2)}).`,
      date: new Date(),
      read: false
    };
    
    // Salvar notificação (usando o evento customizado para atualizar a interface)
    window.dispatchEvent(new CustomEvent('saveNotification', { detail: notification }));

    return { 
      success: true, 
      message: `Relatório de vencimentos enviado com sucesso! Você tem ${upcomingBills.length} contas a vencer nos próximos 7 dias.` 
    };
  } catch (error) {
    console.error('Erro ao gerar relatório de vencimentos:', error);
    return { 
      success: false, 
      message: `Erro inesperado: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
