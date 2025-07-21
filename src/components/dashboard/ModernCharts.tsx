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

  // Gráfico de evolução financeira inspirado em psicologia financeira
  const renderTrendChart = () => {
    const maxValue = Math.max(
      ...monthlyData.map(d => Math.max(d.income, d.expenses))
    );

    // Análise comportamental dos dados
    const behavioralAnalysis = monthlyData.map((data, index) => {
      const balance = data.income - data.expenses;
      const spendingRatio = data.expenses / (data.income || 1);
      
      let emotionalState = 'equilibrado';
      let financialWellness = 50;
      
      if (balance > 1000) {
        emotionalState = 'disciplinado';
        financialWellness = 85;
      } else if (balance > 0) {
        emotionalState = 'controlado';
        financialWellness = 70;
      } else if (balance > -500) {
        emotionalState = 'atento';
        financialWellness = 40;
      } else {
        emotionalState = 'preocupado';
        financialWellness = 25;
      }
      
      return {
        ...data,
        balance,
        spendingRatio,
        emotionalState,
        financialWellness,
        category: balance > 500 ? 'Poupador' : balance > 0 ? 'Equilibrado' : 'Gastador'
      };
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const data = behavioralAnalysis.find(item => item.month === label);
        if (!data) return null;
        
        return (
          <div className="bg-black/80 backdrop-blur-xl p-5 rounded-xl border-2 border-blue-400/50 shadow-2xl">
            <p className="text-blue-400 font-bold text-lg mb-3">{`📅 ${label} - Perfil Financeiro`}</p>
            <div className="space-y-2">
              <p className="text-green-400 flex items-center gap-2">
                <span>💰</span>
                {`Receitas: R$ ${data.income.toLocaleString('pt-BR')}`}
              </p>
              <p className="text-red-400 flex items-center gap-2">
                <span>💸</span>
                {`Despesas: R$ ${data.expenses.toLocaleString('pt-BR')}`}
              </p>
              <p className={`${data.balance >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center gap-2`}>
                <span>⚖️</span>
                {`Saldo: R$ ${data.balance.toLocaleString('pt-BR')}`}
              </p>
              <hr className="border-gray-600 my-2"/>
              <p className="text-yellow-400 flex items-center gap-2">
                <span>😊</span>
                {`Estado: ${data.emotionalState}`}
              </p>
              <p className="text-orange-400 flex items-center gap-2">
                <span>🧠</span>
                {`Bem-estar: ${data.financialWellness}%`}
              </p>
              <p className="text-purple-400 flex items-center gap-2">
                <span>🎯</span>
                {`Perfil: ${data.category}`}
              </p>
            </div>
          </div>
        );
      }
      return null;
    };

    const getEmotionalColor = (state: string) => {
      const colors: { [key: string]: string } = {
        'disciplinado': '#10b981',
        'controlado': '#3b82f6', 
        'equilibrado': '#06b6d4',
        'atento': '#f59e0b',
        'preocupado': '#ef4444'
      };
      return colors[state] || '#6b7280';
    };

    return (
      <div className="relative space-y-6">
        {/* Background com gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-800/5 rounded-xl"></div>
        
        <div className="relative space-y-6">
          {/* Header com glassmorphism */}
          <div className="text-center bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4">
            <h1 className="text-2xl font-bold text-white drop-shadow-lg mb-2">
              🧠 Psicologia dos Seus Gastos
            </h1>
            <p className="text-white/70">
              Análise Comportamental Baseada em Inteligência Financeira
            </p>
          </div>

          {/* Métricas principais com glassmorphism */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-green-400/30 p-4 hover:bg-white/15 transition-all">
              <div className="text-green-400 font-semibold text-sm mb-1 flex items-center gap-2">
                <span>💰</span>
                Total Receitas
              </div>
              <div className="text-2xl font-bold text-white drop-shadow-sm">
                R$ {monthlyData.reduce((sum, d) => sum + d.income, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
              <div className="text-xs text-green-300 mt-1">Últimos 6 meses</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-red-400/30 p-4 hover:bg-white/15 transition-all">
              <div className="text-red-400 font-semibold text-sm mb-1 flex items-center gap-2">
                <span>💸</span>
                Total Despesas
              </div>
              <div className="text-2xl font-bold text-white drop-shadow-sm">
                R$ {monthlyData.reduce((sum, d) => sum + d.expenses, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
              <div className="text-xs text-red-300 mt-1">Últimos 6 meses</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-blue-400/30 p-4 hover:bg-white/15 transition-all">
              <div className="text-blue-400 font-semibold text-sm mb-1 flex items-center gap-2">
                <span>⚖️</span>
                Saldo Total
              </div>
              <div className={`text-2xl font-bold drop-shadow-sm ${monthlyData.reduce((sum, d) => sum + d.balance, 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                R$ {monthlyData.reduce((sum, d) => sum + d.balance, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
              </div>
              <div className="text-xs text-blue-300 mt-1">Lucro/Prejuízo</div>
            </div>
          </div>

          {/* Gráfico principal com glassmorphism */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2 drop-shadow-sm">
              <span>📊</span>
              Evolução Comportamental dos Gastos
            </h3>
            
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={behavioralAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                <defs>
                  <linearGradient id="incomeGradientNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="50%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="expenseGradientNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="50%" stopColor="#ef4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af" 
                  fontSize={12}
                  tick={{ fill: '#e5e7eb' }}
                />
                
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={11}
                  tickFormatter={(value) => value >= 1000 ? `R$${(value/1000).toFixed(0)}k` : `R$${value}`}
                  tick={{ fill: '#e5e7eb' }}
                  width={60}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                {/* Áreas de receitas e despesas */}
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="url(#incomeGradientNew)"
                  strokeWidth={3}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stackId="2"
                  stroke="#ef4444" 
                  fill="url(#expenseGradientNew)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Timeline emocional */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h3 className="text-white font-bold text-xl mb-4 flex items-center gap-2 drop-shadow-sm">
              <span>😊</span>
              Estados Emocionais vs Gastos
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {behavioralAnalysis.map((data, index) => {
                const total = data.income + data.expenses;
                return (
                  <div key={index} className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/30"
                          style={{ backgroundColor: getEmotionalColor(data.emotionalState) }}
                        ></div>
                        <div>
                          <p className="text-white font-semibold drop-shadow-sm">{data.month}</p>
                          <p className="text-white/70 text-sm">{data.emotionalState}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-white/90 font-mono text-sm">
                        R$ {data.balance.toLocaleString('pt-BR')}
                      </p>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${data.financialWellness > 70 ? 'bg-green-400' : data.financialWellness > 50 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                        <p className="text-white/60 text-xs">{data.financialWellness}% bem-estar</p>
                      </div>
                      <p className="text-white/50 text-xs">{data.category}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights de IA com glassmorphism */}
          <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl p-6 border border-indigo-400/30">
            <div className="flex items-center mb-4">
              <span className="text-3xl mr-3">🤖</span>
              <h3 className="text-indigo-300 font-bold text-xl drop-shadow-sm">Insights da IA Comportamental</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(() => {
                const totalIncome = monthlyData.reduce((sum, d) => sum + d.income, 0);
                const totalExpenses = monthlyData.reduce((sum, d) => sum + d.expenses, 0);
                const avgBalance = behavioralAnalysis.reduce((sum, d) => sum + d.balance, 0) / behavioralAnalysis.length;
                const positiveMonths = behavioralAnalysis.filter(d => d.balance > 0).length;
                const avgWellness = behavioralAnalysis.reduce((sum, d) => sum + d.financialWellness, 0) / behavioralAnalysis.length;
                
                return (
                  <>
                    <div className="space-y-3">
                      <p className="text-white/90 flex items-start gap-2">
                        <span className="text-yellow-400 text-lg">💡</span>
                        <span><strong>Padrão Identificado:</strong> Você teve {positiveMonths} meses positivos nos últimos 6 meses</span>
                      </p>
                      <p className="text-white/90 flex items-start gap-2">
                        <span className="text-green-400 text-lg">📈</span>
                        <span><strong>Bem-estar Médio:</strong> {avgWellness.toFixed(0)}% - {avgWellness > 70 ? 'Excelente controle!' : avgWellness > 50 ? 'Bom controle' : 'Precisa melhorar'}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-white/90 flex items-start gap-2">
                        <span className="text-purple-400 text-lg">🎯</span>
                        <span><strong>Saldo Médio:</strong> R$ {avgBalance.toLocaleString('pt-BR')} por mês</span>
                      </p>
                      <p className="text-white/90 flex items-start gap-2">
                        <span className="text-cyan-400 text-lg">🧠</span>
                        <span><strong>Dica Neural:</strong> {totalIncome > totalExpenses ? 'Continue mantendo esse padrão positivo!' : 'Foque em reduzir gastos impulsivos'}</span>
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryChart = () => {
    if (categoryData.length === 0) {
      return (
        <div className="relative overflow-hidden">
          {/* Background com gradiente */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-800/20 rounded-xl"></div>
          
          {/* Glassmorphism container */}
          <div className="relative bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-12 text-center">
            <div className="text-6xl mb-4 filter drop-shadow-lg">📊</div>
            <h3 className="text-xl font-semibold text-white mb-3 drop-shadow-sm">Nenhuma despesa encontrada</h3>
            <p className="text-white/70">Adicione algumas transações para ver a análise por categorias</p>
          </div>
        </div>
      );
    }

    const totalValue = categoryData.reduce((sum, item) => sum + item.value, 0);
    const CATEGORY_COLORS = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];

    return (
      <div className="relative space-y-6">
        {/* Background animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-800/10 rounded-xl animate-pulse"></div>
        
        <div className="relative space-y-6">
          {/* Container principal com glassmorphism */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Gráfico de pizza com glassmorphism */}
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 shadow-2xl">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-white drop-shadow-sm">💰 Distribuição de Gastos</h4>
                  <p className="text-white/70 text-sm">Visualização por categorias</p>
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
                          stroke="rgba(255,255,255,0.3)"
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
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        color: 'white'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Valor total central */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-xs text-white/60">Total Gasto</div>
                  <div className="text-lg font-bold text-white drop-shadow-sm">
                    R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            </div>

            {/* Lista detalhada com glassmorphism */}
            <div className="space-y-3">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 shadow-2xl">
                <h4 className="font-bold text-white mb-4 drop-shadow-sm flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  Detalhamento Inteligente
                </h4>
                
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {categoryData.map((category, index) => {
                    const percentage = (category.value / totalValue) * 100;
                    const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
                    
                    return (
                      <div key={category.name} className="group relative">
                        {/* Glassmorphism card para cada categoria */}
                        <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div 
                                className="w-4 h-4 rounded-full border-2 border-white/30 shadow-lg"
                                style={{ backgroundColor: color }}
                              />
                              <span className="font-semibold text-white drop-shadow-sm">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-white drop-shadow-sm">
                                {percentage.toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          
                          {/* Barra de progresso glassmorphism */}
                          <div className="mb-2">
                            <div className="bg-white/10 backdrop-blur-sm rounded-full h-2 overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-700 shadow-sm"
                                style={{ 
                                  width: `${percentage}%`,
                                  background: `linear-gradient(90deg, ${color}, ${color}dd)`
                                }}
                              />
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-white/70 text-sm">Valor gasto</span>
                            <span className="text-lg font-bold text-white drop-shadow-sm">
                              R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Insights inteligentes com glassmorphism */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6 shadow-2xl">
            <h4 className="font-bold text-white mb-4 drop-shadow-sm flex items-center gap-2">
              <span className="text-xl">🧠</span>
              Insights Inteligentes
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                const topCategory = categoryData[0];
                const secondCategory = categoryData[1];
                const smallCategories = categoryData.filter(cat => (cat.value / totalValue) * 100 < 5).length;
                const avgSpending = totalValue / categoryData.length;
                
                return (
                  <>
                    {/* Top categoria */}
                    <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">🏆</span>
                        <span className="text-white font-semibold drop-shadow-sm">Maior Gasto</span>
                      </div>
                      <p className="text-white/80 text-sm mb-1">
                        <strong className="text-yellow-300">{topCategory?.name}</strong>
                      </p>
                      <p className="text-white/60 text-xs">
                        {((topCategory?.value || 0) / totalValue * 100).toFixed(1)}% do total
                      </p>
                    </div>

                    {/* Segunda categoria */}
                    {secondCategory && (
                      <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">🥈</span>
                          <span className="text-white font-semibold drop-shadow-sm">Segundo Lugar</span>
                        </div>
                        <p className="text-white/80 text-sm mb-1">
                          <strong className="text-blue-300">{secondCategory.name}</strong>
                        </p>
                        <p className="text-white/60 text-xs">
                          {((secondCategory.value || 0) / totalValue * 100).toFixed(1)}% do total
                        </p>
                      </div>
                    )}

                    {/* Estatísticas */}
                    <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">�</span>
                        <span className="text-white font-semibold drop-shadow-sm">Média</span>
                      </div>
                      <p className="text-white/80 text-sm mb-1">
                        <strong className="text-green-300">R$ {avgSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
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
            <div className="mt-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-4 border border-blue-400/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">💡</span>
                <span className="text-white font-semibold drop-shadow-sm">Dica Inteligente</span>
              </div>
              <p className="text-white/90 text-sm">
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

      {/* Gráficos */}
      {selectedChart === 'trend' && (
        <ChartCard 
          title="📈 Evolução Financeira Inteligente" 
          description="Análise completa das suas finanças com métricas, gráficos e insights automáticos para você entender melhor seus padrões de receitas e despesas."
        >
          {renderTrendChart()}
        </ChartCard>
      )}

      {selectedChart === 'categories' && (
        <ChartCard 
          title="🎯 Análise Detalhada de Categorias"
          description="Visualização completa de onde seu dinheiro é gasto, com gráfico interativo, lista detalhada e insights inteligentes sobre seus padrões de consumo."
        >
          {renderCategoryChart()}
        </ChartCard>
      )}

      {selectedChart === 'comparison' && (
        <ChartCard 
          title="⚖️ Comparativo: Receitas vs Despesas"
          description="Compare mês a mês suas entradas e saídas de dinheiro. Barras verdes mais altas que as vermelhas indicam meses lucrativos."
        >
          {renderComparisonChart()}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: BLUE_COLORS.income }}></div>
              <span className="text-gray-600 dark:text-gray-400">💰 Receitas - Dinheiro que entrou</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: BLUE_COLORS.expense }}></div>
              <span className="text-gray-600 dark:text-gray-400">💸 Despesas - Dinheiro que saiu</span>
            </div>
          </div>
          <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Dica:</strong> Quando a barra verde (receitas) for maior que a vermelha (despesas), você teve lucro no mês!
          </div>
        </ChartCard>
      )}
    </div>
  );
};

export default ModernCharts;