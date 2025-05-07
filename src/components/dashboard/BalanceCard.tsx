
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/utils/dataProcessing';
import { useBalanceVisibility } from '@/hooks/use-balance-visibility';

interface BalanceCardProps {
  balance: number;
  percentChange: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ balance, percentChange }) => {
  const { isBalanceVisible, toggleBalanceVisibility } = useBalanceVisibility();
  
  return (
    <div className="card-balance animate-fade-in relative">
      <button 
        onClick={toggleBalanceVisibility} 
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-galileo-accent transition-colors"
        aria-label={isBalanceVisible ? "Ocultar saldo" : "Mostrar saldo"}
      >
        {isBalanceVisible ? (
          <Eye size={18} className="text-galileo-secondaryText" />
        ) : (
          <EyeOff size={18} className="text-galileo-secondaryText" />
        )}
      </button>
      <p className="text-galileo-secondaryText text-base font-medium leading-normal">Saldo da Conta</p>
      <p className="text-galileo-text text-[32px] font-bold leading-tight truncate">
        {isBalanceVisible ? formatCurrency(balance) : "••••••"}
      </p>
      <div className="flex gap-1">
        <p className="text-galileo-secondaryText text-base font-normal leading-normal">Últimos 30 Dias</p>
        {isBalanceVisible ? (
          <p className={`text-base font-medium leading-normal ${percentChange >= 0 ? 'text-galileo-positive' : 'text-galileo-negative'}`}>
            {percentChange >= 0 ? '+' : ''}{percentChange.toFixed(0)}%
          </p>
        ) : (
          <p className="text-galileo-secondaryText text-base font-medium leading-normal">••••</p>
        )}
      </div>
    </div>
  );
};

export default BalanceCard;
