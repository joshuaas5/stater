import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell, AlertTriangle, Calendar } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'default' | 
  'fiveDaysBefore' | 'oneDayBefore' | 'dueDay' | 'overdue' | 'almostFinished' | 'paid' | 'weeklyReport';

interface NotificationToastProps {
  id: string;
  message: string;
  type: NotificationType;
  onClose: (id: string) => void;
  autoClose?: boolean;
  duration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  id,
  message,
  type,
  onClose,
  autoClose = true,
  duration = 8000,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (autoClose) {
      timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300); // Delay para permitir a animação de saída
      }, duration);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [id, duration, onClose, autoClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
      case 'fiveDaysBefore':
      case 'oneDayBefore':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'dueDay':
      case 'overdue':
        return <Calendar className="w-5 h-5 text-red-500" />;
      case 'paid':
      case 'almostFinished':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'weeklyReport':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
      case 'paid':
      case 'almostFinished':
        return 'bg-green-50 border-green-200';
      case 'error':
      case 'overdue':
        return 'bg-red-50 border-red-200';
      case 'warning':
      case 'fiveDaysBefore':
      case 'oneDayBefore':
      case 'dueDay':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      case 'weeklyReport':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  // Verificar se a mensagem é longa e deve ser truncada
  const isLongMessage = message.length > 100;
  const displayMessage = isExpanded ? message : (isLongMessage ? `${message.substring(0, 100)}...` : message);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg border ${getBgColor()} flex flex-col max-w-sm z-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="flex items-center gap-3 w-full">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm text-gray-800 whitespace-pre-wrap">{displayMessage}</p>
          {isLongMessage && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-blue-500 mt-1 hover:underline"
            >
              {isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onClose(id), 300);
          }}
          className="ml-auto text-gray-400 hover:text-gray-600"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
