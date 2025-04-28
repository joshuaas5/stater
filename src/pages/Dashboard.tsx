
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import BalanceCard from '@/components/dashboard/BalanceCard';
import SpendingChart from '@/components/dashboard/SpendingChart';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MonthSelector } from '@/components/ui/month-selector';
import { Transaction } from '@/types';
import { 
  calculateBalance, 
  calculatePercentageChange,
  formatCurrency, 
  getTransactionsFromLastDays 
} from '@/utils/dataProcessing';
import { getCurrentUser, getTransactions, isLoggedIn } from '@/utils/localStorage';
import { CreditCard, TrendingUp, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  useEffect(() => {
    // Verificar se o usuário está logado
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    loadTransactions(selectedMonth, selectedYear);
  }, [navigate, selectedMonth, selectedYear]);
  
  const loadTransactions = (month: number, year: number) => {
    // Carregar as transações do usuário
    const allTransactions = getTransactions();
    
    // Filtrar transações do mês e ano selecionados
    const filteredTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });
    
    setTransactions(filteredTransactions);
    
    // Calcular o saldo atual
    const currentBalance = calculateBalance(filteredTransactions);
    setBalance(currentBalance);
    
    // Calcular total de entradas e saídas
    const incomes = filteredTransactions.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    setTotalIncomes(incomes);
    setTotalExpenses(expenses);
    
    // Calcular a variação percentual em relação ao mês anterior
    const lastMonthDate = new Date(year, month, 1);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    
    const lastMonthTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === lastMonthDate.getMonth() && 
             transactionDate.getFullYear() === lastMonthDate.getFullYear();
    });
    
    const lastMonthBalance = calculateBalance(lastMonthTransactions);
    const change = calculatePercentageChange(currentBalance, lastMonthBalance);
    setPercentChange(change);
  };
  
  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };
  
  const handleAddTransaction = () => {
    // Navegar para a página de adicionar transação
    navigate('/transactions');
    toast({
      title: "Adicionar Transação",
      description: "Clique no botão + para adicionar uma nova transação."
    });
  };
  
  const user = getCurrentUser();
  const userName = user ? user.username : "Usuário";
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-galileo-text text-lg font-bold leading-tight">
          Olá, {userName}!
        </h2>
        <ThemeToggle />
      </div>
      
      <div className="px-4 mb-4">
        <MonthSelector onMonthChange={handleMonthChange} />
      </div>
      
      <div className="flex flex-wrap gap-4 px-4 mb-6">
        <div className="w-full">
          <BalanceCard balance={balance} percentChange={percentChange} />
        </div>
      </div>
      
      {/* Entradas e Saídas */}
      <div className="grid grid-cols-2 gap-4 px-4 mb-6">
        <div className="bg-galileo-card rounded-lg p-4 border-l-4 border-galileo-positive">
          <p className="text-galileo-secondaryText mb-1">Entradas</p>
          <p className="text-galileo-positive text-xl font-bold">{formatCurrency(totalIncomes)}</p>
        </div>
        <div className="bg-galileo-card rounded-lg p-4 border-l-4 border-galileo-negative">
          <p className="text-galileo-secondaryText mb-1">Saídas</p>
          <p className="text-galileo-negative text-xl font-bold">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <Button 
          onClick={handleAddTransaction} 
          className="bg-galileo-accent hover:bg-galileo-accent/80 text-galileo-text flex items-center gap-2"
        >
          <Plus size={18} />
          Adicionar Transação
        </Button>
      </div>
      
      <div className="px-4 mb-6">
        <SpendingChart transactions={transactions} days={30} />
      </div>
      
      <h2 className="text-galileo-text text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-2">
        Últimas Transações
      </h2>
      
      {transactions.length > 0 ? (
        transactions.slice(0, 5).map((transaction) => (
          <div key={transaction.id} className="flex items-center gap-4 bg-galileo-background px-4 min-h-[72px] py-2 justify-between border-t border-galileo-border">
            <div className="flex items-center gap-4">
              <div className="text-galileo-text flex items-center justify-center rounded-lg bg-galileo-accent shrink-0 size-12">
                {transaction.type === 'income' ? <TrendingUp size={24} /> : <CreditCard size={24} />}
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-galileo-text text-base font-medium leading-normal line-clamp-1">
                  {transaction.title}
                </p>
                <p className="text-galileo-secondaryText text-sm font-normal leading-normal line-clamp-2">
                  {transaction.category}
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <p className={`text-base font-normal leading-normal ${
                transaction.type === 'income' ? 'text-galileo-positive' : 'text-galileo-negative'
              }`}>
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-galileo-secondaryText mb-4">Nenhuma transação encontrada para este mês</p>
          <Button 
            onClick={handleAddTransaction}
            variant="outline"
            className="border-galileo-accent text-galileo-text"
          >
            Adicionar Transação
          </Button>
        </div>
      )}
      
      <NavBar />
    </div>
  );
};

export default Dashboard;
