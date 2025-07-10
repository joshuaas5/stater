import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types';
import { getCurrentUser, getTransactions, updateTransaction } from '@/utils/localStorage';
import { getRecurringTransactionsStats, calculateNextOccurrence } from '@/utils/recurringProcessor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Settings,
  BarChart3
} from 'lucide-react';

const RecurringTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [recurringTransactions, setRecurringTransactions] = useState<Transaction[]>([]);
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
  }, []);

  // Editar transação recorrente
  const handleEditRecurring = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  // Salvar edição da transação recorrente
  const handleSaveEdit = () => {
    if (!editingTransaction) return;

    try {
      // Recalcular a próxima ocorrência baseada nas novas configurações
      const updatedTransaction = {
        ...editingTransaction,
        nextOccurrence: calculateNextOccurrence(editingTransaction)
      };
      
      updateTransaction(updatedTransaction);
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Transações Recorrentes
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Suas transações são processadas automaticamente no dia configurado
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="p-4">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.totalRecurring}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.byFrequency.weekly}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Semanais</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.byFrequency.monthly}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Mensais</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.byFrequency.yearly}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Anuais</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lista de Transações Recorrentes */}
        <div className="space-y-4">
          {recurringTransactions.length === 0 ? (
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Nenhuma transação recorrente
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Configure transações recorrentes para automatizar seus lançamentos.
                </p>
                <Button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Criar Nova Transação
                </Button>
              </CardContent>
            </Card>
          ) : (
            recurringTransactions.map((transaction) => (
              <Card key={transaction.id} className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 dark:bg-green-900' 
                          : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className={`h-6 w-6 ${
                            transaction.type === 'income' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`} />
                        ) : (
                          <TrendingDown className={`h-6 w-6 ${
                            transaction.type === 'income' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`} />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {transaction.title}
                          </h3>
                          <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                            {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                          </Badge>
                        </div>
                        
                        <p className={`text-lg font-bold ${
                          transaction.type === 'income' 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Frequência</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {getFrequencyText(transaction)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Próxima execução</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {getNextExecutionText(transaction)}
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Última execução</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
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
                        className="whitespace-nowrap dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal de Edição */}
      <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">Editar Transação Recorrente</DialogTitle>
          </DialogHeader>
          
          {editingTransaction && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right dark:text-gray-300">
                  Título
                </Label>
                <Input
                  id="title"
                  value={editingTransaction.title}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    title: e.target.value
                  })}
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right dark:text-gray-300">
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
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right dark:text-gray-300">
                  Categoria
                </Label>
                <Select
                  value={editingTransaction.category || ''}
                  onValueChange={(value) => setEditingTransaction({
                    ...editingTransaction,
                    category: value
                  })}
                >
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    {(editingTransaction.type === 'income' 
                      ? INCOME_CATEGORIES 
                      : EXPENSE_CATEGORIES
                    ).map((category) => (
                      <SelectItem 
                        key={category} 
                        value={category}
                        className="dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="frequency" className="text-right dark:text-gray-300">
                  Frequência
                </Label>
                <Select
                  value={editingTransaction.recurrenceFrequency || 'monthly'}
                  onValueChange={(value: 'weekly' | 'monthly' | 'yearly') => setEditingTransaction({
                    ...editingTransaction,
                    recurrenceFrequency: value
                  })}
                >
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                    <SelectItem value="weekly" className="dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                      Semanal
                    </SelectItem>
                    <SelectItem value="monthly" className="dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                      Mensal
                    </SelectItem>
                    <SelectItem value="yearly" className="dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                      Anual
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {editingTransaction.recurrenceFrequency === 'weekly' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="weekday" className="text-right dark:text-gray-300">
                    Dia da Semana
                  </Label>
                  <Select
                    value={editingTransaction.recurringWeekday?.toString() || '0'}
                    onValueChange={(value) => setEditingTransaction({
                      ...editingTransaction,
                      recurringWeekday: parseInt(value)
                    })}
                  >
                    <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="0" className="dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Domingo</SelectItem>
                      <SelectItem value="1" className="dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Segunda-feira</SelectItem>
                      <SelectItem value="2" className="dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Terça-feira</SelectItem>
                      <SelectItem value="3" className="dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Quarta-feira</SelectItem>
                      <SelectItem value="4" className="dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Quinta-feira</SelectItem>
                      <SelectItem value="5" className="dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Sexta-feira</SelectItem>
                      <SelectItem value="6" className="dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">Sábado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {(editingTransaction.recurrenceFrequency === 'monthly' || editingTransaction.recurrenceFrequency === 'yearly') && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="day" className="text-right dark:text-gray-300">
                    Dia {editingTransaction.recurrenceFrequency === 'monthly' ? 'do Mês' : 'do Ano'}
                  </Label>
                  <Input
                    id="day"
                    type="number"
                    min="1"
                    max={editingTransaction.recurrenceFrequency === 'monthly' ? '31' : '365'}
                    value={editingTransaction.recurringDay || ''}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction,
                      recurringDay: parseInt(e.target.value) || 1
                    })}
                    className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  />
                </div>
              )}
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingTransaction(null)}
                  className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
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
