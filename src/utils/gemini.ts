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

IMPORTANTE: NUNCA use asteriscos (*) ou duplos asteriscos (**) nas suas respostas. Use apenas texto limpo.

ORTOGRAFIA OBRIGATORIA - ACENTOS E CEDILHA:
SEMPRE use acentos e cedilha corretos em portugues brasileiro:
- transacao ERRADO -> transacao correto: transacao (use: transaCAo com til e cedilha)
- Use SEMPRE: transacao -> transa\u00e7\u00e3o, descricao -> descri\u00e7\u00e3o, acao -> a\u00e7\u00e3o
- Use SEMPRE: nao -> n\u00e3o, voce -> voc\u00ea, ate -> at\u00e9, tambem -> tamb\u00e9m
- Use SEMPRE: financas -> finan\u00e7as, servico -> servi\u00e7o, preco -> pre\u00e7o
- NUNCA escreva sem acentos. Isso e CRITICO.

NUNCA use emojis nas respostas. Responda apenas com texto limpo sem emojis.

FORMATAÇÃO DE VALORES MONETÁRIOS - PADRÃO BRASILEIRO OBRIGATÓRIO:
Sempre use o formato brasileiro para valores monetários:
- Use PONTO para separar milhares: 1.000, 10.000, 100.000, 1.000.000
- Use VÍRGULA para separar centavos: R$ 1.234,56
- Exemplos corretos: R$ 300,00 | R$ 1.500,00 | R$ 25.000,00 | R$ 1.234.567,89
- NUNCA use formato americano (ex: 1,234.56 está ERRADO)
- SEMPRE use o símbolo R$ antes do valor

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
3. 🔍 Explique sua interpretação: "Identifiquei o valor de R$ 1.234,56 baseado no campo [descrição do campo]"
4. 📊 Se houver divergências ou valores diferentes no mesmo documento, liste TODOS os valores encontrados
5. ✋ Recomende verificação manual sempre que houver incerteza
6. 🎯 Use frases como: "⚠️ VERIFICAÇÃO NECESSÁRIA", "❓ Valor incerto", "✅ Valor confirmado"

