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
 * Fetches a response from Gemini Flash Lite API via serverless function
 * @param prompt - The prompt to send to Gemini
 * @param options - Optional configuration including system instructions
 * @returns A promise that resolves to the Gemini response text
 */
export async function fetchGeminiFlashLite(
  prompt: string,
  options?: { systemInstruction?: string }
): Promise<string> {
  try {
    // Verificar se o uso da API está dentro do limite (se implementado)
    if (typeof checkApiUsageLimit === 'function') {
      const withinLimit = await checkApiUsageLimit(API_NAME);
      if (!withinLimit) {
        // Retornar uma resposta aleatória informando que o limite foi atingido
        const randomResponse = LIMIT_REACHED_RESPONSES[Math.floor(Math.random() * LIMIT_REACHED_RESPONSES.length)];
        return randomResponse;
      }
    }

    // Chama a serverless function protegida /api/gemini
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, systemInstruction: options?.systemInstruction })
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Erro ao acessar Gemini');
    }
    
    const data = await response.json();
    const resposta = (data.resposta || '').trim();
    
    // Registrar uso da API (se implementado)
    if (typeof incrementApiUsage === 'function') {
      // Estimar tokens baseado no prompt e resposta
      const estimatedPromptTokens = typeof estimateTokenCount === 'function' ? estimateTokenCount(prompt) : 0;
      const estimatedResponseTokens = typeof estimateTokenCount === 'function' ? estimateTokenCount(resposta) : 0;
      const tokensUsed = estimatedPromptTokens + estimatedResponseTokens;
      incrementApiUsage(API_NAME, tokensUsed);
    }
    
    return resposta;
  } catch (error) {
    console.error("Error fetching from Gemini:", error);
    return "Desculpe, não foi possível obter uma resposta neste momento. Tente novamente mais tarde.";
  }
}
