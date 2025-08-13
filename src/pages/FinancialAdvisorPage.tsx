import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { TransactionList } from '@/components/ocr/TransactionList';
import { isLoggedIn, saveTransaction as saveTransactionUtil, getCurrentUser, saveUser } from '@/utils/localStorage';
import { Button } from '@/components/ui/button';
import { ChatMessage, Transaction, EXPENSE_CATEGORIES } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from '@/hooks/use-translation';
import { fetchGeminiFlashLite, GeminiTransactionIntent } from '@/utils/gemini';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Tag, ChevronDown, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// Componentes de voz
import { VoiceRecorder } from '@/components/voice/VoiceRecorder';
import VoicePlayer from '@/components/voice/VoicePlayer';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useAudioLimits } from '@/hooks/useAudioLimits';
import { processAudioWithGemini, AudioProcessingResult } from '@/utils/audioProcessing';
import { LoadingState, CardLoading, useLoadingStates } from '@/components/ui/loading-states';
import { saveChatMessages, loadChatMessages, clearChatMessages, hasSavedMessages } from '@/utils/chatPersistence';
import { validateUserInput, validateChatMessage, validateTransactionData, sanitizeString } from '@/utils/dataValidation';
import { UserPlanManager } from '@/utils/userPlanManager';
import { UserJourneyManager } from '@/utils/userJourneyManager';
import { PaywallModal } from '@/components/ui/PaywallModal';
import { AdRewardModal } from '@/components/monetization/AdRewardModal';
import { AdManager } from '@/utils/adManager';
import { RewardCooldownManager } from '@/utils/rewardCooldownManager';
import { useAILearning } from '@/utils/aiLearningSystem';
import FinancialAdvisorGate from '@/components/monetization/FinancialAdvisorGate';
import { MessageLimitManager } from '@/utils/messageLimit';


const IA_AVATAR = '/stater-logo.png'; // Logo do Stater
const USER_AVATAR = '/user-avatar.svg'; // Placeholder for user avatar

// Função auxiliar para verificar se uma string é JSON
const isJsonString = (str: string): boolean => {
  const trimmed = str.trim();
  if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
    return false;
  }
  try {
    JSON.parse(trimmed);
    return true;
  } catch {
    return false;
  }
};

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
• Ler e entender áudios/mensagens de voz normalmente
• Fornecer dicas personalizadas de economia
• Controlar contas e planejamento financeiro

💡 **Como usar:** Envie documentos, fotos, áudios ou faça perguntas sobre suas finanças. Sempre confirmo antes de salvar dados!

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

  // Função para carregar mensagens com fallback
  const loadInitialMessages = (): ChatMessage[] => {
    try {
      const savedMessages = loadChatMessages();
      if (savedMessages.length > 0) {
        return savedMessages;
      }
      return [initialSystemMessage];
    } catch (error) {
      console.warn('Erro ao carregar mensagens salvas:', error);
      return [initialSystemMessage];
    }
  };

  // Persistência do Chat: Carregar mensagens do localStorage ou usar inicial
  const [messages, setMessages] = useState<ChatMessage[]>(loadInitialMessages);

  const [loading, setLoading] = useState(false);
  const [savingTransactions, setSavingTransactions] = useState(false); // Novo estado para loading de salvamento
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const [editableTransactions, setEditableTransactions] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null | undefined>(undefined); // undefined: not yet checked, null: checked and no user, string: user ID
  const [activeTab, setActiveTab] = useState("chat"); // Novo estado para aba ativa
  
  // Estados para funcionalidades de voz (mantendo os existentes)
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  // Novos hooks para funcionalidades avançadas de voz
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioResponse, setAudioResponse] = useState<string | null>(null);
  
  // Hook para sistema de aprendizado da IA
  const currentUser = getCurrentUser();
  const aiLearning = useAILearning(currentUser?.id || '');
  
  // Estado para rastrear mensagem original para aprendizado
  const [originalMessageForLearning, setOriginalMessageForLearning] = useState<string>('');
  
  // Estados para dropdown de categorias no modal de múltiplas transações
  const [categoryDropdownStates, setCategoryDropdownStates] = useState<{[key: number]: boolean}>({});
  const [categorySearchTerms, setCategorySearchTerms] = useState<{[key: number]: string}>({});
  
  // Estados para monetização e controle de acesso
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAdReward, setShowAdReward] = useState(false);
  const [messageLimit, setMessageLimit] = useState<number>(3);
  const [messagesUsedToday, setMessagesUsedToday] = useState<number>(0);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [adsWatched, setAdsWatched] = useState<number>(0);
  const [adsRequired, setAdsRequired] = useState<number>(1);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  
  const tts = useTextToSpeech();
  const audioLimits = useAudioLimits(currentUserId || null);

  // Hook para gerenciar múltiplos estados de loading
  const { setLoading: setLoadingState, isLoading: isLoadingState, isAnyLoading } = useLoadingStates();

  // Ref para controlar cancelamento de requisições
  const abortControllerRef = useRef<AbortController | null>(null);

  // Function to cancel ongoing requests
  // FUNÇÃO REMOVIDA: handleCancelRequest não é mais necessária
  // const handleCancelRequest = () => {
  //   if (abortControllerRef.current) {
  //     abortControllerRef.current.abort();
  //     console.log("🚫 Request cancelled by user");
  //     abortControllerRef.current = null;
  //     setLoading(false);
  //     setLoadingState('ai-thinking', false);
  //   }
  // };

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
    
    console.log(`FinancialAdvisorPage: Loaded messages for user ${currentUserId}`);
  }, [currentUserId]); // Reload messages when currentUserId changes

  // Salvar mensagens automaticamente sempre que mudarem
  useEffect(() => {
    if (messages.length > 0) {
      saveChatMessages(messages);
    }
  }, [messages]);

  useEffect(() => {
    const loggedIn = isLoggedIn();
    // console.log('FinancialAdvisorPage: User logged in status on mount (legacy check):', loggedIn); // Legacy check, can be removed if not needed
    if (currentUserId === null && !loggedIn) { // Redirect if user ID is explicitly null (no session) and legacy check also confirms not logged in
        console.log('FinancialAdvisorPage: User not logged in (currentUserId is null), redirecting to /login');
        navigate('/login');
    }
  }, [navigate, currentUserId, isLoggedIn]); // Depend on currentUserId as well

  // Carregar status inicial do plano do usuário
  useEffect(() => {
    const loadUserPlanStatus = async () => {
      if (!currentUserId) return;
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return;

        // Carregar estatísticas do plano E da jornada
        const [stats, journeyStatus] = await Promise.all([
          UserPlanManager.getPlanStats(user.id),
          UserJourneyManager.getJourneyStatus(user.id)
        ]);
        
        // Atualizar estado com limites atuais
        setMessageLimit(stats.features.dailyMessages === -1 ? -1 : stats.features.dailyMessages);
        setMessagesUsedToday(stats.todayUsage.messagesUsed);
        
        // Atualizar estado da jornada
        setCurrentDay(journeyStatus.journey.currentDay);
        setAdsWatched(journeyStatus.journey.adsWatchedToday);
        
        // Definir ads necessários baseado no dia
        const dayConfig = journeyStatus.dayConfig;
        if (dayConfig) {
          setAdsRequired(dayConfig.adsRequired);
        }
        
        console.log(`📊 Status do plano carregado:`, {
          plano: stats.plan.planType,
          limiteMsg: stats.features.dailyMessages,
          usadasHoje: stats.todayUsage.messagesUsed,
          diaAtual: journeyStatus.journey.currentDay,
          adsAssistidos: journeyStatus.journey.adsWatchedToday
        });
        
      } catch (error) {
        console.error('Erro ao carregar status do plano:', error);
      }
    };

    loadUserPlanStatus();
  }, [currentUserId]);

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

  // useEffect para fechar dropdowns de categoria quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Verificar se o clique foi fora de qualquer dropdown de categoria
      if (!target.closest('[data-category-dropdown]')) {
        setCategoryDropdownStates({});
        setCategorySearchTerms({});
      }
    };

    // Adicionar listener apenas se algum dropdown estiver aberto
    const hasOpenDropdown = Object.values(categoryDropdownStates).some(Boolean);
    if (hasOpenDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryDropdownStates]);

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
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Hook para scroll automático quando messages mudam - otimizado
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Memoização das mensagens para performance
  const memoizedMessages = useMemo(() => messages, [messages]);

  // Função para processar mensagens de áudio
  const handleAudioMessage = useCallback(async (audioBlob: Blob) => {
    // � VERIFICAÇÃO: Áudio apenas para usuários premium
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user?.id) {
      setError('Usuário não autenticado');
      return;
    }

    // Verificar se o usuário tem plano premium
    const userPlan = await UserPlanManager.getUserPlan(user.id);
    const isPremium = userPlan.planType !== 'free';
    
    if (!isPremium) {
      console.log('❌ [AUDIO_PREMIUM_REQUIRED] Áudio requer premium - mostrando paywall imediato');
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: `🎙️ **Recurso Premium Necessário**\n\n❌ Áudios estão disponíveis apenas para usuários premium.\n\n✨ **Assine o Stater Premium** e tenha:\n• 🎙️ Áudios ilimitados\n• 📊 Análise de PDFs e imagens\n• � Relatórios ilimitados em diversos formatos\n• 🚫 Livre de anúncios\n• E muito mais!\n\n🎁 **Teste GRÁTIS por 3 dias!**\n💰 **Depois apenas R$ 19,90/mês**\n\n⬆️ Faça upgrade para continuar!`,
        sender: 'assistant',
        timestamp: new Date(),
        avatarUrl: IA_AVATAR
      }]);
      
      setShowPaywall(true);
      return;
    }

    console.log('✅ [AUDIO_PREMIUM] Usuário premium - áudio permitido');

    setIsProcessingAudio(true);
    setLoadingState('audio-processing', true);
    setError('');

    const startTime = Date.now();
    const sessionId = uuidv4();

    try {
      // Processar com Gemini (usando apenas o audioBlob)
      const result: AudioProcessingResult = await processAudioWithGemini(audioBlob);
      
      const processingTime = Date.now() - startTime;

      // Verificar se o processamento foi bem-sucedido
      if (!result.success) {
        throw new Error(result.error || 'Erro no processamento de áudio');
      }

      // Verificar se é realmente conteúdo de voz humana
      if (!result.transcription || result.transcription.trim().length < 3) {
        // Não é voz humana válida - apenas mostrar mensagem educativa
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: '🎤 Não detectei fala humana clara neste áudio. Por favor, fale diretamente no microfone para que eu possa ajudá-lo com suas finanças.',
          sender: 'assistant',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        }]);

        // Registrar uso (áudio processado mas sem conteúdo útil)
        await audioLimits.recordAudioUsage({
          sessionId,
          audioDuration: audioBlob.size / 16000,
          audioSize: audioBlob.size,
          sourceType: 'web',
          transcript: 'Sem voz humana detectada',
          detectedIntent: 'no_speech',
          processingTime,
          inputTokens: 0,
          outputTokens: 50,
          estimatedCost: 0.0001,
          success: true
        });
        
        setIsProcessingAudio(false);
        setLoadingState('audio-processing', false);
        return;
      }

      // Registrar uso nos logs
      await audioLimits.recordAudioUsage({
        sessionId,
        audioDuration: audioBlob.size / 16000, // Estimativa baseada no tamanho
        audioSize: audioBlob.size,
        sourceType: 'web',
        transcript: result.transcription || '',
        detectedIntent: 'audio_processing',
        processingTime,
        inputTokens: Math.ceil((result.transcription || '').length / 4), // Estimativa
        outputTokens: Math.ceil((result.response || '').length / 4), // Estimativa
        estimatedCost: 0.0001, // Custo estimado
        success: true
      });

      // CORREÇÃO: Verificar se o áudio contém uma transação estruturada
      console.log('🎤 [AUDIO_FIX] Resultado processado:', result);
      
      // Se o áudio contém uma transação única, ativar modal simples
      if (result.action === 'add_transaction' && result.amount && result.description) {
        console.log('🎤 [AUDIO_TRANSACTION] Transação detectada no áudio, ativando modal');
        
        // Adicionar mensagem do usuário com a transcrição
        const userMessage: ChatMessage = {
          id: uuidv4(),
          text: result.transcription || '',
          sender: 'user',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // Ativar modal de confirmação diretamente com os dados da transação
        setPendingAction({
          tipo: result.transaction_type || 'expense',
          dados: {
            amount: result.amount,
            description: result.description,
            category: result.category || 'Outros',
            date: new Date().toISOString().split('T')[0]
          }
        });
        setWaitingConfirmation(true);
        
        setIsProcessingAudio(false);
        setLoadingState('audio-processing', false);
        return;
      }
      
      // Se não é transação estruturada, usar resposta direta do processamento de áudio
      console.log('🎤 [AUDIO_FIX] Transcrição processada (fluxo normal):', result.transcription);
      console.log('🎤 [AUDIO_FIX] Resposta tratada do áudio:', result.response);
      
      // Verificar se a resposta não é JSON bruto antes de exibir
      let finalResponse = result.response || '🎤 Não foi possível processar o áudio. Tente falar mais claramente.';
      
      // Se a resposta parece ser JSON, usar mensagem amigável
      if (typeof finalResponse === 'string' && 
          (finalResponse.trim().startsWith('{') || finalResponse.trim().startsWith('['))) {
        finalResponse = '🎤 Não detectei fala humana clara neste áudio. Por favor, fale claramente para que eu possa ajudá-lo com suas finanças.';
      }
      
      // Adicionar mensagem do usuário com a transcrição (SE houver transcrição válida)
      if (result.transcription && result.transcription.trim() && 
          !result.transcription.trim().startsWith('{') && 
          !result.transcription.trim().startsWith('[')) {
        const userMessage: ChatMessage = {
          id: uuidv4(),
          text: result.transcription,
          sender: 'user',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
      }
      
      // Adicionar resposta da IA diretamente (já tratada no processamento de áudio)
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        text: finalResponse,
        sender: 'assistant',
        timestamp: new Date(),
        avatarUrl: IA_AVATAR
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // As mensagens são salvas automaticamente através do useEffect

    } catch (error) {
      console.error('Erro ao processar áudio:', error);
      setError('Erro ao processar mensagem de voz. Tente novamente.');
      
      // Registrar erro nos logs
      await audioLimits.recordAudioUsage({
        sessionId,
        audioDuration: audioBlob.size / 16000,
        audioSize: audioBlob.size,
        sourceType: 'web',
        transcript: '',
        detectedIntent: 'error',
        processingTime: Date.now() - startTime,
        inputTokens: 0,
        outputTokens: 0,
        estimatedCost: 0,
        success: false,
        errorMessage: (error as Error).message
      });
      
      // Adicionar mensagem de erro
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: '❌ Não foi possível processar sua mensagem de voz. Pode tentar novamente ou digitar sua mensagem?',
        sender: 'assistant',
        timestamp: new Date(),
        avatarUrl: IA_AVATAR
      }]);
    } finally {
      setIsProcessingAudio(false);
      setLoadingState('audio-processing', false);
    }
  }, [currentUserId, audioLimits]);

  // Função para processar transações via voz
  const handleTransactionFromVoice = useCallback(async (transactionData: any, response: string) => {
    // Adicionar resposta da IA
    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      text: response,
      sender: 'assistant',
      timestamp: new Date(),
      avatarUrl: IA_AVATAR
    };
    
    setMessages(prev => [...prev, assistantMessage]);

    // Configurar ação pendente para confirmação
    setPendingAction({
      tipo: transactionData.type === 'income' ? 'income' : 'expense',
      dados: {
        amount: transactionData.amount,
        description: transactionData.description || `Transação via voz`,
        category: transactionData.category || 'Outros'
      }
    });
    
    setWaitingConfirmation(true);
  }, []);

  // Função para assistir ad rewarded e ganhar mensagens
  const handleWatchAdReward = async () => {
    if (!currentUserId) return;
    
    setIsWatchingAd(true);
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        console.error('Usuário não autenticado');
        return;
      }

      const result = await AdManager.watchRewardedAdForMessages(user.id);
      
      if (result.success && result.messagesGranted > 0) {
        // Atualizar estados locais
        const journeyStatus = await UserJourneyManager.getJourneyStatus(user.id);
        setAdsWatched(journeyStatus.journey.adsWatchedToday);
        setMessagesUsedToday(journeyStatus.usage.messagesUsed);
        
        // Mostrar mensagem de sucesso
        const successMessage: ChatMessage = {
          id: uuidv4(),
          text: `🎉 Parabéns! Você ganhou ${result.messagesGranted} mensagens para usar hoje. Continue explorando o Stater IA!`,
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        };
        
        setMessages(prev => [...prev, successMessage]);
        setShowAdReward(false);
        
        console.log(`✨ Ad rewarded assistido com sucesso: +${result.messagesGranted} mensagens`);
      } else {
        console.error('Erro no ad rewarded:', result.error);
        
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          text: result.error || 'Não foi possível processar o anúncio. Tente novamente.',
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
      
    } catch (error) {
      console.error('Erro ao assistir ad:', error);
    } finally {
      setIsWatchingAd(false);
    }
  };

