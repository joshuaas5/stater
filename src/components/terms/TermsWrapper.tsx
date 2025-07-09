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

  // Efeito para redirecionar apenas quando vem de aceitação de termos (não para navegação normal)
  useEffect(() => {
    // Só redirecionar se está vindo diretamente da aceitação de termos
    // Verificamos se há uma flag específica no sessionStorage
    const justAcceptedTerms = sessionStorage.getItem('terms_just_accepted');
    
    if (!isChecking && !isPublicPage && hasAcceptedTerms && justAcceptedTerms && location.pathname !== '/dashboard') {
      console.log('🚀 [TERMS WRAPPER] Redirecionando após aceitar termos pela primeira vez...');
      // Remover a flag para não interferir na navegação futura
      sessionStorage.removeItem('terms_just_accepted');
      
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [hasAcceptedTerms, isChecking, isPublicPage, location.pathname, navigate]);

  const handleAcceptTerms = async () => {
    console.log('✅ [TERMS WRAPPER] Aceitando termos e preparando redirecionamento...');
    const success = await acceptTerms();
    
    if (!success) {
      console.error('❌ [TERMS WRAPPER] Falha ao aceitar termos');
      return;
    }
    
    // Marcar que acabamos de aceitar os termos para permitir redirecionamento
    sessionStorage.setItem('terms_just_accepted', 'true');
    
    // Redirecionar imediatamente após aceitar termos para evitar tela branca
    console.log('✅ [TERMS WRAPPER] Termos aceitos, redirecionando para dashboard...');
    navigate('/dashboard', { replace: true });
  };

  // Para páginas públicas, renderizar sempre
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
