import React, { useState } from 'react';
import { TransactionModal } from '@/components/modals/TransactionModal';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types';
import { X, Edit2, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AITransactionData {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category?: string;
  date?: string;
}

interface AITransactionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: AITransactionData[];
  onConfirm: (transactions: AITransactionData[]) => void;
  isLoading?: boolean;
}

export const AITransactionReviewModal: React.FC<AITransactionReviewModalProps> = ({
  isOpen,
  onClose,
  transactions: initialTransactions,
  onConfirm,
  isLoading = false
}) => {
  const [transactions, setTransactions] = useState<AITransactionData[]>(initialTransactions);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!isOpen) return null;

  const handleEditTransaction = (index: number) => {
    setEditingIndex(index);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (transactionData: Partial<Transaction>) => {
    if (editingIndex === null) return;
    
    const updatedTransactions = [...transactions];
    updatedTransactions[editingIndex] = {
      ...updatedTransactions[editingIndex],
      description: transactionData.title || updatedTransactions[editingIndex].description,
      amount: parseFloat(transactionData.amount?.toString() || '0') || updatedTransactions[editingIndex].amount,
      category: transactionData.category || updatedTransactions[editingIndex].category || 'outros',
      type: updatedTransactions[editingIndex].type // Manter o tipo original
    };
    
    setTransactions(updatedTransactions);
    setIsEditModalOpen(false);
    setEditingIndex(null);
  };

  const handleDeleteTransaction = (index: number) => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  const handleConfirmAll = () => {
    if (transactions.length === 0) {
      onClose();
      return;
    }
    onConfirm(transactions);
  };

  const totalAmount = transactions.reduce((sum, tx) => 
    sum + (tx.type === 'income' ? tx.amount : -tx.amount), 0
  );

  const incomeCount = transactions.filter(tx => tx.type === 'income').length;
  const expenseCount = transactions.filter(tx => tx.type === 'expense').length;

  // Se estiver editando, mostrar o TransactionModal
  const editingTransaction = editingIndex !== null ? transactions[editingIndex] : null;
  const transactionForEdit = editingTransaction ? {
    id: uuidv4(),
    title: editingTransaction.description,
    amount: editingTransaction.amount,
    category: editingTransaction.category || '',
    type: editingTransaction.type,
    date: new Date(),
    userId: ''
  } as Transaction : null;

  return (
    <>
      {/* Modal Principal de Lista */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)'
        }}
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'modalSlideIn 0.3s ease-out'
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                📋 Revisar Transações
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {transactions.length} transação{transactions.length !== 1 ? 'ões' : ''} detectada{transactions.length !== 1 ? 's' : ''}
                {incomeCount > 0 && <span className="ml-2">💰 {incomeCount} entrada{incomeCount !== 1 ? 's' : ''}</span>}
                {expenseCount > 0 && <span className="ml-2">💸 {expenseCount} saída{expenseCount !== 1 ? 's' : ''}</span>}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              disabled={isLoading}
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Resumo Total */}
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total:</span>
              <span className={`text-2xl font-bold ${totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalAmount >= 0 ? '+' : ''}R$ {Math.abs(totalAmount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Lista de Transações */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="text-lg">Nenhuma transação para revisar</p>
                <p className="text-sm mt-2">Todas as transações foram removidas</p>
              </div>
            ) : (
              transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">
                          {transaction.type === 'income' ? '💰' : '💸'}
                        </span>
                        <h3 className="font-semibold text-gray-900 truncate">
                          {transaction.description}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          R$ {transaction.amount.toFixed(2)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          {transaction.category || 'Sem categoria'}
                        </span>
                        <span className="text-gray-500">
                          {transaction.type === 'income' ? 'Entrada' : 'Saída'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditTransaction(index)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remover"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer com Botões de Ação */}
          <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ❌ Cancelar
            </button>
            <button
              onClick={handleConfirmAll}
              disabled={isLoading || transactions.length === 0}
              className="flex-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Salvando...
                </>
              ) : (
                `✅ Salvar ${transactions.length} Transaç${transactions.length !== 1 ? 'ões' : 'ão'}`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Edição (TransactionModal) */}
      {isEditModalOpen && transactionForEdit && (
        <TransactionModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingIndex(null);
          }}
          transaction={transactionForEdit}
          type={transactionForEdit.type}
          onSave={handleSaveEdit}
          categories={transactionForEdit.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES}
        />
      )}

      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};
