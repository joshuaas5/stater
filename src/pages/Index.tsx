
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '@/utils/localStorage';
import Dashboard from './Dashboard';

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Verificar se o usuário está logado
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  // Usar a página de Dashboard como página principal
  return <Dashboard />;
};

export default Index;
