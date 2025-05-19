import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/navigation/NavBar';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { isLoggedIn, saveTransaction as saveTransactionUtil } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { ChatMessage, Transaction } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from '@/hooks/use-translation';
import { fetchGeminiFlashLite, GeminiTransactionIntent } from '@/utils/gemini';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const IA_AVATAR = '/ia-avatar.svg'; // Coloque um SVG bonito na public/
const USER_AVATAR = '/user-avatar.svg'; // Placeholder for user avatar

const MAX_GEMINI_TOKENS_MONTHLY = 1000000; // Exemplo: 1 milhão de tokens por mês
const TOKEN_WARNING_THRESHOLD_PERCENTAGE = 90;

const getCurrentMonthYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Meses são 0-indexados
  return `${year}-${month}`;
};

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

interface PendingAction {
  tipo: 'income' | 'expense' | 'bill' | 'generic_confirmation'; 
  dados: any; 
}

export const FinancialAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSuggestions, setShowSuggestions] = useState(true);
  const initialSystemMessage: ChatMessage = {
    id: uuidv4(),
    text: `Olá! Eu sou o Consultor IA 🤖. Pergunte sobre finanças ou registre receitas/despesas. Tudo será confirmado antes de registrar!`,
    sender: "system",
    timestamp: new Date()
  };

  // Persistência do Chat: Carregar mensagens do localStorage ou usar inicial
  // Messages will be loaded in a useEffect hook once currentUserId is known.
  const [messages, setMessages] = useState<ChatMessage[]>([initialSystemMessage]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(undefined); // undefined: not yet checked, null: checked and no user, string: user ID
  const [activeTab, setActiveTab] = useState("chat"); // Novo estado para aba ativa

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.error('FinancialAdvisorPage: Error fetching user:', authError.message);
          setCurrentUserId(null); // Treat error as guest/logged out
        } else if (user) {
          setCurrentUserId(user.id);
          console.log('FinancialAdvisorPage: User ID set on mount:', user.id);
        } else {
          console.log('FinancialAdvisorPage: No user session found.');
          setCurrentUserId(null); // No user session
        }
      } catch (e: any) {
        console.error('FinancialAdvisorPage: Critical exception fetching user:', e.message);
        setCurrentUserId(null); // Critical error, treat as guest/logged out
      }
    };
    fetchUser();
  }, []); // Runs once on mount to get the user ID

  // Effect to load messages once currentUserId is known
  useEffect(() => {
    if (currentUserId === undefined) return; // Don't load if user ID isn't determined yet

    const storageKey = currentUserId ? `financialAdvisorChatMessages_${currentUserId}` : 'financialAdvisorChatMessages_guest';
    const savedMessages = localStorage.getItem(storageKey);
    let loadedMessages = [initialSystemMessage];

    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages) as ChatMessage[];
        loadedMessages = parsed.map((msg: ChatMessage) => ({ ...msg, timestamp: new Date(msg.timestamp) })).slice(-10);
        if (loadedMessages.length === 0) loadedMessages = [initialSystemMessage];
      } catch (e) {
        console.error(`Erro ao parsear mensagens salvas do chat para ${storageKey}:`, e);
        // Mantém loadedMessages como [initialSystemMessage]
      }
    }
    setMessages(loadedMessages);
    console.log(`FinancialAdvisorPage: Loaded messages from ${storageKey}`);
  }, [currentUserId]); // Reload messages when currentUserId changes

  useEffect(() => {
    const loggedIn = isLoggedIn();
    // console.log('FinancialAdvisorPage: User logged in status on mount (legacy check):', loggedIn); // Legacy check, can be removed if not needed
    if (currentUserId === null && !loggedIn) { // Redirect if user ID is explicitly null (no session) and legacy check also confirms not logged in
        console.log('FinancialAdvisorPage: User not logged in (currentUserId is null), redirecting to /login');
        navigate('/login');
    }
  }, [navigate, currentUserId, isLoggedIn]); // Depend on currentUserId as well

  // Persistência do Chat: Salvar mensagens no localStorage
  useEffect(() => {
    if (currentUserId === undefined || messages.length === 1 && messages[0].id === initialSystemMessage.id && messages[0].text === initialSystemMessage.text) {
        // Don't save if user ID isn't determined yet or if it's just the initial system message unmodified
        return;
    }

    const storageKey = currentUserId ? `financialAdvisorChatMessages_${currentUserId}` : 'financialAdvisorChatMessages_guest';
    
    const messagesToSave = messages.slice(-10);
    localStorage.setItem(storageKey, JSON.stringify(
      messagesToSave.map((msg: ChatMessage) => ({ ...msg, timestamp: msg.timestamp.toISOString() }))
    ));
    console.log(`FinancialAdvisorPage: Saved messages to ${storageKey}`);
  }, [messages, currentUserId, initialSystemMessage.id, initialSystemMessage.text]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      if (!response || response.length < 2) {
        return 'Desculpe, não consegui encontrar uma resposta adequada. Pode reformular sua pergunta?';
      }
      return response;
    } catch (e: any) {
      return 'Houve um erro ao acessar a IA. Tente novamente em instantes.';
    }
  };

  const handleSendMessage = async (message: string) => {
    // Obter userId usando o Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      setError("Erro: Usuário não identificado. Por favor, faça login novamente para continuar.");
      setMessages(prev => [...prev, { id: uuidv4(), text: "❌ Erro: Usuário não identificado. Por favor, tente fazer login novamente.", sender: 'system', timestamp: new Date() }]);
      setLoading(false);
      setWaitingConfirmation(false);
      setPendingAction(null);
      return;
    }

    const activeUserId = user.id;

    if (!activeUserId) {
      setMessages(prev => [...prev, { id: uuidv4(), text: "❌ Erro: Usuário não identificado. Por favor, tente fazer login novamente.", sender: 'system', timestamp: new Date() }]);
      setLoading(false);
      setWaitingConfirmation(false);
      setPendingAction(null);
      return;
    }

    // Garante que não processa mensagem vazia, a menos que seja uma confirmação e haja uma ação pendente.
    if (!message.trim() && !(waitingConfirmation && pendingAction)) return;
    // Se for uma confirmação, mas não houver ação pendente (estado inesperado), exibe erro.
    if (!message.trim() && waitingConfirmation && !pendingAction) {
        setError("Ocorreu um erro interno. Não há ação pendente para confirmar ou cancelar.");
        setMessages(prev => [...prev, { id: uuidv4(), text: "⚠️ Erro interno. Nenhuma ação pendente.", sender: 'system', timestamp: new Date() }]);
        setLoading(false);
        setWaitingConfirmation(false);
        return;
    }

    const lowerMsg = message.trim().toLowerCase();

    // Se aguardando confirmação e usuário diz sim
    if (waitingConfirmation && pendingAction && lowerMsg.startsWith('sim')) {
      setLoading(true);
      setError("");
      try {
        if (pendingAction.tipo === 'income' || pendingAction.tipo === 'expense') {
          const { description, amount, category, date } = pendingAction.dados;
          // Capitaliza a primeira letra da descrição
          const capitalizedDescription = description && description.length > 0 
            ? description.charAt(0).toUpperCase() + description.slice(1) 
            : description;

          // Salva no Supabase
          await supabase.from('transactions').insert([
            {
              type: pendingAction.tipo === 'income' ? 'income' : 'expense',
              amount: amount,
              category: category || null,
              title: capitalizedDescription, // Usa a descrição capitalizada
              date: date ? new Date(date).toISOString() : new Date().toISOString(),
              created_at: new Date().toISOString(),
            }
          ]);
          // Salva no localStorage usando a função utilitária
          const transactionToSave: Transaction = {
            id: uuidv4(), 
            title: capitalizedDescription, // Usa a descrição capitalizada
            amount: Number(amount),
            type: pendingAction.tipo as 'income' | 'expense',
            category: category || '',
            date: date ? new Date(date) : new Date(),
            userId: activeUserId, // Usa o activeUserId obtido no início da função
          };
          saveTransactionUtil(transactionToSave);
          window.dispatchEvent(new Event('transactionsUpdated'));
          setMessages((prevMessages: ChatMessage[]) => ([
            ...prevMessages,
            { id: uuidv4(), text: `✅ ${pendingAction.tipo === 'income' ? 'Receita' : 'Despesa'} registrada com sucesso!`, sender: 'system', timestamp: new Date() }
          ]));
        } else if (pendingAction.tipo === 'bill') {
          // Exemplo para contas
          const { valor, descricao, vencimento } = pendingAction.dados;
          await supabase.from('bills').insert([
            {
              amount: valor,
              title: descricao,
              due_date: vencimento, // Assuming vencimento is a string like 'YYYY-MM-DD' or a Date object
              user_id: activeUserId, // Assuming you have a user_id field in your bills table
              created_at: new Date().toISOString(),
            }
          ]);
          setMessages((prevMessages: ChatMessage[]) => ([
            ...prevMessages,
            { id: uuidv4(), text: '✅ Conta registrada com sucesso!', sender: 'system', timestamp: new Date() }
          ]));
        } // Closes 'else if (pendingAction.tipo === 'conta')'
        
        setPendingAction(null);
        setWaitingConfirmation(false);

      } catch (e: any) { // Catch for the 'sim' block's try
        const errorMessage = e.message || (typeof e === 'string' ? e : 'Erro desconhecido ao registrar no banco.');
        setError('Erro ao registrar: ' + errorMessage);
        console.error("Erro ao registrar no banco:", e);
        setMessages(prev => [...prev, { id: uuidv4(), text: `❌ Erro ao registrar: ${errorMessage}. Tente novamente.`, sender: 'system', timestamp: new Date() }]);
        setWaitingConfirmation(false); // Reset waitingConfirmation on error
        setPendingAction(null);      // Reset pendingAction on error
      } finally { // Finally for the 'sim' block's try
        setLoading(false);
      }
      return; // Crucial: return after 'sim' processing is fully handled
    } // Closes 'if (waitingConfirmation && pendingAction && lowerMsg.startsWith('sim'))'
    // Se aguardando confirmação e usuário diz não ou cancelar
    else if (waitingConfirmation && pendingAction && (lowerMsg.startsWith('não') || lowerMsg.startsWith('nao') || lowerMsg.startsWith('cancelar'))) {
      setMessages(prev => [...prev, 
        { id: uuidv4(), text: message, sender: 'user', timestamp: new Date(), avatarUrl: USER_AVATAR },
        { id: uuidv4(), text: 'Ok, ação cancelada.', sender: 'system', timestamp: new Date(), avatarUrl: IA_AVATAR }
      ]);
      setWaitingConfirmation(false);
      setPendingAction(null);
      setLoading(false); // Certifica que o loading é desativado
      return; // Importante sair após tratar o cancelamento
    }

    // Adiciona a mensagem do usuário à interface
    const newUserMessage: ChatMessage = { id: uuidv4(), text: message, sender: 'user', timestamp: new Date(), avatarUrl: USER_AVATAR };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setLoading(true);
    setError('');
    setShowSuggestions(false);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Erro: Usuário não identificado.");
        setLoading(false);
        return;
      }
      const activeUserId = user.id;

      // Lógica de verificação de limite de tokens
      const currentMonthYear = getCurrentMonthYear();
      const { data: tokenUsageData, error: tokenUsageError } = await supabase
        .from('user_token_usage')
        .select('tokens_used')
        .eq('user_id', activeUserId)
        .eq('month_year', currentMonthYear)
        .single();

      if (tokenUsageError && tokenUsageError.code !== 'PGRST116') { // PGRST116: no rows found
        console.error("Erro ao buscar uso de tokens:", tokenUsageError);
      }
      
      const currentTokensUsed = tokenUsageData?.tokens_used || 0;

      if (currentTokensUsed >= MAX_GEMINI_TOKENS_MONTHLY) {
        const limitReachedMessage: ChatMessage = {
          id: uuidv4(),
          text: "Você atingiu seu limite mensal de interações com a IA. Você ainda pode adicionar transações manualmente ou aguardar o próximo mês.",
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        };
        setMessages(prev => [...prev, limitReachedMessage]);
        setLoading(false);
        return;
      }

      if (currentTokensUsed >= MAX_GEMINI_TOKENS_MONTHLY * (TOKEN_WARNING_THRESHOLD_PERCENTAGE / 100)) {
        const warningMessageText = `Aviso: Você usou ${((currentTokensUsed / MAX_GEMINI_TOKENS_MONTHLY) * 100).toFixed(0)}% do seu limite de tokens mensais (${currentTokensUsed.toLocaleString('pt-BR')}/${MAX_GEMINI_TOKENS_MONTHLY.toLocaleString('pt-BR')}).`;
        const warningMessage: ChatMessage = {
          id: uuidv4(),
          text: warningMessageText,
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        };
        setMessages(prev => [...prev, warningMessage]);
      }
      // Fim da lógica de verificação de limite de tokens

      const messagesForApi = [...messages, newUserMessage]
        .slice(-10)
        .map(msg => (`${msg.sender === 'user' ? 'user' : 'model'}: ${msg.text}`)).join('\n\n'); // Construct a single string prompt
      
      // Pass the constructed prompt string to fetchGeminiFlashLite
      const botResponseText = await fetchGeminiFlashLite(messagesForApi);
      let confirmationMessageForChat: string = botResponseText;

      try {
        let jsonStringToParse = botResponseText;
        // Tenta extrair o conteúdo de um bloco ```json ... ```
        const match = jsonStringToParse.match(/```json\s*([\s\S]*?)\s*```/);
        if (match && match[1]) {
          jsonStringToParse = match[1].trim();
        } else {
          // Fallback: remove marcadores ``` genéricos ou apenas faz trim se não houver marcadores.
          // Isso é útil se a resposta for um JSON simples ou um JSON em ``` ... ``` genérico.
          jsonStringToParse = jsonStringToParse.replace(/^```\s*([\s\S]*?)\s*```$/, '$1').trim();
        }
        
        // Usa jsonStringToParse (a string limpa) para as operações seguintes
        const sanitizedFullResponse = jsonStringToParse.replace(/,\s*}/g, "}").replace(/,\s*\]/g, "]");
        const parsedFullResponse: GeminiTransactionIntent = JSON.parse(sanitizedFullResponse);
        
        if (parsedFullResponse.action === "add_transaction") {
          const { transaction_type, description, amount, category, date } = parsedFullResponse;
          const formattedDateStr = date ? new Date(date + "T00:00:00").toLocaleDateString("pt-BR") : "";
          const confirmText = `📝 Ok! Você quer adicionar ${transaction_type === "income" ? "uma receita 🤑" : "uma despesa 💸"} de R$${amount.toFixed(2)} para \"${description}\"${category ? ` na categoria \"${category}\"` : ""}${date ? ` em ${formattedDateStr}` : ""}.\n\nCorreto? Registrar? (sim/não)`;
          
          setPendingAction({ 
            tipo: transaction_type === "income" ? "income" : "expense", 
            dados: { description, amount, category: category || null, date: date || null } 
          });
          setWaitingConfirmation(true);
          setMessages(prev => [...prev, { id: uuidv4(), text: confirmText, sender: 'system', timestamp: new Date(), avatarUrl: IA_AVATAR }]);
          setLoading(false);
          return;
        }
      } catch (jsonParseError) {
        console.log("Resposta da IA não é um JSON de transação direta, tentando confirmação textual:", botResponseText);
      }

      const textualConfirmationDetail = parseConfirmationIntent(botResponseText);

      if (textualConfirmationDetail && !pendingAction) { 
        let actionData: any = { description: textualConfirmationDetail }; 
        let pendingActionType: PendingAction['tipo'] = 'generic_confirmation';

        try {
          const sanitizedDetail = textualConfirmationDetail.replace(/,\s*}/g, "}").replace(/,\s*\]/g, "]");
          const parsedJsonDetail = JSON.parse(sanitizedDetail);

          if (parsedJsonDetail && typeof parsedJsonDetail === 'object' && !Array.isArray(parsedJsonDetail)) {
            const transactionTypeWord = parsedJsonDetail.type === 'income' ? 'uma receita 🤑' : (parsedJsonDetail.type === 'expense' ? 'uma despesa 💸' : 'uma transação');
            const amountValue = parsedJsonDetail.amount ? parseFloat(parsedJsonDetail.amount) : null;
            const amountString = amountValue ? ` de R$${amountValue.toFixed(2)}` : '';
            const descriptionString = parsedJsonDetail.description || parsedJsonDetail.category || 'esta operação';
            const dateValue = parsedJsonDetail.date ? new Date(parsedJsonDetail.date.includes('T') ? parsedJsonDetail.date : parsedJsonDetail.date + 'T00:00:00') : null;
            const dateString = dateValue ? ` em ${dateValue.toLocaleDateString('pt-BR')}` : '';
            const categoryString = parsedJsonDetail.category ? ` na categoria \"${parsedJsonDetail.category}\"` : '';
            
            confirmationMessageForChat = `📝 Você confirma o registro de ${transactionTypeWord}${amountString} para \"${descriptionString}\"${categoryString}${dateString}? (sim/não)`;
            
            actionData = {
              description: parsedJsonDetail.description || descriptionString,
              amount: amountValue,
              category: parsedJsonDetail.category || null,
              date: parsedJsonDetail.date || null
            };
            pendingActionType = parsedJsonDetail.type === 'income' ? 'income' : (parsedJsonDetail.type === 'expense' ? 'expense' : (parsedJsonDetail.type === 'bill' ? 'bill' : 'generic_confirmation'));
          }
        } catch (e) {
          // Não parseou detalhe como JSON, usa botResponseText original para confirmação.
          confirmationMessageForChat = botResponseText; // A pergunta original da IA será usada para confirmação.
        }

        setPendingAction({ tipo: pendingActionType, dados: actionData });
        setWaitingConfirmation(true);
        const botSystemMessage: ChatMessage = { id: uuidv4(), text: confirmationMessageForChat, sender: 'system', timestamp: new Date(), avatarUrl: IA_AVATAR };
        setMessages((prevMessages: ChatMessage[]) => [...prevMessages, botSystemMessage]);
      
      } else if (!pendingAction) { 
        const botSystemMessage: ChatMessage = { id: uuidv4(), text: botResponseText, sender: 'system', timestamp: new Date(), avatarUrl: IA_AVATAR };
        setMessages((prevMessages: ChatMessage[]) => [...prevMessages, botSystemMessage]);
      }
      
    } catch (e: any) {
      const errorMessageText = e.message || (typeof e === 'string' ? e : "Erro ao obter resposta da IA.");
      setError(errorMessageText);
      console.error("Erro em handleSendMessage (nova mensagem):", e);
      const errorResponse: ChatMessage = {
        id: uuidv4(),
        text: `Houve um erro: ${errorMessageText}. Tente novamente.`,
        sender: "system",
        timestamp: new Date(),
        avatarUrl: IA_AVATAR
      };
      setMessages((prevMessages: ChatMessage[]) => [...prevMessages, errorResponse]);
    } finally {
      setLoading(false);
    }
  };

  const initialSuggestions = [
    t('common.suggestions.check_balance') || 'Verificar Saldo',
    t('common.suggestions.register_expense') || 'Registrar Despesa',
    t('common.suggestions.register_income') || 'Registrar Receita',
    t('common.suggestions.financial_summary') || 'Resumo Financeiro',
  ];

  const suggestions = [
    { key: "howToSaveMore", text: t("howToSaveMore") || 'Como economizar mais?' },
    { key: "biggestExpenses", text: t("biggestExpenses") || 'Quais são meus maiores gastos?' },
    { key: "createBudget", text: t("createBudget") || 'Como criar um orçamento?' },
    { key: "investOrPayDebt", text: t("investOrPayDebt") || 'Devo investir ou pagar dívidas?' },
    { key: "reduceFoodExpenses", text: t("reduceFoodExpenses") || 'Como reduzir gastos com alimentação?' },
    { key: "howMuchToSave", text: t("howMuchToSave") || 'Quanto devo guardar por mês?' }
  ];

  const handleTabChange = (tabValue: string) => {
    setActiveTab(tabValue);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <NavBar />
      <div className="flex-grow container mx-auto px-0 sm:px-4 py-4 md:py-8 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col flex-grow">
          <TabsList className="grid w-full grid-cols-1 mb-4 sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <TabsTrigger value="chat">Consultor IA 🤖</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-grow flex flex-col overflow-hidden">
            <div className="flex flex-col flex-grow bg-card shadow-xl rounded-lg overflow-hidden">
              {error && (
                <div className="p-4 bg-destructive text-destructive-foreground">
                  {error}
                </div>
              )}
              <ChatMessages messages={messages} messagesEndRef={messagesEndRef} iaAvatar={IA_AVATAR} userAvatar={USER_AVATAR} />
              {showSuggestions && !pendingAction && (
                <div className="p-4 border-t border-border bg-muted/40">
                  <p className="text-sm text-muted-foreground mb-2">Sugestões:</p>
                  <div className="flex flex-wrap gap-2">
                    {initialSuggestions.map((sug, index) => (
                      <Button key={index} variant="outline" size="sm" onClick={() => handleSuggestionClick(sug)}>
                        {sug}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <ChatInput
                onSubmit={handleSendMessage}
                loading={loading}
                waitingConfirmation={waitingConfirmation}
                pendingActionDetails={pendingAction ? pendingAction.dados : null}
                onConfirm={() => handleSendMessage('sim')}
                onCancel={() => handleSendMessage('não')}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
