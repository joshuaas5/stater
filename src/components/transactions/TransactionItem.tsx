
import React from 'react';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/dataProcessing';
import { CreditCard, ShoppingCart, Home, Coffee, CameraOff } from 'lucide-react';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  // Função para selecionar o ícone com base na categoria
  const getIconByCategory = () => {
    switch (transaction.category.toLowerCase()) {
      case 'moradia':
      case 'casa':
      case 'apartamento':
      case 'aluguel':
        return <Home className="text-galileo-text" size={24} />;
      case 'alimentação':
      case 'comida':
      case 'restaurante':
      case 'mercado':
        return <Coffee className="text-galileo-text" size={24} />;
      case 'dívidas':
      case 'cartão':
      case 'cartão de crédito':
        return <CreditCard className="text-galileo-text" size={24} />;
      default:
        return <ShoppingCart className="text-galileo-text" size={24} />;
    }
  };

  return (
    <div className="flex items-center gap-4 bg-galileo-background px-4 min-h-[72px] py-2 justify-between border-b border-galileo-border">
      <div className="flex items-center gap-4">
        <div className="text-galileo-text flex items-center justify-center rounded-lg bg-galileo-accent shrink-0 size-12">
          {getIconByCategory()}
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-galileo-text text-base font-medium leading-normal line-clamp-1">
            {transaction.title}
          </p>
          <p className="text-galileo-secondaryText text-sm font-normal leading-normal line-clamp-2">
            {new Date(transaction.date).toLocaleDateString('pt-BR')}
          </p>
        </div>
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
