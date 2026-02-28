// src/components/dashboard/OptimizedDashboard.tsx
import React, { useCallback, useEffect, useState, useMemo, memo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  calculateBalance, 
  calculatePercentageChange,
  formatCurrency, 
  getTransactionsFromLastDays 
} from '@/utils/dataProcessing';
import { getCurrentUser, getTransactions, isLoggedIn } from '@/utils/localStorage';
import { Transaction } from '@/types';

interface DashboardOptimizedProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
}

// Componente memoizado para cálculos financeiros
const FinancialSummary = memo(({ transactions, selectedMonth, selectedYear }: DashboardOptimizedProps) => {
  // Memoizar cálculos pesados
  const financialData = useMemo(() => {
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === selectedMonth && transactionDate.getFullYear() === selectedYear;
    });

    const totalIncomes = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncomes - totalExpenses;
    const percentChange = calculatePercentageChange(balance, totalIncomes);

    return {
      totalIncomes,
      totalExpenses,
      balance,
      percentChange,
      filteredTransactions
    };
  }, [transactions, selectedMonth, selectedYear]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Receitas</h3>
        <p className="text-3xl font-bold">{formatCurrency(financialData.totalIncomes)}</p>
      </div>
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Despesas</h3>
        <p className="text-3xl font-bold">{formatCurrency(financialData.totalExpenses)}</p>
      </div>
      <div className={`bg-gradient-to-r ${financialData.balance >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} rounded-lg p-6 text-white`}>
        <h3 className="text-lg font-semibold mb-2">Saldo</h3>
        <p className="text-3xl font-bold">{formatCurrency(financialData.balance)}</p>
        {financialData.percentChange !== 0 && (
          <p className="text-sm opacity-90">
            {financialData.percentChange > 0 ? '+' : ''}{financialData.percentChange.toFixed(1)}%
          </p>
        )}
      </div>
    </div>
  );
});

FinancialSummary.displayName = 'FinancialSummary';

// Componente memoizado para lista de transações
const TransactionsList = memo(({ transactions, limit = 5 }: { transactions: Transaction[], limit?: number }) => {
  const displayTransactions = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }, [transactions, limit]);

  if (displayTransactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Nenhuma transação encontrada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayTransactions.map((transaction) => (
        <div key={transaction.id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">{transaction.title}</h4>
              <p className="text-sm text-white/70">{transaction.category}</p>
            </div>
            <div className="text-right">
              <p className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
              <p className="text-xs text-white/50">
                {new Date(transaction.date).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

TransactionsList.displayName = 'TransactionsList';

export { FinancialSummary, TransactionsList };
