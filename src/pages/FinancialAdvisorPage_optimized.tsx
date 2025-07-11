import React, { useEffect, useState, useRef, useCallback, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/navigation/NavBar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { TransactionList } from '@/components/ocr/TransactionList';
import { isLoggedIn, saveTransaction as saveTransactionUtil, getCurrentUser, saveUser } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { ChatMessage, Transaction } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from '@/hooks/use-translation';
import { fetchGeminiFlashLite, GeminiTransactionIntent } from '@/utils/gemini';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Send, ShoppingCart, DollarSign, Plus, Edit3, Trash2, Upload, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

// Interfaces
interface PendingAction {
  tipo: string;
  dados: any;
}

// Constantes
const IA_AVATAR = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face";
const SYSTEM_USER_ID = 'system';
const ASSISTANT_USER_ID = 'assistant';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const INITIAL_SYSTEM_MESSAGE_TEXT = `🤖 **Olá! Sou Stater IA, seu assistente financeiro inteligente.**

✨ **O que posso fazer:**
• Analisar extratos e documentos financeiros
• Registrar receitas/despesas automaticamente  
• Fornecer dicas personalizadas de economia
• Controlar contas e planejamento financeiro

💡 **Como usar:** Envie documentos, fotos ou faça perguntas sobre suas finanças. Sempre confirmo antes de salvar dados!

Como posso ajudá-lo hoje?`;

// Componente MessageItem memoizado para melhor performance
const MessageItem = memo<{
  message: ChatMessage;
  index: number;
  isSystemProcessing: boolean;
}>(({ message, index, isSystemProcessing }) => {
  const formatTimestamp = useCallback((timestamp: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'agora';
    if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `há cerca de ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
  }, []);

  const getProcessingIcon = useCallback((content: string): string => {
    if (content.includes('PDF')) return '📄';
    if (content.includes('imagem')) return '📷';
    if (content.includes('texto')) return '📝';
    return '🔍';
  }, []);

  const getProcessingDetails = useCallback((content: string): string => {
    return '📄 Analisando documento...';
  }, []);

  const formatMessageContent = useCallback((content: string): React.ReactNode => {
    const processText = (text: string): React.ReactNode[] => {
      const parts: React.ReactNode[] = [];
      let currentIndex = 0;
      
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      
      while ((match = boldRegex.exec(text)) !== null) {
        if (match.index > currentIndex) {
          parts.push(text.slice(currentIndex, match.index));
        }
        
        parts.push(
          <strong key={`bold-${match.index}`} style={{ fontWeight: '700' }}>
            {match[1]}
          </strong>
        );
        
        currentIndex = match.index + match[0].length;
      }
      
      if (currentIndex < text.length) {
        parts.push(text.slice(currentIndex));
      }
      
      return parts;
    };
    
    if (content.includes('\n')) {
      return content.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {processText(line)}
          {index < content.split('\n').length - 1 && <br />}
        </React.Fragment>
      ));
    }
    
    return processText(content);
  }, []);

  return (
    <React.Fragment>
      {/* Timestamp */}
      <div 
        className="timestamp"
        style={{
          textAlign: 'center',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.5)',
          margin: '10px 0'
        }}
      >
        {formatTimestamp(message.timestamp)}
      </div>

      {/* Processing Message */}
      {isSystemProcessing && (
        <div 
          className="processing-message"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(15px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '20px',
            maxWidth: '80%',
            alignSelf: 'flex-start'
          }}
        >
          <div 
            className="processing-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}
          >
            <div 
              className="processing-icon"
              style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}
            ></div>
            <div 
              className="processing-title"
              style={{
                fontWeight: 600,
                fontSize: '16px'
              }}
            >
              {getProcessingIcon(message.text)} {message.text}
            </div>
          </div>
          <div 
            className="processing-details"
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '8px'
            }}
          >
            {getProcessingDetails(message.text)}
          </div>
          <div 
            className="processing-note"
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              fontStyle: 'italic'
            }}
          >
            Aguarde, não recarregue a página...
          </div>
        </div>
      )}

      {/* Regular Messages */}
      {!isSystemProcessing && (
        <div 
          className={`message ${message.sender}`}
          style={{
            display: 'flex',
            flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '20px'
          }}
        >
          {/* Avatar */}
          {(message.sender === 'assistant' || message.sender === 'system') && (
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: message.avatarUrl 
                  ? `url(${message.avatarUrl}) center/cover` 
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 'bold',
                flexShrink: 0
              }}
            >
              {!message.avatarUrl && '🤖'}
            </div>
          )}

          {/* Message Content */}
          <div 
            className={`message-content ${message.sender}`} 
            style={{ 
              maxWidth: '75%',
              padding: '16px 20px',
              fontSize: '15px',
              lineHeight: '1.5',
              wordWrap: 'break-word',
              background: message.sender === 'user' 
                ? 'rgba(255, 255, 255, 0.15)' 
                : 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(15px)',
              border: `1px solid rgba(255, 255, 255, 0.2)`,
              alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
              borderRadius: message.sender === 'user' 
                ? '20px 20px 6px 20px' 
                : '20px 20px 20px 6px'
            }}
          >
            {formatMessageContent(message.text)}
          </div>
        </div>
      )}
    </React.Fragment>
  );
});

export const FinancialAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Estados consolidados
  const [messages, setMessages] = useState<ChatMessage[]>(() => [{
    id: uuidv4(),
    text: INITIAL_SYSTEM_MESSAGE_TEXT,
    sender: "system" as const,
    timestamp: new Date()
  }]);

  const [loading, setLoading] = useState(false);
  const [savingTransactions, setSavingTransactions] = useState(false);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const [editableTransactions, setEditableTransactions] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("chat");
  
  // Estados para funcionalidades de voz
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Funções callback otimizadas
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, []);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const updateLastMessage = useCallback((updater: (msg: ChatMessage) => ChatMessage) => {
    setMessages(prev => {
      const newMessages = [...prev];
      const lastIndex = newMessages.length - 1;
      if (lastIndex >= 0) {
        newMessages[lastIndex] = updater(newMessages[lastIndex]);
      }
      return newMessages;
    });
  }, []);

  // Memoização das mensagens para evitar re-renderizações
  const memoizedMessages = useMemo(() => messages, [messages]);
  const messagesCount = useMemo(() => messages.length, [messages]);

  // Scroll automático quando novas mensagens chegam
  useEffect(() => {
    scrollToBottom();
  }, [messagesCount, scrollToBottom]);

  // Inicialização de voz otimizada
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';
      
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      
      setSpeechRecognition(recognition);
    }

    if ('speechSynthesis' in window) {
      setSpeechSynthesis(window.speechSynthesis);
      setVoiceEnabled(true);
    }
  }, []);

  // Placeholder para outras funções que serão mantidas do arquivo original
  const handleSendMessage = useCallback((message: string) => {
    // Implementação será mantida do arquivo original
    console.log('Sending message:', message);
  }, []);

  const handleImageUpload = useCallback((file: File) => {
    // Implementação será mantida do arquivo original
    console.log('Uploading image:', file.name);
  }, []);

  return (
    <>
      <div 
        className="financial-advisor-page"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
          minHeight: '100vh',
          width: '100vw',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: '0px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div 
          className="header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '12px 30px',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1001,
            height: '60px'
          }}
        >
          <div 
            className="logo"
            style={{
              fontSize: '24px',
              fontWeight: 800,
              color: '#ffffff',
              fontFamily: '"Fredoka One", "Comic Sans MS", "Poppins", sans-serif',
              letterSpacing: '1px',
              textShadow: '2px 2px 0px #3b82f6, 4px 4px 0px #1d4ed8, 0 0 20px rgba(59, 130, 246, 0.8), 0 2px 8px rgba(0, 0, 0, 0.6)',
              textTransform: 'uppercase',
              position: 'relative',
              filter: 'drop-shadow(0 3px 6px rgba(0, 0, 0, 0.5))'
            }}
          >
            Stater IA
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '20px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            ← Voltar
          </button>
        </div>

        {/* Chat Container */}
        <div 
          className="chat-container"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '70px 20px 90px',
            overflow: 'hidden'
          }}
        >
          {/* Chat Messages */}
          <div 
            className="chat-messages"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px'
            }}
          >
            {/* Error Message */}
            {error && (
              <div 
                className="message assistant" 
                style={{ 
                  maxWidth: '70%',
                  padding: '16px 20px',
                  fontSize: '15px',
                  lineHeight: '1.5',
                  wordWrap: 'break-word',
                  background: 'rgba(239, 68, 68, 0.2)',
                  backdropFilter: 'blur(15px)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  alignSelf: 'flex-start',
                  borderRadius: '20px 20px 20px 6px'
                }}
              >
                ❌ {error}
              </div>
            )}

            {/* Messages - Otimizado */}
            {memoizedMessages.map((message, index) => (
              <MessageItem
                key={`${message.id}-${index}`}
                message={message}
                index={index}
                isSystemProcessing={message.sender === 'system' && message.text.includes('Processando')}
              />
            ))}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} style={{ height: '1px' }} />
          </div>

          {/* Chat Input */}
          <ChatInput
            onSubmit={handleSendMessage} 
            onImageUpload={handleImageUpload}
            loading={loading}
            waitingConfirmation={waitingConfirmation} 
            pendingActionDetails={pendingAction ? pendingAction.dados : null} 
            onConfirm={() => handleSendMessage('sim')} 
            onCancel={() => handleSendMessage('não')} 
          />
        </div>

        {/* CSS animations */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            ::-webkit-scrollbar {
              width: 8px;
            }
            ::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.3);
              border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.5);
            }
            
            .financial-advisor-page {
              overflow-x: hidden !important;
            }
            
            .chat-messages {
              scrollbar-width: thin;
              scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
            }
          `
        }} />
      </div>
    </>
  );
};

export default FinancialAdvisorPage;
