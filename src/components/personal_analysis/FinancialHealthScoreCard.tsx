// src/components/personal_analysis/FinancialHealthScoreCard.tsx
import React, { useState, useEffect } from 'react';
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
  const [financialTips, setFinancialTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const transactions: Transaction[] = getTransactions();
    const debts: Debt[] = getBills(false); // Usar getBills(false) para obter todas as contas (pagas e não pagas)

    if (transactions && debts) {
      const result = calculateFinancialHealthScore(transactions, debts);
      setScoreData(result);
      if (result) {
        setFinancialTips(generateFinancialHealthTips(result));
      }
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
            <CardTitle className="text-sm font-medium text-muted-foreground mb-1">
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
                      Sua pontuação é calculada por uma I.A. avançada que analisa um vasto conjunto de dados e comportamentos financeiros, incluindo seus hábitos de poupança, endividamento, liquidez, pagamento de contas, uso do app e interações com nossas ferramentas de IA. O objetivo é fornecer uma visão holística e misteriosamente precisa da sua vitalidade financeira.
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
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart 
            cx="50%" 
            cy="50%" 
            outerRadius="70%" 
            data={[
              { subject: 'Reserva Estratégica', score: scoreData.savingsScore, fullMark: 100 },
              { subject: 'Alavancagem Consciente', score: scoreData.debtScore, fullMark: 100 },
              { subject: 'Fluxo Vital', score: scoreData.liquidityScore, fullMark: 100 },
            ]}
          >
            <PolarGrid stroke="#5B21B6" /> {/* Grid roxo mais escuro */}
            <PolarAngleAxis dataKey="subject" stroke="#D8B4FE" tick={{ fill: 'hsl(var(--foreground))', fontSize: 8 }} /> {/* Reduzido ainda mais o fontSize para mobile */}
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#7E22CE" tick={{ fill: 'hsl(var(--muted-foreground))' }} /> {/* Eixo radial roxo, ticks adaptáveis ao tema */}
            <Radar 
              name="Sua Performance"
              dataKey="score" 
              stroke="#FACC15"  /* Dourado para o contorno do radar */
              fill="#8B5CF6"    /* Roxo vibrante para o preenchimento */
              fillOpacity={0.6}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(49, 24, 92, 0.85)', /* Fundo do tooltip roxo escuro semi-transparente */
                borderColor: '#7E22CE', 
                color: '#E9D5FF', /* Texto do tooltip em lavanda claro */
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }} 
              formatter={(value: number) => [`${value.toFixed(1)} / 100`, 'Performance']}
              labelStyle={{ color: '#FACC15', fontWeight: 'bold' }} /* Cor do label (Reserva Estratégica, etc) no tooltip em dourado */
            />
            {/* <Legend /> Removida para um visual mais limpo e misterioso */}
          </RadarChart>
        </ResponsiveContainer>
        {/* A exibição detalhada dos scores individuais foi removida para um design mais 'misterioso' */}

        {financialTips.length > 0 && (
          <div className="mt-6 pt-4 border-t border-purple-300/30">
            <h3 className="text-md font-semibold mb-3 text-foreground">Insights 💡</h3>
            <ul className="space-y-2 list-inside list-disc pl-2">
              {financialTips.map((tip: string, index: number) => (
                <li key={index} className="text-sm text-muted-foreground">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancialHealthScoreCard;
