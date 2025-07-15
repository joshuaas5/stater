// src/utils/chatPersistence.ts
import { ChatMessage } from '@/types';

const CHAT_STORAGE_KEY = 'stater_chat_messages';
const CHAT_STORAGE_VERSION = '1.0';

interface ChatStorage {
  version: string;
  messages: ChatMessage[];
  lastUpdated: string;
}

/**
 * Salva as mensagens do chat no localStorage
 */
export const saveChatMessages = (messages: ChatMessage[]): void => {
  try {
    const chatData: ChatStorage = {
      version: CHAT_STORAGE_VERSION,
      messages,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatData));
  } catch (error) {
    console.warn('Erro ao salvar mensagens do chat:', error);
  }
};

/**
 * Carrega as mensagens do chat do localStorage
 */
export const loadChatMessages = (): ChatMessage[] => {
  try {
    const savedData = localStorage.getItem(CHAT_STORAGE_KEY);
    
    if (!savedData) {
      return [];
    }

    const chatData: ChatStorage = JSON.parse(savedData);
    
    // Verificar versão para compatibilidade
    if (chatData.version !== CHAT_STORAGE_VERSION) {
      console.warn('Versão do chat incompatível, limpando dados');
      clearChatMessages();
      return [];
    }

    // Validar estrutura das mensagens
    if (!Array.isArray(chatData.messages)) {
      console.warn('Dados do chat corrompidos, limpando');
      clearChatMessages();
      return [];
    }

    return chatData.messages;
  } catch (error) {
    console.warn('Erro ao carregar mensagens do chat:', error);
    clearChatMessages();
    return [];
  }
};

/**
 * Limpa todas as mensagens do chat
 */
export const clearChatMessages = (): void => {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (error) {
    console.warn('Erro ao limpar mensagens do chat:', error);
  }
};

/**
 * Verifica se há mensagens salvas
 */
export const hasSavedMessages = (): boolean => {
  try {
    const savedData = localStorage.getItem(CHAT_STORAGE_KEY);
    return savedData !== null;
  } catch (error) {
    return false;
  }
};
