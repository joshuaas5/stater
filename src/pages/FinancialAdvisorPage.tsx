import React, { useEffect, useState, useRef } from 'react';
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
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


const IA_AVATAR = '/ia-avatar.svg'; // Coloque um SVG bonito na public/
const USER_AVATAR = '/user-avatar.svg'; // Placeholder for user avatar

// Limites prudentes sugeridos
const MAX_GEMINI_TOKENS_MONTHLY = 50000; // 50 mil tokens por usuário/mês
const MAX_GEMINI_REQUESTS_DAILY = 15;    // 15 requisições por usuário/dia
const LIMIT_BLOCK_PERCENTAGE = 95;       // Bloqueia ao atingir 95% do limite
const TOKEN_WARNING_THRESHOLD_PERCENTAGE = 90; // Aviso em 90% do limite

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

// Mover para fora do componente para evitar recriação
const INITIAL_SYSTEM_MESSAGE_TEXT = `🎯 **Olá! Sou o Stater IA** - sua IA financeira completa!

✨ **O que posso fazer:**
• Analisar extratos e documentos financeiros
• Registrar receitas/despesas automaticamente  
• Fornecer dicas personalizadas de economia
• Controlar contas e planejamento financeiro

💡 **Como usar:** Envie documentos, fotos ou faça perguntas sobre suas finanças. Sempre confirmo antes de salvar dados!

Como posso ajudá-lo hoje?`;

