/**
 * Utility functions for interacting with Gemini API 2.0
 */

import { supabase } from '@/lib/supabase'; // Ensure supabase is imported
import { Transaction } from '@/types';
// Corrected imports from api-usage.ts
import { checkUserMonthlyTokenLimit, logApiCallDetails, ApiCallDetails } from './api-usage';

/**
 * Configuração da API Gemini
 */
// Nome da API para controle de uso
const API_NAME = 'gemini';

// Usando o modelo Gemini 2.5 Flash Preview mais recente e otimizado
const GEMINI_MODEL_NAME = 'gemini-2.5-flash-lite'; // Updated to use the latest 2.5 Flash Lite model (July 2025)

// URL base da API Gemini
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Define an interface for structured API key information
 */
interface ApiKeyInfo {
  source: string;
  key: string;
  mode?: string;
}

/**
 * Interface para o JSON estruturado que a Gemini deve retornar para transações
 */
export interface GeminiTransactionIntent {
  action: 'add_transaction';
  transaction_type: 'income' | 'expense';
  description: string;
  amount: number;
  category?: string; // Opcional, Gemini pode não conseguir identificar sempre
  date?: string; // Opcional, formato YYYY-MM-DD
}

/**
 * Função para obter a API key de diferentes fontes de ambiente
 */
export function getApiKey(): string | null {
  // Tenta obter de import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const viteKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
    if (viteKey) return viteKey as string;
  }
  // Tenta obter de process.env (Node.js, pode não ser relevante no frontend diretamente mas bom para SSR/testes)
  if (typeof process !== 'undefined' && process.env) {
    const nodeKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (nodeKey) return nodeKey;
  }
  // Tenta obter do localStorage
  if (typeof localStorage !== 'undefined') {
    const localKey = localStorage.getItem('gemini_api_key');
    if (localKey) return localKey;
  }
  return null;
}

/**
 * Determina a origem da chave da API para fins de log.
 * @returns String descrevendo a origem da chave.
 */
function getApiKeySource(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env.VITE_GEMINI_API_KEY) return 'import.meta.env.VITE_GEMINI_API_KEY';
    if (import.meta.env.GEMINI_API_KEY) return 'import.meta.env.GEMINI_API_KEY';
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.VITE_GEMINI_API_KEY) return 'process.env.VITE_GEMINI_API_KEY';
    if (process.env.GEMINI_API_KEY) return 'process.env.GEMINI_API_KEY';
  }
  if (typeof localStorage !== 'undefined' && localStorage.getItem('gemini_api_key')) {
    return 'localStorage';
  }
  return 'unknown';
}

/**
 * Busca uma resposta do modelo Gemini 1.5 Flash Lite.
 * @param prompt O prompt do usuário.
 * @param options Opções adicionais, como instruções de sistema.
 * @returns Uma promessa que resolve para a resposta da IA ou uma mensagem de erro.
 */
