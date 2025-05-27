import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, CheckCheck, AlertTriangle, Calendar, DollarSign, Clock, Trash2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Notification } from '@/types';
import './NotificationCenter.css';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, removeNotification, unreadCount, clearAll } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  // Limitar o número de notificações exibidas no painel
  const [displayLimit, setDisplayLimit] = useState<number>(10);

  if (!isOpen) return null;

  // Filtrar e limitar notificações
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notification => !notification.read);
    
  // Ordenar notificações por data (mais recentes primeiro)
  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, displayLimit);

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
      case 'weeklyReport':
        return 'bg-galileo-info';
      default:
        return 'bg-galileo-accent';
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle size={20} />;
      case 'dueDay':
        return <Calendar size={20} />;
      case 'oneDayBefore':
        return <Clock size={20} />;
      case 'fiveDaysBefore':
        return <Bell size={20} />;
      case 'paid':
        return <DollarSign size={20} />;
      case 'weeklyReport':
        return <Calendar size={20} />;
      default:
        return <Bell size={20} />;
    }
  };
  
  // Agrupar notificações por data
  const groupNotificationsByDate = (notifications: Notification[]) => {
    const groups: Record<string, Notification[]> = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.date);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      today.setHours(0, 0, 0, 0);
      yesterday.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      let dateKey;
      
      if (date.getTime() === today.getTime()) {
        dateKey = 'Hoje';
      } else if (date.getTime() === yesterday.getTime()) {
        dateKey = 'Ontem';
      } else {
        dateKey = date.toLocaleDateString('pt-BR');
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(notification);
    });
    
    return groups;
  };
  
  const groupedNotifications = groupNotificationsByDate(sortedNotifications);

  return (
    <div className="notification-center-overlay">
      <div className="notification-center-container">
        <div className="notification-center-header">
          <h2>Notificações</h2>
          <div className="notification-header-actions">
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                className="clear-all-button"
                title="Limpar todas as notificações"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="close-button">
              <X size={20} />
            </button>
          </div>
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
          {sortedNotifications.length > 0 ? (
            Object.entries(groupedNotifications).map(([dateGroup, notifications]) => (
              <div key={dateGroup} className="notification-group">
                <div className="notification-date-header">{dateGroup}</div>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  >
                    <div className={`notification-icon ${getNotificationTypeColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <p className="notification-time">
                        {new Date(notification.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
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
                ))}
              </div>
            ))
          ) : (
            <div className="empty-notifications">
              <Bell size={40} />
              <p>Nenhuma notificação {filter === 'unread' ? 'não lida' : ''}</p>
            </div>
          )}
          
          {filteredNotifications.length > displayLimit && (
            <div className="load-more-container">
              <button 
                className="load-more-button"
                onClick={() => setDisplayLimit(prev => prev + 10)}
              >
                Carregar mais notificações
              </button>
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
