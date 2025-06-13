import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Check, X, Trash2 } from 'lucide-react';

interface Transaction {
  description: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  confidence: number;
}

interface TransactionListProps {
  transactions: Transaction[];
  onUpdate: (index: number, updatedTransaction: Transaction) => void;
  onDelete: (index: number) => void;
}

const categories = [
  'alimentacao', 'transporte', 'saude', 'educacao', 'lazer', 
  'casa', 'tecnologia', 'roupas', 'servicos', 'outros'
];

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  onUpdate, 
  onDelete 
}) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editData, setEditData] = useState<Transaction | null>(null);

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditData({ ...transactions[index] });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditData(null);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editData) {
      onUpdate(editingIndex, editData);
      setEditingIndex(null);
      setEditData(null);
    }
  };

  const deleteTransaction = (index: number) => {
    onDelete(index);
  };

  return (
    <div className="space-y-3">
      {transactions.map((transaction, index) => (
        <div key={index} className="border rounded-lg p-3 bg-gray-50">
          {editingIndex === index && editData ? (
            // Modo de edição
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Descrição:</label>
                <Input
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Valor (R$):</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.amount}
                    onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) || 0 })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Data:</label>
                  <Input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Categoria:</label>
                  <Select 
                    value={editData.category} 
                    onValueChange={(value) => setEditData({ ...editData, category: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tipo:</label>
                  <Select 
                    value={editData.type} 
                    onValueChange={(value: 'income' | 'expense') => setEditData({ ...editData, type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
                <Button size="sm" onClick={saveEdit}>
                  <Check className="w-4 h-4 mr-1" />
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            // Modo de visualização
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{transaction.description}</div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">R$ {transaction.amount.toFixed(2)}</span> • 
                  <span className="ml-1">{transaction.type === 'income' ? 'Receita' : 'Despesa'}</span> • 
                  <span className="ml-1">{transaction.category}</span> • 
                  <span className="ml-1">{transaction.date || 'Hoje'}</span>
                </div>
              </div>
              
              <div className="flex gap-1 ml-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => startEdit(index)}
                  className="p-1 h-8 w-8"
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => deleteTransaction(index)}
                  className="p-1 h-8 w-8"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
