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

  // Limitar o número de toasts visíveis ao mesmo tempo
  const MAX_VISIBLE_TOASTS = 3;

  useEffect(() => {
    // Função para lidar com notificações de contas a vencer
    const handleBillNotification = (event: CustomEvent) => {
      const notification = event.detail;
      
      // Verificar se já existe uma notificação semelhante para evitar duplicatas
      const isDuplicate = activeToasts.some(toast => 
        toast.message === notification.message && 
        Date.now() - toast.timestamp < 10000 // 10 segundos
      );
      
      if (!isDuplicate) {
        // Adicionar nova notificação ao topo da lista
        setActiveToasts(prev => [
          {
            id: notification.id,
            message: notification.message,
            type: notification.type,
            timestamp: Date.now()
          },
          ...prev
        ].slice(0, MAX_VISIBLE_TOASTS)); // Limitar o número de toasts
      }
    };

    // Adicionar listeners para eventos de notificação
    window.addEventListener('saveNotification', handleBillNotification as EventListener);
    
    return () => {
      window.removeEventListener('saveNotification', handleBillNotification as EventListener);
    };
  }, [activeToasts]);

  const handleCloseToast = (id: string) => {
    setActiveToasts(prev => prev.filter(toast => toast.id !== id));
    // Marcar a notificação como lida no contexto
    markAsRead(id);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-3 pointer-events-none">
      {activeToasts.map((toast, index) => (
        <NotificationToast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type as any}
          onClose={handleCloseToast}
          autoClose={true}
          duration={5000}
          index={index}
        />
      ))}
    </div>
  );
};

export default NotificationToastManager;
