
import React from 'react';
import { formatCurrency } from '@/utils/dataProcessing';

interface BalanceCardProps {
  balance: number;
  percentChange: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, percentChange }) => {
  return (
    <div className="card-balance animate-fade-in">
      <p className="text-galileo-secondaryText text-base font-medium leading-normal">Saldo da Conta</p>
      <p className="text-galileo-text text-[32px] font-bold leading-tight truncate">
        {formatCurrency(balance)}
      </p>
      <div className="flex gap-1">
        <p className="text-galileo-secondaryText text-base font-normal leading-normal">Últimos 30 Dias</p>
        <p className={`text-base font-medium leading-normal ${percentChange >= 0 ? 'text-galileo-positive' : 'text-galileo-negative'}`}>
          {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(0)}%
        </p>
      </div>
    </div>
  );
};

export default BalanceCard;
