import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HomePage from '@/pages/HomePage';

const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // 🔧 CORREÇÃO: Evitar múltiplos redirects
    if (loading || hasRedirected) {
      return;
    }

    // Se o usuário está autenticado, redirecionar para dashboard
    if (user) {
      console.log('🏠 [HOME] Usuário autenticado detectado, redirecionando para dashboard...');
      setHasRedirected(true);
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate, hasRedirected]);

  // Mostrar loading enquanto carrega
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-galileo-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-galileo-accent"></div>
      </div>
    );
  }

  // Se não há usuário, mostrar a homepage normal
  if (!user && !hasRedirected) {
    return <HomePage />;
  }

  // Se já redirecionou ou está redirecionando, não mostrar nada
  return null;
};

export default HomeRedirect;
