import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '@/types';
import { formatCurrency } from '@/utils/dataProcessing';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingState } from '@/components/ui/loading-states';

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

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  transactions, 
  messagesEndRef, 
  iaAvatar, 
  userAvatar
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-end gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <Avatar className="h-8 w-8 shadow-sm" style={{ background: 'transparent !important' }}>
            <AvatarImage src={message.sender === 'user' ? userAvatar : iaAvatar} alt={message.sender === 'user' ? 'User' : 'IA'} />
            <AvatarFallback 
              className="bg-transparent text-white border-0" 
              style={{ 
                background: 'transparent !important', 
                backgroundColor: 'transparent !important',
                border: 'none !important',
                boxShadow: 'none !important'
              }}
            >
              {message.sender === 'user' ? (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  U
                </div>
              ) : (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ 
                    background: 'transparent !important',
                    backgroundColor: 'transparent !important'
                  }}
                >
                  <img 
                    src="/stater-logo.png" 
                    alt="Stater" 
                    className="w-6 h-6" 
                    style={{
                      background: 'transparent !important',
                      backgroundColor: 'transparent !important',
                      border: 'none !important',
                      outline: 'none !important',
                      boxShadow: 'none !important',
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                    }}
                  />
                </div>
              )}
            </AvatarFallback>
          </Avatar>

          <div
            className={`
              max-w-[75%] rounded-2xl px-4 py-3
              ${message.sender === 'user'
                ? 'bg-primary text-primary-foreground shadow-md rounded-br-none'
                : message.sender === 'system'
                ? 'bg-white text-gray-800 shadow-md border border-gray-200 rounded-bl-none'
                : 'bg-card text-card-foreground shadow-md border border-border rounded-bl-none'
              }
            `}
          >
            <div className={`text-sm leading-relaxed whitespace-pre-wrap prose dark:prose-invert ${message.sender === 'system' ? 'mb-2 space-y-2' : ''}`}>
              <ReactMarkdown>
                {message.text || ''}
              </ReactMarkdown>
            </div>
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
                      {formatCurrency(tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
      
      {/* Loading message removido - não é mais necessário */}
      
      <div ref={messagesEndRef} />
      </div>
  );
};

export default ChatMessages;
