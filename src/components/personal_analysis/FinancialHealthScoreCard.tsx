// src/components/personal_analysis/FinancialHealthScoreCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis, Label } from 'recharts';
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

// Funções auxiliares movidas para o escopo do módulo
const getScoreColor = (score: number): string => {
  if (score < 4) return 'hsl(var(--destructive))'; // Vermelho para Ruim
  if (score < 7) return 'hsl(var(--warning))'; // Amarelo para Regular
  if (score < 9) return 'hsl(var(--info))'; // Azul para Bom
  return 'hsl(var(--success))'; // Verde para Excelente
};

const getScoreDescription = (score: number): string => {
  if (score < 4) return 'Ruim';
  if (score < 7) return 'Regular';
  if (score < 9) return 'Bom';
  return 'Excelente';
};

// Componente funcional para o conteúdo customizado do Label central
interface CentralLabelProps {
  viewBox?: { cx?: number; cy?: number };
  value?: number; // Este valor virá das props injetadas pela função label do RadialBar
}

const CentralLabelContent: React.FC<CentralLabelProps> = ({ viewBox, value }) => {
  const { cx, cy } = viewBox || {};
  // value é a pontuação final, ex: 7.5
  if (cx === undefined || cy === undefined || value === undefined) return null;

  const descriptionText = getScoreDescription(value);
  const fillColor = getScoreColor(value);

  return (
    <g>
      <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="central" className="text-3xl font-bold" style={{ fill: fillColor }}>
        {value.toFixed(1)}
      </text>
      <text x={cx} y={cy + 15} textAnchor="middle" dominantBaseline="central" className="text-xs fill-muted-foreground">
        {descriptionText}
      </text>
    </g>
  );
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
          <CardTitle className="flex items-center justify-between">
            Nota de Saúde Financeira
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2">
                  <Info size={18} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sobre a Nota de Saúde Financeira</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta nota (0-10) avalia sua saúde financeira com base em Poupança (30%), Endividamento (40%) e Liquidez (30%).
                    <br /><br />
                    <strong>Poupança:</strong> Capacidade de guardar dinheiro mensalmente.
                    <br />
                    <strong>Endividamento:</strong> Nível de dívidas em relação à sua renda.
                    <br />
                    <strong>Liquidez:</strong> Capacidade de cobrir despesas com seus ativos líquidos.
                    <br /><br />
                    <em>Disclaimer: Esta é uma análise simplificada e não substitui o aconselhamento financeiro profissional.</em>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction>Entendi</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardTitle>
        </div>
        {/* Gráfico RadialBarChart para a nota final - Movido para baixo do título */}
        <div style={{ width: '100%', height: 200 }} className="mt-2 mb-2 flex justify-center items-center">
          <ResponsiveContainer width="50%" height="100%"> {/* Ajustado para ocupar menos largura e centralizar */}
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="60%" 
              outerRadius="100%" 
              barSize={20} 
              data={[{ name: 'Score', value: scoreData.finalScore, fill: getScoreColor(scoreData.finalScore) }]}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 10]} angleAxisId={0} tick={false} />
              <RadialBar
                background
                dataKey='value' // Garante que props.value na função label seja scoreData.finalScore
                angleAxisId={0}
                cornerRadius={10}
                label={(props) => { // Usar uma função de renderização para o label
                  // props aqui incluirá viewBox, value (do dataKey), etc.
                  return (
                    <CentralLabelContent 
                      viewBox={props.viewBox} 
                      value={props.value} // Passa o valor do segmento da barra
                    />
                  );
                }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
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
