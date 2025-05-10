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
import { fetchGeminiFlashLite, GeminiTransactionIntent } from '@/utils/gemini';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

const IA_AVATAR = '/ia-avatar.svg'; // Coloque um SVG bonito na public/

// Definir um tipo para getDataUtils para evitar erros
type DataUtils = {
  transactions: any[];
  calculateBalance: (transactions: any[]) => number;
  formatCurrency: (value: number) => string;
};

// Mock da função getDataUtils para evitar erros de compilação
const getDataUtils = async (): Promise<DataUtils> => {
  // Implementação real seria feita aqui
  return {
    transactions: [],
    calculateBalance: (transactions) => 0,
    formatCurrency: (value) => `R$ ${value.toFixed(2)}`
  };
};

export const FinancialAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: uuidv4(),
      text: `Olá! Eu sou o Consultor IA 🤖. Pergunte sobre finanças ou registre receitas/despesas. Tudo será confirmado antes de registrar!`,
      sender: "system",
      timestamp: new Date()
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<null | { tipo: string, dados: any }>(null);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
    setShowSuggestions(false);
  };

  // Detectar intenção de registro na resposta da IA
  function parseConfirmationIntent(text: string) {
    // Simples: IA sempre diz "Confirma o registro de ...?"
    const match = text.match(/Confirma o registro de (uma|um)?\s?([\w\W]+?)\?/i);
    if (match) {
      // Exemplo: "uma saída de R$50 em mercado"
      return match[2];
    }
    return null;
  }

  // Função para enviar mensagem para Gemini 2.0 Flash Lite API com controle de uso
  // Utiliza a função fetchGeminiFlashLite importada no topo do arquivo
  const getGeminiResponse = async (prompt: string): Promise<string> => {
    try {
      const response = await fetchGeminiFlashLite(prompt);
      if (!response || response.length < 5) {
        return 'Desculpe, não consegui encontrar uma resposta adequada. Pode reformular sua pergunta?';
      }
      return response;
    } catch (e: any) {
      return 'Houve um erro ao acessar a IA. Tente novamente em instantes.';
    }
  };

  const handleSendMessage = async (message: string) => {
    const lowerMsg = message.trim().toLowerCase();

    // Se aguardando confirmação e usuário diz sim
    if (waitingConfirmation && pendingAction && lowerMsg.startsWith('sim')) {
      setLoading(true);
      setError("");
      // Exemplo: pendingAction.tipo = 'saida', dados = { valor, categoria, ... }
      try {
        // Aqui você pode adaptar para entrada/saída/conta conforme seu schema
        if (pendingAction.tipo === 'entrada' || pendingAction.tipo === 'saída' || pendingAction.tipo === 'saida') {
          const { valor, categoria, descricao } = pendingAction.dados;
          await supabase.from('transactions').insert([
            {
              type: pendingAction.tipo === 'entrada' ? 'income' : 'expense',
              amount: valor,
              category: categoria,
              title: descricao || categoria,
              created_at: new Date().toISOString(),
              // Adicione outros campos necessários
            }
          ]);
          setMessages((msgs) => ([
            ...msgs,
            { id: uuidv4(), text: '✅ Registro efetuado com sucesso!', sender: 'system', timestamp: new Date() }
          ]));
        } else if (pendingAction.tipo === 'conta') {
          // Exemplo para contas
          const { valor, descricao, vencimento } = pendingAction.dados;
          await supabase.from('bills').insert([
            {
              amount: valor,
              title: descricao,
              due_date: vencimento,
              created_at: new Date().toISOString(),
              // Outros campos
            }
          ]);
          setMessages((msgs) => ([
            ...msgs,
            { id: uuidv4(), text: '✅ Conta registrada com sucesso!', sender: 'system', timestamp: new Date() }
          ]));
        }
        setPendingAction(null);
        setWaitingConfirmation(false);
      } catch (e) {
        setError('Erro ao registrar no banco.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Se aguardando confirmação e usuário diz não
    if (waitingConfirmation && (lowerMsg.startsWith('não') || lowerMsg.startsWith('nao'))) {
      setMessages((msgs) => ([
        ...msgs,
        { id: uuidv4(), text: 'Registro cancelado.', sender: 'system', timestamp: new Date() }
      ]));
      setPendingAction(null);
      setWaitingConfirmation(false);
      return;
    }

    // Adicionar a mensagem do usuário ao chat
    setLoading(true);
    setError("");
    const userMessage: ChatMessage = { id: uuidv4(), text: message, sender: 'user', timestamp: new Date() };
    setMessages((msgs) => ([...msgs, userMessage]));
    
    // Limpar sugestões ao enviar mensagem
    setShowSuggestions(false);

    // Flag para controlar se uma resposta já foi enviada
    let respostaEnviada = false;
    
    // Remover lógicas de padrões hardcoded para dar prioridade à Gemini para intenções de transação
    // ... (seção de if/else com padrões hardcoded foi removida para simplificar e focar na Gemini)
    // ...

    // Se não for um comando hardcoded, chamar Gemini
    if (!respostaEnviada) {
      try {
        const geminiTextResponse = await getGeminiResponse(message);
        let botResponseText = geminiTextResponse;
        let transactionDetailsMessage: ChatMessage | null = null;

        try {
          // Tentar parsear a resposta como JSON de transação
          const parsedResponse: GeminiTransactionIntent = JSON.parse(geminiTextResponse);
          if (parsedResponse && parsedResponse.action === 'add_transaction') {
            // É uma intenção de transação!
            const { transaction_type, description, amount, category, date } = parsedResponse;
            let details = `Entendi que você quer adicionar uma ${transaction_type === 'income' ? 'receita' : 'despesa'} de R$${amount.toFixed(2)} para "${description}".`;
            if (category) details += ` Categoria: ${category}.`;
            if (date) {
              try {
                const formattedDate = new Date(date + 'T00:00:00'); // Adiciona T00:00:00 para evitar problemas de fuso ao formatar
                details += ` Data: ${formattedDate.toLocaleDateString('pt-BR')}.`;
              } catch (e) {
                 details += ` Data (não formatada): ${date}.`;
              }
            }
            // Por agora, apenas mostramos o que a IA entendeu.
            // Próximo passo seria perguntar "Está correto?" e usar pendingAction.
            botResponseText = details + "\n\n(Esta é uma funcionalidade em teste. Para registrar, use o formulário ou confirme quando solicitado.)";
            
            // Poderíamos criar uma mensagem separada para os detalhes se quiséssemos um tratamento visual diferente
            // transactionDetailsMessage = { 
            //   id: uuidv4(), 
            //   text: details + "\n\nQuer que eu prepare isso para registro? (sim/não)", 
            //   sender: 'system', 
            //   timestamp: new Date() 
            // };
            // Se usarmos transactionDetailsMessage, então botResponseText = null ou uma mensagem diferente.
          }
        } catch (e) {
          // Não é um JSON de transação válido, tratar como chat normal
          // botResponseText já está com geminiTextResponse
          if (!(e instanceof SyntaxError)) {
            console.error("Erro ao processar resposta da Gemini (não foi SyntaxError ao parsear JSON):", e);
          }
        }

        if (botResponseText) {
          const advisorResponse: ChatMessage = {
            id: uuidv4(),
            text: botResponseText,
            sender: "system",
            timestamp: new Date(),
            avatarUrl: IA_AVATAR
          };
          setMessages((prevMessages: ChatMessage[]) => [...prevMessages, advisorResponse]);
        }
        // Se transactionDetailsMessage for usado, adicionar aqui também
        // if (transactionDetailsMessage) {
        //   setMessages((prevMessages: ChatMessage[]) => [...prevMessages, transactionDetailsMessage]);
        //   setWaitingConfirmation(true); // Ativar espera por confirmação
        //   setPendingAction({ tipo: parsedResponse.transaction_type, dados: parsedResponse }); // Salvar dados para confirmação
        // }

      } catch (e: any) {
        setError(e.message || "Erro ao obter resposta da IA.");
        const errorResponse: ChatMessage = {
          id: uuidv4(),
          text: "Houve um erro ao comunicar com o assistente. Tente novamente.",
          sender: "system",
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        };
        setMessages((prevMessages: ChatMessage[]) => [...prevMessages, errorResponse]);
      } finally {
        setLoading(false);
      }
    }
  };

  const suggestions = [
    { key: "howToSaveMore", text: t("howToSaveMore") || "Como economizar mais?" },
    { key: "biggestExpenses", text: t("biggestExpenses") || "Quais são meus maiores gastos?" },
    { key: "createBudget", text: t("createBudget") || "Como criar um orçamento?" },
    { key: "investOrPayDebt", text: t("investOrPayDebt") || "Devo investir ou pagar dívidas?" },
    { key: "reduceFoodExpenses", text: t("reduceFoodExpenses") || "Como reduzir gastos com alimentação?" },
    { key: "howMuchToSave", text: t("howMuchToSave") || "Quanto devo guardar por mês?" }
  ];
  
  return (
    <div className="min-h-screen bg-galileo-background flex flex-col pb-16">
      {/* Header com design moderno e colorido */}
      <header className="sticky top-0 z-10 bg-galileo-accent text-white dark:bg-galileo-card dark:text-galileo-text shadow-md px-4 py-3 flex flex-col items-center mx-auto w-full border-b border-galileo-border">
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
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto px-4 py-6 max-w-xl mx-auto w-full">
        <section className="w-full max-w-xl flex flex-col flex-1 bg-galileo-card rounded-xl shadow-lg overflow-hidden border border-galileo-border">
          <div className="flex-1 overflow-y-auto px-3 pt-3 pb-20" style={{ minHeight: '60vh' }}>
            {/* Mensagens do chat */}
            <ChatMessages messages={messages} />
            
            {/* Loading animado */}
            {loading && (
              <div className="flex items-center gap-2 mt-2 animate-pulse">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={IA_AVATAR} alt="IA" />
                  <AvatarFallback>IA</AvatarFallback>
                </Avatar>
                <span className="text-galileo-text bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-2 rounded-2xl shadow-sm text-sm">Pensando...</span>
                <Loader2 className="animate-spin text-blue-500" size={20} />
              </div>
            )}
            
            {/* Confirmação de registro */}
            {waitingConfirmation && pendingAction && (
              <div className="flex flex-col items-center mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={IA_AVATAR} alt="IA" />
                    <AvatarFallback>IA</AvatarFallback>
                  </Avatar>
                  <span className="text-sm bg-yellow-100 text-yellow-900 px-4 py-2 rounded-2xl border border-yellow-300 shadow-sm font-medium animate-fade-in">
                    Confirma o registro de <b>{pendingAction.dados?.descricao || pendingAction.dados?.categoria || 'transação'}</b>?
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    className="px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 text-white font-bold shadow transition-all"
                    onClick={() => handleSendMessage('sim')}
                    aria-label="Confirmar registro"
                  >Confirmar</button>
                  <button
                    className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold shadow transition-all"
                    onClick={() => handleSendMessage('não')}
                    aria-label="Cancelar registro"
                  >Cancelar</button>
                </div>
              </div>
            )}
            
            {/* Mensagem de erro */}
            {error && (
              <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-md mb-4">
                {error}
              </div>
            )}

            {/* Sugestões em botões */}
            {showSuggestions && !waitingConfirmation && !loading && (
              <div className="mb-3 px-3">
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      className="px-3 py-1.5 rounded-full bg-galileo-background hover:bg-galileo-accent text-galileo-text text-xs font-medium border border-galileo-border shadow-sm transition-all"
                      onClick={() => handleSuggestionClick(suggestion.text)}
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Input de chat */}
          <div className="sticky bottom-0 w-full bg-galileo-card pt-2 pb-3 px-3 border-t border-galileo-border z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
            <ChatInput onSubmit={(message: string) => handleSendMessage(message)} />
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