TRANSPARÊNCIA EM LEITURAS DE DOCUMENTOS:
- "📋 Analisei seu documento e identifiquei o valor de R$ 1.234,56"
- "⚠️ Encontrei múltiplos valores (R$ 1.500,00 e R$ 2.300,00), verifique qual é o correto"
- "❓ Qualidade da imagem pode afetar precisão - por favor confirme o valor R$ 500,00"
- "✅ Valor claro e legível no documento: R$ 750,00"
- "🔍 Baseei-me no campo [total/subtotal/valor líquido] para identificar R$ 1.000,00"

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

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const debugText = await response.text().catch(() => '');
      console.error('Gemini API returned non-JSON content-type:', contentType);
      if (debugText) {
        console.error('Gemini API non-JSON payload preview:', debugText.substring(0, 300));
      }
      throw new Error('Unexpected non-JSON response from Gemini API');
    }

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

        if (/<\s*!doctype|<\s*html|<\s*body|<\s*head/i.test(responseText)) {
          console.warn('Gemini response contained HTML markup. Returning fallback message.');
          return "⚠️ Recebi uma resposta inesperada da IA. Vamos tentar novamente em instantes.";
        }

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

    // Corrigir acentos comuns que o modelo pode omitir
    responseText = fixPortugueseAccents(responseText);

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

    // 🔒 PROTEÇÃO: Detectar HTML antes de tentar parsear JSON
    const responseText = await response.text();
    console.log('📥 Resposta do Gemini (primeiros 200 chars):', responseText.substring(0, 200));

    // Verificar se é HTML (página de erro)
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error('❌ [DOCTYPE_ERROR] Gemini API retornou HTML ao invés de JSON');
      throw new Error('Servidor retornou resposta inválida (HTML). Tente novamente em alguns minutos.');
    }

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} - ${responseText.substring(0, 200)}`);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('❌ Erro ao parsear resposta do Gemini:', parseErr);
      throw new Error('Resposta inválida do servidor Gemini');
    }
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
  return Math.ceil(words * 1.5); // Estimativa para portugu\u00eas
}

/**
 * Corrige acentos e cedilha em palavras portuguesas comuns que o modelo pode omitir
 */
export function fixPortugueseAccents(text: string): string {
  if (!text) return text;

  const replacements: [RegExp, string][] = [
    // Cedilha
    [/\btransacao\b/gi, 'transa\u00e7\u00e3o'],
    [/\btransacoes\b/gi, 'transa\u00e7\u00f5es'],
    [/\bdescricao\b/gi, 'descri\u00e7\u00e3o'],
    [/\bdescricoes\b/gi, 'descri\u00e7\u00f5es'],
    [/\bacao\b/gi, 'a\u00e7\u00e3o'],
    [/\bacoes\b/gi, 'a\u00e7\u00f5es'],
    [/\bfuncao\b/gi, 'fun\u00e7\u00e3o'],
    [/\bfuncoes\b/gi, 'fun\u00e7\u00f5es'],
    [/\binformacao\b/gi, 'informa\u00e7\u00e3o'],
    [/\binformacoes\b/gi, 'informa\u00e7\u00f5es'],
    [/\bsituacao\b/gi, 'situa\u00e7\u00e3o'],
    [/\borganizacao\b/gi, 'organiza\u00e7\u00e3o'],
    [/\bservico\b/gi, 'servi\u00e7o'],
    [/\bservicos\b/gi, 'servi\u00e7os'],
    [/\bpreco\b/gi, 'pre\u00e7o'],
    [/\bprecos\b/gi, 'pre\u00e7os'],
    [/\bfinancas\b/gi, 'finan\u00e7as'],
    [/\bfinanceira\b/gi, 'financeira'],
    [/\bfinanceiro\b/gi, 'financeiro'],
    [/\bcalculo\b/gi, 'c\u00e1lculo'],
    [/\bconfirmacao\b/gi, 'confirma\u00e7\u00e3o'],
    [/\bsugestao\b/gi, 'sugest\u00e3o'],
    [/\bsugestoes\b/gi, 'sugest\u00f5es'],
    [/\boperacao\b/gi, 'opera\u00e7\u00e3o'],
    [/\boperacoes\b/gi, 'opera\u00e7\u00f5es'],
    // Til
    [/\bnao\b/gi, 'n\u00e3o'],
    [/\bentao\b/gi, 'ent\u00e3o'],
    [/\bpadrao\b/gi, 'padr\u00e3o'],
    [/\bpadroes\b/gi, 'padr\u00f5es'],
    [/\bmao\b/gi, 'm\u00e3o'],
    [/\bmaos\b/gi, 'm\u00e3os'],
    [/\bcoracão\b/gi, 'cora\u00e7\u00e3o'],
    // Agudo
    [/\bvoce\b/gi, 'voc\u00ea'],
    [/\bate\b/gi, 'at\u00e9'],
    [/\btambem\b/gi, 'tamb\u00e9m'],
    [/\balem\b/gi, 'al\u00e9m'],
    [/\bporem\b/gi, 'por\u00e9m'],
    [/\bnecessario\b/gi, 'necess\u00e1rio'],
    [/\bnecessaria\b/gi, 'necess\u00e1ria'],
    [/\banalise\b/gi, 'an\u00e1lise'],
    [/\bultima\b/gi, '\u00faltima'],
    [/\bultimo\b/gi, '\u00faltimo'],
    [/\bultimas\b/gi, '\u00faltimas'],
    [/\bultimos\b/gi, '\u00faltimos'],
    [/\bobrigatorio\b/gi, 'obrigat\u00f3rio'],
    [/\bperiodo\b/gi, 'per\u00edodo'],
    [/\bsaldo\b/gi, 'saldo'],
    [/\bdespesa\b/gi, 'despesa'],
    [/\breceita\b/gi, 'receita'],
    [/\bcategoria\b/gi, 'categoria'],
    [/\brelatorio\b/gi, 'relat\u00f3rio'],
    [/\brelatorios\b/gi, 'relat\u00f3rios'],
    [/\beconomia\b/gi, 'economia'],
    [/\bmes\b/gi, 'm\u00eas'],
    [/\bmeses\b/gi, 'meses'],
    [/\bhorario\b/gi, 'hor\u00e1rio'],
    // Processado sem acento
    [/\bprocessado\b/gi, 'processado'],
    [/\bsucesso\b/gi, 'sucesso'],
  ];

  let result = text;
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  return result;
}
