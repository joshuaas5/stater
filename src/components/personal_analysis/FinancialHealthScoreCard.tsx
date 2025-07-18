// src/components/personal_analysis/FinancialHealthScoreCard.tsx
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle } from 'lucide-react';
import { calculateFinancialHealthScore, generateFinancialHealthTips } from '@/services/financialHealthService';
import { getTransactions, getBills } from '@/utils/localStorage';
import { Transaction, Bill as Debt } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface FinancialHealthScoreCardProps {
  // Poderíamos adicionar props se quiséssemos passar dados de fora, mas por enquanto vamos buscar internamente.
}

interface ScoreData {
  finalScore: number;
  savingsScore: number;
  debtScore: number;
  liquidityScore: number;
  billsOnTimeScore: number;
  appUsageScore: number;
  iaInteractionScore: number;
  netMonthlyIncome: number;
  totalMonthlyExpenses: number;
  monthlySavingsAmount: number;
  totalDebt: number;
  currentTotalBalance: number;
}

// Funções auxiliares memoizadas para evitar recriação
const getScoreColor = (score: number): string => {
  if (score < 40) return 'hsl(var(--destructive))'; // Vermelho para Ruim (0-39.9)
  if (score < 70) return 'hsl(var(--warning))';   // Amarelo para Regular (40-69.9)
  if (score < 90) return 'hsl(var(--info))';      // Azul para Bom (70-89.9)
  return 'hsl(var(--success))';                   // Verde para Excelente (90-100)
};

const getScoreDescription = (score: number): string => {
  if (score < 40) return 'Ruim';
  if (score < 70) return 'Regular';
  if (score < 90) return 'Bom';
  return 'Excelente';
};

