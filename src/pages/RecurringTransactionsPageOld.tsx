import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction } from '@/types';
import { getCurrentUser, getTransactions } from '@/utils/localStorage';
import { 
  processRecurringTransactions, 
  processSpecificRecurring, 
  getRecurringTransactionsStats,
  debugRecurringTransactions 
} from '@/utils/recurringProcessor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { updateTransaction } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  RefreshCw, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  PlayCircle,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const RecurringTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recurringTransactions, setRecurringTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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

    // Atualizar quando houver mudanças nas transações
    const handleTransactionsUpdate = () => {
      setTimeout(loadData, 100); // Pequeno delay para garantir que os dados foram atualizados
    };

    window.addEventListener('transactionsUpdated', handleTransactionsUpdate);
    return () => window.removeEventListener('transactionsUpdated', handleTransactionsUpdate);
  }, [navigate]);

  // Processar todas as transações recorrentes
  const handleProcessAll = async () => {
    setIsProcessing(true);
    try {
      const result = await processRecurringTransactions();
      
      if (result.processedCount > 0) {
        toast({
          title: "Processamento concluído!",
          description: `${result.processedCount} transação(ões) recorrente(s) foram criadas.`,
          variant: "default"
        });
      } else {
        toast({
          title: "Nenhuma transação processada",
          description: "Não há transações recorrentes pendentes para hoje.",
          variant: "default"
        });
      }

      if (result.errors.length > 0) {
        console.error('Erros no processamento:', result.errors);
        toast({
          title: "Alguns erros ocorreram",
          description: `${result.errors.length} erro(s) durante o processamento. Verifique o console.`,
          variant: "destructive"
        });
      }

      loadData();
    } catch (error) {
      console.error('Erro ao processar transações recorrentes:', error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar as transações recorrentes.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Processar transação específica
  const handleProcessSpecific = async (transactionId: string) => {
    try {
      const success = await processSpecificRecurring(transactionId);
      
      if (success) {
        toast({
          title: "Transação processada!",
          description: "A transação recorrente foi criada com sucesso.",
          variant: "default"
        });
        loadData();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível processar a transação.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar a transação.",
        variant: "destructive"
      });
    }
  };

  // Debug no console
  const handleDebug = () => {
    debugRecurringTransactions();
    toast({
      title: "Debug executado",
      description: "Verifique o console do navegador para ver os detalhes.",
      variant: "default"
    });
  };

  // Editar transação recorrente
  const handleEditRecurring = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  // Salvar edição da transação recorrente
  const handleSaveEdit = () => {
    if (!editingTransaction) return;

    try {
      updateTransaction(editingTransaction);
      loadData();
      setEditingTransaction(null);
      
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

  // Obter próxima execução formatada
  const getNextExecutionText = (transaction: Transaction): string => {
    if (!transaction.nextOccurrence) return 'Não calculado';
    
    const next = new Date(transaction.nextOccurrence);
    const today = new Date();
    const diffTime = next.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays < 0) return 'Atrasada';
    
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

  // Verificar se está pendente
  const isPending = (transaction: Transaction): boolean => {
    if (!transaction.nextOccurrence) return false;
    const next = new Date(transaction.nextOccurrence);
    const today = new Date();
    return next <= today;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Transações Recorrentes
              </h1>
              <p className="text-sm text-gray-600">
                Gerencie suas transações automáticas
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDebug}
              className="hidden md:flex"
            >
              <Settings className="h-4 w-4 mr-2" />
              Debug
            </Button>
            <Button 
              onClick={handleProcessAll}
              disabled={isProcessing}
              size="sm"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Processar Todas
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalRecurring}</p>
                    <p className="text-sm text-gray-600">Configuradas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalInstances}</p>
                    <p className="text-sm text-gray-600">Executadas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.pendingToday}</p>
                    <p className="text-sm text-gray-600">Pendentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      R$ {stats.totalAmount.toFixed(0)}
                    </p>
                    <p className="text-sm text-gray-600">Total/mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de transações recorrentes */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Transações Configuradas ({recurringTransactions.length})
          </h2>

          {recurringTransactions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma transação recorrente
                </h3>
                <p className="text-gray-600 mb-4">
                  Configure transações automáticas para poupar tempo
                </p>
                <Button onClick={() => navigate('/dashboard')}>
                  Adicionar Transação
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recurringTransactions.map(transaction => {
                const pending = isPending(transaction);
                
                return (
                  <Card key={transaction.id} className={pending ? 'ring-2 ring-orange-200' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${
                              transaction.type === 'income' 
                                ? 'bg-green-100 text-green-600' 
                                : 'bg-red-100 text-red-600'
                            }`}>
                              {transaction.type === 'income' ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                            </div>
                            
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {transaction.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {transaction.category}
                              </p>
                            </div>
                            
                            {pending && (
                              <Badge variant="destructive" className="ml-2">
                                Pendente
                              </Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Valor</p>
                              <p className="font-medium">
                                R$ {transaction.amount.toFixed(2)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-gray-600">Frequência</p>
                              <p className="font-medium">
                                {getFrequencyText(transaction)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-gray-600">Próxima execução</p>
                              <p className="font-medium">
                                {getNextExecutionText(transaction)}
                              </p>
                            </div>
                            
                            <div>
                              <p className="text-gray-600">Última execução</p>
                              <p className="font-medium">
                                {transaction.lastProcessed 
                                  ? new Date(transaction.lastProcessed).toLocaleDateString('pt-BR')
                                  : 'Nunca'
                                }
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProcessSpecific(transaction.id)}
                            className="whitespace-nowrap"
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Executar
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditRecurring(transaction)}
                            className="whitespace-nowrap"
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumo por frequência */}
        {stats && stats.totalRecurring > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumo por Frequência
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.byFrequency.weekly}
                  </p>
                  <p className="text-sm text-gray-600">Semanais</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.byFrequency.monthly}
                  </p>
                  <p className="text-sm text-gray-600">Mensais</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.byFrequency.yearly}
                  </p>
                  <p className="text-sm text-gray-600">Anuais</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Edição */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Transação Recorrente</DialogTitle>
          </DialogHeader>
          
          {editingTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Título
                </Label>
                <Input
                  id="title"
                  value={editingTransaction.title}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    title: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Valor
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={editingTransaction.amount}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    amount: parseFloat(e.target.value) || 0
                  })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Descrição
                </Label>
                <Input
                  id="description"
                  value={editingTransaction.description || ''}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    description: e.target.value
                  })}
                  className="col-span-3"
                />
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingTransaction(null)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveEdit}>
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecurringTransactionsPage;
