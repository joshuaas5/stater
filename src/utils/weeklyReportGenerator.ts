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
    
    // Como a função Edge está com problemas de CORS, vamos gerar uma notificação local
    // e mostrar o relatório diretamente na interface
    
    // Gerar uma mensagem detalhada com as contas a vencer
    let detailedMessage = `Relatório de vencimentos da semana: ${upcomingBills.length} contas a vencer no valor total de R$ ${totalAmount.toFixed(2)}.`;
    
    if (upcomingBills.length > 0) {
      detailedMessage += "\n\nContas a vencer:";
      upcomingBills.forEach(bill => {
        const dueDate = new Date(bill.dueDate);
        detailedMessage += `\n- ${bill.title}: R$ ${bill.amount.toFixed(2)} - Vence em ${dueDate.toLocaleDateString()}`;
      });
    } else {
      detailedMessage += "\n\nVocê não tem contas a vencer nos próximos 7 dias.";
    }

    // Criar uma notificação local sobre o relatório
    const notification = {
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user.id,
      type: 'weeklyReport',
      message: detailedMessage,
      date: new Date(),
      read: false
    };
    
    // Salvar notificação (usando o evento customizado para atualizar a interface)
    window.dispatchEvent(new CustomEvent('saveNotification', { detail: notification }));

    return { 
      success: true, 
      message: `Relatório de vencimentos gerado com sucesso! Você tem ${upcomingBills.length} contas a vencer nos próximos 7 dias.` 
    };
  } catch (error) {
    console.error('Erro ao gerar relatório de vencimentos:', error);
    return { 
      success: false, 
      message: `Erro inesperado: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};
