
import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/dataProcessing';
import { CalendarRange, TrendingUp, CreditCard } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
  onClick?: () => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onClick }) => {
  return (
    <div className="flex items-center gap-4 flex-1" onClick={onClick}>
      <div className="text-galileo-text flex items-center justify-center rounded-lg bg-galileo-accent shrink-0 size-12">
        {transaction.isRecurring ? 
          <CalendarRange size={24} /> : 
          (transaction.type === 'income' ? <TrendingUp size={24} /> : <CreditCard size={24} />)
        }
      </div>
      
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <p className="text-galileo-text text-base font-medium leading-normal truncate">
          {transaction.title}
        </p>
        <p className="text-galileo-secondaryText text-sm font-normal leading-normal truncate">
          {transaction.category} {transaction.isRecurring && '(Recorrente)'}
        </p>
      </div>
      
      <div className="shrink-0">
        <p className={`text-base font-normal leading-normal ${
          transaction.type === 'income' ? 'text-galileo-positive' : 'text-galileo-negative'
        }`}>
          {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
        </p>
      </div>
    </div>
  );
};

export default TransactionItem;