export const FinancialAdvisorPage: React.FC = () => {
  // const [showAddBillModal, setShowAddBillModal] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSuggestions, setShowSuggestions] = useState(true);  const initialSystemMessage: ChatMessage = {
    id: uuidv4(),
    text: INITIAL_SYSTEM_MESSAGE_TEXT,
    sender: "system",
    timestamp: new Date()
  };
  // Persistência do Chat: Carregar mensagens do localStorage ou usar inicial
  // Messages will be loaded in a useEffect hook once currentUserId is known.
  const [messages, setMessages] = useState<ChatMessage[]>([initialSystemMessage]);

  const [loading, setLoading] = useState(false);
  const [savingTransactions, setSavingTransactions] = useState(false); // Novo estado para loading de salvamento
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const [editableTransactions, setEditableTransactions] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(undefined); // undefined: not yet checked, null: checked and no user, string: user ID
  const [activeTab, setActiveTab] = useState("chat"); // Novo estado para aba ativa
  
  // Estados para funcionalidades de voz
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Inicializar Web Speech API
  useEffect(() => {
    // Verificar se o navegador suporta Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';
      
      recognition.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
      };
      
      recognition.onend = () => {
        console.log('🎤 Speech recognition ended');
        setIsListening(false);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Speech recognized:', transcript);
        // O transcript será usado pelo ChatInput component
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('🎤 Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      setSpeechRecognition(recognition);
    }
    
    // Carregar mensagens salvas do localStorage quando o usuário for identificado
    if (currentUserId !== undefined) {
      const storageKey = currentUserId ? `financialAdvisorChatMessages_${currentUserId}` : 'financialAdvisorChatMessages_guest';
      const savedMessages = localStorage.getItem(storageKey);
      
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          
          // Verificar se há mensagens válidas diferentes da inicial
          if (parsedMessages.length > 0) {
            console.log(`💬 [CHAT RESTORE] Carregadas ${parsedMessages.length} mensagens do localStorage`);
            setMessages(parsedMessages);
          }
        } catch (error) {
          console.error('❌ [CHAT RESTORE] Erro ao carregar mensagens:', error);
          // Manter mensagem inicial se houver erro
        }
      } else {
        console.log('💬 [CHAT RESTORE] Nenhuma mensagem salva encontrada, usando mensagem inicial');
      }
    }
    
    console.log(`FinancialAdvisorPage: Loaded messages for user ${currentUserId}`);
  }, [currentUserId]); // Reload messages when currentUserId changes

  useEffect(() => {
    const loggedIn = isLoggedIn();
    // console.log('FinancialAdvisorPage: User logged in status on mount (legacy check):', loggedIn); // Legacy check, can be removed if not needed
    if (currentUserId === null && !loggedIn) { // Redirect if user ID is explicitly null (no session) and legacy check also confirms not logged in
        console.log('FinancialAdvisorPage: User not logged in (currentUserId is null), redirecting to /login');
        navigate('/login');
    }
  }, [navigate, currentUserId, isLoggedIn]); // Depend on currentUserId as well

  // Forçar salvamento imediatamente sempre que uma nova mensagem for adicionada
  useEffect(() => {
    if (currentUserId && messages.length > 0) {
      const storageKey = currentUserId ? `financialAdvisorChatMessages_${currentUserId}` : 'financialAdvisorChatMessages_guest';
      
      const messagesToSave = messages.slice(-20);
      localStorage.setItem(storageKey, JSON.stringify(
        messagesToSave.map((msg: ChatMessage) => ({ ...msg, timestamp: msg.timestamp.toISOString() }))
      ));
      console.log(`🔥 [FORCE SAVE] Salvamento forçado! ${messagesToSave.length} mensagens para ${storageKey}`);
    }
  }, [messages.length, currentUserId]); // Dependência apenas no length para evitar loops

  // Persistência do Chat: Salvar mensagens no localStorage
  useEffect(() => {
    if (currentUserId === undefined) {
        // Don't save if user ID isn't determined yet
        console.log('💬 [CHAT SAVE] User ID não determinado ainda, aguardando...');
        return;
    }

    // Sempre salvar se há mais de 1 mensagem ou se a mensagem foi modificada do texto inicial
    if (messages.length > 1 || (messages.length === 1 && messages[0].text !== INITIAL_SYSTEM_MESSAGE_TEXT)) {
      const storageKey = currentUserId ? `financialAdvisorChatMessages_${currentUserId}` : 'financialAdvisorChatMessages_guest';
      
      const messagesToSave = messages.slice(-20); // Salvar últimas 20 mensagens
      localStorage.setItem(storageKey, JSON.stringify(
        messagesToSave.map((msg: ChatMessage) => ({ ...msg, timestamp: msg.timestamp.toISOString() }))
      ));
      console.log(`💬 [CHAT SAVE] Salvou ${messagesToSave.length} mensagens para ${storageKey}`);
      console.log(`💬 [CHAT SAVE] Primeiras 2 mensagens:`, messagesToSave.slice(0, 2).map(m => m.text.substring(0, 50)));
    } else {
      console.log('💬 [CHAT SAVE] Apenas mensagem inicial, não salvando');
    }
  }, [messages, currentUserId]);
  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, [messages]);

  // Novo useEffect para scroll quando transações editáveis mudarem
  useEffect(() => {
    if (editableTransactions.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [editableTransactions, waitingConfirmation]);const handleSuggestionClick = (suggestion: string) => {
    // Para botões de registro de transação, fazer a IA perguntar pelos detalhes
    if (suggestion === 'Registrar Despesa' || suggestion === 'Registrar Receita') {
      const transactionType = suggestion === 'Registrar Despesa' ? 'despesa' : 'receita';
      
      // Adicionar mensagem do usuário
      const userMessage: ChatMessage = {
        id: uuidv4(),
        text: suggestion,
        sender: 'user',
        timestamp: new Date(),
        avatarUrl: USER_AVATAR
      };
      
      // Resposta da IA perguntando pelos detalhes
      const aiResponse: ChatMessage = {
        id: uuidv4(),
        text: `Perfeito! Vou te ajudar a registrar uma ${transactionType}. 📝\n\nPor favor, me informe:\n• Qual o valor da ${transactionType}?\n• Qual a descrição/motivo?\n• (Opcional) Qual a categoria?\n\nPor exemplo: "R$ 50,00 para supermercado na categoria alimentação"`,
        sender: 'system',
        timestamp: new Date(),
        avatarUrl: IA_AVATAR
      };
      
      setMessages(prev => [...prev, userMessage, aiResponse]);
    } else if (suggestion === 'Verificar Saldo' || suggestion === 'Resumo Financeiro') {
      // Para consultas de saldo/resumo, chamar diretamente sem esperar JSON
      console.log('🔍 [SALDO] Processando consulta de saldo - NÃO deve retornar JSON');
      handleSendMessage(suggestion);
    } else {
      handleSendMessage(suggestion);
    }
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

  // Detecta intenção de adicionar conta (usuário ou IA)
const isAddBillIntent = (msg: string) => {
  const triggers = [
    'adicionar conta', 'nova conta a pagar', 'nova fatura', 'nova cobrança', 'novo boleto',
    'add bill', 'add account', 'new bill', 'new account', 'add payment', 'nova despesa fixa', 'nova mensalidade'
  ];
  return triggers.some(trigger => msg.toLowerCase().includes(trigger));
};

  // Função para forçar scroll para o final
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Hook para scroll automático quando messages mudam
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

const handleSendMessage = async (message: string) => {
  if (isAddBillIntent(message)) {
    setMessages(prev => [
      ...prev,
      {
        id: uuidv4(),
        text: message,
        sender: 'user',
        timestamp: new Date(),
        avatarUrl: USER_AVATAR
      },
      {
        id: uuidv4(),
        text: "📝 Para adicionar uma nova conta, basta clicar no menu Contas no Stater! Assim você pode registrar e organizar todas as suas contas de forma fácil e rápida. 😃",
        sender: 'system',
        timestamp: new Date(),
        avatarUrl: IA_AVATAR
      }
    ]);
    return;
  }

    // Obter userId usando o Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      setError("Erro: Usuário não identificado. Por favor, faça login novamente para continuar.");
      setMessages(prev => [...prev, { id: uuidv4(), text: "❌ Erro: Usuário não identificado. Por favor, tente fazer login novamente.", sender: 'system', timestamp: new Date() }]);
      setLoading(false);
      setWaitingConfirmation(false);
      setPendingAction(null);
      return;
    }    const activeUserId = user.id;
    
    // SEMPRE salvar/atualizar usuário no localStorage para garantir sincronização
    const userToSave = {
      id: activeUserId,
      email: user.email || '',
      username: user.user_metadata?.username || user.email || ''
    };
    console.log('💾 Sincronizando usuário no localStorage:', userToSave);
    saveUser(userToSave);

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

    const lowerMsg = message.trim().toLowerCase();    // Se aguardando confirmação e usuário diz sim
    if (waitingConfirmation && pendingAction && lowerMsg.startsWith('sim')) {
      setLoading(true);
      setSavingTransactions(true); // Ativar loading específico para salvamento
      setError("");
      try {        // Processar transações (OCR, texto, IA)
        if (pendingAction.tipo === 'generic_confirmation' && (pendingAction.dados.ocrTransactions || editableTransactions.length > 0)) {
          // Usar as transações editáveis se disponíveis, caso contrário usar as originais
          const transactionsToProcess = editableTransactions.length > 0 ? editableTransactions : (pendingAction.dados.ocrTransactions || []);
          let successCount = 0;
          let errorCount = 0;
          
          console.log(`🔄 PROCESSANDO ${transactionsToProcess.length} transações:`, JSON.stringify(transactionsToProcess));
          console.log('👤 User ID ativo:', activeUserId);
          console.log('📋 editableTransactions:', editableTransactions.length);
          console.log('📋 pendingAction.dados.ocrTransactions:', pendingAction.dados.ocrTransactions?.length || 0);
          
          // Log detalhado das transações
          transactionsToProcess.forEach((tx: any, index: number) => {
            console.log(`📋 Transação ${index + 1}:`, {
              description: tx.description,
              amount: tx.amount,
              type: tx.type,
              category: tx.category,
              date: tx.date
            });
          });
          
          // Processar cada transação
          for (const transaction of transactionsToProcess) {
            try {
              // Preparar data da transação
              const transactionDate = transaction.date 
                ? new Date(transaction.date) 
                : new Date();

              // Salvar no Supabase com timestamp correto do servidor
              console.log('🔄 Salvando transação com RPC timestamp do servidor...');
              const supabaseInsert = await supabase.rpc('insert_transaction_with_timestamp', {
                p_user_id: activeUserId,
                p_description: transaction.description,
                p_amount: transaction.amount,
                p_type: transaction.type,
                p_category: transaction.category || 'outros'
              });
              
              // Fallback se RPC falhar
              if (supabaseInsert.error) {
                console.warn('⚠️ RPC falhou, usando insert tradicional:', supabaseInsert.error);
                const fallbackInsert = await supabase.from('transactions').insert([
                  {
                    type: transaction.type,
                    amount: transaction.amount,
                    category: transaction.category || null,
                    title: transaction.description,
                    date: new Date().toISOString(), // 🔧 CORREÇÃO: Data/hora atual completa
                    created_at: new Date().toISOString(),
                    user_id: activeUserId
                  }
                ]).select();
                
                if (fallbackInsert.error) {
                  throw new Error(`Erro ao salvar: ${fallbackInsert.error.message}`);
                }
              }
              
              console.log('✅ Supabase insert result:', supabaseInsert);
              
              if (supabaseInsert.error) {
                console.error('❌ Erro no Supabase:', supabaseInsert.error);
                throw new Error(`Erro ao salvar no Supabase: ${supabaseInsert.error.message}`);
              }              // NOVO: Salvar também no localStorage para aparecer em "últimas transações"
              const transactionToSave: Transaction = {
                id: uuidv4(),
                title: transaction.description,
                amount: Number(transaction.amount),
                type: transaction.type as 'income' | 'expense',
                category: transaction.category || '',
                date: transactionDate,
                userId: activeUserId
              };
                // Log para debug
              console.log('💾 Salvando transação:', JSON.stringify(transactionToSave));
              console.log('👤 User ID ativo:', activeUserId);
              
              // Garantir que o usuário está salvo no localStorage antes de salvar a transação
              const currentLocalUser = getCurrentUser();
              console.log('👤 Current local user:', currentLocalUser);
              if (!currentLocalUser || currentLocalUser.id !== activeUserId) {
                // Salvar usuário no localStorage se não estiver lá
                const userToSave = {
                  id: activeUserId,
                  email: user.email || '',
                  username: user.user_metadata?.username || user.email || ''
                };
                console.log('💾 Salvando usuário no localStorage:', userToSave);
                saveUser(userToSave);
              }                console.log('🔄 Chamando saveTransactionUtil...');
              saveTransactionUtil(transactionToSave);
              console.log('✅ saveTransactionUtil chamado com sucesso');
              
              // NOVA ADIÇÃO: Forçar sincronização imediata do Supabase
              console.log('🔄 Forçando sincronização Supabase...');
              try {
                const { forceSupabaseSync } = await import('@/utils/localStorage');
                await forceSupabaseSync();
                console.log('✅ Sincronização Supabase forçada com sucesso');
              } catch (syncError) {
                console.error('❌ Erro na sincronização forçada:', syncError);
              }

              successCount++;
            } catch (transactionError) {
              console.error('Erro ao salvar transação OCR:', transactionError);
              errorCount++;
            }
          }          // Atualizar interface com eventos múltiplos para garantir reload
          console.log('🔄 Disparando eventos de atualização...');
          window.dispatchEvent(new Event('transactionsUpdated'));
          window.dispatchEvent(new Event('storage')); // Para forçar reload de localStorage
          window.dispatchEvent(new CustomEvent('forceTransactionReload', { detail: { source: 'ai_upload' } }));
          console.log('✅ Eventos de atualização disparados');
            // Mensagem de resultado
          let resultMessage = '';
          if (successCount > 0) {
            // Calcular total das transações salvas
            const totalAmount = editableTransactions.reduce((sum, tx) => sum + tx.amount, 0);
            resultMessage += `✅ ${successCount} transações salvas com sucesso!\n`;
            resultMessage += `💰 Total processado: R$ ${totalAmount.toFixed(2)}`;
          }
          if (errorCount > 0) {
            resultMessage += `${successCount > 0 ? '\n' : ''}❌ ${errorCount} transações falharam ao salvar.`;
          }
          
          console.log(`📊 Resultado final: ${successCount} sucessos, ${errorCount} erros`);
          
          // NOVA VALIDAÇÃO: Verificar se as transações foram realmente salvas
          console.log('🔍 Verificando se transações foram salvas no Supabase...');
          try {
            const { data: savedTransactions, error: verifyError } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', activeUserId)
              .order('created_at', { ascending: false })
              .limit(transactionsToProcess.length);
              
            if (verifyError) {
              console.error('❌ Erro ao verificar transações salvas:', verifyError);
            } else {
              console.log(`✅ Verificação: ${savedTransactions?.length || 0} transações encontradas no Supabase`);
              console.log('📋 Últimas transações no Supabase:', savedTransactions);
            }
          } catch (verifyError) {
            console.error('❌ Erro na verificação:', verifyError);
          }
          
          setMessages((prevMessages: ChatMessage[]) => [
            ...prevMessages,
            { 
              id: uuidv4(), 
              text: resultMessage, 
              sender: 'system', 
              timestamp: new Date(),
              avatarUrl: IA_AVATAR
            }
          ]);
        }
        // Processar transações normais
        else if (pendingAction.tipo === 'income' || pendingAction.tipo === 'expense') {
          const { description, amount, category, date } = pendingAction.dados;
          // Capitaliza a primeira letra da descrição
          const capitalizedDescription = description && description.length > 0 
            ? description.charAt(0).toUpperCase() + description.slice(1) 
            : description;          // Função para garantir que a data seja sempre a de hoje se não especificada
          const getValidDate = (dateInput: string | null): Date => {
            if (!dateInput) {
              // Se não há data especificada, usar a data e hora atual
              return new Date();
            }
            
            // Se há data especificada, processar corretamente
            try {
              // Se está no formato YYYY-MM-DD, processar diretamente mantendo o horário atual
              if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = dateInput.split('-').map(Number);
                const currentTime = new Date();
                return new Date(year, month - 1, day, currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds(), currentTime.getMilliseconds());
              }
              
              // Caso contrário, tentar converter normalmente
              const parsedDate = new Date(dateInput);
              if (isNaN(parsedDate.getTime())) {
                // Se a data for inválida, usar agora
                return new Date();
              }
              
              // Se a data foi fornecida sem horário, manter o horário atual
              const currentTime = new Date();
              return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate(), 
                             currentTime.getHours(), currentTime.getMinutes(), currentTime.getSeconds(), currentTime.getMilliseconds());
            } catch (error) {
              // Em caso de erro, usar agora
              return new Date();
            }
          };

          const transactionDate = getValidDate(date);

          // Salva no Supabase com timestamp correto do servidor
          console.log('🔄 Salvando transação manual com RPC timestamp...');
          const supabaseResult = await supabase.rpc('insert_transaction_with_timestamp', {
            p_user_id: activeUserId,
            p_description: capitalizedDescription,
            p_amount: amount,
            p_type: pendingAction.tipo === 'income' ? 'income' : 'expense',
            p_category: category || 'outros'
          });

          // Fallback se RPC falhar
          if (supabaseResult.error) {
            console.warn('⚠️ RPC falhou, usando insert tradicional:', supabaseResult.error);
            await supabase.from('transactions').insert([
              {
                type: pendingAction.tipo === 'income' ? 'income' : 'expense',
                amount: amount,
                category: category || null,
                title: capitalizedDescription,
                date: new Date().toISOString(), // 🔧 CORREÇÃO: Data/hora atual completa
                created_at: new Date().toISOString(),
                user_id: activeUserId
              }
            ]);
          }          // Salva no localStorage usando a função utilitária
          const transactionToSave: Transaction = {
            id: uuidv4(), 
            title: capitalizedDescription, // Usa a descrição capitalizada
            amount: Number(amount),
            type: pendingAction.tipo as 'income' | 'expense',
            category: category || '',
            date: transactionDate,
            userId: activeUserId // Usa o activeUserId obtido no início da função
          };
          
          // Log para debug
          console.log('Salvando transação manual:', JSON.stringify(transactionToSave));
          console.log('User ID ativo:', activeUserId);
          
          // Garantir que o usuário está salvo no localStorage antes de salvar a transação
          const currentLocalUser = getCurrentUser();
          if (!currentLocalUser || currentLocalUser.id !== activeUserId) {
            // Salvar usuário no localStorage se não estiver lá
            const userToSave = {
              id: activeUserId,
              email: user.email || '',
              username: user.user_metadata?.username || user.email || ''
            };            console.log('Salvando usuário no localStorage:', userToSave);
            saveUser(userToSave);
          }
            saveTransactionUtil(transactionToSave);
          
          // Múltiplos eventos para garantir atualização imediata do dashboard
          window.dispatchEvent(new Event('transactionsUpdated'));
          window.dispatchEvent(new Event('storage')); // Forçar recarga da localStorage
          window.dispatchEvent(new CustomEvent('forceTransactionReload', { detail: { source: 'ai_manual' } }));
          
          setMessages((prevMessages: ChatMessage[]) => [
            ...prevMessages,
            { id: uuidv4(), text: `✅ ${pendingAction.tipo === 'income' ? 'Receita' : 'Despesa'} registrada com sucesso!`, sender: 'system', timestamp: new Date() }
          ]);        } else if (pendingAction.tipo === 'bill') {
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
          setMessages((prevMessages: ChatMessage[]) => [
            ...prevMessages,
            { id: uuidv4(), text: '✅ Conta registrada com sucesso!', sender: 'system', timestamp: new Date() }
          ]);} // Closes 'else if (pendingAction.tipo === 'conta')'
        
        setPendingAction(null);
        setWaitingConfirmation(false);
        setEditableTransactions([]); // Limpar transações editáveis

      } catch (e: any) { // Catch for the 'sim' block's try
        const errorMessage = e.message || (typeof e === 'string' ? e : 'Erro desconhecido ao registrar no banco.');
        setError('Erro ao registrar: ' + errorMessage);
        console.error("Erro ao registrar no banco:", e);
        setMessages(prev => [...prev, { id: uuidv4(), text: `❌ Erro ao registrar: ${errorMessage}. Tente novamente.`, sender: 'system', timestamp: new Date() }]);
        setWaitingConfirmation(false); // Reset waitingConfirmation on error
        setPendingAction(null);      // Reset pendingAction on error
      } finally { // Finally for the 'sim' block's try
        setLoading(false);
        setSavingTransactions(false); // Desativar loading específico para salvamento
      }
      return; // Crucial: return after 'sim' processing is fully handled
    } // Closes 'if (waitingConfirmation && pendingAction && lowerMsg.startsWith('sim'))'
    // Se aguardando confirmação e usuário diz não ou cancelar
    else if (waitingConfirmation && pendingAction && (lowerMsg.startsWith('não') || lowerMsg.startsWith('nao') || lowerMsg.startsWith('cancelar'))) {
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          text: message,
          sender: 'user',
          timestamp: new Date(),
          avatarUrl: USER_AVATAR
        },
        {
          id: uuidv4(),
          text: 'Ok, ação cancelada.',
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        }      ]);
      setWaitingConfirmation(false);
      setPendingAction(null);
      setEditableTransactions([]); // Limpar transações editáveis
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

      // Lógica de verificação de limites de tokens e requisições
      const currentMonthYear = getCurrentMonthYear();
      const todayDate = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
      // Buscar tokens usados no mês
      const { data: tokenUsageData, error: tokenUsageError } = await supabase
        .from('user_token_usage')
        .select('tokens_used')
        .eq('user_id', activeUserId)
        .eq('month_year', currentMonthYear)
        .maybeSingle();
      // Buscar requisições feitas no dia
      const { data: dailyUsageData, error: dailyUsageError } = await supabase
        .from('user_ai_daily_usage')
        .select('requests_count')
        .eq('user_id', activeUserId)
        .eq('date', todayDate)
        .maybeSingle();
      if (tokenUsageError && tokenUsageError.code !== 'PGRST116') {
        console.error("Erro ao buscar uso de tokens:", tokenUsageError);
      }
      if (dailyUsageError && dailyUsageError.code !== 'PGRST116') {
        console.error("Erro ao buscar uso diário de IA:", dailyUsageError);
      }
      const currentTokensUsed = tokenUsageData?.tokens_used || 0;
      const currentRequestsToday = dailyUsageData?.requests_count || 0;
      // Bloqueio por tokens
      if (currentTokensUsed >= MAX_GEMINI_TOKENS_MONTHLY * (LIMIT_BLOCK_PERCENTAGE / 100)) {
        const limitReachedMessage: ChatMessage = {
          id: uuidv4(),
          text: `Você atingiu 95% do seu limite mensal de tokens para IA. Aguarde o próximo mês ou entre em contato para liberar mais acesso.`,
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        };
        setMessages(prev => [...prev, limitReachedMessage]);
        setLoading(false);
        return;
      }
      // Bloqueio por requisições diárias
      if (currentRequestsToday >= MAX_GEMINI_REQUESTS_DAILY * (LIMIT_BLOCK_PERCENTAGE / 100)) {
        const limitReachedMessage: ChatMessage = {
          id: uuidv4(),
          text: `Você atingiu 95% do seu limite diário de perguntas para a IA. Tente novamente amanhã ou aguarde a liberação do limite.`,
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        };
        setMessages(prev => [...prev, limitReachedMessage]);
        setLoading(false);
        return;
      }
      // Aviso de tokens
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
      // Aviso de requisições diárias
      if (currentRequestsToday >= MAX_GEMINI_REQUESTS_DAILY * (TOKEN_WARNING_THRESHOLD_PERCENTAGE / 100)) {
        const warningMessageText = `Aviso: Você usou ${((currentRequestsToday / MAX_GEMINI_REQUESTS_DAILY) * 100).toFixed(0)}% do seu limite diário de perguntas (${currentRequestsToday}/${MAX_GEMINI_REQUESTS_DAILY}).`;
        const warningMessage: ChatMessage = {
          id: uuidv4(),
          text: warningMessageText,
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        };
        setMessages(prev => [...prev, warningMessage]);
      }
      // Fim da lógica de verificação de limite de tokens e requisições

      // Get session token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        setMessages(prev => [...prev, { id: uuidv4(), text: "❌ Erro: Não foi possível obter a sessão. Faça login novamente.", sender: 'system', timestamp: new Date() }]);
        setLoading(false);
        return;
      }
      const accessToken = sessionData.session.access_token;

      // --- NOVO: Montar prompt detalhado com dados reais do usuário ---
      let userPrompt = message;
      try {
        // Buscar TODAS as transações para calcular saldo corretamente
        const { data: allTransactions } = await supabase
          .from('transactions')
          .select('title, amount, type, category, date')
          .eq('user_id', activeUserId)
          .order('date', { ascending: false });
        
        // Buscar transações recentes para mostrar no contexto (até 10 para melhor contexto)
        const { data: recentTransactions, error: txError } = await supabase
          .from('transactions')
          .select('title, amount, type, category, date')
          .eq('user_id', activeUserId)
          .order('date', { ascending: false })
          .limit(10);
        
        let balance = 0;
        if (allTransactions && allTransactions.length > 0) {
          // Calcular saldo usando TODAS as transações
          balance = allTransactions.reduce((acc, tx) => acc + (tx.type === 'income' ? tx.amount : -tx.amount), 0);
          console.log(`💰 [SALDO] Calculado com ${allTransactions.length} transações: R$ ${balance.toFixed(2)}`);
        }        // Montar prompt rico
        userPrompt = `Você é um consultor financeiro realista e responsável. Analise a situação abaixo e responda de forma personalizada, citando números, regras de saúde financeira e sugerindo ações realistas.\n\n` +
          `INSTRUÇÕES CRÍTICAS:\n` +
          `- Se o usuário perguntar sobre SALDO, GASTOS, ANÁLISE ou CONSULTA: RESPONDA NORMALMENTE em texto\n` +
          `- APENAS retorne JSON quando o usuário EXPLICITAMENTE pedir para "adicionar", "incluir", "registrar" uma LISTA de transações (2 ou mais itens)\n` +
          `- JSON FORMAT: [{"description":"Nome","amount":123.45,"type":"expense/income","category":"categoria","date":"YYYY-MM-DD"},...]\n` +
          `- Use "expense" para gastos/saídas e "income" para receitas/entradas\n` +
          `- Categorias: "alimentacao", "transporte", "saude", "lazer", "moradia", "educacao", "tecnologia", "servicos", "outros"\n\n` +
          `PERGUNTAS SOBRE CONSULTA (responder em TEXTO):\n` +
          `- "Verificar saldo", "Qual meu saldo", "Como estão minhas finanças" = TEXTO NORMAL\n` +
          `- "Resumo financeiro", "Análise", "Gastos do mês" = TEXTO NORMAL\n\n` +
          `REGISTROS EM LISTA (responder em JSON):\n` +
          `- "Adicione: 50 reais mercado, 30 reais posto, 20 reais farmácia" = JSON\n` +
          `- "Registre essas transações: X, Y, Z" = JSON\n\n` +
          `Saldo atual: R$ ${balance.toFixed(2)} (baseado em ${allTransactions?.length || 0} transações totais)\n` +
          `Transações recentes (últimas 10):\n` +
          (recentTransactions && recentTransactions.length > 0
            ? recentTransactions.map(tx => `- ${tx.type === 'income' ? 'Receita' : 'Despesa'}: ${tx.title} (${tx.category || 'Sem categoria'}) R$ ${tx.amount} em ${new Date(tx.date).toLocaleDateString('pt-BR')}`).join('\n')
            : 'Nenhuma transação encontrada.') +
          `\n\nPergunta do usuário: ${message}\n` +
          `Sempre cite exemplos reais, recomende ações práticas e nunca sugira nada impossível ou ilegal. Seja claro e didático.`;
      } catch (promptErr) {
        console.warn('Erro ao montar prompt personalizado, usando mensagem original.', promptErr);
      }
      // --- FIM NOVO PROMPT ---

      // Call our backend API
      console.log(`FinancialAdvisorPage: Calling backend /api/gemini with prompt: "${userPrompt}"`);
      const backendApiResponse = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ originalPrompt: userPrompt }),
      });

      if (!backendApiResponse.ok) {
        const errorData = await backendApiResponse.json().catch(() => ({ error: 'Erro desconhecido ao chamar a API do consultor.' }));
        console.error("Backend API error status:", backendApiResponse.status, "Response:", errorData);
        const userErrorMessage = errorData.details || errorData.error || `Erro ${backendApiResponse.status} ao conectar com o Consultor IA.`;
        setMessages(prev => [...prev, { id: uuidv4(), text: `❌ ${userErrorMessage}`, sender: 'system', timestamp: new Date() }]);
        setLoading(false);
        return; // Return early on API error
      }      const backendData = await backendApiResponse.json();
      let botResponseText = backendData.resposta;
      
      // Limpar tags HTML da resposta da IA
      if (typeof botResponseText === 'string') {
        botResponseText = botResponseText.replace(/<\/?strong>/g, '**').replace(/<\/?[^>]+(>|$)/g, '');
      }
      // --- NOVO: Atualizar uso de tokens e requisições do usuário ---
      try {
        // O backend pode retornar o número de tokens usados na resposta
        const tokensUsedThisCall = backendData.tokens_used || 1000; // fallback: 1000 tokens por interação
        // Atualizar tokens do mês
        const { data: usageRow, error: usageError } = await supabase
          .from('user_token_usage')
          .select('tokens_used')
          .eq('user_id', activeUserId)
          .eq('month_year', currentMonthYear)
          .maybeSingle();
        if (!usageRow) {
          await supabase
            .from('user_token_usage')
            .insert([{ user_id: activeUserId, month_year: currentMonthYear, tokens_used: tokensUsedThisCall }]);
        } else {
          await supabase
            .from('user_token_usage')
            .update({ tokens_used: (usageRow.tokens_used || 0) + tokensUsedThisCall })
            .eq('user_id', activeUserId)
            .eq('month_year', currentMonthYear);
        }
        // Atualizar requisições do dia
        const todayDate = new Date().toISOString().slice(0, 10);
        const { data: dailyRow } = await supabase
          .from('user_ai_daily_usage')
          .select('requests_count')
          .eq('user_id', activeUserId)
          .eq('date', todayDate)
          .maybeSingle();
        if (!dailyRow) {
          await supabase
            .from('user_ai_daily_usage')
            .insert([{ user_id: activeUserId, date: todayDate, requests_count: 1 }]);
        } else {
          await supabase
            .from('user_ai_daily_usage')
            .update({ requests_count: (dailyRow.requests_count || 0) + 1 })
            .eq('user_id', activeUserId)
            .eq('date', todayDate);
        }
      } catch (tokenUpdateErr) {
        console.error('Falha ao atualizar contador de tokens ou requisições:', tokenUpdateErr);
      }
      // --- FIM NOVO USO DE TOKENS E REQUISIÇÕES ---
      
      if (typeof botResponseText !== 'string') {
        console.error("Resposta inesperada do backend:", backendData);
        setMessages(prev => [...prev, { id: uuidv4(), text: "❌ Resposta inesperada do Consultor IA.", sender: 'system', timestamp: new Date() }]);
        setLoading(false);
        return; // Return early if response format is wrong
      }
      let confirmationMessageForChat: string = botResponseText;      
      
      // Verificar se a pergunta é sobre consulta (saldo, resumo, análise) - NÃO deve processar JSON
      const isConsultaQuery = /\b(saldo|resumo|financeiro|análise|gastos|receitas|balanço|verificar|consultar|como estão|situação)\b/i.test(message);
      
      // Attempt to parse AI response for transaction JSON APENAS se NÃO for consulta
      let isTransactionJson = false;
      if (!isConsultaQuery) {
        try {
          let jsonStringToParse = botResponseText;
          const jsonBlockMatch = botResponseText.match(/```json\s*([\s\S]*?)\s*```/);

          if (jsonBlockMatch && jsonBlockMatch[1]) {
            jsonStringToParse = jsonBlockMatch[1].trim();
          } else {
          const firstBrace = botResponseText.indexOf('[');
          const lastBrace = botResponseText.lastIndexOf(']');
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            jsonStringToParse = botResponseText.substring(firstBrace, lastBrace + 1);
          } else {
            const firstObjBrace = botResponseText.indexOf('{');
            const lastObjBrace = botResponseText.lastIndexOf('}');
            if (firstObjBrace !== -1 && lastObjBrace > firstObjBrace) {
              jsonStringToParse = botResponseText.substring(firstObjBrace, lastObjBrace + 1);
            } else {
              throw new Error("No clear JSON structure found in AI response for transaction parsing.");
            }
          }
        }
        
        const sanitizedJsonString = jsonStringToParse.replace(/,\s*([}\]])/g, '$1');
        const parsed = JSON.parse(sanitizedJsonString);        if (parsed && typeof parsed === 'object') {
          // NOVO: Detectar ARRAY de transações (lista retornada pela IA)
          if (Array.isArray(parsed) && parsed.length >= 2) {
            console.log('Detectou array de transações da IA:', parsed);
            
            // Converter array de transações da IA para formato esperado
            const transactionList = parsed.map((tx, index) => {
              console.log(`Processando transação ${index + 1}:`, tx);
              return {
                type: tx.tipo === 'receita' ? 'income' : 'expense',
                amount: parseFloat(tx.valor || tx.amount || 0),
                description: tx.descrição || tx.description || `Transação ${index + 1}`,
                category: tx.categoria || tx.category || 'Outros',
                date: tx.data || tx.date || new Date().toISOString().split('T')[0]
              };
            }).filter(tx => tx.amount > 0); // Filtrar transações com valor válido

            console.log('Lista de transações convertida:', transactionList);

            if (transactionList.length === 0) {
              throw new Error('Nenhuma transação válida encontrada no array da IA');
            }

            // Criar mensagem de resumo
            const totalAmount = transactionList.reduce((sum, tx) => sum + tx.amount, 0);
            let resultMessage = `🤖 A IA detectou ${transactionList.length} transações na sua lista!\n\n`;
            resultMessage += `💰 Total: R$ ${totalAmount.toFixed(2)}\n\n`;
            resultMessage += `Transações processadas:\n\n`;

            // Listar cada transação
            for (let i = 0; i < transactionList.length; i++) {
              const transaction = transactionList[i];
              resultMessage += `${i + 1}. ${transaction.description}\n`;
              resultMessage += `   💵 R$ ${transaction.amount.toFixed(2)} (${transaction.type === 'income' ? 'Receita' : 'Despesa'})\n`;
              resultMessage += `   📁 Categoria: ${transaction.category}\n`;
              resultMessage += `   📅 Data: ${transaction.date === new Date().toISOString().split('T')[0] ? 'Hoje' : transaction.date}\n\n`;
            }

            // Adicionar mensagem com resultados
            setMessages(prev => [...prev, {
              id: uuidv4(),
              text: resultMessage,
              sender: 'system',
              timestamp: new Date(),
              avatarUrl: IA_AVATAR
            }]);

            // Preparar ação pendente para confirmação (igual ao OCR)
            setEditableTransactions(transactionList);
            setPendingAction({
              tipo: 'generic_confirmation',
              dados: {
                ocrTransactions: transactionList,
                documentType: 'ai_list',
                establishment: 'Lista processada pela IA'
              }
            });
            setWaitingConfirmation(true);
            
            // Forçar scroll após definir transações editáveis
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 200);

            isTransactionJson = true;
          }
          // Transação individual (formato existente)
          else if ((parsed.tipo === 'receita' || parsed.tipo === 'despesa') &&
              parsed.hasOwnProperty('descrição') &&
              parsed.hasOwnProperty('valor')
          ) {
            setPendingAction({
              tipo: parsed.tipo === 'receita' ? 'income' : 'expense',
              dados: {
                description: parsed.descrição,
                amount: parseFloat(parsed.valor),
                category: parsed.categoria || null,
                date: parsed.data || null
              }
            });
            setWaitingConfirmation(true);
            isTransactionJson = true;
          } else if (parsed.action === "add_transaction" && parsed.transaction_type && parsed.description && parsed.amount) {
             const { transaction_type, description, amount, category, date } = parsed as GeminiTransactionIntent;
             setPendingAction({
               tipo: transaction_type === "income" ? "income" : "expense",
               dados: { description, amount, category: category || null, date: date || null }
             });
             setWaitingConfirmation(true);
             isTransactionJson = true;
          }
        }      
        } catch (e: any) {
          console.log("AI response not a transaction JSON or parse failed: ", e.message, "\nResponse: ", botResponseText);
          isTransactionJson = false;
        }
      } else {
        console.log('🔍 [CONSULTA] Pergunta identificada como consulta - pulando detecção de JSON');
      }

      // NOVO: Se não conseguiu detectar JSON, tentar detectar lista na resposta da IA em texto livre
      if (!isTransactionJson) {
        const aiTransactionList = detectTransactionListInAIResponse(botResponseText);
        if (aiTransactionList.length >= 2) {
          console.log("🤖 Lista de transações detectada na resposta da IA:", aiTransactionList);
          
          // Criar mensagem de confirmação similar ao fluxo do JSON
          let resultMessage = `🤖 Detectei ${aiTransactionList.length} transações na resposta!\n\n`;
          
          const totalAmount = aiTransactionList.reduce((sum: number, tx: any) => sum + tx.amount, 0);
          resultMessage += `💰 Total: R$ ${totalAmount.toFixed(2)}\n\n`;
          resultMessage += `Transações encontradas:\n\n`;

          // Listar cada transação
          for (let i = 0; i < aiTransactionList.length; i++) {
            const transaction = aiTransactionList[i];
            resultMessage += `${i + 1}. ${transaction.description}\n`;
            resultMessage += `   💵 R$ ${transaction.amount.toFixed(2)} (${transaction.type === 'income' ? 'Receita' : 'Despesa'})\n`;
            resultMessage += `   📁 Categoria: ${transaction.category}\n`;
            resultMessage += `   📅 Data: ${transaction.date === new Date().toISOString().split('T')[0] ? 'Hoje' : transaction.date}\n\n`;
          }

          // Adicionar mensagem com resultados
          setMessages(prev => [...prev, {
            id: uuidv4(),
            text: resultMessage,
            sender: 'system',
            timestamp: new Date(),
            avatarUrl: IA_AVATAR
          }]);

          // Preparar ação pendente para confirmação (igual ao OCR)
          setEditableTransactions(aiTransactionList);
          setPendingAction({
            tipo: 'generic_confirmation',
            dados: {
              ocrTransactions: aiTransactionList,
              documentType: 'ai_text_list',
              establishment: 'Lista processada pela IA (texto livre)'
            }
          });
          setWaitingConfirmation(true);
          
          // Forçar scroll após definir transações editáveis
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 200);

          setLoading(false);
          return;
        }
      }

      if (isTransactionJson) {
        setLoading(false);
        return; 
      }
      // If not a transaction JSON, confirmationMessageForChat (which is botResponseText) will be used by subsequent logic.

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
        }        setPendingAction({ tipo: pendingActionType, dados: actionData });
        setWaitingConfirmation(true);
        const botSystemMessage: ChatMessage = { id: uuidv4(), text: confirmationMessageForChat, sender: 'system', timestamp: new Date(), avatarUrl: IA_AVATAR };
        setMessages((prevMessages: ChatMessage[]) => [...prevMessages, botSystemMessage]);
        } else if (!pendingAction) { 
        // NOVO: Primeiro tentar detectar LISTA de transações
        const detectedTransactionList = detectTransactionListInText(message);
        
        if (detectedTransactionList.length >= 2) {
          // Detectou uma lista de transações - mostrar interface de revisão
          let resultMessage = `🤖 Detectei ${detectedTransactionList.length} transações na sua mensagem!\n\n`;
          
          const totalAmount = detectedTransactionList.reduce((sum, tx) => sum + tx.amount, 0);
          resultMessage += `💰 Total: R$ ${totalAmount.toFixed(2)}\n\n`;
          resultMessage += `Transações encontradas:\n\n`;

          // Listar cada transação
          for (let i = 0; i < detectedTransactionList.length; i++) {
            const transaction = detectedTransactionList[i];
            resultMessage += `${i + 1}. ${transaction.description}\n`;
            resultMessage += `   💵 R$ ${transaction.amount.toFixed(2)} (${transaction.type === 'income' ? 'Receita' : 'Despesa'})\n`;
            resultMessage += `   📁 Categoria: ${transaction.category}\n`;
            resultMessage += `   📅 Data: Hoje\n\n`;
          }          // Adicionar mensagem com resultados
          setMessages(prev => [...prev, {
            id: uuidv4(),
            text: resultMessage,
            sender: 'system',
            timestamp: new Date(),
            avatarUrl: IA_AVATAR
          }]);

          // Preparar ação pendente para confirmação (igual ao OCR)          console.log('🔍 Lista de transações detectada:', detectedTransactionList);
          setEditableTransactions(detectedTransactionList);
          setPendingAction({
            tipo: 'generic_confirmation',
            dados: {
              ocrTransactions: detectedTransactionList,
              documentType: 'text_list',
              establishment: 'Lista de transações'
            }
          });
          console.log('📝 PendingAction definida para lista de texto');
          setWaitingConfirmation(true);
          
          // Forçar scroll após definir transações editáveis
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 200);
        } else {
          // Se não é lista, tentar detectar transação individual
          const detectedTransaction = detectTransactionInText(botResponseText, message);
          
          if (detectedTransaction) {
            // Se detectamos uma transação, criar confirmação
            const transactionTypeWord = detectedTransaction.tipo === 'income' ? 'receita 🤑' : 'despesa 💸';
            const confirmationText = `📝 Detectei que você mencionou uma ${transactionTypeWord} de R$${detectedTransaction.dados.amount.toFixed(2)}${detectedTransaction.dados.description ? ` - ${detectedTransaction.dados.description}` : ''}.\n\nVocê confirma o registro desta transação? (sim/não)`;
            
            setPendingAction(detectedTransaction);
            setWaitingConfirmation(true);
            
            const botSystemMessage: ChatMessage = { id: uuidv4(), text: confirmationText, sender: 'system', timestamp: new Date(), avatarUrl: IA_AVATAR };
            setMessages((prevMessages: ChatMessage[]) => [...prevMessages, botSystemMessage]);
          } else {
            // Resposta normal se não detectou transação
            const botSystemMessage: ChatMessage = { id: uuidv4(), text: botResponseText, sender: 'system', timestamp: new Date(), avatarUrl: IA_AVATAR };
            setMessages((prevMessages: ChatMessage[]) => [...prevMessages, botSystemMessage]);
          }
        }
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
  };  // Função para detectar listas de transações em texto
  const detectTransactionListInText = (userMessage: string) => {
    const originalMessage = userMessage.toLowerCase();
    const transactions: any[] = [];
    
    // NOVO: Detectar padrão específico "ADICIONE ESSAS SAÍDAS:" e similares
    if (originalMessage.includes('adicione') || originalMessage.includes('inclua') || originalMessage.includes('registre')) {
      // Tentar quebrar por pontos seguidos de maiúscula (padrão de lista longa)
      const sentencePattern = /([A-ZÁÊÀÕ][^.]*?)\s*-\s*R\$\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/gi;
      const sentenceMatches = [...userMessage.matchAll(sentencePattern)];
      
      if (sentenceMatches.length >= 2) {
        for (const match of sentenceMatches) {
          let description = match[1].trim();
          let amountStr = match[2];
          
          // Remover palavras iniciais comuns
          description = description.replace(/^(adicione|inclua|registre|essas?|saídas?|gastos?)\s*/i, '');
          
          // Converter valor (tratar separadores de milhares)
          let amount = parseFloat(amountStr.replace(/[.,]/g, (match, offset, string) => {
            const remainingString = string.substring(offset + 1);
            if (remainingString.length === 2 && !remainingString.includes('.') && !remainingString.includes(',')) {
              return '.'; // É decimal
            }
            return ''; // É separador de milhares, remover
          }));
          
          // Se termina com /mês, é valor mensal
          if (description.toLowerCase().includes('/mês')) {
            description = description.replace(/\s*-\s*R\$.*$/i, '').trim();
          }
          
          // Limitar descrição
          if (description.length > 50) {
            const firstPart = description.split(/\s*-\s*/)[0];
            description = firstPart.length <= 50 ? firstPart : firstPart.substring(0, 50) + '...';
          }
          
          if (amount > 0 && description) {
            transactions.push({
              type: 'expense',
              amount: amount,
              description: description.charAt(0).toUpperCase() + description.slice(1),
              category: getCategoryFromDescription(description),
              date: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
    }
    
    // Se já encontrou transações com o padrão específico, retornar
    if (transactions.length >= 2) {
      console.log('Transações detectadas (padrão específico):', transactions);
      return transactions;
    }
    
    // Continuar com detecção por quebras de linha (método original)
    const lines = userMessage.split(/\n+/).filter(line => line.trim().length > 0);
    
    // Se tem múltiplas linhas, tentar processar cada uma como transação separada
    if (lines.length >= 2) {
      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine) continue;
        
        // Padrões para detectar valor em cada linha
        const valuePatterns = [
          /r\$\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/i, // R$ 1.000,00 ou R$ 1000.00
          /(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*(?:\/mês|por mês|mensal|reais?)/i, // 1000/mês
          /(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*-/i, // 1000 - descrição
        ];
        
        let amount = 0;
        let description = '';
        
        // Tentar extrair valor
        for (const pattern of valuePatterns) {
          const match = cleanLine.match(pattern);
          if (match) {
            let valueStr = match[1].replace(/[.,]/g, '');
            // Se termina com dois dígitos, é centavo
            if (valueStr.length >= 3) {
              amount = parseFloat(valueStr.slice(0, -2) + '.' + valueStr.slice(-2));
            } else {
              amount = parseFloat(valueStr);
            }
            break;
          }
        }
        
        // Se não encontrou valor com padrões específicos, tentar padrão mais simples
        if (amount === 0) {
          const simpleMatch = cleanLine.match(/(\d+(?:[.,]\d{2})?)/);
          if (simpleMatch) {
            amount = parseFloat(simpleMatch[1].replace(',', '.'));
          }
        }
        
        // Extrair descrição (primeira parte antes do valor ou dash)
        if (amount > 0) {
          // Remover o valor da linha para pegar a descrição
          description = cleanLine
            .replace(/r\$\s*\d+(?:[.,]\d{3})*(?:[.,]\d{2})?/i, '')
            .replace(/\s*-\s*.*$/i, '') // Remove tudo após o dash
            .replace(/^\s*-\s*/, '') // Remove dash no início
            .trim();
          
          // Se a descrição está vazia, tentar pegar a primeira parte
          if (!description) {
            const parts = cleanLine.split(/\s*-\s*/);
            description = parts[0].trim();
          }
          
          // Limitar descrição a algo razoável
          if (description.length > 50) {
            description = description.substring(0, 50) + '...';
          }
          
          if (description && amount > 0) {
            transactions.push({
              type: 'expense', // Assumir despesa por padrão para listas
              amount: amount,
              description: description.charAt(0).toUpperCase() + description.slice(1),
              category: getCategoryFromDescription(description),
              date: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
    }
    
    // Se não encontrou transações com quebras de linha, tentar método anterior (vírgulas)
    if (transactions.length === 0) {
      // Tentar detectar lista com padrões mais simples primeiro
      const simpleListMatch = originalMessage.match(/(?:gastei|paguei|comprei).*?(?:,.*){1,}/);
      if (simpleListMatch) {
        // Quebrar por vírgulas e processar cada item
        const parts = originalMessage.split(/[,;]|\s+e\s+/).filter(part => part.trim());
        
        for (const part of parts) {
          const cleanPart = part.trim();
          if (!cleanPart) continue;
          
          // Extrair valor e descrição de cada parte
          const valueMatch = cleanPart.match(/(?:r\$\s*)?(\d+(?:[,.]\d{2})?)/);
          const locationMatch = cleanPart.match(/(?:no|na|em|do|da|para)\s+([^,;.!?]+)/);
          
          if (valueMatch) {
            const amount = parseFloat(valueMatch[1].replace(',', '.'));
            let description = '';
            
            if (locationMatch) {
              description = locationMatch[1].trim();
            } else {
              // Tentar extrair descrição de outras formas
              const words = cleanPart.split(/\s+/);
              const nonNumericWords = words.filter(word => !word.match(/^\d+([,.]\d{2})?$/) && !word.match(/^r\$$/i));
              description = nonNumericWords.slice(-2).join(' '); // Pegar últimas 2 palavras
            }
            
            if (description) {
              transactions.push({
                type: 'expense',
                amount: amount,
                description: description.charAt(0).toUpperCase() + description.slice(1),
                category: getCategoryFromDescription(description),
                date: new Date().toISOString().split('T')[0]
              });
            }
          }
        }
      }
      
      // Se ainda não encontrou, tentar padrões mais complexos
      if (transactions.length === 0) {
        // Procurar por padrões como "50 no mercado, 30 na farmácia"
        const complexMatches = [...originalMessage.matchAll(/(\d+(?:[,.]\d{2})?)\s*(?:reais?)?\s+(?:no|na|em|do|da|para)\s+([^,;.!?]+)/gi)];
        
        for (const match of complexMatches) {
          const amount = parseFloat(match[1].replace(',', '.'));
          const description = match[2].trim();
          
          if (amount > 0 && description) {
            transactions.push({
              type: 'expense',
              amount: amount,
              description: description.charAt(0).toUpperCase() + description.slice(1),
              category: getCategoryFromDescription(description),
              date: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
    }
    
    // Log para debug
    console.log('Transações detectadas:', transactions);
    
    return transactions.length >= 2 ? transactions : []; // Só considerar lista se tiver 2+ transações
  };
    // Função para inferir categoria baseada na descrição
  const getCategoryFromDescription = (description: string) => {
    const desc = description.toLowerCase();
    
    // Moradia e habitação
    if (desc.includes('aluguel') || desc.includes('apartamento') || desc.includes('condomínio') || 
        desc.includes('taxa de condomínio') || desc.includes('casa') || desc.includes('imóvel')) {
      return 'Moradia';
    }
    
    // Saúde
    if (desc.includes('plano de saúde') || desc.includes('saúde') || desc.includes('farmácia') || 
        desc.includes('remédio') || desc.includes('medicina') || desc.includes('médico') ||
        desc.includes('consulta') || desc.includes('exame') || desc.includes('hospital')) {
      return 'Saúde';
    }
    
    // Internet e tecnologia
    if (desc.includes('internet') || desc.includes('5g') || desc.includes('wifi') || 
        desc.includes('conexão') || desc.includes('streaming') || desc.includes('aplicativo') ||
        desc.includes('app') || desc.includes('software') || desc.includes('tecnologia')) {
      return 'Internet/Tecnologia';
    }
    
    // Educação
    if (desc.includes('curso') || desc.includes('idiomas') || desc.includes('educação') || 
        desc.includes('aula') || desc.includes('professor') || desc.includes('ensino') ||
        desc.includes('treinamento') || desc.includes('capacitação')) {
      return 'Educação';
    }
    
    // Transporte e veículos
    if (desc.includes('carro') || desc.includes('veículo') || desc.includes('manutenção') ||
        desc.includes('gasolina') || desc.includes('combustível') || desc.includes('posto') ||
        desc.includes('seguro') || desc.includes('revisão') || desc.includes('elétrico')) {
      return 'Transporte';
    }
    
    // Telefonia
    if (desc.includes('telefonia') || desc.includes('celular') || desc.includes('móvel') ||
        desc.includes('ligação') || desc.includes('dados') || desc.includes('roaming') ||
        desc.includes('plano') && (desc.includes('telefone') || desc.includes('celular'))) {
      return 'Telefonia';
    }
    
    // Entretenimento e lazer
    if (desc.includes('clube') || desc.includes('assinatura') || desc.includes('vinhos') ||
        desc.includes('entretenimento') || desc.includes('lazer') || desc.includes('netflix') ||
        desc.includes('spotify') || desc.includes('fitness') || desc.includes('academia') ||
        desc.includes('treino') || desc.includes('personal')) {
      return 'Entretenimento';
    }
    
    // Serviços domésticos
    if (desc.includes('limpeza') || desc.includes('faxina') || desc.includes('serviço') ||
        desc.includes('doméstico') || desc.includes('residencial') || desc.includes('casa')) {
      return 'Serviços';
    }
      // Alimentação (mantendo os anteriores)
    if (desc.includes('mercado') || desc.includes('supermercado') || desc.includes('feira') ||
        desc.includes('restaurante') || desc.includes('lanche') || desc.includes('comida') ||
        desc.includes('padaria') || desc.includes('açougue') || desc.includes('delivery') ||
        desc.includes('ifood') || desc.includes('uber eats') || desc.includes('pizza') ||
        desc.includes('hamburguer') || desc.includes('sanduiche') || desc.includes('café') ||
        desc.includes('almoço') || desc.includes('jantar') || desc.includes('bebida')) {
      return 'Alimentação';
    }
    
    // Transporte (mais abrangente)
    if (desc.includes('uber') || desc.includes('99') || desc.includes('táxi') ||
        desc.includes('ônibus') || desc.includes('metro') || desc.includes('combustível') ||
        desc.includes('gasolina') || desc.includes('posto') || desc.includes('pedágio') ||
        desc.includes('estacionamento') || desc.includes('carro') || desc.includes('moto')) {
      return 'Transporte';
    }
    
    // Contas (mantendo os anteriores)
    if (desc.includes('conta') || desc.includes('boleto') || desc.includes('fatura') ||
        desc.includes('taxa')) {
      return 'Contas';
    }
    
    // Compras (mantendo os anteriores)
    if (desc.includes('shopping') || desc.includes('loja') || desc.includes('roupa') ||
        desc.includes('compra')) {
      return 'Compras';
    }
      return 'Outros';
  };

  // Função para detectar listas de transações em respostas de texto livre da IA
  const detectTransactionListInAIResponse = (aiResponse: string): any[] => {
    const transactions: any[] = [];
    
    // Padrões para detectar listas de transações nas respostas da IA
    const responseLines = aiResponse.split(/\n+/).filter(line => line.trim().length > 0);
    
    for (const line of responseLines) {
      const cleanLine = line.trim();
      if (!cleanLine) continue;
      
      // Padrões comuns da IA para listar transações
      const patterns = [
        // Padrão: "1. Descrição - R$ 100,00"
        /^\d+\.\s*(.+?)\s*-\s*R\$\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/i,
        // Padrão: "• Descrição: R$ 100,00"
        /^[•\-*]\s*(.+?):\s*R\$\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/i,
        // Padrão: "Descrição: R$ 100"
        /^(.+?):\s*R\$\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)/i,
        // Padrão: "R$ 100 - Descrição"
        /^R\$\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s*-\s*(.+)/i,
        // Padrão: "R$ 100 para Descrição"
        /^R\$\s*(\d+(?:[.,]\d{3})*(?:[.,]\d{2})?)\s+(?:para|em|no|na)\s+(.+)/i
      ];
      
      for (const pattern of patterns) {
        const match = cleanLine.match(pattern);
        if (match) {
          let description = '';
          let amountStr = '';
          
          // Dependendo do padrão, a descrição e valor podem estar em posições diferentes
          if (pattern.source.includes('R\\$\\s*\\(\\d+')) {
            // Padrões onde valor vem depois da descrição
            if (match[2]) {
              description = match[1].trim();
              amountStr = match[2];
            }
          } else {
            // Padrões onde valor vem antes da descrição
            if (match[1] && match[2]) {
              if (match[1].match(/^\d/)) {
                // Primeiro grupo é valor
                amountStr = match[1];
                description = match[2].trim();
              } else {
                // Primeiro grupo é descrição
                description = match[1].trim();
                amountStr = match[2];
              }
            }
          }
          
          if (description && amountStr) {
            // Limpar descrição de formatação desnecessária
            description = description
              .replace(/^\d+\.\s*/, '') // Remove numeração
              .replace(/^[•\-*]\s*/, '') // Remove marcadores
              .replace(/:\s*$/, '') // Remove dois pontos finais
              .trim();
            
            // Converter valor
            const amount = parseFloat(amountStr.replace(/[.,]/g, (match, offset, string) => {
              // Se é a última vírgula/ponto e tem 2 dígitos após, é decimal
              const remainingString = string.substring(offset + 1);
              if (remainingString.length === 2 && !remainingString.includes('.') && !remainingString.includes(',')) {
                return '.';
              }
              return '';
            }));
            
            if (amount > 0 && description.length > 0) {
              transactions.push({
                type: 'expense', // Assumir despesa por padrão
                amount: amount,
                description: description.charAt(0).toUpperCase() + description.slice(1),
                category: getCategoryFromDescription(description),
                date: new Date().toISOString().split('T')[0]
              });
            }
          }
          break; // Parou no primeiro padrão que funcionou
        }
      }
    }
    
    // Também tentar detectar padrões mais complexos em texto corrido
    if (transactions.length === 0) {
      // Padrões para texto corrido com múltiplas transações
      const complexPatterns = [
        // "gastou R$ 50 no mercado, R$ 30 na farmácia"
        /R\$\s*(\d+(?:[.,]\d{2})?)\s+(?:no|na|em|para|do|da)\s+([^,;.!?]+)/gi,
        // "50 reais no mercado, 30 na farmácia"
        /(\d+(?:[.,]\d{2})?)\s*reais?\s+(?:no|na|em|para|do|da)\s+([^,;.!?]+)/gi
      ];
      
      for (const pattern of complexPatterns) {
        const matches = [...aiResponse.matchAll(pattern)];
        
        for (const match of matches) {
          const amount = parseFloat(match[1].replace(',', '.'));
          const description = match[2].trim();
          
          if (amount > 0 && description) {
            transactions.push({
              type: 'expense',
              amount: amount,
              description: description.charAt(0).toUpperCase() + description.slice(1),
              category: getCategoryFromDescription(description),
              date: new Date().toISOString().split('T')[0]
            });
          }
        }
      }
    }
    
    console.log('🤖 Transações detectadas na resposta da IA:', transactions);
    
    return transactions.length >= 2 ? transactions : []; // Só considerar lista se tiver 2+ transações
  };

  // Função de fallback para detectar transações que a IA pode ter perdido
  const detectTransactionInText = (text: string, userMessage: string) => {
    const originalMessage = userMessage.toLowerCase();
    
    // Padrões para receitas - incluindo "achar", "encontrar", etc.
    const incomePatterns = [
      /(?:ganhei|recebi|entrou|lucrei|vendi\s+por|salário\s+de|freelance\s+de|veio)\s+(?:r\$\s*)?(\d+(?:[,.]\d{2})?)/i,
      /(?:achei|encontrei|apareceu|surgiu|chegou)\s+(?:r\$\s*)?(\d+(?:[,.]\d{2})?)/i,
      /(\d+(?:[,.]\d{2})?)\s*(?:reais?)?\s+(?:que\s+)?(?:ganhei|recebi|da\s+vovó|do\s+trabalho|de\s+salário|que\s+veio|no\s+chão|na\s+rua)/i,
      /adicione?\s+(\d+(?:[,.]\d{2})?)\s*(?:reais?)?\s+(?:que\s+)?(?:ganhei|recebi|achei|encontrei)/i
    ];
    
    // Padrões para despesas - mais específicos para evitar confusão
    const expensePatterns = [
      /(?:gastei|paguei|comprei\s+por|saiu|custou)\s+(?:r\$\s*)?(\d+(?:[,.]\d{2})?)/i,
      /(?:perdi)\s+(?:r\$\s*)?(\d+(?:[,.]\d{2})?)\s+(?:no|na|em|do|da)\s+(jogo|aposta|loteria|cassino|bingo)/i,
      /(?:joguei|apostei)\s+(?:r\$\s*)?(\d+(?:[,.]\d{2})?)/i,
      /(\d+(?:[,.]\d{2})?)\s*(?:reais?)?\s+(?:no|na|do|da|para)\s+(?:mercado|supermercado|farmácia|conta|boleto)/i
    ];
    
    let transactionType: 'income' | 'expense' | null = null;
    let amount: number = 0;
    let description = '';
    
    // Verificar receitas PRIMEIRO (prioridade para casos ambíguos)
    for (const pattern of incomePatterns) {
      const match = originalMessage.match(pattern);
      if (match) {
        transactionType = 'income';
        amount = parseFloat(match[1].replace(',', '.'));
        
        // Extrair descrição do contexto
        if (originalMessage.includes('vovó')) {
          const vovMatch = originalMessage.match(/(?:da|de)\s+(vovó\s+\w+|vovó)/i);
          description = vovMatch ? `Receita da ${vovMatch[1]}` : 'Receita da vovó';
        } else if (originalMessage.includes('chão') || originalMessage.includes('rua')) {
          description = 'Dinheiro encontrado';
        } else if (originalMessage.includes('trabalho')) {
          description = 'Receita do trabalho';
        } else if (originalMessage.includes('salário')) {
          description = 'Salário';
        } else if (originalMessage.includes('freelance')) {
          description = 'Freelance';
        } else if (originalMessage.includes('achei') || originalMessage.includes('encontrei')) {
          description = 'Dinheiro encontrado';
        } else {
          description = `Receita de R$${amount.toFixed(2)}`;
        }
        break;
      }
    }
    
    // Verificar despesas APENAS se não encontrou receita
    if (!transactionType) {
      for (const pattern of expensePatterns) {
        const match = originalMessage.match(pattern);
        if (match) {
          transactionType = 'expense';
          amount = parseFloat(match[1].replace(',', '.'));
          
          // Extrair descrição
          if (originalMessage.includes('jogo do bicho')) {
            description = 'Jogo do bicho';
          } else if (originalMessage.includes('mercado') || originalMessage.includes('supermercado')) {
            description = 'Supermercado';
          } else if (originalMessage.includes('farmácia')) {
            description = 'Farmácia';
          } else if (originalMessage.includes('conta') || originalMessage.includes('boleto')) {
            description = 'Pagamento de conta';
          } else if (match[2]) {
            description = match[2].trim();
          } else {
            // Tentar extrair contexto da frase
            const contextMatch = originalMessage.match(/(?:no|na|em|do|da|para)\s+([^,.!?]+)/i);
            description = contextMatch ? contextMatch[1].trim() : `Despesa de R$${amount.toFixed(2)}`;
          }
          break;
        }
      }
    }
    
    if (transactionType && amount > 0) {
      return {
        tipo: transactionType,
        dados: {
          description: description,
          amount: amount,
          category: null,
          date: null
        }
      };
    }
    
    return null;
  };

  const initialSuggestions = [
    'Verificar Saldo',
    'Registrar Despesa',
    'Registrar Receita',
    'Resumo Financeiro',
  ];

  const suggestions = [
    { key: "howToSaveMore", text: t("howToSaveMore") || 'Como economizar mais?' },
    { key: "biggestExpenses", text: t("biggestExpenses") || 'Quais são meus maiores gastos?' },
    { key: "createBudget", text: t("createBudget") || 'Como criar um orçamento?' },
    { key: "investOrPayDebt", text: t("investOrPayDebt") || 'Devo investir ou pagar dívidas?' }
  ];

const handleTabChange = (tabValue: string) => {
  setActiveTab(tabValue);
}

// Função para processar imagem OCR
const handleImageUpload = async (imageBase64: string) => {
  if (!imageBase64) return;

  setLoading(true);
  setError("");

  try {
    // Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Usuário não autenticado");
    }

    // Obter token de sessão
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      throw new Error("Erro ao obter sessão");
    }

    // Detectar se é arquivo de texto/planilha ou imagem/PDF
    let isTextFile = false;
    let fileData: any = null;
    
    try {
      fileData = JSON.parse(imageBase64);
      isTextFile = true;
      console.log('📄 Arquivo de texto/planilha detectado:', fileData.fileName, fileData.fileType);
    } catch {
      // Não é JSON, continuar como imagem/PDF
      console.log('🖼️ Arquivo de imagem/PDF detectado');
    }    // Adicionar mensagem de upload com feedback visual adequado
    const isPdf = !isTextFile && imageBase64.startsWith('data:application/pdf');
    const processingMessageId = uuidv4();
    let processingMessage = "";
    
    if (isTextFile) {
      const fileType = fileData?.fileType || 'text/plain';
      if (fileType.includes('csv')) {
        processingMessage = "📊 Analisando planilha CSV...";
      } else if (fileType.includes('excel') || fileType.includes('sheet')) {
        processingMessage = "📋 Processando planilha Excel...";
      } else if (fileType.includes('text')) {
        processingMessage = "📄 Lendo arquivo de texto...";
      } else {
        processingMessage = "🔍 Analisando arquivo...";
      }
    } else if (isPdf) {
      processingMessage = "📑 Analisando documento...";
    } else {
      processingMessage = "📄 Analisando documento...";
    }

    setMessages(prev => [...prev, {
      id: processingMessageId,
      text: processingMessage + "\n\n⏳ *Aguarde alguns segundos, estamos analisando seu documento...*",
      sender: 'system',
      timestamp: new Date(),
      avatarUrl: IA_AVATAR
    }]);

    // Chamar API de OCR funcional com timeout ajustadopara plano gratuito Vercel (60s máximo)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55 segundos (deixa margem para o Vercel)
    
    // Preparar dados para envio baseado no tipo de arquivo
    let requestBody: any;
    
    if (isTextFile && fileData) {
      // Arquivo de texto/planilha
      requestBody = {
        fileName: fileData.fileName,
        fileType: fileData.fileType,
        textData: fileData.textData,
        csvData: fileData.textData, // Para compatibilidade
        excelData: fileData.excelData // Para arquivos Excel
      };
      console.log('📤 Enviando arquivo de texto/planilha para API:', fileData.fileName);
    } else {
      // Imagem/PDF tradicional
      requestBody = {
        imageBase64: imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64
      };
      console.log('📤 Enviando imagem/PDF para API');
    }
    
    const response = await fetch('/api/gemini-ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
      clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      console.error('Erro da API OCR:', errorData);
      
      // Verificar se é erro de abort (timeout do cliente)
      if (controller.signal.aborted) {        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: "⏱️ Timeout no Processamento (1 minuto)\n\nO documento demorou muito para processar.\n\n💡 Soluções recomendadas:\n• Para PDFs grandes: Divida em seções menores ou use imagens\n• Para extratos longos: Faça capturas de tela de partes específicas\n• Alternativa rápida: Tire fotos das páginas importantes\n• Documentos complexos: Simplifique removendo páginas extras\n\n🔄 Quer tentar novamente? Envie um documento menor ou em formato de imagem.",
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        }]);
        setLoading(false);
        return;
      }
      
      // Verificar se é erro de timeout (504) do servidor
      if (response.status === 504 || response.status === 502 || errorData.error?.includes('timeout') || errorData.error?.includes('504') || errorData.error?.includes('502')) {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: "🔄 Servidor Sobrecarregado\n\nO servidor está processando muitos documentos no momento.\n\n💡 Soluções:\n• Aguarde 2-3 minutos e tente novamente\n• Use imagens ao invés de PDFs (mais rápido)\n• Divida documentos grandes em partes menores\n• Horários alternativos: Tente em horários de menor uso\n\n✨ Dica: Imagens (JPG/PNG) são processadas mais rapidamente que PDFs!",
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        }]);
        setLoading(false);
        return;
      }
      
      // Verificar se é PDF protegido (nova detecção)
      if (errorData.isPdfProtected || errorData.error?.includes('PDF protegido')) {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: errorData.message || "🔒 PDF Protegido Detectado\n\nEste PDF está protegido por senha e não pode ser processado.\n\n💡 Solução: Faça uma captura de tela (screenshot) do PDF aberto e envie a imagem.",
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        }]);
        setLoading(false);
        return;
      }
      
      // Verificar se é erro específico do Gemini "no pages"
      if (errorData.details?.includes('The document has no pages')) {
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: "📄 Erro ao processar PDF\n\nEste PDF não pôde ser processado. Possíveis causas:\n• PDF protegido por senha\n• PDF corrompido\n• Formato não suportado\n\n💡 Solução: Faça uma captura de tela (screenshot) do PDF e envie a imagem.",
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        }]);
        setLoading(false);
        return;      }
        // Verificar se precisa de revisão manual (documento mal processado)
      if (errorData.needsManualReview) {
        let suggestionText = "❌ Arquivo não foi lido corretamente\n\n";
        suggestionText += errorData.details || "O sistema não conseguiu processar este arquivo.";
        
        if (errorData.suggestions && errorData.suggestions.length > 0) {
          suggestionText += "\n\nComo resolver:\n";
          errorData.suggestions.forEach((suggestion: string) => {
            suggestionText += `${suggestion}\n`;
          });
        } else {
          suggestionText += "\n\nComo resolver:\n";
          suggestionText += "✅ OPÇÃO 1: Tire uma FOTO clara do extrato com seu celular\n";
          suggestionText += "✅ OPÇÃO 2: Copie o texto do extrato e cole aqui no chat\n";
          suggestionText += "✅ OPÇÃO 3: Salve como PDF e tente novamente\n";
        }
        
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: suggestionText,
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        }]);
        setLoading(false);
        return;
      }
      
      throw new Error(errorData.error || `Erro HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('Resultado da API OCR:', result);
    
    if (!result.success) {
      throw new Error(result.error || 'Falha no processamento do documento');
    }

    const ocrData = result.data;
    const transactions = ocrData.transactions;    // Criar mensagem com resultados e instruções claras
    let resultMessage = `✅ **Documento processado com sucesso!**\n\n`;
    resultMessage += `📋 **Tipo:** ${ocrData.documentType.replace('_', ' ')}\n`;
    resultMessage += `💰 **Total:** R$ ${ocrData.summary.totalAmount.toFixed(2)}\n`;
    
    if (ocrData.summary.establishment) {
      resultMessage += `🏪 **Local:** ${ocrData.summary.establishment}\n`;
    }
    
    if (ocrData.summary.period) {
      resultMessage += `📅 **Período:** ${ocrData.summary.period}\n`;
    }
    
    resultMessage += `\n🔍 **${transactions.length} transações identificadas:**\n\n`;
    
    // Mostrar TODAS as transações identificadas (removido limite de 3)
    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      resultMessage += `${i + 1}. **${transaction.description}**\n`;
      resultMessage += `   💵 R$ ${transaction.amount.toFixed(2)} (${transaction.type === 'income' ? '✅ Receita' : '❌ Despesa'})\n`;
      resultMessage += `   📁 ${transaction.category} • 📅 ${transaction.date || 'Hoje'}\n\n`;
    }
    
    resultMessage += `👇 **PRÓXIMOS PASSOS:**\n`;
    resultMessage += `• **Revise** as transações abaixo\n`;
    resultMessage += `• **Edite** valores se necessário\n`;
    resultMessage += `• **Confirme** para salvar no seu Dashboard\n`;
    resultMessage += `• Após confirmar, as transações aparecerão em "Últimas Transações"`;// Adicionar mensagem com resultados
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text: resultMessage,
      sender: 'system',
      timestamp: new Date(),
      avatarUrl: IA_AVATAR
    }]);    // Preparar ação pendente para confirmação
    console.log('📷 OCR processado:', transactions.length, 'transações');
    setEditableTransactions(transactions); // Armazenar transações editáveis
    setPendingAction({
      tipo: 'generic_confirmation',
      dados: {
        ocrTransactions: transactions,
        documentType: ocrData.documentType,
        establishment: ocrData.summary.establishment
      }
    });
    console.log('📝 PendingAction definida para OCR');
    setWaitingConfirmation(true);
    
    // Forçar scroll após definir transações editáveis para OCR
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 200);  } catch (err: any) {
    console.error('Erro ao processar imagem:', err);
    console.error('Erro completo:', err.stack);
    
    let errorMessage = 'Erro desconhecido';
    if (err.message) {
      errorMessage = err.message;
    } else if (typeof err === 'string') {
      errorMessage = err;
    }
    
    // Verificar se é erro de abort (timeout)
    if (err.name === 'AbortError' || errorMessage.includes('aborted')) {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: "⏱️ **Processamento Interrompido**\n\nO processamento foi cancelado devido ao tempo limite.\n\n💡 **Tente estas alternativas:**\n• **Imagens menores:** Corte o documento em seções\n• **Formato diferente:** Use JPG/PNG ao invés de PDF\n• **Qualidade reduzida:** Comprima a imagem antes de enviar\n• **Tentar novamente:** Aguarde alguns minutos e envie novamente",
        sender: 'system',
        timestamp: new Date(),
        avatarUrl: IA_AVATAR
      }]);
    } else {
      setError(errorMessage);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: `❌ **Erro ao processar documento**\n\n${errorMessage}\n\n💡 **Sugestões:**\n• Verifique se o arquivo não está corrompido\n• Para PDFs protegidos, faça uma captura de tela\n• Tente usar formato de imagem (JPG/PNG)\n• Reduza o tamanho do arquivo se muito grande`,
        sender: 'system',
        timestamp: new Date(),
        avatarUrl: IA_AVATAR      }]);
    }  } finally {
    // Cleanup básico
    setLoading(false);
  }
};

// Funções para editar transações OCR
const updateTransaction = (index: number, updatedTransaction: any) => {
  const newTransactions = [...editableTransactions];
  newTransactions[index] = updatedTransaction;
  setEditableTransactions(newTransactions);
  
  // Atualizar também o pendingAction
  if (pendingAction) {
    setPendingAction({
      ...pendingAction,
      dados: {
        ...pendingAction.dados,
        ocrTransactions: newTransactions
      }
    });
  }
};

const deleteTransaction = (index: number) => {
  const newTransactions = editableTransactions.filter((_, i) => i !== index);
  setEditableTransactions(newTransactions);
  
  // Atualizar também o pendingAction
  if (pendingAction) {
    setPendingAction({
      ...pendingAction,
      dados: {
        ...pendingAction.dados,
        ocrTransactions: newTransactions
      }
    });
  }
  
  // Se não há mais transações, cancelar a confirmação
  if (newTransactions.length === 0) {
    setWaitingConfirmation(false);
    setPendingAction(null);
    setEditableTransactions([]);
    
    setMessages(prev => [...prev, {
      id: uuidv4(),
      text: "❌ Todas as transações foram removidas. Operação cancelada.",
      sender: 'system',
      timestamp: new Date(),
      avatarUrl: IA_AVATAR
    }]);
  }
};

return (
  <>    <div 
      className="financial-advisor-page"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important',
        minHeight: '100vh',
        width: '100vw',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '0px', // Removido espaço extra
        overflow: 'hidden', // Evita scroll horizontal
        position: 'relative'
      }}
    >      {/* Header - CORRIGIDO */}
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
      >        <div 
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
        <div 
          className="user-info"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}
        >
          <button 
            className="cancel-button"
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
            Voltar
          </button>
          <div 
            className="user-avatar"
            style={{
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 600,
              fontSize: '16px'
            }}
          >
            {getCurrentUser()?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </div>
      </div>      {/* Chat Container - AJUSTADO */}
      <div 
        className="chat-container"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%',
          padding: '0 20px',
          paddingTop: '80px', // Espaço para header fixo
          paddingBottom: '90px', // Espaço adequado para input fixo
          boxSizing: 'border-box',
          minHeight: 'calc(100vh - 80px)' // Ajustado para header fixo
        }}
      ><div 
          className="chat-messages"
          style={{
            flex: 1,
            padding: '20px 0',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            minHeight: '400px'
          }}
        >
          {/* Error Display */}
          {error && (            <div 
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

          {/* Messages */}
          {messages.map((message, index) => (
            <React.Fragment key={index}>
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
              {message.sender === 'system' && message.text.includes('Processando') && (
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
              )}              {/* Regular Messages */}
              {!(message.sender === 'system' && message.text.includes('Processando')) && (
                <div 
                  className={`message ${message.sender}`}
                  style={{
                    maxWidth: '70%',
                    padding: '16px 20px',
                    fontSize: '15px',
                    lineHeight: '1.5',
                    wordWrap: 'break-word',
                    ...(message.sender === 'system' ? {
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      alignSelf: 'flex-start',
                      borderRadius: '20px 20px 20px 6px'
                    } : {
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: '#2d3748',
                      alignSelf: 'flex-end',
                      borderRadius: '20px 20px 6px 20px',
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                    })
                  }}                >
                  {formatMessageContent(message.text)}
                  
                  {/* Sugestões integradas na primeira mensagem do sistema */}
                  {showSuggestions && message.sender === 'system' && index === 0 && !pendingAction && (
                    <div style={{ 
                      marginTop: '15px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      {initialSuggestions.map((sug: string, sugIndex: number) => (
                        <button
                          key={sugIndex}
                          onClick={() => handleSuggestionClick(sug)}
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '15px',
                            padding: '6px 12px',
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </React.Fragment>          ))}          {/* Scroll anchor para posicionar no final */}
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
      </div>      {/* Transaction Review Modal - REWORK COMPLETO */}
      {waitingConfirmation && editableTransactions.length > 0 && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(15px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1002,
            padding: '10px'
          }}
        >
          <div 
            className="modal-content"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              height: '90vh',
              maxHeight: '700px',
              display: 'flex',
              flexDirection: 'column',
              color: 'white',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              overflow: 'hidden'
            }}
          >
            {/* Header do Modal */}
            <div style={{
              padding: '20px 25px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  📋 Revisar Transações
                </h2>
                <p style={{
                  margin: '5px 0 0 0',
                  fontSize: '14px',
                  opacity: 0.8
                }}>
                  {editableTransactions.length} transaç{editableTransactions.length > 1 ? 'ões' : 'ão'} encontrada{editableTransactions.length > 1 ? 's' : ''}
                </p>
                <p style={{
                  margin: '3px 0 0 0',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#fbbf24',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}>
                  Total: R$ {editableTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => handleSendMessage('não')}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  padding: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Lista de Transações */}
            <div style={{
              flex: 1,
              padding: '20px 25px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              {editableTransactions.map((transaction, index) => (
                <div key={index} style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '15px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        {transaction.type === 'income' ? '💰' : '💸'}
                        <input
                          type="text"
                          value={transaction.description || ''}
                          onChange={(e) => updateTransaction(index, { ...transaction, description: e.target.value })}
                          placeholder="Descrição da transação..."
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            color: 'white',
                            fontSize: '14px',
                            flex: 1,
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '10px',
                        marginBottom: '10px'
                      }}>
                        <div>
                          <label style={{ fontSize: '12px', opacity: 0.8, display: 'block', marginBottom: '5px' }}>
                            Valor (R$)
                          </label>
                          <input
                            type="number"
                            value={Math.abs(transaction.amount || 0)}
                            onChange={(e) => updateTransaction(index, { 
                              ...transaction, 
                              amount: transaction.type === 'expense' ? -Math.abs(parseFloat(e.target.value) || 0) : Math.abs(parseFloat(e.target.value) || 0)
                            })}
                            style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              color: 'white',
                              fontSize: '14px',
                              width: '100%',
                              outline: 'none'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label style={{ fontSize: '12px', opacity: 0.8, display: 'block', marginBottom: '5px' }}>
                            Data
                          </label>
                          <input
                            type="date"
                            value={transaction.date || new Date().toISOString().split('T')[0]}
                            onChange={(e) => updateTransaction(index, { ...transaction, date: e.target.value })}
                            style={{
                              background: 'rgba(255, 255, 255, 0.2)',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              color: 'white',
                              fontSize: '14px',
                              width: '100%',
                              outline: 'none'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', opacity: 0.8, display: 'block', marginBottom: '5px' }}>
                          Categoria
                        </label>
                        <select
                          value={transaction.category || ''}
                          onChange={(e) => updateTransaction(index, { ...transaction, category: e.target.value })}
                          style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            color: 'white',
                            fontSize: '14px',
                            width: '100%',
                            outline: 'none'
                          }}
                        >
                          <option value="" style={{ background: '#333', color: 'white' }}>Selecione uma categoria</option>
                          <option value="alimentacao" style={{ background: '#333', color: 'white' }}>🍽️ Alimentação</option>
                          <option value="transporte" style={{ background: '#333', color: 'white' }}>🚗 Transporte</option>
                          <option value="lazer" style={{ background: '#333', color: 'white' }}>🎮 Lazer</option>
                          <option value="saude" style={{ background: '#333', color: 'white' }}>⚕️ Saúde</option>
                          <option value="educacao" style={{ background: '#333', color: 'white' }}>📚 Educação</option>
                          <option value="casa" style={{ background: '#333', color: 'white' }}>🏠 Casa</option>
                          <option value="trabalho" style={{ background: '#333', color: 'white' }}>💼 Trabalho</option>
                          <option value="outros" style={{ background: '#333', color: 'white' }}>📦 Outros</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTransaction(index)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        borderRadius: '8px',
                        color: '#ff6b6b',
                        padding: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        marginLeft: '10px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer com Botões */}
            <div style={{
              padding: '20px 25px',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              gap: '15px',
              justifyContent: 'space-between'
            }}>
              <button
                onClick={() => handleSendMessage('não')}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '12px',
                  color: '#ff6b6b',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  flex: 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                ❌ Cancelar
              </button>
              
              <button
                onClick={() => handleSendMessage('sim')}
                disabled={savingTransactions}
                style={{
                  background: savingTransactions 
                    ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '12px 24px',
                  cursor: savingTransactions ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  flex: 2,
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  opacity: savingTransactions ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!savingTransactions) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!savingTransactions) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                  }
                }}
              >
                {savingTransactions ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando {editableTransactions.length} Transaç{editableTransactions.length > 1 ? 'ões' : 'ão'}...
                  </>
                ) : (
                  `✅ Salvar ${editableTransactions.length} Transaç${editableTransactions.length > 1 ? 'ões' : 'ão'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}      {/* Confirmation Popup - Pequeno popup na parte inferior */}
      {waitingConfirmation && pendingAction && editableTransactions.length === 0 && (
        <div 
          className="confirmation-popup"
          style={{
            position: 'fixed',
            bottom: '100px', // Acima da barra de input
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            padding: '16px 20px',
            maxWidth: '350px',
            width: '90%',
            color: '#2d3748',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            zIndex: 999,
            animation: 'slideUpFadeIn 0.3s ease-out',
            textAlign: 'center'
          }}
        >
          <div style={{ marginBottom: '12px' }}>
            <p style={{ 
              fontSize: '14px',
              fontWeight: '600',
              margin: '0 0 8px 0',
              lineHeight: '1.3'
            }}>
              Você deseja confirmar a {pendingAction.tipo === 'income' ? 'entrada' : 'saída'} no valor de{' '}
              <span style={{ 
                color: pendingAction.tipo === 'income' ? '#16a34a' : '#dc2626',
                fontWeight: '700'
              }}>
                R$ {pendingAction.dados.amount?.toFixed(2) || '0,00'}
              </span>?
            </p>
            {pendingAction.dados.description && (
              <p style={{ 
                fontSize: '12px',
                color: '#666',
                margin: '0',
                lineHeight: '1.2'
              }}>
                {pendingAction.dados.description}
              </p>
            )}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            justifyContent: 'center'
          }}>
            <button
              onClick={() => handleSendMessage('não')}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flex: 1,
                justifyContent: 'center'
              }}
            >
              ❌ Cancelar
            </button>
            <button              
              onClick={() => handleSendMessage('sim')}
              disabled={savingTransactions}
              style={{
                background: savingTransactions 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)' 
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: '600',
                fontSize: '12px',
                cursor: savingTransactions ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                flex: 1,
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                opacity: savingTransactions ? 0.7 : 1
              }}
            >
              {savingTransactions ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Salvando...
                </>
              ) : (
                '✅ Confirmar'
              )}
            </button>
          </div>
        </div>
      )}{/* CSS Animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
            @keyframes modalSlideIn {
            0% { 
              opacity: 0; 
              transform: translateY(-30px) scale(0.95); 
            }
            100% { 
              opacity: 1; 
              transform: translateY(0) scale(1); 
            }
          }
          
          @keyframes slideUpFadeIn {
            0% { 
              opacity: 0; 
              transform: translateX(-50%) translateY(20px); 
            }
            100% { 
              opacity: 1; 
              transform: translateX(-50%) translateY(0); 
            }
          }
            /* Chat container ajustado para melhor espaçamento */
          .chat-container {
            padding-bottom: 90px !important; /* Espaço para input fixo */
          }
            /* Melhorar scrollbars */
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
          
          /* Correções de layout geral */
          body {
            overflow-x: hidden !important;
          }
          
          .financial-advisor-page {
            overflow-x: hidden !important;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
          }          /* Responsividade melhorada */
          @media (max-width: 768px) {
            .header {
              padding: 10px 15px !important;
              height: 50px !important;
            }
            .logo {
              font-size: 18px !important;
            }
            .chat-container {
              padding: 0 15px !important;
              padding-top: 70px !important;
              padding-bottom: 85px !important;
            }
            .chat-messages {
              padding: 15px 0 !important;
            }
            
            /* Modal responsivo */
            .modal-content {
              height: 95vh !important;
              margin: 5px !important;
              border-radius: 15px !important;
            }
          }
          
          @media (max-width: 480px) {
            .header {
              padding: 8px 12px !important;
              height: 45px !important;
            }
            .logo {
              font-size: 16px !important;
            }
            .chat-container {
              padding: 0 12px !important;
              padding-top: 65px !important;
              padding-bottom: 80px !important;
            }
            
            /* Modal mobile */
            .modal-content {
              height: 98vh !important;
              margin: 0 !important;
              border-radius: 0 !important;
              max-width: 100% !important;
            }
          }
        `      }} />
    </div>
    
    {/* NavBar removido do Stater IA para melhor experiência */}
  </>
);

// Helper functions
function formatTimestamp(timestamp: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'agora';
  if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `há cerca de ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `há ${diffInDays} dia${diffInDays > 1 ? 's' : ''}`;
}

function getProcessingIcon(content: string): string {
  if (content.includes('PDF')) return '📄';
  if (content.includes('imagem')) return '📷';
  if (content.includes('texto')) return '📝';
  return '🔍';
}

function getProcessingDetails(content: string): string {
  return '📄 Analisando documento...';
}

function formatMessageContent(content: string): React.ReactNode {
  // Função para processar texto com formatação
  const processText = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    
    // Regex para encontrar texto entre ** (negrito)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let match;
    
    while ((match = boldRegex.exec(text)) !== null) {
      // Adicionar texto antes do match
      if (match.index > currentIndex) {
        parts.push(text.slice(currentIndex, match.index));
      }
      
      // Adicionar texto em negrito
      parts.push(
        <strong key={`bold-${match.index}`} style={{ fontWeight: '700' }}>
          {match[1]}
        </strong>
      );
      
      currentIndex = match.index + match[0].length;
    }
    
    // Adicionar texto restante
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
}
};

export default FinancialAdvisorPage;
