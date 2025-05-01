
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import ChatInput from '@/components/chat/ChatInput';
import { ChatMessage } from '@/types';
import { getCurrentUser, isLoggedIn, getTransactions, getBills, saveTransaction, saveBill } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import { processChat } from '@/utils/dataProcessing';
import { Lightbulb, User, ArrowRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FinancialAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
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
        text: "Olá! Sou seu consultor financeiro particular. Posso ajudar você com dicas financeiras, registrar suas transações e responder a perguntas sobre sua situação financeira. Como posso ajudar hoje?",
        sender: 'system',
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);

      // Adicionar uma dica financeira inicial após 1 segundo
      setTimeout(() => {
        const tipMessage: ChatMessage = {
          id: uuidv4(),
          text: "💡 Dica: Para uma saúde financeira equilibrada, tente seguir a regra 50-30-20: 50% para necessidades básicas, 30% para desejos pessoais e 20% para poupança e investimentos.",
          sender: 'system',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, tipMessage]);
      }, 1000);
    }
  }, [navigate, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    setIsTyping(true);

    try {
      // Processar a mensagem para extrair transações
      const transactions = processChat(text, user.id);

      setTimeout(() => {
        let responseText = '';
        
        if (transactions.length > 0) {
          // Formatar as transações para exibição
          const transactionsSummary = transactions.map(t => ({
            title: t.title,
            amount: t.amount,
            type: t.type,
            dueDate: t.dueDate,
            isRecurring: t.isRecurring,
            recurringDay: t.recurringDay
          }));
          
          // Adicionar resposta do sistema
          responseText = `${transactions.length} ${transactions.length === 1 ? 'transação' : 'transações'} registrada${transactions.length === 1 ? '' : 's'} com sucesso!${transactions.some(t => t.dueDate) ? ' As contas com vencimento foram adicionadas à sua lista de contas a pagar.' : ''}`;
          
          toast({
            title: "Transações Registradas",
            description: `${transactions.length} ${transactions.length === 1 ? 'transação' : 'transações'} ${transactions.length === 1 ? 'foi' : 'foram'} registrada${transactions.length === 1 ? '' : 's'}.`
          });
        } else if (text.toLowerCase().includes('dica') || text.toLowerCase().includes('conselho') || text.toLowerCase().includes('ajuda')) {
          // Fornecer uma dica financeira
          const tips = [
            "Para economizar dinheiro, tente o desafio dos 30 dias: antes de fazer uma compra não essencial, espere 30 dias para ver se você ainda deseja o item.",
            "Automatize suas finanças! Configure transferências automáticas para sua conta de poupança no dia do seu pagamento para garantir que você economize antes de gastar.",
            "Lembre-se sempre do custo de oportunidade: cada real gasto em algo agora é um real que você não pode investir para o futuro.",
            "Um orçamento bem feito não é sobre restrições, mas sobre gastar intencionalmente em coisas que realmente importam para você.",
            "Considere a regra 50/30/20 para seu orçamento: 50% para necessidades, 30% para desejos e 20% para poupança e investimentos.",
            "Muitas vezes, a melhor maneira de economizar dinheiro em compras grandes é simplesmente esperar e procurar por promoções ou alternativas mais baratas.",
            "Revise seus serviços de assinatura regularmente. Muitas pessoas pagam por serviços que mal utilizam."
          ];
          responseText = "💡 " + tips[Math.floor(Math.random() * tips.length)];
        } else {
          // Analisar a situação financeira
          const userTransactions = getTransactions();
          const userBills = getBills();
          
          // Calcular totais
          const totalIncome = userTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
          const totalExpenses = userTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
          const upcomingBills = userBills
            .filter(b => !b.isPaid)
            .reduce((sum, b) => sum + b.amount, 0);
            
          const balance = totalIncome - totalExpenses;
          
          if (text.toLowerCase().includes('status') || text.toLowerCase().includes('situação') || text.toLowerCase().includes('resumo')) {
            responseText = `Aqui está sua situação financeira atual:\n\nReceitas: R$ ${totalIncome.toFixed(2)}\nDespesas: R$ ${totalExpenses.toFixed(2)}\nSaldo: R$ ${balance.toFixed(2)}\nContas a pagar: R$ ${upcomingBills.toFixed(2)}`;
            
            if (balance < 0) {
              responseText += "\n\n⚠️ Atenção! Suas despesas estão maiores que suas receitas. Recomendo revisar seu orçamento e reduzir gastos não essenciais.";
            } else if (balance < (totalIncome * 0.1)) {
              responseText += "\n\n⚠️ Seu saldo está baixo em relação à sua renda. Considere reduzir alguns gastos para aumentar sua poupança.";
            } else {
              responseText += "\n\n✅ Parece que você está com uma boa situação financeira! Continue economizando e considere investir o excedente.";
            }
          } else {
            // Resposta genérica
            responseText = "Entendi! Como seu consultor financeiro, posso ajudar você com:\n\n- Registro de transações (ex: \"gasto de 50 reais no mercado\")\n- Análise financeira (ex: \"qual minha situação atual?\")\n- Dicas financeiras (ex: \"me dê uma dica para economizar\")\n\nComo posso ajudá-lo hoje?";
          }
        }

        // Adicionar resposta do sistema
        const systemMessage: ChatMessage = {
          id: uuidv4(),
          text: responseText,
          sender: 'system',
          timestamp: new Date()
        };
        
        setIsTyping(false);
        setMessages(prev => [...prev, systemMessage]);
      }, 1000);

    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      
      // Mensagem de erro
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        text: "Ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        sender: 'system',
        timestamp: new Date()
      };
      
      setIsTyping(false);
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-galileo-background flex flex-col min-h-screen pb-16">
      <PageHeader 
        title="Consultor Financeiro" 
        showBack={true}
        showSearch={false} 
      />
      
      <div className="flex-1 flex flex-col p-4 pb-20 overflow-hidden">
        <div className="flex-1 overflow-y-auto pr-1">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
            >
              {message.sender === 'system' && (
                <Avatar className="h-8 w-8 mr-2 mt-1">
                  <AvatarImage src="/assets/advisor-avatar.png" alt="Assistente" />
                  <AvatarFallback>
                    <Lightbulb size={18} />
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div 
                className={`max-w-[80%] rounded-2xl p-3 ${
                  message.sender === 'user' 
                    ? 'bg-galileo-accent text-white rounded-tr-none' 
                    : 'bg-galileo-card text-galileo-text rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-white/70' : 'text-galileo-secondaryText'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
              
              {message.sender === 'user' && (
                <Avatar className="h-8 w-8 ml-2 mt-1">
                  <AvatarImage src="/assets/user-avatar.png" alt="Usuário" />
                  <AvatarFallback>
                    <User size={18} />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start mb-4">
              <Avatar className="h-8 w-8 mr-2 mt-1">
                <AvatarFallback>
                  <Lightbulb size={18} />
                </AvatarFallback>
              </Avatar>
              <div className="bg-galileo-card text-galileo-text rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                <div className="flex space-x-2">
                  <div className="h-2 w-2 bg-galileo-accent rounded-full animate-bounce"></div>
                  <div className="h-2 w-2 bg-galileo-accent rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                  <div className="h-2 w-2 bg-galileo-accent rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <Card className="mt-4 border-galileo-border bg-galileo-card/30">
          <CardContent className="p-3">
            <p className="text-sm font-medium mb-2 flex items-center">
              <Lightbulb size={16} className="mr-1 text-galileo-accent" /> 
              Experimente perguntar:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {["Qual minha situação atual?", 
                "Me dê uma dica financeira", 
                "Adicione R$ 2000 de salário", 
                "Gasto de R$ 150 no supermercado"
               ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-xs justify-between bg-galileo-background border-galileo-border"
                  onClick={() => handleSendMessage(suggestion)}
                >
                  {suggestion}
                  <ArrowRight size={12} />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-galileo-background border-t border-galileo-border">
        <ChatInput onSubmit={handleSendMessage} />
      </div>
      
      <NavBar />
    </div>
  );
};

export default FinancialAdvisorPage;
