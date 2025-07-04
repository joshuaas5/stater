import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTermsAcceptance } from '@/hooks/useTermsAcceptance';
import { TermsModal } from '@/components/terms/TermsModal';

interface TermsWrapperProps {
  children: React.ReactNode;
}

export const TermsWrapper: React.FC<TermsWrapperProps> = ({ children }) => {
  const location = useLocation();
  const { showTermsModal, isChecking, acceptTerms } = useTermsAcceptance();

  // Páginas públicas que não precisam de verificação de termos
  const publicPages = ['/login', '/reset-password', '/privacy', '/terms', '/test'];
  const isPublicPage = publicPages.includes(location.pathname);

  const handleAcceptTerms = async () => {
    const success = await acceptTerms();
    if (!success) {
      console.error('❌ [TERMS WRAPPER] Falha ao aceitar termos');
    }
  };

  // Para páginas públicas, renderizar sempre
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Enquanto verifica o status dos termos para páginas privadas, não renderizar nada para evitar flash
  if (isChecking) {
    return null;
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
