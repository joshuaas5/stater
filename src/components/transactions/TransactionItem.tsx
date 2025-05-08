
import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/dataProcessing';
import { CreditCard, TrendingUp, CalendarRange } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TransactionItemProps {
  transaction: Transaction;
  onEditClick?: (transaction: Transaction) => void;
  onDeleteClick?: (transaction: Transaction) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onEditClick, onDeleteClick }) => {
  // Format recurring day display
  const recurringInfo = transaction.isRecurring && transaction.recurringDay
    ? `Todo dia ${transaction.recurringDay}`
    : 'Recorrente';

  return (
    <div className="flex items-center gap-4 w-full">
      <div 
        className="text-galileo-text flex items-center justify-center rounded-lg bg-galileo-accent shrink-0 size-12 cursor-pointer hover:bg-galileo-accent/80 transition-colors border-2 border-dashed border-galileo-border hover:border-solid hover:border-galileo-text relative after:content-['✏️'] after:absolute after:-top-1 after:-right-1 after:bg-galileo-text after:text-[10px] after:text-galileo-background after:px-0.5 after:rounded-full after:scale-75 hover:after:scale-100 after:transition-transform"
        onClick={() => onEditClick && onEditClick(transaction)}
        title="Clique para editar transação"
      >
        {transaction.icon ? (
          <span className="text-2xl">{transaction.icon}</span>
        ) : transaction.isRecurring ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <CalendarRange size={24} />
              </TooltipTrigger>
              <TooltipContent>
                <p>{recurringInfo}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : transaction.type === 'income' ? (
          <TrendingUp size={24} />
        ) : (
          <CreditCard size={24} />
        )}
      </div>
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-galileo-text text-base font-medium leading-normal truncate max-w-[180px]">
            {transaction.title}
          </p>
          <p className={`text-base font-normal leading-normal ${
            transaction.type === 'income' ? 'text-galileo-positive' : 'text-galileo-negative'
          }`}>
            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
          </p>
        </div>
        <div className="flex items-center">
          <p className="text-galileo-secondaryText text-sm font-normal leading-normal truncate">
            {transaction.category}
          </p>
          {transaction.isRecurring && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-galileo-accent text-galileo-text rounded-md">
              {transaction.recurringDay ? `Dia ${transaction.recurringDay}` : 'Recorrente'}
            </span>
          )}
        </div>
      </div>
      {onDeleteClick && (
        <button
          className="ml-2 text-galileo-negative hover:text-red-700 transition-colors"
          title="Remover transação"
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onDeleteClick && onDeleteClick(transaction);
          }}
          data-testid={`delete-transaction-btn-${transaction.id}`}
        >
          🗑️
        </button>
      )}
    </div>
  );
};

export default TransactionItem;
