import React, { useEffect, useRef, useMemo, memo } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '@/types';
import { cn } from '@/lib/utils'; // Assumindo que cn vem daqui
import { formatCurrency } from '@/utils/dataProcessing';

interface SpendingChartProps {
  transactions: Transaction[];
  days: number;
}

const SpendingChart: React.FC<SpendingChartProps> = memo(({ transactions, days }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Memoizar preparação de dados para o gráfico com evolução real do saldo
  const chartData = useMemo(() => {
    const prepareChartData = () => {
      const today = new Date();
      const data = [];
      let runningBalance = 0;

      // Calcular saldo inicial (todas as transações até o primeiro dia do período)
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - days);
      startDate.setHours(0, 0, 0, 0);

      // Somar todas as transações anteriores ao período para ter o saldo inicial correto
      const previousTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate < startDate;
      });

      previousTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
          runningBalance += transaction.amount;
        } else {
          runningBalance -= transaction.amount;
        }
      });

      // Agora processar cada dia do período
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
          dayChange: dayNetChange,
          hasTransactionsToday: dayTransactions.length > 0,
          formattedDate: currentDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit'
          })
        });
      }

      // Se não há dados, mostrar pelo menos hoje com saldo zero
      if (data.length === 0) {
          data.push({
              date: today.toISOString().split('T')[0],
              balance: 0, 
              dayChange: 0,
              hasTransactionsToday: false,
              formattedDate: today.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit'
              })
          });
      }

      return data;
    };
    
    return prepareChartData();
  }, [transactions, days]);

  // Memoizar formatação de números grandes
  const currentBalance = useMemo(() => {
    return chartData.length > 0 ? chartData[chartData.length - 1]?.balance || 0 : 0;
  }, [chartData]);

  return (
    <div className="flex min-h-[200px] flex-1 flex-col gap-4 py-4" ref={chartRef}>
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-semibold">Evolução do Saldo - Últimos {days} dias</h3>
        <p className="text-white/70 text-sm">
          {`Saldo atual: ${formatCurrency(currentBalance)}`}
        </p>
      </div>
      <div className="h-[160px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 6, fill: '#1d4ed8', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    
    return (
      <div className={cn(
        "rounded-lg border bg-white/95 backdrop-blur p-3 shadow-xl",
        "dark:bg-gray-800/95 dark:text-gray-50 dark:border-gray-600",
        "border-blue-200"
      )}>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {dataPoint.formattedDate}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">Saldo:</span> {formatCurrency(payload[0].value)}
        </p>
        {dataPoint.dayChange !== 0 && (
          <p className={cn(
            "text-sm font-medium",
            dataPoint.dayChange > 0 ? "text-green-600" : "text-red-600"
          )}>
            <span className="font-normal text-gray-600 dark:text-gray-400">Mudança:</span> {dataPoint.dayChange > 0 ? '+' : ''}{formatCurrency(dataPoint.dayChange)}
          </p>
        )}
        {!dataPoint.hasTransactionsToday && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Sem transações neste dia
          </p>
        )}
      </div>
    );
  }
  return null;
});

SpendingChart.displayName = 'SpendingChart';
CustomTooltip.displayName = 'CustomTooltip';

export default SpendingChart;