const handleSendMessage = async (message: string, skipAddingUserMessage = false) => {
  // Validação robusta da entrada
  const validatedMessage = validateUserInput(message);
  if (!validatedMessage) {
    console.warn('❌ [VALIDATION] Mensagem inválida ou maliciosa rejeitada:', message);
    setError("Mensagem inválida. Por favor, tente novamente.");
    return;
  }

  // Usar a mensagem validada e sanitizada
  const safeMessage = validatedMessage;

  // ========================================
  // NOVO SISTEMA: REWARD AD NA PRIMEIRA MENSAGEM
  // ========================================
  if (!skipAddingUserMessage) { // Só verifica para mensagens do usuário, não respostas do sistema
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setError("Erro: Usuário não identificado. Por favor, faça login novamente.");
        return;
      }

      // Verificar se o usuário é premium
      const userPlan = await UserPlanManager.getUserPlan(user.id);
      const isPremium = userPlan.planType !== 'free';
      
      if (!isPremium) {
        // 🎯 NOVA ESTRATÉGIA: Para usuários FREE, sempre mostrar reward ad antes da primeira mensagem
        console.log('🎬 [REWARD_AD] Usuário FREE - mostrando reward ad antes da mensagem');
        
        // Verificar cooldown do reward ad para messages
        const cooldownResult = await RewardCooldownManager.checkCooldownStatus(user.id, 'financial_analysis');
        
        if (cooldownResult.canWatchAd) {
          // Mostrar reward ad
          const adResult = await AdManager.showRewardedAd('financial_analysis');
          
          if (adResult.success) {
            console.log('✅ [REWARD_AD] Assistido com sucesso - processando mensagem');
            // Continuar com o processamento normal da mensagem
          } else {
            // Usuário não assistiu o reward ad, verificar se há mensagens restantes
            const messageLimit = await MessageLimitManager.canSendMessage(user.id);
            
            if (!messageLimit.allowed) {
              // Sem mensagens restantes e não assistiu reward ad = paywall
              console.log('🚫 [PAYWALL] Sem mensagens restantes e reward ad não assistido');
              setMessages(prev => [...prev, {
                id: uuidv4(),
                text: `🚫 **Seus limites se renovam semanalmente**\n\nMas para uso ilimitado, basta assinar o Stater Premium:\n\n✨ **Stater Premium:**\n• 🤖 Não se preocupe mais com limites de mensagens\n• 📊 Análise de PDFs e imagens\n• 🎙️ IA entende áudios e facilita sua vida\n• � Livre de anúncios\n\n🎁 **Teste GRÁTIS por 3 dias!**\n💰 **Depois apenas R$ 19,90/mês**`,
                sender: 'assistant',
                timestamp: new Date(),
                avatarUrl: IA_AVATAR
              }]);
              
              setShowPaywall(true);
              return;
            } else {
              // Ainda tem mensagens - consumir uma mensagem gratuita
              await MessageLimitManager.incrementMessageCount(user.id);
              console.log(`✅ [FREE_MESSAGE] Usando mensagem gratuita - Restantes: ${messageLimit.messagesRemaining - 1}`);
            }
          }
        } else {
          // Cooldown ativo - verificar se há mensagens restantes
          const messageLimit = await MessageLimitManager.canSendMessage(user.id);
          
          if (!messageLimit.allowed) {
            // Sem mensagens e cooldown ativo = paywall
            console.log('🚫 [PAYWALL] Sem mensagens e cooldown de reward ad ativo');
            setMessages(prev => [...prev, {
              id: uuidv4(),
              text: `🚫 **Você atingiu seus limites**\n\nPara continuar usando o Stater:\n\n✨ **Stater Premium:**\n• 🤖 Não se preocupe mais com limites de mensagens\n• 📊 Análise de PDFs e imagens\n• 🎙️ IA entende áudios e facilita sua vida\n• 🚫 Livre de anúncios\n• 📋 Relatórios ilimitados em diversos formatos\n• E muito mais!\n\n🎁 **Teste GRÁTIS por 3 dias!**\n💰 **Depois apenas R$ 19,90/mês**`,
              sender: 'assistant',
              timestamp: new Date(),
              avatarUrl: IA_AVATAR
            }]);
            
            setShowPaywall(true);
            return;
          } else {
            // Ainda tem mensagens - usar mensagem gratuita
            await MessageLimitManager.incrementMessageCount(user.id);
            console.log(`✅ [FREE_MESSAGE] Cooldown ativo, usando mensagem gratuita - Restantes: ${messageLimit.messagesRemaining - 1}`);
          }
        }
      } else {
        console.log('✅ [PREMIUM] Usuário premium - mensagens ilimitadas');
      }
      
    } catch (error) {
      console.error('Erro ao verificar sistema de reward ad/mensagens:', error);
      setError("Erro interno. Tente novamente.");
      return;
    }
  }

  if (isAddBillIntent(safeMessage)) {
    const userMessage: ChatMessage = {
      id: uuidv4(),
      text: safeMessage,
      sender: 'user',
      timestamp: new Date()
    };

    const systemMessage: ChatMessage = {
      id: uuidv4(),
      text: "📝 Para adicionar uma nova conta, basta clicar no menu Contas no Stater! Assim você pode registrar e organizar todas as suas contas de forma fácil e rápida. 😃",
      sender: 'system',
      timestamp: new Date()
    };

    // Validar mensagens antes de adicionar
    const validatedUserMessage = validateChatMessage(userMessage);
    const validatedSystemMessage = validateChatMessage(systemMessage);

    if (validatedUserMessage && validatedSystemMessage) {
      setMessages(prev => [...prev, validatedUserMessage, validatedSystemMessage]);
    }
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
      const errorMessage: ChatMessage = {
        id: uuidv4(),
        text: "❌ Erro: Usuário não identificado. Por favor, tente fazer login novamente.",
        sender: 'system',
        timestamp: new Date()
      };
      
      const validatedErrorMessage = validateChatMessage(errorMessage);
      if (validatedErrorMessage) {
        setMessages(prev => [...prev, validatedErrorMessage]);
      }
      
      setLoading(false);
      setWaitingConfirmation(false);
      setPendingAction(null);
      return;
    }

    // Garante que não processa mensagem vazia, a menos que seja uma confirmação e haja uma ação pendente.
    if (!safeMessage.trim() && !(waitingConfirmation && pendingAction)) return;
    // Se for uma confirmação, mas não houver ação pendente (estado inesperado), exibe erro.
    if (!safeMessage.trim() && waitingConfirmation && !pendingAction) {
        setError("Ocorreu um erro interno. Não há ação pendente para confirmar ou cancelar.");
        
        const errorMessage: ChatMessage = {
          id: uuidv4(),
          text: "⚠️ Erro interno. Nenhuma ação pendente.",
          sender: 'system',
          timestamp: new Date()
        };
        
        const validatedErrorMessage = validateChatMessage(errorMessage);
        if (validatedErrorMessage) {
          setMessages(prev => [...prev, validatedErrorMessage]);
        }
        
        setLoading(false);
        setWaitingConfirmation(false);
        return;
    }

    const lowerMsg = safeMessage.trim().toLowerCase();    // Se aguardando confirmação e usuário diz sim
    if (waitingConfirmation && pendingAction && lowerMsg.startsWith('sim')) {
      setLoadingState('transaction-save', true);
      setSavingTransactions(true); // Ativar loading específico para salvamento
      setError("");
      try {        // Processar transações (OCR, texto, IA)
        if (pendingAction.tipo === 'generic_confirmation' && editableTransactions.length > 0) {
          // 🔥 FIX: Usar APENAS editableTransactions para evitar duplicação
          const transactionsToProcess = editableTransactions;
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
          
          // Validar transações antes de processar
          const validTransactions = transactionsToProcess.filter((tx: any) => {
            const isValid = validateTransactionData(tx);
            if (!isValid) {
              console.warn('❌ [VALIDATION] Transação inválida rejeitada:', tx);
              errorCount++;
            }
            return isValid;
          });

          if (validTransactions.length === 0) {
            throw new Error('Nenhuma transação válida para processar.');
          }

          console.log(`✅ [VALIDATION] ${validTransactions.length} transações válidas de ${transactionsToProcess.length} totais`);

          // Processar apenas transações válidas (SEM LOOP DUPLO)
          for (const transaction of validTransactions) {
            try {
              // Sanitizar dados da transação
              const sanitizedTransaction = {
                ...transaction,
                description: sanitizeString(transaction.description),
                category: transaction.category ? sanitizeString(transaction.category) : 'outros'
              };

              // Salvar no Supabase com timestamp correto do servidor
              console.log('🔄 Salvando transação com RPC timestamp do servidor...');
              const supabaseInsert = await supabase.rpc('insert_transaction_with_timestamp', {
                p_user_id: activeUserId,
                p_description: sanitizedTransaction.description,
                p_amount: sanitizedTransaction.amount,
                p_type: sanitizedTransaction.type,
                p_category: sanitizedTransaction.category || 'outros'
              });
              
              // Fallback se RPC falhar
              if (supabaseInsert.error) {
                console.warn('⚠️ RPC falhou, usando insert tradicional:', supabaseInsert.error);
                const fallbackInsert = await supabase.from('transactions').insert([
                  {
                    type: sanitizedTransaction.type,
                    amount: sanitizedTransaction.amount,
                    category: sanitizedTransaction.category || null,
                    title: sanitizedTransaction.description,
                    date: new Date().toISOString(),
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
              }

              // NOVO: Salvar também no localStorage para aparecer em "últimas transações"
              const transactionToSave: Transaction = {
                id: uuidv4(),
                title: sanitizedTransaction.description,
                amount: Number(sanitizedTransaction.amount),
                type: sanitizedTransaction.type as 'income' | 'expense',
                category: sanitizedTransaction.category || '',
                date: new Date(),
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
              }

              console.log('🔄 Chamando saveTransactionUtil...');
              saveTransactionUtil(transactionToSave);
              console.log('✅ saveTransactionUtil chamado com sucesso');
              
              successCount++;
            } catch (err) {
              console.error('❌ Erro ao processar transação:', err);
              errorCount++;
            }
          }          // Atualizar interface com eventos múltiplos para garantir reload
          console.log('🔄 Disparando eventos de atualização...');
          window.dispatchEvent(new Event('transactionsUpdated'));
          window.dispatchEvent(new Event('storage')); // Para forçar reload de localStorage
          window.dispatchEvent(new CustomEvent('forceTransactionReload', { detail: { source: 'ai_upload' } }));
          console.log('✅ Eventos de atualização disparados');
            // Mensagem de resultado BASEADA NAS TRANSAÇÕES EDITÁVEIS FINAIS
          let resultMessage = '';
          const actualTransactionsToSave = editableTransactions.filter(tx => tx.amount > 0);
          const actualSuccessCount = actualTransactionsToSave.length;
          
          if (actualSuccessCount > 0) {
            // Calcular total das transações QUE SERÃO SALVAS (editáveis)
            const totalAmount = actualTransactionsToSave.reduce((sum, tx) => sum + tx.amount, 0);
            resultMessage += `✅ ${actualSuccessCount} transação${actualSuccessCount > 1 ? 'ões' : ''} processada${actualSuccessCount > 1 ? 's' : ''} com sucesso!\n`;
            resultMessage += `💰 Total processado: R$ ${totalAmount.toFixed(2)}`;
            
            // Listar as transações processadas
            resultMessage += '\n\n📋 Transações processadas:\n';
            actualTransactionsToSave.forEach((tx, index) => {
              const typeIcon = tx.type === 'income' ? '💰' : '💸';
              // Capitalizar primeira letra da descrição
              const capitalizedDescription = tx.description.charAt(0).toUpperCase() + tx.description.slice(1);
              resultMessage += `${index + 1}. ${typeIcon} ${capitalizedDescription} - R$ ${tx.amount.toFixed(2)} (${tx.category})\n`;
            });
          } else {
            resultMessage += '❌ Nenhuma transação válida foi processada.';
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
          
          // Resetar estados após processamento das transações OCR
          setPendingAction(null);
          setWaitingConfirmation(false);
          setEditableTransactions([]);
          
          // 🧠 APRENDIZADO: Registrar sucesso da detecção da IA
          if (originalMessageForLearning && actualSuccessCount > 0) {
            console.log('🧠 [AI_LEARNING] Registrando sucesso da detecção:', {
              message: originalMessageForLearning,
              transactionsProcessed: actualSuccessCount
            });
            
            // Para cada transação processada, registrar o aprendizado
            actualTransactionsToSave.forEach(tx => {
              aiLearning.recordInteraction(
                originalMessageForLearning,
                'transaction',
                true, // Foi correto
                {
                  type: tx.type,
                  amount: tx.amount,
                  description: tx.description,
                  category: tx.category
                }
              );
            });
            
            setOriginalMessageForLearning(''); // Limpar
          }
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
          ]);
          
          // GARANTIR RESET DOS ESTADOS
          console.log('🔄 [MODAL FIX] Resetando estados após salvamento...');
          setPendingAction(null);
          setWaitingConfirmation(false);
          setSavingTransactions(false);
          setEditableTransactions([]);
          setLoadingState('transaction-save', false);
          setLoading(false);
          console.log('✅ [MODAL FIX] Estados resetados - modal deve fechar');        } else if (pendingAction.tipo === 'bill') {
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
        console.log('🔄 [MODAL FIX] Finally block - garantindo reset de todos os estados...');
        setLoading(false);
        setSavingTransactions(false); // Desativar loading específico para salvamento
        setLoadingState('transaction-save', false);
        console.log('✅ [MODAL FIX] Finally block - estados de loading resetados');
        
        // GARANTIA ADICIONAL: Se ainda há estados pendentes, forçar reset
        if (waitingConfirmation || pendingAction) {
          console.log('⚠️ [MODAL FIX] Forçando reset de estados pendentes no finally...');
          setWaitingConfirmation(false);
          setPendingAction(null);
          setEditableTransactions([]);
        }
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

  // Adiciona a mensagem do usuário à interface (apenas se não foi já adicionada)
  if (!skipAddingUserMessage) {
    const newUserMessage: ChatMessage = { id: uuidv4(), text: message, sender: 'user', timestamp: new Date(), avatarUrl: USER_AVATAR };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
  }
  setLoadingState('ai-thinking', true);
  setError('');
  setShowSuggestions(false);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setError("Erro: Usuário não identificado.");
        setLoadingState('ai-thinking', false);
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
        setLoadingState('ai-thinking', false);
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
        setLoadingState('ai-thinking', false);
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
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session) {
        setMessages(prev => [...prev, { id: uuidv4(), text: "❌ Erro: Não foi possível obter a sessão. Faça login novamente.", sender: 'system', timestamp: new Date() }]);
        setLoadingState('ai-thinking', false);
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
        userPrompt = `Você é um consultor financeiro realista e responsável.

INSTRUÇÕES CRÍTICAS - LEIA COM ATENÇÃO:

1. Se o usuário perguntar sobre SALDO, GASTOS, ANÁLISE ou CONSULTA: RESPONDA EM TEXTO NORMAL
2. Se o usuário pedir para ADICIONAR, REGISTRAR, INCLUIR, ANOTAR transação(ões): RESPONDA APENAS COM JSON

DETECÇÃO DE TRANSAÇÃO:
- Frases como "adicione 50 reais", "registre 30 mercado" = TRANSAÇÃO ÚNICA
- Frases como "adicione 50 mercado e 30 posto", "registre 20 farmácia, 40 gasolina" = MÚLTIPLAS TRANSAÇÕES

FORMATO PARA TRANSAÇÃO ÚNICA:
{"description":"Descrição","amount":50.0,"type":"expense","category":"Outros","date":"${new Date().toISOString().split('T')[0]}"}

FORMATO PARA MÚLTIPLAS TRANSAÇÕES (ARRAY):
[
  {"description":"Mercado","amount":50.0,"type":"expense","category":"Alimentação","date":"${new Date().toISOString().split('T')[0]}"},
  {"description":"Posto","amount":30.0,"type":"expense","category":"Transporte","date":"${new Date().toISOString().split('T')[0]}"}
]

- Use "type":"expense" para gastos/saídas
- Use "type":"income" para receitas/entradas
- Categorias válidas: "${EXPENSE_CATEGORIES.slice(0, 8).join('", "')}", "Outros"

EXEMPLOS DE TRANSAÇÃO ÚNICA (responder JSON OBJETO):
Usuário: "adicione 50 reais" 
Resposta: {"description":"Entrada de R$ 50","amount":50.0,"type":"income","category":"Outros","date":"${new Date().toISOString().split('T')[0]}"}

EXEMPLOS DE MÚLTIPLAS TRANSAÇÕES (responder JSON ARRAY):
Usuário: "registre 30 mercado e 20 farmácia"
Resposta: [{"description":"Mercado","amount":30.0,"type":"expense","category":"Alimentação","date":"${new Date().toISOString().split('T')[0]}"},{"description":"Farmácia","amount":20.0,"type":"expense","category":"Saúde","date":"${new Date().toISOString().split('T')[0]}"}]

Usuário: "adicione 100 salário, 50 freelance, 200 venda"
Resposta: [{"description":"Salário","amount":100.0,"type":"income","category":"Trabalho","date":"${new Date().toISOString().split('T')[0]}"},{"description":"Freelance","amount":50.0,"type":"income","category":"Trabalho","date":"${new Date().toISOString().split('T')[0]}"},{"description":"Venda","amount":200.0,"type":"income","category":"Outros","date":"${new Date().toISOString().split('T')[0]}"}]

EXEMPLOS DE CONSULTA (responder texto):
Usuário: "qual meu saldo?"
Resposta: Seu saldo atual é de R$ X,XX...

CONTEXTO FINANCEIRO:
Saldo atual: R$ ${balance.toFixed(2)} (baseado em ${allTransactions?.length || 0} transações totais)
Transações recentes (últimas 10):
` +
          (recentTransactions && recentTransactions.length > 0
            ? recentTransactions.map(tx => `- ${tx.type === 'income' ? 'Receita' : 'Despesa'}: ${tx.title} (${tx.category || 'Sem categoria'}) R$ ${tx.amount} em ${new Date(tx.date).toLocaleDateString('pt-BR')}`).join('\n')
            : 'Nenhuma transação encontrada.') +
          `

${aiLearning.getPersonalizedPrompt()}

PERGUNTA DO USUÁRIO: ${message}

LEMBRE-SE: 
- Para uma transação, responda com OBJETO JSON
- Para múltiplas transações, responda com ARRAY JSON
- Para consultas, responda em texto normal.`;
      } catch (promptErr) {
        console.warn('Erro ao montar prompt personalizado, usando mensagem original.', promptErr);
      }
      // --- FIM NOVO PROMPT ---

      // Call our backend API or Gemini directly in development
      console.log(`FinancialAdvisorPage: Calling backend /api/gemini with prompt: "${userPrompt}"`);
      console.log('🔥 STATER FIX: Starting API call logic...');
      
      // Create AbortController for request cancellation
      abortControllerRef.current = new AbortController();
      
      let botResponseText: string;
      let backendData: any = { tokens_used: 1000 }; // Default fallback data
      
      // Check if we're in development mode and use Gemini directly
      const isDevelopment = import.meta.env.DEV;
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      console.log('🔥 STATER FIX: Development mode:', isDevelopment);
      console.log('🔥 STATER FIX: Gemini API key available:', !!geminiApiKey);
      console.log('🔥 STATER FIX: Environment mode:', import.meta.env.MODE);
      console.log('🔥 STATER FIX: Is localhost:', isLocalhost);
      console.log('🔥 STATER FIX: Current hostname:', window.location.hostname);
      console.log('🔥 STATER FIX: Will use direct API?', (isDevelopment || isLocalhost) && geminiApiKey);
      
      if ((isDevelopment || isLocalhost) && geminiApiKey) {
        // In development, use Gemini API directly to avoid serverless function issues
        console.log('🔥 STATER FIX: Using Gemini API directly in development mode');
        
        try {
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiApiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: userPrompt }]
                }],
                generationConfig: {
                  temperature: 0.7,
                  topK: 32,
                  topP: 1,
                  maxOutputTokens: 16384,
                }
              }),
              signal: abortControllerRef.current.signal
            }
          );

          if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            console.error('🔥 STATER FIX: Gemini API direct call error:', errorText);
            setMessages(prev => [...prev, { id: uuidv4(), text: `❌ Erro ao conectar com a IA Gemini: ${errorText}`, sender: 'system', timestamp: new Date() }]);
            setLoadingState('ai-thinking', false);
            return;
          }

          const geminiData = await geminiResponse.json();
          console.log('🔥 STATER FIX: Gemini API direct response:', geminiData);
          
          if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
            botResponseText = geminiData.candidates[0].content.parts[0].text;
            // Remove asterisks from response
            botResponseText = botResponseText.replace(/\*\*/g, '').replace(/\*/g, '');
            console.log('🔥 STATER FIX: Successfully got response from Gemini direct API');
            
            // Set tokens used from Gemini response if available
            if (geminiData.usageMetadata && geminiData.usageMetadata.totalTokenCount) {
              backendData.tokens_used = geminiData.usageMetadata.totalTokenCount;
            }
          } else {
            throw new Error('Invalid response format from Gemini API');
          }
        } catch (error) {
          console.error('🔥 STATER FIX: Error calling Gemini API directly:', error);
          const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
          setMessages(prev => [...prev, { id: uuidv4(), text: `❌ Erro ao conectar com a IA: ${errorMessage}`, sender: 'system', timestamp: new Date() }]);
          setLoadingState('ai-thinking', false);
          return;
        }
      } else {
        // Production mode - use backend API with fallback on error
        console.log('🔥 STATER FIX: Using production API with fallback capability');
        
        try {
          const backendApiResponse = await fetch('/api/gemini', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ originalPrompt: userPrompt }),
            signal: abortControllerRef.current.signal
          });

          if (!backendApiResponse.ok) {
            const errorData = await backendApiResponse.json().catch(() => ({ error: 'Erro desconhecido ao chamar a API do consultor.' }));
            console.error("🔥 STATER FIX: Backend API error status:", backendApiResponse.status, "Response:", errorData);
            
            // If it's a 500 error and we have Gemini API key, try direct fallback
            if (backendApiResponse.status === 500 && geminiApiKey) {
              console.log('🔥 STATER FIX: 500 error detected, trying direct Gemini API as fallback...');
              
              const geminiResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiApiKey}`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    contents: [{
                      parts: [{ text: userPrompt }]
                    }],
                    generationConfig: {
                      temperature: 0.7,
                      topK: 32,
                      topP: 1,
                      maxOutputTokens: 16384,
                    }
                  }),
                  signal: abortControllerRef.current.signal
                }
              );

              if (geminiResponse.ok) {
                const geminiData = await geminiResponse.json();
                console.log('🔥 STATER FIX: Fallback successful! Using Gemini direct response');
                
                if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
                  botResponseText = geminiData.candidates[0].content.parts[0].text;
                  botResponseText = botResponseText.replace(/\*\*/g, '').replace(/\*/g, '');
                  
                  if (geminiData.usageMetadata && geminiData.usageMetadata.totalTokenCount) {
                    backendData.tokens_used = geminiData.usageMetadata.totalTokenCount;
                  }
                } else {
                  throw new Error('Invalid response format from Gemini fallback API');
                }
              } else {
                throw new Error(`Fallback also failed: ${geminiResponse.status}`);
              }
            } else {
              // No fallback available or different error
              const userErrorMessage = errorData.details || errorData.error || `Erro ${backendApiResponse.status} ao conectar com o Consultor IA.`;
              setMessages(prev => [...prev, { id: uuidv4(), text: `❌ ${userErrorMessage}`, sender: 'system', timestamp: new Date() }]);
              setLoadingState('ai-thinking', false);
              return;
            }
          } else {
            // Success case
            const backendData_temp = await backendApiResponse.json();
            botResponseText = backendData_temp.resposta;
            backendData = backendData_temp;
          }
        } catch (error) {
          // Network error or other issues
          console.error('🔥 STATER FIX: Network error, trying direct Gemini fallback:', error);
          
          if (geminiApiKey) {
            const geminiResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{
                    parts: [{ text: userPrompt }]
                  }],
                  generationConfig: {
                    temperature: 0.7,
                    topK: 32,
                    topP: 1,
                    maxOutputTokens: 16384,
                  }
                })
              }
            );

            if (geminiResponse.ok) {
              const geminiData = await geminiResponse.json();
              console.log('🔥 STATER FIX: Network fallback successful!');
              
              if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
                botResponseText = geminiData.candidates[0].content.parts[0].text;
                botResponseText = botResponseText.replace(/\*\*/g, '').replace(/\*/g, '');
                
                if (geminiData.usageMetadata && geminiData.usageMetadata.totalTokenCount) {
                  backendData.tokens_used = geminiData.usageMetadata.totalTokenCount;
                }
              } else {
                throw error; // Re-throw original error if fallback parsing fails
              }
            } else {
              throw error; // Re-throw original error if fallback fails
            }
          } else {
            throw error; // Re-throw if no API key for fallback
          }
        }
      }
      
      // Limpar tags HTML da resposta da IA
      if (typeof botResponseText === 'string') {
        botResponseText = botResponseText.replace(/<\/?strong>/g, '**').replace(/<\/?[^>]+(>|$)/g, '');
        
        // PRESERVAR JSON: Não remover JSON válido, apenas limpar formatação
        console.log('🔍 [JSON_FIX] Resposta original:', botResponseText);
        
        // Limpar blocos de código JSON mas preservar JSON direto
        const jsonBlockMatch = botResponseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch) {
          // Se tem bloco JSON, extrair o conteúdo e usar apenas ele
          botResponseText = jsonBlockMatch[1].trim();
          console.log('🔍 [JSON_FIX] JSON extraído de bloco:', botResponseText);
        }
        
        // NOVO: Tentar reparar JSON malformado/cortado
        if (botResponseText.includes('{') || botResponseText.includes('[')) {
          // Se parece ser JSON mas pode estar malformado
          let repairedJson = botResponseText.trim();
          
          // Reparar início cortado de array
          if (repairedJson.startsWith(',')) {
            repairedJson = '[' + repairedJson;
            console.log('🔧 [JSON_REPAIR] Adicionado [ no início');
          }
          
          // Reparar final cortado de array
          if (repairedJson.includes('[') && !repairedJson.includes(']')) {
            repairedJson = repairedJson + ']';
            console.log('🔧 [JSON_REPAIR] Adicionado ] no final');
          }
          
          // Reparar final cortado de objeto
          if (repairedJson.includes('{') && !repairedJson.includes('}')) {
            repairedJson = repairedJson + '}';
            console.log('🔧 [JSON_REPAIR] Adicionado } no final');
          }
          
          botResponseText = repairedJson;
          console.log('🔍 [JSON_FIX] JSON reparado:', botResponseText);
        }
        
        // Se não é JSON, aplicar limpeza padrão
        if (!botResponseText.trim().startsWith('[') && !botResponseText.trim().startsWith('{')) {
          // Se após limpeza só restou texto vazio ou muito pequeno, usar mensagem padrão
          if (!botResponseText || botResponseText.length < 10) {
            botResponseText = "Entendi sua mensagem. Como posso ajudá-lo com suas finanças?";
          }
        }
      }
      // --- NOVO: Atualizar uso de tokens e requisições do usuário ---
      try {
        // O backend pode retornar o número de tokens usados na resposta
        const tokensUsedThisCall = backendData?.tokens_used || 1000; // fallback: 1000 tokens por interação
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
        setLoadingState('ai-thinking', false);
        return; // Return early if response format is wrong
      }
      let confirmationMessageForChat: string = botResponseText;
      
      console.log('🔍 [DEBUG] botResponseText após limpeza:', botResponseText);
      console.log('🔍 [DEBUG] Tamanho da resposta:', botResponseText.length);      
      
      // Verificar se a pergunta é sobre consulta (saldo, resumo, análise) - NÃO deve processar JSON
      const isConsultaQuery = /\b(saldo|resumo|financeiro|análise|gastos|receitas|balanço|verificar|consultar|como estão|situação)\b/i.test(message);
      
      // Attempt to parse AI response for transaction JSON APENAS se NÃO for consulta
      let isTransactionJson = false;
      if (!isConsultaQuery) {
        try {
          let jsonStringToParse = botResponseText;
          console.log('🔍 [JSON_PARSE] Iniciando parsing. Resposta original:', botResponseText);
          
          const jsonBlockMatch = botResponseText.match(/```json\s*([\s\S]*?)\s*```/);

          if (jsonBlockMatch && jsonBlockMatch[1]) {
            jsonStringToParse = jsonBlockMatch[1].trim();
            console.log('🔍 [JSON_PARSE] JSON extraído de bloco código:', jsonStringToParse);
          } else {
            // NOVA LÓGICA: Reparar JSON malformado/cortado ANTES de extrair
            let repairedResponse = botResponseText.trim();
            
            // Reparar início cortado de array (começa com vírgula)
            if (repairedResponse.startsWith(',')) {
              repairedResponse = '[' + repairedResponse;
              console.log('🔧 [JSON_REPAIR] Adicionado [ no início (cortado)');
            }
            
            // Reparar JSON cortado no final
            if (repairedResponse.includes('[') && !repairedResponse.includes(']')) {
              repairedResponse = repairedResponse + ']';
              console.log('🔧 [JSON_REPAIR] Adicionado ] no final (array cortado)');
            }
            
            if (repairedResponse.includes('{') && !repairedResponse.includes('}')) {
              repairedResponse = repairedResponse + '}';
              console.log('🔧 [JSON_REPAIR] Adicionado } no final (objeto cortado)');
            }
            
            console.log('🔍 [JSON_PARSE] JSON reparado:', repairedResponse);
            
            // Agora extrair JSON do conteúdo reparado
            const firstBrace = repairedResponse.indexOf('[');
            const lastBrace = repairedResponse.lastIndexOf(']');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
              jsonStringToParse = repairedResponse.substring(firstBrace, lastBrace + 1);
              console.log('🔍 [JSON_PARSE] Array extraído após reparo:', jsonStringToParse);
            } else {
              const firstObjBrace = repairedResponse.indexOf('{');
              const lastObjBrace = repairedResponse.lastIndexOf('}');
              if (firstObjBrace !== -1 && lastObjBrace > firstObjBrace) {
                jsonStringToParse = repairedResponse.substring(firstObjBrace, lastObjBrace + 1);
                console.log('🔍 [JSON_PARSE] Objeto extraído após reparo:', jsonStringToParse);
              } else {
                throw new Error("No clear JSON structure found in AI response for transaction parsing.");
              }
            }
          }
        
        const sanitizedJsonString = jsonStringToParse.replace(/,\s*([}\]])/g, '$1');
        console.log('🔍 [JSON_PARSE] JSON sanitizado para parsing:', sanitizedJsonString);
        
        const parsed = JSON.parse(sanitizedJsonString);
        console.log('✅ [JSON_PARSE] JSON parseado com sucesso. Tipo:', Array.isArray(parsed) ? 'Array' : 'Object');
        console.log('✅ [JSON_PARSE] Conteúdo parseado:', parsed);
        
        if (parsed && typeof parsed === 'object') {
          // NOVO: Detectar transação ÚNICA (objeto) retornada pela IA
          if (!Array.isArray(parsed) && parsed.description && parsed.amount && parsed.type) {
            console.log('Detectou transação única da IA:', parsed);
            
            const singleTransaction = {
              type: parsed.type === 'income' ? 'income' : 'expense',
              amount: Math.abs(parseFloat(parsed.amount)), // Garantir valor positivo
              description: parsed.description,
              category: parsed.category || 'Outros',
              date: parsed.date || new Date().toISOString().split('T')[0]
            };
            
            console.log('Transação única convertida:', singleTransaction);
            
            if (singleTransaction.amount > 0) {
              // USAR MODAL DE LISTA EDITÁVEL também para transação única (consistência)
              console.log('🔄 [MODAL_SINGLE] Ativando modal de lista editável para transação única');
              
              // Salvar mensagem original para aprendizado
              setOriginalMessageForLearning(message);
              
              const transactionList = [singleTransaction];
              setEditableTransactions(transactionList);
              setPendingAction({
                tipo: 'generic_confirmation',
                dados: {
                  ocrTransactions: transactionList,
                  documentType: 'ai_single',
                  establishment: `Transação processada pela IA`
                }
              });
              setWaitingConfirmation(true);
              isTransactionJson = true;
            }
          }
          // NOVO: Detectar ARRAY de transações (lista retornada pela IA)
          else if (Array.isArray(parsed) && parsed.length >= 1) {
            console.log('🎯 [ARRAY_DETECT] Array detectado com', parsed.length, 'items:', parsed);
            
            // SEMPRE usar modal de lista se é array, mesmo com 1 item (para consistência com PDF/OCR)
            // Converter array de transações da IA para formato esperado
            const transactionList = parsed.map((tx, index) => {
              console.log(`🔄 [ARRAY_CONVERT] Processando item ${index + 1}:`, tx);
              return {
                type: tx.tipo === 'receita' || tx.type === 'income' ? 'income' : 'expense',
                amount: parseFloat(tx.valor || tx.amount || 0),
                description: tx.descrição || tx.description || `Transação ${index + 1}`,
                category: tx.categoria || tx.category || 'Outros',
                date: tx.data || tx.date || new Date().toISOString().split('T')[0]
              };
            }).filter(tx => tx.amount > 0); // Filtrar transações com valor válido

            console.log('✅ [ARRAY_CONVERT] Lista convertida:', transactionList);

            if (transactionList.length === 0) {
              throw new Error('Nenhuma transação válida encontrada no array da IA');
            }

            // SEMPRE USAR MODAL DE LISTA EDITÁVEL para arrays (consistente com PDF/OCR)
            console.log('🔄 [MODAL_LIST] Ativando modal de lista editável para', transactionList.length, 'transações');
            
            // Salvar mensagem original para aprendizado
            setOriginalMessageForLearning(message);
            
            // Preparar ação pendente para confirmação no formato do modal de lista
            setEditableTransactions(transactionList);
            setPendingAction({
              tipo: 'generic_confirmation',
              dados: {
                ocrTransactions: transactionList,
                documentType: 'ai_multiple',
                establishment: `Lista de ${transactionList.length} transação${transactionList.length > 1 ? 'ões' : ''} processada pela IA`
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

      // NOVO: Se não conseguiu detectar JSON, tentar detectar lista na resposta da IA APENAS se a mensagem original era sobre transações
      if (!isTransactionJson && isTransactionRelatedMessage(message)) {
        console.log('🔍 [AI_FILTER] Aplicando detecção de transações na resposta da IA para mensagem relacionada a transações');
        
        // FALLBACK DIRETO: Se é uma solicitação simples como "adicione X reais", criar transação diretamente
        const simpleTransactionMatch = message.match(/(?:adicione?|registre?|inclua|anote)\s+(?:r\$\s*)?(\d+(?:[,.]\d{2})?)\s*(?:reais?)?\s*(entrada|saída|receita|despesa)?/i);
        if (simpleTransactionMatch) {
          const amount = parseFloat(simpleTransactionMatch[1].replace(',', '.'));
          const typeHint = simpleTransactionMatch[2]?.toLowerCase();
          
          let transactionType: 'income' | 'expense' = 'expense'; // Default para despesa
          let description = `Transação de R$ ${amount.toFixed(2)}`;
          
          // Determinar tipo baseado na dica ou assumir receita se não especificado (para "adicione X reais")
          if (typeHint) {
            if (typeHint.includes('entrada') || typeHint.includes('receita')) {
              transactionType = 'income';
              description = `Receita de R$ ${amount.toFixed(2)}`;
            } else if (typeHint.includes('saída') || typeHint.includes('despesa')) {
              transactionType = 'expense';
              description = `Despesa de R$ ${amount.toFixed(2)}`;
            }
          } else {
            // Se não especificou tipo, "adicione X reais" provavelmente é receita
            transactionType = 'income';
            description = `Entrada de R$ ${amount.toFixed(2)}`;
          }
          
          console.log('🤖 [FALLBACK] Criando transação simples:', { amount, type: transactionType, description });
          
          // Ativar modal diretamente
          setPendingAction({
            tipo: transactionType,
            dados: {
              amount,
              description,
              category: 'Outros',
              date: new Date().toISOString().split('T')[0]
            }
          });
          setWaitingConfirmation(true);
          setLoadingState('ai-thinking', false);
          return;
        }
        
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
              ocrTransactions: [], // 🔥 FIX: Não duplicar em duas fontes - usar apenas editableTransactions
              documentType: 'ai_text_list',
              establishment: 'Lista processada pela IA (texto livre)'
            }
          });
          setWaitingConfirmation(true);
          
          // Forçar scroll após definir transações editáveis
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 200);

          setLoadingState('ai-thinking', false);
          return;
        }
      } else if (!isTransactionJson) {
        console.log('🔍 [AI_FILTER] Mensagem não relacionada a transações - pulando detecção na resposta da IA');
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
            // CORREÇÃO: Validar amount antes de usar
            const amountValue = parsedJsonDetail.amount ? parseFloat(parsedJsonDetail.amount) : 0;
            const validAmount = isNaN(amountValue) || amountValue <= 0 ? 0 : amountValue;
            const amountString = validAmount > 0 ? ` de R$${validAmount.toFixed(2)}` : '';
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
        // NOVO: Verificar se a mensagem é realmente sobre transações antes de tentar detectar
        if (isTransactionRelatedMessage(message)) {
          console.log('🔍 [TRANSACTION_FILTER] Mensagem identificada como relacionada a transações:', message);
          
          // Primeiro tentar detectar LISTA de transações
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
            }            // Adicionar mensagem com resultados
            setMessages(prev => [...prev, {
              id: uuidv4(),
              text: resultMessage,
              sender: 'system',
              timestamp: new Date(),
              avatarUrl: IA_AVATAR
            }]);

            // Preparar ação pendente para confirmação (igual ao OCR)            console.log('🔍 Lista de transações detectada:', detectedTransactionList);
            setEditableTransactions(detectedTransactionList);
            setPendingAction({
              tipo: 'generic_confirmation',
              dados: {
                ocrTransactions: [], // 🔥 FIX: Não duplicar em duas fontes - usar apenas editableTransactions
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
              // Resposta normal se não detectou transação - VERIFICAR SE NÃO É JSON
              if (!isJsonString(botResponseText)) {
                const botSystemMessage: ChatMessage = { id: uuidv4(), text: botResponseText, sender: 'system', timestamp: new Date(), avatarUrl: IA_AVATAR };
                setMessages((prevMessages: ChatMessage[]) => [...prevMessages, botSystemMessage]);
              } else {
                // Se é JSON, criar resposta amigável
                const friendlyMessage = "Entendi sua mensagem! Se você quiser registrar uma transação, por favor seja mais específico sobre o valor e a descrição.";
                const botSystemMessage: ChatMessage = { id: uuidv4(), text: friendlyMessage, sender: 'system', timestamp: new Date(), avatarUrl: IA_AVATAR };
                setMessages((prevMessages: ChatMessage[]) => [...prevMessages, botSystemMessage]);
              }
            }
          }
        } else {
          console.log('🔍 [TRANSACTION_FILTER] Mensagem não relacionada a transações, respondendo normalmente:', message);
          // Resposta normal se não é relacionada a transações - VERIFICAR SE NÃO É JSON
          if (!isJsonString(botResponseText)) {
            const botSystemMessage: ChatMessage = { id: uuidv4(), text: botResponseText, sender: 'system', timestamp: new Date(), avatarUrl: IA_AVATAR };
            setMessages((prevMessages: ChatMessage[]) => [...prevMessages, botSystemMessage]);
          } else {
            // Se é JSON, criar resposta amigável
            const friendlyMessage = "Posso ajudar você com suas finanças! Me conte como posso ajudar - consultar saldo, registrar gastos, ou qualquer dúvida financeira.";
            const botSystemMessage: ChatMessage = { id: uuidv4(), text: friendlyMessage, sender: 'system', timestamp: new Date(), avatarUrl: IA_AVATAR };
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
      setLoadingState('ai-thinking', false);
      setLoadingState('transaction-save', false);
      setSavingTransactions(false);
    }
  } catch (error: any) {
    console.error("🔥 STATER FIX: Erro capturado no catch global:", error);
    
    // Check if request was cancelled
    if (error.name === 'AbortError') {
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: "⚠️ Operação cancelada pelo usuário.",
        sender: 'system',
        timestamp: new Date(),
        avatarUrl: IA_AVATAR
      }]);
    } else {
      // 🔥 STATER FIX: Always try Gemini API directly as fallback when there's an API error
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      console.log('🔥 STATER FIX: Erro capturado, tentando fallback...');
      console.log('🔥 STATER FIX: Error message:', error.message);
      console.log('🔥 STATER FIX: hasGeminiKey:', !!geminiApiKey);
      
      // Check if it's an API-related error (500, fetch error, etc.)
      const isApiError = error.message?.includes('500') || 
                        error.message?.includes('API') || 
                        error.message?.includes('fetch') ||
                        error.message?.includes('Internal Server Error') ||
                        error.toString().includes('500');
      
      if (geminiApiKey && isApiError) {
        console.log('🔥 STATER FIX: Tentando API do Gemini direta como fallback...');
        
        // Try Gemini API directly as fallback
        fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: message || 'Olá, como você pode me ajudar com minhas finanças?' }]
              }],
              generationConfig: {
                temperature: 0.7,
                topK: 32,
                topP: 1,
                maxOutputTokens: 16384,
              }
            })
          }
        ).then(async (geminiResponse) => {
          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            console.log('🔥 STATER FIX: Sucesso no fallback da API Gemini!');
            
            if (geminiData.candidates && geminiData.candidates[0] && geminiData.candidates[0].content) {
              let botResponseText = geminiData.candidates[0].content.parts[0].text;
              botResponseText = botResponseText.replace(/\*\*/g, '').replace(/\*/g, '');
              
              setMessages(prev => [...prev, {
                id: uuidv4(),
                text: `🤖 ${botResponseText}`,
                sender: 'assistant',
                timestamp: new Date(),
                avatarUrl: IA_AVATAR
              }]);
              console.log('🔥 STATER FIX: Mensagem da IA adicionada com sucesso!');
              return;
            }
          }
          throw new Error('Fallback também falhou');
        }).catch((fallbackError) => {
          console.error('🔥 STATER FIX: Fallback falhou:', fallbackError);
          setMessages(prev => [...prev, {
            id: uuidv4(),
            text: `❌ Erro ao processar sua solicitação. API principal falhou e fallback também falhou. Tente novamente.`,
            sender: 'system',
            timestamp: new Date(),
            avatarUrl: IA_AVATAR
          }]);
        });
      } else {
        console.log('🔥 STATER FIX: Fallback não ativo. isApiError:', isApiError, 'hasKey:', !!geminiApiKey);
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: `❌ Erro ao processar sua solicitação: ${error.message || 'Erro desconhecido'}. Tente novamente.`,
          sender: 'system',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        }]);
      }
    }
  } finally {
    setLoadingState('ai-thinking', false);
    setLoadingState('transaction-save', false);
    setSavingTransactions(false);
    // Clear the abort controller reference
    abortControllerRef.current = null;
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
    // Função para inferir categoria baseada na descrição usando categorias oficiais
  const getCategoryFromDescription = (description: string) => {
    const desc = description.toLowerCase();
    
    // Alimentação
    if (desc.includes('mercado') || desc.includes('supermercado') || desc.includes('feira') ||
        desc.includes('restaurante') || desc.includes('lanche') || desc.includes('comida') ||
        desc.includes('padaria') || desc.includes('açougue') || desc.includes('delivery') ||
        desc.includes('ifood') || desc.includes('uber eats') || desc.includes('pizza') ||
        desc.includes('hamburguer') || desc.includes('sanduiche') || desc.includes('café') ||
        desc.includes('almoço') || desc.includes('jantar') || desc.includes('bebida')) {
      return 'Supermercado';
    }
    
    // Transporte
    if (desc.includes('uber') || desc.includes('99') || desc.includes('táxi') ||
        desc.includes('ônibus') || desc.includes('metro') || desc.includes('combustível') ||
        desc.includes('gasolina') || desc.includes('posto') || desc.includes('pedágio') ||
        desc.includes('estacionamento') || desc.includes('carro') || desc.includes('moto')) {
      return 'Combustível';
    }
    
    // Habitação
    if (desc.includes('aluguel') || desc.includes('apartamento') || desc.includes('condomínio') || 
        desc.includes('taxa de condomínio') || desc.includes('casa') || desc.includes('imóvel')) {
      return 'Aluguel';
    }
    
    // Saúde
    if (desc.includes('plano de saúde') || desc.includes('saúde') || desc.includes('farmácia') || 
        desc.includes('remédio') || desc.includes('medicina') || desc.includes('médico') ||
        desc.includes('consulta') || desc.includes('exame') || desc.includes('hospital')) {
      return 'Farmácia';
    }
    
    // Educação
    if (desc.includes('curso') || desc.includes('idiomas') || desc.includes('educação') || 
        desc.includes('aula') || desc.includes('professor') || desc.includes('ensino') ||
        desc.includes('treinamento') || desc.includes('capacitação')) {
      return 'Cursos Online';
    }
    
    // Tecnologia
    if (desc.includes('internet') || desc.includes('5g') || desc.includes('wifi') || 
        desc.includes('conexão') || desc.includes('streaming') || desc.includes('aplicativo') ||
        desc.includes('app') || desc.includes('software') || desc.includes('tecnologia')) {
      return 'Internet';
    }
    
    // Entretenimento
    if (desc.includes('clube') || desc.includes('assinatura') || desc.includes('vinhos') ||
        desc.includes('entretenimento') || desc.includes('lazer') || desc.includes('netflix') ||
        desc.includes('spotify') || desc.includes('fitness') || desc.includes('academia') ||
        desc.includes('treino') || desc.includes('personal')) {
      return 'Streaming (Netflix, etc)';
    }
    
    // Contas e serviços
    if (desc.includes('conta') || desc.includes('boleto') || desc.includes('fatura') ||
        desc.includes('taxa') || desc.includes('limpeza') || desc.includes('faxina') || 
        desc.includes('serviço') || desc.includes('doméstico') || desc.includes('residencial')) {
      return 'Luz';
    }
    
    // Compras
    if (desc.includes('shopping') || desc.includes('loja') || desc.includes('roupa') ||
        desc.includes('compra') || desc.includes('celular') || desc.includes('telefone')) {
      return 'Roupas';
    }
      
    return 'Despesas Diversas';
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

  // NOVA FUNÇÃO: Verifica se uma mensagem é realmente sobre transações antes de processar
  const isTransactionRelatedMessage = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim();
    
    // FILTROS IMEDIATOS - Se contém essas frases, NÃO É transação
    const immediateRejectPhrases = [
      'me da', 'me dá', 'dar um', 'dar uma', 'ceder', 'emprestar',
      'posso ter', 'pode me dar', 'quero ganhar', 'preciso de',
      'como conseguir', 'onde arrumar', 'como ganhar dinheiro',
      'teste', 'test', 'oi', 'olá', 'hello', 'hi', 'tchau', 'bye',
      'som', 'audio', 'microfone', 'como vai', 'tudo bem',
      'ajuda', 'help', 'sobre o app', 'como funciona'
    ];
    
    // Se contém qualquer frase de rejeição imediata, NÃO é transação
    if (immediateRejectPhrases.some(phrase => lowerMessage.includes(phrase))) {
      console.log('🚫 [FILTER] Mensagem rejeitada - frase não-transacional detectada');
      return false;
    }
    
    // PALAVRAS-CHAVE ESPECÍFICAS DE TRANSAÇÃO REAL
    const specificTransactionActions = [
      'registrar receita', 'registrar despesa', 'anotar gasto', 'salvar transação',
      'adicionar receita', 'adicionar despesa', 'incluir gasto',
      'gastei', 'paguei', 'comprei', 'vendi', 'recebi por', 'ganhei com',
      'saiu da conta', 'entrou na conta', 'débito de', 'crédito de',
      'adicione', 'adicionar', 'registre', 'registrar', 'anote', 'anotar',
      'inclua', 'incluir', 'coloque', 'coloca', 'insira', 'inserir',
      'perdi', 'perda de', 'prejuízo de', 'saída de'
    ];
    
    // CONTEXTOS ESPECÍFICOS COM VALORES MONETÁRIOS
    const monetaryContexts = [
      /(?:gastei|paguei|comprei|recebi|ganhei|entrou|saiu|perdi)\s+(?:r\$\s*)?(\d+(?:[.,]\d{2})?)/i,
      /(?:r\$\s*)?(\d+(?:[.,]\d{2})?)\s+(?:no|na|para|do|da)\s+(?:mercado|supermercado|farmácia|conta|boleto|salário|trabalho)/i,
      /(?:registr|adicion|inclu|anot)\w*\s+(?:receita|despesa|gasto|transação)/i,
      /(?:adicion|registr|anot|inclu|coloqu|insir)\w*\s+(?:r\$\s*)?(\d+(?:[.,]\d{2})?)/i,
      /(?:r\$\s*)?(\d+(?:[.,]\d{2})?)\s+(?:reais?)\s+(?:entrada|saída|receita|despesa|gasto)/i,
      /(?:perdi|perda|prejuízo)\s+(?:r\$\s*)?(\d+(?:[.,]\d{3,})?)\s*(?:reais?|milhões?|mil)?/i,
      // NOVO: Capturar valores grandes com "milhões"
      /(?:perdi|perda|prejuízo)\s+(\d+)\s*milhões?\s*(?:de\s*reais?)?/i,
      /(?:saída|gasto|despesa)\s+(?:de\s+)?(?:r\$\s*)?(\d+)\s*milhões?\s*(?:de\s*reais?)?/i
    ];
    
    // Verificar se tem ação específica de transação
    const hasSpecificAction = specificTransactionActions.some(action => 
      lowerMessage.includes(action)
    );
    
    // Verificar se tem contexto monetário válido
    const hasValidMonetaryContext = monetaryContexts.some(pattern => 
      pattern.test(lowerMessage)
    );
    
    // LÓGICA RESTRITIVA:
    // Só é transação se tem ação específica OU contexto monetário válido
    if (hasSpecificAction || hasValidMonetaryContext) {
      console.log('✅ [FILTER] Mensagem aceita - ação específica de transação ou contexto monetário válido');
      return true;
    }
    
    // Por padrão, todas as outras mensagens NÃO são transações
    console.log('🚫 [FILTER] Mensagem rejeitada - não é uma ação específica de transação');
    return false;
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

  setLoadingState('ai-thinking', true);
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
    }    
    
    // Detectar tipo de arquivo
    const isPdf = !isTextFile && imageBase64.startsWith('data:application/pdf');
    
    // � NOVA ESTRATÉGIA: Para PDFs, imagens e mídias - PAYWALL IMEDIATO para usuários FREE
    if (isPdf || !isTextFile) {
      // Verificar se o usuário é premium
      const userPlan = await UserPlanManager.getUserPlan(user.id);
      const isPremium = userPlan.planType !== 'free';
      
      if (!isPremium) {
        console.log(`❌ [MEDIA_PREMIUM_REQUIRED] ${isPdf ? 'PDF' : 'Imagem'} requer premium - mostrando paywall imediato`);
        
        const mediaType = isPdf ? '📑 PDFs' : '🖼️ Imagens';
        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: `${mediaType} **Recurso Premium Necessário**\n\n❌ Análise de ${isPdf ? 'PDFs' : 'imagens'} está disponível apenas para usuários premium.\n\n✨ **Assine o Stater Premium** e tenha:\n• ${mediaType} ilimitados\n• 🎙️ Áudios ilimitados\n• 🤖 Não se preocupe mais com limites de mensagens\n• � Relatórios ilimitados em diversos formatos\n• 🚫 Livre de anúncios\n• E muito mais!\n\n🎁 **Teste GRÁTIS por 3 dias!**\n💰 **Depois apenas R$ 19,90/mês**\n\n⬆️ Faça upgrade para continuar!`,
          sender: 'assistant',
          timestamp: new Date(),
          avatarUrl: IA_AVATAR
        }]);
        
        setShowPaywall(true);
        setLoadingState('ai-thinking', false);
        return;
      }
      
      console.log(`✅ [MEDIA_PREMIUM] Usuário premium - ${isPdf ? 'PDF' : 'imagem'} permitido`);
    }
    
    //  DEBUG: Log detalhado para entender o que está acontecendo
    console.log('🔍 [DEBUG_DETECTION]', {
      isTextFile,
      imageBase64Length: imageBase64.length,
      startsWithPdf: imageBase64.startsWith('data:application/pdf'),
      startsWithImage: imageBase64.startsWith('data:image/'),
      first50Chars: imageBase64.substring(0, 50),
      isPdf,
      userId: user.id
    });
    
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

    // Chamar API de OCR funcional com timeout ajustado para plano gratuito Vercel (60s máximo)
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        console.log('⏱️ Timeout de 40s atingido, cancelando requisição...');
      }
    }, 40000); // OTIMIZADO: Reduzido de 55s para 40s para feedback mais rápido
    
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
      signal: abortControllerRef.current.signal
    });
      clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      console.error('Erro da API OCR:', errorData);
      
      // Verificar se é erro de abort (timeout do cliente)
      if (abortControllerRef.current && abortControllerRef.current.signal.aborted) {        setMessages(prev => [...prev, {
          id: uuidv4(),
          text: "⏱️ Processamento Otimizado (40s)\n\nO documento está sendo processado de forma mais rápida agora.\n\n💡 Dicas para acelerar ainda mais:\n• Para PDFs grandes: Divida em seções menores ou use imagens\n• Para extratos longos: Faça capturas de tela de partes específicas\n• Alternativa mais rápida: Tire fotos claras das páginas importantes\n• Documentos complexos: Simplifique removendo páginas extras\n\n� Quer tentar novamente? O sistema está otimizado para respostas mais rápidas!",
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
    
    // VALIDAÇÃO MELHORADA: Verificar múltiplas condições
    if (!result.success) {
      throw new Error(result.error || 'Falha no processamento do documento');
    }

    const ocrData = result.data;
    
    // VALIDAÇÃO CRÍTICA MELHORADA: Verificar se ocrData existe e tem estrutura válida
    if (!ocrData) {
      console.error('❌ Dados OCR nulos:', result);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: `❌ **Erro no processamento**\n\nO sistema não conseguiu processar o documento.\n\n💡 **Tente:**\n• Tire uma foto mais clara\n• Use melhor iluminação\n• Certifique-se que o texto esteja legível\n• Tente um formato diferente (JPG/PNG)`,
        sender: 'system',
        timestamp: new Date(),
        avatarUrl: IA_AVATAR
      }]);
      return;
    }

    if (!ocrData.transactions) {
      console.error('❌ Transações não encontradas:', ocrData);
      ocrData.transactions = []; // Criar array vazio para evitar erro
    }

    if (!Array.isArray(ocrData.transactions)) {
      console.error('❌ Transações não são array:', typeof ocrData.transactions);
      ocrData.transactions = []; // Converter para array vazio
    }
    
    const transactions = ocrData.transactions;
    
    // Verificar se há transações válidas
    if (transactions.length === 0) {
      console.log('⚠️ Nenhuma transação encontrada no documento - permitindo adição manual');
      setMessages(prev => [...prev, {
        id: uuidv4(),
        text: `📄 **Documento lido**\n\nO sistema conseguiu ler o documento, mas não identificou transações automaticamente.\n\n💡 **Você pode:**\n• Adicionar transações manualmente digitando abaixo\n• Enviar outro documento\n• Tirar nova foto com melhor qualidade\n\nDigite algo como: "Adicionar despesa de R$ 150,00 em supermercado"`,
        sender: 'system',
        timestamp: new Date(),
        avatarUrl: IA_AVATAR
      }]);
      return;
    }    // Criar mensagem com resultados e instruções claras
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
    console.log('🔍 DEBUG - Estados antes de definir modal:');
    console.log('  - editableTransactions length será:', transactions.length);
    console.log('  - waitingConfirmation será:', true);
    console.log('  - pendingAction será definido');
    
    setEditableTransactions(transactions); // Armazenar transações editáveis
    setPendingAction({
      tipo: 'generic_confirmation',
      dados: {
        ocrTransactions: [], // 🔥 FIX: Não duplicar em duas fontes - usar apenas editableTransactions
        documentType: ocrData.documentType,
        establishment: ocrData.summary.establishment
      }
    });
    console.log('📝 PendingAction definida para OCR');
    setWaitingConfirmation(true);
    
    // Log após definir estados
    console.log('✅ Estados definidos - Modal deveria aparecer agora');
    
    // Forçar scroll após definir transações editáveis para OCR
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      console.log('🔍 DEBUG - Estados atuais após timeout:');
      console.log('  - editableTransactions:', transactions.length);
      console.log('  - waitingConfirmation: true');
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
    // Cleanup completo
    setLoading(false);
    setLoadingState('ai-thinking', false);
    if (abortControllerRef.current) {
      abortControllerRef.current = null;
    }
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

// Funções para controlar o dropdown de categorias
const toggleCategoryDropdown = (index: number) => {
  setCategoryDropdownStates(prev => ({
    ...prev,
    [index]: !prev[index]
  }));
};

const setCategorySearch = (index: number, searchTerm: string) => {
  setCategorySearchTerms(prev => ({
    ...prev,
    [index]: searchTerm
  }));
};

const selectCategory = (index: number, category: string) => {
  updateTransaction(index, { ...editableTransactions[index], category: category.toLowerCase() });
  setCategoryDropdownStates(prev => ({
    ...prev,
    [index]: false
  }));
  setCategorySearchTerms(prev => ({
    ...prev,
    [index]: ''
  }));
};

const getFilteredCategories = (index: number) => {
  const searchTerm = categorySearchTerms[index] || '';
  return EXPENSE_CATEGORIES.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

return (
  <FinancialAdvisorGate>
    <>
      {/* Animações CSS para o modal */}
      <style>{`
      @keyframes modalBounceIn {
        0% {
          opacity: 0;
          transform: translateX(-50%) translateY(50px) scale(0.9);
        }
        50% {
          transform: translateX(-50%) translateY(-10px) scale(1.05);
        }
        100% {
          opacity: 1;
          transform: translateX(-50%) translateY(0) scale(1);
        }
      }
      
      @keyframes backdropFadeIn {
        0% { opacity: 0; }
        100% { opacity: 1; }
      }
      
      @keyframes iconPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
      
      @keyframes ringPulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        100% {
          transform: scale(1.4);
          opacity: 0;
        }
      }
      
      @keyframes badgeGlow {
        0%, 100% {
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
        }
        50% {
          box-shadow: 0 4px 25px rgba(59, 130, 246, 0.4);
        }
      }
      
      @keyframes valueGlow {
        0%, 100% {
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        50% {
          text-shadow: 0 2px 8px rgba(0, 0, 0, 0.25), 0 0 20px currentColor;
        }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        33% { transform: translateY(-10px) rotate(1deg); }
        66% { transform: translateY(5px) rotate(-1deg); }
      }
    `}</style>
    
    <div 
      className="financial-advisor-page"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        background: '#31518b !important', // Fundo padronizado igual à NavBar
        minHeight: '100vh',
        width: '100vw',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '59px', // Espaço para o chat fixo no bottom - reduzido em 6px (65px → 59px)
        overflow: 'hidden',
        position: 'relative'
      }}
    >      {/* Header - CORRIGIDO */}
      <div 
        className="header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 30px',
          background: '#31518b !important',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          height: '70px',
          backdropFilter: 'none !important',
          WebkitBackdropFilter: 'none !important',
          overflow: 'hidden'
        }}
      >        <h1 
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#ffffff',
            fontFamily: '"Fredoka One", "Comic Sans MS", "Poppins", sans-serif',
            letterSpacing: '1px',
            textShadow: '1px 1px 0px #3b82f6, 2px 2px 0px #1d4ed8, 0 0 10px rgba(59, 130, 246, 0.6)',
            textTransform: 'uppercase',
            position: 'relative',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
            margin: 0,
            padding: 0,
            background: 'none',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            display: 'inline-block',
            overflow: 'visible',
            clipPath: 'inset(0px 0px -5px 0px)'
          }}
        >
          STATER IA
        </h1>
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
              background: '#2563eb',
              border: '1px solid #1d4ed8',
              borderRadius: '20px',
              padding: '8px 16px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1d4ed8';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
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
          paddingTop: '90px', // Espaço para header fixo
          paddingBottom: '52px', // Espaço para ChatInput reduzido em 14px (66px → 52px)
          boxSizing: 'border-box',
          minHeight: 'calc(100vh - 90px)' // Ajustado para header fixo
        }}
      >        {/* Chat Messages */}
        <ChatMessages
          messages={memoizedMessages}
          messagesEndRef={messagesEndRef}
          iaAvatar={IA_AVATAR}
          userAvatar={USER_AVATAR}
        />

        {/* Sugestões integradas após as mensagens */}
        {showSuggestions && memoizedMessages.length > 0 && memoizedMessages[0].sender === 'system' && !pendingAction && (
          <div style={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            justifyContent: 'center',
            maxWidth: '900px',
            width: '100%',
            padding: '8px',
            margin: '0 auto 0px auto'
          }}>
            {initialSuggestions.map((sug: string, sugIndex: number) => (
              <button
                key={sugIndex}
                onClick={() => handleSuggestionClick(sug)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
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
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Chat Input */}
        <ChatInput
          onSubmit={handleSendMessage} 
          onImageUpload={handleImageUpload}
          loading={isLoadingState('ai-thinking') || isLoadingState('transaction-save')}
          waitingConfirmation={waitingConfirmation} 
          pendingActionDetails={pendingAction ? pendingAction.dados : null} 
          onConfirm={() => handleSendMessage('sim')} 
          onCancel={() => handleSendMessage('não')}
          // Props para áudio
          onAudioSend={handleAudioMessage}
          isProcessingAudio={isLoadingState('audio-processing')}
          audioLimits={audioLimits}
        />
      </div>      {/* Confirmation Popup - Modal Único com Design Ultra Moderno */}
      {waitingConfirmation && pendingAction && (
        <>
          {/* Backdrop com efeito de blur e gradiente */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(0, 0, 0, 0.7), rgba(59, 130, 246, 0.2))',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              zIndex: 998,
              animation: 'backdropFadeIn 0.3s ease-out'
            }}
            onClick={() => handleSendMessage('não')}
          />
          
          <div 
            className="confirmation-popup"
            style={{
              position: 'fixed',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9))',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '24px',
              padding: '28px',
              maxWidth: '420px',
              width: '90%',
              color: '#1e293b',
              boxShadow: `
                0 25px 50px rgba(0, 0, 0, 0.25), 
                0 0 0 1px rgba(255, 255, 255, 0.3),
                0 0 100px ${pendingAction.tipo === 'income' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}
              `,
              border: `2px solid ${pendingAction.tipo === 'income' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              zIndex: 999,
              animation: 'modalBounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              textAlign: 'center',
              overflow: 'hidden'
            }}
          >
            {/* Efeito de partículas flutuantes */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `
                radial-gradient(circle at 20% 20%, ${pendingAction.tipo === 'income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'} 0%, transparent 40%),
                radial-gradient(circle at 80% 80%, ${pendingAction.tipo === 'income' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)'} 0%, transparent 40%)
              `,
              animation: 'float 6s ease-in-out infinite',
              pointerEvents: 'none'
            }} />

            {/* Header com ícone pulsante */}
            <div style={{
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              position: 'relative'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: pendingAction.tipo === 'income' 
                  ? 'linear-gradient(135deg, #10b981, #059669, #047857)'
                  : 'linear-gradient(135deg, #ef4444, #dc2626, #b91c1c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: `
                  0 8px 25px ${pendingAction.tipo === 'income' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'},
                  0 0 0 4px rgba(255, 255, 255, 0.3)
                `,
                animation: 'iconPulse 2s ease-in-out infinite',
                position: 'relative'
              }}>
                {pendingAction.tipo === 'income' ? '💰' : '💸'}
                
                {/* Círculos de pulso */}
                <div style={{
                  position: 'absolute',
                  top: '-4px',
                  left: '-4px',
                  right: '-4px',
                  bottom: '-4px',
                  border: `2px solid ${pendingAction.tipo === 'income' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  borderRadius: '50%',
                  animation: 'ringPulse 2s ease-in-out infinite'
                }} />
              </div>
            </div>

            {/* Badge do tipo de transação */}
            <div style={{
              background: pendingAction.tipo === 'income' 
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
              padding: '10px 20px',
              borderRadius: '16px',
              fontSize: '15px',
              fontWeight: '800',
              color: pendingAction.tipo === 'income' ? '#059669' : '#dc2626',
              marginBottom: '20px',
              border: `2px solid ${pendingAction.tipo === 'income' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
              backdropFilter: 'blur(10px)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: `0 4px 15px ${pendingAction.tipo === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              animation: 'badgeGlow 3s ease-in-out infinite'
            }}>
              {pendingAction.tipo === 'income' ? '📈 ENTRADA' : '📉 SAÍDA'}
            </div>

            {/* Valor principal com destaque especial */}
            <div style={{ marginBottom: '20px', position: 'relative' }}>
              <p style={{
                fontSize: '17px',
                fontWeight: '600',
                margin: '0 0 12px 0',
                lineHeight: '1.4',
                color: '#475569',
                opacity: 0.9
              }}>
                💫 Confirmar transação no valor de
              </p>
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.6))',
                borderRadius: '20px',
                padding: '16px',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <p style={{
                  fontSize: '32px',
                  fontWeight: '900',
                  margin: '0',
                  color: pendingAction.tipo === 'income' ? '#059669' : '#dc2626',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  animation: 'valueGlow 2s ease-in-out infinite'
                }}>
                  R$ {pendingAction.dados.amount?.toFixed(2) || '0,00'}
                </p>
              </div>
            </div>

            {/* Descrição com design aprimorado */}
            {pendingAction.dados.description && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.7))',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '18px',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '0 0 6px 0',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  📝 Descrição:
                </p>
                <p style={{
                  fontSize: '16px',
                  color: '#334155',
                  margin: '0',
                  fontWeight: '600',
                  lineHeight: '1.4'
                }}>
                  {pendingAction.dados.description}
                </p>
              </div>
            )}

            {/* Categoria com design aprimorado */}
            {pendingAction.dados.category && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.7))',
                backdropFilter: 'blur(15px)',
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '24px',
                border: '2px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '0 0 6px 0',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  🏷️ Categoria:
                </p>
                <p style={{
                  fontSize: '16px',
                  color: '#334155',
                  margin: '0',
                  fontWeight: '600'
                }}>
                  {pendingAction.dados.category}
                </p>
              </div>
            )}

            {/* Botões de ação com design ultra moderno */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => handleSendMessage('não')}
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))',
                  color: '#dc2626',
                  border: '3px solid #dc2626',
                  borderRadius: '16px',
                  padding: '14px 24px',
                  fontWeight: '800',
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1,
                  justifyContent: 'center',
                  backdropFilter: 'blur(15px)',
                  boxShadow: '0 6px 20px rgba(220, 38, 38, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 12px 35px rgba(220, 38, 38, 0.4)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.3)';
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85))';
                  e.currentTarget.style.color = '#dc2626';
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
                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '14px 24px',
                  fontWeight: '800',
                  fontSize: '15px',
                  cursor: savingTransactions ? 'not-allowed' : 'pointer',
                  transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flex: 1,
                  justifyContent: 'center',
                  boxShadow: savingTransactions 
                    ? 'none' 
                    : '0 8px 30px rgba(59, 130, 246, 0.5)',
                  opacity: savingTransactions ? 0.7 : 1,
                  backdropFilter: 'blur(15px)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!savingTransactions) {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 15px 45px rgba(59, 130, 246, 0.6)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8, #1e40af, #1e3a8a)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!savingTransactions) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(59, 130, 246, 0.5)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6, #1d4ed8, #1e40af)';
                  }
                }}
              >
                {savingTransactions ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  '✅ Confirmar'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Transaction Review Modal - ULTRA VISÍVEL */}
      {waitingConfirmation && editableTransactions.length > 0 && (
        <div 
          className="modal-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)', // Backdrop mais sólido
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999, // Z-index muito alto
            padding: '10px'
          }}
        >
          <div 
            className="modal-content"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9))', // Mais sólido
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              height: '90vh',
              maxHeight: '700px',
              display: 'flex',
              flexDirection: 'column',
              color: '#1a202c', // Texto escuro para contraste
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)', // Sombra mais forte
              border: '2px solid rgba(59, 130, 246, 0.3)', // Borda azul
              overflow: 'hidden',
              animation: 'modalAppear 0.3s ease-out'
            }}
          >
            {/* Header do Modal */}
            <div style={{
              padding: '20px 25px',
              borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 197, 253, 0.1))',
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
                  gap: '10px',
                  color: '#1e40af' // Azul escuro
                }}>
                  📋 Revisar Transações
                </h2>
                <p style={{
                  margin: '5px 0 0 0',
                  fontSize: '14px',
                  opacity: 0.7,
                  color: '#374151' // Cinza escuro
                }}>
                  {editableTransactions.length} transação{editableTransactions.length > 1 ? 'ões' : 'ão'} encontrada{editableTransactions.length > 1 ? 's' : ''}
                </p>
                <p style={{
                  margin: '3px 0 0 0',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#059669', // Verde para total
                  textShadow: 'none'
                }}>
                  Total: R$ {editableTransactions.reduce((sum, tx) => sum + Math.abs(tx.amount || 0), 0).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => handleSendMessage('não')}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid #ef4444',
                  borderRadius: '8px',
                  color: '#dc2626', // Vermelho escuro para contraste
                  padding: '8px',
                  cursor: 'pointer',
                  fontSize: '18px',
                  fontWeight: 'bold',
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
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '15px',
                  padding: '20px',
                  border: '2px solid rgba(59, 130, 246, 0.3)',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '15px',
                    gap: '15px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        marginBottom: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#1f2937' // Texto escuro
                      }}>
                        {transaction.type === 'income' ? '💰' : '💸'}
                        <input
                          type="text"
                          value={transaction.description || ''}
                          onChange={(e) => updateTransaction(index, { ...transaction, description: e.target.value })}
                          placeholder="Descrição da transação..."
                          style={{
                            background: 'white', // Fundo branco sólido
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '8px 12px',
                            color: '#1f2937', // Texto escuro
                            fontSize: '14px',
                            flex: 1,
                            outline: 'none',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        {/* Linha 1: Tipo e Valor lado a lado */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1.2fr',
                          gap: '12px'
                        }}>
                          <div>
                            <label style={{ 
                              fontSize: '13px', 
                              color: '#374151',
                              fontWeight: '700',
                              display: 'block', 
                              marginBottom: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Tipo
                            </label>
                            <select
                              value={transaction.type || 'expense'}
                              onChange={(e) => updateTransaction(index, { 
                                ...transaction, 
                                type: e.target.value as 'income' | 'expense',
                                amount: Math.abs(transaction.amount || 0) * (e.target.value === 'expense' ? -1 : 1)
                              })}
                              style={{
                                background: 'white',
                                border: '2px solid #e5e7eb',
                                borderRadius: '10px',
                                padding: '10px 12px',
                                color: '#1f2937',
                                fontSize: '14px',
                                fontWeight: '600',
                                width: '100%',
                                outline: 'none',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                appearance: 'none',
                                backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
                                backgroundPosition: 'right 8px center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '16px',
                                paddingRight: '32px'
                              }}
                            >
                              <option value="income">💰 Entrada</option>
                              <option value="expense">💸 Saída</option>
                            </select>
                          </div>
                          
                          <div>
                            <label style={{ 
                              fontSize: '13px', 
                              color: '#374151',
                              fontWeight: '700',
                              display: 'block', 
                              marginBottom: '6px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px'
                            }}>
                              Valor (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={Math.abs(transaction.amount || 0)}
                              onChange={(e) => updateTransaction(index, { 
                                ...transaction, 
                                amount: transaction.type === 'expense' ? -Math.abs(parseFloat(e.target.value) || 0) : Math.abs(parseFloat(e.target.value) || 0)
                              })}
                              style={{
                                background: 'white',
                                border: '2px solid #e5e7eb',
                                borderRadius: '10px',
                                padding: '10px 12px',
                                color: '#1f2937',
                                fontSize: '16px',
                                fontWeight: '700',
                                width: '100%',
                                outline: 'none',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                              }}
                              placeholder="0,00"
                            />
                          </div>
                        </div>

                        {/* Linha 2: Data ocupando largura completa */}
                        <div>
                          <label style={{ 
                            fontSize: '13px', 
                            color: '#374151',
                            fontWeight: '700',
                            display: 'block', 
                            marginBottom: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Data
                          </label>
                          <input
                            type="date"
                            value={transaction.date || new Date().toISOString().split('T')[0]}
                            onChange={(e) => updateTransaction(index, { ...transaction, date: e.target.value })}
                            style={{
                              background: 'white',
                              border: '2px solid #e5e7eb',
                              borderRadius: '10px',
                              padding: '10px 12px',
                              color: '#1f2937',
                              fontSize: '14px',
                              fontWeight: '600',
                              width: '100%',
                              outline: 'none',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ 
                          fontSize: '13px', 
                          color: '#374151',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginBottom: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          <Tag style={{ width: '14px', height: '14px' }} />
                          Categoria
                        </label>
                        
                        {/* Dropdown customizado igual ao da dashboard */}
                        <div style={{ position: 'relative' }} data-category-dropdown>
                          <button
                            type="button"
                            onClick={() => toggleCategoryDropdown(index)}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '2px solid #e5e7eb',
                              borderRadius: '10px',
                              background: 'white',
                              color: transaction.category ? '#1f2937' : '#9ca3af',
                              fontSize: '14px',
                              fontWeight: '600',
                              textAlign: 'left',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              cursor: 'pointer',
                              outline: 'none',
                              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <span>
                              {transaction.category 
                                ? EXPENSE_CATEGORIES.find(cat => cat.toLowerCase() === transaction.category) || transaction.category
                                : 'Selecione uma categoria'
                              }
                            </span>
                            <ChevronDown 
                              style={{ 
                                width: '16px', 
                                height: '16px', 
                                color: '#6b7280',
                                transform: categoryDropdownStates[index] ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease'
                              }} 
                            />
                          </button>
                          
                          {categoryDropdownStates[index] && (
                            <div 
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                marginTop: '4px',
                                backgroundColor: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                                zIndex: 50,
                                maxHeight: '200px',
                                overflow: 'hidden'
                              }}
                            >
                              {/* Campo de busca */}
                              <div style={{ padding: '8px', borderBottom: '1px solid #f3f4f6' }}>
                                <div style={{ position: 'relative' }}>
                                  <Search 
                                    style={{ 
                                      position: 'absolute', 
                                      left: '8px', 
                                      top: '50%', 
                                      transform: 'translateY(-50%)', 
                                      width: '14px', 
                                      height: '14px', 
                                      color: '#9ca3af' 
                                    }} 
                                  />
                                  <input
                                    type="text"
                                    placeholder="Buscar categoria..."
                                    value={categorySearchTerms[index] || ''}
                                    onChange={(e) => setCategorySearch(index, e.target.value)}
                                    style={{
                                      width: '100%',
                                      paddingLeft: '28px',
                                      paddingRight: '8px',
                                      paddingTop: '6px',
                                      paddingBottom: '6px',
                                      fontSize: '12px',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '6px',
                                      outline: 'none',
                                      color: '#1f2937'
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {/* Lista de categorias */}
                              <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                                {getFilteredCategories(index).length > 0 ? (
                                  getFilteredCategories(index).map((category) => (
                                    <button
                                      key={category}
                                      type="button"
                                      onClick={() => selectCategory(index, category)}
                                      style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        textAlign: 'left',
                                        fontSize: '14px',
                                        color: '#1f2937',
                                        backgroundColor: transaction.category === category.toLowerCase() ? '#f3f4f6' : 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.1s ease'
                                      }}
                                      onMouseEnter={(e) => {
                                        if (transaction.category !== category.toLowerCase()) {
                                          e.currentTarget.style.backgroundColor = '#f9fafb';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (transaction.category !== category.toLowerCase()) {
                                          e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                      }}
                                    >
                                      {category}
                                    </button>
                                  ))
                                ) : (
                                  <div style={{ 
                                    padding: '12px', 
                                    fontSize: '12px', 
                                    color: '#9ca3af', 
                                    textAlign: 'center' 
                                  }}>
                                    Nenhuma categoria encontrada
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTransaction(index)}
                      style={{
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1))',
                        border: '2px solid #ef4444',
                        borderRadius: '12px',
                        color: '#dc2626',
                        padding: '12px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        width: '44px',
                        height: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                        alignSelf: 'flex-start',
                        marginTop: '2px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
                      }}
                      title="Excluir transação"
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
              borderTop: '2px solid rgba(59, 130, 246, 0.2)',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              gap: '15px',
              justifyContent: 'space-between'
            }}>
              <button
                onClick={() => handleSendMessage('não')}
                style={{
                  background: '#ef4444', // Vermelho sólido
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '12px 24px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  flex: 1,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.3)';
                }}
              >
                ❌ Cancelar
              </button>
              
              <button
                onClick={() => handleSendMessage('sim')}
                disabled={savingTransactions}
                style={{
                  background: savingTransactions 
                    ? '#9ca3af' 
                    : '#3b82f6', // Azul sólido
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  padding: '12px 24px',
                  cursor: savingTransactions ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  flex: 2,
                  boxShadow: savingTransactions ? 'none' : '0 4px 15px rgba(59, 130, 246, 0.3)',
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
      )}

      {/* CSS Animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes liquidGlassAppear {
            0% { 
              opacity: 0; 
              transform: translateX(-50%) translateY(30px) scale(0.9);
              backdropFilter: blur(0px);
            }
            60% {
              transform: translateX(-50%) translateY(-5px) scale(1.02);
            }
            100% { 
              opacity: 1; 
              transform: translateX(-50%) translateY(0) scale(1);
              backdropFilter: blur(25px);
            }
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
          *, *::before, *::after {
            box-sizing: border-box;
          }
          
          html, body, #root {
            background-color: #31518b !important;
            overflow-x: hidden !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          .financial-advisor-page {
            overflow-x: hidden !important;
            background-color: #31518b !important;
            min-height: 100vh !important;
            width: 100vw !important;
          }
          
          /* Força qualquer elemento branco a ter o fundo correto */
          div, section, main, article {
            background-color: inherit;
          }          /* Responsividade melhorada */
          @media (max-width: 768px) {
            .header {
              padding: 12px 15px !important;
              height: 60px !important;
            }
            .header h1 {
              font-size: 20px !important;
            }
            .chat-container {
              padding: 0 15px !important;
              padding-top: 80px !important;
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
              padding: 10px 12px !important;
              height: 55px !important;
            }
            .header h1 {
              font-size: 18px !important;
            }
            .chat-container {
              padding: 0 12px !important;
              padding-top: 75px !important;
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
    
    {/* Modal de Paywall para limites atingidos */}
    <PaywallModal
      isOpen={showPaywall}
      onClose={() => setShowPaywall(false)}
      trigger="messages"
      userId={currentUserId || ''}
      onUpgrade={(planType: any) => {
        setShowPaywall(false);
        console.log('Upgrade selecionado:', planType);
        // Redirecionar para página de planos ou processar upgrade
        navigate('/settings');
      }}
    />
    
    {/* Modal de Ad Rewarded para jornada progressiva */}
    <AdRewardModal
      isOpen={showAdReward}
      onClose={() => setShowAdReward(false)}
      onWatchAd={handleWatchAdReward}
      currentDay={currentDay}
      adsWatched={adsWatched}
      adsRequired={adsRequired}
      messagesWillGrant={currentDay <= 3 ? [3, 4, 5][currentDay - 1] : 0}
      isLoading={isWatchingAd}
    />
  </>
  </FinancialAdvisorGate>
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

// Adicionar CSS para animações do modal
const modalStyles = `
  @keyframes modalAppear {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  
  @keyframes slideUpFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Injetar CSS se ainda não foi injetado
if (typeof document !== 'undefined' && !document.querySelector('#modal-animations')) {
  const style = document.createElement('style');
  style.id = 'modal-animations';
  style.textContent = modalStyles;
  document.head.appendChild(style);
}

export default FinancialAdvisorPage;

