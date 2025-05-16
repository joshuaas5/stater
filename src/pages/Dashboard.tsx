import React, { useEffect, useState } from 'react';
import './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import BalanceCard from '@/components/dashboard/BalanceCard';
import { Eye, EyeOff, Edit } from 'lucide-react';
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
import { getCurrentUser, getTransactions, isLoggedIn, saveTransaction, updateTransaction, deleteTransaction } from '@/utils/localStorage';
import { CreditCard, TrendingUp, Plus, TrendingDown, BellRing, CalendarRange } from 'lucide-react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAllTransactionsInMonth, setShowAllTransactionsInMonth] = useState(false);
  const [editingTransactionDontAdjustBalance, setEditingTransactionDontAdjustBalance] = useState(false);
  const [lastEditedTransactionIdForBalanceSkip, setLastEditedTransactionIdForBalanceSkip] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showDateFilters, setShowDateFilters] = useState(false);
  
  const [newTransaction, setNewTransaction] = useState({
    title: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    isRecurring: false,
    recurrenceFrequency: 'monthly' as 'weekly' | 'monthly' | 'yearly'
  });
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    // Agendar lembretes de contas a vencer (notificações push)
    import('@/utils/localStorage').then(({ getBills }) => {
      import('@/services/NotificationService').then(({ NotificationService }) => {
        const bills = getBills();
        NotificationService.scheduleBillReminders(bills);
      });
    });
    
    loadTransactions(selectedMonth, selectedYear);

    // Listener para atualizar transações quando houver novas
    const handler = () => {
      // Se um filtro de período estiver ativo, não recarrega automaticamente com o mês/ano
      if (!startDate || !endDate) {
        loadTransactions(selectedMonth, selectedYear);
      }
    };
    window.addEventListener('transactionsUpdated', handler);
    return () => {
      window.removeEventListener('transactionsUpdated', handler);
    };
  }, [navigate, selectedMonth, selectedYear]);
  
  const loadTransactions = (month: number, year: number, useCustomPeriod = false) => {
    const allTransactions = getTransactions();
    let filteredTransactions = allTransactions;
    if (useCustomPeriod && startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');
      filteredTransactions = allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= start && transactionDate <= end;
      });
    } else {
      filteredTransactions = allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
      });
    }
    
    // Sort transactions by date in descending order (most recent first)
    filteredTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(filteredTransactions);

    // Calcular incomes e expenses sempre, pois eles não dependem do skip de saldo
    const incomes = filteredTransactions.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalIncomes(incomes);
    setTotalExpenses(expenses);

    if (lastEditedTransactionIdForBalanceSkip) {
      // Pular o recálculo do saldo e a mudança percentual
      // A transação foi editada com 'dontAdjustBalanceOnSave = true'
      // O saldo atual (balance) e percentChange permanecem os mesmos de antes desta edição.
      setLastEditedTransactionIdForBalanceSkip(null); // Resetar a flag para a próxima atualização
    } else {
      // Calcular saldo e percentChange normalmente
      // Passar a lista de IDs que devem pular o ajuste do saldo
      const currentBalance = calculateBalance(filteredTransactions, [lastEditedTransactionIdForBalanceSkip || '']);
      setBalance(currentBalance);

      const lastMonthDate = new Date(year, month, 1);
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

      const lastMonthTransactions = allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === lastMonthDate.getMonth() &&
               transactionDate.getFullYear() === lastMonthDate.getFullYear();
      });

      const lastMonthBalance = calculateBalance(lastMonthTransactions, [lastEditedTransactionIdForBalanceSkip || '']);
      const change = calculatePercentageChange(currentBalance, lastMonthBalance);
      setPercentChange(change);
    }
  };
  
  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };
  
  const handleAddTransaction = (type: 'income' | 'expense') => {
    setNewTransaction({
      ...newTransaction,
      type,
      title: '',
      amount: '',
      category: '',
      isRecurring: false,
      recurrenceFrequency: 'monthly'
    });
    setDialogOpen(true);
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
  
  const handleRecurrenceChange = (checked: boolean) => {
    setNewTransaction({
      ...newTransaction,
      isRecurring: checked
    });
  };
  
  const handleRecurrenceFrequencyChange = (value: 'weekly' | 'monthly' | 'yearly') => {
    setNewTransaction({
      ...newTransaction,
      recurrenceFrequency: value
    });
  };
  
  const handleSaveTransaction = () => {
    // Remove a lógica de dontAdjustBalanceOnSave da criação de nova transação
    // Ela será adicionada apenas no bloco de edição mais abaixo.

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
    
    const type = newTransaction.type;
    
    const transaction: Transaction = {
      id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: newTransaction.title,
      amount: amount,
      type: type,
      category: newTransaction.category || (type === 'income' ? 'Receita' : 'Outros'),
      date: new Date(),
      userId: user.id,
      isRecurring: newTransaction.isRecurring,
      recurrenceFrequency: newTransaction.isRecurring ? newTransaction.recurrenceFrequency : undefined,
      dontAdjustBalanceOnSave: editingTransaction ? editingTransactionDontAdjustBalance : undefined // Salva o estado do checkbox
    };
    
    saveTransaction(transaction);
    
    setNewTransaction({
      title: '',
      amount: '',
      category: '',
      type: 'expense',
      isRecurring: false,
      recurrenceFrequency: 'monthly'
    });
    
    setDialogOpen(false);
    
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
      <button
        onClick={() => setShowFinancialTips(true)}
        className="pop-art-tips focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-galileo-accent"
        aria-label="Show Tips"
      >
        TIPS
      </button>
      <ThemeToggle />
    </div>
  </div>

  <div className="px-4 mb-4">
    <MonthSelector onMonthChange={handleMonthChange} />
  </div>

  <div className="flex flex-wrap gap-4 px-4 mb-6">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-galileo-secondaryText text-base font-medium leading-normal">Saldo da Conta</span>
              <button
                aria-label={balanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
                className="ml-1 text-galileo-secondaryText hover:text-galileo-text"
                onClick={() => setBalanceVisible((v: boolean) => !v)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              >
                {balanceVisible ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
          </div>
          <BalanceCard balance={balance} percentChange={percentChange} visible={balanceVisible} />
        </div>
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <Button 
          onClick={() => handleAddTransaction('income')}
          className="bg-galileo-positive hover:bg-galileo-positive/80 text-white flex items-center gap-2"
        >
          <TrendingUp size={18} />
          Adicionar Entrada
        </Button>
        <Button 
          onClick={() => handleAddTransaction('expense')}
          className="bg-galileo-negative hover:bg-galileo-negative/80 text-white flex items-center gap-2"
        >
          <TrendingDown size={18} />
          Adicionar Saída
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open: boolean) => {
        setDialogOpen(open);
        if (!open) {
          setEditingTransaction(null);
          setEditingTransactionDontAdjustBalance(false); // Resetar aqui
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction
                ? (editingTransaction.type === 'income' ? 'Editar Entrada' : 'Editar Saída')
                : (newTransaction.type === 'income' ? 'Adicionar Nova Entrada' : 'Adicionar Nova Saída')}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? (editingTransaction.type === 'income' ? 'Edite uma receita ou entrada financeira.' : 'Edite uma despesa ou saída financeira.')
                : (newTransaction.type === 'income' ? 'Adicione uma nova receita ou entrada financeira.' : 'Adicione uma nova despesa ou saída financeira.')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
  <Label htmlFor="title">Descrição</Label>
  <Input 
    id="title" 
    name="title"
    value={editingTransaction ? editingTransaction.title : newTransaction.title} 
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
      if (editingTransaction) setEditingTransaction({...editingTransaction, title: e.target.value});
      else handleNewTransactionChange(e);
    }}
    placeholder={`Ex: ${(editingTransaction ? editingTransaction.type : newTransaction.type) === 'income' ? 'Salário, Freelance' : 'Aluguel, Supermercado'}`}
  />
</div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor</Label>
              <Input 
                id="amount" 
                name="amount"
                value={editingTransaction ? String(editingTransaction.amount ?? '') : newTransaction.amount} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  if (editingTransaction) setEditingTransaction({...editingTransaction, amount: value === '' ? 0 : Number(value)}); // Use 0 for empty string to satisfy number type
                  else handleNewTransactionChange(e);
                }}
                placeholder="Ex: 1000 ou 2 mil"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria</Label>
              <Input 
                id="category" 
                name="category"
                value={editingTransaction ? editingTransaction.category : newTransaction.category} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (editingTransaction) setEditingTransaction({...editingTransaction, category: e.target.value});
                  else handleNewTransactionChange(e);
                }}
                placeholder={`Ex: ${(editingTransaction ? editingTransaction.type : newTransaction.type) === 'income' ? 'Salário, Investimentos' : 'Moradia, Alimentação'}`}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isRecurring" 
                checked={editingTransaction ? editingTransaction.isRecurring : newTransaction.isRecurring}
                onCheckedChange={(val: boolean) => {
                  if (editingTransaction) setEditingTransaction({...editingTransaction, isRecurring: !!val});
                  else handleRecurrenceChange(!!val);
                }}
              />
              <Label 
                htmlFor="isRecurring" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Transação recorrente
              </Label>
            </div>
            
            {(editingTransaction ? editingTransaction.isRecurring : newTransaction.isRecurring) && (
              <div className="grid gap-2">
                <Label htmlFor="recurrenceFrequency">Frequência</Label>
                <Select 
                  value={editingTransaction ? (editingTransaction.recurrenceFrequency as 'weekly' | 'monthly' | 'yearly' || 'monthly') : newTransaction.recurrenceFrequency} 
                  onValueChange={(val: string) => { 
                    if (editingTransaction) setEditingTransaction({...editingTransaction, recurrenceFrequency: val as 'weekly' | 'monthly' | 'yearly'});
                    else handleRecurrenceFrequencyChange(val as 'weekly' | 'monthly' | 'yearly');
                  }}
                >
                  <SelectTrigger id="recurrenceFrequency">
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            {editingTransaction && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dontAdjustBalance" 
                  checked={editingTransactionDontAdjustBalance}
                  onCheckedChange={(val: boolean) => {
                    setEditingTransactionDontAdjustBalance(!!val);
                  }}
                />
                <Label 
                  htmlFor="dontAdjustBalance" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Não ajustar saldo
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
  {editingTransaction ? (
    <div className="flex flex-col sm:flex-row justify-end gap-2 w-full">
      <Button
        onClick={() => {
          if (!editingTransaction) return; // Safety check

          const user = getCurrentUser();
          if (!user) {
            navigate('/login');
            return;
          }

          // Robust amount parsing
          let finalAmount: number;
          // Allow currentAmountFromState to be string or number to handle parsing from form input
          const currentAmountFromState: string | number = editingTransaction.amount as (string | number);

          if (typeof currentAmountFromState === 'string') {
            const cleanedAmountString = currentAmountFromState.replace(/[^0-9.,]/g, '').replace(',', '.');
            finalAmount = parseFloat(cleanedAmountString);
          } else if (typeof currentAmountFromState === 'number') {
            finalAmount = currentAmountFromState;
          } else {
            // Handle undefined, null, or other unexpected types
            finalAmount = NaN; // This will trigger the validation error below
          }

          if (isNaN(finalAmount) || finalAmount <= 0) {
            toast({
              title: 'Valor Inválido',
              description: 'Por favor, insira um valor numérico válido para a transação.',
              variant: 'destructive',
            });
            return;
          }

          const transactionToUpdate: Transaction = {
            ...editingTransaction,
            amount: finalAmount, // Use the correctly parsed numeric amount
            date: new Date(editingTransaction.date), // Ensure date is a Date object
            dontAdjustBalanceOnSave: editingTransactionDontAdjustBalance,
          };

          updateTransaction(transactionToUpdate);

          if (editingTransactionDontAdjustBalance) {
            setLastEditedTransactionIdForBalanceSkip(transactionToUpdate.id);
          }
          
          toast({ title: "Sucesso", description: "Transação atualizada." });
          setDialogOpen(false); // Close dialog after successful save
        }}
        className={
          editingTransaction.type === 'income'
            ? 'bg-galileo-positive hover:bg-galileo-positive/80'
            : 'bg-galileo-negative hover:bg-galileo-negative/80'
        }
      >
        Salvar {editingTransaction.type === 'income' ? 'Entrada' : 'Saída'}
      </Button>
      <Button
        variant="destructive"
        onClick={() => {
          const user = getCurrentUser();
          if (!user) {
            navigate('/login');
            return;
          }
          if (editingTransaction) {
            deleteTransaction(editingTransaction.id);
          }
          setDialogOpen(false);
          setEditingTransaction(null);
          toast({
            title: 'Transação excluída',
            description: 'A transação foi removida com sucesso.'
          });
        }}
        data-testid="delete-transaction-btn"
      >
        Excluir
      </Button>
    </div>
  ) : (
    <Button
      onClick={() => {
          // Garante que a conversão para número ocorra aqui também, como no onChange do input.
          const amountAsNumber = parseFloat(newTransaction.amount.replace(/[^\.d0-9]/g, '').replace(',', '.'));
          if (isNaN(amountAsNumber) || amountAsNumber <= 0) {
            toast({
              title: 'Valor Inválido',
              description: 'Por favor, insira um valor numérico válido para a transação.',
              variant: 'destructive',
            });
            return;
          }
          handleSaveTransaction();
        }}
      className={
        newTransaction.type === 'income'
          ? 'bg-galileo-positive hover:bg-galileo-positive/80'
          : 'bg-galileo-negative hover:bg-galileo-negative/80'
      }
    >
      Salvar {newTransaction.type === 'income' ? 'Entrada' : 'Saída'}
    </Button>
  )}
</DialogFooter>
        </DialogContent>
      </Dialog>
      
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
      <div className="px-4 mb-4 flex flex-col gap-2">
        <Button 
          onClick={() => setShowDateFilters(!showDateFilters)} 
          variant="outline" 
          size="sm"
          className="w-full sm:w-auto"
        >
          {showDateFilters ? 'Ocultar Filtros de Data' : 'Filtrar por Data'}
        </Button>

        {showDateFilters && (
          <div className="flex flex-col sm:flex-row gap-2 items-center pt-2">
            <div className="grid w-full sm:w-auto gap-1.5">
              <Label htmlFor="start-date" className="text-xs text-galileo-secondaryText">De:</Label>
              <Input type="date" id="start-date" value={startDate || ''} onChange={(e) => setStartDate(e.target.value)} className="text-sm" />
            </div>
            <div className="grid w-full sm:w-auto gap-1.5">
              <Label htmlFor="end-date" className="text-xs text-galileo-secondaryText">Até:</Label>
              <Input type="date" id="end-date" value={endDate || ''} onChange={(e) => setEndDate(e.target.value)} className="text-sm" />
            </div>
            <Button onClick={() => loadTransactions(selectedMonth, selectedYear, true)} className="mt-4 sm:mt-auto h-9 w-full sm:w-auto" size="sm">Filtrar Período</Button>
            <Button 
              onClick={() => {
                setStartDate(null); 
                setEndDate(null); 
                loadTransactions(selectedMonth, selectedYear); 
                setShowDateFilters(false); // Oculta os filtros ao limpar
              }} 
              variant="ghost" 
              className="mt-1 sm:mt-auto h-9 text-xs w-full sm:w-auto" 
              size="sm"
            >
              Limpar Filtro
            </Button>
          </div>
        )}
      </div>
      
      {transactions.length > 0 ? (
        (showAllTransactionsInMonth ? transactions : transactions.slice(0, 5)).map((transaction: Transaction) => (
          <div key={transaction.id} className="flex items-center gap-4 bg-galileo-background px-4 min-h-[72px] py-2 justify-between border-t border-galileo-border">
            <div className="flex items-center gap-4">
              <div className="text-galileo-text flex items-center justify-center rounded-lg bg-galileo-accent shrink-0 size-12">
                {transaction.isRecurring ? 
                  <CalendarRange size={24} /> : 
                  (transaction.type === 'income' ? <TrendingUp size={24} /> : <CreditCard size={24} />)
                }
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-galileo-text text-base font-medium leading-normal line-clamp-1">
                  {transaction.title}
                </p>
                <p className="text-galileo-secondaryText text-sm font-normal leading-normal line-clamp-2">
                  {transaction.category} {transaction.isRecurring && '(Recorrente)'}
                </p>
                <p className="text-galileo-tertiaryText text-xs font-normal leading-normal">
                  {new Date(transaction.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className={`text-base font-normal leading-normal ${
                transaction.type === 'income' ? 'text-galileo-positive' : 'text-galileo-negative'
              }`}>
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </p>
              <button
                aria-label="Editar transação"
                className="ml-2 text-galileo-secondaryText hover:text-galileo-text"
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                onClick={() => {
                  setEditingTransactionDontAdjustBalance(transaction.dontAdjustBalanceOnSave || false); // Inicializar aqui
                  setEditingTransaction(transaction);
                  setDialogOpen(true);
                }}
              >
                <Edit size={18} />
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="text-galileo-secondaryText mb-4">Nenhuma transação encontrada para este mês</p>
        </div>
      )}
      {transactions.length > 5 && (
        <div className="px-4 mt-4 mb-2 flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAllTransactionsInMonth(!showAllTransactionsInMonth)}
          >
            {showAllTransactionsInMonth ? 'Ver Menos' : 'Ver Todas as Transações do Mês'}
          </Button>
        </div>
      )}
      
      <NavBar />
    </div>
  );
};

export default Dashboard;
