
import React, { useEffect, useRef } from 'react';
import { Line, LineChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction } from '@/types';
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
    
    // Criar um objeto para acompanhar o saldo acumulado
    let runningBalance = 0;
    
    // Criar pontos de dados para cada dia do período
    for (let i = days; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Encontrar transações deste dia
      const dayTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate.toISOString().split('T')[0] === dateStr;
      });
      
      // Calcular o saldo do dia
      let dayBalance = 0;
      dayTransactions.forEach(t => {
        if (t.type === 'income') {
          dayBalance += t.amount;
        } else {
          dayBalance -= t.amount;
        }
      });
      
      // Acumular o saldo
      runningBalance += dayBalance;
      
      data.push({
        date: dateStr,
        balance: runningBalance,
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
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#29374C', 
                border: 'none',
                borderRadius: '8px',
                color: '#F8F9FB'
              }}
              formatter={(value: number) => [formatCurrency(value), 'Saldo']}
              labelFormatter={(label: any) => {
                if (typeof label !== 'string') {
                  return '';
                }
                const parts = label.split('-');
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado no JS (0=Jan, 11=Dez)
                const day = parseInt(parts[2], 10);
                // Cria data à meia-noite no fuso horário local
                const localDate = new Date(year, month, day);
                return localDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
              }}
            />
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

export default SpendingChart;
