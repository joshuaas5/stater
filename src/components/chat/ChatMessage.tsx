import React, { memo } from 'react';
import { Copy, Check, User, Bot, FileText, ImageIcon, Sparkles, ExternalLink } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    isTyping?: boolean;
    hasImage?: boolean;
    imageData?: string;
    metadata?: {
      type?: string;
      category?: string;
      amount?: number;
      ocrResults?: any[];
    };
  };
  isLast: boolean;
  onCopy: (text: string) => void;
  copiedMessageId: string | null;
  onImagePreview?: (imageData: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = memo(({
  message,
  isLast,
  onCopy,
  copiedMessageId,
  onImagePreview
}) => {
  const isBot = message.sender === 'bot';
  const isUser = message.sender === 'user';

  return (
    <div
      className={`message-container ${isBot ? 'bot-message' : 'user-message'} ${isLast ? 'last-message' : ''}`}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
        padding: '0 20px',
        alignItems: 'flex-start',
        gap: '12px'
      }}
    >
      {/* Avatar */}
      {isBot && (
        <div
          style={{
            width: '42px',
            height: '42px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            flexShrink: 0,
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
          }}
        >
          <Bot size={20} />
        </div>
      )}

      {/* Message Content */}
      <div
        style={{
          maxWidth: '75%',
          minWidth: '200px',
          position: 'relative'
        }}
      >
        {/* Message Bubble */}
        <div
          style={{
            background: isUser 
              ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
              : 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: isUser 
              ? 'none'
              : '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: isUser 
              ? '20px 20px 5px 20px'
              : '20px 20px 20px 5px',
            padding: '16px 20px',
            color: 'white',
            fontSize: '15px',
            lineHeight: '1.5',
            wordWrap: 'break-word',
            boxShadow: isUser 
              ? '0 4px 15px rgba(59, 130, 246, 0.3)'
              : '0 4px 15px rgba(0, 0, 0, 0.2)',
            position: 'relative'
          }}
        >
          {/* Image Preview */}
          {message.hasImage && message.imageData && (
            <div
              style={{
                marginBottom: '12px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer'
              }}
              onClick={() => onImagePreview?.(message.imageData!)}
            >
              <img
                src={`data:image/png;base64,${message.imageData}`}
                alt="Imagem enviada"
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  height: 'auto',
                  display: 'block'
                }}
              />
            </div>
          )}

          {/* Message Text */}
          <div
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {message.isTyping ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span style={{ opacity: 0.7 }}>Digitando...</span>
              </div>
            ) : (
              message.text
            )}
          </div>

          {/* Metadata */}
          {message.metadata && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                fontSize: '13px',
                opacity: 0.8
              }}
            >
              {message.metadata.type && (
                <div>📋 Tipo: {message.metadata.type}</div>
              )}
              {message.metadata.category && (
                <div>📁 Categoria: {message.metadata.category}</div>
              )}
              {message.metadata.amount && (
                <div>💰 Valor: R$ {message.metadata.amount.toFixed(2)}</div>
              )}
            </div>
          )}

          {/* Copy Button */}
          {!message.isTyping && (
            <button
              onClick={() => onCopy(message.text)}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px',
                color: 'white',
                cursor: 'pointer',
                opacity: 0.7,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7';
              }}
            >
              {copiedMessageId === message.id ? (
                <Check size={14} />
              ) : (
                <Copy size={14} />
              )}
            </button>
          )}
        </div>

        {/* Timestamp */}
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            marginTop: '4px',
            textAlign: isUser ? 'right' : 'left'
          }}
        >
          {message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div
          style={{
            width: '42px',
            height: '42px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            flexShrink: 0,
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <User size={20} />
        </div>
      )}

      {/* Typing Animation CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .typing-indicator {
            display: inline-flex;
            gap: 4px;
          }
          .typing-indicator span {
            width: 6px;
            height: 6px;
            background: currentColor;
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
          }
          .typing-indicator span:nth-child(1) {
            animation-delay: -0.32s;
          }
          .typing-indicator span:nth-child(2) {
            animation-delay: -0.16s;
          }
          @keyframes typing {
            0%, 80%, 100% {
              opacity: 0.3;
              transform: scale(0.8);
            }
            40% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `
      }} />
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export default ChatMessage;
