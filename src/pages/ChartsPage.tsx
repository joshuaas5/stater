
import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { MonthSelector } from '@/components/ui/month-selector';
import { Transaction } from '@/types';
import { getTransactions, isLoggedIn } from '@/utils/localStorage';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/dataProcessing';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const ChartsPage: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    loadTransactions(selectedMonth, selectedYear);
  }, [navigate, selectedMonth, selectedYear]);
  
  const loadTransactions = (month: number, year: number) => {
    const allTransactions = getTransactions();
    const filteredTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });
    
    setTransactions(filteredTransactions);
  };
  
  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };
  
  // Prepare pie chart data for expenses by category
  const prepareExpensesData = () => {
    const expensesByCategory: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const category = transaction.category || 'Outros';
        if (expensesByCategory[category]) {
          expensesByCategory[category] += transaction.amount;
        } else {
          expensesByCategory[category] = transaction.amount;
        }
      }
    });
    
    return Object.keys(expensesByCategory).map(category => ({
      name: category,
      value: expensesByCategory[category]
    }));
  };
  
  // Prepare bar chart data for income vs expenses
  const prepareIncomeVsExpensesData = () => {
    // Group by week
    const weeks: { [key: string]: { date: string, income: number, expense: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const weekNumber = Math.ceil(date.getDate() / 7); // Simple week calculation
      const weekKey = `Week ${weekNumber}`;
      
      if (!weeks[weekKey]) {
        weeks[weekKey] = { date: weekKey, income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        weeks[weekKey].income += transaction.amount;
      } else {
        weeks[weekKey].expense += transaction.amount;
      }
    });
    
    return Object.values(weeks);
  };
  
  // Prepare line chart data for net worth over time
  const prepareNetWorthData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const netWorthData = [];
    
    const allTransactions = getTransactions();
    const currentYear = selectedYear;
    
    let cumulativeNetWorth = 0;
    
    for (let i = 0; i < 12; i++) {
      const monthlyTransactions = allTransactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() <= i && date.getFullYear() <= currentYear;
      });
      
      const income = monthlyTransactions.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthlyTransactions.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      cumulativeNetWorth = income - expenses;
      
      netWorthData.push({
        name: months[i],
        netWorth: cumulativeNetWorth
      });
    }
    
    return netWorthData;
  };
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-galileo-card p-2 border border-galileo-border rounded">
          <p className="text-galileo-text font-medium">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  const expensesData = prepareExpensesData();
  const incomeVsExpensesData = prepareIncomeVsExpensesData();
  const netWorthData = prepareNetWorthData();
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Análise Financeira" />
      
      <div className="px-4 mb-4">
        <MonthSelector onMonthChange={handleMonthChange} />
      </div>
      
      <Tabs defaultValue="expenses" className="px-4">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="expenses" className="flex-1">Despesas</TabsTrigger>
          <TabsTrigger value="comparison" className="flex-1">Comparativo</TabsTrigger>
          <TabsTrigger value="networth" className="flex-1">Patrimônio</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="mt-2">
          <div className="bg-galileo-card p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-galileo-text mb-4">Distribuição de Despesas por Categoria</h2>
            
            {expensesData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {expensesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-galileo-secondaryText py-10">
                Sem despesas registradas neste período
              </p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="mt-2">
          <div className="bg-galileo-card p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-galileo-text mb-4">Receitas vs Despesas por Semana</h2>
            
            {incomeVsExpensesData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={incomeVsExpensesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="income" name="Receitas" fill="#82ca9d" />
                    <Bar dataKey="expense" name="Despesas" fill="#ff8042" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-galileo-secondaryText py-10">
                Sem transações registradas neste período
              </p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="networth" className="mt-2">
          <div className="bg-galileo-card p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-galileo-text mb-4">Evolução do Patrimônio em {selectedYear}</h2>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={netWorthData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="netWorth" 
                    name="Patrimônio Líquido"
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <NavBar />
    </div>
  );
};

export default ChartsPage;
