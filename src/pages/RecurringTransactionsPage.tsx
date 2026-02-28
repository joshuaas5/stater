import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, Bill, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types';
import { getCurrentUser, getTransactions, updateTransaction, deleteTransaction, saveTransaction, getBills } from '@/utils/localStorage';
import { getRecurringTransactionsStats, calculateNextOccurrence } from '@/utils/recurringProcessor';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { useToast } from '@/hooks/use-toast';
import { RecurringTransactionLimitManager } from '@/utils/recurringTransactionLimit';
import { useAuth } from '@/contexts/AuthContext';
import { PaywallModal, usePaywallModal } from '@/components/ui/PaywallModal';
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Settings,
  BarChart3,
  Trash2
} from 'lucide-react';

const RecurringTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isPaywallOpen, openPaywall, closePaywall } = usePaywallModal();
  
  const [recurringTransactions, setRecurringTransactions] = useState<Transaction[]>([]);
  const [recurringBills, setRecurringBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTransactionType, setNewTransactionType] = useState<'income' | 'expense'>('expense');
  
  // 🚫 ESTADOS PARA LIMITE DE TRANSAÇÕES RECORRENTES
  const [showRecurringLimit, setShowRecurringLimit] = useState(false);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [cooldownInfo, setCooldownInfo] = useState<any>(null);

  // 🎬 Handler para assistir anúncio
  const handleWatchAd = async () => {
    setIsWatchingAd(true);
    try {
      // TODO: Implementar lógica de anúncio
      console.log('🎬 Iniciando exibição de anúncio...');
      // Simular tempo de anúncio
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: 'Anúncio assistido!',
        description: 'Você pode criar sua transação recorrente agora.',
      });
      setShowRecurringLimit(false);
    } catch (error) {
      console.error('Erro ao exibir anúncio:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível exibir o anúncio. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsWatchingAd(false);
    }
  };

  // Carregar dados
  const loadData = () => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // Carregar transações recorrentes
    const allTransactions = getTransactions();
    const recurring = allTransactions.filter(t => t.isRecurring && !t.isRecurringInstance);
    setRecurringTransactions(recurring);

    // Carregar contas recorrentes
    const allBills = getBills();
    const recurringBillsList = allBills.filter(b => b.isRecurring);
    setRecurringBills(recurringBillsList);

    const statsData = getRecurringTransactionsStats();
    setStats(statsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Editar transação recorrente
  const handleEditRecurring = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsCreatingNew(false);
    setIsModalOpen(true);
  };

  // Converter Bill para Transaction e editar
  const handleEditBill = (bill: Bill) => {
    const transaction: Transaction = {
      id: bill.id,
      title: bill.title,
      amount: bill.amount,
      type: 'expense', // Bills são sempre despesas
      category: bill.category,
      date: bill.dueDate,
      userId: bill.userId,
      isRecurring: bill.isRecurring,
      recurringDay: bill.recurringDay,
      dueDate: bill.dueDate,
      isPaid: bill.isPaid,
      totalInstallments: bill.totalInstallments,
      currentInstallment: bill.currentInstallment,
      isCardBill: bill.isCardBill,
      cardItems: bill.cardItems,
    };
    handleEditRecurring(transaction);
  };

  // Criar nova transação
  const handleCreateNew = async (type: 'income' | 'expense') => {
    if (!user) {
      toast({
        title: 'Erro de autenticação',
        description: 'Faça login para criar transações recorrentes',
        variant: 'destructive',
      });
      return;
    }

    // Verificar limite de transações recorrentes para usuários free
    const recurringLimit = await RecurringTransactionLimitManager.canCreateRecurring(user.id);
    
    if (!recurringLimit.allowed) {
      if (recurringLimit.reason === 'limit_reached') {
        // Limite semanal atingido - mostrar paywall
        toast({
          title: '📊 Limite semanal atingido',
          description: 'Assine o plano premium para criar transações recorrentes ilimitadas.',
          variant: 'destructive',
        });
        openPaywall('recurring_transactions');
        return;
      } else if (recurringLimit.reason === 'error') {
        toast({
          title: 'Erro',
          description: 'Erro ao verificar limite de transações recorrentes',
          variant: 'destructive',
        });
        return;
      }
    }

    setEditingTransaction(null);
    setNewTransactionType(type);
    setIsCreatingNew(true);
    setIsModalOpen(true);
  };

  // Salvar transação (criação ou edição)
  const handleSaveTransaction = async (transactionData: Partial<Transaction>) => {
    try {
      if (isCreatingNew) {
        // Criar nova transação
        const newTransaction: Transaction = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: newTransactionType,
          date: new Date(),
          createdAt: new Date(),
          ...transactionData,
          nextOccurrence: transactionData.isRecurring 
            ? calculateNextOccurrence(transactionData as Transaction)
            : undefined
        } as Transaction;
        
        saveTransaction(newTransaction);
        
        // 📊 INCREMENTAR CONTADOR DE TRANSAÇÕES RECORRENTES
        if (user && transactionData.isRecurring) {
          await RecurringTransactionLimitManager.incrementRecurringCount(user.id);
        }
        
        toast({
          title: "Transação criada!",
          description: "A nova transação recorrente foi criada com sucesso.",
          variant: "default"
        });
      } else if (editingTransaction) {
        // Editar transação existente
        const finalTransaction = {
          ...editingTransaction,
          ...transactionData,
          nextOccurrence: calculateNextOccurrence({
            ...editingTransaction,
            ...transactionData
          } as Transaction)
        };
        
        updateTransaction(finalTransaction as Transaction);
        
        toast({
          title: "Transação atualizada!",
          description: "A transação recorrente foi editada com sucesso.",
          variant: "default"
        });
      }
      
      loadData();
      setEditingTransaction(null);
      setIsCreatingNew(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a transação.",
        variant: "destructive"
      });
    }
  };

  // Excluir transação recorrente
  const handleDeleteRecurring = (transaction: Transaction) => {
    if (!window.confirm(`Tem certeza que deseja excluir a transação recorrente "${transaction.title}"?\n\nEsta ação cancelará todas as execuções futuras desta transação.`)) {
      return;
    }

    try {
      // Excluir a transação recorrente principal
      deleteTransaction(transaction.id);
      
      // Buscar e excluir todas as instâncias já criadas desta recorrente
      const allTransactions = getTransactions();
      const instancesToDelete = allTransactions.filter(t => 
        t.originalRecurringId === transaction.id && t.isRecurringInstance
      );
      
      instancesToDelete.forEach(instance => {
        deleteTransaction(instance.id);
      });
      
      loadData();
      
      toast({
        title: "Transação recorrente excluída!",
        description: `A transação "${transaction.title}" e ${instancesToDelete.length} instância(s) foram excluídas com sucesso.`,
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao excluir transação recorrente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a transação recorrente.",
        variant: "destructive"
      });
    }
  };

  // Obter próxima execução formatada
  const getNextExecutionText = (transaction: Transaction): string => {
    if (!transaction.nextOccurrence) return 'Não calculado';
    
    const next = new Date(transaction.nextOccurrence);
    const today = new Date();
    const diffTime = next.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays < 0) return 'Processada';
    
    return `Em ${diffDays} dia(s)`;
  };

  // Obter frequência formatada
  const getFrequencyText = (transaction: Transaction): string => {
    switch (transaction.recurrenceFrequency) {
      case 'weekly':
        const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return `Semanal (${weekdays[transaction.recurringWeekday || 0]})`;
      case 'monthly':
        return `Mensal (dia ${transaction.recurringDay})`;
      case 'yearly':
        return `Anual (dia ${transaction.recurringDay})`;
      default:
        return 'Indefinida';
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden overflow-y-auto pb-20 lg:pb-8">
      {/* Header - Mobile */}
      <div className="relative z-10 lg:hidden" style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Transações Recorrentes
              </h1>
              <p className="text-xs text-slate-400">
                Automáticas no dia configurado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Header - Desktop */}
      <div className="hidden lg:block px-6 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Transações Recorrentes
              </h1>
              <p className="text-slate-400 text-sm">Gerencie suas transações automáticas</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleCreateNew('income')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium transition-all duration-300 hover:scale-105 text-white border border-emerald-500/30 hover:border-emerald-400/50"
              style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)' }}
            >
              <TrendingUp className="w-4 h-4" />
              <span>+ Receita</span>
            </button>
            <button
              onClick={() => handleCreateNew('expense')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-medium transition-all duration-300 hover:scale-105 text-white border border-red-500/30 hover:border-red-400/50"
              style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.3) 100%)' }}
            >
              <TrendingDown className="w-4 h-4" />
              <span>+ Despesa</span>
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="relative z-10 p-4 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <div className="relative overflow-hidden rounded-2xl p-4 border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-xl" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}>
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stats?.totalRecurring || 0}</p>
              <p className="text-sm text-slate-400">Total</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl p-4 border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.1) 100%)' }}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-xl" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
                <Clock className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stats?.byFrequency?.weekly || 0}</p>
              <p className="text-sm text-slate-400">Semanais</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl p-4 border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)' }}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-xl" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stats?.byFrequency?.monthly || 0}</p>
              <p className="text-sm text-slate-400">Mensais</p>
            </div>
          </div>
          
          <div className="relative overflow-hidden rounded-2xl p-4 border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)' }}>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-xl" />
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 100%)' }}>
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stats?.byFrequency?.yearly || 0}</p>
              <p className="text-sm text-slate-400">Anuais</p>
            </div>
          </div>
        </div>

        {/* Lista de Transações Recorrentes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              Suas Recorrentes
            </h2>
            {/* Mobile buttons */}
            <div className="flex gap-2 lg:hidden">
              <button
                onClick={() => handleCreateNew('income')}
                className="p-2.5 rounded-xl text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-all"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleCreateNew('expense')}
                className="p-2.5 rounded-xl text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
              >
                <TrendingDown className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {recurringTransactions.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl p-8 text-center border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)' }}>
                  <BarChart3 className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Nenhuma transação recorrente
                </h3>
                <p className="text-slate-400 mb-6 text-sm max-w-sm mx-auto">
                  Configure transações recorrentes para automatizar seus lançamentos mensais.
                </p>
                <div className="flex gap-3 justify-center">
                  <button 
                    onClick={() => handleCreateNew('income')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-white transition-all duration-300 hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    <TrendingUp className="w-4 h-4" /> Receita
                  </button>
                  <button 
                    onClick={() => handleCreateNew('expense')}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-white transition-all duration-300 hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                  >
                    <TrendingDown className="w-4 h-4" /> Despesa
                  </button>
                </div>
              </div>
            </div>
          ) : (
            recurringTransactions.map((transaction) => (
              <div 
                key={transaction.id} 
                className="relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:border-white/20"
                style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)' }}
              >
                {/* Colored accent bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: transaction.type === 'income' ? 'linear-gradient(180deg, #10b981 0%, #059669 100%)' : 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)' }}
                />
                
                <div className="p-4 pl-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ 
                          background: transaction.type === 'income' 
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.3) 100%)'
                            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.3) 100%)'
                        }}
                      >
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-white truncate">
                            {transaction.title}
                          </h3>
                          <span 
                            className="px-2 py-0.5 rounded-lg text-xs font-medium"
                            style={{ 
                              background: transaction.type === 'income' 
                                ? 'rgba(16, 185, 129, 0.2)' 
                                : 'rgba(239, 68, 68, 0.2)',
                              color: transaction.type === 'income' ? '#6ee7b7' : '#fca5a5'
                            }}
                          >
                            {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                          </span>
                        </div>
                        
                        <p className={`text-xl font-bold ${
                          transaction.type === 'income' ? 'text-emerald-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-2 mt-3 text-sm">
                          <div>
                            <p className="text-slate-500 text-xs">Frequência</p>
                            <p className="font-medium text-slate-300">
                              {getFrequencyText(transaction)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-slate-500 text-xs">Próxima execução</p>
                            <p className="font-medium text-slate-300">
                              {getNextExecutionText(transaction)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-slate-500 text-xs">Última execução</p>
                            <p className="font-medium text-slate-300">
                              {transaction.lastProcessed 
                                ? new Date(transaction.lastProcessed).toLocaleDateString('pt-BR')
                                : 'Nunca'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditRecurring(transaction)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                      
                      <button
                        onClick={() => handleDeleteRecurring(transaction)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-500/40 bg-red-500/10 hover:bg-red-500/20 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Excluir</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Lista de Contas Recorrentes */}
        <div className="space-y-3 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                <Calendar className="w-4 h-4 text-white" />
              </div>
              Contas Recorrentes
            </h2>
            <button
              onClick={() => navigate('/bills')}
              className="text-sm text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Ver todas →
            </button>
          </div>

          {recurringBills.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl p-8 text-center border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5" />
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%)' }}>
                  <Calendar className="h-8 w-8 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Nenhuma conta recorrente
                </h3>
                <p className="text-slate-400 mb-6 text-sm max-w-sm mx-auto">
                  Configure contas recorrentes para automatizar seus lembretes de pagamento.
                </p>
                <button 
                  onClick={() => navigate('/bills')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium text-white mx-auto transition-all duration-300 hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                >
                  <Calendar className="w-4 h-4" /> Adicionar Conta
                </button>
              </div>
            </div>
          ) : (
            recurringBills.map((bill) => (
              <div 
                key={bill.id} 
                className="relative overflow-hidden rounded-2xl border border-white/10 transition-all duration-300 hover:border-white/20"
                style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%)' }}
              >
                {/* Colored accent bar */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ background: 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)' }}
                />
                
                <div className="p-4 pl-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.3) 100%)' }}
                      >
                        <Calendar className="h-5 w-5 text-amber-400" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-white truncate">{bill.title}</h3>
                          <span 
                            className="px-2 py-0.5 rounded-lg text-xs font-medium"
                            style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d' }}
                          >
                            Conta Recorrente
                          </span>
                        </div>
                        
                        <p className="text-xl font-bold text-amber-400">
                          R$ {bill.amount.toFixed(2)}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            {bill.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Dia {bill.recurringDay || new Date(bill.dueDate).getDate()} do mês
                          </span>
                          {bill.totalInstallments && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {bill.currentInstallment || 1}/{bill.totalInstallments} parcelas
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditBill(bill)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white/80 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all"
                      >
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">Gerenciar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Edição/Criação com TransactionModal moderno */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
          setIsCreatingNew(false);
        }}
        transaction={editingTransaction}
        type={isCreatingNew ? newTransactionType : (editingTransaction?.type || 'expense')}
        onSave={handleSaveTransaction}
        categories={
          (isCreatingNew ? newTransactionType : editingTransaction?.type) === 'income' 
            ? INCOME_CATEGORIES 
            : EXPENSE_CATEGORIES
        }
      />

      {/* 🚫 MODAL LIMITE DE TRANSAÇÕES RECORRENTES */}
      {showRecurringLimit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative overflow-hidden rounded-3xl max-w-md w-full border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
            <div className="relative p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                📊 Primeira transação recorrente da semana
              </h3>
              <p className="text-slate-400 mb-6">
                Para criar sua primeira transação recorrente desta semana, você precisa assistir a um anúncio. Isso libera <span className="text-white font-medium">1 transação recorrente</span> até a próxima semana.
              </p>
              
              {/* Opção Premium */}
              <div className="relative overflow-hidden rounded-2xl p-4 mb-4 border border-purple-500/30" style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)' }}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-xl" />
                <div className="relative">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-lg">✨</span> Upgrade para Premium
                  </h4>
                  <p className="text-sm text-slate-300 mb-3">
                    Transações recorrentes <span className="text-purple-300 font-medium">ilimitadas</span> + todos os recursos premium
                  </p>
                  <button
                    onClick={() => {
                      setShowRecurringLimit(false);
                      openPaywall('transactions');
                      console.log('🎯 [RECURRING] Usuário escolheu upgrade premium - abrindo paywall');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)' }}
                  >
                    🚀 Fazer Upgrade
                  </button>
                </div>
              </div>
              
              {/* Divisor */}
              <div className="flex items-center mb-4">
                <div className="flex-1 border-t border-white/10"></div>
                <span className="px-3 text-slate-500 text-sm">ou</span>
                <div className="flex-1 border-t border-white/10"></div>
              </div>
              
              {/* Opção Anúncio */}
              <div className="relative overflow-hidden rounded-2xl p-4 mb-4 border border-amber-500/30" style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)' }}>
                <div className="relative">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <span className="text-lg">🎬</span> Assistir anúncio obrigatório
                  </h4>
                  <p className="text-sm text-slate-300 mb-3">
                    Assista a um anúncio para liberar <span className="text-amber-300 font-medium">1 transação recorrente</span> esta semana
                  </p>
                  
                  {cooldownInfo && cooldownInfo.isInCooldown ? (
                    <div className="rounded-xl p-2 mb-3 border border-amber-500/20" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                      <p className="text-xs text-amber-300">
                        ⏱️ Próximo anúncio em: {cooldownInfo.remainingMinutes || 0} min
                      </p>
                    </div>
                  ) : null}
                  
                  <button
                    onClick={handleWatchAd}
                    disabled={isWatchingAd || (cooldownInfo && cooldownInfo.isInCooldown)}
                    className="w-full py-2.5 px-4 rounded-xl font-semibold text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)' }}
                  >
                    {isWatchingAd ? '📺 Assistindo...' : '🎬 Assistir Anúncio'}
                  </button>
                </div>
              </div>
              
              <button
                onClick={() => setShowRecurringLimit(false)}
                className="w-full px-4 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PaywallModal */}
      {user && (
        <PaywallModal
          isOpen={isPaywallOpen}
          onClose={closePaywall}
          onUpgrade={(planType) => {
            console.log('🎯 [RECURRING] Upgrade realizado:', planType);
            closePaywall();
            loadData(); // Recarregar dados após upgrade
          }}
          trigger="transactions"
          userId={user.id}
        />
      )}
    </div>
  );
};

export default RecurringTransactionsPage;
