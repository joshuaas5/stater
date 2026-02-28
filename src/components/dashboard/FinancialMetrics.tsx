import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, CreditCard, Target, Wallet } from 'lucide-react';
import { getTransactions, getBills } from '@/utils/localStorage';
import { Transaction, Bill } from '@/types';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  gradientFrom: string;
  gradientTo: string;
  iconColor?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  trend, 
  icon, 
  gradientFrom, 
  gradientTo,
  iconColor = "text-white"
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />;
    return null;
  };
  return (
    <Card className="relative overflow-hidden border border-border bg-card/90 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="absolute inset-0 bg-gradient-to-br opacity-5 dark:opacity-10"
           style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }} />
      
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-xl shadow-lg text-white`}
                   style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}>
                {icon}
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
            </div>
            
            <div className="space-y-1">
              <p className="text-2xl font-bold text-foreground">{value}</p>
              {subtitle && (
                <div className="flex items-center gap-1">
                  {getTrendIcon()}
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FinancialMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savings: 0,
    totalDebt: 0,
    savingsRate: 0
  });

  useEffect(() => {
    const transactions: Transaction[] = getTransactions();
    const bills: Bill[] = getBills(false);

    // Calcular métricas do mês atual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
    });

    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const monthlyExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalBalance = transactions.reduce((sum, t) => {
      return t.type === 'income' ? sum + Math.abs(t.amount) : sum - Math.abs(t.amount);
    }, 0);

    const totalDebt = bills
      .filter(bill => !bill.isPaid)
      .reduce((sum, bill) => sum + bill.amount, 0);

    const savings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

    setMetrics({
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savings,
      totalDebt,
      savingsRate
    });
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const metricsData: MetricCardProps[] = [
    {
      title: 'Saldo Total',
      value: formatCurrency(metrics.totalBalance),
      subtitle: metrics.totalBalance >= 0 ? 'Situação positiva' : 'Atenção necessária',
      trend: (metrics.totalBalance >= 0 ? 'up' : 'down') as 'up' | 'down',
      icon: <Wallet className="w-5 h-5" />,
      gradientFrom: '#667eea',
      gradientTo: '#764ba2'
    },
    {
      title: 'Receita Mensal',
      value: formatCurrency(metrics.monthlyIncome),
      subtitle: 'Este mês',
      trend: 'up' as const,
      icon: <TrendingUp className="w-5 h-5" />,
      gradientFrom: '#f093fb',
      gradientTo: '#f5576c'
    },
    {
      title: 'Gastos Mensais',
      value: formatCurrency(metrics.monthlyExpenses),
      subtitle: 'Este mês',
      trend: 'down' as const,
      icon: <CreditCard className="w-5 h-5" />,
      gradientFrom: '#4facfe',
      gradientTo: '#00f2fe'
    },
    {
      title: 'Economia Mensal',
      value: formatCurrency(metrics.savings),
      subtitle: `${metrics.savingsRate.toFixed(1)}% da receita`,
      trend: (metrics.savings >= 0 ? 'up' : 'down') as 'up' | 'down',
      icon: <PiggyBank className="w-5 h-5" />,
      gradientFrom: '#43e97b',
      gradientTo: '#38f9d7'
    },
    {
      title: 'Dívidas Pendentes',
      value: formatCurrency(metrics.totalDebt),
      subtitle: 'A pagar',
      trend: 'neutral' as const,
      icon: <Target className="w-5 h-5" />,
      gradientFrom: '#fa709a',
      gradientTo: '#fee140'
    },
    {
      title: 'Meta de Economia',
      value: formatCurrency(metrics.monthlyIncome * 0.2),
      subtitle: '20% da receita',
      trend: (metrics.savingsRate >= 20 ? 'up' : 'down') as 'up' | 'down',
      icon: <DollarSign className="w-5 h-5" />,
      gradientFrom: '#a8edea',
      gradientTo: '#fed6e3'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metricsData.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};

export default FinancialMetrics;
