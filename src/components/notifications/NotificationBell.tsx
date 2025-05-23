import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { requestWeeklySummary } from '@/utils/emailNotifications';
import { toast } from '@/hooks/use-toast';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
  };
  
  // Fechar o popup quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleRequestSummary = async (notificationId: string) => {
    const result = await requestWeeklySummary();
    
    if (result.success) {
      // Marcar notificação como lida
      markAsRead(notificationId);
      
      // Mostrar toast de sucesso
      toast({
        title: 'Resumo Semanal',
        description: result.message
      });
    } else {
      toast({
        title: 'Erro',
        description: result.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleNotificationCenter}
        className="relative p-2 rounded-full hover:bg-galileo-hover focus:outline-none focus:ring-2 focus:ring-galileo-accent"
        aria-label="Notificações"
      >
        <Bell className="w-6 h-6 text-galileo-text" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-galileo-accent rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div 
          ref={popupRef}
          className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-md shadow-lg z-50 max-h-[70vh] overflow-auto"
        >
          <div className="sticky top-0 bg-card p-3 border-b border-border flex justify-between items-center">
            <h3 className="font-medium">Notificações</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="p-0">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b border-border hover:bg-muted transition-colors ${notification.read ? 'opacity-70' : 'font-medium'}
                    `}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.date).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        
                        {notification.type === 'weekly_summary' && !notification.read && (
                          <button
                            onClick={() => handleRequestSummary(notification.id)}
                            className="mt-2 px-3 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                          >
                            Solicitar Agora
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted-foreground/10"
                            title="Marcar como lida"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="p-1 text-muted-foreground hover:text-destructive rounded-full hover:bg-muted-foreground/10"
                          title="Remover notificação"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
