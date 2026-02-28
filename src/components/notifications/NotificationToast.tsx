import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, Bell, AlertTriangle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NotificationType = 'success' | 'error' | 'info' | 'warning' | 'default' | 
  'fiveDaysBefore' | 'oneDayBefore' | 'dueDay' | 'overdue' | 'almostFinished' | 'paid' | 'weeklyReport';

interface NotificationToastProps {
  id: string;
  message: string;
  type: NotificationType;
  onClose: (id: string) => void;
  autoClose?: boolean;
  duration?: number;
  index?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  id,
  message,
  type,
  onClose,
  autoClose = true,
  duration = 5000,
  index = 0,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!autoClose) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, autoClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 200);
  };

  const getConfig = () => {
    switch (type) {
      case 'success':
      case 'paid':
      case 'almostFinished':
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          gradient: 'from-emerald-500 to-green-600',
          bgColor: 'bg-emerald-500/10',
          borderColor: 'border-emerald-500/30',
          textColor: 'text-emerald-400',
          progressColor: 'bg-emerald-500',
        };
      case 'error':
      case 'overdue':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          gradient: 'from-red-500 to-rose-600',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/30',
          textColor: 'text-red-400',
          progressColor: 'bg-red-500',
        };
      case 'warning':
      case 'fiveDaysBefore':
      case 'oneDayBefore':
        return {
          icon: <AlertTriangle className="w-5 h-5" />,
          gradient: 'from-amber-500 to-yellow-600',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/30',
          textColor: 'text-amber-400',
          progressColor: 'bg-amber-500',
        };
      case 'dueDay':
        return {
          icon: <Calendar className="w-5 h-5" />,
          gradient: 'from-orange-500 to-red-600',
          bgColor: 'bg-orange-500/10',
          borderColor: 'border-orange-500/30',
          textColor: 'text-orange-400',
          progressColor: 'bg-orange-500',
        };
      case 'info':
      case 'weeklyReport':
        return {
          icon: <Info className="w-5 h-5" />,
          gradient: 'from-blue-500 to-indigo-600',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30',
          textColor: 'text-blue-400',
          progressColor: 'bg-blue-500',
        };
      default:
        return {
          icon: <Bell className="w-5 h-5" />,
          gradient: 'from-violet-500 to-purple-600',
          bgColor: 'bg-violet-500/10',
          borderColor: 'border-violet-500/30',
          textColor: 'text-violet-400',
          progressColor: 'bg-violet-500',
        };
    }
  };

  const config = getConfig();

  // Formatar mensagem para exibição mais limpa
  const formatMessage = (msg: string) => {
    return msg
      .replace(/📌\s*/g, '')
      .replace(/⚠️\s*/g, '')
      .replace(/🔔\s*/g, '')
      .trim();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            delay: index * 0.1 
          }}
          className="pointer-events-auto"
        >
          <div
            className={`
              relative overflow-hidden
              w-80 max-w-[calc(100vw-2rem)]
              backdrop-blur-xl
              ${config.bgColor}
              border ${config.borderColor}
              rounded-2xl
              shadow-2xl shadow-black/20
              dark:shadow-black/40
            `}
          >
            {/* Gradient accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`} />
            
            {/* Content */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                {/* Icon with gradient background */}
                <div className={`
                  flex-shrink-0
                  w-10 h-10
                  rounded-xl
                  bg-gradient-to-br ${config.gradient}
                  flex items-center justify-center
                  text-white
                  shadow-lg
                `}>
                  {config.icon}
                </div>
                
                {/* Message */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-white/90 leading-relaxed">
                    {formatMessage(message)}
                  </p>
                </div>
                
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className={`
                    flex-shrink-0
                    w-6 h-6
                    rounded-full
                    flex items-center justify-center
                    text-white/40
                    hover:text-white/80
                    hover:bg-white/10
                    transition-all duration-200
                  `}
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            {autoClose && (
              <div className="h-0.5 bg-white/5">
                <motion.div
                  className={`h-full ${config.progressColor}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationToast;
