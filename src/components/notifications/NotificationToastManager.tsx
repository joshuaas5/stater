import React, { useState, useEffect } from 'react';
import NotificationToast from './NotificationToast';
import { useNotifications } from '@/contexts/NotificationContext';

interface ActiveToast {
  id: string;
  message: string;
  type: string;
  timestamp: number;
}

const NotificationToastManager: React.FC = () => {
  const [activeToasts, setActiveToasts] = useState<ActiveToast[]>([]);
  const { markAsRead } = useNotifications();

  // Limitar o nu00famero de toasts visu00edveis ao mesmo tempo
  const MAX_VISIBLE_TOASTS = 3;

  useEffect(() => {
    // Funu00e7u00e3o para lidar com notificau00e7u00f5es de contas a vencer
    const handleBillNotification = (event: CustomEvent) => {
      const notification = event.detail;
      
      // Verificar se ju00e1 existe uma notificau00e7u00e3o semelhante para evitar duplicatas
      const isDuplicate = activeToasts.some(toast => 
        toast.message === notification.message && 
        Date.now() - toast.timestamp < 10000 // 10 segundos
      );
      
      if (!isDuplicate) {
        // Adicionar nova notificau00e7u00e3o ao topo da lista
        setActiveToasts(prev => [
          {
            id: notification.id,
            message: notification.message,
            type: notification.type,
            timestamp: Date.now()
          },
          ...prev
        ].slice(0, MAX_VISIBLE_TOASTS)); // Limitar o nu00famero de toasts
      }
    };

    // Adicionar listeners para eventos de notificau00e7u00e3o
    window.addEventListener('saveNotification', handleBillNotification as EventListener);
    
    return () => {
      window.removeEventListener('saveNotification', handleBillNotification as EventListener);
    };
  }, [activeToasts]);

  const handleCloseToast = (id: string) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== id));
    // Marcar a notificau00e7u00e3o como lida no contexto
    markAsRead(id);
  };

  return (
    <div className="notification-toast-container">
      {activeToasts.map((toast, index) => (
        <NotificationToast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type as any}
          onClose={handleCloseToast}
          autoClose={true}
          duration={8000 + (index * 1000)} // Escalonar o tempo para que nu00e3o fechem todas ao mesmo tempo
        />
      ))}
    </div>
  );
};

export default NotificationToastManager;
