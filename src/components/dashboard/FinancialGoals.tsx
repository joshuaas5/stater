import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { getTransactions } from '@/utils/localStorage';

interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'emergency' | 'investment' | 'purchase' | 'vacation' | 'other';
  color: string;
  icon: string;
}

const FinancialGoals: React.FC = () => {
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    // Metas padrão baseadas na análise financeira do usuário
    const transactions = getTransactions();
    const monthlyIncome = calculateMonthlyIncome(transactions);
    
    const defaultGoals: FinancialGoal[] = [
      {
        id: '1',
        title: 'Reserva de Emergência',
        targetAmount: monthlyIncome * 6, // 6 meses de renda
        currentAmount: monthlyIncome * 2.3, // Simulando progresso
        deadline: '2024-12-31',
        category: 'emergency',
        color: 'from-red-400 to-red-600',
        icon: '🚨'
      },
      {
        id: '2',
        title: 'Investimento em Ações',
        targetAmount: 10000,
        currentAmount: 3500,
        deadline: '2024-06-30',
        category: 'investment',
        color: 'from-green-400 to-green-600',
        icon: '📈'
      },
      {
        id: '3',
        title: 'Notebook Novo',
        targetAmount: 4500,
        currentAmount: 1200,
        deadline: '2024-03-15',
        category: 'purchase',
        color: 'from-blue-400 to-blue-600',
        icon: '💻'
      },
      {
        id: '4',
        title: 'Viagem Europa',
        targetAmount: 15000,
        currentAmount: 2800,
        deadline: '2024-07-01',
        category: 'vacation',
        color: 'from-purple-400 to-purple-600',
        icon: '✈️'
      }
    ];

    setGoals(defaultGoals);
  }, []);

  const calculateMonthlyIncome = (transactions: any[]) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear &&
               t.type === 'income';
      })
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'text-green-400';
    if (progress >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
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
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Meta
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          const daysRemaining = getDaysRemaining(goal.deadline);
          const isOverdue = daysRemaining < 0;
          
          return (
            <div
              key={goal.id}
              className="p-5 rounded-xl bg-gradient-to-r backdrop-blur-sm transition-all duration-300 hover:scale-105 border border-white/20"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))'
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{goal.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold text-lg">{goal.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {isOverdue ? (
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
                <div className="text-right">
                  <p className={`text-2xl font-bold ${getProgressColor(progress)}`}>
                    {progress.toFixed(0)}%
                  </p>
                  <p className="text-xs text-white/60">concluído</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/80">
                    {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                  </span>
                  <span className="text-white/80">
                    Falta: {formatCurrency(goal.targetAmount - goal.currentAmount)}
                  </span>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={progress} 
                    className="h-3 bg-white/20"
                  />
                  <div 
                    className="absolute top-0 left-0 h-3 rounded-full bg-gradient-to-r transition-all duration-500"
                    style={{ 
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, ${goal.color.split(' ')[0].replace('from-', '')}, ${goal.color.split(' ')[2].replace('to-', '')})`
                    }}
                  />
                </div>

                {/* Sugestão de valor mensal para atingir a meta */}
                {daysRemaining > 0 && (
                  <div className="mt-3 p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-teal-400" />
                      <span className="text-white/80">
                        Para atingir a meta: {formatCurrency((goal.targetAmount - goal.currentAmount) / Math.ceil(daysRemaining / 30))} por mês
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Resumo das metas */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl border border-white/20">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Resumo das Metas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <p className="text-white/60">Total Planejado</p>
              <p className="text-white font-semibold text-lg">
                {formatCurrency(goals.reduce((sum, goal) => sum + goal.targetAmount, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60">Total Economizado</p>
              <p className="text-white font-semibold text-lg">
                {formatCurrency(goals.reduce((sum, goal) => sum + goal.currentAmount, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-white/60">Progresso Médio</p>
              <p className="text-white font-semibold text-lg">
                {(goals.reduce((sum, goal) => sum + calculateProgress(goal.currentAmount, goal.targetAmount), 0) / goals.length).toFixed(0)}%
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialGoals;
