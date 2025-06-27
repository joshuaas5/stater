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
  color: string;
}

const ModernCharts: React.FC = () => {
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [selectedChart, setSelectedChart] = useState<'trend' | 'categories' | 'comparison'>('trend');

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
          
          // Agrupar por categoria para o gráfico de pizza
          const category = transaction.category || 'Outros';
          categoryStats[category] = (categoryStats[category] || 0) + transaction.amount;
        }
      }
    });

    // Converter para array para os gráficos
    const chartData = Object.entries(monthlyStats).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses
    }));

    setMonthlyData(chartData);

    // Converter categorias para o gráfico de pizza
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#a8edea', '#764ba2', '#f5576c'];
    const categoryArray = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }));

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
        <div className="bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/20 shadow-xl">
          <p className="text-white font-medium">{label}</p>
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
    <Card className={`relative overflow-hidden border-0 bg-gradient-to-br backdrop-blur-xl shadow-2xl ${className}`}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          backgroundColor: '#3b82f6'
        }}
      />
      <CardHeader className="relative">
        <CardTitle className="text-white text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="relative">
        {children}
      </CardContent>
    </Card>
  );

  const renderTrendChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={monthlyData}>
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#43e97b" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#43e97b" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f093fb" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#f093fb" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" fontSize={12} />
        <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="income"
          name="Receitas"
          stroke="#43e97b"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#incomeGradient)"
        />
        <Area
          type="monotone"
          dataKey="expenses"
          name="Despesas"
          stroke="#f093fb"
          strokeWidth={3}
          fillOpacity={1}
          fill="url(#expenseGradient)"
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
          outerRadius={100}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {categoryData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderComparisonChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={monthlyData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="month" stroke="rgba(255,255,255,0.7)" fontSize={12} />
        <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} tickFormatter={(value) => `R$ ${(value/1000).toFixed(0)}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="income"
          name="Receitas"
          fill="url(#incomeBarGradient)"
          radius={[4, 4, 0, 0]}
        />
        <Bar
          dataKey="expenses"
          name="Despesas"
          fill="url(#expenseBarGradient)"
          radius={[4, 4, 0, 0]}
        />
        <defs>
          <linearGradient id="incomeBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#43e97b" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#38f9d7" stopOpacity={0.6}/>
          </linearGradient>
          <linearGradient id="expenseBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f093fb" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#f5576c" stopOpacity={0.6}/>
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-6">
      {/* Seletor de gráficos */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { key: 'trend', label: 'Evolução Temporal' },
          { key: 'categories', label: 'Por Categoria' },
          { key: 'comparison', label: 'Comparativo Mensal' }
        ].map((option) => (
          <button
            key={option.key}
            onClick={() => setSelectedChart(option.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 backdrop-blur-md border ${
              selectedChart === option.key
                ? 'bg-white/20 text-white border-white/40 shadow-lg'
                : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/15'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Gráfico selecionado */}
      {selectedChart === 'trend' && (
        <ChartCard title="📈 Evolução das Receitas e Despesas">
          {renderTrendChart()}
        </ChartCard>
      )}

      {selectedChart === 'categories' && (
        <ChartCard title="🎯 Distribuição de Gastos por Categoria">
          {renderCategoryChart()}
        </ChartCard>
      )}

      {selectedChart === 'comparison' && (
        <ChartCard title="⚖️ Comparativo Mensal">
          {renderComparisonChart()}
        </ChartCard>
      )}
    </div>
  );
};

export default ModernCharts;
