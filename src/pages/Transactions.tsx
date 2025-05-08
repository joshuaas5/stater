import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import TransactionItem from '@/components/transactions/TransactionItem';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types';
import { getTransactions, isLoggedIn, getCurrentUser } from '@/utils/localStorage';
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

const Transactions: React.FC = () => {
  // ...
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);

  // Função para clonar transação
  const handleCloneTransaction = (transaction: Transaction) => {
    const cloned = {
      ...transaction,
      id: `${transaction.id}_clone_${Date.now()}`,
      date: new Date(),
    };
    setNewTransaction(cloned);
    setIsAddDialogOpen(true);
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
  
  useEffect(() => {
    // Verificar se o usuário está logado
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    loadTransactions();
  }, [navigate, selectedMonth, selectedYear]);
  
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
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader 
        title="Transações" 
        showSearch={true}
        onSearch={toggleSearch}
      />
      
      <div className="px-4 mb-4">
        <MonthSelector onMonthChange={handleMonthChange} />
      </div>
      
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
      
      <div className="mt-4">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map(transaction => (
            <div key={transaction.id} className="flex items-center bg-galileo-background px-4 min-h-[72px] py-2 justify-between border-t border-galileo-border">
              <TransactionItem transaction={transaction} onEditClick={handleEditTransaction} />
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-galileo-secondaryText">
            <p>Nenhuma transação encontrada</p>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-2 text-galileo-text underline"
              >
                Limpar pesquisa
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Edit Transaction Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader className="flex justify-between items-start">
            <div>
              <DialogTitle>Editar Transação</DialogTitle>
              <DialogDescription>
                Altere os detalhes da transação.
              </DialogDescription>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                if (editingTransaction) {
                  deleteTransaction(editingTransaction.id);
                  toast({
                    title: "Transação excluída",
                    description: "A transação foi excluída com sucesso.",
                  });
                  setIsDialogOpen(false);
                  loadTransactions();
                }
              }}
            >
              <Trash2 size={16} className="mr-1" /> Excluir
            </Button>
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
            {/* Seletor de Ícone */}
            <div className="grid gap-2">
              <label className="font-medium">Ícone</label>
              <div className="flex gap-2 flex-wrap">
                {['💸','💰','🍔','🏠','🚗','🎉','🛒','📚','💳','🧾','⚡','🛠️','🧃','🧑‍💻','🏦','🛍️','✈️','🏥','💊','👕','💼','💸','🎓','🎭','👶','💻','📱','🏋️','🎮','🔌'].map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`text-2xl p-1 rounded border ${editingTransaction?.icon === icon ? 'border-galileo-accent' : 'border-transparent'} hover:border-galileo-accent/60`}
                    onClick={() => editingTransaction && setEditingTransaction({...editingTransaction, icon })}
                  >
                    {icon}
                  </button>
                ))}
              </div>
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
            <Button onClick={handleDeleteFromEdit} className="bg-galileo-negative hover:bg-galileo-negative/80 ml-2">
              Excluir
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
                    className={`text-2xl p-1 rounded border ${newTransaction?.icon === icon ? 'border-galileo-accent' : 'border-transparent'} hover:border-galileo-accent/60`}
                    onClick={() => newTransaction && setNewTransaction({...newTransaction, icon })}
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
      
      <NavBar />
    </div>
  );
};

export default Transactions;
