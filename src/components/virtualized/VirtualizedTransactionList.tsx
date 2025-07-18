import React, { memo, useMemo, useCallback } from 'react';
import { useVirtualizedList } from '../../hooks/useScrollOptimization';
import { Card, CardContent } from '@/components/ui/card';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VirtualizedTransactionListProps {
  transactions: Transaction[];
  height?: number;
  itemHeight?: number;
  className?: string;
}

const TransactionItem = memo(({ 
  transaction, 
  style 
}: { 
  transaction: Transaction; 
  style: React.CSSProperties;
}) => {
  const isExpense = transaction.type === 'expense';
  
  return (
    <div style={style} className="p-2">
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-medium text-sm">
                {transaction.title || 'Transação sem descrição'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {transaction.category} • {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
              </div>
            </div>
            <div className={`font-semibold text-sm ${
              isExpense ? 'text-red-600' : 'text-green-600'
            }`}>
              {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

TransactionItem.displayName = 'TransactionItem';

const VirtualizedTransactionList = memo<VirtualizedTransactionListProps>(({
  transactions,
  height = 400,
  itemHeight = 100,
  className = ''
}) => {
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions]);

  const { containerRef, visibleRange, handleScroll, totalHeight } = useVirtualizedList(
    sortedTransactions,
    itemHeight,
    height,
    3 // overscan
  );

  const renderItem = useCallback((transaction: Transaction, index: number) => {
    const style: React.CSSProperties = {
      position: 'absolute',
      top: index * itemHeight,
      left: 0,
      right: 0,
      height: itemHeight,
    };

    return (
      <TransactionItem
        key={`${transaction.id}-${index}`}
        transaction={transaction}
        style={style}
      />
    );
  }, [itemHeight]);

  if (sortedTransactions.length === 0) {
    return (
      <div className={`flex items-center justify-center h-32 text-muted-foreground ${className}`}>
        Nenhuma transação encontrada
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`overflow-auto scroll-smooth ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleRange.visibleItems.map((transaction: Transaction, i: number) => 
          renderItem(transaction, visibleRange.start + i)
        )}
      </div>
    </div>
  );
});

VirtualizedTransactionList.displayName = 'VirtualizedTransactionList';

export default VirtualizedTransactionList;
