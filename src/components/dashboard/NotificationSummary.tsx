import React, { useEffect, useState } from 'react';
import { Bell, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

interface NotificationSummaryProps {
  maxItems?: number;
}

const NotificationSummary: React.FC<NotificationSummaryProps> = ({ maxItems = 3 }) => {
  const { notifications, unreadCount, refreshNotifications } = useNotifications();
  const navigate = useNavigate();
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  useEffect(() => {
    // Filtrar notificações relacionadas a contas e ordenar por data (mais recentes primeiro)
    const billNotifications = notifications
      .filter(n => ['overdue', 'dueDay', 'oneDayBefore', 'fiveDaysBefore', 'paid'].includes(n.type))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, maxItems);
    
    setRecentNotifications(billNotifications);
  }, [notifications, maxItems]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="text-galileo-negative" size={18} />;
      case 'dueDay':
        return <Clock className="text-galileo-warning" size={18} />;
      case 'oneDayBefore':
        return <Clock className="text-galileo-warning" size={18} />;
      case 'fiveDaysBefore':
        return <Bell className="text-galileo-accent" size={18} />;
      case 'paid':
        return <CheckCircle className="text-galileo-positive" size={18} />;
      default:
        return <Bell className="text-galileo-accent" size={18} />;
    }
  };

  const handleViewAllClick = () => {
    navigate('/notifications');
  };

  if (recentNotifications.length === 0) {
    return (
      <div className="bg-white dark:bg-galileo-card rounded-xl p-4 shadow-sm border border-galileo-border">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold text-galileo-text">Notificações</h3>
          {unreadCount > 0 && (
            <span className="text-xs font-medium bg-galileo-accent text-white rounded-full px-2 py-1">
              {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-galileo-secondaryText">
          <Bell size={24} className="mb-2" />
          <p className="text-sm">Nenhuma notificação recente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-galileo-card rounded-xl p-4 shadow-sm border border-galileo-border">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold text-galileo-text">Notificações</h3>
        {unreadCount > 0 && (
          <span className="text-xs font-medium bg-galileo-accent text-white rounded-full px-2 py-1">
            {unreadCount} nova{unreadCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      
      <div className="space-y-3">
        {recentNotifications.map((notification) => (
          <div 
            key={notification.id} 
            className={`flex items-start gap-3 p-2 rounded-lg ${!notification.read ? 'bg-galileo-accent bg-opacity-5' : ''}`}
          >
            <div className="mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            <div>
              <p className="text-sm text-galileo-text">{notification.message}</p>
              <p className="text-xs text-galileo-secondaryText">
                {new Date(notification.date).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {notifications.length > maxItems && (
        <button 
          onClick={handleViewAllClick}
          className="w-full mt-3 text-sm text-galileo-accent hover:text-galileo-accent-dark font-medium py-2 rounded-lg"
        >
          Ver todas as notificações
        </button>
      )}
    </div>
  );
};

export default NotificationSummary;
