
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/navigation/NavBar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { isLoggedIn } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from '@/hooks/use-translation';
import { useTheme } from '@/contexts/ThemeContext';

const FinancialAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      text: `Olá! Eu sou o Consultor IA. Registre receitas e despesas aqui. Se quiser, pergunte sobre seu dinheiro.`,
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
  
  const handleSendMessage = async (message: string) => {
    const lowerMsg = message.trim().toLowerCase();
  
    // 1. Tentar registrar transação a partir do texto
    try {
      const { getCurrentUser } = await import('@/utils/localStorage');
      const { processChat } = await import('@/utils/dataProcessing');
      const user = getCurrentUser();
      if (user) {
        const transactions = processChat(message, user.id);
        if (transactions.length > 0) {
          // Formatar corretamente as transações registradas
          const { formatCurrency } = await import('@/utils/dataProcessing');
          
          // Pré-processamento para melhorar a formatação de categorias e títulos
          transactions.forEach(tx => {
            // Melhorar formatação do título - separar palavras coladas
            if (tx.title) {
              // Separar palavras usando expressão regular
              tx.title = tx.title.replace(/([a-z])([A-Z])/g, '$1 $2')
                               .replace(/([a-zA-Z])(\d)/g, '$1 $2')
                               .replace(/(\d)([a-zA-Z])/g, '$1 $2');
              // Capitalizar primeira letra
              tx.title = tx.title.charAt(0).toUpperCase() + tx.title.slice(1);
            }
            
            // Melhorar formatação da categoria
            if (tx.category) {
              // Separar palavras usando expressão regular
              tx.category = tx.category.replace(/([a-z])([A-Z])/g, '$1 $2')
                                   .replace(/([a-zA-Z])(\d)/g, '$1 $2')
                                   .replace(/(\d)([a-zA-Z])/g, '$1 $2');
              // Capitalizar primeira letra
              tx.category = tx.category.charAt(0).toUpperCase() + tx.category.slice(1);
            }
          });
          
          const summaries = transactions.map(tx => {
            const tipo = tx.type === 'income' ? 'entrada' : 'saída';
            return `✔️ ${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada: ${tx.title} - ${formatCurrency(tx.amount)} (${tx.category})`;
          }).join('\n');
          
          setMessages(prevMessages => [
            ...prevMessages,
            {
              id: uuidv4(),
              text: message,
              sender: "user",
              timestamp: new Date()
            },
            {
              id: uuidv4(),
              text: summaries,
              sender: "system",
              timestamp: new Date()
            }
          ]);
          return;
        }
      }
    } catch (e) {
      // Se der erro, segue fluxo normal
      console.error("Erro ao processar transação:", e);
    }
  
    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: uuidv4(),
      text: message,
      sender: "user",
      timestamp: new Date()
    };
  
    setMessages(prevMessages => [...prevMessages, userMessage]);
  
    // Mostrar mensagem de "pensando"
    const thinkingMsg: ChatMessage = {
      id: uuidv4(),
      text: "Pensando...",
      sender: "system",
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, thinkingMsg]);
  
    try {
      // Tentar obter resposta da API da Hugging Face
      const response = await fetch(
        "https://api-inference.huggingface.co/models/google/flan-t5-xxl",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ 
            inputs: `Dê uma resposta curta como um assistente financeiro pessoal sobre: ${message}` 
          })
        }
      );
  
      let data = await response.json();
      let aiResponse = "";
  
      if (Array.isArray(data) && data[0]?.generated_text) {
        aiResponse = data[0].generated_text.trim();
      } else if (typeof data === 'object' && data.generated_text) {
        aiResponse = data.generated_text.trim();
      } else {
        // Fallback para resposta genérica se a API falhar
        aiResponse = getDefaultResponse(lowerMsg);
      }
  
      // Substituir a mensagem "pensando" pela resposta da IA
      setMessages(prevMessages => [
        ...prevMessages.filter(m => m.id !== thinkingMsg.id),
        {
          id: uuidv4(),
          text: aiResponse,
          sender: "system",
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      console.error("Erro ao consultar a API:", error);
      // Substituir a mensagem "pensando" por uma resposta de fallback
      setMessages(prevMessages => [
        ...prevMessages.filter(m => m.id !== thinkingMsg.id),
        {
          id: uuidv4(),
          text: getDefaultResponse(lowerMsg),
          sender: "system",
          timestamp: new Date()
        }
      ]);
    }
  };
  
  // Função para gerar respostas padrão com base na mensagem
  const getDefaultResponse = (message: string): string => {
    // Resposta padrão baseada em palavras-chave
    if (message.includes("investir") || message.includes("investimento")) {
      return "Para investimentos, considere seu perfil de risco e objetivos financeiros. Comece com uma reserva de emergência e depois diversifique seus investimentos entre renda fixa e variável.";
    } else if (message.includes("economizar") || message.includes("economia")) {
      return "Para economizar mais, tente seguir a regra 50-30-20: 50% para necessidades básicas, 30% para desejos e 20% para poupança e investimentos.";
    } else if (message.includes("dívida") || message.includes("empréstimo")) {
      return "Priorize o pagamento de dívidas com juros altos. Uma dica é utilizar o método bola de neve: pague primeiro as menores dívidas para ganhar motivação.";
    } else if (message.includes("orçamento") || message.includes("planejamento")) {
      return "Um bom orçamento começa por listar todas suas receitas e despesas. Utilize aplicativos de finanças para acompanhar seus gastos e identificar onde pode economizar.";
    }
    
    return "Posso ajudar com diversas questões financeiras. Pergunte sobre investimentos, economia, dívidas, orçamento ou registre receitas e despesas diretamente aqui!";
  };
  
  const suggestions = [
    { key: "howToSaveMore", text: t("howToSaveMore") },
    { key: "biggestExpenses", text: t("biggestExpenses") },
    { key: "createBudget", text: t("createBudget") },
    { key: "investOrPayDebt", text: t("investOrPayDebt") },
    { key: "reduceFoodExpenses", text: t("reduceFoodExpenses") },
    { key: "howMuchToSave", text: t("howMuchToSave") }
  ];
  
  // Determinar classes com base no tema
  const headerBgClass = theme === 'dark' 
    ? "bg-gradient-to-r from-blue-900 to-indigo-900" 
    : "bg-gradient-to-r from-blue-500 to-indigo-600";
    
  const cardBgClass = theme === 'dark'
    ? "bg-galileo-card/80 backdrop-blur-sm border-galileo-border/50"
    : "bg-galileo-card backdrop-blur-sm border-galileo-border";
  
  return (
    <div className="min-h-screen bg-galileo-background flex flex-col pb-16">
      {/* Header com design moderno e colorido */}
      <header className={`sticky top-0 z-10 ${headerBgClass} shadow-md px-4 py-3 flex flex-col items-center mx-auto w-full`}>
        <div className="flex flex-row items-center gap-3 w-full max-w-xl justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mr-2">
              <span className="text-white text-sm">💡</span>
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Consultor IA</span>
              <span className="block text-xs text-blue-100">Assistente financeiro</span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Container centralizado para o chat */}
      <main className="flex-1 w-full flex flex-col items-center px-3 sm:px-4 pt-4">
        <section className={`w-full max-w-xl flex flex-col flex-1 ${cardBgClass} rounded-xl shadow-lg overflow-hidden`}>
          <div className="flex-1 overflow-y-auto px-3 pt-3 pb-20" style={{ minHeight: '60vh' }}>
            <ChatMessages messages={messages} />
          </div>
          
          {showSuggestions && (
            <div className="mb-3 px-3">
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className={`px-3 py-1.5 rounded-full ${
                      theme === 'dark' 
                        ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 hover:from-blue-900/70 hover:to-indigo-900/70 text-blue-200 border border-blue-800' 
                        : 'bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-indigo-700 border border-indigo-200'
                    } text-xs font-medium shadow-sm transition-all`}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className={`sticky bottom-0 w-full ${
            theme === 'dark' 
              ? 'bg-galileo-card/80 backdrop-blur-sm border-t border-galileo-border/50' 
              : 'bg-galileo-card/90 backdrop-blur-sm border-t border-galileo-border'
          } pt-2 pb-3 px-3 z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]`}>
            <ChatInput onSubmit={handleSendMessage} />
          </div>
        </section>
      </main>
      
      {/* NavBar fixa na parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <NavBar />
      </div>
    </div>
  );
};

export default FinancialAdvisorPage;
