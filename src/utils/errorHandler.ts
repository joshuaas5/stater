// Sistema de tratamento de erros global para o Stater IA
import { toast } from '@/hooks/use-toast';

// Tipos de erro
export enum ErrorType {
  NETWORK = 'network',
  API = 'api',
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  STORAGE = 'storage',
  SUPABASE = 'supabase',
  GEMINI = 'gemini',
  GENERIC = 'generic',
  TIMEOUT = 'timeout',
  OFFLINE = 'offline'
}

// Interface para erro padronizado
export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: string;
  errorId: string;
  userId?: string | null;
  retryable: boolean;
  userFriendlyMessage: string;
}

// Configuração de retry
export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  backoffMultiplier: number;
  maxDelay: number;
}

// Configuração padrão de retry
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000
};

// Classe principal para tratamento de erros
class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLogs: AppError[] = [];
  private offlineQueue: Function[] = [];
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    this.setupGlobalHandlers();
    this.setupOfflineHandlers();
  }

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // Configurar handlers globais
  private setupGlobalHandlers() {
    // Capturar erros não tratados
    window.addEventListener('error', (event) => {
      this.handleError(event.error, {
        type: ErrorType.GENERIC,
        context: { filename: event.filename, lineno: event.lineno, colno: event.colno }
      });
    });

    // Capturar promises rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, {
        type: ErrorType.GENERIC,
        context: { promiseRejection: true }
      });
      event.preventDefault();
    });
  }

  // Configurar handlers para estado offline
  private setupOfflineHandlers() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.showOfflineMessage();
    });
  }

  // Processar fila offline
  private processOfflineQueue() {
    if (this.offlineQueue.length > 0) {
      toast({
        title: "Conectado novamente",
        description: `Processando ${this.offlineQueue.length} operações pendentes...`
      });

      this.offlineQueue.forEach(fn => {
        try {
          fn();
        } catch (error) {
          console.error('Erro ao processar item da fila offline:', error);
        }
      });

      this.offlineQueue = [];
    }
  }

  // Mostrar mensagem de offline
  private showOfflineMessage() {
    toast({
      title: "Sem conexão",
      description: "Algumas funcionalidades podem estar limitadas. Tentaremos novamente quando a conexão for restaurada.",
      variant: "destructive"
    });
  }

  // Método principal para tratar erros
  public handleError(error: Error | string, options: {
    type?: ErrorType;
    context?: Record<string, any>;
    showToast?: boolean;
    retryable?: boolean;
  } = {}) {
    const appError = this.createAppError(error, options);
    
    // Log do erro
    this.logError(appError);

    // Mostrar toast se necessário
    if (options.showToast !== false) {
      this.showErrorToast(appError);
    }

    // Enviar para monitoramento (se online)
    if (this.isOnline) {
      this.sendToMonitoring(appError);
    }

    return appError;
  }

  // Criar erro padronizado
  private createAppError(error: Error | string, options: {
    type?: ErrorType;
    context?: Record<string, any>;
    retryable?: boolean;
  }): AppError {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      type: options.type || ErrorType.GENERIC,
      message: errorObj.message,
      originalError: errorObj,
      context: options.context || {},
      timestamp: new Date().toISOString(),
      errorId,
      userId: this.getCurrentUserId(),
      retryable: options.retryable ?? this.isRetryable(errorObj),
      userFriendlyMessage: this.getUserFriendlyMessage(errorObj, options.type)
    };
  }

  // Determinar se o erro é retryable
  private isRetryable(error: Error): boolean {
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /fetch/i,
      /connection/i,
      /temporary/i,
      /rate limit/i,
      /503/,
      /502/,
      /504/
    ];

    return retryablePatterns.some(pattern => pattern.test(error.message));
  }

  // Gerar mensagem amigável para o usuário
  private getUserFriendlyMessage(error: Error, type?: ErrorType): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Problema de conexão. Verifique sua internet e tente novamente.';
      case ErrorType.API:
        return 'Erro no servidor. Tente novamente em alguns instantes.';
      case ErrorType.AUTHENTICATION:
        return 'Sua sessão expirou. Faça login novamente.';
      case ErrorType.VALIDATION:
        return 'Dados inválidos. Verifique as informações e tente novamente.';
      case ErrorType.STORAGE:
        return 'Erro ao salvar dados. Tente novamente.';
      case ErrorType.SUPABASE:
        return 'Erro no banco de dados. Tente novamente em alguns instantes.';
      case ErrorType.GEMINI:
        return 'Erro na IA. Tente reformular sua pergunta.';
      case ErrorType.TIMEOUT:
        return 'Operação demorou muito. Tente novamente.';
      case ErrorType.OFFLINE:
        return 'Sem conexão. Verifique sua internet.';
      default:
        if (error.message.includes('Failed to fetch')) {
          return 'Erro de conexão. Verifique sua internet e tente novamente.';
        }
        return 'Erro inesperado. Tente novamente ou contate o suporte.';
    }
  }

  // Mostrar toast de erro
  private showErrorToast(error: AppError) {
    toast({
      title: "Erro",
      description: error.userFriendlyMessage,
      variant: "destructive",
      duration: 5000
    });
  }

  // Log local do erro
  private logError(error: AppError) {
    console.error('🚨 Erro capturado:', error);
    
    // Adicionar ao log local
    this.errorLogs.push(error);
    
    // Manter apenas os últimos 100 erros
    if (this.errorLogs.length > 100) {
      this.errorLogs.splice(0, this.errorLogs.length - 100);
    }

    // Salvar no localStorage
    try {
      localStorage.setItem('errorLogs', JSON.stringify(this.errorLogs));
    } catch (e) {
      console.error('Erro ao salvar log no localStorage:', e);
    }
  }

  // Enviar para monitoramento
  private async sendToMonitoring(error: AppError) {
    try {
      // Aqui você pode implementar envio para serviços de monitoramento
      // como Sentry, LogRocket, etc.
      console.log('📊 Enviando erro para monitoramento:', error.errorId);
    } catch (e) {
      console.error('Erro ao enviar para monitoramento:', e);
    }
  }

  // Obter ID do usuário atual
  private getCurrentUserId(): string | null {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
      return user?.id || null;
    } catch {
      return null;
    }
  }

  // Método para retry com backoff
  public async withRetry<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
    let lastError: Error;

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt === retryConfig.maxRetries) {
          throw this.handleError(lastError, {
            type: ErrorType.GENERIC,
            context: { retryAttempts: attempt },
            showToast: true
          });
        }

        // Calcular delay com backoff
        const delay = Math.min(
          retryConfig.initialDelay * Math.pow(retryConfig.backoffMultiplier, attempt),
          retryConfig.maxDelay
        );

        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  // Método para operações com timeout
  public async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string = 'Operação demorou muito'
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(this.handleError(new Error(errorMessage), {
          type: ErrorType.TIMEOUT,
          showToast: true
        }));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]);
  }

  // Wrapper para operações offline
  public queueForOnline(fn: Function) {
    if (this.isOnline) {
      fn();
    } else {
      this.offlineQueue.push(fn);
    }
  }

  // Obter logs de erro
  public getErrorLogs(): AppError[] {
    return [...this.errorLogs];
  }

  // Limpar logs
  public clearErrorLogs() {
    this.errorLogs = [];
    localStorage.removeItem('errorLogs');
  }

  // Verificar status da conexão
  public isOnlineStatus(): boolean {
    return this.isOnline;
  }
}

// Instância singleton
export const errorHandler = ErrorHandler.getInstance();

// Funções utilitárias exportadas
export const handleError = (error: Error | string, options?: {
  type?: ErrorType;
  context?: Record<string, any>;
  showToast?: boolean;
  retryable?: boolean;
}) => errorHandler.handleError(error, options);

export const withRetry = <T>(fn: () => Promise<T>, config?: Partial<RetryConfig>) => 
  errorHandler.withRetry(fn, config);

export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number, errorMessage?: string) => 
  errorHandler.withTimeout(promise, timeoutMs, errorMessage);

export const queueForOnline = (fn: Function) => errorHandler.queueForOnline(fn);

export const getErrorLogs = () => errorHandler.getErrorLogs();

export const clearErrorLogs = () => errorHandler.clearErrorLogs();

export const isOnline = () => errorHandler.isOnlineStatus();
