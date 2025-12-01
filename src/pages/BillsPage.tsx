import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Bill, CardItem, EXPENSE_CATEGORIES, PlanType } from '@/types';
import { getBills, isLoggedIn, markBillAsPaid, saveBill, updateBill, deleteBill } from '@/utils/localStorage';
import { formatCurrency, getOverdueBills, getBillsDueInNextDays } from '@/utils/dataProcessing';
import { useToast } from '@/hooks/use-toast';
import { UserPlanManager } from '@/utils/userPlanManager';
import { AdManager } from '@/utils/adManager';
import { PaywallModal, usePaywallModal } from '@/components/ui/PaywallModal';
import { 
  CalendarCheck, Clock, CreditCard, FileText, FileMinus, Plus, 
  Edit, MoreVertical, Trash, Calendar, Mail, X, Send, Loader2,
  Check, Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Helper function for capitalizing strings
const capitalizeFirstLetter = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Função para formatar a data de vencimento/status (mantida como na última versão que o usuário aprovou para o status principal)
const formatBillDisplayDateAndStatus = (bill: Bill): { text: string; className: string } => {
  if (bill.isPaid) {
    return { text: "Paga", className: "text-green-600 dark:text-green-400 font-semibold" };
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(bill.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `Vencida há ${Math.abs(diffDays)} dia(s)`, className: "text-red-600 dark:text-red-400 font-semibold" };
  }
  if (diffDays === 0) {
    return { text: "Vence hoje", className: "text-orange-500 dark:text-orange-400 font-semibold" };
  }
  return { text: `A vencer em ${diffDays} dia(s)`, className: "text-blue-600 dark:text-blue-400" };
};

const BillsPage: React.FC = () => {
  // Estados principais
  const [bills, setBills] = useState<Bill[]>([]);
  const [overdueBills, setOverdueBills] = useState<Bill[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<Bill[]>([]);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'overdue' | 'all'>('upcoming');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const { toast } = useToast();

  // Estados para o seletor de mês/ano
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Estados de monetização
  const [userId, setUserId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<any>(null);
  const { isOpen: paywallOpen, trigger: paywallTrigger, openPaywall, closePaywall } = usePaywallModal();
  
  // Estado para notificações por email
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState<boolean>(true);
  const [loadingEmailPref, setLoadingEmailPref] = useState<boolean>(false);
  const [sendingEmailReport, setSendingEmailReport] = useState<boolean>(false);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    initializeUser();
    loadBills();
  }, [navigate, selectedMonth, selectedYear]); // Adicionado selectedMonth e selectedYear às dependências
  
  // Inicializar usuário do Supabase
  const initializeUser = async () => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error('Erro ao obter usuário:', error);
        navigate('/login');
        return;
      }
      
      setUserId(user.id);
      console.log('🔐 [BILLS] Usuário autenticado:', user.id);
      
      // Carregar plano após definir userId
      loadUserPlan(user.id);
      
      // Carregar preferência de notificações por email
      loadEmailNotificationPreference(user.id);
    } catch (error) {
      console.error('Erro na inicialização do usuário:', error);
      navigate('/login');
    }
  };
  
  // Carregar preferência de notificações por email do Supabase
  const loadEmailNotificationPreference = async (uid: string) => {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('email_notifications')
        .eq('user_id', uid)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar preferência de email:', error);
        return;
      }
      
      // Se existe, usar o valor do banco; senão, default é true
      setEmailNotificationsEnabled(data?.email_notifications ?? true);
    } catch (error) {
      console.error('Erro ao carregar preferência de email:', error);
    }
  };
  
  // Salvar preferência de notificações por email
  const toggleEmailNotifications = async () => {
    if (!userId || loadingEmailPref) return;
    
    setLoadingEmailPref(true);
    const newValue = !emailNotificationsEnabled;
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Upsert para criar ou atualizar
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          email_notifications: newValue,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });
      
      if (error) {
        console.error('Erro ao salvar preferência de email:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível salvar a preferência. Tente novamente.',
          variant: 'destructive'
        });
        return;
      }
      
      setEmailNotificationsEnabled(newValue);
      toast({
        title: newValue ? '📧 Notificações ativadas' : '🔕 Notificações desativadas',
        description: newValue 
          ? 'Você receberá lembretes semanais por e-mail.' 
          : 'Você não receberá mais lembretes por e-mail.',
      });
    } catch (error) {
      console.error('Erro ao salvar preferência de email:', error);
    } finally {
      setLoadingEmailPref(false);
    }
  };
  
  // Função para enviar relatório de contas por email
  const sendBillsReportEmail = async () => {
    if (!userId || sendingEmailReport) return;
    
    setSendingEmailReport(true);
    
    try {
      const { supabase } = await import('@/lib/supabase');
      
      // Buscar dados do usuário
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.email) {
        throw new Error('Não foi possível obter seu email');
      }
      
      // Pegar contas a vencer nos próximos 7 dias (não pagas)
      const today = new Date();
      const in7Days = new Date(today);
      in7Days.setDate(in7Days.getDate() + 7);
      
      const billsDueIn7Days = bills.filter(bill => {
        if (bill.isPaid) return false;
        const dueDate = new Date(bill.dueDate);
        return dueDate >= today && dueDate <= in7Days;
      });
      
      // Pegar contas vencidas (não pagas)
      const overdueList = bills.filter(bill => {
        if (bill.isPaid) return false;
        const dueDate = new Date(bill.dueDate);
        return dueDate < today;
      });
      
      // Calcular total
      const totalDue = billsDueIn7Days.reduce((sum, b) => sum + b.amount, 0);
      const totalOverdue = overdueList.reduce((sum, b) => sum + b.amount, 0);
      
      // Chamar edge function para enviar email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: user.email,
          type: 'bills_report',
          data: {
            userName: user.user_metadata?.name || user.email.split('@')[0],
            billsDueIn7Days: billsDueIn7Days.map(b => ({
              title: b.title,
              amount: b.amount,
              dueDate: new Date(b.dueDate).toLocaleDateString('pt-BR'),
              category: b.category
            })),
            overdueBills: overdueList.map(b => ({
              title: b.title,
              amount: b.amount,
              dueDate: new Date(b.dueDate).toLocaleDateString('pt-BR'),
              category: b.category
            })),
            totalDue,
            totalOverdue,
            reportDate: new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: '📧 Email enviado!',
        description: `Relatório enviado para ${user.email}`,
      });
      
    } catch (error: any) {
      console.error('Erro ao enviar email:', error);
      toast({
        title: 'Erro ao enviar',
        description: error.message || 'Não foi possível enviar o relatório. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setSendingEmailReport(false);
    }
  };
  
  const loadUserPlan = async (userIdParam?: string) => {
    const targetUserId = userIdParam || userId;
    if (!targetUserId) return;
    
    try {
      const plan = await UserPlanManager.getUserPlan(targetUserId);
      setUserPlan(plan);
      console.log('📊 [BILLS] Plano carregado:', plan.planType);
    } catch (error) {
      console.error('Erro ao carregar plano do usuário:', error);
    }
  };
  
  const loadBills = () => {
    const allUserBills = getBills().map(bill => ({
      ...bill,
      dueDate: new Date(bill.dueDate) 
    }));

    // Com a nova lógica, cada parcela é uma conta individual.
    // Filtramos diretamente pelo mês e ano da dueDate de cada conta.
    const filteredForMonthYear = allUserBills.filter(bill => {
      const billDueDate = bill.dueDate; // Já é um objeto Date
      return billDueDate.getFullYear() === selectedYear && billDueDate.getMonth() === selectedMonth;
    });

    // Não há mais necessidade de ajustar dueDate ou calcular displayInstallment aqui,
    // pois isso é feito na criação da conta em AddBillPage.
    setBills(filteredForMonthYear);
    setOverdueBills(getOverdueBills(filteredForMonthYear));
    setUpcomingBills(getBillsDueInNextDays(filteredForMonthYear, 30)); 
  };
  
  // ... (restante das funções existentes como handleAddBill, handleDeleteBill, etc.)
  
  // Funções auxiliares para gerar opções de mês/ano
  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      value: i,
      label: new Date(0, i).toLocaleString('pt-BR', { month: 'long' })
    }));
  }, []);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 2; i++) { // Ajustado range para +2 anos no futuro
      years.push({ value: i, label: String(i) });
    }
    return years;
  }, []);

  const handleDeleteBill = (billId: string) => {
    console.log('Tentando excluir conta com id:', billId);
    if (window.confirm('Tem certeza que deseja excluir esta conta? Esta ação não poderá ser desfeita.')) {
      deleteBill(billId);
      setTimeout(() => {
        loadBills();
        console.log('Contas recarregadas após exclusão');
      }, 100);
      toast({
        title: 'Conta excluída',
        description: 'A conta foi removida com sucesso.',
      });
    }
  };

  const handleAddBill = async () => {
    console.log('🎯 [MONETIZAÇÃO] handleAddBill chamado para userId:', userId);
    
    // Verificar se userId está disponível
    if (!userId) {
      console.error('❌ [ERRO] UserId não disponível');
      toast({
        title: 'Erro de autenticação',
        description: 'Por favor, faça login novamente.',
      });
      navigate('/login');
      return;
    }
    
    try {
      // Verificar se usuário atingiu paywall
      const hasReachedPaywall = await AdManager.hasReachedPaywall(userId);
      console.log('🚫 [PAYWALL] hasReachedPaywall:', hasReachedPaywall);
      
      if (hasReachedPaywall) {
        console.log('🚫 [PAYWALL] Abrindo paywall');
        openPaywall('bills');
        return;
      }

      // NOVO: Verificar cooldown de ads contextuais para bills
      const permission = await AdCooldownManager.canPerformAction(userId, 'bills');
      console.log('🎯 [COOLDOWN] Permissão para bills:', permission);
      
      if (permission.allowed) {
        console.log('✅ [COOLDOWN] Ação permitida, navegando para /add-bill');
        // Consumir uma ação se for free_actions
        if (permission.reason === 'free_actions') {
          await AdCooldownManager.consumeAction(userId, 'bills');
        }
        navigate('/add-bill');
        return;
      }
      
      // Se não pode realizar ação, verificar o motivo
      if (permission.reason === 'cooldown_active') {
        console.log('⏰ [COOLDOWN] Cooldown ativo');
        toast({
          title: 'Aguarde o cooldown',
          description: `Próximo anúncio disponível em ${permission.minutesUntilNextAd} minutos.`,
          variant: 'default'
        });
        return;
      }
      
      if (permission.reason === 'need_ad') {
        console.log('🎬 [COOLDOWN] Precisa ver anúncio contextual - DESABILITADO PARA INVESTIDORES');
        // TEMPORARIAMENTE DESABILITADO PARA APRESENTAÇÃO PARA INVESTIDORES
        // setShowContextualAd({ show: true, action: 'bills' });
        // return;
        // Permitir que continue normalmente
      }

      // Fallback para sistema antigo se necessário
      const canAddBill = await UserPlanManager.checkDailyLimit(userId, 'bills');
      if (!canAddBill) {
        console.log('📊 [LIMITE] Limite atingido, abrindo paywall');
        toast({
          title: 'Limite diário atingido',
          description: 'Você atingiu o limite de contas. Assine o PRO por R$ 14,90/mês para contas ilimitadas!',
        });
        openPaywall('bills');
        return;
      }

      // Se chegou até aqui, navegar normalmente
      navigate('/add-bill');
      
    } catch (error) {
      console.error('❌ [ERRO] Erro ao verificar permissões para adicionar conta:', error);
      // Em caso de erro, permitir que o usuário continue
      navigate('/add-bill');
    }
  };

  const handleMarkAsPaid = (billId: string) => {
    markBillAsPaid(billId, (bill) => {
      // REMOVIDO: Toast bugado que aparecia "Conta paga: Add (1/2)"
      // toast({
      //   title: `Conta paga: ${bill.title}`,
      //   description: `A conta foi marcada como paga com sucesso.`,
      // });
      loadBills();
    });
  };

  const handleCloneBill = (bill: Bill) => {
    setEditBill({ // Alterado de setNewBill para setEditBill
      ...bill,
      id: uuidv4(), // Novo ID
      title: bill.title + ' (Cópia)',
      isPaid: false,
    });
    setShowEditBillModal(true); // Alterado de setShowAddBillModal para setShowEditBillModal
  };

  const handleUpgrade = async (planType: PlanType) => {
    try {
      if (!userId) return;
      // Ativar o plano (integração com Google Play Billing será feita depois)
      await UserPlanManager.activatePlan(userId, planType);
      
      // Recarregar dados do usuário
      await loadUserPlan();
      
      toast({
        title: '🚀 Upgrade realizado!',
        description: `Bem-vindo ao plano ${planType}! Aproveite todos os recursos.`,
      });
      
      // Navegar para a página de adicionar conta
      navigate('/add-bill');
      
    } catch (error) {
      console.error('Erro ao processar upgrade:', error);
      toast({
        title: 'Erro no upgrade',
        description: 'Tente novamente ou entre em contato com o suporte.',
        variant: 'destructive'
      });
    }
  };

  const getBillsToDisplay = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingBills;
      case 'overdue':
        return overdueBills;
      case 'all':
        return bills;
      default:
        return upcomingBills;
    }
  };

  const renderBillIcon = (category: string, isCardBill: boolean = false) => {
    if (isCardBill) {
      return <CreditCard className="text-galileo-text" size={24} />;
    }
    
    switch (category.toLowerCase()) {
      case 'moradia':
      case 'aluguel':
      case 'habitação':
        return <FileText className="text-galileo-text" size={24} />;
      case 'dívidas':
      case 'pagamentos de dívidas':
        return <FileMinus className="text-galileo-text" size={24} />;
      default:
        return <Clock className="text-galileo-text" size={24} />;
    }
  };

  const [showEditBillModal, setShowEditBillModal] = useState(false);
  const [editBill, setEditBill] = useState<Bill | null>(null);
  const [showEmailBanner, setShowEmailBanner] = useState(() => {
    // Verificar se o usuário já fechou o banner antes
    const dismissed = localStorage.getItem('email-notification-banner-dismissed');
    return dismissed !== 'true';
  });

  const handleDismissEmailBanner = () => {
    setShowEmailBanner(false);
    localStorage.setItem('email-notification-banner-dismissed', 'true');
  };

  return (
    <div className="flex flex-col min-h-screen pb-32" style={{ background: '#31518b' }}>
      {/* Header com glassmorphism igual ao Análise Financeira */}
      <div 
        className="sticky top-0 z-50"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '12px 30px',
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          height: '60px'
        }}
      >
        <h1 
          style={{
            fontSize: '24px',
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: '"Fredoka One", "Comic Sans MS", "Poppins", sans-serif',
            letterSpacing: '1px',
            textShadow: '2px 2px 0px #3b82f6, 4px 4px 0px #1d4ed8, 0 0 20px rgba(59, 130, 246, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6)',
            textTransform: 'uppercase',
            position: 'relative',
            filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5))'
          }}
        >
          CONTAS
        </h1>
      </div>
      

      
      {/* Seletores de Mês e Ano */}
      <div className="px-4 pt-4 pb-3 sticky z-10 border-b border-white/20" style={{ top: '60px', background: '#31518b' }}>
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="flex items-center bg-white/15 backdrop-blur-xl rounded-lg p-1 border border-white/20 w-full sm:w-auto">
            <div className="flex items-center flex-1 sm:flex-auto">
              <Calendar size={18} className="ml-3 mr-2 text-white/70" />
              <div className="relative flex-1 sm:w-44">
                <select 
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="appearance-none bg-transparent border-none text-white text-sm font-medium py-2 pl-1 pr-8 w-full focus:outline-none focus:ring-0"
                >
                  {monthOptions.map(opt => (
                    <option 
                      key={opt.value} 
                      value={opt.value} 
                      className="bg-white text-gray-900"
                    >
                      {opt.label.charAt(0).toUpperCase() + opt.label.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="h-6 mx-1 w-px bg-white/20"></div>
            
            <div className="relative sm:w-24">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="appearance-none bg-transparent border-none text-white text-sm font-medium py-2 pl-2 pr-8 w-full focus:outline-none focus:ring-0"
              >
                {yearOptions.map(opt => (
                  <option 
                    key={opt.value} 
                    value={opt.value} 
                    className="bg-white text-gray-900"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:ml-auto">
            <div className="flex gap-2 flex-1 sm:flex-none flex-wrap">
              <Button 
                onClick={sendBillsReportEmail}
                disabled={sendingEmailReport}
                variant="outline"
                className="flex-1 sm:flex-none bg-emerald-600/20 hover:bg-emerald-600/30 text-white font-semibold border-emerald-400/50 hover:border-emerald-400/70 backdrop-blur-sm transition-all duration-200 text-xs sm:text-sm disabled:opacity-50"
                style={{ color: '#ffffff !important' }}
              >
                {sendingEmailReport ? (
                  <Loader2 size={16} className="mr-1 sm:mr-2 text-white animate-spin" />
                ) : (
                  <Send size={16} className="mr-1 sm:mr-2 text-white" />
                )}
                {sendingEmailReport ? 'Enviando...' : 'Enviar Email'}
              </Button>
              <Button 
                onClick={() => navigate('/export')} 
                variant="outline"
                className="flex-1 sm:flex-none bg-purple-600/20 hover:bg-purple-600/30 text-white font-semibold border-purple-400/50 hover:border-purple-400/70 backdrop-blur-sm transition-all duration-200 text-xs sm:text-sm"
                style={{ color: '#ffffff !important' }}
              >
                <svg className="h-4 w-4 mr-1 sm:mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Relatório
              </Button>
              <Button 
                onClick={() => navigate('/recurring')} 
                variant="outline"
                className="flex-1 sm:flex-none bg-blue-600/20 hover:bg-blue-600/30 text-white font-semibold border-blue-400/50 hover:border-blue-400/70 backdrop-blur-sm transition-all duration-500 ease-in-out transform hover:scale-105 text-xs sm:text-sm"
                style={{ color: '#ffffff !important' }}
              >
                <Calendar size={16} className="mr-1 sm:mr-2 text-white" /> Recorrentes
              </Button>
            </div>
            <Button 
              onClick={handleAddBill} 
              className="w-full sm:w-auto bg-green-600/80 hover:bg-green-600 text-white font-semibold border border-green-500/50 hover:border-green-500 transition-all duration-200 text-xs sm:text-sm"
            >
              <Plus size={16} className="mr-1 sm:mr-2 text-white" /> Adicionar
            </Button>
          </div>
        </div>
      </div>

      {/* Status de Cooldown de Anúncios - TEMPORARIAMENTE DESABILITADO PARA INVESTIDORES */}
      {false && userId && (
        <div className="px-4 py-2">
          <AdCooldownStatus userId={userId} />
        </div>
      )}

      {/* Abas de Filtro */}
      <div className="px-4 py-3 flex justify-around border-b border-white/20 sticky top-[calc(var(--header-height)_+_60px)] z-10 sm:top-[calc(var(--header-height)_+_60px)]" style={{ background: '#31518b' }}>
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'upcoming' ? 'bg-white/20 text-white backdrop-blur-sm' : 'text-white/70'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          A Vencer
        </button>
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'overdue' ? 'bg-red-500/80 text-white backdrop-blur-sm' : 'text-white/70'}`}
          onClick={() => setActiveTab('overdue')}
        >
          Vencidas
        </button>
        <button
          className={`px-4 py-1.5 rounded-md text-sm font-medium ${activeTab === 'all' ? 'bg-white/20 text-white backdrop-blur-sm' : 'text-white/70'}`}
          onClick={() => setActiveTab('all')}
        >
          Todas
        </button>
      </div>

      {/* Banner de Notificações por Email */}
      {showEmailBanner && (
        <div className="mx-4 mt-4">
          <div 
            className="relative overflow-hidden rounded-2xl border"
            style={{
              background: emailNotificationsEnabled 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(139, 92, 246, 0.15) 100%)'
                : 'linear-gradient(135deg, rgba(100, 100, 100, 0.15) 0%, rgba(80, 80, 80, 0.15) 100%)',
              borderColor: emailNotificationsEnabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 100, 100, 0.3)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Efeito de brilho animado */}
            {emailNotificationsEnabled && (
              <div 
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                  animation: 'shimmer 3s infinite',
                }}
              />
            )}
            
            {/* Botão de fechar */}
            <button
              onClick={handleDismissEmailBanner}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              aria-label="Fechar"
            >
              <X size={14} className="text-white/70" />
            </button>
            
            <div className="relative p-4">
              <div className="flex items-start gap-4">
                {/* Ícone */}
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: emailNotificationsEnabled 
                      ? 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'
                      : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                    boxShadow: emailNotificationsEnabled 
                      ? '0 4px 15px rgba(16, 185, 129, 0.4)'
                      : '0 4px 15px rgba(100, 100, 100, 0.2)',
                  }}
                >
                  <div className="relative">
                    <Mail size={22} className="text-white" />
                    {emailNotificationsEnabled && (
                      <div 
                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-white"
                      />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wider ${emailNotificationsEnabled ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {emailNotificationsEnabled ? '✨ Ativo' : '🔕 Desativado'}
                    </span>
                    
                    {/* Toggle Switch */}
                    <button
                      onClick={toggleEmailNotifications}
                      disabled={loadingEmailPref}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        emailNotificationsEnabled ? 'bg-emerald-500' : 'bg-gray-500'
                      } ${loadingEmailPref ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          emailNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <h3 className="text-white font-bold text-base leading-tight mb-1">
                    Lembretes por e-mail
                  </h3>
                  <p className="text-white/70 text-sm leading-snug">
                    {emailNotificationsEnabled 
                      ? 'Toda semana você receberá um resumo das suas contas a vencer nos próximos 7 dias.'
                      : 'Você não está recebendo lembretes por e-mail. Ative para não perder nenhuma conta!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 pb-16" style={{ background: '#31518b' }}>
        {getBillsToDisplay().length > 0 ? (
          getBillsToDisplay().map((bill) => (
            <Card key={bill.id} className="mx-4 mb-4 overflow-hidden border-0 shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.08)', backdropFilter: 'blur(20px)', borderRadius: '16px' }}>
              <CardContent className="p-0">
                <div className="flex items-center gap-4 px-5 py-4">
                  <div 
                    className="flex items-center justify-center rounded-2xl shrink-0 size-12"
                    style={{ 
                      background: bill.isPaid 
                        ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' 
                        : activeTab === 'overdue' 
                          ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)'
                          : 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
                      border: '1px solid rgba(255,255,255,0.15)'
                    }}
                  >
                    {/* Ícone simples baseado no status */}
                    {bill.isPaid ? (
                      <Check className="h-5 w-5 text-white" />
                    ) : bill.isCardBill ? (
                      <CreditCard className="h-5 w-5 text-white/80" />
                    ) : (
                      <Receipt className="h-5 w-5 text-white/80" />
                    )}
                  </div>
                  <div className="flex flex-col justify-center flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white text-lg font-semibold leading-normal line-clamp-1">
                        {bill.title}
                        {bill.currentInstallment && bill.totalInstallments && bill.totalInstallments > 1 && (
                          <span className="ml-2 text-white/70 font-normal text-base">
                            ({bill.currentInstallment}/{bill.totalInstallments})
                          </span>
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className={`text-lg font-bold ${bill.isPaid ? 'text-green-400' : 'text-white'}`}>
                          {formatCurrency(bill.amount)}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/10" title="Opções">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#31518b] border-white/20">
                            <DropdownMenuItem onClick={() => { setEditBill(bill); setShowEditBillModal(true); }} className="text-white hover:bg-white/10">
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            {!bill.isPaid && (
                              <DropdownMenuItem onClick={() => handleMarkAsPaid(bill.id)} className="text-white hover:bg-white/10">
                                <CalendarCheck className="mr-2 h-4 w-4" />
                                <span>Marcar como Paga</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleCloneBill(bill)} className="text-white hover:bg-white/10">
                              <Plus className="mr-2 h-4 w-4" />
                              <span>Clonar Conta</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteBill(bill.id)} className="text-red-400 hover:bg-red-500/20">
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Excluir Conta</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-2 mt-2">
                      {/* Status da Conta */}
                      <span 
                        className="text-sm font-medium px-2.5 py-0.5 rounded-full"
                        style={{
                          background: bill.isPaid 
                            ? 'rgba(16, 185, 129, 0.2)' 
                            : formatBillDisplayDateAndStatus(bill).text.includes('Vencida') 
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'rgba(251, 191, 36, 0.2)',
                          color: bill.isPaid 
                            ? '#34d399' 
                            : formatBillDisplayDateAndStatus(bill).text.includes('Vencida')
                              ? '#f87171'
                              : '#fbbf24'
                        }}
                      >
                        {formatBillDisplayDateAndStatus(bill).text}
                      </span>

                      {/* Categoria */}
                      {bill.category && (
                        <span 
                          className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
                        >
                          {capitalizeFirstLetter(bill.category)}
                        </span>
                      )}

                      {/* Badge Recorrente */}
                      {bill.totalInstallments && bill.totalInstallments > 1 && (
                        <span 
                          className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}
                        >
                          Recorrente
                        </span>
                      )}

                      {/* Parcelas */}
                      {bill.currentInstallment && bill.totalInstallments && bill.totalInstallments > 1 && (
                        <span 
                          className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(59, 130, 246, 0.25)', color: '#93c5fd' }}
                        >
                          Parcela {bill.currentInstallment}/{bill.totalInstallments}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {bill.cardItems && bill.cardItems.length > 0 && (
                  <div className="px-5 pt-0 pb-4">
                    <div className="h-px bg-white/10 my-3"></div>
                    <p className="text-sm font-medium text-white/70 mb-2">Itens da fatura:</p>
                    <div className="space-y-2">
                      {bill.cardItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <div className="flex-1">
                            <p className="text-sm text-white">{item.description}</p>
                            {item.installments && (
                              <p className="text-xs text-blue-300 font-medium mt-0.5">
                                Parcela {item.installments.current}/{item.installments.total}
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-semibold text-white">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {!bill.isPaid && (
                  <button
                    onClick={() => handleMarkAsPaid(bill.id)}
                    className="w-full py-3 text-white font-semibold flex items-center justify-center transition-all duration-200"
                    style={{ 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderBottomLeftRadius: '16px',
                      borderBottomRightRadius: '16px'
                    }}
                  >
                    <CalendarCheck size={18} className="mr-2" /> Marcar como Pago
                  </button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-white/70">
            <FileText size={48} className="mb-2 opacity-40" />
            <p className="text-lg">Nenhuma conta {activeTab === 'upcoming' ? 'a vencer' : activeTab === 'overdue' ? 'vencida' : ''} encontrada</p>
            <p className="text-sm mt-1">Adicione novas contas para gerenciar seus pagamentos</p>
            <Button 
              onClick={handleAddBill}
              className="mt-4 bg-green-600/80 text-white border border-green-500/50 hover:bg-green-600 hover:border-green-500 backdrop-blur-sm"
            >
              <Plus size={16} className="mr-1" /> Adicionar Conta
            </Button>
          </div>
        )}
      </div>
      
      {/* Modal de Edição de Conta */}
      {showEditBillModal && editBill && (
        <Dialog open={showEditBillModal} onOpenChange={setShowEditBillModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Conta</DialogTitle> {/* Simplificado para remover a referência a newBill */}
              <DialogDescription>
                Faça alterações na sua conta aqui. Clique em salvar quando terminar.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input 
                  id="title" 
                  value={editBill.title} 
                  onChange={(e) => setEditBill({...editBill, title: e.target.value})} 
                  className="col-span-3" 
                  placeholder="Ex: Aluguel, Energia, Internet"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Valor
                </Label>
                <Input 
                  id="amount" 
                  type="number"
                  value={editBill.amount} 
                  onChange={(e) => setEditBill({...editBill, amount: parseFloat(e.target.value)})} 
                  className="col-span-3" 
                  placeholder="Ex: 1500.00"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoria
                </Label>
                <div className="col-span-3">
                  <Select
                    value={editBill.category}
                    onValueChange={(value) => setEditBill({...editBill, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  Data de Vencimento
                </Label>
                <Input 
                  id="dueDate" 
                  type="date" 
                  value={editBill.dueDate instanceof Date ? editBill.dueDate.toISOString().split('T')[0] : new Date(editBill.dueDate).toISOString().split('T')[0]} 
                  onChange={(e) => setEditBill({...editBill, dueDate: new Date(e.target.value)})} 
                  className="col-span-3" 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right col-span-1">
                  <Label htmlFor="isRecurring">
                    Recorrente
                  </Label>
                </div>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox 
                    id="isRecurring" 
                    checked={editBill.isRecurring || false}
                    onCheckedChange={(checked) => setEditBill({...editBill, isRecurring: !!checked})}
                  />
                  <Label htmlFor="isRecurring">
                    Esta conta se repete periodicamente
                  </Label>
                </div>
              </div>
              
              {editBill.isRecurring && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <div className="text-right col-span-1">
                      <Label htmlFor="isInfiniteRecurrence">
                        Sem Fim Definido
                      </Label>
                    </div>
                    <div className="col-span-3 flex items-center space-x-2">
                      <Checkbox 
                        id="isInfiniteRecurrence" 
                        checked={editBill.isInfiniteRecurrence || false}
                        onCheckedChange={(checked) => setEditBill({...editBill, isInfiniteRecurrence: !!checked})}
                      />
                      <Label htmlFor="isInfiniteRecurrence">
                        Esta conta não tem um número definido de parcelas
                      </Label>
                    </div>
                  </div>
                  
                  {!editBill.isInfiniteRecurrence && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="totalInstallments" className="text-right">
                        Total de Parcelas
                      </Label>
                      <Input 
                        id="totalInstallments" 
                        type="number" 
                        value={editBill.totalInstallments || ''} 
                        onChange={(e) => setEditBill({...editBill, totalInstallments: parseInt(e.target.value) || undefined})} 
                        className="col-span-3 bg-galileo-inputField text-galileo-text placeholder:text-galileo-placeholder" 
                        placeholder="Ex: 12" 
                      />
                    </div>
                  )}
                  
                  {!editBill.isInfiniteRecurrence && editBill.totalInstallments && editBill.totalInstallments > 0 && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="currentInstallment" className="text-right">
                        Parcela Atual
                      </Label>
                      <Input 
                        id="currentInstallment" 
                        type="number" 
                        value={editBill.currentInstallment || 1} 
                        onChange={(e) => setEditBill({...editBill, currentInstallment: parseInt(e.target.value) || 1})} 
                        className="col-span-3" 
                        min="1"
                        max={editBill.totalInstallments}
                      />
                    </div>
                  )}
                </>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right col-span-1">
                  <Label htmlFor="isPaid">
                    Paga
                  </Label>
                </div>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox 
                    id="isPaid" 
                    checked={editBill.isPaid || false}
                    onCheckedChange={(checked) => setEditBill({...editBill, isPaid: !!checked})}
                  />
                  <Label htmlFor="isPaid">
                    Esta conta já foi paga
                  </Label>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right col-span-1">
                  <Label htmlFor="notificationsEnabled">
                    Notificações
                  </Label>
                </div>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox 
                    id="notificationsEnabled" 
                    checked={editBill.notificationsEnabled || false}
                    onCheckedChange={(checked) => setEditBill({...editBill, notificationsEnabled: !!checked})}
                  />
                  <Label htmlFor="notificationsEnabled">
                    Receber notificações sobre esta conta
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditBillModal(false)}>Cancelar</Button>
              <Button onClick={() => {
                // Verificar se houve alteração no número de parcelas
                // Usar o número atual de parcelas como valor original se não houver um valor original definido
                const originalTotalInstallments = editBill.totalInstallments;
                const newTotalInstallments = editBill.totalInstallments;
                
                // Verificar se é uma conta recorrente com parcelas
                if (editBill.isRecurring && !editBill.isInfiniteRecurrence && 
                    originalTotalInstallments && newTotalInstallments && 
                    originalTotalInstallments !== newTotalInstallments) {
                  
                  // Confirmar com o usuário se deseja atualizar as parcelas futuras
                  if (window.confirm(`Você alterou o número de parcelas de ${originalTotalInstallments} para ${newTotalInstallments}. Deseja atualizar todas as parcelas futuras?`)) {
                    // Buscar todas as contas relacionadas (mesma conta original)
                    const allBills = getBills(false);
                    const relatedBills = allBills.filter(b => 
                      b.originalBillId === editBill.originalBillId || 
                      b.originalBillId === editBill.id ||
                      b.id === editBill.originalBillId
                    );
                    
                    // Atualizar cada parcela futura
                    relatedBills.forEach(bill => {
                      // Só atualizar parcelas futuras que ainda não foram pagas
                      // Garantir que ambas as parcelas tenham valores definidos
                      const currentInstallment = editBill.currentInstallment || 1;
                      if (!bill.isPaid && bill.currentInstallment && bill.currentInstallment > currentInstallment) {
                        const updatedBill = {
                          ...bill,
                          title: editBill.title,
                          amount: editBill.amount,
                          category: editBill.category,
                          totalInstallments: newTotalInstallments,
                          notificationsEnabled: editBill.notificationsEnabled
                        };
                        updateBill(updatedBill);
                      }
                    });
                    
                    toast({
                      title: 'Parcelas Atualizadas',
                      description: `Todas as parcelas futuras foram atualizadas com as novas informações.`
                    });
                  }
                }
                
                // Salvar as alterações da conta atual
                updateBill(editBill); 
                setShowEditBillModal(false); 
                loadBills(); 
                toast({title: 'Conta Atualizada', description: 'As alterações na conta foram salvas.'});
              }}>Salvar alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Paywall */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={closePaywall}
        onUpgrade={handleUpgrade}
        trigger={paywallTrigger}
        userId={userId || ''}
      />
      
      {/* O NavBar foi movido para o PersistentLayout.tsx */}
    </div>
  );
};

export default BillsPage;
