
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
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div
            className={
              message.sender === 'user'
                ? 'max-w-[80%] rounded-2xl rounded-br-sm px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-sm animate-fade-in'
                : 'max-w-[80%] rounded-2xl rounded-tl-sm px-4 py-3 bg-white shadow-sm border border-indigo-100 text-gray-700 animate-fade-in'
            }
          >
            <p className="text-sm leading-relaxed">{message.text}</p>
            {message.sender === 'system' && transactions && transactions.length > 0 && (
              <div className="mt-2 pt-2 space-y-1.5 border-t border-indigo-100/30">
                <p className="font-medium text-xs opacity-90">Transações identificadas:</p>
                {transactions.map((tx, index) => (
                  <div key={index} className="flex justify-between items-center text-xs bg-white/20 rounded-lg px-3 py-1.5">
                    <span className="font-medium">{tx.title}</span>
                    <span className={
                      tx.type === 'income' 
                        ? 'text-green-100 bg-green-500/30 px-2 py-0.5 rounded-full font-medium' 
                        : 'text-red-100 bg-red-500/30 px-2 py-0.5 rounded-full font-medium'
                    }>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span className="text-[10px] text-gray-500 mt-1 px-1">
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
