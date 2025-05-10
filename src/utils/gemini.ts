/**
 * Utility functions for interacting with Gemini API 2.0
 */

import { checkApiUsageLimit, incrementApiUsage, estimateTokenCount } from './api-usage';

/**
 * Configuração da API Gemini
 */
// Nome da API para controle de uso
const API_NAME = 'gemini';

// Usando o modelo Gemini Flash mais recente e otimizado, que é o 'gemini-2.0-flash-lite'
const GEMINI_MODEL = 'gemini-2.0-flash-lite'; // Updated to use the specific 2.0 Flash Lite model

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
 * Função para obter a API key de diferentes fontes de ambiente
 */
export function getApiKey(): string | null {
  const possibleKeys: ApiKeyInfo[] = [];

  // DEBUG LOGS INSIDE getApiKey
  console.log('[getApiKey CALLED] Environment MODE:', import.meta.env.MODE);
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    console.log('[getApiKey CALLED] import.meta.env.VITE_GEMINI_API_KEY:', import.meta.env.VITE_GEMINI_API_KEY);
    console.log('[getApiKey CALLED] import.meta.env.GEMINI_API_KEY:', import.meta.env.GEMINI_API_KEY);
  }
  if (typeof process !== 'undefined' && process.env) {
    console.log('[getApiKey CALLED] process.env.VITE_GEMINI_API_KEY:', process.env.VITE_GEMINI_API_KEY);
    console.log('[getApiKey CALLED] process.env.GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
  }

  // Try to get from process.env (Node.js environment - more relevant for backend or build processes)
  if (typeof process !== 'undefined' && process.env) {
    const processViteKey = process.env.VITE_GEMINI_API_KEY;
    if (processViteKey) {
      possibleKeys.push({ source: 'process.env.VITE_GEMINI_API_KEY', key: processViteKey });
    }
    const processGeminiKey = process.env.GEMINI_API_KEY;
    if (processGeminiKey) {
      possibleKeys.push({ source: 'process.env.GEMINI_API_KEY', key: processGeminiKey });
    }
    // You can add other process.env checks here if needed, e.g., GOOGLE_API_KEY
  }

  // Try to get from import.meta.env (Vite specific - for client-side)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const importMetaViteKeyVal = import.meta.env.VITE_GEMINI_API_KEY;
    if (importMetaViteKeyVal) {
      possibleKeys.push({ source: 'import.meta.env.VITE_GEMINI_API_KEY', key: importMetaViteKeyVal, mode: import.meta.env.MODE });
    }
    const importMetaGeminiKeyVal = import.meta.env.GEMINI_API_KEY;
    if (importMetaGeminiKeyVal) {
      possibleKeys.push({ source: 'import.meta.env.GEMINI_API_KEY', key: importMetaGeminiKeyVal, mode: import.meta.env.MODE });
    }
  }

  // Try to get from localStorage (user-set in browser)
  if (typeof window !== 'undefined') {
    const localStorageKey = window.localStorage.getItem('gemini_api_key');
    if (localStorageKey) {
      possibleKeys.push({ source: 'localStorage.gemini_api_key', key: localStorageKey });
    }
  }

  console.log("Debug - API Key Search: Potential keys collected (first 5 chars for brevity if key exists):", 
    possibleKeys.map(pk => ({ ...pk, key: pk.key ? pk.key.substring(0, 5) + '...' : 'N/A' }))
  );

  // Prioritized retrieval
  // 1. Vite specific from import.meta.env
  let foundKey = possibleKeys.find(pk => pk.source === 'import.meta.env.VITE_GEMINI_API_KEY');
  if (foundKey && foundKey.key) {
    console.log("Using key from import.meta.env.VITE_GEMINI_API_KEY");
    return foundKey.key;
  }

  // 2. Non-prefixed from import.meta.env (for Vercel GEMINI_API_KEY)
  foundKey = possibleKeys.find(pk => pk.source === 'import.meta.env.GEMINI_API_KEY');
  if (foundKey && foundKey.key) {
    console.log("Using key from import.meta.env.GEMINI_API_KEY");
    return foundKey.key;
  }
  
  // 3. Vite specific from process.env (less common for client, but for completeness)
  foundKey = possibleKeys.find(pk => pk.source === 'process.env.VITE_GEMINI_API_KEY');
  if (foundKey && foundKey.key) {
    console.log("Using key from process.env.VITE_GEMINI_API_KEY");
    return foundKey.key;
  }

  // 4. Non-prefixed from process.env
  foundKey = possibleKeys.find(pk => pk.source === 'process.env.GEMINI_API_KEY');
  if (foundKey && foundKey.key) {
    console.log("Using key from process.env.GEMINI_API_KEY");
    return foundKey.key;
  }

  // 5. LocalStorage (if user provided one)
  foundKey = possibleKeys.find(pk => pk.source === 'localStorage.gemini_api_key');
  if (foundKey && foundKey.key) {
    console.log("Using key from localStorage.gemini_api_key");
    return foundKey.key;
  }
  
  console.warn("Gemini API Key not found in any specified environment variables or localStorage.");
  return null;
}