// Componente SVG otimizado para substituir RadarChart
const OptimizedFinancialRadar = memo<{ data: Array<{ subject: string; score: number; fullMark: number }> }>(({ data }) => {
  const size = 320;
  const center = size / 2;
  const maxRadius = size * 0.35;
  
  // Memoizar todos os cálculos geométricos
  const chartElements = useMemo(() => {
    const angleStep = (2 * Math.PI) / data.length;
    
    // Calcular pontos do polígono
    const points = data.map((item, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const normalizedScore = item.score / 100;
      const radius = maxRadius * normalizedScore;
      
      return {
        x: center + Math.cos(angle) * radius,
        y: center + Math.sin(angle) * radius,
        maxX: center + Math.cos(angle) * maxRadius,
        maxY: center + Math.sin(angle) * maxRadius,
        labelX: center + Math.cos(angle) * (maxRadius + 25),
        labelY: center + Math.sin(angle) * (maxRadius + 25),
        score: item.score,
        subject: item.subject,
        angle
      };
    });
    
    // Criar path do polígono
    const polygonPath = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ') + ' Z';
    
    // Criar círculos de grade
    const gridRings = [0.25, 0.5, 0.75, 1.0].map(factor => maxRadius * factor);
    
    return { points, polygonPath, gridRings };
  }, [data, center, maxRadius]);

  return (
    <div 
      className="w-full h-full flex items-center justify-center"
      style={{ 
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform'
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
        style={{
          transform: 'translate3d(0, 0, 0)',
          shapeRendering: 'optimizeSpeed'
        }}
      >
        {/* Círculos de grade */}
        {chartElements.gridRings.map((radius, index) => (
          <circle
            key={`ring-${index}`}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity={0.2}
          />
        ))}
        
        {/* Linhas dos eixos */}
        {chartElements.points.map((point, index) => (
          <line
            key={`axis-${index}`}
            x1={center}
            y1={center}
            x2={point.maxX}
            y2={point.maxY}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            opacity={0.3}
          />
        ))}
        
        {/* Polígono dos dados */}
        <path
          d={chartElements.polygonPath}
          fill="hsl(var(--primary))"
          fillOpacity="0.15"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
        />
        
        {/* Pontos dos dados */}
        {chartElements.points.map((point, index) => (
          <g key={`point-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth="2"
            />
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="11"
              fill="hsl(var(--primary))"
              fontWeight="600"
            >
              {point.score}
            </text>
          </g>
        ))}
        
        {/* Labels dos eixos */}
        {chartElements.points.map((point, index) => (
          <text
            key={`label-${index}`}
            x={point.labelX}
            y={point.labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fill="hsl(var(--foreground))"
            fontWeight="500"
          >
            {point.subject.split(' ')[0]}
          </text>
        ))}
      </svg>
    </div>
  );
});

OptimizedFinancialRadar.displayName = 'OptimizedFinancialRadar';

// Hook otimizado para dados financeiros
const useFinancialData = () => {
  return useMemo(() => {
    try {
      const transactions = getTransactions();
      const debts = getBills(false);
      
      if (!transactions.length) {
        return { transactions: [], debts: [], scoreData: null, error: null };
      }
      
      const scoreData = calculateFinancialHealthScore(transactions, debts);
      return { transactions, debts, scoreData, error: null };
    } catch (error) {
      console.error('Erro ao processar dados financeiros:', error);
      return { transactions: [], debts: [], scoreData: null, error: error as Error };
    }
  }, []);
};

// Skeleton otimizado
const FinancialHealthSkeleton = memo(() => (
  <Card 
    className="shadow-lg bg-card text-card-foreground"
    style={{ 
      transform: 'translate3d(0, 0, 0)',
      willChange: 'transform'
    }}
  >
    <CardHeader className="flex flex-row items-start justify-between pb-3">
      <div>
        <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2" />
        <div className="h-3 w-32 bg-muted rounded animate-pulse" />
      </div>
      <div className="flex flex-col items-end">
        <div className="h-4 w-20 bg-muted rounded animate-pulse mb-1" />
        <div className="h-6 w-6 bg-muted rounded animate-pulse" />
      </div>
    </CardHeader>
    <CardContent className="pt-4">
      <div className="h-[320px] w-full bg-muted rounded animate-pulse" />
    </CardContent>
  </Card>
));

FinancialHealthSkeleton.displayName = 'FinancialHealthSkeleton';

const FinancialHealthScoreCard: React.FC<FinancialHealthScoreCardProps> = memo(() => {
  const [isLoading, setIsLoading] = useState(true);
  const { scoreData, error } = useFinancialData();

  // Memoizar dados do radar
  const radarData = useMemo(() => {
    if (!scoreData) return [];
    return [
      { subject: 'Reserva Estratégica', score: scoreData.savingsScore, fullMark: 100 },
      { subject: 'Alavancagem Consciente', score: scoreData.debtScore, fullMark: 100 },
      { subject: 'Fluxo Vital', score: scoreData.liquidityScore, fullMark: 100 },
    ];
  }, [scoreData]);

  useEffect(() => {
    if (scoreData || error) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => setIsLoading(false), 100);
      return () => clearTimeout(timer);
    }
  }, [scoreData, error]);

  const getScoreIcon = useCallback((scoreType: 'savings' | 'debt' | 'liquidity', scoreValue: number) => {
    let IconComponent = AlertTriangle;
    const color = getScoreColor(scoreValue);

    switch (scoreType) {
      case 'savings':
        IconComponent = scoreValue >= 50 ? TrendingUp : TrendingDown;
        break;
      case 'debt':
        IconComponent = scoreValue >= 50 ? ShieldCheck : AlertTriangle;
        break;
      case 'liquidity':
        IconComponent = scoreValue >= 50 ? ShieldCheck : AlertTriangle;
        break;
    }
    return <IconComponent size={16} style={{ color }} />;
  }, []);

  if (isLoading) {
    return <FinancialHealthSkeleton />;
  }

  if (error || !scoreData) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-destructive">
            Erro ao Calcular Análise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não foi possível calcular sua análise. Verifique se há dados suficientes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="shadow-lg bg-card text-card-foreground"
      style={{ 
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform'
      }}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div> 
          <p className="text-3xl font-bold" style={{ color: getScoreColor(scoreData.finalScore) }}>
            {scoreData.finalScore}<span className="text-lg text-muted-foreground">/100</span>
          </p>
          <p className="text-xs text-muted-foreground">Saúde Financeira Geral</p>
        </div>
        <div className="flex flex-col items-end"> 
          <CardTitle className="text-xs font-medium text-muted-foreground mb-1">
            Análise Financeira
          </CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="w-6 h-6">
                <Info className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-800 text-gray-200 border-purple-500">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-purple-300">
                  Entendendo sua Pontuação de Saúde Financeira
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  Sua pontuação é calculada com base nos seus dados financeiros reais: saldo atual, 
                  proporção entre receitas e gastos, consistência nos pagamentos e diversificação de categorias.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction className="bg-purple-600 hover:bg-purple-700 text-white">
                  Entendi!
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-[320px] w-full">
          <OptimizedFinancialRadar data={radarData} />
        </div>
        
        {/* Métricas resumidas */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            {getScoreIcon('savings', scoreData.savingsScore)}
            <span className="text-sm font-medium">{scoreData.savingsScore}/100</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            {getScoreIcon('debt', scoreData.debtScore)}
            <span className="text-sm font-medium">{scoreData.debtScore}/100</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            {getScoreIcon('liquidity', scoreData.liquidityScore)}
            <span className="text-sm font-medium">{scoreData.liquidityScore}/100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

FinancialHealthScoreCard.displayName = 'FinancialHealthScoreCard';

export default FinancialHealthScoreCard;
