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
import { formatCurrency } from '@/utils/dataProcessing';
import { Transaction } from '@/types';

// CSS para scrollbar customizada
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }
`;

// Injetar os estilos
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = customScrollbarStyles;
  document.head.appendChild(styleElement);
}

interface ChartData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
  savings: number;
}

interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

// Tooltip customizado mais moderno
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="text-gray-800 font-semibold text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
            </div>
            <span className="font-semibold text-gray-800">
              R$ {entry.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Cores mais modernas
const BLUE_COLORS = {
  primary: '#3b82f6',
  secondary: '#06b6d4',
  accent: '#8b5cf6',
  light: '#60a5fa',
  dark: '#1d4ed8'
};

export default function ModernCharts() {
  const [selectedChart, setSelectedChart] = useState<'trend' | 'categories' | 'comparison'>('trend');
  const [monthlyData, setMonthlyData] = useState<ChartData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

  useEffect(() => {
    const transactions = getTransactions();
    
    // Processar dados mensais
    const monthlyMap = new Map<string, { income: number; expenses: number; balance: number; savings: number }>();
    
    transactions.forEach((transaction: Transaction) => {
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { income: 0, expenses: 0, balance: 0, savings: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey)!;
      const amount = Math.abs(transaction.amount);
      
      if (transaction.type === 'income') {
        monthData.income += amount;
      } else {
        monthData.expenses += amount;
      }
      monthData.balance = monthData.income - monthData.expenses;
      monthData.savings = Math.max(0, monthData.balance * 0.1); // 10% de economia
    });

    const processedMonthlyData = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .sort((a, b) => {
        const aDate = new Date(a.month);
        const bDate = new Date(b.month);
        return aDate.getTime() - bDate.getTime();
      })
      .slice(-6);

    setMonthlyData(processedMonthlyData);

    // Processar dados por categoria (apenas despesas)
    const categoryMap = new Map<string, number>();
    
    transactions.forEach((transaction: Transaction) => {
      if (transaction.type === 'expense') {
        const category = transaction.category || 'Outros';
        const currentValue = categoryMap.get(category) || 0;
        categoryMap.set(category, currentValue + Math.abs(transaction.amount));
      }
    });

    const totalExpenses = Array.from(categoryMap.values()).reduce((sum, value) => sum + value, 0);
    
    const processedCategoryData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    setCategoryData(processedCategoryData);
  }, []);

  const renderTrendChart = () => {
    if (monthlyData.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Sem dados financeiros</h3>
          <p className="text-gray-500">Adicione transações para visualizar o crescimento</p>
        </div>
      );
    }

    const maxIncome = Math.max(...monthlyData.map(d => d.income), 0);
    const maxExpenses = Math.max(...monthlyData.map(d => d.expenses), 0);
    const maxBalance = Math.max(...monthlyData.map(d => d.balance), 0);
    const totalGrowth = monthlyData.length >= 2 
      ? ((monthlyData[monthlyData.length - 1].balance - monthlyData[0].balance) / Math.abs(monthlyData[0].balance || 1)) * 100
      : 0;

    return (
      <div className="space-y-6">
        {/* Gráfico principal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="text-center mb-6">
            <h4 className="text-lg font-bold text-gray-800 mb-1">📈 Evolução Financeira</h4>
            <p className="text-gray-600 text-sm">Crescimento mensal das suas finanças</p>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280" 
                fontSize={11}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#6b7280" 
                fontSize={11}
                tick={{ fill: '#6b7280' }}
                tickFormatter={(value) => value >= 1000 ? `R$${(value/1000).toFixed(0)}k` : `R$${value}`}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#3b82f6" 
                strokeWidth={3}
                fill="url(#balanceGradient)" 
                name="Saldo"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderCategoryChart = () => {
    if (categoryData.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Nenhuma despesa encontrada</h3>
          <p className="text-gray-500">Adicione algumas transações para ver a análise por categorias</p>
        </div>
      );
    }

    const totalValue = categoryData.reduce((sum, item) => sum + item.value, 0);
    const CATEGORY_COLORS = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];

    return (
      <div className="space-y-6">
        {/* Container principal com fundo branco */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gráfico de pizza */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="text-center mb-4">
              <h4 className="text-lg font-bold text-gray-800 mb-1">💰 Distribuição de Gastos</h4>
              <p className="text-gray-600 text-sm">Visualização por categorias</p>
            </div>
            
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={40}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      stroke="white"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    'Valor gasto'
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    color: '#374151'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Valor total central */}
            <div className="text-center mt-4">
              <div className="text-sm text-gray-600">Total Gasto</div>
              <div className="text-2xl font-bold text-gray-800">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Lista de categorias */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>📊</span>
              Detalhamento por Categoria
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const topCategory = categoryData[0];
                const secondCategory = categoryData[1];
                const avgSpending = totalValue / categoryData.length;
                
                return (
                  <>
                    {/* Top categoria */}
                    <div className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🏆</span>
                        <span className="text-gray-800 font-semibold">Maior Gasto</span>
                      </div>
                      <p className="text-gray-700 text-sm mb-1">
                        <strong className="text-amber-600">{topCategory?.name}</strong>
                      </p>
                      <p className="text-gray-600 text-xs">
                        {((topCategory?.value || 0) / totalValue * 100).toFixed(1)}% do total
                      </p>
                    </div>

                    {/* Segunda categoria */}
                    {secondCategory && (
                      <div className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🥈</span>
                          <span className="text-gray-800 font-semibold">Segundo Lugar</span>
                        </div>
                        <p className="text-gray-700 text-sm mb-1">
                          <strong className="text-blue-600">{secondCategory.name}</strong>
                        </p>
                        <p className="text-gray-600 text-xs">
                          {((secondCategory.value || 0) / totalValue * 100).toFixed(1)}% do total
                        </p>
                      </div>
                    )}

                    {/* Estatísticas */}
                    <div className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">📊</span>
                        <span className="text-gray-800 font-semibold">Média</span>
                      </div>
                      <p className="text-gray-700 text-sm mb-1">
                        <strong className="text-green-600">R$ {avgSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </p>
                      <p className="text-gray-600 text-xs">
                        por categoria
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            
            {/* Dicas inteligentes */}
            <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💡</span>
                <span className="text-gray-800 font-semibold">Dica Inteligente</span>
              </div>
              <p className="text-gray-700 text-sm">
                {(() => {
                  const topCategory = categoryData[0];
                  const topPercentage = ((topCategory?.value || 0) / totalValue * 100);
                  
                  if (topPercentage > 40) {
                    return `Sua categoria "${topCategory?.name}" representa ${topPercentage.toFixed(1)}% dos gastos. Considere revisar esses gastos para otimizar seu orçamento.`;
                  } else if (categoryData.length > 5) {
                    return `Você tem ${categoryData.length} categorias ativas. Considere consolidar algumas para um controle mais eficiente.`;
                  } else {
                    return `Sua distribuição de gastos está bem equilibrada entre ${categoryData.length} categorias. Continue monitorando!`;
                  }
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

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

      {/* Container dos gráficos */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {selectedChart === 'trend' && renderTrendChart()}
          {selectedChart === 'categories' && renderCategoryChart()}
          {selectedChart === 'comparison' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <h4 className="text-lg font-bold text-gray-800 mb-1">⚖️ Receitas vs Despesas</h4>
                <p className="text-gray-600 text-sm">Comparação mensal</p>
              </div>
              {renderComparisonChart()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
