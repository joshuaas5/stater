import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { getTransactions } from '@/utils/localStorage';
import { Transaction } from '@/types';

interface ChartData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

interface CategoryData {
  name: string;
  value: number;
}

const ModernCharts: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [selectedChart, setSelectedChart] = useState<'trend' | 'categories' | 'comparison'>('trend');

  // CORES CONSISTENTES - APENAS AZUL
  const BLUE_COLORS = {
    primary: '#3b82f6',     // blue-500
    secondary: '#1d4ed8',   // blue-700
    light: '#93c5fd',       // blue-300
    lighter: '#dbeafe',     // blue-100
    income: '#3b82f6',      // blue-500
    expense: '#1d4ed8'      // blue-700
  };

  const PIE_COLORS = [
    '#3b82f6', '#1d4ed8', '#60a5fa', '#2563eb', 
    '#1e40af', '#4f46e5', '#6366f1', '#8b5cf6'
  ]; // Apenas tons de azul

  useEffect(() => {
    const transactions: Transaction[] = getTransactions();
    
    // Agrupar dados por mês dos últimos 6 meses
    const monthlyStats: { [key: string]: { income: number; expenses: number } } = {};
    const categoryStats: { [key: string]: number } = {};

    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      monthlyStats[monthKey] = { income: 0, expenses: 0 };
    }

    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthKey = transactionDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      if (monthlyStats[monthKey]) {
        if (transaction.type === 'income') {
          monthlyStats[monthKey].income += transaction.amount;
        } else {
          monthlyStats[monthKey].expenses += transaction.amount;
          
          // Agrupar por categoria
          const category = transaction.category || 'Outros';
          categoryStats[category] = (categoryStats[category] || 0) + transaction.amount;
        }
      }
    });

    // Converter para array
    const chartData = Object.entries(monthlyStats).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses
    }));

    setMonthlyData(chartData);

    // Converter categorias
    const categoryArray = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    setCategoryData(categoryArray);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-gray-800 dark:text-gray-200 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const ChartCard: React.FC<{ children: React.ReactNode; title: string; className?: string }> = ({ 
    children, 
    title, 
    className = "" 
  }) => (
    <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-200 text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  const renderTrendChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={monthlyData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BLUE_COLORS.primary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={BLUE_COLORS.primary} stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BLUE_COLORS.secondary} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={BLUE_COLORS.secondary} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280" 
          fontSize={10} 
          tick={{ fill: '#6b7280' }}
        />
        <YAxis 
          stroke="#6b7280" 
          fontSize={10} 
          tick={{ fill: '#6b7280' }}
          tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="income"
          stackId="1"
          stroke={BLUE_COLORS.primary}
          fill="url(#incomeGradient)"
          name="Receitas"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          stackId="2"
          stroke={BLUE_COLORS.secondary}
          fill="url(#expenseGradient)"
          name="Despesas"
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderCategoryChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={categoryData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill={BLUE_COLORS.primary}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
          fontSize={10}
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderComparisonChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={monthlyData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280" 
          fontSize={10} 
          tick={{ fill: '#6b7280' }}
        />
        <YAxis 
          stroke="#6b7280" 
          fontSize={10} 
          tick={{ fill: '#6b7280' }}
          tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="income" fill={BLUE_COLORS.primary} name="Receitas" />
        <Bar dataKey="expenses" fill={BLUE_COLORS.secondary} name="Despesas" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-6">
      {/* Seletor de gráfico simplificado */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg p-3 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedChart('trend')}
            className={`p-2 rounded-md text-center transition-all duration-200 ${
              selectedChart === 'trend'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="text-base mb-1">📈</div>
            <div className="text-xs font-medium">Evolução</div>
          </button>
          <button
            onClick={() => setSelectedChart('categories')}
            className={`p-2 rounded-md text-center transition-all duration-200 ${
              selectedChart === 'categories'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="text-base mb-1">🎯</div>
            <div className="text-xs font-medium">Categorias</div>
          </button>
          <button
            onClick={() => setSelectedChart('comparison')}
            className={`p-2 rounded-md text-center transition-all duration-200 ${
              selectedChart === 'comparison'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <div className="text-base mb-1">⚖️</div>
            <div className="text-xs font-medium">Versus</div>
          </button>
        </div>
      </div>

      {/* Gráficos */}
      {selectedChart === 'trend' && (
        <ChartCard title="Evolução Financeira Mensal">
          {renderTrendChart()}
        </ChartCard>
      )}

      {selectedChart === 'categories' && (
        <ChartCard title="Gastos por Categoria">
          {renderCategoryChart()}
        </ChartCard>
      )}

      {selectedChart === 'comparison' && (
        <ChartCard title="Receitas vs Despesas">
          {renderComparisonChart()}
        </ChartCard>
      )}
    </div>
  );
};

export default ModernCharts;