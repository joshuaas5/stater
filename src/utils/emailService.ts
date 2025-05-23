import { getCurrentUser } from './localStorage';
import { getTransactions } from './localStorage';
import { formatCurrency } from './dataProcessing';

/**
 * Envia um email com o resumo semanal para o usuário
 * Versão exclusivamente local para evitar problemas de CORS
 * @returns Promise<{success: boolean, message: string}>
 */
export const sendWeeklySummaryEmail = async (): Promise<{success: boolean, message: string}> => {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, message: 'Usuário não encontrado' };
  }

  try {
    // Simulação de envio de email - usamos apenas processamento local
    console.log(`Gerando resumo semanal para ${user.email}`);
    
    // Gerar um resumo baseado nos dados locais
    const transactions = getTransactions();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    
    // Filtrar transações da última semana
    const recentTransactions = transactions.filter(t => {
      const transDate = new Date(t.date);
      return transDate >= sevenDaysAgo && transDate <= now;
    });
    
    // Calcular receitas e despesas da semana
    const incomes = recentTransactions.filter(t => t.type === 'income');
    const expenses = recentTransactions.filter(t => t.type === 'expense');
    
    const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    // Simular sucesso com detalhes do resumo
    return { 
      success: true, 
      message: `Resumo gerado com sucesso! Na última semana você teve ${incomes.length} receitas (${formatCurrency(totalIncome)}) e ${expenses.length} despesas (${formatCurrency(totalExpense)}).`
    };
  } catch (error) {
    console.error('Erro ao gerar resumo semanal:', error);
    return { 
      success: false, 
      message: 'Não foi possível gerar o resumo. Tente novamente mais tarde.'
    };
  }
};
