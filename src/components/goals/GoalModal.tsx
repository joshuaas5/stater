import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, DollarSign, Palette, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FinancialGoal, 
  CreateGoalData, 
  GOAL_ICONS, 
  GOAL_CATEGORIES, 
  GOAL_COLORS 
} from '@/hooks/useGoals';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateGoalData) => Promise<boolean>;
  editGoal?: FinancialGoal | null;
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editGoal,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateGoalData>({
    title: '',
    description: '',
    target_amount: 0,
    current_amount: 0,
    deadline: '',
    category: 'other',
    color: 'from-blue-400 to-blue-600',
    icon: '🎯',
  });
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Preencher form quando editando
  useEffect(() => {
    if (editGoal) {
      setFormData({
        title: editGoal.title,
        description: editGoal.description || '',
        target_amount: editGoal.target_amount,
        current_amount: editGoal.current_amount,
        deadline: editGoal.deadline.split('T')[0],
        category: editGoal.category,
        color: editGoal.color,
        icon: editGoal.icon,
      });
    } else {
      // Reset para nova meta
      const tomorrow = new Date();
      tomorrow.setMonth(tomorrow.getMonth() + 6);
      setFormData({
        title: '',
        description: '',
        target_amount: 0,
        current_amount: 0,
        deadline: tomorrow.toISOString().split('T')[0],
        category: 'other',
        color: 'from-blue-400 to-blue-600',
        icon: '🎯',
      });
    }
  }, [editGoal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Digite um nome para a meta');
      return;
    }
    
    if (formData.target_amount <= 0) {
      alert('O valor da meta deve ser maior que zero');
      return;
    }

    setLoading(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: typeof formData.category) => {
    const categoryInfo = GOAL_CATEGORIES.find(c => c.value === category);
    setFormData(prev => ({
      ...prev,
      category,
      color: categoryInfo?.color || prev.color,
    }));
  };

  const formatCurrencyInput = (value: string): number => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, '');
    return parseInt(numbers) / 100 || 0;
  };

  const displayCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 overflow-y-auto">
        <div 
          className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-teal-600 to-cyan-600 p-6 rounded-t-3xl">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {editGoal ? 'Editar Meta' : 'Nova Meta Financeira'}
                </h2>
                <p className="text-white/70 text-sm">
                  {editGoal ? 'Atualize os dados da sua meta' : 'Defina um objetivo e comece a poupar'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Ícone e Título */}
            <div className="flex gap-3">
              {/* Seletor de Ícone */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowIconPicker(!showIconPicker)}
                  className="w-14 h-14 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl hover:bg-white/20 transition-colors"
                >
                  {formData.icon}
                </button>
                
                {showIconPicker && (
                  <div className="absolute top-full left-0 mt-2 p-3 bg-slate-800 rounded-xl border border-white/20 shadow-xl z-20 grid grid-cols-4 gap-2 w-48">
                    {GOAL_ICONS.map(icon => (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, icon: icon.value }));
                          setShowIconPicker(false);
                        }}
                        className={`p-2 text-2xl rounded-lg hover:bg-white/20 transition-colors ${
                          formData.icon === icon.value ? 'bg-white/20 ring-2 ring-teal-500' : ''
                        }`}
                        title={icon.label}
                      >
                        {icon.value}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Nome da Meta */}
              <div className="flex-1">
                <Label className="text-white/70 text-sm">Nome da Meta *</Label>
                <Input
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Viagem para Europa"
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-teal-500"
                  maxLength={50}
                />
              </div>
            </div>

            {/* Descrição */}
            <div>
              <Label className="text-white/70 text-sm">Descrição (opcional)</Label>
              <Input
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Por que essa meta é importante?"
                className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-teal-500"
                maxLength={100}
              />
            </div>

            {/* Categoria */}
            <div>
              <Label className="text-white/70 text-sm">Categoria</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {GOAL_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => handleCategoryChange(cat.value as typeof formData.category)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      formData.category === cat.value 
                        ? 'bg-gradient-to-r ' + cat.color + ' text-white shadow-lg scale-105'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <span className="text-sm font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Valores */}
            <div className="grid grid-cols-2 gap-4">
              {/* Valor Alvo */}
              <div>
                <Label className="text-white/70 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Valor da Meta *
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formData.target_amount > 0 ? displayCurrency(formData.target_amount) : ''}
                  onChange={e => setFormData(prev => ({ 
                    ...prev, 
                    target_amount: formatCurrencyInput(e.target.value) 
                  }))}
                  placeholder="R$ 0,00"
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-teal-500 text-lg font-semibold"
                />
              </div>

              {/* Valor Atual */}
              <div>
                <Label className="text-white/70 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Já Guardado
                </Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formData.current_amount && formData.current_amount > 0 ? displayCurrency(formData.current_amount) : ''}
                  onChange={e => setFormData(prev => ({ 
                    ...prev, 
                    current_amount: formatCurrencyInput(e.target.value) 
                  }))}
                  placeholder="R$ 0,00"
                  className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Prazo */}
            <div>
              <Label className="text-white/70 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Prazo para Atingir
              </Label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={e => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="mt-1 bg-white/10 border-white/20 text-white focus:border-teal-500 [color-scheme:dark]"
              />
            </div>

            {/* Cor */}
            <div>
              <Label className="text-white/70 text-sm flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Cor da Meta
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {GOAL_COLORS.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full transition-all ${
                      formData.color === color.value 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110'
                        : 'hover:scale-110'
                    }`}
                    style={{ background: color.hex }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            {formData.title && formData.target_amount > 0 && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-white/50 text-xs mb-2">Preview da Meta:</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{formData.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">{formData.title}</h4>
                    <p className="text-white/60 text-sm">
                      Meta: {displayCurrency(formData.target_amount)}
                    </p>
                  </div>
                  <div 
                    className="w-3 h-12 rounded-full"
                    style={{ 
                      background: `linear-gradient(to bottom, ${
                        GOAL_COLORS.find(c => c.value === formData.color)?.hex || '#3b82f6'
                      }, ${
                        GOAL_COLORS.find(c => c.value === formData.color)?.hex || '#3b82f6'
                      }88)`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.title.trim() || formData.target_amount <= 0}
                className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    {editGoal ? 'Salvar Alterações' : 'Criar Meta'}
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default GoalModal;
