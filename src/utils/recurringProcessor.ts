import { Transaction } from '@/types';
import { getCurrentUser, saveTransaction, getTransactions, updateTransaction } from '@/utils/localStorage';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

// Interface para resultado do processamento
export interface RecurringProcessResult {
  processedCount: number;
  transactions: Transaction[];
  errors: string[];
}

/**
 * Verifica se uma transação recorrente deve ser processada
 */
const shouldProcessRecurring = (transaction: Transaction, today: Date): boolean => {
  // Verificações básicas
  if (!transaction.isRecurring || !transaction.recurrenceFrequency) {
    return false;
  }

  // Se nunca foi processada, processar
  if (!transaction.lastProcessed) {
    return true;
  }

  const lastProcessed = new Date(transaction.lastProcessed);
  const timeDiff = today.getTime() - lastProcessed.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  switch (transaction.recurrenceFrequency) {
    case 'weekly':
      // Processar se é o dia correto da semana e já passou 1 semana
      return today.getDay() === transaction.recurringWeekday && daysDiff >= 7;
    
    case 'monthly':
      // Processar se é o dia correto do mês e não foi processado neste mês
      const isSameMonth = today.getFullYear() === lastProcessed.getFullYear() && 
                         today.getMonth() === lastProcessed.getMonth();
      return today.getDate() === transaction.recurringDay && !isSameMonth;
    
    case 'yearly':
      // Processar se é o mesmo dia/mês e não foi processado neste ano
      const isSameYear = today.getFullYear() === lastProcessed.getFullYear();
      const isSameMonthDay = today.getMonth() === lastProcessed.getMonth() && 
                            today.getDate() === transaction.recurringDay;
      return isSameMonthDay && !isSameYear;
    
    default:
      return false;
  }
};

/**
 * Calcula a próxima ocorrência de uma transação recorrente
 */
export const calculateNextOccurrence = (transaction: Transaction): Date => {
  const now = new Date();
  const next = new Date();

  switch (transaction.recurrenceFrequency) {
    case 'weekly':
      if (transaction.recurringWeekday !== undefined) {
        const daysUntilNext = (transaction.recurringWeekday + 7 - now.getDay()) % 7;
        next.setDate(now.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext));
      }
      break;
    
    case 'monthly':
      if (transaction.recurringDay) {
        next.setDate(transaction.recurringDay);
        if (next <= now) {
          next.setMonth(next.getMonth() + 1);
          // Verificar se o dia existe no próximo mês
          if (next.getDate() !== transaction.recurringDay) {
            next.setDate(0); // Último dia do mês anterior
          }
        }
      }
      break;
    
    case 'yearly':
      if (transaction.recurringDay) {
        next.setMonth(now.getMonth());
        next.setDate(transaction.recurringDay);
        if (next <= now) {
          next.setFullYear(next.getFullYear() + 1);
        }
      }
      break;
  }

  return next;
};

/**
 * Cria uma nova instância de uma transação recorrente
 */
const createRecurringInstance = (originalTransaction: Transaction, executionDate: Date): Transaction => {
  const newTransaction: Transaction = {
    ...originalTransaction,
    id: uuidv4(),
    date: executionDate,
    isRecurringInstance: true,
    originalRecurringId: originalTransaction.id,
    title: `${originalTransaction.title} (${getRecurrenceLabel(originalTransaction)})`,
    // Remover campos específicos da recorrência para a instância
    isRecurring: false,
    recurrenceFrequency: undefined,
    recurringDay: undefined,
    recurringWeekday: undefined,
    nextOccurrence: undefined,
    lastProcessed: undefined
  };

  return newTransaction;
};

/**
 * Obtém o label da recorrência para exibição
 */
const getRecurrenceLabel = (transaction: Transaction): string => {
  switch (transaction.recurrenceFrequency) {
    case 'weekly':
      const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      return `Semanal - ${weekdays[transaction.recurringWeekday || 0]}`;
    case 'monthly':
      return `Mensal - Dia ${transaction.recurringDay}`;
    case 'yearly':
      return `Anual - Dia ${transaction.recurringDay}`;
    default:
      return 'Recorrente';
  }
};

/**
 * Atualiza a próxima ocorrência de uma transação recorrente
 */
const updateRecurringTransaction = (transaction: Transaction): void => {
  const updatedTransaction: Transaction = {
    ...transaction,
    lastProcessed: new Date(),
    nextOccurrence: calculateNextOccurrence(transaction)
  };

  updateTransaction(updatedTransaction);
};

