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
  Bar,
  Legend
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

  // CORES CONTRASTANTES - VERDE PARA RECEITAS E VERMELHO PARA DESPESAS
  const BLUE_COLORS = {
    primary: '#10b981',     // green-500 - para receitas
    secondary: '#ef4444',   // red-500 - para despesas  
    light: '#6ee7b7',       // green-300
    lighter: '#d1fae5',     // green-100
    income: '#10b981',      // green-500 - receitas em verde
    expense: '#ef4444'      // red-500 - despesas em vermelho
  };

  const PIE_COLORS = [
    '#10b981', '#ef4444', '#34d399', '#f87171', 
    '#059669', '#dc2626', '#6ee7b7', '#fca5a5'
  ]; // Tons de verde e vermelho contrastantes

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

  const ChartCard: React.FC<{ children: React.ReactNode; title: string; description?: string; className?: string }> = ({ 
    children, 
    title, 
    description,
    className = "" 
  }) => (
    <Card className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-200 text-lg font-semibold">{title}</CardTitle>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );

  // Gráfico de evolução mais claro: AreaChart com gradiente
  const renderTrendChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BLUE_COLORS.income} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={BLUE_COLORS.income} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BLUE_COLORS.expense} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={BLUE_COLORS.expense} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis 
          dataKey="month" 
          stroke="#6b7280" 
          fontSize={12} 
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#6b7280' }}
        />
        <YAxis 
          stroke="#6b7280" 
          fontSize={12} 
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
          tick={{ fill: '#6b7280' }}
          width={50}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', 
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <Legend verticalAlign="top" height={36} iconType="circle"/>
        <Area type="monotone" dataKey="income" name="Receitas" stroke={BLUE_COLORS.income} fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
        <Area type="monotone" dataKey="expenses" name="Despesas" stroke={BLUE_COLORS.expense} fillOpacity={1} fill="url(#colorExpense)" strokeWidth={2} />
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
        <ChartCard 
          title="📈 Evolução Financeira Mensal" 
          description="Acompanhe o crescimento das suas receitas e despesas ao longo dos últimos 6 meses. As áreas mostram o volume financeiro e as tendências de cada categoria."
        >
          {renderTrendChart()}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: BLUE_COLORS.primary }}></div>
              <span className="text-gray-600 dark:text-gray-400">Receitas (Entradas de dinheiro)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: BLUE_COLORS.secondary }}></div>
              <span className="text-gray-600 dark:text-gray-400">Despesas (Saídas de dinheiro)</span>
            </div>
          </div>
        </ChartCard>
      )}

      {selectedChart === 'categories' && (
        <ChartCard 
          title="🎯 Distribuição de Gastos por Categoria"
          description="Visualize onde seu dinheiro é mais gasto. Cada fatia representa uma categoria de despesa com sua respectiva porcentagem do total."
        >
          {renderCategoryChart()}
          <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Cada cor representa uma categoria diferente de gasto.</p>
            <p>Os percentuais mostram a proporção de cada categoria no total de despesas.</p>
          </div>
        </ChartCard>
      )}

      {selectedChart === 'comparison' && (
        <ChartCard 
          title="⚖️ Comparativo: Receitas vs Despesas"
          description="Compare mês a mês suas entradas e saídas de dinheiro. Barras azuis mais altas que as escuras indicam meses lucrativos."
        >
          {renderComparisonChart()}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: BLUE_COLORS.primary }}></div>
              <span className="text-gray-600 dark:text-gray-400">Receitas - Dinheiro que entrou</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: BLUE_COLORS.secondary }}></div>
              <span className="text-gray-600 dark:text-gray-400">Despesas - Dinheiro que saiu</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Dica:</strong> Quando a barra azul clara (receitas) for maior que a azul escura (despesas), você teve lucro no mês!
          </div>
        </ChartCard>
      )}
    </div>
  );
};

export default ModernCharts;