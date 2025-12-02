import React, { useState } from 'react';
import { X, Plus, Minus, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FinancialGoal } from '@/hooks/useGoals';

interface AddToGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: FinancialGoal | null;
  onAdd: (goalId: string, amount: number) => Promise<boolean>;
}

export const AddToGoalModal: React.FC<AddToGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
  onAdd,
}) => {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(0);
  const [isSubtract, setIsSubtract] = useState(false);

  const formatCurrencyInput = (value: string): number => {
    const numbers = value.replace(/\D/g, '');
    return parseInt(numbers) / 100 || 0;
  };

  const displayCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!goal || amount <= 0) return;

    const finalAmount = isSubtract ? -amount : amount;
    
    // Não permitir valor negativo final
    if (goal.current_amount + finalAmount < 0) {
      alert('O valor guardado não pode ficar negativo');
      return;
    }

    setLoading(true);
    try {
      const success = await onAdd(goal.id, finalAmount);
      if (success) {
        setAmount(0);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [50, 100, 200, 500, 1000];

  if (!isOpen || !goal) return null;

  const currentProgress = (goal.current_amount / goal.target_amount) * 100;
  const newAmount = goal.current_amount + (isSubtract ? -amount : amount);
  const newProgress = Math.min((newAmount / goal.target_amount) * 100, 100);
  const willComplete = newAmount >= goal.target_amount;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-4xl">{goal.icon}</span>
              <div>
                <h2 className="text-xl font-bold text-white">{goal.title}</h2>
                <p className="text-white/70 text-sm">
                  {displayCurrency(goal.current_amount)} de {displayCurrency(goal.target_amount)}
                </p>
              </div>
            </div>

            {/* Barra de progresso atual */}
            <div className="mt-4">
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white/80 rounded-full transition-all duration-500"
                  style={{ width: `${currentProgress}%` }}
                />
              </div>
              <p className="text-white/70 text-xs mt-1 text-right">
                {currentProgress.toFixed(1)}% concluído
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Toggle Adicionar/Remover */}
            <div className="flex bg-white/10 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setIsSubtract(false)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  !isSubtract 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
              <button
                type="button"
                onClick={() => setIsSubtract(true)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  isSubtract 
                    ? 'bg-red-500 text-white' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Minus className="w-4 h-4" />
                Remover
              </button>
            </div>

            {/* Valor */}
            <div>
              <Label className="text-white/70 text-sm">
                Valor para {isSubtract ? 'remover' : 'adicionar'}
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                value={amount > 0 ? displayCurrency(amount) : ''}
                onChange={e => setAmount(formatCurrencyInput(e.target.value))}
                placeholder="R$ 0,00"
                className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 text-2xl font-bold text-center h-16"
                autoFocus
              />
            </div>

            {/* Valores rápidos */}
            <div className="grid grid-cols-5 gap-2">
              {quickAmounts.map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    amount === val 
                      ? 'bg-teal-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {val >= 1000 ? `${val/1000}k` : val}
                </button>
              ))}
            </div>

            {/* Preview do resultado */}
            {amount > 0 && (
              <div className={`p-4 rounded-xl border ${
                willComplete 
                  ? 'bg-emerald-500/20 border-emerald-500/40'
                  : 'bg-white/5 border-white/10'
              }`}>
                {willComplete && (
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-semibold">🎉 Meta será concluída!</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/60">Após {isSubtract ? 'remoção' : 'adição'}:</span>
                  <span className={`font-semibold ${isSubtract ? 'text-red-400' : 'text-emerald-400'}`}>
                    {displayCurrency(Math.max(0, newAmount))}
                  </span>
                </div>

                {/* Nova barra de progresso */}
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      willComplete ? 'bg-emerald-400' : 'bg-teal-400'
                    }`}
                    style={{ width: `${newProgress}%` }}
                  />
                </div>
                <p className="text-white/60 text-xs mt-1 text-right">
                  {newProgress.toFixed(1)}% {willComplete ? '✓' : ''}
                </p>

                {!willComplete && !isSubtract && (
                  <div className="mt-3 flex items-center gap-2 text-white/60 text-xs">
                    <TrendingUp className="w-4 h-4" />
                    <span>
                      Faltarão {displayCurrency(goal.target_amount - newAmount)} para completar
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-2">
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
                disabled={loading || amount <= 0}
                className={`flex-1 border-0 ${
                  isSubtract 
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                } text-white`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Salvando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isSubtract ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isSubtract ? 'Remover' : 'Adicionar'} {displayCurrency(amount)}
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

export default AddToGoalModal;
