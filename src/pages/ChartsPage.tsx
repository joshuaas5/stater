import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { isLoggedIn, getTransactions } from '@/utils/localStorage';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, Transaction } from '@/types';
import { formatCurrency } from '@/utils/dataProcessing';
import { getWeeksInMonth } from '@/utils/weekStart';
import { MonthSelector } from '@/components/ui/month-selector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  PieChart as PieChartIcon, 
  BarChart3 as BarChartIcon,
  LineChart as LineChartIcon, 
  Filter, ChevronDown, ChevronUp, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  LineChart, Line, AreaChart, Area
} from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ChartsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeChart, setActiveChart] = useState<'pie' | 'bar' | 'line'>('pie');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('expense');
  const [activeWeekTab, setActiveWeekTab] = useState<string>('all');
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    loadTransactions();
  }, [navigate, selectedMonth, selectedYear]);
  
  const loadTransactions = () => {
    const allTransactions = getTransactions();
    
    const filtered = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === selectedMonth && 
             transactionDate.getFullYear() === selectedYear;
    });
    
    setTransactions(filtered);
  };
  
  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };
  
  const getWeeksInMonth = () => {
    // Generate array of weeks
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    
    const weeks: { label: string; start: Date; end: Date }[] = [];
    let currentWeekStart = new Date(firstDay);
    
    while (currentWeekStart <= lastDay) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekNumber = Math.ceil((currentWeekStart.getDate()) / 7);
      
      weeks.push({
        label: `Semana ${weekNumber}`,
        start: new Date(currentWeekStart),
        end: new Date(Math.min(weekEnd.getTime(), lastDay.getTime()))
      });
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    return weeks;
  };
  
  // Preparar dados para gráficos
  const prepareExpensesByCategory = () => {
    const expensesByCategory: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = transaction.category || 'Sem categoria';
        if (!expensesByCategory[category]) {
          expensesByCategory[category] = 0;
        }
        expensesByCategory[category] += transaction.amount;
      });
    
    return Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  const prepareIncomeByCategory = () => {
    const incomeByCategory: Record<string, number> = {};
    
    transactions
      .filter(t => t.type === 'income')
      .forEach(transaction => {
        const category = transaction.category || 'Sem categoria';
        if (!incomeByCategory[category]) {
          incomeByCategory[category] = 0;
        }
        incomeByCategory[category] += transaction.amount;
      });
    
    return Object.entries(incomeByCategory).map(([name, value]) => ({
      name,
      value
    }));
  };
  
  const prepareIncomeVsExpenseByDay = () => {
    const days: Record<number, { day: number, income: number, expense: number }> = {};
    
    // Inicializar dias do mês
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      days[i] = { day: i, income: 0, expense: 0 };
    }
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const day = date.getDate();
      
      if (transaction.type === 'income') {
        days[day].income += transaction.amount;
      } else {
        days[day].expense += transaction.amount;
      }
    });
    
    return Object.values(days);
  };

  const prepareIncomeVsExpenseByWeek = () => {
    const weeks = getWeeksInMonth();
    const weekData = weeks.map(week => {
      let income = 0;
      let expense = 0;
      
      transactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        if (transactionDate >= week.start && transactionDate <= week.end) {
          if (transaction.type === 'income') {
            income += transaction.amount;
          } else {
            expense += transaction.amount;
          }
        }
      });
      
      return {
        name: week.label,
        income,
        expense,
        balance: income - expense
      };
    });
    
    return weekData;
  };

  // Cores para os gráficos
  const EXPENSE_COLORS = [
    '#FF6B6B', '#F06595', '#D6336C', '#C2255C', '#A61E4D',
    '#862E9C', '#6741D9', '#5F3DC4', '#364FC7', '#1864AB',
    '#0B7285', '#099268', '#2B8A3E', '#5C940D', '#E67700'
  ];
  
  const INCOME_COLORS = [
    '#37B24D', '#40C057', '#51CF66', '#69DB7C', '#8CE99A',
    '#63E6BE', '#20C997', '#12B886', '#0CA678', '#099268'
  ];
  
  // Calcular totais
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  // Filtrar pelo tipo selecionado
  const getCategoryData = () => {
    if (filterType === 'expense') {
      return prepareExpensesByCategory();
    } else if (filterType === 'income') {
      return prepareIncomeByCategory();
    } else {
      // Combinação (talvez não faça sentido em um gráfico de pizza)
      return [...prepareExpensesByCategory(), ...prepareIncomeByCategory()];
    }
  };
  
  // Filtrar por semana se necessário
  const getWeekFilteredData = (data: any[]) => {
    if (activeWeekTab === 'all') {
      return data;
    }
    
    // Pegar semana específica
    const weeks = getWeeksInMonth();
    const selectedWeek = weeks[parseInt(activeWeekTab)];
    
    if (!selectedWeek) return data;
    
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= selectedWeek.start && itemDate <= selectedWeek.end;
    });
  };

  // Formatador personalizado para o tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-galileo-card p-2 border border-galileo-border rounded shadow-sm">
          <p className="font-medium">{data.name}</p>
          <p className="text-galileo-accent">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  // Formatador para os valores do gráfico
  const formatPieChartValue = (value: number) => {
    return formatCurrency(value);
  };
  
  // Renderizar legendas personalizadas
  const renderCustomPieChartLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return percent > 0.05 ? (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize="12"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  // Preparar dados para o gráfico de barras por semana
  const weeklyData = prepareIncomeVsExpenseByWeek();

  return (
    <div className="flex flex-col min-h-screen bg-galileo-background">
      <PageHeader title="Gráficos" showSearch={false} showThemeToggle={false} />
      
      <main className="flex-grow overflow-y-auto p-4 pb-24 md:pb-20">
        <div className="mb-6">
          <MonthSelector onMonthChange={handleMonthChange} />
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button 
              variant={activeChart === 'pie' ? "default" : "outline"} 
              size="sm"
              className={activeChart === 'pie' ? "bg-galileo-accent hover:bg-galileo-accent/80 text-white" : ""} 
              onClick={() => setActiveChart('pie')}
            >
              <PieChartIcon size={16} className="mr-1" /> Pizza
            </Button>
            <Button 
              variant={activeChart === 'bar' ? "default" : "outline"} 
              size="sm"
              className={activeChart === 'bar' ? "bg-galileo-accent hover:bg-galileo-accent/80 text-white" : ""} 
              onClick={() => setActiveChart('bar')}
            >
              <BarChartIcon size={16} className="mr-1" /> Barras
            </Button>
            <Button 
              variant={activeChart === 'line' ? "default" : "outline"} 
              size="sm"
              className={activeChart === 'line' ? "bg-galileo-accent hover:bg-galileo-accent/80 text-white" : ""} 
              onClick={() => setActiveChart('line')}
            >
              <LineChartIcon size={16} className="mr-1" /> Linha
            </Button>
          </div>
          
          <Select 
            value={filterType} 
            onValueChange={(value: 'all' | 'income' | 'expense') => setFilterType(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filtrar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="income">Receitas</SelectItem>
              <SelectItem value="expense">Despesas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Resumo financeiro */}
        <div className="px-4 mb-4 grid grid-cols-2 gap-3">
          <Card className="bg-galileo-card border-galileo-border">
            <CardContent className="p-3">
              <div className="flex flex-col">
                <span className="text-sm text-galileo-secondaryText">Receitas</span>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-galileo-positive">{formatCurrency(totalIncome)}</span>
                  <ArrowUp size={16} className="ml-1 text-galileo-positive" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-galileo-card border-galileo-border">
            <CardContent className="p-3">
              <div className="flex flex-col">
                <span className="text-sm text-galileo-secondaryText">Despesas</span>
                <div className="flex items-center">
                  <span className="text-lg font-semibold text-galileo-negative">{formatCurrency(totalExpenses)}</span>
                  <ArrowDown size={16} className="ml-1 text-galileo-negative" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Gráfico principal */}
        <Card className="mx-4 bg-galileo-card border-galileo-border mb-6">
          {activeChart === 'pie' && (
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">
                {filterType === 'expense' ? 'Despesas por Categoria' : 
                 filterType === 'income' ? 'Receitas por Categoria' : 
                 'Transações por Categoria'}
              </h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getCategoryData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomPieChartLabel}
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                    >
                      {getCategoryData().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={filterType === 'income' ? 
                            INCOME_COLORS[index % INCOME_COLORS.length] : 
                            EXPENSE_COLORS[index % EXPENSE_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Legend formatter={(value) => <span className="text-xs">{value}</span>} />
                    <RechartsTooltip formatter={formatPieChartValue} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          )}
          
          {activeChart === 'bar' && (
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Receitas vs Despesas por Semana</h3>
                <Tabs value={activeWeekTab} onValueChange={setActiveWeekTab} className="w-auto">
                  <TabsList className="bg-galileo-background">
                    <TabsTrigger value="all" className="text-xs">Todas</TabsTrigger>
                    {getWeeksInMonth().map((week, index) => (
                      <TabsTrigger key={index} value={index.toString()} className="text-xs">
                        {week.label.replace('Semana ', 'S')}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={weeklyData}
                    margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="income" fill="#37B24D" name="Receitas" />
                    <Bar dataKey="expense" fill="#FF6B6B" name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          )}
          
          {activeChart === 'line' && (
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Evolução de Receitas e Despesas</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={prepareIncomeVsExpenseByDay()}
                    margin={{ top: 10, right: 0, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      name="Receitas"
                      stroke="#37B24D" 
                      fill="#37B24D" 
                      fillOpacity={0.2} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      name="Despesas"
                      stroke="#FF6B6B" 
                      fill="#FF6B6B" 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          )}
        </Card>
        
        {/* Lista de maiores gastos/receitas */}
        <div className="px-4 mb-24">
          <h3 className="font-medium mb-2">{filterType === 'income' ? 'Maiores Receitas' : 'Maiores Despesas'}</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto pr-1 pb-8">
            {transactions
              .filter(t => filterType === 'all' ? true : t.type === filterType)
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 6)
              .map((transaction, index) => (
                <Card key={index} className="bg-galileo-card border-galileo-border h-full flex flex-col justify-between shadow-sm hover:scale-[1.02] transition-transform duration-100">
                  <CardContent className="p-3 flex flex-col gap-2">
                    <div>
                      <p className="font-medium truncate max-w-[160px] md:max-w-[220px]" title={transaction.title}>{transaction.title}</p>
                      <div className="flex items-center mt-1 flex-wrap gap-1">
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-galileo-background"
                        >
                          {transaction.category}
                        </Badge>
                        {transaction.isRecurring && (
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-galileo-background"
                          >
                            Recorrente
                          </Badge>
                        )}
                      </div>
                    </div>
                    <span className={`font-semibold text-lg ${transaction.type === 'income' ? 'text-galileo-positive' : 'text-galileo-negative'}`}
                      style={{wordBreak: 'break-word'}}>
                      {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </span>
                  </CardContent>
                </Card>
              ))}
            {transactions.filter(t => filterType === 'all' ? true : t.type === filterType).length === 0 && (
              <div className="text-center py-6 text-galileo-secondaryText col-span-full">
                <p>Nenhuma {filterType === 'income' ? 'receita' : 'despesa'} registrada neste mês</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <NavBar />
    </div>
  );
};

export default ChartsPage;
