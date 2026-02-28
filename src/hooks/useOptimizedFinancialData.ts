// src/hooks/useOptimizedFinancialData.ts
import { useMemo, useCallback } from 'react';
import { getTransactions, getBills } from '@/utils/localStorage';
import { calculateFinancialHealthScore, generateFinancialHealthTips } from '@/services/financialHealthService';
import { Transaction, Bill as Debt } from '@/types';
import { calculateBalance, calculatePercentageChange } from '@/utils/dataProcessing';

// Hook principal otimizado para dados financeiros
export const useOptimizedFinancialData = () => {
  // Memoizar dados brutos com error handling
  const rawData = useMemo(() => {
    try {
      const transactions: Transaction[] = getTransactions();
      const debts: Debt[] = getBills(false);
      return { transactions, debts, error: null };
    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
      return { transactions: [], debts: [], error: error as Error };
    }
  }, []);

  // Memoizar cálculo do score
  const scoreData = useMemo(() => {
    if (!rawData.transactions.length || rawData.error) return null;
    try {
      return calculateFinancialHealthScore(rawData.transactions, rawData.debts);
    } catch (error) {
      console.error('Erro ao calcular score financeiro:', error);
      return null;
    }
  }, [rawData]);

  // Memoizar dicas financeiras
  const financialTips = useMemo(() => {
    if (!scoreData) return [];
    try {
      return generateFinancialHealthTips(scoreData);
    } catch (error) {
      console.error('Erro ao gerar dicas financeiras:', error);
      return [];
    }
  }, [scoreData]);

  // Callback para força refresh dos dados
  const refreshData = useCallback(() => {
    // Força re-render através de um reload controlado
    window.location.reload();
  }, []);

  return {
    transactions: rawData.transactions,
    debts: rawData.debts,
    scoreData,
    financialTips,
    isLoading: !scoreData && !rawData.error,
    hasError: !!rawData.error,
    refreshData
  };
};

// Hook otimizado para dados filtrados por período
export const useOptimizedFinancialDataFiltered = (
  transactions: Transaction[],
  selectedMonth: number,
  selectedYear: number
) => {
  return useMemo(() => {
    // Filtrar transações do mês selecionado
    const filteredTransactions = transactions.filter(t => {
      if (t.isRecurring && !t.isRecurringInstance) {
        return false; // Excluir templates de recorrência
      }
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === selectedMonth && 
             transactionDate.getFullYear() === selectedYear;
    });

    // Calcular totais - SEMPRE usar Math.abs para garantir cálculo correto
    const totalIncomes = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const balance = totalIncomes - totalExpenses;
    
    // Calcular saldo total (todas as transações)
    const totalBalance = transactions
      .filter(t => !(t.isRecurring && !t.isRecurringInstance))
      .reduce((sum, t) => {
        return sum + (t.type === 'income' ? Math.abs(t.amount) : -Math.abs(t.amount));
      }, 0);

    const percentChange = calculatePercentageChange(balance, totalIncomes);

    return {
      filteredTransactions,
      totalIncomes,
      totalExpenses,
      balance,
      totalBalance,
      percentChange,
      transactionCount: filteredTransactions.length
    };
  }, [transactions, selectedMonth, selectedYear]);
};

export const useOptimizedTransactionsList = (
  transactions: Transaction[],
  filters: {
    nameFilter?: string;
    showAll?: boolean;
    limit?: number;
  } = {}
) => {
  return useMemo(() => {
    let filtered = [...transactions];

    // Aplicar filtro por nome se existir
    if (filters.nameFilter) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(filters.nameFilter!.toLowerCase()) ||
        t.category.toLowerCase().includes(filters.nameFilter!.toLowerCase())
      );
    }

    // Ordenar por data (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Aplicar limite se não for para mostrar todos
    if (!filters.showAll && filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    return filtered;
  }, [transactions, filters.nameFilter, filters.showAll, filters.limit]);
};

export const useOptimizedChartData = (transactions: Transaction[], days: number = 30) => {
  return useMemo(() => {
    const today = new Date();
    const data = [];
    let runningBalance = 0;

    // Calcular saldo inicial
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Transações anteriores ao período
    const previousTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate < startDate;
    });

    runningBalance = previousTransactions.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);

    // Processar cada dia do período
    for (let i = days; i >= 0; i--) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() - i);
      currentDate.setHours(0, 0, 0, 0);
      const dateStr = currentDate.toISOString().split('T')[0];

      const dayTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        txDate.setHours(0, 0, 0, 0);
        return txDate.toISOString().split('T')[0] === dateStr;
      });

      const dayNetChange = dayTransactions.reduce((sum, t) => {
        return sum + (t.type === 'income' ? t.amount : -t.amount);
      }, 0);

      runningBalance += dayNetChange;

      data.push({
        date: dateStr,
        balance: runningBalance,
        dayChange: dayNetChange,
        hasTransactions: dayTransactions.length > 0,
        transactionCount: dayTransactions.length,
        formattedDate: currentDate.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit'
        })
      });
    }

    return data;
  }, [transactions, days]);
};
