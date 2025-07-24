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
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
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
            className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden"
            style={{ minWidth: '320px' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificações ({notifications.length})
              </h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>

            {/* Lista de notificações */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Nenhuma notificação</p>
                  <p className="text-xs text-gray-400">Suas contas estão em dia!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 border-b last:border-b-0 ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {notification.dueDate.toLocaleDateString('pt-BR')}
                          </span>
                          <button
                            onClick={() => {
                              window.location.hash = '#/bills';
                              setShowDropdown(false);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
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
              <div className="p-3 bg-gray-50 border-t">
                <button
                  onClick={() => {
                    window.location.hash = '#/bills';
                    setShowDropdown(false);
                  }}
                  className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
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
