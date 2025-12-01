import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getTransactions } from '@/utils/localStorage';
import { Transaction } from '@/types';
import { 
  TrendingUp, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Info,
  PiggyBank,
  Wallet,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface FinancialMetrics {
  emergencyFundRatio: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  expenseRatio: number;
  overallScore: number;
  riskLevel: 'baixo' | 'moderado' | 'alto' | 'crítico';
  recommendations: string[];
}

interface HealthIndicator {
  title: string;
  description: string;
  value: number;
  target: number;
  status: 'excelente' | 'bom' | 'atencao' | 'critico';
  scientificBasis: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const ScientificFinancialHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [indicators, setIndicators] = useState<HealthIndicator[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [animateScore, setAnimateScore] = useState(0);

  useEffect(() => {
    calculateFinancialHealth();
  }, []);

  // Animação do score
  useEffect(() => {
    if (metrics) {
      const timer = setTimeout(() => {
        if (animateScore < metrics.overallScore) {
          setAnimateScore(prev => Math.min(prev + 2, metrics.overallScore));
        }
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [metrics, animateScore]);

  const calculateFinancialHealth = () => {
    const transactions: Transaction[] = getTransactions();
    
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= threeMonthsAgo
    );

    const monthlyIncome = recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0) / 3;

    const monthlyExpenses = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0) / 3;

    const totalBalance = transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }, 0);

    const emergencyFundRatio = monthlyExpenses > 0 ? totalBalance / monthlyExpenses : 0;
    const savingsRate = monthlyIncome > 0 ? 
      ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 100;

    let overallScore = 0;
    
    if (emergencyFundRatio >= 6) overallScore += 40;
    else if (emergencyFundRatio >= 3) overallScore += 30;
    else if (emergencyFundRatio >= 1) overallScore += 15;
    else if (emergencyFundRatio >= 0.5) overallScore += 5;

    if (savingsRate >= 20) overallScore += 30;
    else if (savingsRate >= 10) overallScore += 20;
    else if (savingsRate >= 5) overallScore += 10;
    else if (savingsRate > 0) overallScore += 5;

    if (expenseRatio <= 50) overallScore += 30;
    else if (expenseRatio <= 70) overallScore += 20;
    else if (expenseRatio <= 80) overallScore += 10;
    else if (expenseRatio <= 90) overallScore += 5;

    let riskLevel: 'baixo' | 'moderado' | 'alto' | 'crítico';
    if (overallScore >= 75) riskLevel = 'baixo';
    else if (overallScore >= 50) riskLevel = 'moderado';
    else if (overallScore >= 25) riskLevel = 'alto';
    else riskLevel = 'crítico';

    const recommendations: string[] = [];
    
    if (emergencyFundRatio < 3) {
      recommendations.push("Priorize construir um fundo de emergência de 3-6 meses de despesas");
    }
    if (savingsRate < 10) {
      recommendations.push("Aumente sua taxa de poupança para pelo menos 10-20% da renda");
    }
    if (expenseRatio > 80) {
      recommendations.push("Revise seus gastos para mantê-los abaixo de 80% da renda");
    }

    setMetrics({
      emergencyFundRatio,
      savingsRate,
      debtToIncomeRatio: 0,
      expenseRatio,
      overallScore,
      riskLevel,
      recommendations
    });

    const newIndicators: HealthIndicator[] = [
      {
        title: "Fundo de Emergência",
        description: `${emergencyFundRatio.toFixed(1)} meses cobertos`,
        value: Math.min(100, (emergencyFundRatio / 6) * 100),
        target: 100,
        status: emergencyFundRatio >= 6 ? 'excelente' : 
                emergencyFundRatio >= 3 ? 'bom' :
                emergencyFundRatio >= 1 ? 'atencao' : 'critico',
        scientificBasis: "Lusardi & Mitchell (2014)",
        icon: <Shield className="h-5 w-5" />,
        color: '#10b981',
        gradient: 'from-emerald-500 to-teal-500'
      },
      {
        title: "Taxa de Poupança",
        description: `${savingsRate.toFixed(1)}% da renda`,
        value: Math.min(100, (savingsRate / 20) * 100),
        target: 100,
        status: savingsRate >= 20 ? 'excelente' :
                savingsRate >= 10 ? 'bom' :
                savingsRate >= 5 ? 'atencao' : 'critico',
        scientificBasis: "Bernheim et al. (2001)",
        icon: <PiggyBank className="h-5 w-5" />,
        color: '#8b5cf6',
        gradient: 'from-violet-500 to-purple-500'
      },
      {
        title: "Controle de Gastos",
        description: `${expenseRatio.toFixed(1)}% consumido`,
        value: Math.max(0, 100 - expenseRatio),
        target: 100,
        status: expenseRatio <= 50 ? 'excelente' :
                expenseRatio <= 70 ? 'bom' :
                expenseRatio <= 80 ? 'atencao' : 'critico',
        scientificBasis: "Regra 50/30/20",
        icon: <Wallet className="h-5 w-5" />,
        color: '#f59e0b',
        gradient: 'from-amber-500 to-orange-500'
      },
      {
        title: "Score Geral",
        description: `${overallScore}/100 pontos`,
        value: overallScore,
        target: 100,
        status: overallScore >= 75 ? 'excelente' :
                overallScore >= 50 ? 'bom' :
                overallScore >= 25 ? 'atencao' : 'critico',
        scientificBasis: "Métricas compostas",
        icon: <TrendingUp className="h-5 w-5" />,
        color: '#3b82f6',
        gradient: 'from-blue-500 to-indigo-500'
      }
    ];

    setIndicators(newIndicators);
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return { color: '#10b981', label: 'Excelente', bg: 'from-emerald-500 to-teal-500' };
    if (score >= 50) return { color: '#3b82f6', label: 'Bom', bg: 'from-blue-500 to-indigo-500' };
    if (score >= 25) return { color: '#f59e0b', label: 'Atenção', bg: 'from-amber-500 to-orange-500' };
    return { color: '#ef4444', label: 'Crítico', bg: 'from-red-500 to-rose-500' };
  };

  if (!metrics) {
    return (
      <div 
        className="rounded-2xl p-8 animate-pulse"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        <div className="h-8 w-48 bg-white/20 rounded mb-4" />
        <div className="h-32 w-full bg-white/10 rounded-xl" />
      </div>
    );
  }

  const scoreInfo = getScoreColor(metrics.overallScore);

  return (
    <div className="space-y-4">
      {/* Card Principal - Score */}
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
                background: `linear-gradient(135deg, ${scoreInfo.color}40, ${scoreInfo.color}20)`,
                boxShadow: `0 0 20px ${scoreInfo.color}30`
              }}
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Saúde Financeira</h2>
              <p className="text-xs text-white/60">Análise baseada em ciência</p>
            </div>
          </div>
          <div 
            className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
            style={{
              background: `linear-gradient(135deg, ${scoreInfo.color}30, ${scoreInfo.color}10)`,
              border: `1px solid ${scoreInfo.color}50`,
              color: scoreInfo.color
            }}
          >
            {metrics.riskLevel === 'baixo' && <CheckCircle className="h-3.5 w-3.5" />}
            {metrics.riskLevel === 'moderado' && <Info className="h-3.5 w-3.5" />}
            {(metrics.riskLevel === 'alto' || metrics.riskLevel === 'crítico') && <AlertTriangle className="h-3.5 w-3.5" />}
            Risco {metrics.riskLevel.charAt(0).toUpperCase() + metrics.riskLevel.slice(1)}
          </div>
        </div>

        {/* Score Central */}
        <div className="p-6">
          <div className="flex flex-col items-center justify-center mb-6">
            {/* Círculo do Score */}
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="12"
                  fill="none"
                />
                {/* Progress circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke={`url(#scoreGradient)`}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(animateScore / 100) * 440} 440`}
                  style={{
                    filter: `drop-shadow(0 0 10px ${scoreInfo.color}80)`,
                    transition: 'stroke-dasharray 0.5s ease-out'
                  }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={scoreInfo.color} />
                    <stop offset="100%" stopColor={scoreInfo.color + '90'} />
                  </linearGradient>
                </defs>
              </svg>
              {/* Score number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span 
                  className="text-5xl font-bold"
                  style={{ color: scoreInfo.color }}
                >
                  {animateScore}
                </span>
                <span className="text-white/50 text-sm">de 100</span>
              </div>
            </div>
            
            <div 
              className="px-4 py-2 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${scoreInfo.color}20, transparent)`,
                border: `1px solid ${scoreInfo.color}30`
              }}
            >
              <span className="text-white font-medium">{scoreInfo.label}</span>
            </div>
          </div>

          {/* Indicadores Grid */}
          <div className="grid grid-cols-2 gap-3">
            {indicators.map((indicator, index) => (
              <div 
                key={index}
                className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${indicator.color}30, ${indicator.color}10)`,
                    }}
                  >
                    <span style={{ color: indicator.color }}>{indicator.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium text-white/80 truncate">{indicator.title}</h4>
                    <p className="text-xs text-white/50 truncate">{indicator.description}</p>
                  </div>
                </div>
                
                {/* Mini progress bar */}
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${indicator.value}%`,
                      background: `linear-gradient(90deg, ${indicator.color}, ${indicator.color}80)`,
                      boxShadow: `0 0 10px ${indicator.color}50`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recomendações */}
        {metrics.recommendations.length > 0 && (
          <div 
            className="p-4 mx-4 mb-4 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.1))',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-white">Recomendações</h4>
            </div>
            <ul className="space-y-2">
              {metrics.recommendations.map((rec, index) => (
                <li 
                  key={index} 
                  className="text-xs text-white/70 flex items-start gap-2"
                  style={{ animation: `fadeInLeft 0.3s ease-out ${index * 0.1}s both` }}
                >
                  <span className="text-blue-400 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Toggle Detalhes */}
        <div className="px-4 pb-4">
          <Button
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full text-white/60 hover:text-white hover:bg-white/10 text-xs"
          >
            {showDetails ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Ocultar Base Científica
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Ver Base Científica
              </>
            )}
          </Button>
          
          {showDetails && (
            <div 
              className="mt-3 p-4 rounded-xl text-xs text-white/60 space-y-2"
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              <p><strong className="text-white/80">Fundo de Emergência:</strong> Lusardi & Mitchell (2014) - 3-6 meses de despesas reduzem 40% o risco financeiro.</p>
              <p><strong className="text-white/80">Taxa de Poupança:</strong> Bernheim et al. (2001) - 10-20% da renda para segurança de longo prazo.</p>
              <p><strong className="text-white/80">Controle de Gastos:</strong> Regra 50/30/20 de Warren & Tyagi (2005).</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ScientificFinancialHealth;
