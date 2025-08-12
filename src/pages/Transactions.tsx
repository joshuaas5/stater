import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import { AdBanner } from '@/components/monetization/AdBanner';
import TransactionItem from '@/components/transactions/TransactionItem';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PlanType } from '@/types';
import { getTransactions, isLoggedIn, getCurrentUser } from '@/utils/localStorage';
import { formatCurrency } from '@/utils/dataProcessing';
import { MonthSelector } from '@/components/ui/month-selector';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, Filter, CalendarRange } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { UserPlanManager } from '@/utils/userPlanManager';
import { AdManager } from '@/utils/adManager';
import { AdCooldownManager } from '@/utils/adCooldownManager';
import { AdModal, useAdModal } from '@/components/ui/AdModal';
import { PaywallModal, usePaywallModal } from '@/components/ui/PaywallModal';
import { AdCooldownStatus } from '@/components/monetization/AdCooldownStatus';
import ContextualAdModal from '@/components/monetization/ContextualAdModal';

const Transactions: React.FC = () => {
  // ...
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);

  // Função para clonar transação com monetização
  const handleCloneTransaction = async (transaction: Transaction) => {
    console.log('🎯 [MONETIZAÇÃO] handleCloneTransaction chamado para userId:', userId);
    
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
        openPaywall('transactions');
        return;
      }

      // NOVO: Verificar cooldown de ads contextuais para transactions
      const permission = await AdCooldownManager.canPerformAction(userId, 'transactions');
      console.log('🎯 [COOLDOWN] Permissão para transactions:', permission);
      
      if (permission.allowed) {
        console.log('✅ [COOLDOWN] Ação permitida, clonando transação');
        // Consumir uma ação se for free_actions
        if (permission.reason === 'free_actions') {
          await AdCooldownManager.consumeAction(userId, 'transactions');
        }
        
        // Clonar direto
        const cloned = {
          ...transaction,
          id: `${transaction.id}_clone_${Date.now()}`,
          date: new Date(),
        };
        setNewTransaction(cloned);
        setIsAddDialogOpen(true);
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
        // Guardar a transação para clonar após o anúncio
        // setPendingCloneTransaction(transaction);
        // setShowContextualAd({ show: true, action: 'transactions' });
        // return;
        // Permitir que continue normalmente
      }

      // Fallback para sistema antigo se necessário
      const canAddTransaction = await UserPlanManager.checkDailyLimit(userId, 'transactions');
      if (!canAddTransaction) {
        console.log('📊 [LIMITE] Limite atingido, abrindo paywall');
        toast({
          title: 'Limite diário atingido',
          description: 'Você atingiu o limite de transações para hoje. Faça upgrade para adicionar ilimitadas!',
        });
        openPaywall('transactions');
        return;
      }

      // Se chegou até aqui, clonar normalmente
      const cloned = {
        ...transaction,
        id: `${transaction.id}_clone_${Date.now()}`,
        date: new Date(),
      };
      setNewTransaction(cloned);
      setIsAddDialogOpen(true);
      
    } catch (error) {
      console.error('Erro ao verificar permissões para clonar transação:', error);
      // Em caso de erro, permitir que o usuário continue
      const cloned = {
        ...transaction,
        id: `${transaction.id}_clone_${Date.now()}`,
        date: new Date(),
      };
      setNewTransaction(cloned);
      setIsAddDialogOpen(true);
    }
  };

  // Função para adicionar transação clonada
  const handleSaveClonedTransaction = () => {
    if (!newTransaction) return;
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    const allTransactions = getTransactions();
    allTransactions.push(newTransaction);
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(allTransactions));
    loadTransactions();
    setIsAddDialogOpen(false);
    setNewTransaction(null);
    toast({
      title: 'Transação clonada',
      description: `${newTransaction.title} foi clonada com sucesso!`,
    });
  };

  // Função para excluir transação no modal de edição
  const handleDeleteFromEdit = () => {
    if (!editingTransaction) return;
    handleDeleteTransaction(editingTransaction);
    setIsDialogOpen(false);
    setEditingTransaction(null);
  };

  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  
  // Estados de monetização
  const [userId, setUserId] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<any>(null);
  const [pendingCloneTransaction, setPendingCloneTransaction] = useState<Transaction | null>(null);
  const [showContextualAd, setShowContextualAd] = useState<{ show: boolean; action: 'bills' | 'transactions' }>({ show: false, action: 'transactions' });
  const { isOpen: adModalOpen, adType, showAd, closeAd } = useAdModal();
  const { isOpen: paywallOpen, trigger: paywallTrigger, openPaywall, closePaywall } = usePaywallModal();
  
  useEffect(() => {
    // Verificar se o usuário está logado
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    initializeUser();
    loadTransactions();
  }, [navigate, selectedMonth, selectedYear]);
  
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
      console.log('🔐 [TRANSACTIONS] Usuário autenticado:', user.id);
      
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
      console.log('📊 [TRANSACTIONS] Plano carregado:', plan.planType);
    } catch (error) {
      console.error('Erro ao carregar plano do usuário:', error);
    }
  };
  
  useEffect(() => {
    // Listener para atualizar quando houver novas transações adicionadas pelo consultor IA
    const handleTransactionsUpdated = () => {
      loadTransactions();
    };
    window.addEventListener('transactionsUpdated', handleTransactionsUpdated);
    return () => {
      window.removeEventListener('transactionsUpdated', handleTransactionsUpdated);
    };
  }, []);

  // Handlers para monetização
  const handleAdReward = async (success: boolean, reward?: string) => {
    if (success) {
      toast({
        title: '🎉 Anúncio assistido!',
        description: reward || 'Continue adicionando suas transações',
      });
      
      // Se havia uma transação pendente para clonar, fazer isso agora
      if (pendingCloneTransaction) {
        const cloned = {
          ...pendingCloneTransaction,
          id: `${pendingCloneTransaction.id}_clone_${Date.now()}`,
          date: new Date(),
        };
        setNewTransaction(cloned);
        setIsAddDialogOpen(true);
        setPendingCloneTransaction(null);
      }
    } else {
      toast({
        title: 'Anúncio não concluído',
        description: 'Assista até o fim para continuar sem limites',
        variant: 'destructive'
      });
      setPendingCloneTransaction(null);
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
      
      // Se havia uma transação pendente para clonar, fazer isso agora
      if (pendingCloneTransaction) {
        const cloned = {
          ...pendingCloneTransaction,
          id: `${pendingCloneTransaction.id}_clone_${Date.now()}`,
          date: new Date(),
        };
        setNewTransaction(cloned);
        setIsAddDialogOpen(true);
        setPendingCloneTransaction(null);
      }
      
    } catch (error) {
      console.error('Erro ao processar upgrade:', error);
      toast({
        title: 'Erro no upgrade',
        description: 'Tente novamente ou entre em contato com o suporte.',
        variant: 'destructive'
      });
    }
  };
  
  const loadTransactions = () => {
    // Carregar as transações do usuário
    const allTransactions = getTransactions();
    
    const filteredByMonth = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === selectedMonth && 
             transactionDate.getFullYear() === selectedYear;
    });
    
    setTransactions(filteredByMonth);
  };
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setSearchQuery('');
    }
  };
  
  const handleMonthChange = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };
  
  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction({...transaction});
    setIsDialogOpen(true);
  };
  
  const handleDeleteTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteDialogOpen(true);
  };
  
  // Função para excluir uma transação diretamente pelo ID
  const deleteTransaction = (transactionId: string) => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    const allTransactions = getTransactions();
    const updatedTransactions = allTransactions.filter(t => t.id !== transactionId);
    
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
  };
  
  const confirmDeleteTransaction = () => {
    if (!selectedTransaction) return;
    
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    const allTransactions = getTransactions();
    const updatedTransactions = allTransactions.filter(t => t.id !== selectedTransaction.id);
    
    localStorage.setItem(`transactions_${user.id}`, JSON.stringify(updatedTransactions));
    
    loadTransactions();
    
    toast({
      title: "Transação excluída",
      description: `O valor de ${selectedTransaction.type === 'income' ? '+' : '-'} ${formatCurrency(selectedTransaction.amount)} foi restituído ao saldo.`
    });
    
    setIsDeleteDialogOpen(false);
    setSelectedTransaction(null);
  };
  
  const handleSaveTransaction = () => {
    if (!editingTransaction) return;
    
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    const allTransactions = getTransactions();
    const transactionIndex = allTransactions.findIndex(t => t.id === editingTransaction.id);
    
    if (transactionIndex >= 0) {
      allTransactions[transactionIndex] = editingTransaction;
      localStorage.setItem(`transactions_${user.id}`, JSON.stringify(allTransactions));
      
      loadTransactions();
      
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso."
      });
      
      setIsDialogOpen(false);
      setEditingTransaction(null);
    }
  };
  
  const handleRecurrenceChange = (checked: boolean) => {
    if (editingTransaction) {
      setEditingTransaction({
        ...editingTransaction,
        isRecurring: checked
      });
    }
  };
  
  const filteredTransactions = transactions
    .filter(transaction => {
      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          transaction.title.toLowerCase().includes(query) ||
          transaction.category.toLowerCase().includes(query) ||
          transaction.amount.toString().includes(query)
        );
      }
      return true;
    })
    .filter(transaction => {
      // Filter by type
      if (filterType === 'all') return true;
      if (filterType === 'income') return transaction.type === 'income';
      if (filterType === 'expense') return transaction.type === 'expense';
      if (filterType === 'recurring') return transaction.isRecurring === true;
      return true;
    });
  
  return (
    <div className="bg-galileo-background min-h-screen pb-32">
      <PageHeader 
        title="Transações" 
        showSearch={true}
        onSearch={toggleSearch}
      />
      
      <div className="px-4 mb-4">
        <MonthSelector onMonthChange={handleMonthChange} />
      </div>

      {/* Status de Cooldown de Anúncios - TEMPORARIAMENTE DESABILITADO PARA INVESTIDORES */}
      {false && userId && (
        <div className="px-4 py-2">
          <AdCooldownStatus userId={userId} />
        </div>
      )}
      
      {isSearchOpen && (
        <div className="px-4 py-2 bg-galileo-background">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar transações..."
            className="w-full p-2 bg-galileo-accent border border-galileo-border rounded-lg text-galileo-text"
            autoFocus
          />
        </div>
      )}
      
      <div className="px-4 py-2 flex justify-between items-center">
        <div className="font-medium text-galileo-text">
          {filteredTransactions.length} transações
        </div>
        
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[160px]">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              <span>Filtrar</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="income">Entradas</SelectItem>
            <SelectItem value="expense">Saídas</SelectItem>
            <SelectItem value="recurring">Recorrentes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className="w-[160px]">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4" />
            <span>Filtrar</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          <SelectItem value="income">Entradas</SelectItem>
          <SelectItem value="expense">Saídas</SelectItem>
          <SelectItem value="recurring">Recorrentes</SelectItem>
        </SelectContent>
      </Select>
      <button 
        onClick={() => setSearchQuery('')}
        className="mt-2 text-galileo-text underline"
      >
        Limpar pesquisa
      </button>
      
      {/* Edit Transaction Dialog */}
      {(!editingTransaction && isDialogOpen) && (
        <div className="bg-galileo-negative text-white p-4 mb-2 rounded" data-testid="edit-modal-error">
          Erro: Não foi possível abrir o modal de edição. Tente novamente.
        </div>
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent data-testid="edit-modal">
          <DialogHeader className="flex justify-between items-start">
            <div>
              <DialogTitle>Editar Transação</DialogTitle>
              <DialogDescription>
                Altere os detalhes da transação.
              </DialogDescription>
            </div>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editTitle">Descrição</Label>
              <Input 
                id="editTitle" 
                value={editingTransaction?.title || ''} 
                onChange={(e) => editingTransaction && setEditingTransaction({...editingTransaction, title: e.target.value})}
              />
            </div>

            
            <div className="grid gap-2">
              <Label htmlFor="editAmount">Valor</Label>
              <Input 
                id="editAmount" 
                type="number" 
                min="0" 
                step="0.01"
                value={editingTransaction?.amount || 0} 
                onChange={(e) => editingTransaction && setEditingTransaction({...editingTransaction, amount: parseFloat(e.target.value)})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editCategory">Categoria</Label>
              <Select 
                value={editingTransaction?.category || ''} 
                onValueChange={(value) => editingTransaction && setEditingTransaction({...editingTransaction, category: value})}
              >
                <SelectTrigger id="editCategory">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {editingTransaction?.type === 'income' ? (
                    INCOME_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))
                  ) : (
                    EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isRecurring" 
                checked={editingTransaction?.isRecurring || false}
                onCheckedChange={handleRecurrenceChange}
              />
              <Label 
                htmlFor="isRecurring" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <CalendarRange size={16} />
                Transação recorrente
              </Label>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="editType">Tipo</Label>
              <Select 
                value={editingTransaction?.type || 'expense'} 
                onValueChange={(value: 'income' | 'expense') => editingTransaction && setEditingTransaction({...editingTransaction, type: value})}
              >
                <SelectTrigger id="editType">
                  <SelectValue placeholder="Tipo de transação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Entrada</SelectItem>
                  <SelectItem value="expense">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={handleSaveTransaction} className="bg-galileo-accent hover:bg-galileo-accent/80">
              Salvar Alterações
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              data-testid="delete-transaction-btn"
              onClick={() => {
                if (editingTransaction) {
                  deleteTransaction(editingTransaction.id);
                  toast({
                    title: "Transação excluída",
                    description: "A transação foi excluída com sucesso.",
                  });
                  setIsDialogOpen(false);
                  loadTransactions();
                } else {
                  toast({
                    title: "Erro ao excluir",
                    description: "Nenhuma transação selecionada para exclusão.",
                    variant: "destructive"
                  });
                }
              }}
              className="bg-galileo-negative hover:bg-galileo-negative/80 ml-2"
            >
              <Trash2 size={16} className="mr-1" /> Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add/Clone Transaction Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clonar Lançamento</DialogTitle>
            <DialogDescription>Revise os dados e confirme para adicionar.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="cloneTitle">Descrição</Label>
              <Input
                id="cloneTitle"
                value={newTransaction?.title || ''}
                onChange={e => newTransaction && setNewTransaction({ ...newTransaction, title: e.target.value })}
              />
            </div>
            {/* Seletor de Ícone */}
            <div className="grid gap-2">
              <label className="font-medium">Ícone</label>
              <div className="flex gap-2 flex-wrap">
                {['💸','💰','🍔','🏠','🚗','🎉','🛒','📚','💳','🧾','⚡','🛠️','🧃','🧑‍💻','🏦'].map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`text-2xl p-1 rounded border border-transparent hover:border-galileo-accent/60`}
                    // onClick={() => newTransaction && setNewTransaction({...newTransaction, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cloneAmount">Valor</Label>
              <Input
                id="cloneAmount"
                type="number"
                min="0"
                step="0.01"
                value={newTransaction?.amount || 0}
                onChange={e => newTransaction && setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cloneCategory">Categoria</Label>
              <Select
                value={newTransaction?.category || ''}
                onValueChange={value => newTransaction && setNewTransaction({ ...newTransaction, category: value })}
              >
                <SelectTrigger id="cloneCategory">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {newTransaction?.type === 'income'
                    ? INCOME_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))
                    : EXPENSE_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category.toLowerCase()}>
                          {category}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="cloneIsRecurring"
                checked={newTransaction?.isRecurring || false}
                onCheckedChange={checked => newTransaction && setNewTransaction({ ...newTransaction, isRecurring: !!checked })}
              />
              <Label htmlFor="cloneIsRecurring" className="text-sm font-medium leading-none flex items-center gap-2">
                <CalendarRange size={16} />
                Transação recorrente
              </Label>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cloneType">Tipo</Label>
              <Select
                value={newTransaction?.type || 'expense'}
                onValueChange={value => newTransaction && setNewTransaction({ ...newTransaction, type: value as 'income' | 'expense' })}
              >
                <SelectTrigger id="cloneType">
                  <SelectValue placeholder="Tipo de transação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Entrada</SelectItem>
                  <SelectItem value="expense">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveClonedTransaction} className="bg-galileo-accent hover:bg-galileo-accent/80">
              Adicionar Lançamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Transaction Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Transação</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTransaction} className="bg-galileo-negative hover:bg-galileo-negative/80">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        onClose={() => setShowContextualAd({ show: false, action: 'transactions' })}
        onWatchAd={async () => {
          try {
            if (!userId) return;
            await AdCooldownManager.watchAdForActions(userId, 'transactions');
            setShowContextualAd({ show: false, action: 'transactions' });
            // Tentar clonar transação novamente
            if (pendingCloneTransaction) {
              handleCloneTransaction(pendingCloneTransaction);
              setPendingCloneTransaction(null);
            }
          } catch (error) {
            console.error('Erro ao assistir anúncio:', error);
          }
        }}
        action={showContextualAd.action}
        actionsWillGrant={5}
        cooldownMinutes={20}
      />
      )}

      {/* Banner de Publicidade - TEMPORARIAMENTE DESABILITADO PARA INVESTIDORES */}
      <AdBanner position="bottom" />
      
      {/* O NavBar foi movido para o PersistentLayout.tsx */}
    </div>
  );
};

export default Transactions;
