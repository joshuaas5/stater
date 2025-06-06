// src/components/personal_analysis/FinancialHealthScoreCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip } from 'recharts';
import { calculateFinancialHealthScore } from '@/services/financialHealthService';
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

// Funções auxiliares ajustadas para escala 0-100
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

const FinancialHealthScoreCard: React.FC<FinancialHealthScoreCardProps> = () => {
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const transactions: Transaction[] = getTransactions();
    const debts: Debt[] = getBills(false); // Usar getBills(false) para obter todas as contas (pagas e não pagas)

    if (transactions && debts) {
      const result = calculateFinancialHealthScore(transactions, debts);
      setScoreData(result);
    }
    setIsLoading(false);
  }, []);

  const getScoreIcon = (scoreType: 'savings' | 'debt' | 'liquidity', scoreValue: number) => {
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
  };

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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            Sua Saúde Financeira: <span style={{ color: getScoreColor(scoreData.finalScore) }}>{scoreData.finalScore}/100</span>
          </CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info size={18} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Análise de Saúde Financeira por I.A.</AlertDialogTitle>
                <AlertDialogDescription>
                  Nossa Inteligência Artificial realiza uma varredura completa em sua vida financeira, analisando um vasto conjunto de dados e comportamentos para gerar sua pontuação.
                  <br /><br />
                  Consideramos, por exemplo, seus hábitos de poupança, a forma como gerencia suas dívidas, sua liquidez para imprevistos, e até mesmo seu engajamento e busca por conhecimento financeiro através de nossa plataforma.
                  <br /><br />
                  A nota final é o resultado dessa complexa análise multidimensional, oferecendo um panorama da sua saúde financeira atual.
                  <br /><br />
                  <em>Disclaimer: Esta é uma análise gerada por IA para fins informativos e não substitui o aconselhamento financeiro profissional. Os cálculos são baseados nos dados fornecidos.</em>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Entendi</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart 
            cx="50%" 
            cy="50%" 
            outerRadius="80%" 
            data={[
              { subject: 'Poupança', score: scoreData.savingsScore, fullMark: 100 },
              { subject: 'Endividamento', score: scoreData.debtScore, fullMark: 100 },
              { subject: 'Liquidez', score: scoreData.liquidityScore, fullMark: 100 },
            ]}
          >
            <PolarGrid stroke="#4A5568" /> {/* Grid cinza escuro */}
            <PolarAngleAxis dataKey="subject" stroke="#E2E8F0" /> {/* Eixos angulares brancos/cinza claro */}
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#718096" tick={{ fill: '#A0AEC0' }} /> {/* Eixo radial cinza, ticks cinza claro */}
            <Radar 
              name="Sua Performance"
              dataKey="score" 
              stroke="#3B82F6"  /* Azul neon */
              fill="#EC4899"    /* Rosa/Magenta neon */
              fillOpacity={0.5}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(31, 41, 55, 0.8)', /* Fundo do tooltip escuro semi-transparente */
                borderColor: '#4A5568', 
                color: '#E2E8F0' 
              }} 
              formatter={(value: number) => [`${value.toFixed(1)} / 100`, 'Performance']}
              labelStyle={{ color: '#00A9FF' }} /* Cor do label (Poupança, etc) no tooltip */
            />
            {/* <Legend /> Removida para um visual mais limpo e misterioso */}
          </RadarChart>
        </ResponsiveContainer>
        {/* A exibição detalhada dos scores individuais foi removida para um design mais 'misterioso' */}
      </CardContent>
    </Card>
  );
};

export default FinancialHealthScoreCard;
