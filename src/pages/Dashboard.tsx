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
import { CreditCard, TrendingUp, Plus, TrendingDown, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

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
  const [showFinancialTips, setShowFinancialTips] = useState(false);
  
  const [newTransaction, setNewTransaction] = useState({
    title: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
  });
  
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
    
    const currentBalance = calculateBalance(filteredTransactions);
    setBalance(currentBalance);
    
    const incomes = filteredTransactions.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    setTotalIncomes(incomes);
    setTotalExpenses(expenses);
    
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
    navigate('/transactions');
    toast({
      title: "Adicionar Transação",
      description: "Clique no botão + para adicionar uma nova transação."
    });
  };
  
  const handleNewTransactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      if (/\d+\s*mil/i.test(value)) {
        const numberPart = value.replace(/\s*mil/i, '').trim();
        const numericValue = parseFloat(numberPart) * 1000;
        setNewTransaction({
          ...newTransaction,
          [name]: numericValue.toString(),
        });
        return;
      }
      
      const cleanedValue = value.replace(/[^\d.,]/g, '').replace(',', '.');
      setNewTransaction({
        ...newTransaction,
        [name]: cleanedValue,
      });
    } else {
      setNewTransaction({
        ...newTransaction,
        [name]: value,
      });
    }
  };
  
  const handleSaveTransaction = (type: 'income' | 'expense') => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, informe um valor válido para a transação",
        variant: "destructive"
      });
      return;
    }
    
    if (!newTransaction.title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, informe um título para a transação",
        variant: "destructive"
      });
      return;
    }
    
    const transaction: Transaction = {
      id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newTransaction.title,
      amount: amount,
      type: type,
      category: newTransaction.category || (type === 'income' ? 'Receita' : 'Outros'),
      date: new Date(),
      userId: user.id
    };
    
    const allTransactions = getTransactions();
    allTransactions.push(transaction);
    
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(allTransactions));
    
    loadTransactions(selectedMonth, selectedYear);
    
    setNewTransaction({
      title: '',
      amount: '',
      category: '',
      type: 'expense',
    });
    
    toast({
      title: `${type === 'income' ? 'Entrada' : 'Saída'} adicionada`,
      description: `${transaction.title} foi adicionada com sucesso no valor de ${formatCurrency(transaction.amount)}`
    });
  };
  
  const financialTips = [
    {
      title: "Regra 50/30/20",
      description: "Destine 50% da sua renda para necessidades, 30% para desejos e 20% para poupança/investimentos."
    },
    {
      title: "Fundo de Emergência",
      description: "Economize o suficiente para cobrir 3 a 6 meses de despesas essenciais."
    },
    {
      title: "Estabeleça Metas",
      description: "Defina metas específicas e mensuráveis para suas finanças."
    },
    {
      title: "Evite Dívidas de Alto Juros",
      description: "Priorize o pagamento de dívidas com juros altos, como cartão de crédito."
    },
    {
      title: "Automatize as Economias",
      description: "Configure transferências automáticas para sua conta poupança no dia do pagamento."
    },
    {
      title: "Compare Preços",
      description: "Pesquise preços de produtos e serviços antes de comprar."
    },
    {
      title: "Evite Compras por Impulso",
      description: "Espere 24 horas antes de fazer compras não planejadas."
    },
    {
      title: "Renegocie Serviços",
      description: "Reavalie e negocie seus serviços recorrentes (internet, seguro, etc.) anualmente."
    }
  ];
  
  const user = getCurrentUser();
  const userName = user ? user.username : "Usuário";
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-galileo-text text-lg font-bold leading-tight">
          Olá, {userName}!
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost"
            size="icon"
            onClick={() => setShowFinancialTips(true)}
            className="text-galileo-text"
          >
            <BellRing size={20} />
          </Button>
          <ThemeToggle />
        </div>
      </div>
      
      <div className="px-4 mb-4">
        <MonthSelector onMonthChange={handleMonthChange} />
      </div>
      
      <div className="flex flex-wrap gap-4 px-4 mb-6">
        <div className="w-full">
          <BalanceCard balance={balance} percentChange={percentChange} />
        </div>
      </div>
      
      <div className="flex justify-center gap-4 mb-6">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="bg-galileo-positive hover:bg-galileo-positive/80 text-white flex items-center gap-2"
            >
              <TrendingUp size={18} />
              Adicionar Entrada
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Entrada</DialogTitle>
              <DialogDescription>
                Adicione uma nova receita ou entrada financeira.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Descrição</Label>
                <Input 
                  id="title" 
                  name="title"
                  value={newTransaction.title} 
                  onChange={handleNewTransactionChange} 
                  placeholder="Ex: Salário, Freelance, Venda..." 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor</Label>
                <Input 
                  id="amount" 
                  name="amount"
                  value={newTransaction.amount} 
                  onChange={handleNewTransactionChange} 
                  placeholder="Ex: 1000 ou 2 mil"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Input 
                  id="category" 
                  name="category"
                  value={newTransaction.category} 
                  onChange={handleNewTransactionChange} 
                  placeholder="Ex: Salário, Investimentos..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleSaveTransaction('income')} className="bg-galileo-positive hover:bg-galileo-positive/80">
                Salvar Entrada
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              className="bg-galileo-negative hover:bg-galileo-negative/80 text-white flex items-center gap-2"
            >
              <TrendingDown size={18} />
              Adicionar Saída
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Saída</DialogTitle>
              <DialogDescription>
                Adicione uma nova despesa ou saída financeira.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Descrição</Label>
                <Input 
                  id="title" 
                  name="title"
                  value={newTransaction.title} 
                  onChange={handleNewTransactionChange} 
                  placeholder="Ex: Aluguel, Supermercado..." 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Valor</Label>
                <Input 
                  id="amount" 
                  name="amount"
                  value={newTransaction.amount} 
                  onChange={handleNewTransactionChange} 
                  placeholder="Ex: 1000 ou 2 mil"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Input 
                  id="category" 
                  name="category"
                  value={newTransaction.category} 
                  onChange={handleNewTransactionChange} 
                  placeholder="Ex: Moradia, Alimentação..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => handleSaveTransaction('expense')} className="bg-galileo-negative hover:bg-galileo-negative/80">
                Salvar Saída
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Dialog open={showFinancialTips} onOpenChange={setShowFinancialTips}>
        <DialogContent className="max-w-md overflow-y-auto max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Dicas Financeiras</DialogTitle>
            <DialogDescription>
              Conselhos úteis para otimizar seu orçamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            {financialTips.map((tip, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h3 className="text-galileo-text font-bold mb-2">{tip.title}</h3>
                <p className="text-galileo-secondaryText text-sm">{tip.description}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
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
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-galileo-accent text-galileo-text"
                >
                  <TrendingUp size={16} className="mr-2" />
                  Adicionar Entrada
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Entrada</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova receita ou entrada financeira.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Descrição</Label>
                    <Input 
                      id="title" 
                      name="title"
                      value={newTransaction.title} 
                      onChange={handleNewTransactionChange} 
                      placeholder="Ex: Salário, Freelance, Venda..." 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Valor</Label>
                    <Input 
                      id="amount" 
                      name="amount"
                      value={newTransaction.amount} 
                      onChange={handleNewTransactionChange} 
                      placeholder="Ex: 1000 ou 2 mil"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input 
                      id="category" 
                      name="category"
                      value={newTransaction.category} 
                      onChange={handleNewTransactionChange} 
                      placeholder="Ex: Salário, Investimentos..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => handleSaveTransaction('income')} className="bg-galileo-positive hover:bg-galileo-positive/80">
                    Salvar Entrada
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-galileo-accent text-galileo-text"
                >
                  <TrendingDown size={16} className="mr-2" />
                  Adicionar Saída
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Saída</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova despesa ou saída financeira.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Descrição</Label>
                    <Input 
                      id="title" 
                      name="title"
                      value={newTransaction.title} 
                      onChange={handleNewTransactionChange} 
                      placeholder="Ex: Aluguel, Supermercado..." 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Valor</Label>
                    <Input 
                      id="amount" 
                      name="amount"
                      value={newTransaction.amount} 
                      onChange={handleNewTransactionChange} 
                      placeholder="Ex: 1000 ou 2 mil"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input 
                      id="category" 
                      name="category"
                      value={newTransaction.category} 
                      onChange={handleNewTransactionChange} 
                      placeholder="Ex: Moradia, Alimentação..."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => handleSaveTransaction('expense')} className="bg-galileo-negative hover:bg-galileo-negative/80">
                    Salvar Saída
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
      
      <NavBar />
    </div>
  );
};

export default Dashboard;
