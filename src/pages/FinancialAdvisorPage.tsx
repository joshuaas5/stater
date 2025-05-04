
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

  setTimeout(() => {
    const lowerMsg = message.toLowerCase();

    // Função para buscar transações e utilidades
    const getDataUtils = async () => {
      const { getTransactions } = await import("@/utils/localStorage");
      const { calculateTotalByCategory, formatCurrency, calculateBalance } = await import("@/utils/dataProcessing");
      const transactions = getTransactions();
      return { transactions, calculateTotalByCategory, formatCurrency, calculateBalance };
    };

    // 1. Maiores gastos
    if (
      lowerMsg.includes("maiores gastos") ||
      lowerMsg.includes("maiores despesas") ||
      lowerMsg.includes("biggest expenses") ||
      lowerMsg.includes("top despesas") ||
      lowerMsg.includes("top gastos")
    ) {
      getDataUtils().then(({ transactions, calculateTotalByCategory, formatCurrency }) => {
        const expenses = transactions.filter((t: any) => t.type === 'expense');
        const totals = calculateTotalByCategory(expenses);
        const sorted = Object.entries(totals)
          .filter(([_, value]) => value < 0)
          .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
          .slice(0, 3);
        let resp = "Aqui estão suas maiores categorias de gasto:";
        if (sorted.length === 0) {
          resp = "Não encontrei despesas registradas para analisar.";
        } else {
          resp += "\n" + sorted.map(([cat, value]) => `• ${cat}: ${formatCurrency(Math.abs(value))}`).join("\n");
        }
        const advisorResponse: ChatMessage = {
          id: uuidv4(),
          text: resp,
          sender: "system",
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, advisorResponse]);
      });
      return;
    }

    // 2. Como posso economizar mais?
    if (
      lowerMsg.includes("como posso economizar") ||
      lowerMsg.includes("how can i save") ||
      lowerMsg.includes("dicas para economizar")
    ) {
      getDataUtils().then(({ transactions, calculateTotalByCategory, formatCurrency }) => {
        const expenses = transactions.filter((t: any) => t.type === 'expense');
        const totals = calculateTotalByCategory(expenses);
        const sorted = Object.entries(totals)
          .filter(([_, value]) => value < 0)
          .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
          .slice(0, 2);
        let resp = "Aqui vão algumas dicas para economizar mais:\n";
        if (sorted.length > 0) {
          resp += sorted
            .map(([cat]) => `• Revise seus gastos em ${cat}. Às vezes, pequenas mudanças em categorias frequentes trazem grande economia.`)
            .join("\n");
        } else {
          resp += "• Registre suas despesas para receber dicas personalizadas.";
        }
        resp += "\n• Estabeleça metas de economia mensais.\n• Evite compras por impulso e revise assinaturas recorrentes.";
        const advisorResponse: ChatMessage = {
          id: uuidv4(),
          text: resp,
          sender: "system",
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, advisorResponse]);
      });
      return;
    }

    // 3. Como criar um orçamento?
    if (
      lowerMsg.includes("criar um orçamento") ||
      lowerMsg.includes("how to create a budget") ||
      lowerMsg.includes("montar orçamento")
    ) {
      getDataUtils().then(({ transactions, calculateBalance, formatCurrency }) => {
        const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpense = transactions.filter((t: any) => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        let resp = "Para criar um orçamento eficiente:\n";
        resp += "1. Liste todas as suas receitas e despesas mensais.\n";
        resp += `2. Sua receita mensal registrada: ${formatCurrency(totalIncome)}.\n`;
        resp += `3. Suas despesas mensais registradas: ${formatCurrency(totalExpense)}.\n`;
        resp += "4. Defina limites para cada categoria.\n5. Monitore seus gastos e ajuste quando necessário.";
        const advisorResponse: ChatMessage = {
          id: uuidv4(),
          text: resp,
          sender: "system",
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, advisorResponse]);
      });
      return;
    }

    // 4. Devo investir ou pagar dívidas?
    if (
      lowerMsg.includes("investir ou pagar dívidas") ||
      lowerMsg.includes("investir ou pagar dividas") ||
      lowerMsg.includes("should i invest or pay debt")
    ) {
      let resp = "Se você possui dívidas com juros altos (ex: cartão de crédito), priorize quitá-las antes de investir. Após quitar dívidas caras, comece a investir para construir patrimônio.";
      resp += "\nAvalie sempre a taxa de juros das suas dívidas versus o rendimento esperado dos investimentos.";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
      return;
    }

    // 5. Como reduzir gastos com alimentação?
    if (
      lowerMsg.includes("reduzir gastos com alimentação") ||
      lowerMsg.includes("reduzir gastos com alimentacao") ||
      lowerMsg.includes("reduce food expenses")
    ) {
      let resp = "Algumas dicas para reduzir gastos com alimentação:\n";
      resp += "• Planeje suas refeições e faça compras com lista.\n";
      resp += "• Prefira cozinhar em casa ao invés de pedir comida pronta.\n";
      resp += "• Evite desperdícios, aproveite sobras.\n";
      resp += "• Compare preços entre mercados e busque promoções.";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
      return;
    }

    // 6. Quanto devo guardar por mês?
    if (
      lowerMsg.includes("quanto devo guardar") ||
      lowerMsg.includes("how much should i save")
    ) {
      getDataUtils().then(({ transactions, calculateBalance, formatCurrency }) => {
        const totalIncome = transactions.filter((t: any) => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        let suggested = totalIncome * 0.2;
        let resp = "O ideal é guardar cerca de 20% da sua renda mensal.\n";
        if (totalIncome > 0) {
          resp += `Com base na sua receita registrada (${formatCurrency(totalIncome)}), tente guardar ao menos ${formatCurrency(suggested)} por mês.`;
        } else {
          resp += "Registre suas receitas para obter uma sugestão personalizada.";
        }
        const advisorResponse: ChatMessage = {
          id: uuidv4(),
          text: resp,
          sender: "system",
          timestamp: new Date()
        };
        setMessages(prevMessages => [...prevMessages, advisorResponse]);
      });
      return;
    }

    // --- IA BÁSICA: Resposta automática para qualquer questão ---
    // 1. Tentar identificar palavras-chave financeiras
    const financialKeywords = [
      "gasto", "despesa", "receita", "investimento", "economizar", "guardar", "orçamento", "dívida", "cartão", "fatura", "poupança", "renda", "salário", "dinheiro", "juros"
    ];
    const educationKeywords = [
      "explica", "o que é", "como funciona", "significa", "diferença entre", "exemplo de"];
    const motivationalKeywords = [
      "motivar", "desanimado", "cansado", "difícil", "ajuda", "conselho", "dica de vida", "inspirar"];

    // 2. Respostas automáticas baseadas em intenção
    if (financialKeywords.some(k => lowerMsg.includes(k))) {
      const resp =
        "Ótima pergunta! Gerenciar suas finanças é fundamental. Use as ferramentas do app para registrar receitas e despesas, acompanhar suas categorias de gasto e definir metas. Se quiser uma análise personalizada, registre suas movimentações!";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
      return;
    }
    if (educationKeywords.some(k => lowerMsg.includes(k))) {
      const resp =
        "Claro! Sempre que quiser saber o significado de um termo ou conceito financeiro, é só perguntar. Por exemplo: orçamento é o planejamento dos seus ganhos e gastos. Se quiser uma explicação específica, detalhe sua dúvida!";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
      return;
    }
    if (motivationalKeywords.some(k => lowerMsg.includes(k))) {
      const resp =
        "Lembre-se: cuidar da sua vida financeira é um passo importante para realizar sonhos! Persistência e organização fazem toda a diferença. Conte comigo para te ajudar nessa jornada! 💪";
      const advisorResponse: ChatMessage = {
        id: uuidv4(),
        text: resp,
        sender: "system",
        timestamp: new Date()
      };
      setMessages(prevMessages => [...prevMessages, advisorResponse]);
      return;
    }

    // 3. Fallback: resposta com IA real (Hugging Face)
    const thinkingMsg: ChatMessage = {
      id: uuidv4(),
      text: "Pensando...",
      sender: "system",
      timestamp: new Date()
    };
    setMessages(prevMessages => [...prevMessages, thinkingMsg]);

    async function getHuggingFaceResponse(prompt: string): Promise<string> {
      try {
        const response = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-small", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ inputs: prompt })
        });
        const data = await response.json();
        if (Array.isArray(data) && data[0]?.generated_text) {
          return data[0].generated_text.trim();
        }
        // fallback para outros formatos de resposta
        if (typeof data === 'object' && data.generated_text) {
          return data.generated_text.trim();
        }
        return "Desculpe, não consegui gerar uma resposta no momento.";
      } catch (e) {
        return "Desculpe, não consegui acessar a IA agora. Tente novamente mais tarde.";
      }
    }

    getHuggingFaceResponse(message).then((hfResp) => {
      setMessages(prevMessages => [
        ...prevMessages.filter(m => m.id !== thinkingMsg.id),
        {
          id: uuidv4(),
          text: hfResp,
          sender: "system",
          timestamp: new Date()
        }
      ]);
    });
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
