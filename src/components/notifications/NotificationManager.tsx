import React, { useEffect, useState } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import ToastNotification from './ToastNotification';
import { NotificationType } from '@/types';

interface NotificationToastState {
  id: string;
  message: string;
  type: string;
}

const NotificationManager: React.FC = () => {
  const { notifications, markAsRead } = useNotifications();
  const [activeNotification, setActiveNotification] = useState<NotificationToastState | null>(null);

  useEffect(() => {
    // Verificar se há notificações não lidas
    const unreadNotifications = notifications.filter(notification => !notification.read);
    
    if (unreadNotifications.length > 0 && !activeNotification) {
      const latestNotification = unreadNotifications[0];
      setActiveNotification({
        id: latestNotification.id,
        message: latestNotification.message,
        type: latestNotification.type
      });
    }
  }, [notifications, activeNotification]);

  const handleCloseNotification = () => {
    if (activeNotification) {
      markAsRead(activeNotification.id);
      setActiveNotification(null);
    }
  };

  const mapNotificationTypeToToastType = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'error';
      case 'dueDay':
        return 'warning';
      case 'oneDayBefore':
        return 'warning';
      case 'fiveDaysBefore':
        return 'info';
      case 'paid':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <>
      {activeNotification && (
        <ToastNotification
          message={activeNotification.message}
          type={mapNotificationTypeToToastType(activeNotification.type) as 'success' | 'error' | 'info' | 'warning' | 'default'}
          duration={5000}
          onClose={handleCloseNotification}
        />
      )}
    </>
  );
};

export default NotificationManager;
