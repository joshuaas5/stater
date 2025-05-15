
import React, { useEffect, useRef } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '@/types';
import { cn } from '@/lib/utils'; // Assumindo que cn vem daqui
import { formatCurrency } from '@/utils/dataProcessing';

interface SpendingChartProps {
  transactions: Transaction[];
  days: number;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions, days }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Preparar dados para o gráfico
  const prepareChartData = () => {
    const today = new Date();
    const data = [];
    let runningBalance = 0;

    // Se não houver transações e o período for apenas 1 dia (para mostrar o dia atual)
    if (transactions.length === 0 && days === 0) { 
        data.push({
            date: today.toISOString().split('T')[0],
            balance: runningBalance, 
            hasTransactionsToday: false,
        });
        return data;
    }

    for (let i = days; i >= 0; i--) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() - i);
      currentDate.setHours(0, 0, 0, 0);
      const dateStr = currentDate.toISOString().split('T')[0];

      const dayTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        txDate.setHours(0,0,0,0);
        return txDate.toISOString().split('T')[0] === dateStr;
      });

      let dayNetChange = 0;
      dayTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
          dayNetChange += transaction.amount;
        } else {
          dayNetChange -= transaction.amount;
        }
      });
      
      runningBalance += dayNetChange; 

      data.push({
        date: dateStr,
        balance: runningBalance,
        hasTransactionsToday: dayTransactions.length > 0,
      });
    }
    // Se não há transações e o loop não adicionou nada (ex: days < 0, ou days=0 e transactions.length > 0 mas nenhuma no dia atual)
    // E queremos garantir que pelo menos o dia atual apareça se o array `data` estiver vazio:
    if (data.length === 0) {
        data.push({
            date: today.toISOString().split('T')[0],
            balance: runningBalance, 
            hasTransactionsToday: false, 
        });
    }

    return data;
  };
  
  const chartData = prepareChartData();

  return (
    <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4" ref={chartRef}>
      <div className="h-[148px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#8A9DC0" 
              strokeWidth={3} 
              dot={false} 
              activeDot={{ r: 8, fill: '#8A9DC0' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-around">
        <p className="text-galileo-secondaryText text-[13px] font-bold leading-normal tracking-[0.015em]">1D</p>
        <p className="text-galileo-secondaryText text-[13px] font-bold leading-normal tracking-[0.015em]">1W</p>
        <p className="text-galileo-secondaryText text-[13px] font-bold leading-normal tracking-[0.015em]">1M</p>
        <p className="text-galileo-secondaryText text-[13px] font-bold leading-normal tracking-[0.015em]">3M</p>
        <p className="text-galileo-secondaryText text-[13px] font-bold leading-normal tracking-[0.015em]">1Y</p>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload; // Acesso ao objeto completo do ponto de dado
    const dateLabel = () => {
      if (typeof label !== 'string' || !label.includes('-')) return '';
      const parts = label.split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return label;
    };

    return (
      <div className={cn(
        "rounded-lg border bg-background p-2 shadow-sm",
        "dark:bg-gray-800 dark:text-gray-50 dark:border-gray-700",
        "light:bg-white light:text-gray-900 light:border-gray-200"
      )}>
        {dataPoint.hasTransactionsToday && (
          <p className="text-sm font-medium leading-none">
            {dateLabel()}
          </p>
        )}
        <p className={cn(
          "text-sm",
          dataPoint.hasTransactionsToday ? "text-muted-foreground" : "font-medium text-foreground"
        )}>
          Saldo: {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default SpendingChart;
