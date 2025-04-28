
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/header/PageHeader';
import NavBar from '@/components/navigation/NavBar';
import { Notification } from '@/types';
import { getNotifications, isLoggedIn, markNotificationAsRead, generateBillNotifications } from '@/utils/localStorage';
import { Bell, Check } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    // Gerar notificações baseadas nas contas a vencer
    generateBillNotifications();
    
    // Carregar as notificações do usuário
    loadNotifications();
  }, [navigate]);
  
  const loadNotifications = () => {
    const userNotifications = getNotifications();
    // Ordenar por data (mais recentes primeiro) e não lidas primeiro
    const sortedNotifications = userNotifications.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    setNotifications(sortedNotifications);
  };
  
  const handleMarkAsRead = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    loadNotifications();
  };
  
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
      
      <div className="mt-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`flex items-center gap-4 bg-galileo-background px-4 py-3 border-b border-galileo-border ${!notification.read ? 'bg-opacity-10 bg-galileo-accent' : ''}`}
            >
              <div className={`text-galileo-text flex items-center justify-center rounded-lg ${notification.type === 'overdue' ? 'bg-galileo-negative' : 'bg-galileo-accent'} shrink-0 size-10`}>
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
              {!notification.read && (
                <button
                  onClick={() => handleMarkAsRead(notification.id)}
                  className="text-galileo-secondaryText hover:text-galileo-text p-2"
                >
                  <Check size={20} />
                </button>
              )}
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
