import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, TrendingUp, AlertTriangle, Target, Sparkles, Brain, Zap } from 'lucide-react';
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
          gradient: 'from-green-400/20 to-emerald-500/20',
          border: 'border-green-400/30',
          textColor: 'text-green-100'
        };
      case 'warning':
        return {
          gradient: 'from-yellow-400/20 to-orange-500/20',
          border: 'border-yellow-400/30',
          textColor: 'text-yellow-100'
        };
      case 'info':
        return {
          gradient: 'from-blue-400/20 to-purple-500/20',
          border: 'border-blue-400/30',
          textColor: 'text-blue-100'
        };
      case 'tip':
        return {
          gradient: 'from-purple-400/20 to-pink-500/20',
          border: 'border-purple-400/30',
          textColor: 'text-purple-100'
        };
      default:
        return {
          gradient: 'from-gray-400/20 to-gray-500/20',
          border: 'border-gray-400/30',
          textColor: 'text-gray-100'
        };
    }
  };

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br backdrop-blur-xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />

      <CardHeader className="relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-xl font-semibold flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            Insights Financeiros IA
          </CardTitle>
          <Button
            onClick={generateInsights}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg"
          >
            {isGenerating ? '🤖 Analisando...' : '🔄 Atualizar'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="animate-spin w-6 h-6 border-2 border-white/30 border-t-white rounded-full"></div>
              <span className="text-white/80">IA analisando seus dados...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => {
              const styles = getInsightStyles(insight.type);
              return (
                <div
                  key={insight.id}
                  className={`p-4 rounded-xl bg-gradient-to-r ${styles.gradient} ${styles.border} border backdrop-blur-sm transition-all duration-300 hover:scale-105`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${styles.textColor} mt-1`}>
                      {insight.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${styles.textColor} mb-1`}>
                        {insight.title}
                      </h3>
                      <p className="text-white/80 text-sm mb-2">
                        {insight.description}
                      </p>
                      {insight.action && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/60">💡</span>
                          <span className="text-xs text-white/60">{insight.action}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialInsights;
