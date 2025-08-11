import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTermsAcceptance } from '@/hooks/useTermsAcceptance';
import { TermsModal } from '@/components/terms/TermsModal';

interface TermsWrapperProps {
  children: React.ReactNode;
}

export const TermsWrapper: React.FC<TermsWrapperProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showTermsModal, isChecking, acceptTerms, hasAcceptedTerms } = useTermsAcceptance();

  // Páginas públicas que não precisam de verificação de termos
  const publicPages = ['/login', '/reset-password', '/privacy', '/terms', '/test'];
  const isPublicPage = publicPages.includes(location.pathname);

  useEffect(() => {
    // Se o usuário está logado (termos aceitos) e está na HomePage ('/'),
    // redireciona para o dashboard. Isso lida com o cenário pós-login.
    if (location.pathname === '/' && hasAcceptedTerms && !isChecking) {
      console.log('🚀 [TERMS WRAPPER] Usuário logado na HomePage, redirecionando para o dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, hasAcceptedTerms, isChecking, navigate]);

  const handleAcceptTerms = async () => {
    console.log('✅ [TERMS WRAPPER] Aceitando termos...');
    
    try {
      const success = await acceptTerms();
      
      if (!success) {
        console.error('❌ [TERMS WRAPPER] Falha ao aceitar termos');
        return;
      }
      
      console.log('✅ [TERMS WRAPPER] Termos aceitos com sucesso');
      
    } catch (error) {
      console.error('❌ [TERMS WRAPPER] Erro ao aceitar termos:', error);
    }
  };

  // Se for a página inicial para um usuário logado, mostre um loader enquanto redireciona
  if (location.pathname === '/' && hasAcceptedTerms && !isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-galileo-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-galileo-accent"></div>
      </div>
    );
  }

  // Para outras páginas públicas, renderizar sempre
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Enquanto verifica o status dos termos para páginas privadas, mostrar indicador de carregamento
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen bg-galileo-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-galileo-accent"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => {
          // Não permitir fechar o modal sem aceitar os termos
          console.log('⚠️ [TERMS WRAPPER] Tentativa de fechar modal sem aceitar termos');
        }}
        onAccept={handleAcceptTerms}
      />
    </>
  );
};

export default TermsWrapper;
