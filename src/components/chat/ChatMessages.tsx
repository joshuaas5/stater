
import React from 'react';
import { ChatMessage } from '@/types';
import { formatCurrency } from '@/utils/dataProcessing';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatMessagesProps {
  messages: ChatMessage[];
  transactions?: {
    title: string;
    amount: number;
    type: 'income' | 'expense';
  }[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, transactions }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col ${
            message.sender === 'user' 
              ? 'items-end' 
              : 'items-start'
          }`}
        >
          <div
            className={`max-w-[80%] rounded-2xl p-3 ${
              message.sender === 'user'
                ? 'bg-galileo-accent text-white rounded-tr-none'
                : 'bg-galileo-card text-galileo-text rounded-tl-none'
            }`}
          >
            <p>{message.text}</p>
            
            {message.sender === 'system' && transactions && transactions.length > 0 && (
              <div className="mt-2 border-t border-galileo-border pt-2 space-y-2">
                <p className="font-medium text-sm">Transações identificadas:</p>
                {transactions.map((tx, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{tx.title}</span>
                    <span className={tx.type === 'income' ? 'text-galileo-positive' : 'text-galileo-negative'}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="text-xs text-galileo-secondaryText mt-1">
            {formatDistanceToNow(new Date(message.timestamp), { 
              addSuffix: true,
              locale: ptBR 
            })}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
