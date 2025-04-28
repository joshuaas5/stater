
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import ChatInput from '@/components/chat/ChatInput';
import ChatMessages from '@/components/chat/ChatMessages';
import { ChatMessage } from '@/types';
import { processChat } from '@/utils/dataProcessing';
import { getCurrentUser, isLoggedIn } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [lastProcessedTransactions, setLastProcessedTransactions] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se o usuário está logado
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }

    // Adicionar mensagem inicial de boas-vindas
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: uuidv4(),
        text: "Olá! Digite suas receitas e despesas no formato 'descrição valor', por exemplo: 'salário 3000' ou 'mercado 300'.",
        sender: 'system',
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    }
  }, [navigate, messages.length]);

  const handleSendMessage = (text: string) => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: uuidv4(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Processar a mensagem para extrair transações
    try {
      const transactions = processChat(text, user.id);
      
      if (transactions.length > 0) {
        // Formatar as transações para exibição
        const transactionsSummary = transactions.map(t => ({
          title: t.title,
          amount: t.amount,
          type: t.type
        }));
        
        setLastProcessedTransactions(transactionsSummary);
        
        // Adicionar resposta do sistema
        const responseMessage: ChatMessage = {
          id: uuidv4(),
          text: `${transactions.length} ${transactions.length === 1 ? 'transação' : 'transações'} registrada${transactions.length === 1 ? '' : 's'} com sucesso!`,
          sender: 'system',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, responseMessage]);
        
        toast({
          title: "Transações Registradas",
          description: `${transactions.length} ${transactions.length === 1 ? 'transação' : 'transações'} ${transactions.length === 1 ? 'foi' : 'foram'} registrada${transactions.length === 1 ? '' : 's'}.`
        });
      } else {
        // Não foi possível identificar transações
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          text: "Não consegui identificar nenhuma transação. Por favor, tente novamente usando o formato 'descrição valor', como por exemplo: 'aluguel 1200' ou 'salário 3000'.",
          sender: 'system',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      
      // Mensagem de erro
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        text: "Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        sender: 'system',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="bg-galileo-background flex flex-col min-h-screen pb-16">
      <PageHeader title="Chat" showSearch={false} />
      
      <div className="flex-1 flex flex-col">
        <ChatMessages 
          messages={messages} 
          transactions={messages[messages.length - 1]?.sender === 'system' ? lastProcessedTransactions : undefined} 
        />
        <ChatInput onSubmit={handleSendMessage} />
      </div>
      
      <NavBar />
    </div>
  );
};

export default ChatPage;
