// Versão temporária do FinancialAdvisorPage sem código problemático
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/navigation/NavBar';
import ChatInput from '@/components/chat/ChatInputSimple';
import { isLoggedIn, saveTransaction as saveTransactionUtil, getCurrentUser } from '@/utils/localStorage';
import { ChatMessage, Transaction } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from '@/hooks/use-translation';
import { fetchGeminiFlashLite } from '@/utils/gemini';
import { supabase } from '@/lib/supabase';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useErrorHandler, useNetworkStatus } from '@/hooks/useErrorHandler';
import { ErrorType } from '@/utils/errorHandler';
import ErrorBoundary from '@/components/ErrorBoundary';

const INITIAL_SYSTEM_MESSAGE_TEXT = "Olá! Sou o ICTUS, seu assistente financeiro pessoal. Posso ajudá-lo com análises de gastos, extratos e dicas para economizar. Como posso ajudar hoje?";

export const FinancialAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { handleError } = useErrorHandler();
  const { isOnline } = useNetworkStatus();
  
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: uuidv4(),
    text: INITIAL_SYSTEM_MESSAGE_TEXT,
    sender: "system",
    timestamp: new Date()
  }]);
  
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Verificar autenticação
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    const user = getCurrentUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  }, [navigate]);

  // Scroll para o final das mensagens
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Função para enviar mensagem para Gemini
  const getGeminiResponse = async (prompt: string): Promise<string> => {
    try {
      if (!isOnline) {
        return 'Você está offline. Conecte-se à internet para usar a IA.';
      }
      
      const response = await fetchGeminiFlashLite(prompt);
      if (!response || response.length < 2) {
        return 'Desculpe, não consegui encontrar uma resposta adequada. Pode reformular sua pergunta?';
      }
      return response;
    } catch (error) {
      handleError(error as Error, {
        type: ErrorType.API,
        context: { operation: 'gemini_request' }
      });
      return 'Houve um erro ao acessar a IA. Tente novamente em instantes.';
    }
  };

  // Função para enviar mensagem
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || loading) return;

    setLoading(true);
    
    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: uuidv4(),
      text: message,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Obter resposta da IA
      const aiResponse = await getGeminiResponse(message);
      
      // Adicionar resposta da IA
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        text: aiResponse,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      handleError(error as Error, {
        type: ErrorType.NETWORK,
        context: { operation: 'send_message' }
      });
      
      // Adicionar mensagem de erro
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        text: "Desculpe, ocorreu um erro. Tente novamente.",
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Função para upload de imagem
  const handleImageUpload = async (imageBase64: string) => {
    if (!imageBase64) return;
    
    setLoading(true);
    
    try {
      // Processar imagem com IA
      const prompt = `Analise esta imagem de extrato bancário e extraia as transações. Imagem: ${imageBase64}`;
      const response = await getGeminiResponse(prompt);
      
      // Adicionar resposta da IA
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        text: response,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      handleError(error as Error, {
        type: ErrorType.API,
        context: { operation: 'image_upload' }
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para áudio
  const handleAudioMessage = async (audioBlob: Blob) => {
    setLoading(true);
    
    try {
      // Simular processamento de áudio
      const response = await getGeminiResponse("Processando áudio...");
      
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        text: response,
        sender: "assistant",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      handleError(error as Error, {
        type: ErrorType.API,
        context: { operation: 'audio_processing' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="financial-advisor-page">
        <NavBar />
        
        <div className="container mx-auto p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="transactions">Transações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="space-y-4">
              <div className="chat-container min-h-[400px] max-h-[600px] overflow-y-auto p-4 border rounded-lg">
                {messages.map((message) => (
                  <div key={message.id} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block p-3 rounded-lg max-w-xs ${
                      message.sender === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      <p>{message.text}</p>
                      <small className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </small>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-500">Digitando...</span>
                  </div>
                )}
                <div ref={messagesEndRef} style={{ height: '1px' }} />
              </div>
              
              <ChatInput
                onSubmit={handleSendMessage}
                onImageUpload={handleImageUpload}
                loading={loading}
                waitingConfirmation={false}
                pendingActionDetails={null}
                onConfirm={() => {}}
                onCancel={() => {}}
                onAudioSend={handleAudioMessage}
                isProcessingAudio={false}
                audioLimits={{
                  canUseAudio: () => true,
                  usage: { warningLevel: 'normal', remainingDaily: 10 }
                }}
              />
            </TabsContent>
            
            <TabsContent value="transactions" className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold mb-2">Transações</h3>
                <p className="text-gray-600">
                  Suas transações aparecerão aqui após serem processadas pelo chat.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default FinancialAdvisorPage;
