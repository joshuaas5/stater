import React, { useEffect, useState, useRef } from 'react';
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
  
  // 🔧 NOVA CORREÇÃO: Controle rigoroso para evitar loops de redirecionamento
  const [hasRedirected, setHasRedirected] = useState(false);
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastPathRef = useRef(location.pathname);

  // Páginas públicas que não precisam de verificação de termos
  const publicPages = ['/login', '/reset-password', '/privacy', '/terms', '/test'];
  const isPublicPage = publicPages.includes(location.pathname);

  // 🔧 NOVA CORREÇÃO: Efeito com controle rigoroso de redirecionamento
  useEffect(() => {
    // Limpar timeout anterior
    if (redirectTimeoutRef.current) {
      clearTimeout(redirectTimeoutRef.current);
    }

    // Resetar flag se mudou de página
    if (lastPathRef.current !== location.pathname) {
      setHasRedirected(false);
      lastPathRef.current = location.pathname;
    }

    // Só redirecionar se: não é página pública, não está verificando, termos aceitos, não redirecionou ainda, e não está no dashboard
    if (!isPublicPage && 
        !isChecking && 
        hasAcceptedTerms && 
        !hasRedirected && 
        location.pathname !== '/dashboard') {
      
      console.log('🚀 [TERMS WRAPPER] Termos aceitos - iniciando redirecionamento controlado...');
      
      setHasRedirected(true);
      
      // Redirecionamento com delay para evitar conflitos
      redirectTimeoutRef.current = setTimeout(() => {
        console.log('🚀 [TERMS WRAPPER] Executando redirecionamento para dashboard');
        navigate('/dashboard', { replace: true });
      }, 300);
    }

    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [hasAcceptedTerms, isChecking, isPublicPage, location.pathname, navigate, hasRedirected]);

  const handleAcceptTerms = async () => {
    console.log('✅ [TERMS WRAPPER] Aceitando termos...');
    
    try {
      const success = await acceptTerms();
      
      if (!success) {
        console.error('❌ [TERMS WRAPPER] Falha ao aceitar termos');
        return;
      }
      
      console.log('✅ [TERMS WRAPPER] Termos aceitos com sucesso');
      
      // Não redirecionar imediatamente - deixar o useEffect cuidar disso
      // O redirecionamento será feito quando hasAcceptedTerms mudar
      
    } catch (error) {
      console.error('❌ [TERMS WRAPPER] Erro ao aceitar termos:', error);
    }
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
