import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { Notification } from '@/types';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, clearAllNotifications, hasUnreadNotifications, getUnreadNotificationsCount, generateBillNotifications } from '@/utils/localStorage';
import { NotificationService } from '@/services/NotificationService';
import { getBills } from '@/utils/localStorage';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Gerar notificações baseadas nas contas a vencer
      await generateBillNotifications();
      
      const allNotifications = getNotifications();
      setNotifications(allNotifications);
      setUnreadCount(getUnreadNotificationsCount());
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Flag para evitar chamadas recursivas
  const [isProcessingNotifications, setIsProcessingNotifications] = useState(false);
  
  // Contadores para limitar tentativas e registrar falhas
  const failedAttemptsRef = useRef(0);
  const lastErrorTimeRef = useRef(0);
  const backoffTimeRef = useRef(1000); // Inicia com 1 segundo e aumenta exponencialmente
  const MAX_FAILED_ATTEMPTS = 3; // Máximo de falhas consecutivas antes de parar por um período maior
  const ERROR_COOLDOWN = 60 * 1000; // 1 minuto de espera após múltiplas falhas

  // Versão melhorada do loadNotifications com controle de falhas
  const safeLoadNotifications = async () => {
    // Verificar se já está processando notificações
    if (isProcessingNotifications) {
      console.log('Já está processando notificações, ignorando chamada');
      return;
    }
    
    // Verificar se está no período de espera após múltiplas falhas
    const now = Date.now();
    if (failedAttemptsRef.current >= MAX_FAILED_ATTEMPTS) {
      const timeElapsed = now - lastErrorTimeRef.current;
      if (timeElapsed < ERROR_COOLDOWN) {
        console.log(`Muitas falhas consecutivas. Aguardando ${Math.ceil((ERROR_COOLDOWN - timeElapsed)/1000)}s antes de tentar novamente.`);
        // Usar apenas notificações locais temporariamente
        const localNotifications = getNotifications(true); // Parâmetro true para forcçar apenas local
        setNotifications(localNotifications);
        setUnreadCount(getUnreadNotificationsCount());
        return;
      } else {
        // Resetar contadores após período de espera
        failedAttemptsRef.current = 0;
        backoffTimeRef.current = 1000;
      }
    }
    
    try {
      setIsProcessingNotifications(true);
      setLoading(true);
      
      // Buscar notificações existentes sem gerar novas
      const allNotifications = getNotifications();
      setNotifications(allNotifications);
      setUnreadCount(getUnreadNotificationsCount());
      
      // Sucesso na operação, resetar contadores
      failedAttemptsRef.current = 0;
      backoffTimeRef.current = 1000;
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      
      // Registrar a falha e implementar backoff exponencial
      failedAttemptsRef.current++;
      lastErrorTimeRef.current = Date.now();
      
      // Usar notificações locais em caso de falha
      const localNotifications = getNotifications(true);
      setNotifications(localNotifications);
      setUnreadCount(getUnreadNotificationsCount());
      
      // Aumentar o tempo de backoff (limitar a 30 segundos)
      backoffTimeRef.current = Math.min(backoffTimeRef.current * 2, 30000);
    } finally {
      setLoading(false);
      setIsProcessingNotifications(false);
    }
  };

  useEffect(() => {
    // Carregar notificações iniciais
    safeLoadNotifications();
    
    // Verificar notificações a cada 5 minutos
    const interval = setInterval(() => {
      safeLoadNotifications();
    }, 5 * 60 * 1000);

    // Adicionar listener para atualizar notificações quando houver mudanças
    const handleNotificationsUpdated = () => {
      safeLoadNotifications();
    };

    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
    };
  }, []);

  const markAsRead = async (id: string) => {
    markNotificationAsRead(id);
    await safeLoadNotifications();
  };

  const markAllAsRead = async () => {
    markAllNotificationsAsRead();
    await safeLoadNotifications();
  };

  const removeNotification = async (id: string) => {
    deleteNotification(id);
    await safeLoadNotifications();
  };

  const clearAll = async () => {
    clearAllNotifications();
    await safeLoadNotifications();
  };

  // Verificar contas a vencer e agendar notificações locais
  useEffect(() => {
    const checkBills = async () => {
      const bills = getBills();
      await NotificationService.scheduleBillReminders(bills);
    };

    checkBills();
    const interval = setInterval(checkBills, 60 * 60 * 1000); // A cada hora

    return () => clearInterval(interval);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        refreshNotifications: safeLoadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
