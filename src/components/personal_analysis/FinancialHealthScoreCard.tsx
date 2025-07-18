// src/components/personal_analysis/FinancialHealthScoreCard.tsx
import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip } from 'recharts';
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

// Custom Tick memoizado para melhor performance do RadarChart
const CustomAngleTick = memo((props: any) => {
  const { x, y, payload } = props;
  const tickFill = 'hsl(var(--foreground))';
  let textAnchor = "middle";
  let finalX = x;
  let finalY = y;

  // Adjustments based on typical radar chart point positions
  if (payload.value === 'Reserva Estratégica') { // Top point
    textAnchor = "middle";
    finalY -= 10; // Move text up from the tip
  } else if (payload.value === 'Alavancagem Consciente') { // Bottom-left point
    textAnchor = "end";    // Anchor text to its end (flows left)
    finalX -= 8;       // Move anchor point slightly left
    finalY += 12;      // Move anchor point down towards base
  } else if (payload.value === 'Fluxo Vital') { // Bottom-right point
    textAnchor = "start";  // Anchor text to its start (flows right)
    finalX += 8;       // Move anchor point slightly right
    finalY += 12;      // Move anchor point down towards base
  }

  return (
    <text x={finalX} y={finalY} textAnchor={textAnchor} fill={tickFill} fontSize={9}>
      {payload.value}
    </text>
  );
});

CustomAngleTick.displayName = 'CustomAngleTick';

const FinancialHealthScoreCard: React.FC<FinancialHealthScoreCardProps> = memo(() => {
  const [isLoading, setIsLoading] = useState(true);

  // Memoizar dados financeiros para evitar recálculos desnecessários
  const financialData = useMemo(() => {
    const transactions: Transaction[] = getTransactions();
    const debts: Debt[] = getBills(false);
    return { transactions, debts };
  }, []);

  // Memoizar cálculo do score
  const scoreData = useMemo(() => {
    if (!financialData.transactions || !financialData.debts) return null;
    return calculateFinancialHealthScore(financialData.transactions, financialData.debts);
  }, [financialData]);

  // Memoizar dicas financeiras
  const financialTips = useMemo(() => {
    if (!scoreData) return [];
    return generateFinancialHealthTips(scoreData);
  }, [scoreData]);

  // Memoizar dados do radar chart
  const radarData = useMemo(() => {
    if (!scoreData) return [];
    return [
      { subject: 'Reserva Estratégica', score: scoreData.savingsScore, fullMark: 100 },
      { subject: 'Alavancagem Consciente', score: scoreData.debtScore, fullMark: 100 },
      { subject: 'Fluxo Vital', score: scoreData.liquidityScore, fullMark: 100 },
    ];
  }, [scoreData]);

  // Memoizar tooltip props
  const tooltipProps = useMemo(() => ({
    contentStyle: { 
      backgroundColor: 'rgba(49, 24, 92, 0.85)',
      borderColor: '#7E22CE', 
      color: '#E9D5FF',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    },
    formatter: (value: number) => [`${value.toFixed(1)} / 100`, 'Performance'],
    labelStyle: { color: '#FACC15', fontWeight: 'bold' }
  }), []);

  useEffect(() => {
    // Simular carregamento apenas se não há dados
    if (!scoreData) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [scoreData]);

  const getScoreIcon = useCallback((scoreType: 'savings' | 'debt' | 'liquidity', scoreValue: number) => {
    let IconComponent = AlertTriangle;
    let color = getScoreColor(scoreValue);

    switch (scoreType) {
      case 'savings':
        IconComponent = scoreValue >= 5 ? TrendingUp : TrendingDown;
        break;
      case 'debt':
        // Para dívida, pontuação alta é bom (baixo endividamento)
        IconComponent = scoreValue >= 5 ? ShieldCheck : AlertTriangle;
        break;
      case 'liquidity':
        IconComponent = scoreValue >= 5 ? ShieldCheck : AlertTriangle;
        break;
    }
    return <IconComponent size={20} className={`mr-2 ${getScoreColor(scoreValue)}`} />;
  }, []);

  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Carregando Análise...</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aguarde enquanto nossa I.A. processa seus dados...</p>
        </CardContent>
      </Card>
    );
  }

  if (!scoreData) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Erro ao Calcular Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não foi possível calcular sua análise. Verifique se há transações e contas registradas ou tente novamente mais tarde.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        {/* Left side: Score */} 
        <div> 
            <p className="text-3xl font-bold" style={{ color: getScoreColor(scoreData.finalScore) }}>
                {scoreData.finalScore}<span className="text-lg text-muted-foreground">/100</span>
            </p>
            <p className="text-xs text-muted-foreground">Saúde Financeira Geral</p>
        </div>
        {/* Right side: Title and Info Button */} 
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
                    <AlertDialogTitle className="text-purple-300">Entendendo sua Pontuação de Saúde Financeira</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Sua pontuação é calculada com base nos seus dados financeiros reais: saldo atual, proporção entre receitas e gastos, consistência nos pagamentos e diversificação de categorias. Cada fator contribui com pontos específicos para formar uma avaliação objetiva da sua situação financeira atual.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction className="bg-purple-600 hover:bg-purple-700 text-white">Entendi!</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={450}>
          <RadarChart 
            cx="50%" 
            cy="50%" 
            outerRadius="90%" 
            data={radarData}
          >
            <PolarGrid stroke="#5B21B6" />
            <PolarAngleAxis dataKey="subject" stroke="#D8B4FE" tick={<CustomAngleTick />} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#7E22CE" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
            <Radar 
              name="Sua Performance"
              dataKey="score" 
              stroke="#FACC15"
              fill="#8B5CF6"
              fillOpacity={0.6}
            />
            <Tooltip {...tooltipProps} />
          </RadarChart>
        </ResponsiveContainer>
        {/* Insights removidos para evitar duplicação - estão agora na seção de Insights IA */}
      </CardContent>
    </Card>
  );
});

FinancialHealthScoreCard.displayName = 'FinancialHealthScoreCard';

export default FinancialHealthScoreCard;
