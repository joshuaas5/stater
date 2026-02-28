// src/components/transactions/OptimizedTransactionItem.tsx
import React, { memo, useMemo, useCallback } from 'react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/dataProcessing';
import { CreditCard, TrendingUp, CalendarRange } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OptimizedTransactionItemProps {
  transaction: Transaction;
  onEditClick?: (transaction: Transaction) => void;
  onDeleteClick?: (transaction: Transaction) => void;
  showDeleteButton?: boolean;
  showEditButton?: boolean;
}

// Componente de ícone memoizado
const TransactionIcon = memo(({ transaction }: { transaction: Transaction }) => {
  const iconContent = useMemo(() => {
    if (transaction.isRecurring) {
      const recurringInfo = transaction.recurringDay
        ? `Todo dia ${transaction.recurringDay}`
        : 'Recorrente';
      
      return (
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
      );
    }
    
    return transaction.type === 'income' ? (
      <TrendingUp size={24} />
    ) : (
      <CreditCard size={24} />
    );
  }, [transaction.isRecurring, transaction.recurringDay, transaction.type]);

  return <>{iconContent}</>;
});

TransactionIcon.displayName = 'TransactionIcon';

// Componente de valor memoizado
const TransactionAmount = memo(({ transaction }: { transaction: Transaction }) => {
  const formattedAmount = useMemo(() => {
    const amount = transaction.type === 'expense' 
      ? -Math.abs(transaction.amount) 
      : Math.abs(transaction.amount);
    return formatCurrency(amount);
  }, [transaction.amount, transaction.type]);

  const colorClass = useMemo(() => {
    return transaction.type === 'income' ? 'text-galileo-positive' : 'text-galileo-negative';
  }, [transaction.type]);

  return (
    <p className={`text-base font-normal leading-normal ${colorClass}`}>
      {formattedAmount}
    </p>
  );
});

TransactionAmount.displayName = 'TransactionAmount';

// Componente de tags memoizado
const TransactionTags = memo(({ transaction }: { transaction: Transaction }) => {
  const recurringTag = useMemo(() => {
    if (!transaction.isRecurring) return null;
    
    const tagText = transaction.recurringDay ? `Dia ${transaction.recurringDay}` : 'Recorrente';
    
    return (
      <span className="ml-2 px-1.5 py-0.5 text-xs bg-galileo-accent text-galileo-text rounded-md">
        {tagText}
      </span>
    );
  }, [transaction.isRecurring, transaction.recurringDay]);

  return (
    <div className="flex items-center">
      <p className="text-galileo-secondaryText text-sm font-normal leading-normal truncate">
        {transaction.category}
      </p>
      {recurringTag}
    </div>
  );
});

TransactionTags.displayName = 'TransactionTags';

const OptimizedTransactionItem: React.FC<OptimizedTransactionItemProps> = memo(({ 
  transaction, 
  onEditClick, 
  onDeleteClick,
  showDeleteButton = true,
  showEditButton = true
}) => {
  // Memoizar handlers para evitar re-renders
  const handleEditClick = useCallback(() => {
    if (onEditClick) {
      onEditClick(transaction);
    }
  }, [onEditClick, transaction]);

  const handleDeleteClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onDeleteClick) {
      onDeleteClick(transaction);
    }
  }, [onDeleteClick, transaction]);

  // Memoizar classes CSS
  const editButtonClasses = useMemo(() => {
    return "text-galileo-text flex items-center justify-center rounded-lg bg-galileo-accent shrink-0 size-12 cursor-pointer hover:bg-galileo-accent/80 transition-colors border-2 border-dashed border-galileo-border hover:border-solid hover:border-galileo-text relative after:content-['✏️'] after:absolute after:-top-1 after:-right-1 after:bg-galileo-text after:text-[10px] after:text-galileo-background after:px-0.5 after:rounded-full after:scale-75 hover:after:scale-100 after:transition-transform";
  }, []);

  return (
    <div className="flex items-center gap-4 w-full">
      {showEditButton && (
        <div 
          className={editButtonClasses}
          onClick={handleEditClick}
          title="Clique para editar transação"
        >
          <TransactionIcon transaction={transaction} />
        </div>
      )}
      
      {!showEditButton && (
        <div className="text-galileo-text flex items-center justify-center rounded-lg bg-galileo-accent shrink-0 size-12">
          <TransactionIcon transaction={transaction} />
        </div>
      )}

      <div className="flex flex-col justify-center flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-galileo-text text-base font-medium leading-normal truncate max-w-[180px]">
            {transaction.title}
          </p>
          <TransactionAmount transaction={transaction} />
        </div>
        <TransactionTags transaction={transaction} />
      </div>

      {showDeleteButton && onDeleteClick && (
        <button
          className="ml-2 text-galileo-negative hover:text-red-700 transition-colors"
          title="Remover transação"
          onClick={handleDeleteClick}
          data-testid={`delete-transaction-btn-${transaction.id}`}
        >
          🗑️
        </button>
      )}
    </div>
  );
});

OptimizedTransactionItem.displayName = 'OptimizedTransactionItem';

export default OptimizedTransactionItem;
