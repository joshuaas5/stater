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
  const [recurringTransactions, setRecurringTransactions] = useState<Transaction[]>([]);
  const [recurringBills, setRecurringBills] = useState<Bill[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTransactionType, setNewTransactionType] = useState<'income' | 'expense'>('expense');

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

  // Criar nova transação
  const handleCreateNew = (type: 'income' | 'expense') => {
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
    <div className="min-h-screen relative overflow-hidden pb-20" style={{ background: '#31518b' }}>
      {/* Header */}
      <div className="relative z-10 bg-transparent">
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

      {/* Estatísticas */}
      <div className="relative z-10 p-4">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {stats.totalRecurring}
                </p>
                <p className="text-sm text-white/70">Total</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {stats.byFrequency.weekly}
                </p>
                <p className="text-sm text-white/70">Semanais</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {stats.byFrequency.monthly}
                </p>
                <p className="text-sm text-white/70">Mensais</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {stats.byFrequency.yearly}
                </p>
                <p className="text-sm text-white/70">Anuais</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Transações Recorrentes */}
        <div className="space-y-4">
          {recurringTransactions.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-8 text-center">
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
              <div key={transaction.id} className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-4">
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
            <div className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-8 text-center">
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
              <div key={bill.id} className="bg-white/10 backdrop-blur-xl rounded-lg border border-white/20 p-4">
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
                      onClick={() => {
                        // Navegar para bills e manter na página
                        window.open('/bills', '_blank');
                      }}
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
    </div>
  );
};

export default RecurringTransactionsPage;
