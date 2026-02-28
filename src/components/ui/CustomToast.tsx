import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

const VARIANT_STYLES = {
  default: {
    container: 'bg-white border-gray-200 text-gray-900',
    icon: <Info className="w-5 h-5 text-blue-500" />,
    iconBg: 'bg-blue-50',
  },
  success: {
    container: 'bg-white border-green-200 text-gray-900',
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    iconBg: 'bg-green-50',
  },
  error: {
    container: 'bg-white border-red-200 text-gray-900',
    icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    iconBg: 'bg-red-50',
  },
  warning: {
    container: 'bg-white border-orange-200 text-gray-900',
    icon: <AlertCircle className="w-5 h-5 text-orange-600" />,
    iconBg: 'bg-orange-50',
  },
  info: {
    container: 'bg-white border-blue-200 text-gray-900',
    icon: <Info className="w-5 h-5 text-blue-600" />,
    iconBg: 'bg-blue-50',
  },
};

export const CustomToast: React.FC<CustomToastProps> = ({
  id,
  title,
  description,
  variant = 'default',
  onClose,
}) => {
  const styles = VARIANT_STYLES[variant];

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        "group pointer-events-auto relative flex w-full max-w-[calc(100vw-2rem)] sm:max-w-[420px] items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 animate-slideInFromTop",
        styles.container
      )}
      style={{
        zIndex: 2147483648,
      }}
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0 rounded-full p-1", styles.iconBg)}>
        {styles.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <div className="text-sm font-semibold leading-tight mb-1">
            {title}
          </div>
        )}
        {description && (
          <div className="text-sm opacity-90 leading-relaxed">
            {description}
          </div>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="flex-shrink-0 rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        aria-label="Fechar notificação"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const CustomToastContainer: React.FC<{
  toasts: CustomToastProps[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 left-4 sm:max-w-[420px] z-[2147483648] pointer-events-none"
      style={{ zIndex: 2147483648 }}
    >
      <div className="flex flex-col gap-2 pointer-events-auto">
        {toasts.map((toast) => (
          <CustomToast
            key={toast.id}
            {...toast}
            onClose={() => onRemove(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};