export async function fetchGeminiFlashLite(
  prompt: string,
  options?: { systemInstruction?: string }
): Promise<string> {
  const withinLimit = await checkUserMonthlyTokenLimit();
  if (!withinLimit) {
    const limitReachedMessage = "Limite de uso da IA atingido para este mês. Por favor, tente novamente mais tarde.";
    await logApiCallDetails({
      model_name: GEMINI_MODEL_NAME,
      error_message: 'LIMIT_REACHED',
      api_key_source: getApiKeySource()
    });
    return limitReachedMessage;
  }

  const apiKey = getApiKey();
  const apiKeySource = getApiKeySource();
  const defaultSystemInstruction = `
Você é uma IA chamada Stater IA e atua em um aplicativo de organização e controle financeiro, deve responder de forma inteligente e correta, como um consultor financeiro, mas que também não é enrolado, mas que fala o necessário e essencial de maneira que inspire e dê ótimas ideias para o usuário. 

IMPORTANTE: NUNCA use asteriscos (*) ou duplos asteriscos (**) nas suas respostas. Use apenas texto limpo com emojis quando apropriado.

Responde utilizando listas simples, emojis, use texto em negrito apenas quando suportado pelo sistema, e dê espaçamento entre tópicos de fala.
Seu objetivo é ajudar o usuário a gerenciar suas finanças.
Responda de forma concisa, prática e motivadora.
NUNCA use asteriscos (*) ou duplos asteriscos (**) nas suas respostas - use apenas texto simples e emojis.

INSTRUÇÕES ESPECIAIS PARA TELEGRAM:
Se o usuário perguntar sobre "deslogar", "sair da conta", "desconectar telegram", "logout" ou similar, explique como fazer:

🔌 Para desconectar do Telegram:
1. No App Stater: Vá em Dashboard → encontre o card "Telegram Conectado" → clique em "🔌 Desconectar"
2. Ou em Configurações: Vá em Configurações → aba Telegram → botão "Desconectar"
3. Para reconectar: Vá em Configurações → Telegram → "Conectar ao Telegram"

Isso desconectará sua conta do bot e você não receberá mais notificações até reconectar.

ANÁLISE DE FATURAS/EXTRATOS - TRANSPARÊNCIA OBRIGATÓRIA:
Quando analisar documentos financeiros, faturas ou extratos:
1. 📋 SEMPRE mencione explicitamente os valores que conseguiu identificar
2. ⚠️ Se houver dificuldade na leitura (baixa qualidade, valores sobrepostos, múltiplos totais), COMUNIQUE isso claramente
3. 🔍 Explique sua interpretação: "Identifiquei o valor de R$ X,XX baseado no campo [descrição do campo]"
4. 📊 Se houver divergências ou valores diferentes no mesmo documento, liste TODOS os valores encontrados
5. ✋ Recomende verificação manual sempre que houver incerteza
6. 🎯 Use frases como: "⚠️ VERIFICAÇÃO NECESSÁRIA", "❓ Valor incerto", "✅ Valor confirmado"

TRANSPARÊNCIA EM LEITURAS DE DOCUMENTOS:
- "📋 Analisei seu documento e identifiquei o valor de R$ X,XX"
- "⚠️ Encontrei múltiplos valores (R$ X,XX e R$ Y,YY), verifique qual é o correto"
- "❓ Qualidade da imagem pode afetar precisão - por favor confirme o valor R$ X,XX"
- "✅ Valor claro e legível no documento: R$ X,XX"
- "🔍 Baseei-me no campo [total/subtotal/valor líquido] para identificar R$ X,XX"

IMPORTANTE: SEMPRE CATEGORIZE AUTOMATICAMENTE TODAS AS TRANSAÇÕES!
Quando detectar uma transação, NUNCA deixe a categoria em branco ou null.
Analise a descrição e aplique a categoria mais adequada automaticamente.
Se não conseguir identificar uma categoria específica, use "Outros".

Se o usuário expressar a intenção de adicionar uma nova transação (receita ou despesa), você DEVE tentar extrair as seguintes informações:
- tipo da transação ('income' para receita, 'expense' para despesa)
- descrição da transação
- valor da transação (deve ser um número)
- SEMPRE uma categoria (OBRIGATÓRIO - analise a descrição e categorize automaticamente)
- opcionalmente, uma data (no formato YYYY-MM-DD)

REGRAS DE CATEGORIZAÇÃO AUTOMÁTICA:
- "Alimentação": supermercados, restaurantes, delivery, padaria, açougue, feira
- "Transporte": combustível, uber, táxi, ônibus, pedágio, estacionamento
- "Saúde": farmácia, médico, consulta, exame, plano de saúde, remédio
- "Entretenimento": cinema, streaming, jogos, viagem, bar, festa
- "Moradia": aluguel, condomínio, água, luz, gás, internet
- "Educação": curso, livro, mensalidade, aula, material escolar
- "Tecnologia": software, app, celular, computador, equipamento
- "Serviços": limpeza, conserto, manutenção, banco
- "Outros": quando não conseguir identificar nenhuma categoria acima

Se você identificar uma intenção de adicionar transação e conseguir extrair PELO MENOS o tipo, descrição e valor, você DEVE responder APENAS com um objeto JSON formatado da seguinte maneira, SEM NENHUM TEXTO ADICIONAL ANTES OU DEPOIS DO JSON:
{
  "action": "add_transaction",
  "transaction_type": "income" | "expense",
  "description": "string",
  "amount": number,
  "category": "string",
  "date": "YYYY-MM-DD" | null
}

Exemplos de como você deve responder com JSON (SEMPRE com categoria automática):
Usuário: "adicione uma despesa de 50 reais com mercado"
Sua Resposta (APENAS O JSON):
{
  "action": "add_transaction",
  "transaction_type": "expense",
  "description": "mercado",
  "amount": 50,
  "category": "Alimentação", 
  "date": null
}

Usuário: "registre uma receita de 1200 de salário dia 05/03/2025"
Sua Resposta (APENAS O JSON):
{
  "action": "add_transaction",
  "transaction_type": "income",
  "description": "salário",
  "amount": 1200,
  "category": "Outros",
  "date": "2025-03-05"
}

Usuário: "gasto de 30 reais com uber"
Sua Resposta (APENAS O JSON):
{
  "action": "add_transaction",
  "transaction_type": "expense",
  "description": "uber",
  "amount": 30,
  "category": "Transporte",
  "date": null
}

Se não for uma intenção clara de adicionar transação ou se você não conseguir extrair os dados mínimos, responda normalmente como um assistente de chat.
Se o usuário pedir para registrar, adicionar, anotar, etc., uma receita, entrada, ganho, despesa, saida, gasto, etc., isso é uma intenção de adicionar transação.
`;

  const systemInstructionToUse = options?.systemInstruction || defaultSystemInstruction;

  if (!apiKey) {
    console.error("API Key for Gemini is not configured. Returning hardcoded response.");
    // Registrar a falha de configuração da API Key
    await logApiCallDetails({
      model_name: GEMINI_MODEL_NAME,
      error_message: 'API_KEY_NOT_CONFIGURED',
      api_key_source: apiKeySource
    });
    return "A chave da API para o Gemini não está configurada. Por favor, adicione sua chave nas configurações para usar esta funcionalidade.";
  }

  // Obter o user_id para logar
  let userId = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userId = user.id;
  } catch (e) {
    console.warn('Não foi possível obter user_id para log de API, mas prosseguindo.');
  }

  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_NAME}:generateContent`;

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
        role: 'user'
      }
    ],
    system_instruction: {
      parts: [{ text: systemInstructionToUse }]
    },
    generationConfig: {
      temperature: 0.7,
    },
  };

  try {
    console.log('Calling Gemini API with:', { 
      url: `${GEMINI_API_URL}?key=XXXXX`, // Key omitted for logging
      requestBodyPreview: JSON.stringify(requestBody).substring(0, 200) + '...',
      userId: userId // Logando o userId que fará a chamada
    });

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    // Log do status da resposta
    console.log(`Gemini API response status: ${response.status} ${response.statusText}`);
    
    // Se a resposta não for OK, tentar extrair informações detalhadas do erro
    if (!response.ok) {
      let errorDetails = '';
      try {
        // Tentar extrair o JSON de erro para detalhes mais precisos
        const errorJson = await response.json();
        errorDetails = JSON.stringify(errorJson, null, 2);
        console.error('Gemini API detailed error:', errorJson);
        
        // Se houver uma mensagem de erro específica, usar para a resposta de fallback
        if (errorJson.error && errorJson.error.message) {
          return `Desculpe, houve um problema com a IA: ${errorJson.error.message}`;
        }
      } catch (e) {
        // Se não for possível extrair JSON, usar o texto bruto
        errorDetails = await response.text();
        console.error('Gemini API error text:', errorDetails);
      }
      
      throw new Error(`API error (${response.status}): ${errorDetails}`);
    }
    
    // Parse da resposta como JSON
    const data: GeminiResponse = await response.json();
    console.log('Gemini API response preview:', JSON.stringify(data).substring(0, 200) + '...');
    
    // Verificar se há conteúdo bloqueado ou erro
    if (data.promptFeedback?.blockReason) {
      console.warn('Prompt blocked by safety settings:', data.promptFeedback.blockReason);
      return "Desculpe, não posso responder a esse tipo de pergunta. Posso ajudar com questões financeiras!";
    }
    
    // Verificar se há erro explícito na resposta
    if (data.error) {
      console.error('Gemini API error in response:', data.error);
      return `Desculpe, houve um problema com a IA: ${data.error.message}`;
    }
    
    // Extrair o texto da resposta
    let responseText = "";
    if (data.candidates && data.candidates.length > 0) {
      const textParts = data.candidates[0].content.parts;
      if (textParts && textParts.length > 0) {
        responseText = textParts[0].text.trim();
        console.log('Gemini response text extracted successfully:', responseText.substring(0, 50) + '...');
        
        // Calcular tokens usados e registrar (se implementado)
        if (data.usageMetadata) {
          await logApiCallDetails({
            model_name: GEMINI_MODEL_NAME,
            prompt_tokens: data.usageMetadata.promptTokenCount,
            candidates_tokens: data.usageMetadata.candidatesTokenCount,
            total_tokens: data.usageMetadata.totalTokenCount,
            api_key_source: apiKeySource
          });
        }
      }
    }
    
    // Verificar se temos uma resposta válida
    if (!responseText) {
      console.error('No text in Gemini response:', data);
      throw new Error('No valid response content received from Gemini API');
    }
    
    // Remover asteriscos das respostas
    responseText = responseText.replace(/\*\*/g, '').replace(/\*/g, '');
    
    return responseText;
  } catch (error: any) {
    console.error('Erro ao fazer a chamada para a API Gemini:', error);
    // Registrar erro genérico da chamada fetch
    await logApiCallDetails({
      model_name: GEMINI_MODEL_NAME,
      error_message: `FETCH_ERROR: ${error.message}`,
      api_key_source: apiKeySource
    });
    return "Erro ao comunicar com o serviço de IA. Verifique sua conexão e tente novamente.";
  }
}

/**
 * Função específica para processar áudio com Gemini usando multipart
 */
export async function fetchGeminiAudio(
  prompt: string,
  audioBase64: string,
  mimeType: string,
  options?: { systemInstruction?: string }
): Promise<string> {
  const withinLimit = await checkUserMonthlyTokenLimit();
  if (!withinLimit) {
    const limitReachedMessage = "Limite de uso da IA atingido para este mês. Por favor, tente novamente mais tarde.";
    await logApiCallDetails({
      model_name: GEMINI_MODEL_NAME,
      error_message: 'LIMIT_REACHED',
      api_key_source: getApiKeySource()
    });
    return limitReachedMessage;
  }

  const apiKey = getApiKey();
  const apiKeySource = getApiKeySource();
  
  if (!apiKey) {
    console.error("API Key for Gemini is not configured. Returning hardcoded response.");
    await logApiCallDetails({
      model_name: GEMINI_MODEL_NAME,
      error_message: 'API_KEY_NOT_CONFIGURED',
      api_key_source: apiKeySource
    });
    return "A chave da API para o Gemini não está configurada. Por favor, adicione sua chave nas configurações para usar esta funcionalidade.";
  }

  // Obter o user_id para logar
  let userId = null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) userId = user.id;
  } catch (e) {
    console.warn('Não foi possível obter user_id para log de API, mas prosseguindo.');
  }

  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_NAME}:generateContent`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: audioBase64
            }
          }
        ],
        role: 'user'
      }
    ],
    generationConfig: {
      temperature: 0.7,
    },
  };

  try {
    console.log('Calling Gemini API with audio:', { 
      url: `${GEMINI_API_URL}?key=XXXXX`,
      audioSize: audioBase64.length,
      mimeType,
      userId
    });

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui processar o áudio.';

    // CORREÇÃO: Se a resposta parece ser JSON bruto, extrair apenas a parte amigável
    if (typeof aiMessage === 'string') {
      try {
        // Se for JSON, tentar extrair a mensagem response
        if (aiMessage.trim().startsWith('{') || aiMessage.trim().startsWith('[')) {
          const cleanedText = aiMessage.replace(/```json\n?|```\n?/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          aiMessage = parsed.response || 'Não detectei fala humana neste áudio. Por favor, fale claramente para que eu possa ajudá-lo com suas finanças.';
        }
      } catch (parseError) {
        // Se não conseguir parsear, usar mensagem padrão amigável
        if (aiMessage.trim().startsWith('{') || aiMessage.trim().startsWith('[')) {
          aiMessage = 'Não detectei fala humana neste áudio. Por favor, fale claramente para que eu possa ajudá-lo com suas finanças.';
        }
      }
    }

    // Log da chamada bem-sucedida
    await logApiCallDetails({
      model_name: GEMINI_MODEL_NAME,
      api_key_source: apiKeySource
    });

    return aiMessage;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Log do erro
    await logApiCallDetails({
      model_name: GEMINI_MODEL_NAME,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      api_key_source: apiKeySource
    });

    return `Erro ao processar áudio: ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
  }
}

/**
 * Interface para resposta da API Gemini
 */
interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>;
      role?: string;
    };
    finishReason?: string;
    safetyRatings?: any[];
    // tokenCount pode existir aqui em algumas versões da API, mas usageMetadata é mais comum para o total
  }>;
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: any[];
  };
  usageMetadata?: { // Local primário para contagem de tokens da chamada
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
  error?: { 
    code: number;
    message: string;
    details?: any[];
  };
}

/**
 * Estima o número de tokens em um texto.
 * Esta é uma estimativa simples baseada em palavras.
 * @param text Texto para estimar tokens.
 * @returns Número estimado de tokens.
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.5); // Estimativa para português
}
