
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { isLoggedIn } from '@/utils/localStorage';
import { Bell, Check, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll, refreshNotifications, unreadCount, loading } = useNotifications();
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    // Carregar notificações quando a página for montada
    refreshNotifications();
  }, [navigate, refreshNotifications]);
  
  const formatNotificationDate = (date: Date) => {
    const notificationDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    notificationDate.setHours(0, 0, 0, 0);
    
    if (notificationDate.getTime() === today.getTime()) {
      return `Hoje, ${notificationDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (notificationDate.getTime() === yesterday.getTime()) {
      return `Ontem, ${notificationDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return notificationDate.toLocaleDateString('pt-BR');
    }
  };

  return (
    <div className="bg-galileo-background min-h-screen pb-20">
      <PageHeader title="Notificações" showSearch={false} />
      
      {unreadCount > 0 && (
        <div className="flex justify-end px-4 py-2">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-galileo-accent hover:text-galileo-accent-dark text-sm font-medium"
          >
            <CheckCheck size={16} />
            Marcar todas como lidas
          </button>
        </div>
      )}
      
      <div className="mt-2">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-galileo-accent"></div>
          </div>
        ) : notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-center gap-4 bg-galileo-background px-4 py-3 border-b border-galileo-border ${!notification.read ? 'bg-opacity-10 bg-galileo-accent' : ''}`}
            >
              <div className={`text-white flex items-center justify-center rounded-lg 
                ${notification.type === 'overdue' ? 'bg-galileo-negative' : 
                  notification.type === 'dueDay' ? 'bg-galileo-warning' : 
                  notification.type === 'oneDayBefore' ? 'bg-galileo-warning' : 
                  notification.type === 'paid' ? 'bg-galileo-positive' : 
                  'bg-galileo-accent'} 
                shrink-0 size-10`}
              >
                <Bell size={20} />
              </div>
              <div className="flex flex-col justify-center flex-1">
                <p className="text-galileo-text text-base leading-normal">
                  {notification.message}
                </p>
                <p className="text-galileo-secondaryText text-sm">
                  {formatNotificationDate(notification.date)}
                </p>
              </div>
              <div className="flex gap-2">
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="text-galileo-secondaryText hover:text-galileo-accent p-2"
                    title="Marcar como lida"
                  >
                    <Check size={20} />
                  </button>
                )}
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="text-galileo-secondaryText hover:text-galileo-negative p-2"
                  title="Remover notificação"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-galileo-secondaryText">
            <Bell size={40} className="mb-2" />
            <p>Nenhuma notificação no momento</p>
          </div>
        )}
      </div>
      
      <NavBar />
    </div>
  );
};

export default NotificationsPage;
