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
    <div className="flex-1 overflow-y-auto p-1 space-y-1">
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
            <div className={`text-sm leading-relaxed whitespace-pre-wrap prose dark:prose-invert ${message.sender === 'system' ? 'mb-1 space-y-1' : ''}`}>
              <ReactMarkdown>
                {message.text || ''}
              </ReactMarkdown>
            </div>
            {message.sender === 'system' && transactions && transactions.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium opacity-90">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Transações identificadas</span>
                </div>
                <div className="grid gap-2">
                  {transactions.map((tx, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm hover:bg-white/15 transition-all duration-200">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full ${tx.type === 'income' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{tx.title}</p>
                          <p className="text-xs opacity-75">{tx.type === 'income' ? 'Receita' : 'Despesa'}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                        tx.type === 'income' 
                          ? 'text-green-100 bg-green-600/80' 
                          : 'text-red-100 bg-red-600/80'
                      }`}>
                        {formatCurrency(tx.type === 'expense' ? -Math.abs(tx.amount) : Math.abs(tx.amount))}
                      </div>
                    </div>
                  ))}
                </div>
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
