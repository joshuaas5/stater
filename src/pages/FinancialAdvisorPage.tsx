
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { isLoggedIn } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from '@/hooks/use-translation';

const FinancialAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      text: "Olá! Eu sou seu consultor financeiro. Como posso ajudar você hoje?",
      sender: "system",
      timestamp: new Date()
    }
  ]);
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);
  
  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
    setShowSuggestions(false);
  };
  
  const handleSendMessage = (message: string) => {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      text: message,
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Simulate advisor response after a short delay
    setTimeout(() => {
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: `Em breve terei uma resposta personalizada para: "${message}"`,
        sender: "system",
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
    }, 1000);
  };
  
  const suggestions = [
    { key: "howToSaveMore", text: t("howToSaveMore") },
    { key: "biggestExpenses", text: t("biggestExpenses") },
    { key: "createBudget", text: t("createBudget") },
    { key: "investOrPayDebt", text: t("investOrPayDebt") },
    { key: "reduceFoodExpenses", text: t("reduceFoodExpenses") },
    { key: "howMuchToSave", text: t("howMuchToSave") }
  ];
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title={t('financialAdvisor')} showSearch={false} />
      
      <div className="px-4 pt-2 pb-16">
        <ChatMessages 
          messages={messages} 
        />
        
        {showSuggestions && (
          <div className="mb-4">
            <h3 className="text-galileo-text font-semibold mb-2">{t('askSomething')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-2 px-3 text-left text-sm whitespace-normal bg-galileo-accent text-galileo-text border-galileo-border line-clamp-2"
                  onClick={() => handleSuggestionClick(suggestion.text)}
                >
                  {suggestion.text}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <ChatInput 
          onSubmit={handleSendMessage} 
        />
      </div>
      
      <NavBar />
    </div>
  );
};

export default FinancialAdvisorPage;
