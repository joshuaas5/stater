import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types';
import { getCurrentUser, getTransactions, updateTransaction, deleteTransaction } from '@/utils/localStorage';
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
  const [stats, setStats] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carregar dados
  const loadData = () => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    const allTransactions = getTransactions();
    const recurring = allTransactions.filter(t => t.isRecurring && !t.isRecurringInstance);
    setRecurringTransactions(recurring);

    const statsData = getRecurringTransactionsStats();
    setStats(statsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Editar transação recorrente
  const handleEditRecurring = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  // Salvar edição da transação recorrente
  const handleSaveEdit = async (updatedTransaction: Partial<Transaction>) => {
    if (!editingTransaction) return;

    try {
      // Recalcular a próxima ocorrência baseada nas novas configurações
      const finalTransaction = {
        ...editingTransaction,
        ...updatedTransaction,
        nextOccurrence: calculateNextOccurrence({
          ...editingTransaction,
          ...updatedTransaction
        } as Transaction)
      };
      
      updateTransaction(finalTransaction as Transaction);
      loadData();
      setEditingTransaction(null);
      setIsModalOpen(false);
      
      toast({
        title: "Transação atualizada!",
        description: "A transação recorrente foi editada com sucesso.",
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao editar transação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível editar a transação.",
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 pb-20">
      {/* Partículas flutuantes - Performance otimizada */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
      
      {/* Background Effects - Otimizado */}
      <div className="absolute inset-0 bg-black/10" />
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-600/15 rounded-full blur-3xl animate-pulse" />
      
      {/* Header */}
      <div className="relative z-10 bg-white/10 backdrop-blur-xl shadow-xl border-b border-white/20">
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
              <h1 
                className="text-xl font-bold text-white"
                style={{
                  fontFamily: '"Fredoka One", "Comic Sans MS", Poppins, sans-serif',
                  textShadow: 'rgba(0, 0, 0, 0.8) 2px 2px 4px, rgb(59, 130, 246) 1px 1px 0px, rgb(29, 78, 216) 2px 2px 0px, rgba(59, 130, 246, 0.5) 0px 0px 10px',
                  filter: 'drop-shadow(rgba(0, 0, 0, 0.5) 0px 2px 4px)',
                  WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.3)'
                }}
              >
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
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-4 hover:bg-white/15 transition-colors duration-300">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-300">
                  {stats.totalRecurring}
                </p>
                <p className="text-sm text-white/70">Total</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-4 hover:bg-white/15 transition-colors duration-300">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-300">
                  {stats.byFrequency.weekly}
                </p>
                <p className="text-sm text-white/70">Semanais</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-4 hover:bg-white/15 transition-colors duration-300">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-300">
                  {stats.byFrequency.monthly}
                </p>
                <p className="text-sm text-white/70">Mensais</p>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-4 hover:bg-white/15 transition-colors duration-300">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-300">
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
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-8 text-center hover:bg-white/15 transition-colors duration-300">
              <BarChart3 className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <h3 
                className="text-lg font-medium text-white mb-2"
                style={{
                  fontFamily: '"Fredoka One", "Comic Sans MS", Poppins, sans-serif',
                  textShadow: 'rgba(0, 0, 0, 0.8) 2px 2px 4px, rgb(59, 130, 246) 1px 1px 0px, rgb(29, 78, 216) 2px 2px 0px, rgba(59, 130, 246, 0.5) 0px 0px 10px',
                  filter: 'drop-shadow(rgba(0, 0, 0, 0.5) 0px 2px 4px)',
                  WebkitTextStroke: '0.5px rgba(0, 0, 0, 0.3)'
                }}
              >
                Nenhuma transação recorrente
              </h3>
              <p className="text-white/70 mb-4">
                Configure transações recorrentes para automatizar seus lançamentos.
              </p>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Criar Nova Transação
              </Button>
            </div>
          ) : (
            recurringTransactions.map((transaction) => (
              <div key={transaction.id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl p-4 hover:bg-white/15 transition-colors duration-300">
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
      </div>

      {/* Modal de Edição com TransactionModal moderno */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        transaction={editingTransaction}
        type={editingTransaction?.type || 'expense'}
        onSave={handleSaveEdit}
        categories={editingTransaction?.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES}
      />
    </div>
  );
};

export default RecurringTransactionsPage;
