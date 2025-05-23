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

  useEffect(() => {
    loadNotifications();
    
    // Verificar notificações a cada 5 minutos
    const interval = setInterval(() => {
      loadNotifications();
    }, 5 * 60 * 1000);

    // Adicionar listener para atualizar notificações quando houver mudanças
    const handleNotificationsUpdated = () => {
      loadNotifications();
    };

    window.addEventListener('notificationsUpdated', handleNotificationsUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', handleNotificationsUpdated);
    };
  }, []);

  const markAsRead = (id: string) => {
    markNotificationAsRead(id);
    loadNotifications();
  };

  const markAllAsRead = () => {
    markAllNotificationsAsRead();
    loadNotifications();
  };

  const removeNotification = (id: string) => {
    deleteNotification(id);
    loadNotifications();
  };

  const clearAll = () => {
    clearAllNotifications();
    loadNotifications();
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
        refreshNotifications: loadNotifications,
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
