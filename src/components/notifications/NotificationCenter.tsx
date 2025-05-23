import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import './NotificationCenter.css';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isOpen) return null;

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.read);

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

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'overdue':
        return 'bg-galileo-negative';
      case 'dueDay':
        return 'bg-galileo-warning';
      case 'oneDayBefore':
        return 'bg-galileo-warning';
      case 'fiveDaysBefore':
        return 'bg-galileo-accent';
      case 'paid':
        return 'bg-galileo-positive';
      default:
        return 'bg-galileo-accent';
    }
  };

  return (
    <div className="notification-center-overlay">
      <div className="notification-center-container">
        <div className="notification-center-header">
          <h2>Notificações</h2>
          <button onClick={onClose} className="close-button">
            <X size={20} />
          </button>
        </div>

        <div className="notification-center-filters">
          <button 
            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todas
          </button>
          <button 
            className={`filter-button ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Não lidas ({unreadCount})
          </button>
          {unreadCount > 0 && (
            <button 
              className="mark-all-read-button"
              onClick={markAllAsRead}
            >
              <CheckCheck size={16} />
              Marcar todas como lidas
            </button>
          )}
        </div>

        <div className="notification-center-content">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
              >
                <div className={`notification-icon ${getNotificationTypeColor(notification.type)}`}>
                  <Bell size={20} />
                </div>
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  <p className="notification-date">{formatNotificationDate(notification.date)}</p>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="action-button read-button"
                      title="Marcar como lida"
                    >
                      <Check size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="action-button delete-button"
                    title="Remover notificação"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-notifications">
              <Bell size={40} />
              <p>Nenhuma notificação {filter === 'unread' ? 'não lida' : ''}</p>
            </div>
          )}
        </div>

        <div className="notification-center-footer">
          <button 
            className="view-all-button"
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
          >
            Ver todas as notificações
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
