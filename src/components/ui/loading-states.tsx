// src/components/ui/loading-states.tsx
import React from 'react';
import { Loader2, MessageCircle, Brain, Upload, FileText, Search, CreditCard, Check } from 'lucide-react';

// Tipos de loading states
export type LoadingType = 
  | 'general'
  | 'chat'
  | 'ai-thinking'
  | 'file-upload'
  | 'ocr-processing'
  | 'transaction-save'
  | 'search'
  | 'auth';

interface LoadingStateProps {
  type: LoadingType;
  message?: string;
  progress?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Configurações para cada tipo de loading
const loadingConfigs = {
  general: {
    icon: Loader2,
    color: 'text-blue-500',
    message: 'Carregando...',
    spinnerClass: 'animate-spin'
  },
  chat: {
    icon: MessageCircle,
    color: 'text-green-500',
    message: 'Enviando mensagem...',
    spinnerClass: 'animate-pulse'
  },
  'ai-thinking': {
    icon: Brain,
    color: 'text-purple-500',
    message: 'Stater IA está pensando...',
    spinnerClass: 'animate-pulse'
  },
  'file-upload': {
    icon: Upload,
    color: 'text-orange-500',
    message: 'Enviando arquivo...',
    spinnerClass: 'animate-bounce'
  },
  'ocr-processing': {
    icon: FileText,
    color: 'text-yellow-500',
    message: 'Processando documento...',
    spinnerClass: 'animate-spin'
  },
  'transaction-save': {
    icon: CreditCard,
    color: 'text-emerald-500',
    message: 'Salvando transação...',
    spinnerClass: 'animate-pulse'
  },
  search: {
    icon: Search,
    color: 'text-indigo-500',
    message: 'Buscando...',
    spinnerClass: 'animate-spin'
  },
  auth: {
    icon: Check,
    color: 'text-blue-500',
    message: 'Autenticando...',
    spinnerClass: 'animate-spin'
  }
};

// Componente principal de loading
export const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  message,
  progress,
  size = 'md',
  className = ''
}) => {
  const config = loadingConfigs[type];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };
  
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <Icon 
        className={`${sizeClasses[size]} ${config.color} ${config.spinnerClass}`}
      />
      <div className="flex-1">
        <p className={`${textSizeClasses[size]} font-medium text-gray-700 dark:text-gray-200`}>
          {message || config.message}
        </p>
        {progress !== undefined && (
          <div className="mt-2 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${config.color.replace('text-', 'bg-')}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de loading inline para botões
export const InlineLoading: React.FC<{
  type: LoadingType;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ type, size = 'sm', className = '' }) => {
  const config = loadingConfigs[type];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5'
  };

  return (
    <Icon 
      className={`${sizeClasses[size]} ${config.color} ${config.spinnerClass} ${className}`}
    />
  );
};

// Componente de loading para cards
export const CardLoading: React.FC<{
  type: LoadingType;
  title?: string;
  description?: string;
  progress?: number;
  className?: string;
}> = ({ type, title, description, progress, className = '' }) => {
  const config = loadingConfigs[type];
  const Icon = config.icon;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700`}>
          <Icon className={`h-6 w-6 ${config.color} ${config.spinnerClass}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title || config.message}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
          {progress !== undefined && (
            <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${config.color.replace('text-', 'bg-')}`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de loading para mensagens de chat
export const ChatMessageLoading: React.FC<{
  avatarUrl?: string;
  message?: string;
}> = ({ avatarUrl, message = 'Stater IA está pensando...' }) => {
  return (
    <div className="flex items-start space-x-3 p-4 animate-pulse">
      <div className="flex-shrink-0">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="IA" 
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
            <Brain className="h-4 w-4 text-white animate-pulse" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {message}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para gerenciar múltiplos estados de loading
export const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});

  const setLoading = (key: string, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  };

  const isLoading = (key: string) => Boolean(loadingStates[key]);

  const isAnyLoading = () => Object.values(loadingStates).some(Boolean);

  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading
  };
};
