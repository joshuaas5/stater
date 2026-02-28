import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
}

/**
 * Hook customizado para gerenciar o estado de autenticação
 * e evitar o "pisca-pisca" durante a verificação inicial
 */
export const useAuthGuard = (): AuthState => {
  const { user, loading } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Aguarda a verificação inicial de autenticação terminar
    if (!loading) {
      // Adiciona um pequeno delay para garantir que o estado seja estável
      const timer = setTimeout(() => {
        setIsCheckingAuth(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  return {
    isAuthenticated: !!user,
    isLoading: isCheckingAuth || loading,
    user,
  };
};
