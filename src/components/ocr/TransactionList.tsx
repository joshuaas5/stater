import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Check, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [showScrollHint, setShowScrollHint] = useState(false);
  // Verificar se há scroll necessário
  useEffect(() => {
    setShowScrollHint(transactions.length > 4); // Mostrar hint se há mais de 4 transações
  }, [transactions.length]);

  // Calcular totais
  const totalAmount = transactions.reduce((sum, t) => {
    return sum + (t.type === 'income' ? t.amount : -t.amount);
  }, 0);

  const incomeCount = transactions.filter(t => t.type === 'income').length;
  const expenseCount = transactions.filter(t => t.type === 'expense').length;

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
  const handleDelete = (index: number) => {
    if (confirm('Tem certeza que deseja excluir esta transação?')) {
      onDelete(index);
      if (editingIndex === index) {
        cancelEdit();
      }
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    setIsScrolledToBottom(scrollTop + clientHeight >= scrollHeight - 10);
  };

  return (    <div className="space-y-3">
      {/* Contador de transações com resumo */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-sm font-semibold text-blue-800">
              📊 {transactions.length} transações encontradas
            </span>
            <div className="text-xs text-blue-600 mt-1">
              {incomeCount > 0 && <span className="mr-2">💚 {incomeCount} receitas</span>}
              {expenseCount > 0 && <span>❤️ {expenseCount} despesas</span>}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-sm font-bold ${totalAmount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {totalAmount >= 0 ? '+' : ''}R$ {totalAmount.toFixed(2)}
            </div>
            <div className="text-xs text-gray-600">Saldo total</div>
          </div>
        </div>
        
        {showScrollHint && (
          <div className="flex items-center justify-center text-xs text-blue-600 pt-2 border-t border-blue-200">
            <ChevronDown className="w-3 h-3 mr-1" />
            Role abaixo para ver todas as transações
          </div>
        )}
      </div>{/* Container com scroll para muitas transações */}
      <div 
        className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 relative"
        onScroll={handleScroll}
      >
        {transactions.map((transaction, index) => (
          <div key={index} className="border rounded-lg p-3 bg-gray-50 shadow-sm">
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
                </Button>                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDelete(index)}
                  className="p-1 h-8 w-8"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>            </div>
          )}        </div>
      ))}
      
      {/* Indicador de final da lista quando há muitas transações */}
      {transactions.length > 5 && (
        <div className="text-center py-3 text-sm text-gray-500 border-t bg-gray-50 rounded-b-lg">
          📋 Final da lista • Total: {transactions.length} transações
        </div>
      )}
      </div>
      
      {/* Resumo e ações quando há muitas transações */}
      {transactions.length > 8 && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-green-800">
              💡 <strong>Dica:</strong> Você pode editar ou excluir transações individuais antes de confirmar
            </div>
            <div className="text-xs text-green-600">
              {transactions.filter(t => t.type === 'expense').length} despesas • {transactions.filter(t => t.type === 'income').length} receitas
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
