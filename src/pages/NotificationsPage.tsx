import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '@/utils/localStorage';
import { 
  Bell, Check, Trash2, CheckCheck, AlertCircle, 
  CreditCard, Calendar, TrendingUp, Sparkles, ArrowLeft,
  Clock, XCircle
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll, 
    refreshNotifications, 
    unreadCount, 
    loading 
  } = useNotifications();
  
  useEffect(() => {
    if (!isLoggedIn()) {
      navigate('/login');
      return;
    }
    
    refreshNotifications();
  }, [navigate, refreshNotifications]);
  
  const formatNotificationDate = (date: Date) => {
    const notificationDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    const notifDateOnly = new Date(notificationDate);
    notifDateOnly.setHours(0, 0, 0, 0);
    
    const time = notificationDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    if (notifDateOnly.getTime() === today.getTime()) {
      return `Hoje às ${time}`;
    } else if (notifDateOnly.getTime() === yesterday.getTime()) {
      return `Ontem às ${time}`;
    } else {
      return notificationDate.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'overdue':
        return <AlertCircle size={20} className="text-white" />;
      case 'dueDay':
        return <Calendar size={20} className="text-white" />;
      case 'oneDayBefore':
        return <Clock size={20} className="text-white" />;
      case 'paid':
        return <Check size={20} className="text-white" />;
      case 'card':
        return <CreditCard size={20} className="text-white" />;
      case 'insight':
        return <TrendingUp size={20} className="text-white" />;
      default:
        return <Bell size={20} className="text-white" />;
    }
  };

  const getNotificationColors = (type: string) => {
    switch (type) {
      case 'overdue':
        return {
          bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          glow: 'rgba(239, 68, 68, 0.4)',
          border: 'rgba(239, 68, 68, 0.3)'
        };
      case 'dueDay':
        return {
          bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          glow: 'rgba(245, 158, 11, 0.4)',
          border: 'rgba(245, 158, 11, 0.3)'
        };
      case 'oneDayBefore':
        return {
          bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          glow: 'rgba(59, 130, 246, 0.4)',
          border: 'rgba(59, 130, 246, 0.3)'
        };
      case 'paid':
        return {
          bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          glow: 'rgba(16, 185, 129, 0.4)',
          border: 'rgba(16, 185, 129, 0.3)'
        };
      default:
        return {
          bg: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          glow: 'rgba(139, 92, 246, 0.4)',
          border: 'rgba(139, 92, 246, 0.3)'
        };
    }
  };

  return (
    <div 
      className="min-h-screen pb-24 lg:pb-8 bg-[#0f172a] lg:bg-transparent safe-area-top"
      style={{ 
        background: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)',
        minHeight: '100vh'
      }}
    >
      {/* Header - Mobile */}
      <div 
        className="sticky top-0 z-50 lg:hidden"
        style={{
          background: 'rgba(30, 58, 95, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          
          <h1 
            className="text-xl font-bold text-white"
            style={{ fontFamily: '"Fredoka One", sans-serif' }}
          >
            Notificações
          </h1>
          
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      {/* Header - Desktop */}
      <div className="hidden lg:block px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Notificações</h1>
            <p className="text-white/60 mt-1">
              {unreadCount > 0 
                ? `Você tem ${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}`
                : 'Todas as notificações foram lidas'
              }
            </p>
          </div>
          
          {notifications.length > 0 && (
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <CheckCheck size={16} className="text-white" />
                  <span className="text-white">Marcar todas como lidas</span>
                </button>
              )}
              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:bg-white/15"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <Trash2 size={16} className="text-white/70" />
                <span className="text-white/70">Limpar todas</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Bar - Mobile */}
      {notifications.length > 0 && unreadCount > 0 && (
        <div className="lg:hidden px-4 py-3">
          <button
            onClick={markAllAsRead}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.1) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.3)'
            }}
          >
            <CheckCheck size={18} className="text-emerald-400" />
            <span className="text-emerald-400">Marcar todas como lidas</span>
          </button>
        </div>
      )}
      
      {/* Notifications List */}
      <div className="px-4 lg:px-6 py-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div 
              className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin mb-4"
              style={{ borderColor: 'rgba(139, 92, 246, 0.3)', borderTopColor: 'transparent' }}
            />
            <p className="text-white/50">Carregando notificações...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-4 space-y-3 lg:space-y-0">
            {notifications.map((notification) => {
              const colors = getNotificationColors(notification.type);
              
              return (
                <div 
                  key={notification.id}
                  className={`
                    relative overflow-hidden rounded-2xl transition-all duration-300
                    ${!notification.read ? 'ring-2' : ''}
                  `}
                  style={{
                    background: notification.read 
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${notification.read ? 'rgba(255, 255, 255, 0.08)' : colors.border}`,
                    ringColor: colors.border,
                    boxShadow: notification.read ? 'none' : `0 4px 20px ${colors.glow}`
                  }}
                >
                  {/* Unread indicator */}
                  {!notification.read && (
                    <div 
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ background: colors.bg }}
                    />
                  )}
                  
                  <div className="p-4">
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div 
                        className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{
                          background: colors.bg,
                          boxShadow: `0 4px 15px ${colors.glow}`
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-relaxed mb-2 ${notification.read ? 'text-white/70' : 'text-white'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-white/40">
                          <Clock size={12} />
                          <span>{formatNotificationDate(notification.date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                          style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          <Check size={14} className="text-emerald-400" />
                          <span className="text-emerald-400">Marcar como lida</span>
                        </button>
                      )}
                      <button
                        onClick={() => removeNotification(notification.id)}
                        className={`
                          ${notification.read ? 'flex-1' : ''} 
                          flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
                        `}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}
                      >
                        <XCircle size={14} className="text-red-400" />
                        <span className="text-red-400">Remover</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-20 lg:py-32">
            <div 
              className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}
            >
              <Bell size={48} className="text-purple-400/50 lg:w-16 lg:h-16" />
            </div>
            
            <div className="text-center">
              <h3 className="text-xl lg:text-2xl font-bold text-white mb-2">
                Tudo em dia! 
              </h3>
              <p className="text-white/50 text-sm lg:text-base max-w-xs">
                Você não tem nenhuma notificação no momento. Vamos te avisar quando algo importante acontecer.
              </p>
            </div>
            
            <div 
              className="mt-8 p-4 rounded-2xl max-w-sm"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}
            >
              <div className="flex items-start gap-3">
                <Sparkles size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/70 leading-relaxed">
                  <strong className="text-white">Dica:</strong> Ative as notificações push para receber alertas de contas próximas do vencimento!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