/**
 * Processa todas as transações recorrentes pendentes
 */
export const processRecurringTransactions = async (): Promise<RecurringProcessResult> => {
  const user = getCurrentUser();
  if (!user) {
    return {
      processedCount: 0,
      transactions: [],
      errors: ['Usuário não autenticado']
    };
  }

  console.log('🔄 Iniciando processamento de transações recorrentes...');

  const allTransactions = getTransactions();
  const recurringTransactions = allTransactions.filter(t => 
    t.isRecurring && !t.isRecurringInstance
  );

  console.log(`📋 Encontradas ${recurringTransactions.length} transações recorrentes`);

  const today = new Date();
  const processedTransactions: Transaction[] = [];
  const errors: string[] = [];

  for (const recurring of recurringTransactions) {
    try {
      console.log(`🔍 Verificando: ${recurring.title}`);
      
      const shouldProcess = shouldProcessRecurring(recurring, today);
      console.log(`⚖️ Deve processar: ${shouldProcess}`);
      
      if (shouldProcess) {
        console.log(`✅ Processando: ${recurring.title}`);
        
        // Criar nova instância
        const newTransaction = createRecurringInstance(recurring, today);
        
        // Salvar a nova transação
        saveTransaction(newTransaction);
        processedTransactions.push(newTransaction);
        
        // Atualizar a transação recorrente original
        updateRecurringTransaction(recurring);
        
        console.log(`💾 Transação criada: ${newTransaction.title} - R$ ${newTransaction.amount}`);
      }
    } catch (error: any) {
      const errorMsg = `Erro ao processar ${recurring.title}: ${error.message}`;
      console.error('❌', errorMsg);
      errors.push(errorMsg);
    }
  }

  console.log(`✅ Processamento concluído: ${processedTransactions.length} transações criadas`);

  // Mostrar notificação ao usuário sobre o processamento
  if (processedTransactions.length > 0) {
    toast.success(
      `💰 ${processedTransactions.length} transação${processedTransactions.length > 1 ? 'ões' : ''} recorrente${processedTransactions.length > 1 ? 's' : ''} processada${processedTransactions.length > 1 ? 's' : ''}!`,
      {
        description: `Total: R$ ${processedTransactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}`,
        duration: 5000,
      }
    );
  }

  // Disparar evento para atualizar a UI
  if (processedTransactions.length > 0) {
    window.dispatchEvent(new CustomEvent('transactionsUpdated', {
      detail: { 
        source: 'recurring-processor',
        newTransactions: processedTransactions.length
      }
    }));
  }

  return {
    processedCount: processedTransactions.length,
    transactions: processedTransactions,
    errors
  };
};

/**
 * Processa uma transação recorrente específica (para teste/debug)
 */
export const processSpecificRecurring = async (transactionId: string): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user) return false;

  const allTransactions = getTransactions();
  const recurring = allTransactions.find(t => t.id === transactionId && t.isRecurring);

  if (!recurring) {
    console.error('Transação recorrente não encontrada:', transactionId);
    return false;
  }

  try {
    const today = new Date();
    const newTransaction = createRecurringInstance(recurring, today);
    
    saveTransaction(newTransaction);
    updateRecurringTransaction(recurring);
    
    // Notificar o usuário sobre o processamento manual
    toast.success(
      `✅ Transação recorrente processada!`,
      {
        description: `${newTransaction.title} - R$ ${newTransaction.amount.toFixed(2)}`,
        duration: 4000,
      }
    );
    
    // Disparar evento para atualizar a UI
    window.dispatchEvent(new CustomEvent('transactionsUpdated', {
      detail: { 
        source: 'manual-recurring',
        newTransactions: 1
      }
    }));

    console.log(`✅ Transação recorrente processada manualmente: ${newTransaction.title}`);
    return true;
  } catch (error: any) {
    console.error('Erro ao processar transação recorrente:', error);
    return false;
  }
};

/**
 * Obtém estatísticas das transações recorrentes
 */
export const getRecurringTransactionsStats = () => {
  const user = getCurrentUser();
  if (!user) return null;

  const allTransactions = getTransactions();
  const recurringTransactions = allTransactions.filter(t => t.isRecurring && !t.isRecurringInstance);
  const recurringInstances = allTransactions.filter(t => t.isRecurringInstance);

  const stats = {
    totalRecurring: recurringTransactions.length,
    totalInstances: recurringInstances.length,
    byFrequency: {
      weekly: recurringTransactions.filter(t => t.recurrenceFrequency === 'weekly').length,
      monthly: recurringTransactions.filter(t => t.recurrenceFrequency === 'monthly').length,
      yearly: recurringTransactions.filter(t => t.recurrenceFrequency === 'yearly').length
    },
    totalAmount: recurringTransactions.reduce((sum, t) => sum + t.amount, 0),
    pendingToday: recurringTransactions.filter(t => shouldProcessRecurring(t, new Date())).length
  };

  return stats;
};

