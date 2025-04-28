
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import BalanceCard from '@/components/dashboard/BalanceCard';
import SpendingChart from '@/components/dashboard/SpendingChart';
import { Transaction } from '@/types';
import { 
  calculateBalance, 
  calculatePercentageChange,
  formatCurrency, 
  getTransactionsFromLastDays 
} from '@/utils/dataProcessing';
import { getCurrentUser, getTransactions, isLoggedIn } from '@/utils/localStorage';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  
  useEffect(() => {
    // Verificar se o usuário está logado
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    // Carregar as transações do usuário
    const userTransactions = getTransactions();
    setTransactions(userTransactions);
    
    // Calcular o saldo atual
    const currentBalance = calculateBalance(userTransactions);
    setBalance(currentBalance);
    
    // Calcular a variação percentual em relação ao mês anterior
    const last30Days = getTransactionsFromLastDays(userTransactions, 30);
    const last60Days = getTransactionsFromLastDays(userTransactions, 60);
    const last30DaysBalance = calculateBalance(last30Days);
    const previous30DaysBalance = calculateBalance(last60Days) - last30DaysBalance;
    
    const change = calculatePercentageChange(last30DaysBalance, previous30DaysBalance);
    setPercentChange(change);
  }, [navigate]);
  
  // Calcular métricas adicionais
  const buyingPower = balance * 0.7; // Exemplo simples - 70% do saldo é o poder de compra
  const monthlyInterest = balance * 0.005; // 0.5% de juros mensais (exemplo)
  const lifetimeInterest = transactions
    .filter(t => t.type === 'income' && t.category.toLowerCase().includes('juro'))
    .reduce((acc, t) => acc + t.amount, 0);
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Dashboard" />
      
      <div className="flex flex-wrap gap-4 px-4 py-6">
        <div className="flex min-w-72 flex-1 flex-col gap-2">
          <BalanceCard balance={balance} percentChange={percentChange} />
          <SpendingChart transactions={transactions} days={30} />
        </div>
      </div>
      
      {/* Métricas adicionais */}
      <div className="flex items-center gap-4 bg-galileo-background px-4 min-h-14 justify-between border-t border-galileo-border">
        <div className="flex items-center gap-4">
          <div className="text-galileo-text flex items-center justify-center rounded-lg bg-galileo-accent shrink-0 size-10">
            <CreditCard size={24} />
          </div>
          <p className="text-galileo-text text-base font-normal leading-normal flex-1 truncate">Poder de Compra</p>
        </div>
        <div className="shrink-0">
          <p className="text-galileo-text text-base font-normal leading-normal">{formatCurrency(buyingPower)}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 bg-galileo-background px-4 min-h-14 justify-between border-t border-galileo-border">
        <div className="flex items-center gap-4">
          <div className="text-galileo-text flex items-center justify-center rounded-lg bg-galileo-accent shrink-0 size-10">
            <TrendingUp size={24} />
          </div>
          <p className="text-galileo-text text-base font-normal leading-normal flex-1 truncate">Juros acumulados este mês</p>
        </div>
        <div className="shrink-0">
          <p className="text-galileo-text text-base font-normal leading-normal">{formatCurrency(monthlyInterest)}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 bg-galileo-background px-4 min-h-14 justify-between border-t border-galileo-border">
        <div className="flex items-center gap-4">
          <div className="text-galileo-text flex items-center justify-center rounded-lg bg-galileo-accent shrink-0 size-10">
            <DollarSign size={24} />
          </div>
          <p className="text-galileo-text text-base font-normal leading-normal flex-1 truncate">Total de juros recebidos</p>
        </div>
        <div className="shrink-0">
          <p className="text-galileo-text text-base font-normal leading-normal">{formatCurrency(lifetimeInterest)}</p>
        </div>
      </div>
      
      <h2 className="text-galileo-text text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
        Últimas Transações
      </h2>
      
      {transactions.slice(0, 5).map((transaction) => (
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
      ))}
      
      <NavBar />
    </div>
  );
};

export default Dashboard;
