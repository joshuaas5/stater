
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
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div
            className={
              'max-w-[80%] rounded-md px-3 py-2 bg-gray-50 text-gray-800 border border-gray-200 text-sm'
            }
          >
            <p>{message.text}</p>
            {message.sender === 'system' && transactions && transactions.length > 0 && (
              <div className="mt-1 border-t border-gray-100 pt-1 space-y-1">
                <p className="font-medium text-xs">Transações identificadas:</p>
                {transactions.map((tx, index) => (
                  <div key={index} className="flex justify-between items-center text-xs">
                    <span>{tx.title}</span>
                    <span className={tx.type === 'income' ? 'text-green-600' : 'text-red-500'}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5">
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
