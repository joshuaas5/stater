// src/components/personal_analysis/FinancialHealthScoreCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle } from 'lucide-react';
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
  netMonthlyIncome: number;
  totalMonthlyExpenses: number;
  monthlySavingsAmount: number;
  totalDebt: number;
  currentTotalBalance: number;
}

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

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-500';
    if (score >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const getScoreIcon = (scoreType: 'savings' | 'debt' | 'liquidity', scoreValue: number) => {
    let IconComponent = AlertTriangle;
    let color = getScoreColor(scoreValue * 10 / 10); // Normalizando para escala 0-10 se a pontuação for 0-1

    // Se as pontuações parciais são 0-10, não precisa normalizar aqui.
    // Assumindo que savingsScore, debtScore, liquidityScore são 0-10.
    color = getScoreColor(scoreValue);

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
    return <IconComponent size={20} className={`mr-2 ${color}`} />;
  };


  if (isLoading) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Nota de Saúde Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Calculando sua nota...</p>
        </CardContent>
      </Card>
    );
  }

  if (!scoreData) {
    return (
      <Card className="shadow-lg bg-card text-card-foreground">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Nota de Saúde Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não foi possível calcular sua nota. Verifique se há transações e dívidas registradas.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Nota de Saúde Financeira</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info size={18} className="text-muted-foreground" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sobre a Nota de Saúde Financeira</AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-muted-foreground space-y-2">
                  <p>
                    Esta nota é uma estimativa da sua saúde financeira com base em três pilares: Poupança (peso 3), Endividamento (peso 4) e Liquidez (peso 3).
                  </p>
                  <p>
                    <strong>Poupança:</strong> Avalia sua capacidade de guardar dinheiro em relação à sua renda mensal.
                  </p>
                  <p>
                    <strong>Endividamento:</strong> Mede o nível de suas dívidas em relação à sua renda mensal.
                  </p>
                  <p>
                    <strong>Liquidez:</strong> Verifica se você possui uma reserva para cobrir suas despesas mensais.
                  </p>
                  <p className="font-semibold text-card-foreground">
                    Atenção: Esta é uma ferramenta para fins informativos e educacionais, não substituindo o aconselhamento financeiro profissional. Os cálculos são baseados nos dados inseridos no aplicativo.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogAction>Entendi</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <CardDescription className={`text-4xl font-bold ${getScoreColor(scoreData.finalScore)}`}>
          {scoreData.finalScore.toFixed(1)} / 10
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center">
          {getScoreIcon('savings', scoreData.savingsScore)}
          <span>Poupança: <span className={`font-semibold ${getScoreColor(scoreData.savingsScore)}`}>{scoreData.savingsScore}/10</span></span>
        </div>
        <div className="flex items-center">
          {getScoreIcon('debt', scoreData.debtScore)}
          <span>Endividamento: <span className={`font-semibold ${getScoreColor(scoreData.debtScore)}`}>{scoreData.debtScore}/10</span></span>
        </div>
        <div className="flex items-center">
          {getScoreIcon('liquidity', scoreData.liquidityScore)}
          <span>Liquidez: <span className={`font-semibold ${getScoreColor(scoreData.liquidityScore)}`}>{scoreData.liquidityScore}/10</span></span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialHealthScoreCard;
