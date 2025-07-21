import React, { useState, useCallback, useEffect } from 'react';
import { X, DollarSign, Tag, Calendar, Repeat, Save, Trash2, ArrowRight } from 'lucide-react';
import { Transaction } from '@/types';
import './TransactionModal.css';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  type: 'income' | 'expense';
  onSave: (transaction: Partial<Transaction>) => void;
  onDelete?: (transactionId: string) => void;
  categories: string[];
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  type,
  onSave,
  onDelete,
  categories
}) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    isRecurring: false,
    recurrenceFrequency: 'monthly'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!transaction;
  const isIncome = type === 'income';

  // Atualizar formData quando transaction mudar
  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title || '',
        amount: transaction.amount?.toString() || '',
        category: transaction.category || '',
        isRecurring: transaction.isRecurring || false,
        recurrenceFrequency: transaction.recurrenceFrequency || 'monthly'
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: '',
        isRecurring: false,
        recurrenceFrequency: 'monthly'
      });
    }
    setErrors({});
  }, [transaction, isOpen]);

  // Validação em tempo real
  const validateField = useCallback((field: string, value: any) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'title':
        if (!value?.trim()) {
          newErrors.title = 'Descrição é obrigatória';
        } else if (value.trim().length < 2) {
          newErrors.title = 'Descrição muito curta';
        } else {
          delete newErrors.title;
        }
        break;
      case 'amount':
        const numValue = parseFloat(value);
        if (!value || isNaN(numValue) || numValue <= 0) {
          newErrors.amount = 'Valor deve ser maior que zero';
        } else if (numValue > 999999999) {
          newErrors.amount = 'Valor muito alto';
        } else {
          delete newErrors.amount;
        }
        break;
      case 'category':
        if (!value) {
          newErrors.category = 'Categoria é obrigatória';
        } else {
          delete newErrors.category;
        }
        break;
    }
    
    setErrors(newErrors);
  }, [errors]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  }, [validateField]);

  const handleSave = useCallback(async () => {
    // Validação final
    validateField('title', formData.title);
    validateField('amount', formData.amount);
    validateField('category', formData.category);

    if (Object.keys(errors).length > 0 || Object.values(errors).some(err => !!err)) return;

    setIsSubmitting(true);

    try {
      const transactionData: Partial<Transaction> = {
        ...transaction,
        title: formData.title.trim(),
        amount: parseFloat(formData.amount),
        category: formData.category,
        type,
        isRecurring: formData.isRecurring,
        recurrenceFrequency: formData.isRecurring ? formData.recurrenceFrequency as any : undefined,
        recurringDay: formData.isRecurring ? 1 : undefined,
        recurringWeekday: formData.isRecurring ? 1 : undefined,
        date: transaction?.date || new Date()
      };

      await onSave(transactionData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, errors, transaction, type, onSave, onClose, validateField]);

  const handleDelete = useCallback(async () => {
    if (transaction?.id && onDelete) {
      setIsSubmitting(true);
      try {
        await onDelete(transaction.id);
        onClose();
      } catch (error) {
        console.error('Erro ao excluir transação:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [transaction, onDelete, onClose]);

  // Fechar com Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasErrors = Object.keys(errors).length > 0 || Object.values(errors).some(err => !!err);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transaction-modal">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-md transition-opacity duration-300 transaction-modal-backdrop"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl transform transition-all duration-300 scale-100 max-h-[90vh] overflow-hidden transaction-modal-content">
        {/* Header Gradient */}
        <div className={`px-6 py-5 ${
          isIncome 
            ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600' 
            : 'bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600'
        } relative overflow-hidden`}>
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/20" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEditing ? 'Editar' : 'Nova'} {isIncome ? 'Entrada' : 'Saída'}
                </h2>
                <p className="text-white/80 text-sm font-medium">
                  {isIncome ? 'Receita financeira' : 'Despesa ou gasto'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 disabled:opacity-50"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)] transaction-modal-scroll">
          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-600" />
              Descrição
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={`Ex: ${isIncome ? 'Salário, Freelance' : 'Aluguel, Supermercado'}`}
              className={`w-full px-4 py-3.5 border-2 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200 outline-none font-medium ${
                errors.title 
                  ? 'border-red-300 focus:border-red-500 bg-red-50 input-error-shake' 
                  : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              Valor
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-lg">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0,00"
                className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200 outline-none font-bold text-lg ${
                  errors.amount 
                    ? 'border-red-300 focus:border-red-500 bg-red-50 input-error-shake' 
                    : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.amount && (
              <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              Categoria
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-4 py-3.5 border-2 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200 outline-none font-medium ${
                errors.category 
                  ? 'border-red-300 focus:border-red-500 bg-red-50 input-error-shake' 
                  : 'border-gray-200 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/10'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-xs font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-red-500 rounded-full" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Recorrência */}
          <div className="space-y-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Repeat className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-gray-700">Transação Recorrente</span>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <label htmlFor="recurring" className="text-sm text-gray-600 font-medium">
                Repetir esta transação automaticamente
              </label>
            </div>

            {formData.isRecurring && (
              <select
                value={formData.recurrenceFrequency}
                onChange={(e) => handleInputChange('recurrenceFrequency', e.target.value)}
                className="w-full px-3 py-2 border border-blue-200 rounded-lg bg-white text-sm font-medium focus:border-blue-500 outline-none"
                disabled={isSubmitting}
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <div className="flex gap-3">
            {isEditing && onDelete && (
              <button
                onClick={handleDelete}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-3.5 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSubmitting ? 'button-loading' : ''
                }`}
              >
                <Trash2 className="h-4 w-4" />
                {isSubmitting ? 'Excluindo...' : 'Excluir'}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={hasErrors || isSubmitting}
              className={`flex-1 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
                isIncome
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
              } text-white ${
                isSubmitting ? 'button-loading' : ''
              }`}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Salvando...' : `Salvar ${isIncome ? 'Entrada' : 'Saída'}`}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
