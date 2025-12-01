import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, Bill, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types';
import { getCurrentUser, getTransactions, updateTransaction, deleteTransaction, saveTransaction, getBills } from '@/utils/localStorage';
import { getRecurringTransactionsStats, calculateNextOccurrence } from '@/utils/recurringProcessor';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className="min-h-screen relative overflow-hidden pb-20 lg:pb-8">
      {/* Header - Hidden on desktop */}
      <div className="relative z-10 bg-transparent lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="p-2 text-white hover:text-white hover:bg-white/20 backdrop-blur-sm rounded-lg transition-all duration-300"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">
                Transações Recorrentes
              </h1>
              <p className="text-sm text-white/70">
                Suas transações são processadas automaticamente no dia configurado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block px-6 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-white">Transações Recorrentes</h1>
        <p className="text-white/60 mt-1">Gerencie suas transações automáticas</p>
      </div>

      {/* Estatísticas */}
      <div className="relative z-10 p-4 lg:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {stats?.totalRecurring || 0}
              </p>
              <p className="text-sm text-white/70">Total</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {stats?.byFrequency?.weekly || 0}
              </p>
              <p className="text-sm text-white/70">Semanais</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {stats?.byFrequency?.monthly || 0}
              </p>
              <p className="text-sm text-white/70">Mensais</p>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {stats?.byFrequency?.yearly || 0}
              </p>
              <p className="text-sm text-white/70">Anuais</p>
            </div>
          </div>
        </div>

        {/* Lista de Transações Recorrentes */}
        <div className="space-y-4">
          {recurringTransactions.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-8 text-center">
              <BarChart3 className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhuma transação recorrente
              </h3>
              <p className="text-white/70 mb-4">
                Configure transações recorrentes para automatizar seus lançamentos.
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={() => handleCreateNew('income')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  + Receita
                </Button>
                <Button 
                  onClick={() => handleCreateNew('expense')}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  + Despesa
                </Button>
              </div>
            </div>
          ) : (
            recurringTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' 
                          ? 'bg-green-500/20 border border-green-400/30' 
                          : 'bg-red-500/20 border border-red-400/30'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-6 w-6 text-green-300" />
                        ) : (
                          <TrendingDown className="h-6 w-6 text-red-300" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">
                            {transaction.title}
                          </h3>
                          <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} className="bg-white/20 text-white border-white/30">
                            {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                          </Badge>
                        </div>
                        
                        <p className={`text-lg font-bold ${
                          transaction.type === 'income' 
                            ? 'text-green-300' 
                            : 'text-red-300'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-sm">
                          <div>
                            <p className="text-white/60">Frequência</p>
                            <p className="font-medium text-white">
                              {getFrequencyText(transaction)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-white/60">Próxima execução</p>
                            <p className="font-medium text-white">
                              {getNextExecutionText(transaction)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-white/60">Última execução</p>
                            <p className="font-medium text-white">
                              {transaction.lastProcessed 
                                ? new Date(transaction.lastProcessed).toLocaleDateString('pt-BR')
                                : 'Nunca'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditRecurring(transaction)}
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRecurring(transaction)}
                        className="bg-red-500/20 border-red-400/30 text-red-200 hover:bg-red-500/30 text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </div>
            ))
          )}
        </div>

        {/* Lista de Contas Recorrentes */}
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Contas Recorrentes
            </h2>
          </div>

          {recurringBills.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-8 text-center">
              <Calendar className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Nenhuma conta recorrente
              </h3>
              <p className="text-white/70 mb-4">
                Configure contas recorrentes para automatizar seus lembretes de pagamento.
              </p>
              <Button 
                onClick={() => navigate('/bills')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                + Adicionar Conta
              </Button>
            </div>
          ) : (
            recurringBills.map((bill) => (
              <div key={bill.id} className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-orange-500/20 border border-orange-400/30">
                      <Calendar className="h-6 w-6 text-orange-400" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-white">{bill.title}</h3>
                        <Badge 
                          variant="secondary" 
                          className="bg-orange-500/20 text-orange-200 border-orange-400/30 text-xs"
                        >
                          Conta Recorrente
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
                        <span className="flex items-center gap-1">
                          <span className="font-medium text-orange-300">
                            R$ {bill.amount.toFixed(2)}
                          </span>
                        </span>
                        <span>{bill.category}</span>
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

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditBill(bill)}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Gerenciar
                    </Button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              � Primeira transação recorrente da semana
            </h3>
            <p className="text-gray-600 mb-4">
              Para criar sua primeira transação recorrente desta semana, você precisa assistir a um anúncio. Isso libera <strong>1 transação recorrente</strong> até a próxima semana.
            </p>
            
            {/* Opção Premium */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">✨ Upgrade para Premium</h4>
              <p className="text-sm text-blue-800 mb-3">
                Transações recorrentes <strong>ilimitadas</strong> + todos os recursos premium
              </p>
              <button
                onClick={() => {
                  setShowRecurringLimit(false);
                  openPaywall('transactions');
                  console.log('🎯 [RECURRING] Usuário escolheu upgrade premium - abrindo paywall');
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                🚀 Fazer Upgrade
              </button>
            </div>
            
            {/* Divisor */}
            <div className="flex items-center mb-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-gray-500 text-sm">ou</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>
            
            {/* Opção Anúncio */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-900 mb-2">🎬 Assistir anúncio obrigatório</h4>
              <p className="text-sm text-yellow-800 mb-3">
                Assista a um anúncio para liberar <strong>1 transação recorrente</strong> esta semana
              </p>
              
              {cooldownInfo && cooldownInfo.isInCooldown ? (
                <div className="bg-yellow-100 border border-yellow-300 rounded p-2 mb-3">
                  <p className="text-xs text-yellow-800">
                    ⏱️ Próximo anúncio em: {cooldownInfo.remainingMinutes || 0} min
                  </p>
                </div>
              ) : null}
              
              <button
                onClick={handleWatchAd}
                disabled={isWatchingAd || (cooldownInfo && cooldownInfo.isInCooldown)}
                className="w-full bg-yellow-500 text-yellow-900 py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isWatchingAd ? '📺 Assistindo...' : '🎬 Assistir Anúncio'}
              </button>
            </div>
            
            <button
              onClick={() => setShowRecurringLimit(false)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
            >
              Cancelar
            </button>
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
