// src/utils/dataValidation.ts
import { ChatMessage } from '@/types';

/**
 * Sanitiza strings removendo caracteres maliciosos
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data URLs
    .trim();
};

/**
 * Valida se o texto é seguro para exibição
 */
export const isValidMessageText = (text: string): boolean => {
  if (typeof text !== 'string') {
    return false;
  }
  
  // Verifica tamanho máximo
  if (text.length > 10000) {
    return false;
  }
  
  // Verifica se não contém scripts maliciosos
  const dangerousPatterns = [
    /<script/i,
    /<iframe/i,
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /onload=/i,
    /onerror=/i,
    /onclick=/i
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(text));
};

/**
 * Valida estrutura de uma mensagem do chat
 */
export const validateChatMessage = (message: any): ChatMessage | null => {
  try {
    // Verificar se é um objeto
    if (!message || typeof message !== 'object') {
      return null;
    }
    
    // Verificar campos obrigatórios
    if (!message.id || !message.text || !message.sender || !message.timestamp) {
      return null;
    }
    
    // Validar tipos
    if (typeof message.id !== 'string' || 
        typeof message.text !== 'string' || 
        typeof message.sender !== 'string') {
      return null;
    }
    
    // Validar sender
    const validSenders = ['user', 'system', 'assistant'];
    if (!validSenders.includes(message.sender)) {
      return null;
    }
    
    // Validar timestamp
    const timestamp = new Date(message.timestamp);
    if (isNaN(timestamp.getTime())) {
      return null;
    }
    
    // Sanitizar texto
    const sanitizedText = sanitizeString(message.text);
    if (!isValidMessageText(sanitizedText)) {
      return null;
    }
    
    return {
      id: message.id,
      text: sanitizedText,
      sender: message.sender,
      timestamp: timestamp
    };
  } catch (error) {
    console.warn('Erro ao validar mensagem:', error);
    return null;
  }
};

/**
 * Valida array de mensagens do chat
 */
export const validateChatMessages = (messages: any[]): ChatMessage[] => {
  if (!Array.isArray(messages)) {
    return [];
  }
  
  return messages
    .map(validateChatMessage)
    .filter((msg): msg is ChatMessage => msg !== null);
};

/**
 * Valida entrada de texto do usuário
 */
export const validateUserInput = (input: string): string | null => {
  if (typeof input !== 'string') {
    return null;
  }
  
  // Remover espaços em branco
  const trimmed = input.trim();
  
  // Verificar se não está vazio
  if (!trimmed) {
    return null;
  }
  
  // Verificar tamanho máximo
  if (trimmed.length > 5000) {
    return null;
  }
  
  // Sanitizar
  const sanitized = sanitizeString(trimmed);
  
  // Verificar se ainda é válido após sanitização
  if (!isValidMessageText(sanitized)) {
    return null;
  }
  
  return sanitized;
};

/**
 * Valida dados de transação
 */
export const validateTransactionData = (data: any): boolean => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Verificar campos obrigatórios
  if (!data.amount || !data.description) {
    return false;
  }
  
  // Validar amount
  const amount = parseFloat(data.amount);
  if (isNaN(amount) || amount <= 0 || amount > 1000000) {
    return false;
  }
  
  // Validar description
  if (typeof data.description !== 'string' || 
      !isValidMessageText(data.description)) {
    return false;
  }
  
  // Validar type se presente
  if (data.type && !['income', 'expense'].includes(data.type)) {
    return false;
  }
  
  return true;
};

/**
 * Escapa caracteres especiais para prevenir XSS
 */
export const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Remove caracteres de controle perigosos
 */
export const removeControlCharacters = (text: string): string => {
  return text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
};