// REMOVED: const GEMINI_API_KEY = getApiKey(); // Key will be fetched by fetchGeminiFlashLite

// URL completa para o endpoint generateContent
const GEMINI_API_URL = `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent`;

// Respostas para quando o limite de API for atingido
const LIMIT_REACHED_RESPONSES = [
  "Já alcançamos nosso limite diário de chamadas à API. Por favor, tente novamente amanhã.",
  "Ops, parece que estamos com muitas consultas hoje! Tente novamente mais tarde.",
  "Nosso assistente está em pausa para descanso. Volte em algumas horas!"
];

/**
 * Interface para resposta da API Gemini
 */
interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{ text: string }>
    },
    finishReason?: string,
    tokenCount?: {
      totalTokens?: number
      promptTokens?: number
      responseTokens?: number
    }
  }>;
  promptFeedback?: {
    blockReason?: string
    safetyRatings?: Array<{
      category: string
      probability: string
    }>
  };
  usage?: {
    promptTokenCount?: number
    candidatesTokenCount?: number
    totalTokenCount?: number
  };
  error?: {
    code: number
    message: string
    status: string
    details?: Array<any>
  };
}

/**
 * Fetches a response from Gemini 2.0 Flash API
 * @param prompt - The prompt to send to Gemini
 * @param options - Optional configuration including system instructions
 * @returns A promise that resolves to the Gemini response text
 */
