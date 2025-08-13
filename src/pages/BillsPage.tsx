import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { AdBanner } from '@/components/monetization/AdBanner';
import { Bill, CardItem, EXPENSE_CATEGORIES, PlanType } from '@/types';
import { getBills, isLoggedIn, markBillAsPaid, saveBill, updateBill, deleteBill } from '@/utils/localStorage';
import { formatCurrency, getOverdueBills, getBillsDueInNextDays } from '@/utils/dataProcessing';
import { useToast } from '@/hooks/use-toast';
import { UserPlanManager } from '@/utils/userPlanManager';
import { AdManager } from '@/utils/adManager';
import { AdCooldownManager } from '@/utils/adCooldownManager';
import { AdModal, useAdModal } from '@/components/ui/AdModal';
import { PaywallModal, usePaywallModal } from '@/components/ui/PaywallModal';
import { AdCooldownStatus } from '@/components/monetization/AdCooldownStatus';
import ContextualAdModal from '@/components/monetization/ContextualAdModal';
import { 
  CalendarCheck, Clock, CreditCard, FileText, FileMinus, Plus, 
  Edit, MoreVertical, Trash, Calendar
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
  const [showContextualAd, setShowContextualAd] = useState<{ show: boolean; action: 'bills' | 'transactions' }>({ show: false, action: 'bills' });
  const { isOpen: adModalOpen, adType, showAd, closeAd } = useAdModal();
  const { isOpen: paywallOpen, trigger: paywallTrigger, openPaywall, closePaywall } = usePaywallModal();
  
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
    } catch (error) {
      console.error('Erro na inicialização do usuário:', error);
      navigate('/login');
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
          description: 'Você atingiu o limite de contas para hoje. Teste grátis por 3 dias, depois R$ 19,90/mês para contas ilimitadas!',
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

  // Handlers para monetização
  const handleAdReward = async (success: boolean, reward?: string) => {
    if (success) {
      toast({
        title: '🎉 Anúncio assistido!',
        description: reward || 'Continue adicionando suas contas',
      });
      
      // Navegar para a página de adicionar conta após o anúncio
      navigate('/add-bill');
    } else {
      toast({
        title: 'Anúncio não concluído',
        description: 'Assista até o fim para continuar sem limites',
        variant: 'destructive'
      });
    }
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
            <div className="flex gap-2 flex-1 sm:flex-none">
              <Button 
                onClick={() => navigate('/export-report')} 
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
                onClick={() => navigate('/recurring-transactions')} 
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
      
      <div className="mt-4 pb-16" style={{ background: '#31518b' }}>
        {getBillsToDisplay().length > 0 ? (
          getBillsToDisplay().map((bill) => (
            <Card key={bill.id} className="mx-4 mb-3 overflow-hidden border border-white/20 bg-white/15 backdrop-blur-xl">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 px-4 py-3">
                  <div className={`text-white flex items-center justify-center rounded-lg ${bill.isPaid ? 'bg-green-500' : activeTab === 'overdue' ? 'bg-galileo-negative' : 'bg-galileo-accent'} shrink-0 size-12`}>
                    {renderBillIcon(bill.category, bill.isCardBill)}
                  </div>
                  <div className="flex flex-col justify-center flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-galileo-text text-base font-medium leading-normal line-clamp-1">
                        {bill.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className={`text-base font-semibold leading-normal ${bill.isPaid ? 'text-green-500' : 'text-galileo-negative'}`}>
                          {formatCurrency(bill.amount)}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Opções">
                              <span style={{fontSize: '1.5rem', fontWeight: 'bold'}}>⋮</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditBill(bill); setShowEditBillModal(true); }}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            {!bill.isPaid && (
                              <DropdownMenuItem onClick={() => handleMarkAsPaid(bill.id)}>
                                <span>Marcar como Paga</span>
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleCloneBill(bill)}>
                              <span>Clonar Conta</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteBill(bill.id)}>
                              <Trash className="mr-2 h-4 w-4 text-red-500" />
                              <span className="text-red-500">Excluir Conta</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                      {/* Status da Conta (Vencida, Paga, A Vencer) - como o usuário preferiu */}
                      <span className={`text-sm ${formatBillDisplayDateAndStatus(bill).className}`}>
                        {formatBillDisplayDateAndStatus(bill).text}
                      </span>

                      {/* Categoria com capitalização */}
                      {bill.category && (
                        <Badge variant="outline" className="text-xs">
                          {capitalizeFirstLetter(bill.category)}
                        </Badge>
                      )}

                      {/* Recorrente - Este badge pode ser condicional se uma parcela individual não deve mostrar "Recorrente" explicitamente */}
                      {/* Se a conta faz parte de uma série de parcelas (tem totalInstallments > 1), ela é recorrente nesse sentido */}
                      {bill.totalInstallments && bill.totalInstallments > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          Recorrente
                        </Badge>
                      )}

                      {/* Parcelas - agora usa currentInstallment e totalInstallments diretamente da conta */}
                      {bill.currentInstallment && bill.totalInstallments && bill.totalInstallments > 1 && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 font-semibold border border-blue-200">
                          {`Parcela ${bill.currentInstallment}/${bill.totalInstallments}`}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {bill.cardItems && bill.cardItems.length > 0 && (
                  <div className="px-4 pt-0 pb-3">
                    <Separator className="my-2" />
                    <p className="text-sm font-medium text-galileo-text mb-2">Itens da fatura:</p>
                    <div className="space-y-2">
                      {bill.cardItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-galileo-card/30 p-2 rounded-md">
                          <div className="flex-1">
                            <p className="text-sm text-galileo-text">{item.description}</p>
                            {item.installments && (
                              <p className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-md inline-block">
                                Parcela {item.installments.current}/{item.installments.total}
                              </p>
                            )}
                          </div>
                          <p className="text-sm font-medium text-galileo-negative">
                            {formatCurrency(item.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {!bill.isPaid && (
                  <div className="flex border-t border-galileo-border">
                    <button
                      onClick={() => handleMarkAsPaid(bill.id)}
                      className="flex-1 py-2 text-white bg-green-500 hover:bg-green-600 font-medium flex items-center justify-center"
                    >
                      <CalendarCheck size={16} className="mr-1" /> Marcar como Pago
                    </button>
                  </div>
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

      {/* Modal de Anúncio */}
      <AdModal
        isOpen={adModalOpen}
        onClose={closeAd}
        onReward={handleAdReward}
        type={adType}
        userId={userId || ''}
      />

      {/* Modal de Paywall */}
      <PaywallModal
        isOpen={paywallOpen}
        onClose={closePaywall}
        onUpgrade={handleUpgrade}
        trigger={paywallTrigger}
        userId={userId || ''}
      />

      {/* Modal de Anúncio Contextual - TEMPORARIAMENTE DESABILITADO PARA INVESTIDORES */}
      {false && (
      <ContextualAdModal
        isOpen={showContextualAd.show}
        onClose={() => setShowContextualAd({ show: false, action: 'bills' })}
        onWatchAd={async () => {
          try {
            if (!userId) return;
            await AdCooldownManager.watchAdForActions(userId, 'bills');
            setShowContextualAd({ show: false, action: 'bills' });
            // Tentar adicionar conta novamente
            handleAddBill();
          } catch (error) {
            console.error('Erro ao assistir anúncio:', error);
          }
        }}
        action={showContextualAd.action}
        actionsWillGrant={3}
        cooldownMinutes={30}
      />
      )}

      {/* Banner de Publicidade - TEMPORARIAMENTE DESABILITADO PARA INVESTIDORES */}
      <AdBanner position="bottom" />
      
      {/* O NavBar foi movido para o PersistentLayout.tsx */}
    </div>
  );
};

export default BillsPage;
