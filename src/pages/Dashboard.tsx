import React, { useCallback, useEffect, useState } from 'react';

import './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types';
import NavBar from '@/components/navigation/NavBar';
import BalanceCard from '@/components/dashboard/BalanceCard';
import { Eye, EyeOff, Edit } from 'lucide-react';
import SpendingChart from '@/components/dashboard/SpendingChart';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DollarSign, ArrowRight, MessageCircle, Check } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { MonthSelector } from '@/components/ui/month-selector';
import { TelegramConnectModal } from '@/components/telegram/TelegramConnectModal';
import { Transaction } from '@/types';
import { 
  calculateBalance, 
  calculatePercentageChange,
  formatCurrency, 
  getTransactionsFromLastDays 
} from '@/utils/dataProcessing';
import { getCurrentUser, getTransactions, isLoggedIn, saveTransaction, updateTransaction, deleteTransaction, uuidv4, forceSupabaseSync, startAutoSync, stopAutoSync } from '@/utils/localStorage';
import { CreditCard, TrendingUp, Plus, TrendingDown, BellRing, CalendarRange, Star, Trash } from 'lucide-react';
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
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// 🔧 DEBUG: Log para identificar re-renderizações do Dashboard
console.log('🎯 Dashboard.tsx carregado/re-renderizado:', new Date().toISOString());

