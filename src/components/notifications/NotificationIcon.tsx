import React, { useState, useEffect } from 'react';
import { Bell, Clock, AlertTriangle, X } from 'lucide-react';
import { checkBillDueDates, BillNotification } from '@/utils/billNotifications';

interface NotificationIconProps {
  className?: string;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ className = '' }) => {
  const [notifications, setNotifications] = useState<BillNotification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  // Verificar notificações
  const checkNotifications = () => {
    const bills = checkBillDueDates();
    
    // Filtrar apenas as importantes (hoje e atraso até 3 dias)
    const important = bills.filter(notification => {
      if (notification.type === 'week_warning') return false;
      
      if (notification.type === 'overdue') {
        const daysOverdue = Math.ceil((new Date().getTime() - notification.dueDate.getTime()) / (1000 * 3600 * 24));
        return daysOverdue <= 3;
      }
      
      return true;
    });
    
    setNotifications(important);
    setHasUnread(important.length > 0);
  };

  useEffect(() => {
    checkNotifications();
    
    // Verificar a cada 5 minutos
    const interval = setInterval(checkNotifications, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'day_warning':
        return <Clock className="h-4 w-4 text-orange-300" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-300" />;
      default:
        return <Bell className="h-4 w-4 text-blue-300" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'day_warning':
        return 'border-l-orange-500 bg-orange-50';
      case 'overdue':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <Bell className="h-5 w-5 text-white" />
        
        {hasUnread && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
      </button>

      {showDropdown && (
        <>
          {/* Overlay para fechar */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl border-0 z-50 max-h-96 overflow-hidden"
            style={{
              background: 'rgba(49, 81, 139, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              minWidth: '320px'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações ({notifications.length})
              </h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-white/70" />
              </button>
            </div>

            {/* Lista de notificações */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center">
                  <Bell className="h-8 w-8 mx-auto mb-3 text-white/30" />
                  <p className="text-sm text-white font-medium mb-1">Nenhuma notificação</p>
                  <p className="text-xs text-white/60">Suas contas estão em dia!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        notification.type === 'day_warning' 
                          ? 'bg-orange-500/20 border border-orange-400/30' 
                          : 'bg-red-500/20 border border-red-400/30'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-white mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-white/70 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-white/50">
                            {notification.dueDate.toLocaleDateString('pt-BR')}
                          </span>
                          <button
                            onClick={() => {
                              window.location.hash = '#/bills';
                              setShowDropdown(false);
                            }}
                            className="text-xs font-medium px-2 py-1 rounded-lg transition-colors"
                            style={{
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: 'white'
                            }}
                          >
                            Ver contas
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <button
                  onClick={() => {
                    window.location.hash = '#/bills';
                    setShowDropdown(false);
                  }}
                  className="w-full text-sm font-medium py-2 px-4 rounded-xl transition-colors text-white"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                >
                  Ver todas as contas
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationIcon;
