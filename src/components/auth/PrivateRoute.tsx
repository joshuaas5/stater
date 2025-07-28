
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkComplete, setCheckComplete] = useState(false);

  // 🔧 CORREÇÃO: Aguardar verificação completa antes de redirecionar
  useEffect(() => {
    if (!loading) {
      // Pequeno delay para garantir que o AuthContext terminou de processar
      const timer = setTimeout(() => {
        setCheckComplete(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Mostrar loading enquanto carrega ou verifica
  if (loading || !checkComplete) {
    return (
      <div className="flex items-center justify-center h-screen bg-galileo-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-galileo-accent"></div>
      </div>
    );
  }

  // Se não há usuário após verificação completa, redirecionar para login
  if (!user) {
    console.log('🔒 [PRIVATE_ROUTE] Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Usuário autenticado, mostrar conteúdo protegido
  return <>{children}</>;
};

export default PrivateRoute;
