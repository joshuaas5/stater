import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  // Versão modificada do loadNotifications que verifica o flag
  const safeLoadNotifications = async () => {
    if (isProcessingNotifications) {
      console.log('Já está processando notificações, ignorando chamada');
      return;
    }
    
    try {
      setIsProcessingNotifications(true);
      setLoading(true);
      
      // Buscar notificações existentes sem gerar novas
      const allNotifications = getNotifications();
      setNotifications(allNotifications);
      setUnreadCount(getUnreadNotificationsCount());
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
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
