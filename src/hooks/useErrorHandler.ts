// Hook para tratamento de erros em componentes React
import { useCallback, useEffect, useState } from 'react';
import { errorHandler, ErrorType, AppError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  onError?: (error: AppError) => void;
}

interface ErrorState {
  error: AppError | null;
  isError: boolean;
  errorCount: number;
  lastErrorTime: Date | null;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorCount: 0,
    lastErrorTime: null
  });

  const handleError = useCallback((error: Error | string, errorOptions?: {
    type?: ErrorType;
    context?: Record<string, any>;
    showToast?: boolean;
    retryable?: boolean;
  }) => {
    const appError = errorHandler.handleError(error, {
      showToast: options.showToast ?? errorOptions?.showToast,
      ...errorOptions
    });

    // Atualizar estado local
    setErrorState(prev => ({
      error: appError,
      isError: true,
      errorCount: prev.errorCount + 1,
      lastErrorTime: new Date()
    }));

    // Callback personalizado
    if (options.onError) {
      options.onError(appError);
    }

    // Log opcional no console
    if (options.logToConsole) {
      console.error('Error handled by useErrorHandler:', appError);
    }

    return appError;
  }, [options]);

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorCount: 0,
      lastErrorTime: null
    });
  }, []);

  const retry = useCallback((fn: () => void | Promise<void>) => {
    if (errorState.error?.retryable) {
      clearError();
      try {
        const result = fn();
        if (result instanceof Promise) {
          result.catch(handleError);
        }
      } catch (error) {
        handleError(error as Error);
      }
    }
  }, [errorState.error, clearError, handleError]);

  // Wrapper para operações async
  const withErrorHandling = useCallback(async <T>(
    fn: () => Promise<T>,
    errorOptions?: {
      type?: ErrorType;
      context?: Record<string, any>;
      showToast?: boolean;
      retryable?: boolean;
    }
  ): Promise<T | null> => {
    try {
      return await fn();
    } catch (error) {
      handleError(error as Error, errorOptions);
      return null;
    }
  }, [handleError]);

  // Wrapper para operações síncronas
  const withSyncErrorHandling = useCallback(<T>(
    fn: () => T,
    errorOptions?: {
      type?: ErrorType;
      context?: Record<string, any>;
      showToast?: boolean;
      retryable?: boolean;
    }
  ): T | null => {
    try {
      return fn();
    } catch (error) {
      handleError(error as Error, errorOptions);
      return null;
    }
  }, [handleError]);

  return {
    error: errorState.error,
    isError: errorState.isError,
    errorCount: errorState.errorCount,
    lastErrorTime: errorState.lastErrorTime,
    handleError,
    clearError,
    retry,
    withErrorHandling,
    withSyncErrorHandling
  };
};

// Hook para status de conexão
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        toast({
          title: "Conexão restaurada",
          description: "Você está online novamente",
        });
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      toast({
        title: "Sem conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
        duration: 5000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  return { isOnline, wasOffline };
};

// Hook para operações com retry automático
export const useRetryableOperation = () => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { handleError } = useErrorHandler();

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      delay?: number;
      onRetry?: (count: number) => void;
      onSuccess?: (result: T) => void;
      onFinalError?: (error: AppError) => void;
    } = {}
  ): Promise<T | null> => {
    const { maxRetries = 3, delay = 1000, onRetry, onSuccess, onFinalError } = options;
    
    setIsRetrying(true);
    setRetryCount(0);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        setIsRetrying(false);
        setRetryCount(0);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (error) {
        if (attempt < maxRetries) {
          setRetryCount(attempt + 1);
          
          if (onRetry) {
            onRetry(attempt + 1);
          }
          
          // Aguardar antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        } else {
          // Última tentativa falhou
          setIsRetrying(false);
          setRetryCount(0);
          
          const appError = handleError(error as Error, {
            type: ErrorType.GENERIC,
            context: { retryAttempts: attempt + 1 }
          });
          
          if (onFinalError) {
            onFinalError(appError);
          }
          
          return null;
        }
      }
    }

    return null;
  }, [handleError]);

  return {
    executeWithRetry,
    isRetrying,
    retryCount
  };
};

// Hook para validação com tratamento de erro
export const useValidation = () => {
  const { handleError } = useErrorHandler();

  const validate = useCallback((
    value: any,
    rules: Array<{
      test: (val: any) => boolean;
      message: string;
    }>
  ): boolean => {
    for (const rule of rules) {
      if (!rule.test(value)) {
        handleError(new Error(rule.message), {
          type: ErrorType.VALIDATION,
          showToast: true
        });
        return false;
      }
    }
    return true;
  }, [handleError]);

  return { validate };
};
