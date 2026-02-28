import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PlusCircle, MinusCircle, Calendar, Tag, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXPENSE_CATEGORIES } from '@/types';

interface QuickAddTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: QuickTransaction) => void;
}

interface QuickTransaction {
  description: string;
  amount: string;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

// Usar as categorias oficiais do sistema
const categories = EXPENSE_CATEGORIES;

export const QuickAddTransaction: React.FC<QuickAddTransactionProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [transaction, setTransaction] = useState<QuickTransaction>({
    description: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transaction.description || !transaction.amount || !transaction.category) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(transaction);
      // Reset form
      setTransaction({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            Adicionar Transação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo de Transação */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={transaction.type === 'expense' ? 'default' : 'outline'}
              className={cn(
                "flex-1 justify-center gap-2",
                transaction.type === 'expense' && "bg-red-600 hover:bg-red-700"
              )}
              onClick={() => setTransaction({ ...transaction, type: 'expense' })}
            >
              <MinusCircle className="h-4 w-4" />
              Despesa
            </Button>
            <Button
              type="button"
              variant={transaction.type === 'income' ? 'default' : 'outline'}
              className={cn(
                "flex-1 justify-center gap-2",
                transaction.type === 'income' && "bg-green-600 hover:bg-green-700"
              )}
              onClick={() => setTransaction({ ...transaction, type: 'income' })}
            >
              <PlusCircle className="h-4 w-4" />
              Receita
            </Button>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Almoço no restaurante"
              value={transaction.description}
              onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
              required
            />
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={transaction.amount}
              onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
              required
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">
              <Tag className="h-4 w-4 inline mr-1" />
              Categoria
            </Label>
            <Select
              value={transaction.category}
              onValueChange={(value) => setTransaction({ ...transaction, category: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date">
              <Calendar className="h-4 w-4 inline mr-1" />
              Data
            </Label>
            <Input
              id="date"
              type="date"
              value={transaction.date}
              onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
              required
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !transaction.description || !transaction.amount || !transaction.category}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickAddTransaction;
