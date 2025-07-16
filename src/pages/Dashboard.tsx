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
import { RecurrenceConfig } from '@/components/transactions/RecurrenceConfig';
import { calculateNextOccurrence } from '@/utils/recurringProcessor';
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
  const [isTelegramLinked, setIsTelegramLinked] = useState(() => {
    // Inicializar com cache imediatamente se disponível
    if (typeof window !== 'undefined' && user?.id) {
      const cachedStatus = localStorage.getItem(`telegram_status_${user.id}`);
      return cachedStatus === 'true';
    }
    return false;
  });
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [telegramInfo, setTelegramInfo] = useState<any>(() => {
    // Inicializar com cache imediatamente se disponível
    if (typeof window !== 'undefined' && user?.id) {
      const cachedInfo = localStorage.getItem(`telegram_info_${user.id}`);
      return cachedInfo && cachedInfo !== 'null' ? JSON.parse(cachedInfo) : null;
    }
    return null;
  });
  const [telegramStatusChecked, setTelegramStatusChecked] = useState(() => {
    // Marcar como checado se já temos cache
    if (typeof window !== 'undefined' && user?.id) {
      const cachedStatus = localStorage.getItem(`telegram_status_${user.id}`);
      return cachedStatus !== null;
    }
    return false;
  });
  const [isCheckingTelegram, setIsCheckingTelegram] = useState(false); // Loading mais sutil

  // Funções do Telegram
  const checkTelegramStatus = async (force = false) => {
    // Evitar recarregamento visual desnecessário, exceto se forçado
    if (telegramStatusChecked && !force) return;
    
    if (!user?.id) return;
    
    setIsCheckingTelegram(true);
    
    try {
      const { data, error } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) {
        console.log('🔍 [TELEGRAM] Erro na consulta:', error.message);
        setIsTelegramLinked(false);
        setTelegramInfo(null);
        // Salvar no localStorage
        localStorage.setItem(`telegram_status_${user.id}`, 'false');
        localStorage.setItem(`telegram_info_${user.id}`, 'null');
        setTelegramStatusChecked(true);
        return;
      }
      
      if (data && data.length > 0) {
        console.log('✅ [TELEGRAM] Conectado:', data[0]);
        setIsTelegramLinked(true);
        setTelegramInfo(data[0]);
        // Salvar no localStorage
        localStorage.setItem(`telegram_status_${user.id}`, 'true');
        localStorage.setItem(`telegram_info_${user.id}`, JSON.stringify(data[0]));
      } else {
        console.log('🔍 [TELEGRAM] Não conectado - nenhum registro encontrado');
        setIsTelegramLinked(false);
        setTelegramInfo(null);
        // Salvar no localStorage
        localStorage.setItem(`telegram_status_${user.id}`, 'false');
        localStorage.setItem(`telegram_info_${user.id}`, 'null');
      }
      setTelegramStatusChecked(true);
    } catch (error) {
      console.error('❌ [TELEGRAM] Erro ao verificar status:', error);
      setIsTelegramLinked(false);
      setTelegramInfo(null);
      // Salvar no localStorage
      localStorage.setItem(`telegram_status_${user.id}`, 'false');
      localStorage.setItem(`telegram_info_${user.id}`, 'null');
      setTelegramStatusChecked(true);
    } finally {
      setIsCheckingTelegram(false);
    }
  };

  const resetTelegramStatus = () => {
    setTelegramStatusChecked(false);
    setIsTelegramLinked(false);
    setTelegramInfo(null);
    // Limpar localStorage
    if (user?.id) {
      localStorage.removeItem(`telegram_status_${user.id}`);
      localStorage.removeItem(`telegram_info_${user.id}`);
    }
  };  const generateTelegramCode = () => {
    if (!user?.id) return;
    setShowTelegramModal(true);
  };

  // Verificar status do Telegram no carregamento
  useEffect(() => {
    if (user?.id && !telegramStatusChecked) {
      // Só verificar no servidor se não tiver cache
      const cachedStatus = localStorage.getItem(`telegram_status_${user.id}`);
      if (!cachedStatus) {
        checkTelegramStatus();
      }
    }
  }, [user?.id, telegramStatusChecked]);
  
  // Novo filtro por nome
  const [newTransaction, setNewTransaction] = useState({
    title: '',
    amount: '',
    category: '',
    type: 'expense' as 'income' | 'expense',
    isRecurring: false,
    recurrenceFrequency: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    recurringDay: 1,
    recurringWeekday: 1
  });
  
  // useEffect ÚNICO e CONSOLIDADO para inicialização do Dashboard
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    console.log('🚀 [Dashboard] INICIALIZAÇÃO ÚNICA E CONSOLIDADA - EVITANDO RACE CONDITIONS');
    
    let debounceTimer: NodeJS.Timeout;
    let telegramToastTimer: NodeJS.Timeout;
    
    // Função de inicialização única
    const executarInicializacaoCompleta = async () => {
      try {
        // 1. Iniciar sincronização automática
        startAutoSync();
        
        // 2. Carregar transações LOCAL primeiro (para exibição imediata)
        const allTransactions = getTransactions();
        console.log(`📊 [Dashboard] Carregando ${allTransactions.length} transações locais primeiro`);
        
        if (allTransactions && allTransactions.length > 0) {
          // Filtrar transações recorrentes não processadas
          const validTransactions = allTransactions.filter(t => {
            if (t.isRecurring && !t.isRecurringInstance) {
              return false;
            }
            return true;
          });
          
          // Calcular saldo inicial
          const totalBalance = calculateBalance(validTransactions, []);
          setBalance(totalBalance);
          console.log('✅ [Dashboard] Saldo inicial (local):', totalBalance);
        }
        
        // 3. Carregar transações para exibição (local primeiro)
        loadTransactions(selectedMonth, selectedYear);
        
        // 4. DEPOIS sincronizar com Supabase (não bloquear UI)
        setTimeout(async () => {
          try {
            await forceSupabaseSync();
            console.log('✅ [Dashboard] Sincronização Supabase concluída (background)');
          } catch (error) {
            console.error('❌ [Dashboard] Erro na sincronização background:', error);
          }
        }, 1500); // Delay para não bloquear renderização inicial
        
        // 5. Agendar lembretes de contas
        import('@/utils/localStorage').then(({ getBills }) => {
          import('@/services/NotificationService').then(({ NotificationService }) => {
            const bills = getBills();
            NotificationService.scheduleBillReminders(bills);
          });
        });
        
        console.log('✅ [Dashboard] Inicialização consolidada concluída');
      } catch (error) {
        console.error('❌ [Dashboard] Erro na inicialização:', error);
      }
    };
    
    // Listeners para atualizações (com debounce)
    const handler = () => {
      console.log('📊 [Dashboard] Evento transactionsUpdated recebido!');
      
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadTransactions(selectedMonth, selectedYear);
        
        const allTransactions = getTransactions();
        if (allTransactions && allTransactions.length > 0) {
          const validTransactions = allTransactions.filter(t => {
            if (t.isRecurring && !t.isRecurringInstance) {
              return false;
            }
            return true;
          });
          
          const totalBalance = calculateBalance(validTransactions, []);
          setBalance(totalBalance);
          console.log('✅ [Dashboard] Saldo recalculado (handler):', totalBalance);
        }
      }, 1000);
    };
    
    const forceReloadHandler = (event: any) => {
      console.log('🚀 [Dashboard] Force reload trigger from:', event.detail?.source || 'unknown');
      
      if (event.detail?.source?.includes('force-sync')) {
        console.log('🚀 [Dashboard] Ignorando reload de force-sync para evitar loop');
        return;
      }
      
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadTransactions(selectedMonth, selectedYear);
        
        const allTransactions = getTransactions();
        if (allTransactions && allTransactions.length > 0) {
          const validTransactions = allTransactions.filter(t => {
            if (t.isRecurring && !t.isRecurringInstance) {
              return false;
            }
            return true;
          });
          
          const totalBalance = calculateBalance(validTransactions, []);
          setBalance(totalBalance);
          console.log('✅ [Dashboard] Saldo recalculado (forceReload):', totalBalance);
        }
      }, 1000);
    };
    
    const telegramSyncHandler = (event: any) => {
      console.log('📱 [Dashboard] Sincronização do Telegram detectada:', event.detail);
      
      clearTimeout(telegramToastTimer);
      telegramToastTimer = setTimeout(() => {
        if (event.detail?.transactions && event.detail.transactions.length > 0) {
          toast({
            title: "💰 Nova transação do Telegram!",
            description: "Sua transação foi sincronizada automaticamente.",
            duration: 3000,
          });
        }
      }, 2000);
      
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        loadTransactions(selectedMonth, selectedYear);
        
        const allTransactions = getTransactions();
        if (allTransactions && allTransactions.length > 0) {
          const validTransactions = allTransactions.filter(t => {
            if (t.isRecurring && !t.isRecurringInstance) {
              return false;
            }
            return true;
          });
          
          const totalBalance = calculateBalance(validTransactions, []);
          setBalance(totalBalance);
          console.log('✅ [Dashboard] Saldo recalculado (telegram):', totalBalance);
        }
      }, 1500);
    };
    
    // Registrar listeners
    window.addEventListener('transactionsUpdated', handler);
    window.addEventListener('forceTransactionReload', forceReloadHandler);
    window.addEventListener('telegram-transaction-sync', telegramSyncHandler);
    
    // Executar inicialização
    executarInicializacaoCompleta();
    
    // Cleanup
    return () => {
      console.log('🛑 [Dashboard] Cleanup - parando sincronização automática');
      stopAutoSync();
      clearTimeout(debounceTimer);
      clearTimeout(telegramToastTimer);
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
    
    // Filtrar transações recorrentes que ainda não foram processadas
    const validTransactions = allTransactions.filter(t => {
      // Se é recorrente e não é uma instância, não incluir no saldo
      if (t.isRecurring && !t.isRecurringInstance) {
        return false;
      }
      return true;
    });
    
    // Calcular saldo total com transações válidas (excluindo recorrentes não processadas)
    const totalBalance = calculateBalance(validTransactions, [lastEditedTransactionIdForBalanceSkip || '']);
    setBalance(totalBalance);
    
    // Calcular variação percentual com base nos últimos 30 dias vs 30 dias anteriores
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);
    
    // Transações dos últimos 30 dias
    const last30DaysTransactions = validTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= thirtyDaysAgo && transactionDate <= today;
    });
    
    // Transações dos 30 dias anteriores aos últimos 30 dias
    const previous30DaysTransactions = validTransactions.filter(t => {
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
    
    // Filtrar transações recorrentes que ainda não foram processadas APENAS para cálculos
    const validTransactionsForCalculation = allTransactions.filter(t => {
      // Se é recorrente e não é uma instância, não incluir nos cálculos
      if (t.isRecurring && !t.isRecurringInstance) {
        return false;
      }
      return true;
    });
    
    // Para exibição, filtrar apenas recorrentes não processadas (manter todas as instâncias normais)
    const validTransactionsForDisplay = allTransactions.filter(t => {
      // Se é recorrente e não é uma instância, não mostrar na lista de transações
      if (t.isRecurring && !t.isRecurringInstance) {
        return false;
      }
      return true;
    });
    
    console.log(`📊 [loadTransactions] Para cálculos: ${validTransactionsForCalculation.length}`);
    console.log(`📊 [loadTransactions] Para exibição: ${validTransactionsForDisplay.length}`);
    
    // LOG: Mostrar as últimas 5 transações para debug
    if (validTransactionsForDisplay.length > 0) {
      const sortedByDate = [...validTransactionsForDisplay].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      console.log('📊 [DEBUG] Últimas 5 transações por data:', sortedByDate.slice(0, 5).map(t => ({
        title: t.title,
        date: t.date,
        dateStr: new Date(t.date).toISOString(),
        month: new Date(t.date).getMonth(),
        year: new Date(t.date).getFullYear()
      })));
    }
    
    let filteredTransactionsForDisplay = validTransactionsForDisplay;
    let filteredTransactionsForCalculation = validTransactionsForCalculation;
    
    // Para os cálculos de receitas/gastos, usar sempre o filtro de mês/ano
    filteredTransactionsForCalculation = validTransactionsForCalculation.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });
    console.log(`📊 [loadTransactions] Para cálculos - mês ${month + 1}/${year}: ${filteredTransactionsForCalculation.length}`);
    
    // Para exibição: se não há filtros específicos, mostrar transações mais recentes independente do mês
    if (useCustomPeriod && startDate && endDate) {
      // Se há filtro de período personalizado, aplicar ele
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');
      filteredTransactionsForDisplay = validTransactionsForDisplay.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= start && transactionDate <= end;
      });
      console.log(`📊 [loadTransactions] Exibição - período personalizado: ${filteredTransactionsForDisplay.length}`);
    } else if (nameFilter.trim()) {
      // Se há filtro de nome, aplicar sobre transações válidas para exibição
      filteredTransactionsForDisplay = validTransactionsForDisplay.filter(t => 
        t.title.toLowerCase().includes(nameFilter.toLowerCase()) ||
        t.category.toLowerCase().includes(nameFilter.toLowerCase())
      );
      console.log(`📊 [loadTransactions] Exibição - filtro por nome: ${filteredTransactionsForDisplay.length}`);
    } else {
      // LÓGICA MELHORADA: Mostrar histórico completo das últimas transações
      // Esta é a seção "Últimas Transações" que deve ser acumulativa
      filteredTransactionsForDisplay = [...validTransactionsForDisplay];
      
      // Ordenar por data (mais recentes primeiro)
      filteredTransactionsForDisplay.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // CORREÇÃO: Mostrar as últimas 100 transações para um histórico mais completo
      // Isso garante que o usuário veja um histórico acumulativo e não perca transações
      filteredTransactionsForDisplay = filteredTransactionsForDisplay.slice(0, 100);
      
      console.log(`📊 [DEBUG] LISTA ACUMULATIVA - Mostrando últimas 100 transações (total encontrado: ${validTransactionsForDisplay.length})`);
      console.log(`📊 [DEBUG] Primeiras 3 transações:`, filteredTransactionsForDisplay.slice(0, 3).map(t => ({
        title: t.title,
        date: new Date(t.date).toLocaleDateString('pt-BR'),
        amount: t.amount,
        type: t.type
      })));
      
      // Estatísticas para debug: quantas por mês
      const monthCounts = filteredTransactionsForDisplay.reduce((acc, t) => {
        const monthKey = `${new Date(t.date).getMonth() + 1}/${new Date(t.date).getFullYear()}`;
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(`📊 [loadTransactions] Distribuição por mês:`, monthCounts);
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
      recurrenceFrequency: 'monthly',
      recurringDay: 1,
      recurringWeekday: 1
    });
    setDialogOpen(true);
  };
  
  
  // Função para processar valores monetários - simplificada para aceitar apenas números
  const parseMonetaryValue = (value: string): string => {
    if (!value) return '';
    
    // Processar valores normais - apenas números, pontos e vírgulas
    return parseMonetaryNumber(value).toString();
  };
  
  // Função para converter string monetária em número
  const parseMonetaryNumber = (value: string): number => {
    if (!value) return 0;
    
    // Remover espaços e caracteres especiais, manter apenas dígitos, vírgula e ponto
    let cleaned = value.replace(/[^\d.,]/g, '');
    
    // Se não tem vírgula nem ponto, é um número inteiro
    if (!cleaned.includes(',') && !cleaned.includes('.')) {
      return parseFloat(cleaned) || 0;
    }
    
    // Se tem vírgula e ponto, determinar qual é o separador decimal
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Se o último é vírgula, ela é o separador decimal
      if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
        // Ex: 1.234,56 -> 1234.56
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // Ex: 1,234.56 -> 1234.56
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (cleaned.includes(',')) {
      // Só tem vírgula - pode ser milhares ou decimal
      const parts = cleaned.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Provavelmente decimal: 123,45
        cleaned = cleaned.replace(',', '.');
      } else {
        // Provavelmente milhares: 1,234 ou 1,234,567
        cleaned = cleaned.replace(/,/g, '');
      }
    }
    // Se só tem ponto, manter como está (já é formato padrão)
    
    const result = parseFloat(cleaned) || 0;
    console.log('💰 [PARSE] Input:', value, '-> Cleaned:', cleaned, '-> Result:', result);
    return result;
  };

  const handleNewTransactionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'amount') {
      const processedValue = parseMonetaryValue(value);
      setNewTransaction({
        ...newTransaction,
        [name]: processedValue,
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
    
    // Usar a função parseMonetaryNumber para garantir conversão correta
    const amount = parseMonetaryNumber(newTransaction.amount);
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
      // Para transações recorrentes, adicionar campos necessários
      ...(newTransaction.isRecurring && {
        recurringDay: newTransaction.recurringDay,
        recurringWeekday: newTransaction.recurringWeekday,
        nextOccurrence: calculateNextOccurrence({
          ...newTransaction,
          recurrenceFrequency: newTransaction.recurrenceFrequency!,
          recurringDay: newTransaction.recurringDay,
          recurringWeekday: newTransaction.recurringWeekday
        } as Transaction),
        // Transações recorrentes NÃO devem afetar o saldo imediatamente
        dontAdjustBalanceOnSave: true
      }),
      dontAdjustBalanceOnSave: editingTransaction ? editingTransactionDontAdjustBalance : newTransaction.isRecurring // Para recorrentes, sempre true
    };
    
    saveTransaction(transaction);
    
    setNewTransaction({
      title: '',
      amount: '',
      category: '',
      type: 'expense',
      isRecurring: false,
      recurrenceFrequency: 'monthly',
      recurringDay: 1,
      recurringWeekday: 1
    });
    
    setDialogOpen(false);
    
    toast({
      title: `${type === 'income' ? 'Entrada' : 'Saída'} ${newTransaction.isRecurring ? 'recorrente' : ''} adicionada`,
      description: newTransaction.isRecurring 
        ? `${transaction.title} foi configurada como recorrente e será processada automaticamente`
        : `${transaction.title} foi adicionada com sucesso no valor de ${formatCurrency(transaction.amount)}`
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

      {/* Links para funcionalidades avançadas */}
      <div className="px-4 mb-6 flex justify-end gap-3">
        <Link
          to="/recurring-transactions"
          className="flex items-center gap-1 px-3 py-1 rounded-md border border-blue-200 bg-blue-50 hover:bg-blue-100 shadow-sm text-base font-semibold text-blue-700 transition-all duration-150"
          style={{ textDecoration: 'none' }}
        >
          <CalendarRange className="h-5 w-5 text-blue-600" />
          <span className="text-xs">Recorrentes</span>
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
      </div>      {/* Banner Telegram - Versão Discreta */}
      <div className="px-4 mb-4">
        {!isTelegramLinked ? (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-blue-900 dark:text-blue-100 font-medium text-sm">
                    Telegram Bot
                  </h4>
                  <p className="text-blue-700 dark:text-blue-300 text-xs">
                    Consulte suas finanças via Telegram
                  </p>
                </div>
              </div>
              
              <Button
                onClick={generateTelegramCode}
                disabled={isGeneratingCode}
                size="sm"
                variant="outline"
                className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900"
              >
                {isGeneratingCode ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-xs">Conectando...</span>
                  </div>
                ) : (
                  <span className="text-xs">Conectar</span>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="text-green-900 dark:text-green-100 font-medium text-sm">
                    Telegram Conectado ✅
                  </h4>
                  <p className="text-green-700 dark:text-green-300 text-xs">
                    {telegramInfo?.first_name ? (
                      <>@{telegramInfo.username || telegramInfo.first_name}</>
                    ) : (
                      <>Usuário conectado</>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://t.me/assistentefinanceiroiabot', '_blank')}
                  className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900"
                >
                  <span className="text-xs">Abrir Bot</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (confirm('🔌 Desconectar do Telegram?\n\nVocê não receberá mais notificações até conectar novamente.')) {
                      try {
                        const { error } = await supabase
                          .from('telegram_users')
                          .delete()
                          .eq('user_id', user?.id);
                        
                        if (error) throw error;
                        
                        // Usar função resetTelegramStatus
                        resetTelegramStatus();
                        
                        toast({
                          title: "🔌 Desconectado",
                          description: "Telegram desconectado com sucesso!",
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
                  className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900"
                >
                  <span className="text-xs">Desconectar</span>
                </Button>
              </div>
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
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
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
                type="number"
                step="0.01"
                min="0"
                value={editingTransaction ? String(editingTransaction.amount ?? '') : newTransaction.amount} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  if (editingTransaction) setEditingTransaction({...editingTransaction, amount: value === '' ? 0 : Number(value)});
                  else setNewTransaction({...newTransaction, amount: value});
                }}
                placeholder="Ex: 250"
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
            
            {/* Configuração de Recorrência */}
            <RecurrenceConfig
              transaction={editingTransaction || newTransaction}
              onChange={(updated) => {
                if (editingTransaction) {
                  setEditingTransaction(prev => ({
                    ...prev,
                    ...updated
                  }));
                } else {
                  setNewTransaction(prev => ({
                    ...prev,
                    ...updated
                  }));
                }
              }}
            />
            
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
                {formatCurrency(transaction.type === 'expense' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount))}
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
                        
                        // Atualizar o saldo total COM FILTRO
                        const allTransactions = getTransactions();
                        // Filtrar transações recorrentes não processadas
                        const validTransactions = allTransactions.filter(t => {
                          if (t.isRecurring && !t.isRecurringInstance) {
                            return false;
                          }
                          return true;
                        });
                        
                        const totalBalance = calculateBalance(validTransactions, []);
                        setBalance(totalBalance);
                        console.log('✅ [Dashboard] Saldo recalculado (deleteTransaction):', totalBalance);
                        
                        // Recalcular incomes e expenses para o mês selecionado
                        const filteredTransactions = validTransactions.filter(t => {
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
        onConnect={(code) => {
          setShowTelegramModal(false);
          // A lógica de conexão já está no modal
        }}
      />
    </div>
  );
};

export default Dashboard;