/**
 * Debug: Lista todas as transações recorrentes no console
 */
export const debugRecurringTransactions = (): void => {
  const user = getCurrentUser();
  if (!user) {
    console.log('❌ Usuário não autenticado');
    return;
  }

  const allTransactions = getTransactions();
  const recurringTransactions = allTransactions.filter(t => t.isRecurring && !t.isRecurringInstance);
  const today = new Date();

  console.log('🔍 === DEBUG: TRANSAÇÕES RECORRENTES ===');
  console.log(`📊 Total de transações recorrentes: ${recurringTransactions.length}`);
  console.log(`📅 Data atual: ${today.toLocaleDateString('pt-BR')}`);
  console.log('');

  if (recurringTransactions.length === 0) {
    console.log('📭 Nenhuma transação recorrente encontrada');
    return;
  }

  recurringTransactions.forEach((t, index) => {
    console.log(`📝 ${index + 1}. ${t.title}`);
    console.log(`   💰 Valor: R$ ${t.amount.toFixed(2)}`);
    console.log(`   📊 Tipo: ${t.type === 'income' ? 'Receita' : 'Despesa'}`);
    console.log(`   🔁 Frequência: ${t.recurrenceFrequency}`);
    
    if (t.recurrenceFrequency === 'weekly') {
      const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      console.log(`   📅 Dia da semana: ${weekdays[t.recurringWeekday || 0]}`);
    } else {
      console.log(`   📅 Dia do período: ${t.recurringDay}`);
    }
    
    console.log(`   ⏰ Último processamento: ${t.lastProcessed ? new Date(t.lastProcessed).toLocaleDateString('pt-BR') : 'Nunca'}`);
    console.log(`   🎯 Próxima execução: ${t.nextOccurrence ? new Date(t.nextOccurrence).toLocaleDateString('pt-BR') : 'Não calculado'}`);
    console.log(`   🔍 Deve processar hoje: ${shouldProcessRecurring(t, today) ? 'SIM' : 'NÃO'}`);
    console.log('   ---');
  });

  const stats = getRecurringTransactionsStats();
  if (stats) {
    console.log('📊 ESTATÍSTICAS:');
    console.log(`   🔄 Total configuradas: ${stats.totalRecurring}`);
    console.log(`   📝 Instâncias criadas: ${stats.totalInstances}`);
    console.log(`   📅 Pendentes hoje: ${stats.pendingToday}`);
    console.log(`   💰 Valor total mensal estimado: R$ ${stats.totalAmount.toFixed(2)}`);
  }

  console.log('🔍 === FIM DEBUG ===');
};

/**
 * Inicia o processador automático de transações recorrentes
 */
export const startRecurringProcessor = (): void => {
  console.log('🚀 Iniciando processador automático de transações recorrentes');

  // Processar imediatamente quando o app é carregado
  setTimeout(() => {
    processRecurringTransactions();
  }, 2000); // Aguarda 2 segundos para garantir que tudo foi carregado

  // Processar a cada hora quando o app estiver ativo
  const intervalId = setInterval(() => {
    if (document.visibilityState === 'visible') {
      processRecurringTransactions();
    }
  }, 60 * 60 * 1000); // 1 hora

  // Processar quando o app volta do background
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Aguardar um pouco para garantir que o app foi reativado completamente
      setTimeout(() => {
        processRecurringTransactions();
      }, 1000);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Processar quando há mudança de dia (meia-noite)
  const checkDayChange = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 1, 0, 0); // 00:01 do próximo dia

    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      processRecurringTransactions();
      // Reagendar para o próximo dia
      setInterval(() => {
        processRecurringTransactions();
      }, 24 * 60 * 60 * 1000); // Todo dia à meia-noite
    }, timeUntilMidnight);
  };

  checkDayChange();

  console.log('✅ Processador automático iniciado');

  // Retornar função de cleanup
  return () => {
    clearInterval(intervalId);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    console.log('🛑 Processador automático interrompido');
  };
};

export default {
  processRecurringTransactions,
  processSpecificRecurring,
  getRecurringTransactionsStats,
  debugRecurringTransactions,
  startRecurringProcessor,
  calculateNextOccurrence
};
