
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '@/utils/localStorage';
import ChatPage from './ChatPage';

const Index: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Verificar se o usuário está logado
    if (!isLoggedIn()) {
      navigate('/login');
    }
  }, [navigate]);

  // Usar a página de Chat como página principal
  return <ChatPage />;
};

export default Index;
