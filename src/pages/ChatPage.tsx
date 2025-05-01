
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '@/utils/localStorage';
import { Redirect } from 'react-router-dom';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para o consultor financeiro
    navigate('/financial-advisor');
  }, [navigate]);

  return null; // Este componente não renderiza nada, apenas redireciona
};

export default ChatPage;
