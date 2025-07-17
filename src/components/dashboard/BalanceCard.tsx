
import React from 'react';
import { formatCurrency } from '@/utils/dataProcessing';

interface BalanceCardProps {
  balance: number;
  percentChange: number;
  visible?: boolean;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, percentChange, visible = true }) => {
  return (
    <div className="card-balance animate-fade-in">
      <p className="text-white text-3xl font-bold leading-tight truncate mb-2">
        {visible ? formatCurrency(balance) : '••••••'}
      </p>
      <div className="flex gap-1">
        <p className="text-white/70 text-base font-normal leading-normal">Últimos 30 Dias</p>
        <p className={`text-base font-medium leading-normal ${percentChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {percentChange !== undefined && percentChange !== null && !isNaN(percentChange) ? `${percentChange >= 0 ? '+' : ''}${Number(percentChange).toFixed(0)}%` : '--%'}
        </p>
      </div>
    </div>
  );
};

export default BalanceCard;