const Dashboard: React.FC = () => {
  console.log('🎯 Dashboard component executando...');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // 🔧 DEBUG: Detectar mudanças que causam re-render
  console.log('🔧 [DASHBOARD] Estado atual:', {
    userLoaded: !!user,
    userId: user?.id,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });
  
  // Estados existentes
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [percentChange, setPercentChange] = useState(0);
  const [totalIncomes, setTotalIncomes] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingTransactionDontAdjustBalance, setEditingTransactionDontAdjustBalance] = useState(false);
  const [showAllTransactionsInMonth, setShowAllTransactionsInMonth] = useState(false);
  const [lastEditedTransactionIdForBalanceSkip, setLastEditedTransactionIdForBalanceSkip] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [nameFilter, setNameFilter] = useState<string>('');

  // Estados do Telegram
  const [isTelegramLinked, setIsTelegramLinked] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [telegramInfo, setTelegramInfo] = useState<any>(null);

  // Funções do Telegram
  const checkTelegramStatus = async () => {
    if (!user?.id) return;
    
    try {
      const { data } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setIsTelegramLinked(true);
        setTelegramInfo(data);
      }
    } catch (error) {
      console.log('Telegram não conectado ainda');
    }
  };  const generateTelegramCode = () => {
    if (!user?.id) return;
    setShowTelegramModal(true);
  };

  const handleTelegramConnect = async (chatId: string) => {
    setShowTelegramModal(false);
    
    if (!user?.id) {
      toast({
        title: "❌ Erro",
        description: "Usuário não encontrado",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingCode(true);
    try {
      // Conectar via API temporária (enquanto não configuramos SERVICE_ROLE_KEY)
      const response = await fetch('/api/telegram-connect-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: chatId.trim(),
          userId: user.id,
          userEmail: user.email || '',
          userName: user.user_metadata?.username || user.email?.split('@')[0] || 'Usuário'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao conectar');
      }

      // Sucesso!
      setIsTelegramLinked(true);
      toast({
        title: "✅ Conectado com sucesso!",
        description: "Agora você pode usar o bot do Telegram para consultar suas finanças!",
      });

      // Verificar status atualizado
      checkTelegramStatus();

    } catch (error: any) {
      console.error('Erro ao conectar:', error);
      toast({        title: "❌ Erro na conexão",
        description: error.message || "Tente novamente. Verifique se digitou o Chat ID correto.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Verificar status do Telegram no carregamento
  useEffect(() => {
    if (user?.id) {
      checkTelegramStatus();
    }
  }, [user?.id]);
  
  // Novo filtro por nome
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

    console.log('🚀 [Dashboard] INICIANDO SINCRONIZAÇÃO AGRESSIVA PARA TELEGRAM/IA');
    
    // INICIAR sincronização automática agressiva
    startAutoSync();
    
    // FORÇAR sincronização imediata
    forceSupabaseSync();

    // Agendar lembretes de contas a vencer (notificações push)
    import('@/utils/localStorage').then(({ getBills }) => {
      import('@/services/NotificationService').then(({ NotificationService }) => {
        const bills = getBills();
        NotificationService.scheduleBillReminders(bills);
      });
    });
    
    // Forçar o carregamento de todas as transações e recalcular o saldo total
    const allTransactions = getTransactions();
    if (allTransactions && allTransactions.length > 0) {
      // Calcular o saldo total com todas as transações
      const totalBalance = calculateBalance(allTransactions, []);
      setBalance(totalBalance);
    }
    
    // Carregar as transações do mês/ano selecionado
    loadTransactions(selectedMonth, selectedYear);    // Listener para atualizar transações quando houver novas (apenas uma vez)
    const handler = () => {
      console.log('📊 [Dashboard] Evento transactionsUpdated recebido!');
      
      // Simples atualização sem loops
      setTimeout(() => {
        loadTransactions(selectedMonth, selectedYear);
        
        // Recalcular saldo total
        const allTransactions = getTransactions();
        if (allTransactions && allTransactions.length > 0) {
          const totalBalance = calculateBalance(allTransactions, []);
          setBalance(totalBalance);
        }
      }, 100);
    };
    
    // Listener adicional para força reload das transações criadas via IA
    const forceReloadHandler = (event: any) => {
      console.log('🚀 [Dashboard] Force reload trigger from:', event.detail?.source || 'unknown');
      setTimeout(() => {
        loadTransactions(selectedMonth, selectedYear);
        
        // Recalcular saldo total
        const allTransactions = getTransactions();
        if (allTransactions && allTransactions.length > 0) {
          const totalBalance = calculateBalance(allTransactions, []);
          setBalance(totalBalance);
        }
      }, 200); // Delay maior para garantir que os dados foram salvos
    };
    
    // Listener específico para sincronização do Telegram
    const telegramSyncHandler = (event: any) => {
      console.log('📱 [Dashboard] Sincronização do Telegram detectada:', event.detail);
      
      // Toast para mostrar que nova transação chegou
      toast({
        title: "💰 Nova transação do Telegram!",
        description: "Sua transação foi sincronizada automaticamente.",
        duration: 3000,
      });
      
      // Forçar nova sincronização e atualização
      setTimeout(async () => {
        await forceSupabaseSync();
        loadTransactions(selectedMonth, selectedYear);
        
        // Recalcular saldo total
        const allTransactions = getTransactions();
        if (allTransactions && allTransactions.length > 0) {
          const totalBalance = calculateBalance(allTransactions, []);
          setBalance(totalBalance);
        }
      }, 300);
    };
    
    window.addEventListener('transactionsUpdated', handler);
    window.addEventListener('forceTransactionReload', forceReloadHandler);
    window.addEventListener('telegram-transaction-sync', telegramSyncHandler);
    
    return () => {
      console.log('🛑 [Dashboard] Cleanup - parando sincronização automática');
      stopAutoSync();
      window.removeEventListener('transactionsUpdated', handler);
      window.removeEventListener('forceTransactionReload', forceReloadHandler);
      window.removeEventListener('telegram-transaction-sync', telegramSyncHandler);
    };
  }, [navigate, selectedMonth, selectedYear]);

  // UseEffect para reagir às mudanças no filtro de nome
  useEffect(() => {
    loadTransactions(selectedMonth, selectedYear, !!startDate && !!endDate);
  }, [nameFilter]);

  const calculateTotalBalance = () => {
    const allTransactions = getTransactions();
    if (lastEditedTransactionIdForBalanceSkip) {
      // Pular o recálculo do saldo se necessário
      setLastEditedTransactionIdForBalanceSkip(null);
      return;
    }
    
    // Calcular saldo total com todas as transações
    const totalBalance = calculateBalance(allTransactions, [lastEditedTransactionIdForBalanceSkip || '']);
    setBalance(totalBalance);
    
    // Calcular variação percentual com base nos últimos 30 dias vs 30 dias anteriores
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);
    
    // Transações dos últimos 30 dias
    const last30DaysTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= thirtyDaysAgo && transactionDate <= today;
    });
    
    // Transações dos 30 dias anteriores aos últimos 30 dias
    const previous30DaysTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= sixtyDaysAgo && transactionDate < thirtyDaysAgo;
    });
    
    const last30DaysBalance = calculateBalance(last30DaysTransactions, [lastEditedTransactionIdForBalanceSkip || '']);
    const previous30DaysBalance = calculateBalance(previous30DaysTransactions, [lastEditedTransactionIdForBalanceSkip || '']);
    
    const change = calculatePercentageChange(last30DaysBalance, previous30DaysBalance);
    setPercentChange(change);
  };  const loadTransactions = (month: number, year: number, useCustomPeriod = false) => {
    console.log('📊 [loadTransactions] Iniciando carregamento...');
    const allTransactions = getTransactions();
    console.log(`📊 [loadTransactions] Total encontrado: ${allTransactions.length}`);
    
    // LOG: Mostrar as últimas 5 transações para debug
    if (allTransactions.length > 0) {
      const sortedByDate = [...allTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      console.log('📊 [DEBUG] Últimas 5 transações por data:', sortedByDate.slice(0, 5).map(t => ({
        title: t.title,
        date: t.date,
        dateStr: new Date(t.date).toISOString(),
        month: new Date(t.date).getMonth(),
        year: new Date(t.date).getFullYear()
      })));
    }
    
    let filteredTransactionsForDisplay = allTransactions;
    let filteredTransactionsForCalculation = allTransactions;
    
    // Para os cálculos de receitas/gastos, usar sempre o filtro de mês/ano
    filteredTransactionsForCalculation = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });
    console.log(`📊 [loadTransactions] Para cálculos - mês ${month + 1}/${year}: ${filteredTransactionsForCalculation.length}`);
    
    // Para exibição: se não há filtros específicos, mostrar transações mais recentes independente do mês
    if (useCustomPeriod && startDate && endDate) {
      // Se há filtro de período personalizado, aplicar ele
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');
      filteredTransactionsForDisplay = allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= start && transactionDate <= end;
      });
      console.log(`📊 [loadTransactions] Exibição - período personalizado: ${filteredTransactionsForDisplay.length}`);
    } else if (nameFilter.trim()) {
      // Se há filtro de nome, aplicar sobre todas as transações
      filteredTransactionsForDisplay = allTransactions.filter(t => 
        t.title.toLowerCase().includes(nameFilter.toLowerCase()) ||
        t.category.toLowerCase().includes(nameFilter.toLowerCase())
      );
      console.log(`📊 [loadTransactions] Exibição - filtro por nome: ${filteredTransactionsForDisplay.length}`);
    } else {
      // NOVA LÓGICA SIMPLIFICADA: Sempre mostrar as 20 transações mais recentes
      // Isso garante que transações criadas via PDF/AI apareçam imediatamente
      filteredTransactionsForDisplay = [...allTransactions];
      
      // Ordenar por data (mais recentes primeiro)
      filteredTransactionsForDisplay.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Limitar a 20 transações para performance
      filteredTransactionsForDisplay = filteredTransactionsForDisplay.slice(0, 20);
      
      // LOG: Mostrar detalhes das transações que serão exibidas
      console.log(`📊 [DEBUG] NOVA LÓGICA - Mostrando 20 transações mais recentes de TODAS as datas`);
      console.log(`📊 [DEBUG] Primeiras 5 transações:`, filteredTransactionsForDisplay.slice(0, 5).map(t => ({
        title: t.title,
        date: new Date(t.date).toISOString(),
        month: new Date(t.date).getMonth() + 1,
        year: new Date(t.date).getFullYear()
      })));
      
      // Separar entre mês atual e outros para informação
      const currentMonthCount = filteredTransactionsForDisplay.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
      }).length;
      
      const otherMonthsCount = filteredTransactionsForDisplay.length - currentMonthCount;
      
      console.log(`📊 [loadTransactions] Exibição - ${currentMonthCount} do mês atual + ${otherMonthsCount} de outros meses = ${filteredTransactionsForDisplay.length} total`);
    }
    
    // Sort final by date in descending order (most recent first)
    filteredTransactionsForDisplay.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // LOG: Mostrar as transações finais que serão exibidas
    console.log(`📊 [DEBUG] Transações FINAIS para exibição (primeiras 5):`, filteredTransactionsForDisplay.slice(0, 5).map(t => ({
      title: t.title,
      date: new Date(t.date).toISOString(),
      amount: t.amount,
      type: t.type
    })));
    
    console.log(`📊 [loadTransactions] Definindo ${filteredTransactionsForDisplay.length} transações para exibição`);
    setTransactions(filteredTransactionsForDisplay);

    // Calcular incomes e expenses APENAS para o mês selecionado (para os cards de resumo)
    const incomes = filteredTransactionsForCalculation.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactionsForCalculation.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalIncomes(incomes);
    setTotalExpenses(expenses);
    
    // Calcular o saldo total (independente do mês)
    calculateTotalBalance();
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
      // Processar valores em milhões (ex: 50 milhões, 1 milhão, etc)
      if (/\d+\s*(milhões|milhão|milhoes)/i.test(value)) {
        const numberPart = value.replace(/\s*(milhões|milhão|milhoes)/i, '').trim();
        const numericValue = parseFloat(numberPart) * 1000000;
        setNewTransaction({
          ...newTransaction,
          [name]: numericValue.toString(),
        });
        return;
      }
      
      // Processar valores em mil (ex: 50 mil, 1 mil, etc)
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
      id: uuidv4(), // Usar UUID válido para compatibilidade com o Supabase
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
      description: `${transaction.title} foi adicionada com sucesso no valor de ${formatCurrency(transaction.amount)}` // Corrigido aqui
    });
    
    // IMPORTANTE: Atualizar a lista de transações e o saldo
    setTimeout(() => {
      // Recarregar transações do mês atual
      loadTransactions(selectedMonth, selectedYear);
      
      // Recalcular o saldo total
      calculateTotalBalance();
    }, 100);  };
  
  const currentUser = getCurrentUser();
  const userName = currentUser ? currentUser.username : "Usuário";
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <h2 className="text-galileo-text text-lg font-bold leading-tight">
            Olá, {userName}!
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
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

      {/* Link para Análise Financeira Pessoal Section */}
      <div className="px-4 mb-6 flex justify-end">
        <Link
          to="/analise-financeira"
          className="flex items-center gap-1 px-3 py-1 rounded-md border border-green-200 bg-green-50 hover:bg-green-100 shadow-sm text-base font-semibold text-green-700 transition-all duration-150"
          style={{ textDecoration: 'none' }}
        >
          <DollarSign className="h-5 w-5 text-green-600" />
          <span className="text-xs">Análise Financeira</span>
        </Link>
      </div>      <div className="flex justify-center gap-4 mb-6">
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
      </div>      {/* Destaque do Telegram - Design Chamativo e Responsivo */}
      <div className="px-4 mb-4">
        {!isTelegramLinked ? (
          <div className="relative bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-300">
            {/* Destaque visual superior */}
            <div className="absolute -top-2 left-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-md">
              🚀 NOVO
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Ícone customizado sem logo */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                  <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm sm:text-base">
                    💬 Assistente Financeiro IA
                  </h3>
                  <p className="text-blue-100 text-xs sm:text-sm">
                    Controle suas finanças direto no Telegram
                    <span className="opacity-75"> • Em breve também no WhatsApp</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                    <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
                      Notificações em tempo real
                    </span>
                    <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs">
                      1 clique
                    </span>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={generateTelegramCode}
                disabled={isGeneratingCode}
                className="bg-white hover:bg-gray-100 text-blue-600 px-4 sm:px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto sm:min-w-[100px] text-sm sm:text-base"
              >
                {isGeneratingCode ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    <span>Conectando...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Conectar Agora</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-green-800 font-medium text-sm">Telegram Conectado ✅</h3>
                  <p className="text-green-600 text-xs">
                    {telegramInfo?.first_name ? (
                      <>
                        👤 {telegramInfo.first_name} {telegramInfo.last_name || ''} 
                        {telegramInfo.username && ` (@${telegramInfo.username})`}
                        <br />
                        📱 Recebendo notificações no bot
                      </>
                    ) : telegramInfo?.username ? (
                      <>@{telegramInfo.username} • Recebendo notificações</>
                    ) : (
                      <>Usuário conectado • Recebendo notificações</>
                    )}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex gap-2 pt-2 border-t border-green-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://t.me/stater', '_blank')}
                className="flex-1 text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
              >
                💬 Abrir Bot
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (confirm('🔌 Desconectar do Telegram?\n\nVocê não receberá mais notificações até conectar novamente.\n\nPara reconectar, vá em Configurações > Telegram.')) {
                    try {
                      const { error } = await supabase
                        .from('telegram_users')
                        .delete()
                        .eq('user_id', user?.id);
                      
                      if (error) throw error;
                      
                      setIsTelegramLinked(false);
                      setTelegramInfo(null);
                      
                      toast({
                        title: "🔌 Desconectado",
                        description: "Telegram desconectado! Para reconectar, vá em Configurações.",
                      });
                    } catch (error: any) {
                      toast({
                        title: "❌ Erro",
                        description: "Erro ao desconectar: " + error.message,
                        variant: "destructive"
                      });
                    }
                  }
                }}
                className="text-xs px-2 py-1 h-7 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
              >
                🔌 Desconectar
              </Button>
            </div>
          </div>
        )}
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
              <Select
                value={editingTransaction ? editingTransaction.category : newTransaction.category}
                onValueChange={value => {
                  if (editingTransaction) setEditingTransaction({ ...editingTransaction, category: value });
                  else setNewTransaction((prev: any) => ({ ...prev, category: value }));
                }}
              >
                <SelectTrigger id="category" name="category" className="bg-galileo-accent text-white">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-galileo-card text-galileo-text">
                  {((editingTransaction ? editingTransaction.type : newTransaction.type) === 'income'
                    ? INCOME_CATEGORIES
                    : EXPENSE_CATEGORIES).map((category: string) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
      
      
      <div className="px-4 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-3">
            <SpendingChart transactions={transactions} days={30} />
          </div>
        </div>
      </div>
      
      <h2 className="text-galileo-text text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-2">
        Últimas Transações
      </h2>
      
      <div className="px-4 mb-4 flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => setShowDateFilters(!showDateFilters)} 
            variant="outline" 
            size="sm"
            className="w-full sm:w-auto"
          >
            {showDateFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
          </Button>
          
          {/* Filtro rápido por nome sempre visível */}
          <div className="flex-1">
            <Input 
              placeholder="Buscar por nome ou categoria..." 
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="text-sm"
            />
          </div>
        </div>

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
                setNameFilter('');
                loadTransactions(selectedMonth, selectedYear); 
                setShowDateFilters(false);
              }} 
              variant="ghost" 
              className="mt-1 sm:mt-auto h-9 text-xs w-full sm:w-auto" 
              size="sm"
            >
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
      
      {(() => {
        const displayTransactions = showAllTransactionsInMonth ? transactions : transactions.slice(0, 5);
        console.log(`🎨 [RENDER] Renderizando ${displayTransactions.length} transações (de ${transactions.length} total)`);
        console.log(`🎨 [RENDER] Estado showAllTransactionsInMonth: ${showAllTransactionsInMonth}`);
        console.log(`🎨 [RENDER] Estado nameFilter: "${nameFilter}"`);
        console.log(`🎨 [RENDER] Estado startDate: ${startDate}, endDate: ${endDate}`);
        console.log(`🎨 [RENDER] Mês selecionado: ${selectedMonth + 1}/${selectedYear}`);
        
        if (displayTransactions.length > 0) {
          console.log('🎨 [RENDER] Primeiras 3 transações a serem renderizadas:', displayTransactions.slice(0, 3).map(t => ({
            id: t.id,
            title: t.title,
            date: new Date(t.date).toISOString(),
            amount: t.amount,
            type: t.type,
            category: t.category
          })));
        } else {
          console.log('🎨 [RENDER] PROBLEMA: Nenhuma transação para renderizar!');
          console.log('🎨 [RENDER] Array transactions completo:', transactions.map(t => ({
            id: t.id,
            title: t.title,
            date: new Date(t.date).toISOString(),
            month: new Date(t.date).getMonth(),
            year: new Date(t.date).getFullYear()
          })));
        }
        
        return displayTransactions.length > 0 ? displayTransactions.map((transaction: Transaction) => (
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
              <div className="flex gap-1">
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
                <button
                  aria-label="Excluir transação"
                  className="ml-1 text-galileo-secondaryText hover:text-galileo-negative"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  onClick={() => {
                    if (window.confirm(`Tem certeza que deseja excluir a transação "${transaction.title}"?`)) {
                      // Verificar se a transação tem a opção de não ajustar saldo
                      const shouldAdjustBalance = !transaction.dontAdjustBalanceOnSave;
                      
                      // Remover a transação
                      deleteTransaction(transaction.id);
                      
                      toast({
                        title: 'Transação excluída',
                        description: `A transação "${transaction.title}" foi excluída com sucesso.`
                      });
                      
                      // Forçar a atualização da lista de transações e do saldo
                      setTimeout(() => {
                        // Recarregar transações
                        loadTransactions(selectedMonth, selectedYear);
                        
                        // Atualizar o saldo total
                        const allTransactions = getTransactions();
                        const totalBalance = calculateBalance(allTransactions, []);
                        setBalance(totalBalance);
                        
                        // Recalcular incomes e expenses para o mês selecionado
                        const filteredTransactions = allTransactions.filter(t => {
                          const transactionDate = new Date(t.date);
                          return transactionDate.getMonth() === selectedMonth && 
                                 transactionDate.getFullYear() === selectedYear;
                        });
                        
                        const incomes = filteredTransactions.filter(t => t.type === 'income')
                          .reduce((sum, t) => sum + t.amount, 0);
                        const expenses = filteredTransactions.filter(t => t.type === 'expense')
                          .reduce((sum, t) => sum + t.amount, 0);
                        
                        setTotalIncomes(incomes);
                        setTotalExpenses(expenses);
                      }, 100);
                    }
                  }}
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>
          </div>
        ))
        : (
          <div className="flex flex-col items-center justify-center p-8">
            <p className="text-galileo-secondaryText mb-4">Nenhuma transação encontrada</p>
          </div>
        );
      })()}
      {transactions.length > 5 && (
        <div className="px-4 mt-4 mb-2 flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => setShowAllTransactionsInMonth(!showAllTransactionsInMonth)}
          >
            {showAllTransactionsInMonth ? 'Ver Menos' : 'Ver Todas as Transações'}
          </Button>
        </div>
      )}
      
      <NavBar />
      
      <TelegramConnectModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        onConnect={handleTelegramConnect}
      />
    </div>
  );
};

export default Dashboard;
