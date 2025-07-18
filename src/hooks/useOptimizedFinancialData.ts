// src/hooks/useOptimizedFinancialData.ts
import { useMemo } from 'react';
import { Transaction } from '@/types';
import { calculateBalance, calculatePercentageChange } from '@/utils/dataProcessing';

export const useOptimizedFinancialData = (
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

    // Calcular totais
    const totalIncomes = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncomes - totalExpenses;
    
    // Calcular saldo total (todas as transações)
    const totalBalance = transactions
      .filter(t => !(t.isRecurring && !t.isRecurringInstance))
      .reduce((sum, t) => {
        return sum + (t.type === 'income' ? t.amount : -t.amount);
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
