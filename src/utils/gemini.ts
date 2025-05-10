/**
 * Utility functions for interacting with Gemini API
 */

import { checkApiUsageLimit, incrementApiUsage, estimateTokenCount } from './api-usage';

// API key para o Gemini - em produção, isso deve vir de variáveis de ambiente
// Verifica e faz console.log para debug
const processEnvKey = typeof process !== 'undefined' && process.env ? process.env.GEMINI_API_KEY : null;
const viteEnvKey = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : null;

// Log dos valores para debug (apenas em desenvolvimento)
if (import.meta.env.DEV) {
  console.log('Debug - Variáveis Gemini API:', { 
    processEnvKey: processEnvKey ? 'Presente' : 'Ausente', 
    viteEnvKey: viteEnvKey ? 'Presente' : 'Ausente',
    ambiente: import.meta.env.MODE
  });
}

const GEMINI_API_KEY = processEnvKey || viteEnvKey || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Nome da API para controle de uso
const API_NAME = 'gemini-flash-lite';

// Respostas alternativas para quando o limite de uso for atingido
const LIMIT_REACHED_RESPONSES = [
  "Desculpe, atingimos o limite de consultas por hoje. Tente novamente amanhã ou use as funcionalidades offline do app!",
  "Parece que estamos com muitas consultas hoje! Para continuar ajudando todos os usuários, precisei pausar algumas respostas. Que tal tentar novamente amanhã?",
  "Atingimos o limite de consultas para hoje. Enquanto isso, você pode continuar registrando suas transações e usando as outras funcionalidades do app!"
];

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason?: string;
    tokenCount?: {
      totalTokens: number;
      promptTokens: number;
      responseTokens: number;
    };
  }>;
  promptFeedback?: {
    blockReason?: string;
  };
  usage?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

/**
 * Fetches a response from Gemini Flash Lite API
 * @param prompt - The prompt to send to Gemini
 * @param options - Optional configuration including system instructions
 * @returns A promise that resolves to the Gemini response text
 */
export async function fetchGeminiFlashLite(
  prompt: string,
  options?: { systemInstruction?: string }
): Promise<string> {
  try {
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
    
    // Fazer a chamada direta para a API do Gemini
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: enhancedPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 150,
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json() as GeminiResponse;
    
    // Verificar se há conteúdo bloqueado ou erro
    if (data.promptFeedback?.blockReason) {
      console.warn('Prompt blocked:', data.promptFeedback.blockReason);
      return "Desculpe, não posso responder a esse tipo de pergunta. Posso ajudar com questões financeiras!";
    }
    
    // Extrair o texto da resposta
    let responseText = "";
    if (data.candidates && data.candidates.length > 0) {
      const textParts = data.candidates[0].content.parts;
      if (textParts && textParts.length > 0) {
        responseText = textParts[0].text.trim();
        
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
    
    if (!responseText) {
      throw new Error('No valid response from Gemini API');
    }
    
    return responseText;
  } catch (error) {
    console.error("Error fetching from Gemini:", error);
    return "Desculpe, não foi possível obter uma resposta neste momento. Tente novamente mais tarde.";
  }
}
