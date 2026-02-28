import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface FinancialGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  category: 'emergency' | 'investment' | 'purchase' | 'vacation' | 'debt' | 'education' | 'retirement' | 'other';
  color: string;
  icon: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalData {
  title: string;
  description?: string;
  target_amount: number;
  current_amount?: number;
  deadline: string;
  category: FinancialGoal['category'];
  color: string;
  icon: string;
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  is_completed?: boolean;
}

// Ícones disponíveis para metas
export const GOAL_ICONS = [
  { value: '🎯', label: 'Alvo' },
  { value: '💰', label: 'Dinheiro' },
  { value: '🏠', label: 'Casa' },
  { value: '🚗', label: 'Carro' },
  { value: '✈️', label: 'Viagem' },
  { value: '📚', label: 'Educação' },
  { value: '💻', label: 'Tecnologia' },
  { value: '🚨', label: 'Emergência' },
  { value: '📈', label: 'Investimento' },
  { value: '💳', label: 'Dívida' },
  { value: '👶', label: 'Família' },
  { value: '💍', label: 'Casamento' },
  { value: '🏋️', label: 'Saúde' },
  { value: '🎮', label: 'Lazer' },
  { value: '👔', label: 'Trabalho' },
  { value: '🎁', label: 'Presente' },
];

// Categorias de metas
export const GOAL_CATEGORIES = [
  { value: 'emergency', label: 'Reserva de Emergência', color: 'from-red-400 to-red-600' },
  { value: 'investment', label: 'Investimento', color: 'from-green-400 to-green-600' },
  { value: 'purchase', label: 'Compra', color: 'from-blue-400 to-blue-600' },
  { value: 'vacation', label: 'Viagem', color: 'from-purple-400 to-purple-600' },
  { value: 'debt', label: 'Quitar Dívida', color: 'from-orange-400 to-orange-600' },
  { value: 'education', label: 'Educação', color: 'from-cyan-400 to-cyan-600' },
  { value: 'retirement', label: 'Aposentadoria', color: 'from-amber-400 to-amber-600' },
  { value: 'other', label: 'Outro', color: 'from-gray-400 to-gray-600' },
] as const;

// Cores disponíveis para metas
export const GOAL_COLORS = [
  { value: 'from-red-400 to-red-600', label: 'Vermelho', hex: '#ef4444' },
  { value: 'from-orange-400 to-orange-600', label: 'Laranja', hex: '#f97316' },
  { value: 'from-amber-400 to-amber-600', label: 'Âmbar', hex: '#f59e0b' },
  { value: 'from-yellow-400 to-yellow-600', label: 'Amarelo', hex: '#eab308' },
  { value: 'from-lime-400 to-lime-600', label: 'Lima', hex: '#84cc16' },
  { value: 'from-green-400 to-green-600', label: 'Verde', hex: '#22c55e' },
  { value: 'from-emerald-400 to-emerald-600', label: 'Esmeralda', hex: '#10b981' },
  { value: 'from-teal-400 to-teal-600', label: 'Teal', hex: '#14b8a6' },
  { value: 'from-cyan-400 to-cyan-600', label: 'Ciano', hex: '#06b6d4' },
  { value: 'from-blue-400 to-blue-600', label: 'Azul', hex: '#3b82f6' },
  { value: 'from-indigo-400 to-indigo-600', label: 'Índigo', hex: '#6366f1' },
  { value: 'from-violet-400 to-violet-600', label: 'Violeta', hex: '#8b5cf6' },
  { value: 'from-purple-400 to-purple-600', label: 'Roxo', hex: '#a855f7' },
  { value: 'from-fuchsia-400 to-fuchsia-600', label: 'Fúcsia', hex: '#d946ef' },
  { value: 'from-pink-400 to-pink-600', label: 'Rosa', hex: '#ec4899' },
  { value: 'from-rose-400 to-rose-600', label: 'Rosé', hex: '#f43f5e' },
];

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar metas do usuário
  const loadGoals = useCallback(async () => {
    if (!user?.id) {
      setGoals([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        // Se a tabela não existe, retorna vazio
        if (fetchError.code === '42P01') {
          console.warn('Tabela financial_goals não existe ainda');
          setGoals([]);
          return;
        }
        throw fetchError;
      }

      setGoals(data || []);
    } catch (err: any) {
      console.error('Erro ao carregar metas:', err);
      setError(err.message);
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Criar nova meta
  const createGoal = async (goalData: CreateGoalData): Promise<FinancialGoal | null> => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      setError(null);

      const newGoal = {
        user_id: user.id,
        title: goalData.title,
        description: goalData.description || null,
        target_amount: goalData.target_amount,
        current_amount: goalData.current_amount || 0,
        deadline: goalData.deadline,
        category: goalData.category,
        color: goalData.color,
        icon: goalData.icon,
        is_completed: false,
      };

      const { data, error: insertError } = await supabase
        .from('financial_goals')
        .insert([newGoal])
        .select()
        .single();

      if (insertError) throw insertError;

      // Atualiza lista local
      setGoals(prev => [data, ...prev]);
      
      return data;
    } catch (err: any) {
      console.error('Erro ao criar meta:', err);
      setError(err.message);
      return null;
    }
  };

  // Atualizar meta existente
  const updateGoal = async (goalId: string, updates: UpdateGoalData): Promise<boolean> => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('financial_goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Atualiza lista local
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updates, updated_at: new Date().toISOString() } : goal
      ));

      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar meta:', err);
      setError(err.message);
      return false;
    }
  };

  // Adicionar valor à meta
  const addToGoal = async (goalId: string, amount: number): Promise<boolean> => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return false;

    const newAmount = goal.current_amount + amount;
    const isCompleted = newAmount >= goal.target_amount;

    return updateGoal(goalId, { 
      current_amount: newAmount,
      is_completed: isCompleted 
    });
  };

  // Deletar meta
  const deleteGoal = async (goalId: string): Promise<boolean> => {
    if (!user?.id) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      // Remove da lista local
      setGoals(prev => prev.filter(goal => goal.id !== goalId));

      return true;
    } catch (err: any) {
      console.error('Erro ao deletar meta:', err);
      setError(err.message);
      return false;
    }
  };

  // Calcular progresso
  const calculateProgress = (current: number, target: number): number => {
    if (target <= 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  // Calcular dias restantes
  const getDaysRemaining = (deadline: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Estatísticas gerais
  const getStats = () => {
    const totalTarget = goals.reduce((sum, g) => sum + g.target_amount, 0);
    const totalCurrent = goals.reduce((sum, g) => sum + g.current_amount, 0);
    const completedGoals = goals.filter(g => g.is_completed).length;
    const avgProgress = goals.length > 0 
      ? goals.reduce((sum, g) => sum + calculateProgress(g.current_amount, g.target_amount), 0) / goals.length
      : 0;

    return {
      totalGoals: goals.length,
      completedGoals,
      totalTarget,
      totalCurrent,
      totalRemaining: totalTarget - totalCurrent,
      avgProgress,
    };
  };

  // Carregar metas ao iniciar
  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  return {
    goals,
    loading,
    error,
    loadGoals,
    createGoal,
    updateGoal,
    addToGoal,
    deleteGoal,
    calculateProgress,
    getDaysRemaining,
    getStats,
  };
}
