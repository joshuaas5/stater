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
    <div 
      className="flex min-h-[200px] flex-1 flex-col gap-4 py-4" 
      ref={chartRef}
      style={{
        background: 'rgba(49, 81, 139, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)'
      }}
    >
      <div className="flex items-center justify-between px-4">
        <h3 
          className="text-lg font-semibold"
          style={{
            color: '#ffffff',
            fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif',
            fontWeight: 600
          }}
        >
          Evolução do Saldo - Últimos {days} dias
        </h3>
        <p 
          className="text-sm"
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
          }}
        >
          {`Saldo atual: ${formatCurrency(currentBalance)}`}
        </p>
      </div>
      <div className="h-[160px] w-full px-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="balance" 
              stroke="#ffffff" 
              strokeWidth={3} 
              dot={{ fill: '#ffffff', r: 3 }}
              activeDot={{ r: 6, fill: '#ffffff', stroke: '#020617', strokeWidth: 2 }}
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
      <div 
        className="rounded-lg border p-3 shadow-xl"
        style={{
          background: 'rgba(49, 81, 139, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(20px)',
          color: '#ffffff'
        }}
      >
        <p 
          className="text-sm font-semibold mb-1"
          style={{
            color: '#ffffff',
            fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
          }}
        >
          {dataPoint.formattedDate}
        </p>
        <p 
          className="text-sm"
          style={{
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
          }}
        >
          <span className="font-medium">Saldo:</span> {formatCurrency(payload[0].value)}
        </p>
        {dataPoint.dayChange !== 0 && (
          <p 
            className="text-sm font-medium"
            style={{
              color: dataPoint.dayChange > 0 ? '#10b981' : '#ef4444',
              fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
            }}
          >
            <span 
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 'normal' 
              }}
            >
              Mudança:
            </span> {dataPoint.dayChange > 0 ? '+' : ''}{formatCurrency(dataPoint.dayChange)}
          </p>
        )}
        {!dataPoint.hasTransactionsToday && (
          <p 
            className="text-xs mt-1"
            style={{
              color: 'rgba(255, 255, 255, 0.6)',
              fontFamily: '"SF Pro Display", system-ui, -apple-system, sans-serif'
            }}
          >
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
