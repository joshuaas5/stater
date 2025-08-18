import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import AuthLoadingScreen from './AuthLoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Componente para proteger rotas baseado no estado de autenticação
 * - Se requireAuth=true: redireciona para login se não autenticado
 * - Se requireAuth=false: redireciona para dashboard se autenticado
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { isAuthenticated, isLoading } = useAuthGuard();

  // Exibe tela de carregamento durante verificação
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  // Lógica de redirecionamento
  if (requireAuth && !isAuthenticated) {
    // Usuário não autenticado tentando acessar rota protegida
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // Usuário autenticado tentando acessar rota pública (login/home)
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
