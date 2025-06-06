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
                Nossa Inteligência Artificial analisa sua situação financeira considerando múltiplos fatores, cada um com um peso na nota final (de 0 a 100):
                <br /><br />
                <strong>Poupança (40%):</strong> Quanto você já acumulou em patrimônio em relação à sua renda mensal.
                <br />
                <strong>Endividamento (30%):</strong> O quão saudável está seu nível de dívidas em relação à renda.
                <br />
                <strong>Liquidez (20%):</strong> Sua capacidade de cobrir despesas inesperadas com o saldo disponível.
                <br />
                <strong>Contas em dia (5%):</strong> Se você mantém suas contas pagas sem atrasos.
                <br />
                <strong>Uso do app (2,5%):</strong> Frequência de acesso ao aplicativo.
                <br />
                <strong>Interação IA (2,5%):</strong> O quanto você busca dicas e conselhos do consultor inteligente.
                <br /><br />
                A nota final é uma média ponderada desses fatores, refletindo sua saúde financeira global e seu engajamento com o app.
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
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
            { subject: 'Poupança', score: scoreData.savingsScore, fullMark: 100 },
            { subject: 'Endividamento', score: scoreData.debtScore, fullMark: 100 },
            { subject: 'Liquidez', score: scoreData.liquidityScore, fullMark: 100 },
          ]}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tickFormatter={(value) => `${value}`} />
            <Radar name="Saúde Financeira" dataKey="score" stroke="#16a34a" fill="#16a34a" fillOpacity={0.6} />
            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} formatter={(value: number) => [`${value}/100`, 'Pontuação']} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center"><span className="font-semibold mr-1">Poupança (40%):</span> {scoreData.savingsScore}/100</div>
          <div className="flex items-center"><span className="font-semibold mr-1">Endividamento (30%):</span> {scoreData.debtScore}/100</div>
          <div className="flex items-center"><span className="font-semibold mr-1">Liquidez (20%):</span> {scoreData.liquidityScore}/100</div>
          <div className="flex items-center"><span className="font-semibold mr-1">Contas em dia (5%):</span> {scoreData.billsOnTimeScore ?? '--'}/100</div>
          <div className="flex items-center"><span className="font-semibold mr-1">Uso do app (2,5%):</span> {scoreData.appUsageScore ?? '--'}/100</div>
          <div className="flex items-center"><span className="font-semibold mr-1">Interação IA (2,5%):</span> {scoreData.iaInteractionScore ?? '--'}/100</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialHealthScoreCard;
