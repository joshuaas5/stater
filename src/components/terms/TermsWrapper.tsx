import React from 'react';
import { useTermsAcceptance } from '@/hooks/useTermsAcceptance';
import { TermsModal } from '@/components/terms/TermsModal';

interface TermsWrapperProps {
  children: React.ReactNode;
}

export const TermsWrapper: React.FC<TermsWrapperProps> = ({ children }) => {
  const { showTermsModal, isChecking, acceptTerms } = useTermsAcceptance();

  const handleAcceptTerms = async () => {
    const success = await acceptTerms();
    if (!success) {
      console.error('❌ [TERMS WRAPPER] Falha ao aceitar termos');
    }
  };

  // Enquanto verifica o status dos termos, não renderizar nada para evitar flash
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
