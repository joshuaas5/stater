import React, { memo, useMemo, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Target, Calendar, PiggyBank } from 'lucide-react';
import { getTransactions } from '@/utils/localStorage';
import { formatCurrency } from '@/utils/dataProcessing';

// Componente completamente memoizado para melhor performance
const FinancialInsights: React.FC = memo(() => {
  // Dados memoizados para evitar recálculos desnecessários
  const financialData = useMemo(() => {
    const transactions = getTransactions();
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Filtrar transações do mês atual
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });
    
    // Calcular receitas e gastos
    const income = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    const savingsRate = income > 0 ? ((balance / income) * 100) : 0;
    
    // Análise de categorias de gastos
    const expensesByCategory: { [key: string]: number } = {};
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
      });
    
    const topExpenseCategory = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a)[0];
    
    return {
      income,
      expenses,
      balance,
      savingsRate,
      topExpenseCategory: topExpenseCategory || ['Nenhuma', 0],
      transactionCount: currentMonthTransactions.length
    };
  }, []);

  // Insights memoizados
  const insights = useMemo(() => {
    const { income, expenses, balance, savingsRate, topExpenseCategory, transactionCount } = financialData;
    
    return [
      {
        title: "Saldo do Mês",
        value: formatCurrency(balance),
        icon: balance >= 0 ? TrendingUp : TrendingDown,
        color: balance >= 0 ? "text-green-600" : "text-red-600",
        bgColor: balance >= 0 ? "bg-green-50" : "bg-red-50",
        description: balance >= 0 ? "Saldo positivo este mês" : "Gastos superaram receitas"
      },
      {
        title: "Taxa de Poupança",
        value: `${savingsRate.toFixed(1)}%`,
        icon: PiggyBank,
        color: savingsRate > 20 ? "text-green-600" : savingsRate > 10 ? "text-yellow-600" : "text-red-600",
        bgColor: savingsRate > 20 ? "bg-green-50" : savingsRate > 10 ? "bg-yellow-50" : "bg-red-50",
        description: savingsRate > 20 ? "Excelente poupança!" : savingsRate > 10 ? "Poupança moderada" : "Considere economizar mais"
      },
      {
        title: "Principal Gasto",
        value: topExpenseCategory[0],
        subValue: formatCurrency(topExpenseCategory[1]),
        icon: DollarSign,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        description: "Categoria com maior gasto"
      },
      {
        title: "Total de Receitas",
        value: formatCurrency(income),
        icon: TrendingUp,
        color: "text-green-600",
        bgColor: "bg-green-50",
        description: "Receitas deste mês"
      },
      {
        title: "Total de Gastos",
        value: formatCurrency(expenses),
        icon: TrendingDown,
        color: "text-red-600",
        bgColor: "bg-red-50",
        description: "Gastos deste mês"
      },
      {
        title: "Transações",
        value: transactionCount.toString(),
        icon: Calendar,
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        description: "Movimentações este mês"
      }
    ];
  }, [financialData]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {insights.map((insight, index) => (
        <Card key={index} className={`${insight.bgColor} border-gray-200 hover:shadow-md transition-shadow duration-200`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {insight.title}
            </CardTitle>
            <insight.icon className={`h-4 w-4 ${insight.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${insight.color}`}>
              {insight.value}
            </div>
            {insight.subValue && (
              <div className="text-sm text-gray-600 mt-1">
                {insight.subValue}
              </div>
            )}
            <p className="text-xs text-gray-600 mt-2">
              {insight.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

FinancialInsights.displayName = 'FinancialInsights';

export default FinancialInsights;
