import { useMemo, useCallback } from 'react';
import { Transaction } from '@/types';

interface UseTransactionsOptimizedReturn {
  processedTransactions: Transaction[];
  updateTransaction: (index: number, transaction: Transaction) => void;
  removeTransaction: (index: number) => void;
  transactionSummary: {
    total: number;
    count: number;
    incomeCount: number;
    expenseCount: number;
  };
}

export const useTransactionsOptimized = (
  transactions: Transaction[],
  onUpdate: (transactions: Transaction[]) => void
): UseTransactionsOptimizedReturn => {
  
  // Memoizar o processamento das transações
  const processedTransactions = useMemo(() => {
    return transactions.map((transaction, index) => ({
      ...transaction,
      id: transaction.id || `temp-${index}`,
      amount: transaction.amount || 0,
      title: transaction.title || '',
      date: transaction.date || new Date(),
      category: transaction.category || 'outros'
    }));
  }, [transactions]);

  // Memoizar o resumo das transações
  const transactionSummary = useMemo(() => {
    return processedTransactions.reduce((summary, transaction) => {
      const amount = Math.abs(transaction.amount || 0);
      return {
        total: summary.total + amount,
        count: summary.count + 1,
        incomeCount: summary.incomeCount + (transaction.type === 'income' ? 1 : 0),
        expenseCount: summary.expenseCount + (transaction.type === 'expense' ? 1 : 0)
      };
    }, { total: 0, count: 0, incomeCount: 0, expenseCount: 0 });
  }, [processedTransactions]);

  // Callback otimizado para atualizar transação
  const updateTransaction = useCallback((index: number, updatedTransaction: Transaction) => {
    const newTransactions = [...transactions];
    newTransactions[index] = updatedTransaction;
    onUpdate(newTransactions);
  }, [transactions, onUpdate]);

  // Callback otimizado para remover transação
  const removeTransaction = useCallback((index: number) => {
    const newTransactions = transactions.filter((_, i) => i !== index);
    onUpdate(newTransactions);
  }, [transactions, onUpdate]);

  return {
    processedTransactions,
    updateTransaction,
    removeTransaction,
    transactionSummary
  };
};
