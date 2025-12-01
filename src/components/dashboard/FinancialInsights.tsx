import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertTriangle, Target, Sparkles, Brain, Zap, RefreshCw } from 'lucide-react';
import { getTransactions, getBills } from '@/utils/localStorage';
import { Transaction, Bill } from '@/types';

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  description: string;
  action?: string;
  icon: React.ReactNode;
  priority: number;
}

const FinancialInsights: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const transactions: Transaction[] = getTransactions();
      const bills: Bill[] = getBills(false);
      const generatedInsights: Insight[] = [];

      // Análise de gastos por categoria
      const categoryExpenses: { [key: string]: number } = {};
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const monthlyTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const monthlyIncome = monthlyTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = monthlyTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const category = t.category || 'Outros';
          categoryExpenses[category] = (categoryExpenses[category] || 0) + t.amount;
        });

      // Insight 1: Maior categoria de gastos
      const topCategory = Object.entries(categoryExpenses)
        .sort(([,a], [,b]) => b - a)[0];

      if (topCategory) {
        generatedInsights.push({
          id: '1',
          type: 'info',
          title: `💸 Maior Gasto: ${topCategory[0]}`,
          description: `Você gastou R$ ${topCategory[1].toFixed(2)} em ${topCategory[0]} este mês. Representa ${((topCategory[1] / monthlyExpenses) * 100).toFixed(1)}% dos seus gastos.`,
          action: 'Revisar orçamento desta categoria',
          icon: <TrendingUp className="w-5 h-5" />,
          priority: 1
        });
      }

      // Insight 2: Taxa de poupança
      const savingsRate = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome * 100 : 0;

      if (savingsRate >= 20) {
        generatedInsights.push({
          id: '2',
          type: 'success',
          title: '🎉 Parabéns! Excelente poupança',
          description: `Você está poupando ${savingsRate.toFixed(1)}% da sua renda. Isso está acima da meta recomendada de 20%!`,
          action: 'Continue assim e considere investimentos',
          icon: <Target className="w-5 h-5" />,
          priority: 1
        });
      } else if (savingsRate < 10) {
        generatedInsights.push({
          id: '2',
          type: 'warning',
          title: '⚠️ Taxa de poupança baixa',
          description: `Você está poupando apenas ${savingsRate.toFixed(1)}% da sua renda. Recomendamos pelo menos 20%.`,
          action: 'Revisar gastos não essenciais',
          icon: <AlertTriangle className="w-5 h-5" />,
          priority: 1
        });
      }

      // Insight 3: Contas pendentes
      const unpaidBills = bills.filter(bill => !bill.isPaid);
      if (unpaidBills.length > 0) {
        const totalDebt = unpaidBills.reduce((sum, bill) => sum + bill.amount, 0);
        generatedInsights.push({
          id: '3',
          type: 'warning',
          title: `📋 ${unpaidBills.length} contas pendentes`,
          description: `Você tem R$ ${totalDebt.toFixed(2)} em contas não pagas. Organize-se para evitar juros!`,
          action: 'Priorizar pagamentos',
          icon: <AlertTriangle className="w-5 h-5" />,
          priority: 2
        });
      }

      // Insight 4: Tendência de gastos
      const lastMonthExpenses = transactions
        .filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === currentMonth - 1 &&
                 date.getFullYear() === currentYear &&
                 t.type === 'expense';
        })
        .reduce((sum, t) => sum + t.amount, 0);

      if (lastMonthExpenses > 0) {
        const expenseChange = ((monthlyExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;

        if (expenseChange > 15) {
          generatedInsights.push({
            id: '4',
            type: 'warning',
            title: '📈 Gastos em alta',
            description: `Seus gastos aumentaram ${expenseChange.toFixed(1)}% em relação ao mês passado. Fique atento!`,
            action: 'Analisar novos gastos',
            icon: <TrendingUp className="w-5 h-5" />,
            priority: 2
          });
        } else if (expenseChange < -15) {
          generatedInsights.push({
            id: '4',
            type: 'success',
            title: '📉 Redução de gastos',
            description: `Parabéns! Você reduziu seus gastos em ${Math.abs(expenseChange).toFixed(1)}% este mês.`,
            action: 'Manter o controle',
            icon: <Target className="w-5 h-5" />,
            priority: 2
          });
        }
      }

      // Insight 5: Dicas de IA personalizadas
      const aiTips = [
        {
          id: '5a',
          type: 'tip' as const,
          title: '🤖 Dica da IA: Regra 50-30-20',
          description: 'Destine 50% da renda para necessidades, 30% para desejos e 20% para poupança e investimentos.',
          action: 'Reorganizar orçamento',
          icon: <Brain className="w-5 h-5" />,
          priority: 3
        },
        {
          id: '5b',
          type: 'tip' as const,
          title: '💡 Automação financeira',
          description: 'Configure transferências automáticas para sua poupança logo após receber o salário.',
          action: 'Configurar automação',
          icon: <Zap className="w-5 h-5" />,
          priority: 3
        },
        {
          id: '5c',
          type: 'tip' as const,
          title: '📊 Revisão mensal',
          description: 'Reserve um dia por mês para revisar seus gastos e ajustar o orçamento para o próximo mês.',
          action: 'Agendar revisão',
          icon: <Sparkles className="w-5 h-5" />,
          priority: 3
        }
      ];

      // Adicionar uma dica aleatória
      const randomTip = aiTips[Math.floor(Math.random() * aiTips.length)];
      generatedInsights.push(randomTip);

      // Ordenar por prioridade
      generatedInsights.sort((a, b) => a.priority - b.priority);

      setInsights(generatedInsights);
      setIsGenerating(false);
    }, 1500);
  };

  const getInsightStyles = (type: string) => {
    switch (type) {
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          glow: 'rgba(16, 185, 129, 0.2)',
          iconBg: 'rgba(16, 185, 129, 0.3)',
          color: '#10b981'
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          glow: 'rgba(245, 158, 11, 0.2)',
          iconBg: 'rgba(245, 158, 11, 0.3)',
          color: '#f59e0b'
        };
      case 'info':
        return {
          bg: 'rgba(59, 130, 246, 0.15)',
          border: 'rgba(59, 130, 246, 0.4)',
          glow: 'rgba(59, 130, 246, 0.2)',
          iconBg: 'rgba(59, 130, 246, 0.3)',
          color: '#3b82f6'
        };
      case 'tip':
        return {
          bg: 'rgba(139, 92, 246, 0.15)',
          border: 'rgba(139, 92, 246, 0.4)',
          glow: 'rgba(139, 92, 246, 0.2)',
          iconBg: 'rgba(139, 92, 246, 0.3)',
          color: '#8b5cf6'
        };
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.1)',
          border: 'rgba(255, 255, 255, 0.2)',
          glow: 'rgba(255, 255, 255, 0.1)',
          iconBg: 'rgba(255, 255, 255, 0.2)',
          color: '#fff'
        };
    }
  };

  return (
    <div 
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}
    >
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.4), rgba(245, 158, 11, 0.2))',
              boxShadow: '0 0 20px rgba(250, 204, 21, 0.3)'
            }}
          >
            <Lightbulb className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Insights Financeiros IA
              <Sparkles className="h-4 w-4 text-purple-400" />
            </h2>
            <p className="text-xs text-white/60">Análise inteligente dos seus dados</p>
          </div>
        </div>
        
        <Button
          onClick={generateInsights}
          disabled={isGenerating}
          className="px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 transition-all duration-300 hover:scale-105 border-0"
          style={{
            background: isGenerating 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'linear-gradient(135deg, rgba(139, 92, 246, 0.5), rgba(236, 72, 153, 0.5))',
            color: '#fff',
            boxShadow: isGenerating ? 'none' : '0 4px 15px rgba(139, 92, 246, 0.3)'
          }}
        >
          <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Analisando...' : 'Atualizar'}
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.2))'
              }}
            >
              <Brain className="h-8 w-8 text-white animate-bounce" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">IA analisando seus dados</p>
              <p className="text-white/50 text-sm">Gerando insights personalizados...</p>
            </div>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => {
              const styles = getInsightStyles(insight.type);
              return (
                <div
                  key={insight.id}
                  className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
                  style={{
                    background: styles.bg,
                    border: `1px solid ${styles.border}`,
                    boxShadow: `0 4px 20px ${styles.glow}`,
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: styles.iconBg }}
                    >
                      <span style={{ color: styles.color }}>{insight.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm mb-1">
                        {insight.title}
                      </h3>
                      <p className="text-white/70 text-xs leading-relaxed mb-2">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <div 
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs"
                          style={{ 
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: styles.color
                          }}
                        >
                          <Lightbulb className="h-3 w-3" />
                          <span>{insight.action}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default FinancialInsights;
