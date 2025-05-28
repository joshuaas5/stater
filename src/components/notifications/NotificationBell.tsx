import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Trash2 } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { sendWeeklySummaryEmail } from '@/utils/emailService';
import { toast } from '@/hooks/use-toast';
import { clearAllNotifications } from '@/utils/clearAllNotifications';

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
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
    try {
      // Mostrar toast de carregamento
      toast({
        title: 'Processando',
        description: 'Gerando seu resumo semanal...'
      });
      
      // Usar try/catch para capturar qualquer erro na chamada
      const result = await sendWeeklySummaryEmail();
      
      if (result.success) {
        // Marcar notificação como lida
        markAsRead(notificationId);
        
        // Mostrar toast de sucesso
        toast({
          title: 'Resumo Semanal',
          description: result.message
        });
      } else {
        console.error('Erro ao enviar resumo semanal:', result.message);
        toast({
          title: 'Erro',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao processar resumo semanal:', error);
      toast({
        title: 'Erro Inesperado',
        description: 'Não foi possível gerar o resumo semanal. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    }
  };
  
  const handleClearAllNotifications = async () => {
    if (notifications.length === 0 || isClearing) return;
    
    try {
      setIsClearing(true);
      
      // Mostrar toast de carregamento
      toast({
        title: 'Processando',
        description: 'Limpando todas as notificações...'
      });
      
      const success = await clearAllNotifications();
      
      if (success) {
        // Atualizar a interface (o evento notificationsUpdated já deve fazer isso)
        // Mostrar toast de sucesso
        toast({
          title: 'Notificações Limpas',
          description: 'Todas as notificações foram removidas com sucesso.'
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Não foi possível limpar todas as notificações.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
      toast({
        title: 'Erro Inesperado',
        description: 'Ocorreu um erro ao limpar as notificações. Tente novamente mais tarde.',
        variant: 'destructive'
      });
    } finally {
      setIsClearing(false);
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
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAllNotifications}
                  disabled={isClearing}
                  className="text-muted-foreground hover:text-destructive flex items-center text-xs"
                  title="Limpar todas as notificações"
                >
                  <Trash2 size={16} className="mr-1" />
                  <span>Limpar tudo</span>
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>
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
