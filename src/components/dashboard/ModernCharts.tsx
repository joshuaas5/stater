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

// Tooltip customizado com glassmorphism e identidade visual
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div 
        className="rounded-lg border p-3 shadow-xl"
        style={{
          background: 'rgba(49, 81, 139, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(20px)',
          color: '#ffffff'
        }}
      >
        <p 
          className="font-semibold text-sm mb-2"
          style={{
            color: '#ffffff',
            fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
          }}
        >
          {label}
        </p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span 
                style={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
                }}
              >
                {entry.name}:
              </span>
            </div>
            <span 
              className="font-semibold"
              style={{
                color: '#ffffff',
                fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
              }}
            >
              R$ {entry.value?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Cores da identidade visual do app
const APP_COLORS = {
  primary: '#31518b',
  secondary: '#ffffff',
  accent: '#3b82f6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b'
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
        <div 
          className="rounded-lg border p-6 shadow-xl"
          style={{
            background: 'rgba(49, 81, 139, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <div className="text-center mb-6">
            <h4 
              className="text-lg font-bold mb-1"
              style={{
                color: '#ffffff',
                fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
              }}
            >
              📈 Evolução Financeira
            </h4>
            <p 
              className="text-sm"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
              }}
            >
              Crescimento mensal das suas finanças
            </p>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={monthlyData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
              <XAxis 
                dataKey="month" 
                stroke="rgba(255, 255, 255, 0.7)" 
                fontSize={11}
                tick={{ 
                  fill: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
                }}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.7)" 
                fontSize={11}
                tick={{ 
                  fill: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
                }}
                tickFormatter={(value) => value >= 1000 ? `R$${(value/1000).toFixed(0)}k` : `R$${value}`}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#ffffff" 
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
        <div 
          className="text-center py-12 rounded-lg border"
          style={{
            background: 'rgba(49, 81, 139, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <div className="text-6xl mb-4">📊</div>
          <h3 
            className="text-xl font-semibold mb-3"
            style={{
              color: '#ffffff',
              fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
            }}
          >
            Nenhuma despesa encontrada
          </h3>
          <p 
            style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
            }}
          >
            Adicione algumas transações para ver a análise por categorias
          </p>
        </div>
      );
    }

    const totalValue = categoryData.reduce((sum, item) => sum + item.value, 0);
    
    // Cores vibrantes e distintas para cada categoria
    const CATEGORY_COLORS = [
      '#ef4444', // Vermelho vibrante
      '#f97316', // Laranja
      '#eab308', // Amarelo
      '#22c55e', // Verde
      '#06b6d4', // Ciano
      '#3b82f6', // Azul
      '#8b5cf6', // Roxo
      '#ec4899', // Rosa
      '#14b8a6', // Teal
      '#f43f5e'  // Rose
    ];

    return (
      <div className="space-y-6">
        {/* Container principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Gráfico de pizza revolucionado */}
          <div 
            className="rounded-2xl border p-6 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9))',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="text-center mb-6">
              <h4 
                className="text-xl font-bold mb-2 flex items-center justify-center gap-2"
                style={{
                  color: '#ffffff',
                  fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
                }}
              >
                <span className="text-2xl">🎯</span>
                Distribuição de Gastos
              </h4>
              <p 
                className="text-sm font-medium"
                style={{
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
                }}
              >
                Onde seu dinheiro está indo
              </p>
            </div>
            
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <defs>
                  {CATEGORY_COLORS.map((color, index) => (
                    <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={1}/>
                      <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
                    </linearGradient>
                  ))}
                  <filter id="pieGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  innerRadius={55}
                  paddingAngle={4}
                  dataKey="value"
                  filter="url(#pieGlow)"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#pieGradient-${index % CATEGORY_COLORS.length})`}
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth={2}
                      style={{ filter: `drop-shadow(0 0 8px ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}50)` }}
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    name
                  ]}
                  contentStyle={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(20px)',
                    color: '#ffffff',
                    fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Valor total central com destaque */}
            <div 
              className="text-center mt-4 p-4 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <div 
                className="text-xs font-semibold uppercase tracking-wider mb-1"
                style={{
                  color: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
                }}
              >
                Total Gasto
              </div>
              <div 
                className="text-3xl font-black"
                style={{
                  background: 'linear-gradient(135deg, #fff, #a5b4fc)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
                }}
              >
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            
            {/* Legenda colorida das categorias */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {categoryData.slice(0, 6).map((item, index) => (
                <div 
                  key={item.name}
                  className="flex items-center gap-2 p-2 rounded-lg transition-all hover:scale-105"
                  style={{
                    background: `${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}15`,
                    border: `1px solid ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}40`
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ 
                      background: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                      boxShadow: `0 0 8px ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}80`
                    }}
                  />
                  <span className="text-xs text-white/90 font-medium truncate">{item.name}</span>
                  <span 
                    className="text-xs font-bold ml-auto"
                    style={{ color: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                  >
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lista de categorias */}
          <div 
            className="rounded-lg border p-6 shadow-xl"
            style={{
              background: 'rgba(49, 81, 139, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <h4 
              className="text-lg font-bold mb-4 flex items-center gap-2"
              style={{
                color: '#ffffff',
                fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
              }}
            >
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
                    <div 
                      className="rounded-lg p-4 transition-all hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🏆</span>
                        <span className="text-white font-semibold text-sm">Maior Gasto</span>
                      </div>
                      <p className="text-white text-sm mb-1">
                        <strong className="text-amber-400">{topCategory?.name}</strong>
                      </p>
                      <p className="text-white/60 text-xs">
                        {((topCategory?.value || 0) / totalValue * 100).toFixed(1)}% do total
                      </p>
                    </div>

                    {/* Segunda categoria */}
                    {secondCategory && (
                      <div 
                        className="rounded-lg p-4 transition-all hover:scale-105"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.15)'
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🥈</span>
                          <span className="text-white font-semibold text-sm">Segundo Lugar</span>
                        </div>
                        <p className="text-white text-sm mb-1">
                          <strong className="text-blue-400">{secondCategory.name}</strong>
                        </p>
                        <p className="text-white/60 text-xs">
                          {((secondCategory.value || 0) / totalValue * 100).toFixed(1)}% do total
                        </p>
                      </div>
                    )}

                    {/* Estatísticas */}
                    <div 
                      className="rounded-lg p-4 transition-all hover:scale-105"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.15)'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">📊</span>
                        <span className="text-white font-semibold text-sm">Média</span>
                      </div>
                      <p className="text-white text-sm mb-1">
                        <strong className="text-emerald-400">R$ {avgSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </p>
                      <p className="text-white/60 text-xs">
                        por categoria
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
            
            {/* Dicas inteligentes */}
            <div 
              className="mt-4 rounded-lg p-4"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.15))',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💡</span>
                <span className="text-white font-semibold text-sm">Dica Inteligente</span>
              </div>
              <p className="text-white/80 text-sm">
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
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
        <XAxis 
          dataKey="month" 
          stroke="rgba(255, 255, 255, 0.7)" 
          fontSize={10} 
          tick={{ 
            fill: 'rgba(255, 255, 255, 0.7)',
            fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
          }}
        />
        <YAxis 
          stroke="rgba(255, 255, 255, 0.7)" 
          fontSize={10} 
          tick={{ 
            fill: 'rgba(255, 255, 255, 0.7)',
            fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
          }}
          tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="income" fill={APP_COLORS.success} name="Receitas" />
        <Bar dataKey="expenses" fill={APP_COLORS.danger} name="Despesas" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-6">
      {/* Seletor de gráfico com identidade visual */}
      <div 
        className="rounded-lg p-3 shadow-xl border"
        style={{
          background: 'rgba(49, 81, 139, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setSelectedChart('trend')}
            className="p-2 rounded-md text-center transition-all duration-200"
            style={{
              background: selectedChart === 'trend' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
              color: selectedChart === 'trend' ? '#31518b' : '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
            }}
          >
            <div className="text-base mb-1">📈</div>
            <div className="text-xs font-medium">Evolução</div>
          </button>
          <button
            onClick={() => setSelectedChart('categories')}
            className="p-2 rounded-md text-center transition-all duration-200"
            style={{
              background: selectedChart === 'categories' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
              color: selectedChart === 'categories' ? '#31518b' : '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
            }}
          >
            <div className="text-base mb-1">🎯</div>
            <div className="text-xs font-medium">Categorias</div>
          </button>
          <button
            onClick={() => setSelectedChart('comparison')}
            className="p-2 rounded-md text-center transition-all duration-200"
            style={{
              background: selectedChart === 'comparison' ? '#ffffff' : 'rgba(255, 255, 255, 0.1)',
              color: selectedChart === 'comparison' ? '#31518b' : '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
            }}
          >
            <div className="text-base mb-1">⚖️</div>
            <div className="text-xs font-medium">Versus</div>
          </button>
        </div>
      </div>

      {/* Container dos gráficos */}
      <Card 
        className="overflow-hidden shadow-xl"
        style={{
          background: 'rgba(49, 81, 139, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <CardContent className="p-0">
          {selectedChart === 'trend' && renderTrendChart()}
          {selectedChart === 'categories' && renderCategoryChart()}
          {selectedChart === 'comparison' && (
            <div className="p-6">
              <div className="text-center mb-6">
                <h4 
                  className="text-lg font-bold mb-1"
                  style={{
                    color: '#ffffff',
                    fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
                  }}
                >
                  ⚖️ Receitas vs Despesas
                </h4>
                <p 
                  className="text-sm"
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
                  }}
                >
                  Comparação mensal
                </p>
              </div>
              {renderComparisonChart()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
