import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Target, Plus, TrendingUp, Calendar, DollarSign, 
  MoreVertical, Edit, Trash2, PlusCircle, CheckCircle2,
  Sparkles, AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useGoals, FinancialGoal, CreateGoalData, GOAL_COLORS } from '@/hooks/useGoals';
import GoalModal from '@/components/goals/GoalModal';
import AddToGoalModal from '@/components/goals/AddToGoalModal';

const FinancialGoals: React.FC = () => {
  const { 
    goals, 
    loading, 
    error,
    createGoal, 
    updateGoal, 
    addToGoal, 
    deleteGoal,
    calculateProgress,
    getDaysRemaining,
    getStats,
  } = useGoals();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<FinancialGoal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<FinancialGoal | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getGoalGradient = (colorString: string) => {
    if (!colorString || typeof colorString !== 'string') {
      return 'linear-gradient(90deg, #3b82f6, #1d4ed8)';
    }
    
    const colorInfo = GOAL_COLORS.find(c => c.value === colorString);
    if (colorInfo) {
      return `linear-gradient(90deg, ${colorInfo.hex}, ${colorInfo.hex}dd)`;
    }
    
    // Fallback para cores antigas
    const colorMap: { [key: string]: string } = {
      'from-red-400 to-red-600': '#ef4444',
      'from-orange-400 to-orange-600': '#f97316',
      'from-amber-400 to-amber-600': '#f59e0b',
      'from-yellow-400 to-yellow-600': '#eab308',
      'from-lime-400 to-lime-600': '#84cc16',
      'from-green-400 to-green-600': '#22c55e',
      'from-emerald-400 to-emerald-600': '#10b981',
      'from-teal-400 to-teal-600': '#14b8a6',
      'from-cyan-400 to-cyan-600': '#06b6d4',
      'from-blue-400 to-blue-600': '#3b82f6',
      'from-indigo-400 to-indigo-600': '#6366f1',
      'from-violet-400 to-violet-600': '#8b5cf6',
      'from-purple-400 to-purple-600': '#a855f7',
      'from-fuchsia-400 to-fuchsia-600': '#d946ef',
      'from-pink-400 to-pink-600': '#ec4899',
      'from-rose-400 to-rose-600': '#f43f5e',
    };
    
    const hex = colorMap[colorString] || '#3b82f6';
    return `linear-gradient(90deg, ${hex}, ${hex}dd)`;
  };

  const handleCreateGoal = async (data: CreateGoalData): Promise<boolean> => {
    const result = await createGoal(data);
    return result !== null;
  };

  const handleUpdateGoal = async (data: CreateGoalData): Promise<boolean> => {
    if (!editingGoal) return false;
    return await updateGoal(editingGoal.id, data);
  };

  const handleDeleteGoal = async (goal: FinancialGoal) => {
    if (confirm(`Tem certeza que deseja excluir a meta "${goal.title}"?`)) {
      await deleteGoal(goal.id);
    }
  };

  const handleAddToGoal = async (goalId: string, amount: number): Promise<boolean> => {
    return await addToGoal(goalId, amount);
  };

  const openEditModal = (goal: FinancialGoal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const openAddModal = (goal: FinancialGoal) => {
    setSelectedGoal(goal);
    setShowAddModal(true);
  };

  const closeGoalModal = () => {
    setShowGoalModal(false);
    setEditingGoal(null);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setSelectedGoal(null);
  };

  const stats = getStats();

  // Estado de carregamento
  if (loading) {
    return (
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br backdrop-blur-xl shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
        <CardContent className="p-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
            <p className="text-white/60">Carregando metas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br backdrop-blur-xl shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl font-semibold flex items-center gap-2">
              <Target className="w-6 h-6 text-teal-400" />
              Metas Financeiras
            </CardTitle>
            <Button
              onClick={() => setShowGoalModal(true)}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Mensagem de erro */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Estado vazio */}
          {goals.length === 0 && !error && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
                <Target className="w-10 h-10 text-teal-400" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-2">
                Nenhuma meta criada
              </h3>
              <p className="text-white/60 mb-6 max-w-sm mx-auto">
                Defina metas financeiras para acompanhar seu progresso e alcançar seus objetivos!
              </p>
              <Button
                onClick={() => setShowGoalModal(true)}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeira Meta
              </Button>
            </div>
          )}

          {/* Lista de metas */}
          {goals.map((goal) => {
            const progress = calculateProgress(goal.current_amount, goal.target_amount);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isOverdue = daysRemaining < 0;
            const isCompleted = goal.is_completed || progress >= 100;
            
            return (
              <div
                key={goal.id}
                className={`p-5 rounded-xl bg-gradient-to-r backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] border ${
                  isCompleted 
                    ? 'border-emerald-500/40 bg-emerald-500/10' 
                    : 'border-white/20'
                }`}
                style={{
                  background: isCompleted 
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-semibold text-lg">{goal.title}</h3>
                        {isCompleted && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      {goal.description && (
                        <p className="text-white/50 text-sm">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {isCompleted ? (
                            <span className="text-emerald-400">Concluída!</span>
                          ) : isOverdue ? (
                            <span className="text-red-400">
                              {Math.abs(daysRemaining)} dias atrasado
                            </span>
                          ) : (
                            <span>
                              {daysRemaining} dias restantes
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${isCompleted ? 'text-emerald-400' : getProgressColor(progress)}`}>
                        {progress.toFixed(0)}%
                      </p>
                      <p className="text-xs text-white/60">concluído</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-800 border-white/20">
                        <DropdownMenuItem 
                          onClick={() => openAddModal(goal)}
                          className="text-white hover:bg-white/10 cursor-pointer"
                        >
                          <PlusCircle className="w-4 h-4 mr-2 text-emerald-400" />
                          Adicionar Valor
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => openEditModal(goal)}
                          className="text-white hover:bg-white/10 cursor-pointer"
                        >
                          <Edit className="w-4 h-4 mr-2 text-blue-400" />
                          Editar Meta
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteGoal(goal)}
                          className="text-red-400 hover:bg-red-500/20 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir Meta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">
                      {formatCurrency(goal.current_amount)} de {formatCurrency(goal.target_amount)}
                    </span>
                    <span className="text-white/80">
                      {isCompleted ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-4 h-4" />
                          Meta alcançada!
                        </span>
                      ) : (
                        `Falta: ${formatCurrency(goal.target_amount - goal.current_amount)}`
                      )}
                    </span>
                  </div>
                  
                  <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${progress}%`,
                        background: isCompleted 
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : getGoalGradient(goal.color)
                      }}
                    />
                  </div>

                  {/* Sugestão de valor mensal */}
                  {!isCompleted && daysRemaining > 0 && (
                    <div className="mt-3 p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="w-4 h-4 text-teal-400" />
                        <span className="text-white/80">
                          Para atingir a meta: {formatCurrency((goal.target_amount - goal.current_amount) / Math.ceil(daysRemaining / 30))} por mês
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Botão rápido de adicionar */}
                  {!isCompleted && (
                    <Button
                      onClick={() => openAddModal(goal)}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Valor
                    </Button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Resumo das metas */}
          {goals.length > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/20">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Resumo das Metas
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-white/60">Total de Metas</p>
                  <p className="text-white font-semibold text-lg">{stats.totalGoals}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60">Concluídas</p>
                  <p className="text-emerald-400 font-semibold text-lg">{stats.completedGoals}</p>
                </div>
                <div className="text-center">
                  <p className="text-white/60">Total Economizado</p>
                  <p className="text-white font-semibold text-lg">
                    {formatCurrency(stats.totalCurrent)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-white/60">Progresso Médio</p>
                  <p className="text-white font-semibold text-lg">
                    {stats.avgProgress.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de criar/editar meta */}
      <GoalModal
        isOpen={showGoalModal}
        onClose={closeGoalModal}
        onSave={editingGoal ? handleUpdateGoal : handleCreateGoal}
        editGoal={editingGoal}
      />

      {/* Modal de adicionar valor */}
      <AddToGoalModal
        isOpen={showAddModal}
        onClose={closeAddModal}
        goal={selectedGoal}
        onAdd={handleAddToGoal}
      />
    </>
  );
};

export default FinancialGoals;
