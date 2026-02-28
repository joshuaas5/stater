import { useState, useCallback } from 'react';
import { CustomToastProps } from '@/components/ui/CustomToast';

let toastIdCounter = 0;

export const useCustomToast = () => {
  const [toasts, setToasts] = useState<CustomToastProps[]>([]);

  const addToast = useCallback((toast: Omit<CustomToastProps, 'id'>) => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: CustomToastProps = {
      ...toast,
      id,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((title: string, description?: string) =>
    addToast({ title, description, variant: 'success' }), [addToast]);
  
  const error = useCallback((title: string, description?: string) =>
    addToast({ title, description, variant: 'error' }), [addToast]);
  
  const warning = useCallback((title: string, description?: string) =>
    addToast({ title, description, variant: 'warning' }), [addToast]);
  
  const info = useCallback((title: string, description?: string) =>
    addToast({ title, description, variant: 'info' }), [addToast]);
  
  const defaultToast = useCallback((title: string, description?: string) =>
    addToast({ title, description, variant: 'default' }), [addToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return {
    toasts,
    success,
    error,
    warning,
    info,
    default: defaultToast,
    removeToast,
    clearAll,
  };
};
