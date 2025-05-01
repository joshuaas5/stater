
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { isLoggedIn } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';

const suggestions = [
  "Como posso economizar mais?",
  "Quais são meus maiores gastos?",
  "Como criar um orçamento?",
  "Devo investir ou pagar dívidas?",
  "Como reduzir gastos com alimentação?",
  "Quanto devo guardar por mês?"
];

const FinancialAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);
  
  const handleSuggestionClick = (suggestion: string) => {
    // Implementar a lógica para usar a sugestão
    setShowSuggestions(false);
  };
  
  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Consultor Financeiro" showSearch={false} />
      
      <div className="px-4 pt-2 pb-16">
        <ChatMessages />
        
        {showSuggestions && (
          <div className="mb-4">
            <h3 className="text-galileo-text font-semibold mb-2">Experimente perguntar:</h3>
            <div className="grid grid-cols-2 gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto py-2 px-3 text-left text-sm whitespace-normal bg-galileo-accent text-galileo-text border-galileo-border"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
        
        <ChatInput />
      </div>
      
      <NavBar />
    </div>
  );
};

export default FinancialAdvisorPage;
