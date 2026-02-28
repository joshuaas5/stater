import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Edit2, Check, ChevronDown, DollarSign, Tag, Calendar } from 'lucide-react';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types';
import './MultiTransactionModal.css';

interface Transaction {
  id?: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

interface MultiTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onSaveAll: (transactions: Transaction[]) => void;
  documentInfo?: {
    documentType?: string;
    establishment?: string;
  };
}

export const MultiTransactionModal: React.FC<MultiTransactionModalProps> = ({
  isOpen,
  onClose,
  transactions: initialTransactions,
  onSaveAll,
  documentInfo
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  if (!isOpen) return null;

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = (index: number) => {
    setEditingIndex(null);
  };

  const handleDelete = (index: number) => {
    const newTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(newTransactions);
  };

  const handleFieldChange = (index: number, field: keyof Transaction, value: any) => {
    const newTransactions = [...transactions];
    newTransactions[index] = {
      ...newTransactions[index],
      [field]: value
    };
    setTransactions(newTransactions);
  };

  const toggleCategoryDropdown = (index: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSaveAll = () => {
    onSaveAll(transactions);
    onClose();
  };

  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="multi-transaction-modal-overlay" onClick={onClose}>
      <div className="multi-transaction-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>📋 Transações Detectadas</h2>
            {documentInfo?.establishment && (
              <p className="establishment">{documentInfo.establishment}</p>
            )}
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Summary */}
        <div className="modal-summary">
          <div className="summary-item">
            <span className="summary-label">Total de itens:</span>
            <span className="summary-value">{transactions.length}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Valor total:</span>
            <span className="summary-value total">
              R$ {totalAmount.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Transactions List */}
        <div className="transactions-list">
          {transactions.map((transaction, index) => {
            const isEditing = editingIndex === index;
            const categories = transaction.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
            const isCategoryExpanded = expandedCategories.has(index);

            return (
              <div key={index} className={`transaction-item ${isEditing ? 'editing' : ''}`}>
                <div className="transaction-header">
                  <span className="transaction-number">#{index + 1}</span>
                  <div className="transaction-actions">
                    {isEditing ? (
                      <button 
                        className="action-btn save" 
                        onClick={() => handleSaveEdit(index)}
                        title="Salvar alterações"
                      >
                        <Check size={18} />
                      </button>
                    ) : (
                      <button 
                        className="action-btn edit" 
                        onClick={() => handleEdit(index)}
                        title="Editar transação"
                      >
                        <Edit2 size={18} />
                      </button>
                    )}
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDelete(index)}
                      title="Remover transação"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="transaction-content">
                  {/* Description */}
                  <div className="field-group">
                    <label>
                      <Tag size={16} />
                      Descrição
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={transaction.description}
                        onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
                        placeholder="Ex: Arroz Tipo 1 5kg"
                      />
                    ) : (
                      <span className="field-value">{transaction.description}</span>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="field-group">
                    <label>
                      <DollarSign size={16} />
                      Valor
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={transaction.amount}
                        onChange={(e) => handleFieldChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                      />
                    ) : (
                      <span className={`field-value amount ${transaction.type}`}>
                        R$ {transaction.amount.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>

                  {/* Category */}
                  <div className="field-group">
                    <label>
                      <Tag size={16} />
                      Categoria
                    </label>
                    {isEditing ? (
                      <div className="category-dropdown">
                        <button
                          className="category-button"
                          onClick={() => toggleCategoryDropdown(index)}
                        >
                          {transaction.category || 'Selecionar categoria'}
                          <ChevronDown size={16} />
                        </button>
                        {isCategoryExpanded && (
                          <div className="category-options">
                            {categories.map((cat) => (
                              <div
                                key={cat}
                                className={`category-option ${transaction.category === cat ? 'selected' : ''}`}
                                onClick={() => {
                                  handleFieldChange(index, 'category', cat);
                                  toggleCategoryDropdown(index);
                                }}
                              >
                                {cat}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="field-value category">{transaction.category}</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="field-group">
                    <label>
                      <Calendar size={16} />
                      Data
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={transaction.date}
                        onChange={(e) => handleFieldChange(index, 'date', e.target.value)}
                      />
                    ) : (
                      <span className="field-value">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button 
            className="btn-save" 
            onClick={handleSaveAll}
            disabled={transactions.length === 0}
          >
            <Save size={18} />
            Salvar Todas ({transactions.length})
          </button>
        </div>
      </div>
    </div>
  );
};
