import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/types';
import { formatCurrency } from '@/utils/dataProcessing';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ChatMessagesProps {
  messages: ChatMessage[];
  transactions?: {
    title: string;
    amount: number;
    type: 'income' | 'expense';
  }[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  iaAvatar?: string;
  userAvatar?: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, transactions, messagesEndRef, iaAvatar, userAvatar }) => {
  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-end gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <Avatar className="h-8 w-8 shadow-sm">
            <AvatarImage src={message.sender === 'user' ? userAvatar : iaAvatar} alt={message.sender === 'user' ? 'User' : 'IA'} />
            <AvatarFallback>{message.sender === 'user' ? 'U' : 'IA'}</AvatarFallback>
          </Avatar>

          <div
            className={`
              max-w-[75%] rounded-2xl px-4 py-3 animate-fade-in
              ${message.sender === 'user'
                ? 'bg-primary text-primary-foreground shadow-md rounded-br-none'
                : 'bg-card text-card-foreground shadow-md border border-border rounded-bl-none'
              }
            `}
          >
            <ReactMarkdown
              className={`text-sm leading-relaxed whitespace-pre-wrap prose dark:prose-invert ${message.sender === 'system' ? 'mb-4 space-y-2' : ''}`}
            >
              {message.text || ''}
            </ReactMarkdown>
            {message.sender === 'system' && transactions && transactions.length > 0 && (
              <div className="mt-2 pt-2 space-y-1.5 border-t border-primary-foreground/30">
                <p className="font-medium text-xs opacity-90">Transações identificadas:</p>
                {transactions.map((tx, index) => (
                  <div key={index} className="flex justify-between items-center text-xs bg-background/20 rounded-lg px-3 py-1.5">
                    <span className="font-medium">{tx.title}</span>
                    <span className={
                      tx.type === 'income' 
                        ? 'text-green-300 bg-green-700/50 px-2 py-0.5 rounded-full font-medium' 
                        : 'text-red-300 bg-red-700/50 px-2 py-0.5 rounded-full font-medium'
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
        <div ref={messagesEndRef} />
      </div>
  );
};

export default ChatMessages;
