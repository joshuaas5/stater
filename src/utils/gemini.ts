/**
 * Utility functions for interacting with Gemini API
 */

import { checkApiUsageLimit, incrementApiUsage, estimateTokenCount } from './api-usage';

// API key para o Gemini - em produção, isso deve vir de variáveis de ambiente
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
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
 * @returns A promise that resolves to the Gemini response text
 */
export async function fetchGeminiFlashLite(prompt: string): Promise<string> {
  try {
    // Se não tiver API key, retorna mensagem informativa
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not found. Using fallback response.');
      return "Para usar o Gemini, configure uma API key válida nas variáveis de ambiente.";
    }
    
    // Verificar se o uso da API está dentro do limite
    const withinLimit = await checkApiUsageLimit(API_NAME);
    if (!withinLimit) {
      // Retornar uma resposta aleatória informando que o limite foi atingido
      const randomResponse = LIMIT_REACHED_RESPONSES[Math.floor(Math.random() * LIMIT_REACHED_RESPONSES.length)];
      return randomResponse;
    }
    
    // Preparar o prompt com contexto financeiro
    const enhancedPrompt = `Você é um assistente financeiro amigável e motivador, focado em ajudar pessoas a organizarem suas finanças pessoais. Responda de forma concisa, prática e motivadora. Limite sua resposta a 3-4 frases. Pergunta: ${prompt}`;
    
    // Estimar tokens do prompt para registro prévio
    const estimatedPromptTokens = estimateTokenCount(enhancedPrompt);
    
    // Fazer a chamada para a API do Gemini
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
    if (data.candidates && data.candidates.length > 0) {
      const textParts = data.candidates[0].content.parts;
      if (textParts && textParts.length > 0) {
        const responseText = textParts[0].text.trim();
        
        // Calcular tokens usados (usando dados da API quando disponível, ou estimativa)
        let tokensUsed = 0;
        
        if (data.usage?.totalTokenCount) {
          // Usar contagem exata da API
          tokensUsed = data.usage.totalTokenCount;
        } else if (data.candidates[0].tokenCount?.totalTokens) {
          // Alternativa se a contagem estiver em outro lugar da resposta
          tokensUsed = data.candidates[0].tokenCount.totalTokens;
        } else {
          // Estimar baseado no prompt e resposta
          const estimatedResponseTokens = estimateTokenCount(responseText);
          tokensUsed = estimatedPromptTokens + estimatedResponseTokens;
        }
        
        // Registrar uso da API
        incrementApiUsage(API_NAME, tokensUsed);
        
        return responseText;
      }
    }
    
    throw new Error('No valid response from Gemini API');
  } catch (error) {
    console.error("Error fetching from Gemini:", error);
    return "Desculpe, não foi possível obter uma resposta neste momento. Tente novamente mais tarde.";
  }
}
