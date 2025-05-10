/**
 * Utility functions for interacting with Gemini API 2.0
 */

import { checkApiUsageLimit, incrementApiUsage, estimateTokenCount } from './api-usage';

/**
 * Configuração da API Gemini
 */
// Nome da API para controle de uso
const API_NAME = 'gemini';

// Usamos exclusivamente o Gemini 2.0 Flash Lite conforme solicitado
const GEMINI_MODEL = 'gemini-2.0-flash-lite';

// URL base da API Gemini
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Função para obter a API key de diferentes fontes de ambiente
 * Esta função é super robusta e tenta várias abordagens diferentes
 */
const getApiKey = () => {
  // Todas as possíveis variáveis de ambiente que podem conter a API key
  const possibleKeys = [];
  
  // 1. Vercel/Next.js - variáveis de ambiente do lado do servidor
  if (typeof process !== 'undefined' && process.env) {
    // Tenta diferentes nomes de variáveis
    possibleKeys.push(process.env.GEMINI_API_KEY); // Padrão Vercel
    possibleKeys.push(process.env.VITE_GEMINI_API_KEY); // Com prefixo Vite
    possibleKeys.push(process.env.GOOGLE_API_KEY); // Alternativa comum
    possibleKeys.push(process.env.GOOGLE_GEMINI_API_KEY); // Alternativa descritiva
  }
  
  // 2. Vite/front-end - variáveis de ambiente do lado do cliente
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // Tenta diferentes nomes de variáveis
    possibleKeys.push(import.meta.env.VITE_GEMINI_API_KEY); // Padrão Vite
    possibleKeys.push(import.meta.env.GEMINI_API_KEY); // Sem prefixo (irregular, mas possível)
    possibleKeys.push(import.meta.env.VITE_GOOGLE_API_KEY); // Alternativa
    possibleKeys.push(import.meta.env.VITE_GOOGLE_GEMINI_API_KEY); // Alternativa descritiva
    // Tenta acessar diretamente como string
    try {
      // @ts-ignore - tentativa não padrão
      const directViteKey = import.meta.env['VITE_GEMINI_API_KEY'];
      if (directViteKey) possibleKeys.push(directViteKey);
    } catch (e) {}
  }
  
  // 3. Hardcoded para testes (remover em produção)
  // ATENÇÃO: Isto é apenas para teste local, nunca faça commit disto com uma chave real
  const hardcodedTestKey = window.localStorage.getItem('gemini_api_key');
  if (hardcodedTestKey) possibleKeys.push(hardcodedTestKey);
  
  // Filtra valores vazios e undefined
  const validKeys = possibleKeys.filter(key => key && typeof key === 'string' && key.length > 10);
  
  // Gera logs detalhados para depuração (sem mostrar a chave completa)
  console.log('Debug - API Key Search:', { 
    encontrouProcessEnv: typeof process !== 'undefined' && !!process.env,
    encontrouImportMeta: typeof import.meta !== 'undefined' && !!import.meta.env,
    totalPossiveisChaves: possibleKeys.length,
    chavesValidas: validKeys.length,
    // Se encontrou alguma chave válida, mostre os primeiros caracteres
    previewPrimeiraChave: validKeys.length > 0 ? `${validKeys[0].substring(0, 5)}...` : 'nenhuma',
    ambiente: typeof import.meta !== 'undefined' ? import.meta.env.MODE : 'server-side',
  });

  // Se o array de validKeys estiver vazio, retorna string vazia
  return validKeys.length > 0 ? validKeys[0] : '';
};

// Obtenção da API key
const GEMINI_API_KEY = getApiKey();

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
  try {
    // Log inicial para depuração
    console.log(`Iniciando chamada ao Gemini para prompt: "${prompt.substring(0, 50)}..."`);
    
    // Se não tiver API key, tenta dar respostas pré-definidas para perguntas comuns
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not found. Using hardcoded responses.');
      
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
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
  } catch (error: any) {
    // Log detalhado do erro
    console.error("Error fetching from Gemini:", error);
    console.error("Error stack:", error.stack);
    
    // Resposta amigável para o usuário
    return "Desculpe, estou com dificuldades para me comunicar com o serviço de IA neste momento. Tente novamente em alguns instantes.";
  }
}
