import React, { useState, useCallback, useEffect } from 'react';
import { X, DollarSign, Tag, Calendar, Repeat, Save, Trash2, ArrowRight, ChevronDown, Search } from 'lucide-react';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/types';
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
    recurrenceFrequency: 'monthly',
    recurringDay: 1,
    recurringWeekday: 1
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');

  const isEditing = !!transaction;
  const isIncome = type === 'income';

  // Filtrar categorias com base no tipo e busca
  const availableCategories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const filteredCategories = availableCategories.filter((category: string) =>
    category.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.category-dropdown')) {
        setIsCategoryDropdownOpen(false);
        setCategorySearchTerm('');
      }
    };

    if (isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);

  // Atualizar formData quando transaction mudar
  useEffect(() => {
    if (transaction) {
      setFormData({
        title: transaction.title || '',
        amount: transaction.amount?.toString() || '',
        category: transaction.category || '',
        isRecurring: transaction.isRecurring || false,
        recurrenceFrequency: transaction.recurrenceFrequency || 'monthly',
        recurringDay: transaction.recurringDay || 1,
        recurringWeekday: transaction.recurringWeekday || 1
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: '',
        isRecurring: false,
        recurrenceFrequency: 'monthly',
        recurringDay: 1,
        recurringWeekday: 1
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
        className="absolute inset-0 backdrop-blur-md transition-opacity duration-300 transaction-modal-backdrop"
        style={{ background: 'rgba(49, 81, 139, 0.8)' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-sm rounded-3xl shadow-2xl transform transition-all duration-300 scale-100 max-h-[85vh] overflow-hidden transaction-modal-content"
        style={{
          background: 'rgba(49, 81, 139, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* Header */}
        <div 
          className="px-5 py-4 border-b relative overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isEditing ? 'Editar' : 'Nova'} {isIncome ? 'Entrada' : 'Saída'}
                </h2>
                <p className="text-white/70 text-sm font-medium">
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
        <div 
          className="p-5 space-y-4 overflow-y-auto max-h-[calc(85vh-180px)] transaction-modal-scroll"
          style={{ background: 'rgba(49, 81, 139, 0.95)' }}
        >
          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-white/80" />
              Descrição
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={`Ex: ${isIncome ? 'Salário, Freelance' : 'Aluguel, Supermercado'}`}
              className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-200 outline-none font-medium text-white placeholder-white/50 ${
                errors.title 
                  ? 'border-red-400 focus:border-red-300 input-error-shake' 
                  : 'border-white/20 focus:border-white/40 focus:shadow-lg focus:shadow-white/10'
              }`}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="text-red-300 text-xs font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-red-300 rounded-full" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-white/80" />
              Valor
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 font-bold text-lg">
                R$
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="0,00"
                className={`w-full pl-12 pr-4 py-3.5 border-2 rounded-xl transition-all duration-200 outline-none font-bold text-lg text-white placeholder-white/50 ${
                  errors.amount 
                    ? 'border-red-400 focus:border-red-300 input-error-shake' 
                    : 'border-white/20 focus:border-white/40 focus:shadow-lg focus:shadow-white/10'
                }`}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
                disabled={isSubmitting}
              />
            </div>
            {errors.amount && (
              <p className="text-red-300 text-xs font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-red-300 rounded-full" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-2 relative category-dropdown">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <Tag className="h-4 w-4 text-white/80" />
              Categoria
            </label>
            
            {/* Dropdown customizado */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                className={`w-full px-4 py-3.5 border-2 rounded-xl transition-all duration-200 outline-none font-medium text-white flex items-center justify-between ${
                  errors.category 
                    ? 'border-red-400 focus:border-red-300 input-error-shake' 
                    : 'border-white/20 focus:border-white/40 focus:shadow-lg focus:shadow-white/10'
                }`}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)'
                }}
                disabled={isSubmitting}
              >
                <span className={formData.category ? 'text-white' : 'text-white/50'}>
                  {formData.category || 'Selecione uma categoria'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform text-white/70 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isCategoryDropdownOpen && (
                <div 
                  className="absolute top-full left-0 right-0 mt-1 border rounded-xl shadow-lg z-50 max-h-60 overflow-hidden"
                  style={{
                    background: 'rgba(49, 81, 139, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {/* Campo de busca */}
                  <div className="p-3 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                      <input
                        type="text"
                        placeholder="Buscar categoria..."
                        value={categorySearchTerm}
                        onChange={(e) => setCategorySearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:border-white/40 outline-none text-white placeholder-white/50"
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          backdropFilter: 'blur(10px)',
                          borderColor: 'rgba(255, 255, 255, 0.2)'
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Lista de categorias */}
                  <div className="max-h-40 overflow-y-auto">
                    {filteredCategories.length > 0 ? (
                      filteredCategories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            handleInputChange('category', category);
                            setIsCategoryDropdownOpen(false);
                            setCategorySearchTerm('');
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/10 transition-colors ${
                            formData.category === category ? 'bg-white/20 text-white font-medium' : 'text-white/90'
                          }`}
                        >
                          {category}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-white/60 text-center">
                        Nenhuma categoria encontrada
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {errors.category && (
              <p className="text-red-300 text-xs font-medium flex items-center gap-1">
                <span className="w-1 h-1 bg-red-300 rounded-full" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Recorrência */}
          <div 
            className="space-y-3 p-4 rounded-xl border"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Repeat className="h-4 w-4 text-white" />
              </div>
              <span className="font-semibold text-white">Transação Recorrente</span>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.isRecurring}
                onChange={(e) => handleInputChange('isRecurring', e.target.checked)}
                className="w-4 h-4 text-blue-400 rounded focus:ring-blue-300 bg-white/20 border-white/30"
                disabled={isSubmitting}
              />
              <label htmlFor="recurring" className="text-sm text-white/90 font-medium">
                Repetir esta transação automaticamente
              </label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-3 mt-3">
                <div>
                  <label className="text-xs font-medium text-white/80 mb-1 block">
                    Frequência de Repetição
                  </label>
                  <select
                    value={formData.recurrenceFrequency}
                    onChange={(e) => handleInputChange('recurrenceFrequency', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm font-medium focus:border-white/40 outline-none text-white"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      borderColor: 'rgba(255, 255, 255, 0.2)'
                    }}
                    disabled={isSubmitting}
                  >
                    <option value="weekly" style={{ background: '#31518b', color: 'white' }}>Semanal</option>
                    <option value="monthly" style={{ background: '#31518b', color: 'white' }}>Mensal</option>
                    <option value="yearly" style={{ background: '#31518b', color: 'white' }}>Anual</option>
                  </select>
                </div>

                {formData.recurrenceFrequency === 'weekly' && (
                  <div>
                    <label className="text-xs font-medium text-white/80 mb-1 block">
                      Dia da Semana
                    </label>
                    <select
                      value={formData.recurringWeekday}
                      onChange={(e) => handleInputChange('recurringWeekday', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-sm font-medium focus:border-white/40 outline-none text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      }}
                      disabled={isSubmitting}
                    >
                      <option value={0} style={{ background: '#31518b', color: 'white' }}>Domingo</option>
                      <option value={1} style={{ background: '#31518b', color: 'white' }}>Segunda-feira</option>
                      <option value={2} style={{ background: '#31518b', color: 'white' }}>Terça-feira</option>
                      <option value={3} style={{ background: '#31518b', color: 'white' }}>Quarta-feira</option>
                      <option value={4} style={{ background: '#31518b', color: 'white' }}>Quinta-feira</option>
                      <option value={5} style={{ background: '#31518b', color: 'white' }}>Sexta-feira</option>
                      <option value={6} style={{ background: '#31518b', color: 'white' }}>Sábado</option>
                    </select>
                  </div>
                )}

                {(formData.recurrenceFrequency === 'monthly' || formData.recurrenceFrequency === 'yearly') && (
                  <div>
                    <label className="text-xs font-medium text-white/80 mb-1 block">
                      Dia do Mês
                    </label>
                    <select
                      value={formData.recurringDay}
                      onChange={(e) => handleInputChange('recurringDay', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border rounded-lg text-sm font-medium focus:border-white/40 outline-none text-white"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderColor: 'rgba(255, 255, 255, 0.2)'
                      }}
                      disabled={isSubmitting}
                    >
                      {Array.from({ length: 31 }, (_, i) => (
                        <option key={i + 1} value={i + 1} style={{ background: '#31518b', color: 'white' }}>
                          Dia {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div 
                  className="text-xs text-white/90 p-2 rounded-lg"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  💡 <strong>Transações recorrentes</strong> serão processadas automaticamente e aparecerão na página de Contas.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-5 border-t"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255, 255, 255, 0.1)'
          }}
        >
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