export async function fetchGeminiFlashLite(
  prompt: string,
  options?: { systemInstruction?: string }
): Promise<string> {
  const apiKey = getApiKey(); // Fetch API key when the function is called

  if (!apiKey) {
    console.error("API Key for Gemini is not configured. Returning hardcoded response.");
    
    // Converter prompt para minúsculas e remover acentos para comparação
    const normalizedPrompt = prompt.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    // Respostas pré-definidas para perguntas comuns
    if (normalizedPrompt.includes('quem e voce') || normalizedPrompt.includes('quem é você') || 
        normalizedPrompt.includes('seu nome') || normalizedPrompt.includes('se apresente')) {
      return "Olá! Sou o Consultor IA, seu assistente financeiro pessoal! Estou aqui para ajudar com dicas de economia, organização financeira e muito mais. Como posso ajudar hoje?";
    }
    
    if (normalizedPrompt.includes('economizar') || normalizedPrompt.includes('poupar') || normalizedPrompt.includes('guardar dinheiro')) {
      return "Para economizar mais dinheiro: 1) Estabeleça um orçamento claro, 2) Elimine despesas desnecessárias, 3) Automatize sua poupança, e 4) Use a regra 50/30/20 (50% para necessidades, 30% para desejos, 20% para poupança).";
    }
    
    if (normalizedPrompt.includes('investir') || normalizedPrompt.includes('investimento')) {
      return "Para começar a investir: 1) Tenha uma reserva de emergência em investimentos de baixo risco, 2) Defina seus objetivos (curto, médio e longo prazo), 3) Diversifique seus investimentos conforme seu perfil de risco. O básico é começar com renda fixa!";
    }
    
    if (normalizedPrompt.includes('divida') || normalizedPrompt.includes('dívida')) {
      return "Para sair das dívidas: 1) Liste todas suas dívidas com valores e juros, 2) Priorize quitar as com juros mais altos, 3) Negocie taxas menores, 4) Considere consolidar dívidas caras, e 5) Corte gastos temporários para acelerar o pagamento.";
    }
    
    // Mensagem genérica se não corresponder a nenhuma pergunta conhecida
    return "O serviço de IA está temporariamente limitado. Por favor, configure a API key nas variáveis de ambiente. Enquanto isso, posso responder perguntas simples sobre economia, investimentos ou dívidas.";
  }
  
  // Verificar se o uso da API está dentro do limite
  if (typeof checkApiUsageLimit === 'function') {
    const withinLimit = await checkApiUsageLimit(API_NAME);
    if (!withinLimit) {
      // Retornar uma resposta aleatória informando que o limite foi atingido
      const randomResponse = LIMIT_REACHED_RESPONSES[Math.floor(Math.random() * LIMIT_REACHED_RESPONSES.length)];
      return randomResponse;
    }
  }
  
  // Preparar o prompt com contexto financeiro
  const systemInstruction = options?.systemInstruction || 
    "Você é um assistente financeiro amigável e motivador, focado em ajudar pessoas a organizarem suas finanças pessoais. ";
  
  const enhancedPrompt = `${systemInstruction} Responda de forma concisa, prática e motivadora. Limite sua resposta a 3-4 frases. Pergunta: ${prompt}`;
  
  // Estimar tokens do prompt para registro prévio
  const estimatedPromptTokens = typeof estimateTokenCount === 'function' ? estimateTokenCount(enhancedPrompt) : 0;
  
  // Construir o corpo da requisição otimizado para Gemini 2.0 Flash Lite
  const requestBody = {
    contents: [{
      parts: [{
        text: enhancedPrompt
      }]
    }],
    generationConfig: {
      temperature: 0.4,      // Temperatura mais baixa para respostas mais precisas
      topK: 32,             // Valor otimizado para Flash Lite
      topP: 0.9,            // Valor otimizado para Flash Lite
      maxOutputTokens: 250,  // Aumentamos o limite para permitir respostas mais completas
      candidateCount: 1      // Flash Lite funciona melhor com 1 candidato
    },
    // Configuração de segurança específica para Flash Lite
    safetySettings: [
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_MEDIUM_AND_ABOVE"
      }
    ]
  };
  
  // Log detalhado antes da chamada API para depuração
  console.log('Calling Gemini API with:', {
    url: `${GEMINI_API_URL}?key=XXXXX`, // Não exibimos a chave real no log
    requestBodyPreview: JSON.stringify(requestBody).substring(0, 200) + '...'
  });
  
  // Fazer a chamada direta para a API do Gemini 2.0 Flash
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
  const data = await response.json() as GeminiResponse;
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
      if (typeof incrementApiUsage === 'function') {
        // Usar contagem exata da API ou estimar
        let tokensUsed = 0;
      
        if (data.usage?.totalTokenCount) {
          tokensUsed = data.usage.totalTokenCount;
        } else if (data.candidates[0].tokenCount?.totalTokens) {
          tokensUsed = data.candidates[0].tokenCount.totalTokens;
        } else {
          // Estimar baseado no prompt e resposta
          const estimatedResponseTokens = typeof estimateTokenCount === 'function' ? 
            estimateTokenCount(responseText) : 0;
          tokensUsed = estimatedPromptTokens + estimatedResponseTokens;
        }
        
        incrementApiUsage(API_NAME, tokensUsed);
      }
    }
  }
  
  // Verificar se temos uma resposta válida
  if (!responseText) {
    console.error('No text in Gemini response:', data);
    throw new Error('No valid response content received from Gemini API');
  }
  
  return responseText;
}
