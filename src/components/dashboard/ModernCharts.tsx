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

  // Gráfico de evolução financeira totalmente reformulado e inteligente
  const renderTrendChart = () => {
    const maxValue = Math.max(
      ...monthlyData.map(d => Math.max(d.income, d.expenses))
    );

    return (
      <div className="space-y-6">
        {/* Métricas principais */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="text-green-700 font-semibold text-sm">Total Receitas</div>
            <div className="text-2xl font-bold text-green-800">
              R$ {monthlyData.reduce((sum, d) => sum + d.income, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </div>
            <div className="text-xs text-green-600 mt-1">Últimos 6 meses</div>
          </div>
          
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="text-red-700 font-semibold text-sm">Total Despesas</div>
            <div className="text-2xl font-bold text-red-800">
              R$ {monthlyData.reduce((sum, d) => sum + d.expenses, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </div>
            <div className="text-xs text-red-600 mt-1">Últimos 6 meses</div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-700 font-semibold text-sm">Saldo Total</div>
            <div className={`text-2xl font-bold ${monthlyData.reduce((sum, d) => sum + d.balance, 0) >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              R$ {monthlyData.reduce((sum, d) => sum + d.balance, 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </div>
            <div className="text-xs text-blue-600 mt-1">Lucro/Prejuízo</div>
          </div>
        </div>

        {/* Gráfico de barras moderno */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={1}/>
                <stop offset="100%" stopColor="#dc2626" stopOpacity={1}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
            
            <XAxis 
              dataKey="month" 
              stroke="#64748b" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontWeight: 500 }}
            />
            
            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value >= 1000 ? `R$${(value/1000).toFixed(0)}k` : `R$${value}`}
              tick={{ fill: '#64748b' }}
              width={60}
            />
            
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                padding: '12px'
              }}
              formatter={(value: number, name: string) => [
                `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                name === 'income' ? '💰 Receitas' : '💸 Despesas'
              ]}
              labelFormatter={(label) => `📅 ${label}`}
            />
            
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="rect"
              wrapperStyle={{ paddingBottom: '20px' }}
            />
            
            <Bar 
              dataKey="income" 
              name="💰 Receitas"
              fill="url(#incomeGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
            
            <Bar 
              dataKey="expenses" 
              name="💸 Despesas"
              fill="url(#expenseGradient)"
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>

        {/* Análise inteligente */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">📊 Análise Inteligente</h4>
          <div className="space-y-2 text-sm text-gray-600">
            {(() => {
              const totalIncome = monthlyData.reduce((sum, d) => sum + d.income, 0);
              const totalExpenses = monthlyData.reduce((sum, d) => sum + d.expenses, 0);
              const avgIncome = totalIncome / monthlyData.length;
              const avgExpenses = totalExpenses / monthlyData.length;
              const profitableMonths = monthlyData.filter(d => d.balance > 0).length;
              
              return (
                <>
                  <p>• Você teve <strong>{profitableMonths}</strong> meses com saldo positivo dos últimos 6 meses</p>
                  <p>• Sua receita média mensal é de <strong>R$ {avgIncome.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></p>
                  <p>• Seus gastos médios mensais são de <strong>R$ {avgExpenses.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</strong></p>
                  <p>• {totalIncome > totalExpenses ? 
                    `✅ Parabéns! Você economizou R$ ${(totalIncome - totalExpenses).toLocaleString('pt-BR', {minimumFractionDigits: 2})} no período` :
                    `⚠️ Atenção: Você gastou R$ ${(totalExpenses - totalIncome).toLocaleString('pt-BR', {minimumFractionDigits: 2})} a mais do que ganhou`
                  }</p>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  const renderCategoryChart = () => {
    if (categoryData.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhuma despesa encontrada</h3>
          <p className="text-gray-500">Adicione algumas transações para ver a análise por categorias</p>
        </div>
      );
    }

    const totalValue = categoryData.reduce((sum, item) => sum + item.value, 0);
    const CATEGORY_COLORS = [
      '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', 
      '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#84cc16'
    ];

    return (
      <div className="space-y-6">
        {/* Gráfico de pizza responsivo */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  innerRadius={50}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      stroke="#fff"
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
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista detalhada das categorias */}
          <div className="flex-1 space-y-3">
            <h4 className="font-semibold text-gray-800 mb-4">📋 Detalhamento por Categoria</h4>
            {categoryData.map((category, index) => {
              const percentage = (category.value / totalValue) * 100;
              const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
              
              return (
                <div key={category.name} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span className="font-medium text-gray-800">{category.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: color
                        }}
                      />
                    </div>
                    <span className="text-lg font-bold text-gray-800">
                      R$ {category.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estatísticas inteligentes */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-3">🧠 Insights Inteligentes</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 text-sm">
              {(() => {
                const topCategory = categoryData[0];
                const secondCategory = categoryData[1];
                const smallCategories = categoryData.filter(cat => (cat.value / totalValue) * 100 < 5).length;
                
                return (
                  <>
                    <p className="flex items-center gap-2">
                      <span className="text-xl">🏆</span>
                      <span><strong>{topCategory?.name}</strong> é sua maior categoria de gasto ({((topCategory?.value || 0) / totalValue * 100).toFixed(1)}%)</span>
                    </p>
                    
                    {secondCategory && (
                      <p className="flex items-center gap-2">
                        <span className="text-xl">🥈</span>
                        <span><strong>{secondCategory.name}</strong> vem em segundo lugar ({((secondCategory.value || 0) / totalValue * 100).toFixed(1)}%)</span>
                      </p>
                    )}
                    
                    {smallCategories > 0 && (
                      <p className="flex items-center gap-2">
                        <span className="text-xl">📌</span>
                        <span>Você tem <strong>{smallCategories}</strong> categoria(s) com gastos baixos (&lt;5%)</span>
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="bg-white/70 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Gasto médio por categoria</div>
                <div className="text-xl font-bold text-gray-800">
                  R$ {(totalValue / categoryData.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              
              <div className="bg-white/70 p-3 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Total de categorias</div>
                <div className="text-xl font-bold text-gray-800">
                  {categoryData.length} categorias
                </div>
              </div>
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