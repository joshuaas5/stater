import React, { useCallback, useEffect, useState } from 'react';

import './Dashboard.module.css';
import './Dashboard.premium.css';
import { useNavigate, Link } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types';
import NavBar from '@/components/navigation/NavBar';
import BalanceCard from '@/components/dashboard/BalanceCard';
import { Eye, EyeOff, Edit } from 'lucide-react';
import SpendingChart from '@/components/dashboard/SpendingChart';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DollarSign, ArrowRight, MessageCircle, Check } from 'lucide-react';
import NotificationBell from '@/components/notifications/NotificationBell';
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

//  DEBUG: Log para identificar re-renderizaes do Dashboard
console.log(' Dashboard.tsx carregado/re-renderizado:', new Date().toISOString());

const Dashboard: React.FC = () => {
  console.log(' Dashboard component executando...');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  //  DEBUG: Detectar mudanas que causam re-render
  console.log(' [DASHBOARD] Estado atual:', {
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
    // Inicializar com cache imediatamente se disponvel
    if (typeof window !== 'undefined' && user?.id) {
      const cachedStatus = localStorage.getItem(`telegram_status_${user.id}`);
      return cachedStatus === 'true';
    }
    return false;
  });
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [telegramInfo, setTelegramInfo] = useState<any>(() => {
    // Inicializar com cache imediatamente se disponvel
    if (typeof window !== 'undefined' && user?.id) {
      const cachedInfo = localStorage.getItem(`telegram_info_${user.id}`);
      return cachedInfo && cachedInfo !== 'null' ? JSON.parse(cachedInfo) : null;
    }
    return null;
  });
  const [telegramStatusChecked, setTelegramStatusChecked] = useState(() => {
    // Marcar como checado se j temos cache
    if (typeof window !== 'undefined' && user?.id) {
      const cachedStatus = localStorage.getItem(`telegram_status_${user.id}`);
      return cachedStatus !== null;
    }
    return false;
  });
  const [isCheckingTelegram, setIsCheckingTelegram] = useState(false); // Loading mais sutil

  // Funes do Telegram
  const checkTelegramStatus = async (force = false) => {
    // Evitar recarregamento visual desnecessrio, exceto se forado
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
        console.log(' [TELEGRAM] Erro na consulta:', error.message);
        setIsTelegramLinked(false);
        setTelegramInfo(null);
        // Salvar no localStorage
        localStorage.setItem(`telegram_status_${user.id}`, 'false');
        localStorage.setItem(`telegram_info_${user.id}`, 'null');
        setTelegramStatusChecked(true);
        return;
      }
      
      if (data && data.length > 0) {
        console.log(' [TELEGRAM] Conectado:', data[0]);
        setIsTelegramLinked(true);
        setTelegramInfo(data[0]);
        // Salvar no localStorage
        localStorage.setItem(`telegram_status_${user.id}`, 'true');
        localStorage.setItem(`telegram_info_${user.id}`, JSON.stringify(data[0]));
      } else {
        console.log(' [TELEGRAM] No conectado - nenhum registro encontrado');
        setIsTelegramLinked(false);
        setTelegramInfo(null);
        // Salvar no localStorage
        localStorage.setItem(`telegram_status_${user.id}`, 'false');
        localStorage.setItem(`telegram_info_${user.id}`, 'null');
      }
      setTelegramStatusChecked(true);
    } catch (error) {
      console.error(' [TELEGRAM] Erro ao verificar status:', error);
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

  // Funo para forar atualizao do status do Telegram
  const refreshTelegramStatus = () => {
    resetTelegramStatus();
    setTimeout(() => {
      checkTelegramStatus(true);
    }, 1000);
  };

  // Verificar status do Telegram no carregamento
  useEffect(() => {
    if (user?.id && !telegramStatusChecked) {
      // S verificar no servidor se no tiver cache
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
  
  // useEffect NICO e CONSOLIDADO para inicializao do Dashboard
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    console.log(' [Dashboard] INICIALIZAO NICA E CONSOLIDADA - EVITANDO RACE CONDITIONS');
    
    let debounceTimer: NodeJS.Timeout;
    let telegramToastTimer: NodeJS.Timeout;
    
    // Funo de inicializao nica
    const executarInicializacaoCompleta = async () => {
      try {
        // 1. Iniciar sincronizao automtica
        startAutoSync();
        
        // 2. Carregar transaes LOCAL primeiro (para exibio imediata)
        const allTransactions = getTransactions();
        console.log(` [Dashboard] Carregando ${allTransactions.length} transaes locais primeiro`);
        
        if (allTransactions && allTransactions.length > 0) {
          // Filtrar transaes recorrentes no processadas
          const validTransactions = allTransactions.filter(t => {
            if (t.isRecurring && !t.isRecurringInstance) {
              return false;
            }
            return true;
          });
          
          // Calcular saldo inicial
          const totalBalance = calculateBalance(validTransactions, []);
          setBalance(totalBalance);
          console.log(' [Dashboard] Saldo inicial (local):', totalBalance);
        }
        
        // 3. Carregar transaes para exibio (local primeiro)
        loadTransactions(selectedMonth, selectedYear);
        
        // 4. DEPOIS sincronizar com Supabase (no bloquear UI)
        setTimeout(async () => {
          try {
            await forceSupabaseSync();
            console.log(' [Dashboard] Sincronizao Supabase concluda (background)');
          } catch (error) {
            console.error(' [Dashboard] Erro na sincronizao background:', error);
          }
        }, 1500); // Delay para no bloquear renderizao inicial
        
        // 5. Agendar lembretes de contas
        import('@/utils/localStorage').then(({ getBills }) => {
          import('@/services/NotificationService').then(({ NotificationService }) => {
            const bills = getBills();
            NotificationService.scheduleBillReminders(bills);
          });
        });
        
        console.log(' [Dashboard] Inicializao consolidada concluda');
      } catch (error) {
        console.error(' [Dashboard] Erro na inicializao:', error);
      }
    };
    
    // Listeners para atualizaes (com debounce)
    const handler = () => {
      console.log(' [Dashboard] Evento transactionsUpdated recebido!');
      
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
          console.log(' [Dashboard] Saldo recalculado (handler):', totalBalance);
        }
      }, 1000);
    };
    
    const forceReloadHandler = (event: any) => {
      console.log(' [Dashboard] Force reload trigger from:', event.detail?.source || 'unknown');
      
      if (event.detail?.source?.includes('force-sync')) {
        console.log(' [Dashboard] Ignorando reload de force-sync para evitar loop');
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
          console.log(' [Dashboard] Saldo recalculado (forceReload):', totalBalance);
        }
      }, 1000);
    };
    
    const telegramSyncHandler = (event: any) => {
      console.log(' [Dashboard] Sincronizao do Telegram detectada:', event.detail);
      
      clearTimeout(telegramToastTimer);
      telegramToastTimer = setTimeout(() => {
        if (event.detail?.transactions && event.detail.transactions.length > 0) {
          toast({
            title: " Nova transao do Telegram!",
            description: "Sua transao foi sincronizada automaticamente.",
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
          console.log(' [Dashboard] Saldo recalculado (telegram):', totalBalance);
        }
      }, 1500);
    };
    
    // Registrar listeners
    window.addEventListener('transactionsUpdated', handler);
    window.addEventListener('forceTransactionReload', forceReloadHandler);
    window.addEventListener('telegram-transaction-sync', telegramSyncHandler);
    
    // Executar inicializao
    executarInicializacaoCompleta();
    
    // Cleanup
    return () => {
      console.log(' [Dashboard] Cleanup - parando sincronizao automtica');
      stopAutoSync();
      clearTimeout(debounceTimer);
      clearTimeout(telegramToastTimer);
      window.removeEventListener('transactionsUpdated', handler);
      window.removeEventListener('forceTransactionReload', forceReloadHandler);
      window.removeEventListener('telegram-transaction-sync', telegramSyncHandler);
    };
  }, [navigate, selectedMonth, selectedYear]);

  // UseEffect para reagir s mudanas no filtro de nome
  useEffect(() => {
    loadTransactions(selectedMonth, selectedYear, !!startDate && !!endDate);
  }, [nameFilter]);

  const calculateTotalBalance = () => {
    const allTransactions = getTransactions();
    if (lastEditedTransactionIdForBalanceSkip) {
      // Pular o reclculo do saldo se necessrio
      setLastEditedTransactionIdForBalanceSkip(null);
      return;
    }
    
    // Filtrar transaes recorrentes que ainda no foram processadas
    const validTransactions = allTransactions.filter(t => {
      // Se  recorrente e no  uma instncia, no incluir no saldo
      if (t.isRecurring && !t.isRecurringInstance) {
        return false;
      }
      return true;
    });
    
    // Calcular saldo total com transaes vlidas (excluindo recorrentes no processadas)
    const totalBalance = calculateBalance(validTransactions, [lastEditedTransactionIdForBalanceSkip || '']);
    setBalance(totalBalance);
    
    // Calcular variao percentual com base nos ltimos 30 dias vs 30 dias anteriores
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(today.getDate() - 60);
    
    // Transaes dos ltimos 30 dias
    const last30DaysTransactions = validTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= thirtyDaysAgo && transactionDate <= today;
    });
    
    // Transaes dos 30 dias anteriores aos ltimos 30 dias
    const previous30DaysTransactions = validTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= sixtyDaysAgo && transactionDate < thirtyDaysAgo;
    });
    
    const last30DaysBalance = calculateBalance(last30DaysTransactions, [lastEditedTransactionIdForBalanceSkip || '']);
    const previous30DaysBalance = calculateBalance(previous30DaysTransactions, [lastEditedTransactionIdForBalanceSkip || '']);
    
    const change = calculatePercentageChange(last30DaysBalance, previous30DaysBalance);
    setPercentChange(change);
  };  const loadTransactions = (month: number, year: number, useCustomPeriod = false) => {
    console.log(' [loadTransactions] Iniciando carregamento...');
    const allTransactions = getTransactions();
    console.log(` [loadTransactions] Total encontrado: ${allTransactions.length}`);
    
    // Filtrar transaes recorrentes que ainda no foram processadas APENAS para clculos
    const validTransactionsForCalculation = allTransactions.filter(t => {
      // Se  recorrente e no  uma instncia, no incluir nos clculos
      if (t.isRecurring && !t.isRecurringInstance) {
        return false;
      }
      return true;
    });
    
    // Para exibio, filtrar apenas recorrentes no processadas (manter todas as instncias normais)
    const validTransactionsForDisplay = allTransactions.filter(t => {
      // Se  recorrente e no  uma instncia, no mostrar na lista de transaes
      if (t.isRecurring && !t.isRecurringInstance) {
        return false;
      }
      return true;
    });
    
    console.log(` [loadTransactions] Para clculos: ${validTransactionsForCalculation.length}`);
    console.log(` [loadTransactions] Para exibio: ${validTransactionsForDisplay.length}`);
    
    // LOG: Mostrar as ltimas 5 transaes para debug
    if (validTransactionsForDisplay.length > 0) {
      const sortedByDate = [...validTransactionsForDisplay].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      console.log(' [DEBUG] ltimas 5 transaes por data:', sortedByDate.slice(0, 5).map(t => ({
        title: t.title,
        date: t.date,
        dateStr: new Date(t.date).toISOString(),
        month: new Date(t.date).getMonth(),
        year: new Date(t.date).getFullYear()
      })));
    }
    
    let filteredTransactionsForDisplay = validTransactionsForDisplay;
    let filteredTransactionsForCalculation = validTransactionsForCalculation;
    
    // Para os clculos de receitas/gastos, usar sempre o filtro de ms/ano
    filteredTransactionsForCalculation = validTransactionsForCalculation.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === month && transactionDate.getFullYear() === year;
    });
    console.log(` [loadTransactions] Para clculos - ms ${month + 1}/${year}: ${filteredTransactionsForCalculation.length}`);
    
    // Para exibio: se no h filtros especficos, mostrar transaes mais recentes independente do ms
    if (useCustomPeriod && startDate && endDate) {
      // Se h filtro de perodo personalizado, aplicar ele
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');
      filteredTransactionsForDisplay = validTransactionsForDisplay.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= start && transactionDate <= end;
      });
      console.log(` [loadTransactions] Exibio - perodo personalizado: ${filteredTransactionsForDisplay.length}`);
    } else if (nameFilter.trim()) {
      // Se h filtro de nome, aplicar sobre transaes vlidas para exibio
      filteredTransactionsForDisplay = validTransactionsForDisplay.filter(t => 
        t.title.toLowerCase().includes(nameFilter.toLowerCase()) ||
        t.category.toLowerCase().includes(nameFilter.toLowerCase())
      );
      console.log(` [loadTransactions] Exibio - filtro por nome: ${filteredTransactionsForDisplay.length}`);
    } else {
      // LGICA MELHORADA: Mostrar histrico completo das ltimas transaes
      // Esta  a seo "ltimas Transaes" que deve ser acumulativa
      filteredTransactionsForDisplay = [...validTransactionsForDisplay];
      
      // Ordenar por data (mais recentes primeiro)
      filteredTransactionsForDisplay.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // CORREO: Mostrar as ltimas 100 transaes para um histrico mais completo
      // Isso garante que o usurio veja um histrico acumulativo e no perca transaes
      filteredTransactionsForDisplay = filteredTransactionsForDisplay.slice(0, 100);
      
      console.log(` [DEBUG] LISTA ACUMULATIVA - Mostrando ltimas 100 transaes (total encontrado: ${validTransactionsForDisplay.length})`);
      console.log(` [DEBUG] Primeiras 3 transaes:`, filteredTransactionsForDisplay.slice(0, 3).map(t => ({
        title: t.title,
        date: new Date(t.date).toLocaleDateString('pt-BR'),
        amount: t.amount,
        type: t.type
      })));
      
      // Estatsticas para debug: quantas por ms
      const monthCounts = filteredTransactionsForDisplay.reduce((acc, t) => {
        const monthKey = `${new Date(t.date).getMonth() + 1}/${new Date(t.date).getFullYear()}`;
        acc[monthKey] = (acc[monthKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log(` [loadTransactions] Distribuio por ms:`, monthCounts);
    }
    
    // Sort final by date in descending order (most recent first)
    filteredTransactionsForDisplay.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // LOG: Mostrar as transaes finais que sero exibidas
    console.log(` [DEBUG] Transaes FINAIS para exibio (primeiras 5):`, filteredTransactionsForDisplay.slice(0, 5).map(t => ({
      title: t.title,
      date: new Date(t.date).toISOString(),
      amount: t.amount,
      type: t.type
    })));
    
    console.log(` [loadTransactions] Definindo ${filteredTransactionsForDisplay.length} transaes para exibio`);
    setTransactions(filteredTransactionsForDisplay);

    // Calcular incomes e expenses APENAS para o ms selecionado (para os cards de resumo)
    const incomes = filteredTransactionsForCalculation.filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactionsForCalculation.filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    setTotalIncomes(incomes);
    setTotalExpenses(expenses);
    
    // Calcular o saldo total (independente do ms)
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
  
  
  // Funo para processar valores monetrios - simplificada para aceitar apenas nmeros
  const parseMonetaryValue = (value: string): string => {
    if (!value) return '';
    
    // Processar valores normais - apenas nmeros, pontos e vrgulas
    return parseMonetaryNumber(value).toString();
  };
  
  // Funo para converter string monetria em nmero
  const parseMonetaryNumber = (value: string): number => {
    if (!value) return 0;
    
    // Remover espaos e caracteres especiais, manter apenas dgitos, vrgula e ponto
    let cleaned = value.replace(/[^\d.,]/g, '');
    
    // Se no tem vrgula nem ponto,  um nmero inteiro
    if (!cleaned.includes(',') && !cleaned.includes('.')) {
      return parseFloat(cleaned) || 0;
    }
    
    // Se tem vrgula e ponto, determinar qual  o separador decimal
    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Se o ltimo  vrgula, ela  o separador decimal
      if (cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.')) {
        // Ex: 1.234,56 -> 1234.56
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // Ex: 1,234.56 -> 1234.56
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (cleaned.includes(',')) {
      // S tem vrgula - pode ser milhares ou decimal
      const parts = cleaned.split(',');
      if (parts.length === 2 && parts[1].length <= 2) {
        // Provavelmente decimal: 123,45
        cleaned = cleaned.replace(',', '.');
      } else {
        // Provavelmente milhares: 1,234 ou 1,234,567
        cleaned = cleaned.replace(/,/g, '');
      }
    }
    // Se s tem ponto, manter como est (j  formato padro)
    
    const result = parseFloat(cleaned) || 0;
    console.log(' [PARSE] Input:', value, '-> Cleaned:', cleaned, '-> Result:', result);
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
    // Remove a lgica de dontAdjustBalanceOnSave da criao de nova transao
    // Ela ser adicionada apenas no bloco de edio mais abaixo.

    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Usar a funo parseMonetaryNumber para garantir converso correta
    const amount = parseMonetaryNumber(newTransaction.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor invlido",
        description: "Por favor, informe um valor vlido para a transao",
        variant: "destructive"
      });
      return;
    }
    
    if (!newTransaction.title.trim()) {
      toast({
        title: "Ttulo obrigatrio",
        description: "Por favor, informe um ttulo para a transao",
        variant: "destructive"
      });
      return;
    }
    
    const type = newTransaction.type;
    
    const transaction: Transaction = {
      id: uuidv4(), // Usar UUID vlido para compatibilidade com o Supabase
      title: newTransaction.title,
      amount: amount,
      type: type,
      category: newTransaction.category || (type === 'income' ? 'Receita' : 'Outros'),
      date: new Date(),
      userId: user.id,
      isRecurring: newTransaction.isRecurring,
      recurrenceFrequency: newTransaction.isRecurring ? newTransaction.recurrenceFrequency : undefined,
      // Para transaes recorrentes, adicionar campos necessrios
      ...(newTransaction.isRecurring && {
        recurringDay: newTransaction.recurringDay,
        recurringWeekday: newTransaction.recurringWeekday,
        nextOccurrence: calculateNextOccurrence({
          ...newTransaction,
          recurrenceFrequency: newTransaction.recurrenceFrequency!,
          recurringDay: newTransaction.recurringDay,
          recurringWeekday: newTransaction.recurringWeekday
        } as Transaction),
        // Transaes recorrentes NO devem afetar o saldo imediatamente
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
      title: `${type === 'income' ? 'Entrada' : 'Sada'} ${newTransaction.isRecurring ? 'recorrente' : ''} adicionada`,
      description: newTransaction.isRecurring 
        ? `${transaction.title} foi configurada como recorrente e ser processada automaticamente`
        : `${transaction.title} foi adicionada com sucesso no valor de ${formatCurrency(transaction.amount)}`
    });
    
    // IMPORTANTE: Atualizar a lista de transaes e o saldo
    setTimeout(() => {
      // Recarregar transaes do ms atual
      loadTransactions(selectedMonth, selectedYear);
      
      // Recalcular o saldo total
      calculateTotalBalance();
    }, 100);  };
  
  const currentUser = getCurrentUser();
  const userName = currentUser ? currentUser.username : "Usurio";
  
  return (
    <div 
      className="min-h-screen relative overflow-hidden pb-20"
      style={{
        background: '#31518b',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/10 rounded-full"
            style={{
              width: i === 0 ? '4px' : i === 1 ? '6px' : '3px',
              height: i === 0 ? '4px' : i === 1 ? '6px' : '3px',
              left: i === 0 ? '10%' : i === 1 ? '85%' : '20%',
              top: i === 0 ? '20%' : i === 1 ? '60%' : '70%',
              animation: `float${i + 1} 6s ease-in-out infinite`,
              animationDelay: `${i * 2}s`
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10">
        {/* Premium Header */}
        <div 
          className="text-center pt-8 pb-6 px-8 relative"
          style={{
            background: 'rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-4">
              <img 
                src="/stater-logo-192.png" 
                alt="Stater Logo" 
                className="h-12 w-12 object-contain drop-shadow-lg"
              />
              <h2 
                className="text-white text-xl font-semibold"
                style={{
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  fontWeight: 600
                }}
              >
                Olá, {userName}!
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
            </div>
          </div>
          
          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              onClick={() => {
                const newDate = new Date(selectedYear, selectedMonth - 1);
                setSelectedMonth(newDate.getMonth());
                setSelectedYear(newDate.getFullYear());
                loadTransactions(newDate.getMonth(), newDate.getFullYear());
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              ‹
            </button>
            
            <div 
              className="px-6 py-3 rounded-3xl text-white font-medium"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
               {new Date(selectedYear, selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </div>
            
            <button
              onClick={() => {
                const newDate = new Date(selectedYear, selectedMonth + 1);
                setSelectedMonth(newDate.getMonth());
                setSelectedYear(newDate.getFullYear());
                loadTransactions(newDate.getMonth(), newDate.getFullYear());
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              ›
            </button>
          </div>
        </div>

        {/* Premium Balance Section */}
        <div className="pt-10 pb-9 px-8 text-center relative">
          <div className="flex items-center justify-between mb-6">
            <div 
              className="text-white/80 font-medium text-base uppercase tracking-wider"
              style={{ letterSpacing: '1px' }}
            >
              Saldo da Conta
            </div>
            <button
              aria-label={balanceVisible ? 'Ocultar saldo' : 'Mostrar saldo'}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
              onClick={() => setBalanceVisible((v: boolean) => !v)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {balanceVisible ? '•••' : '○○○'}
            </button>
          </div>
          
          <div 
            className="text-white font-light mb-5"
            style={{
              fontSize: '42px',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)',
              letterSpacing: '-1px',
              fontWeight: 300
            }}
          >
            {balanceVisible ? formatCurrency(balance) : '••••••'}
          </div>
          
          <div 
            className={`inline-block px-5 py-3 rounded-3xl font-semibold text-sm ${
              percentChange >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
            style={{
              background: percentChange >= 0 
                ? 'rgba(76, 175, 80, 0.2)' 
                : 'rgba(244, 67, 54, 0.2)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${percentChange >= 0 
                ? 'rgba(76, 175, 80, 0.3)' 
                : 'rgba(244, 67, 54, 0.3)'}`
            }}
          >
            {percentChange !== undefined && percentChange !== null && !isNaN(percentChange) 
              ? `${percentChange >= 0 ? '+' : ''}${Number(percentChange).toFixed(0)}%` 
              : '---%'              } Últimos 30 Dias
          </div>
        </div>

        {/* Premium Quick Actions */}
        <div className="flex px-8 gap-3 mb-4">
          <button 
            onClick={() => handleAddTransaction('income')}
            className="flex-1 flex items-center justify-center gap-2 py-5 px-3 rounded-2xl text-white font-medium text-sm hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(76, 175, 80, 0.1))',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}
          >
            <span style={{ fontSize: '16px' }}>↗</span>
            Entrada
          </button>
          <button 
            onClick={() => handleAddTransaction('expense')}
            className="flex-1 flex items-center justify-center gap-2 py-5 px-3 rounded-2xl text-white font-medium text-sm hover:-translate-y-1 transition-all duration-300 hover:shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2), rgba(244, 67, 54, 0.1))',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(244, 67, 54, 0.3)'
            }}
          >
            <span style={{ fontSize: '16px' }}>↙</span>
            Saída
          </button>
        </div>

        {/* Premium Telegram Section */}
        <div 
          className="mx-8 mb-6 p-5 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {!isTelegramLinked ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{
                      background: 'linear-gradient(135deg, #0088cc, #0074b3)'
                    }}
                  >
                    TG
                  </div>
                  <h4 className="text-white text-base font-semibold">
                    Telegram Bot
                  </h4>
                </div>
                <button
                  onClick={refreshTelegramStatus}
                  className="px-3 py-1 rounded-lg text-white text-xs hover:bg-white/20 transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  ↻
                </button>
              </div>
              <p className="text-white/70 text-sm mb-4">
                Consulte suas finanças via Telegram
              </p>
              <div className="flex justify-end">
                <button
                  onClick={generateTelegramCode}
                  disabled={isGeneratingCode}
                  className="px-6 py-3 rounded-xl text-white text-sm font-semibold hover:-translate-y-0.5 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #0088cc, #0074b3)',
                    boxShadow: isGeneratingCode ? 'none' : '0 8px 25px rgba(0, 136, 204, 0.3)'
                  }}
                >
                  {isGeneratingCode ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                      <span>Conectando...</span>
                    </div>
                  ) : (
                    'Conectar'
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{
                      background: 'linear-gradient(135deg, #4caf50, #45a049)'
                    }}
                  >
                    ✓
                  </div>
                  <h4 className="text-white text-base font-semibold">
                    Telegram Conectado
                  </h4>
                </div>
              </div>
              <p className="text-green-200 text-sm mb-4">
                {telegramInfo?.first_name ? (
                  <>@{telegramInfo.username || telegramInfo.first_name}</>
                ) : (
                  <>Usuário conectado</>
                )}
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => window.open('https://t.me/assistentefinanceiroiabot', '_blank')}
                  className="px-4 py-2 rounded-xl text-white text-sm hover:-translate-y-0.5 transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  Abrir Bot
                </button>
                <button
                  onClick={async () => {
                    if (confirm('🔌 Desconectar do Telegram?\n\nVocê não receberá mais notificações até conectar novamente.')) {
                      try {
                        const { error } = await supabase
                          .from('telegram_users')
                          .delete()
                          .eq('user_id', user?.id);
                        
                        if (error) throw error;
                        
                        resetTelegramStatus();
                        
                        toast({
                          title: "📱 Desconectado",
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
                  className="px-4 py-2 rounded-xl text-red-200 text-sm hover:-translate-y-0.5 transition-all duration-300"
                  style={{
                    background: 'rgba(244, 67, 54, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(244, 67, 54, 0.3)'
                  }}
                >
                  Desconectar
                </button>
              </div>
            </>
          )}
        </div>

      <Dialog open={dialogOpen} onOpenChange={(open: boolean) => {
        setDialogOpen(open);
        if (!open) {
          setEditingTransaction(null);
          setEditingTransactionDontAdjustBalance(false); // Resetar aqui
        }
      }}>
        <DialogContent 
          className="max-h-[90vh] overflow-y-auto border-0"
          style={{
            background: 'linear-gradient(135deg, #4a6cf7 0%, #5a7cfa 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">
              {editingTransaction
                ? (editingTransaction.type === 'income' ? 'Editar Entrada' : 'Editar Sada')
                : (newTransaction.type === 'income' ? 'Adicionar Nova Entrada' : 'Adicionar Nova Sada')}
            </DialogTitle>
            <DialogDescription className="text-white/80">
              {editingTransaction
                ? (editingTransaction.type === 'income' ? 'Edite uma receita ou entrada financeira.' : 'Edite uma despesa ou sada financeira.')
                : (newTransaction.type === 'income' ? 'Adicione uma nova receita ou entrada financeira.' : 'Adicione uma nova despesa ou sada financeira.')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-white font-medium">Descrição</Label>
              <Input 
                id="title" 
                name="title"
                value={editingTransaction ? editingTransaction.title : newTransaction.title} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (editingTransaction) setEditingTransaction({...editingTransaction, title: e.target.value});
                  else handleNewTransactionChange(e);
                }}
                placeholder={`Ex: ${(editingTransaction ? editingTransaction.type : newTransaction.type) === 'income' ? 'Salário, Freelance' : 'Aluguel, Supermercado'}`}
                className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-blue-400 focus:bg-white/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount" className="text-white font-medium">Valor</Label>
              <Input 
                id="amount" 
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={editingTransaction ? String(editingTransaction.amount ?? '') : newTransaction.amount} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (editingTransaction) setEditingTransaction({...editingTransaction, amount: parseFloat(e.target.value) || 0});
                  else handleNewTransactionChange(e);
                }}
                placeholder="0,00"
                className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-blue-400 focus:bg-white/20"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-white font-medium">Categoria</Label>
              <Select
                value={editingTransaction ? editingTransaction.category : newTransaction.category}
                onValueChange={value => {
                  if (editingTransaction) setEditingTransaction({ ...editingTransaction, category: value });
                  else setNewTransaction((prev: any) => ({ ...prev, category: value }));
                }}
              >
                <SelectTrigger 
                  id="category" 
                  name="category" 
                  className="bg-white/10 border-white/20 text-white focus:border-blue-400 focus:bg-white/20"
                >
                  <SelectValue placeholder="Selecione uma categoria" className="text-white/80" />
                </SelectTrigger>
                <SelectContent 
                  className="border-white/20"
                  style={{
                    background: 'linear-gradient(135deg, #4a6cf7 0%, #5a7cfa 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {((editingTransaction ? editingTransaction.type : newTransaction.type) === 'income'
                    ? INCOME_CATEGORIES
                    : EXPENSE_CATEGORIES).map((category: string) => (
                      <SelectItem 
                        key={category} 
                        value={category}
                        className="text-white hover:bg-white/10 focus:bg-white/20"
                      >
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Configurao de Recorrncia */}
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
                />                  <Label 
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
            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300'
            : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300'
        }
      >
        Salvar {editingTransaction.type === 'income' ? 'Entrada' : 'Sada'}
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
        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        data-testid="delete-transaction-btn"
      >
        Excluir
      </Button>
    </div>
  ) : (
    <Button
      onClick={() => {
          // Garante que a converso para nmero ocorra aqui tambm, como no onChange do input.
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
          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300'
          : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300'
      }
    >
      Salvar {newTransaction.type === 'income' ? 'Entrada' : 'Sada'}
    </Button>
  )}
</DialogFooter>
        </DialogContent>
      </Dialog>
      
        <div className="px-4 mb-4">
          <h2 
            className="text-white text-xl font-semibold leading-tight tracking-normal pb-3 pt-2"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              textShadow: 'rgba(0, 0, 0, 0.3) 1px 1px 2px',
              letterSpacing: '0.025em'
            }}            >
            Últimas Transações
          </h2>
        </div>
      
        <div className="px-4 mb-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-4">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2">                  <Button 
                    onClick={() => setShowDateFilters(!showDateFilters)} 
                    variant="outline" 
                    size="sm"
                    className="w-full sm:w-auto bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 shadow-lg transition-all duration-300"
                  >
                    {showDateFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
                  </Button>
                
                {/* Filtro rpido por nome sempre visvel */}
                <div className="flex-1">
                  <Input 
                    placeholder="Buscar por nome ou categoria..." 
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="text-sm bg-white/15 backdrop-blur-sm border-white/30 text-white placeholder-white/80 focus:border-blue-400 focus:bg-white/25 transition-all duration-300 shadow-lg"
                  />
                </div>
              </div>

              {showDateFilters && (
                <div className="flex flex-col sm:flex-row gap-2 items-center pt-2">
                  <div className="grid w-full sm:w-auto gap-1.5">
                    <Label htmlFor="start-date" className="text-xs text-white/80">De:</Label>
                    <Input type="date" id="start-date" value={startDate || ''} onChange={(e) => setStartDate(e.target.value)} className="text-sm bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-blue-400 focus:bg-white/20 transition-all duration-300" />
                  </div>
                  <div className="grid w-full sm:w-auto gap-1.5">
                    <Label htmlFor="end-date" className="text-xs text-white/80">At:</Label>
                    <Input type="date" id="end-date" value={endDate || ''} onChange={(e) => setEndDate(e.target.value)} className="text-sm bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-blue-400 focus:bg-white/20 transition-all duration-300" />
                  </div>
                  <Button onClick={() => loadTransactions(selectedMonth, selectedYear, true)} className="mt-4 sm:mt-auto h-9 w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300" size="sm">Filtrar Período</Button>
                  <Button 
                    onClick={() => {
                      setStartDate(null); 
                      setEndDate(null); 
                      setNameFilter('');
                      loadTransactions(selectedMonth, selectedYear); 
                      setShowDateFilters(false);
                    }} 
                    variant="ghost" 
                    className="mt-1 sm:mt-auto h-9 text-xs w-full sm:w-auto text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300" 
                    size="sm"
                  >
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      
      {(() => {
        const displayTransactions = showAllTransactionsInMonth ? transactions : transactions.slice(0, 5);
        console.log(` [RENDER] Renderizando ${displayTransactions.length} transaes (de ${transactions.length} total)`);
        console.log(` [RENDER] Estado showAllTransactionsInMonth: ${showAllTransactionsInMonth}`);
        console.log(` [RENDER] Estado nameFilter: "${nameFilter}"`);
        console.log(` [RENDER] Estado startDate: ${startDate}, endDate: ${endDate}`);
        console.log(` [RENDER] Ms selecionado: ${selectedMonth + 1}/${selectedYear}`);
        
        if (displayTransactions.length > 0) {
          console.log(' [RENDER] Primeiras 3 transaes a serem renderizadas:', displayTransactions.slice(0, 3).map(t => ({
            id: t.id,
            title: t.title,
            date: new Date(t.date).toISOString(),
            amount: t.amount,
            type: t.type,
            category: t.category
          })));
        } else {
          console.log(' [RENDER] PROBLEMA: Nenhuma transao para renderizar!');
          console.log(' [RENDER] Array transactions completo:', transactions.map(t => ({
            id: t.id,
            title: t.title,
            date: new Date(t.date).toISOString(),
            month: new Date(t.date).getMonth(),
            year: new Date(t.date).getFullYear()
          })));
        }
        
        return displayTransactions.length > 0 ? (
          <div className="px-4 space-y-3">
            {displayTransactions.map((transaction: Transaction) => (
              <div key={transaction.id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-4 hover:bg-white/15 transition-colors duration-300">
                <div className="flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-white flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 shrink-0 size-12">
                      {transaction.isRecurring ? 
                        <CalendarRange size={24} /> : 
                        (transaction.type === 'income' ? <TrendingUp size={24} /> : <CreditCard size={24} />)
                      }
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="text-white text-base font-medium leading-normal line-clamp-1">
                        {transaction.title}
                      </p>
                      <p className="text-white/70 text-sm font-normal leading-normal line-clamp-2">
                        {transaction.category} {transaction.isRecurring && '(Recorrente)'}
                      </p>
                      <p className="text-white/50 text-xs font-normal leading-normal">
                        {new Date(transaction.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className={`text-base font-semibold leading-normal ${
                      transaction.type === 'income' ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {formatCurrency(transaction.type === 'expense' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount))}
                    </p>
                    <div className="flex gap-1">
                      <button
                        aria-label="Editar transao"
                        className="ml-2 text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-all duration-300"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => {
                          setEditingTransactionDontAdjustBalance(transaction.dontAdjustBalanceOnSave || false);
                          setEditingTransaction(transaction);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        aria-label="Excluir transao"
                        className="ml-1 text-white/60 hover:text-red-300 p-1 rounded-lg hover:bg-red-500/20 transition-all duration-300"
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja excluir a transao "${transaction.title}"?`)) {
                            const shouldAdjustBalance = !transaction.dontAdjustBalanceOnSave;
                            deleteTransaction(transaction.id);
                            toast({
                              title: 'Transação excluída',
                              description: `A transação "${transaction.title}" foi excluída com sucesso.`
                            });
                            setTimeout(() => {
                              loadTransactions(selectedMonth, selectedYear);
                              const allTransactions = getTransactions();
                              const validTransactions = allTransactions.filter(t => {
                                if (t.isRecurring && !t.isRecurringInstance) {
                                  return false;
                                }
                                return true;
                              });
                              const totalBalance = calculateBalance(validTransactions, []);
                              setBalance(totalBalance);
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
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 hover:bg-white/15 transition-colors duration-300">
              <div className="flex flex-col items-center justify-center">
                <p className="text-white/70 mb-4">Nenhuma transação encontrada</p>
              </div>
            </div>
          </div>
        );
      })()}
        {transactions.length > 5 && (
          <div className="px-4 mt-4 mb-2 flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowAllTransactionsInMonth(!showAllTransactionsInMonth)}
              className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {showAllTransactionsInMonth ? 'Ver Menos' : 'Ver Todas as Transações'}
            </Button>
          </div>
        )}
      
      {/* NavBar Original */}
      <NavBar />
      
      <TelegramConnectModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        onConnect={(code) => {
          setShowTelegramModal(false);
          // Forar atualizao do status aps conectar
          setTimeout(() => {
            refreshTelegramStatus();
          }, 2000);
        }}
      />
      </div>
    </div>
  );
};

export default Dashboard;
