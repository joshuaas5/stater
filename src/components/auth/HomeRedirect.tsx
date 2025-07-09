import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HomePage from '@/pages/HomePage';

const HomeRedirect: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se o usuário está autenticado, redirecionar para dashboard
    if (user) {
      console.log('🏠 [HOME] Usuário autenticado detectado, redirecionando para dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Se não há usuário, mostrar a homepage normal
  if (!user) {
    return <HomePage />;
  }

  // Se há usuário, não mostrar nada (vai redirecionar)
  return null;
};

export default HomeRedirect;
