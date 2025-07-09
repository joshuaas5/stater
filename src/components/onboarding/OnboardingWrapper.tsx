import React, { useEffect, useState, useRef } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { useLocation } from 'react-router-dom';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const { shouldShowOnboarding, completeOnboarding, isChecking } = useOnboarding();
  const location = useLocation();
  
  // 🔧 NOVA CORREÇÃO: Controle rigoroso para evitar renderização desnecessária
  const [showOnboardingContent, setShowOnboardingContent] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🔧 NOVA CORREÇÃO: Efeito com controle rigoroso
  useEffect(() => {
    // Limpar timeout anterior
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Só mostrar onboarding se: deve mostrar, não está verificando, ainda não mostrou
    if (shouldShowOnboarding && !isChecking && !hasShown) {
      console.log('OnboardingWrapper: Preparando para mostrar onboarding...');
      
      setHasShown(true);
      
      // Delay para garantir que a renderização esteja estável
      transitionTimeoutRef.current = setTimeout(() => {
        setShowOnboardingContent(true);
        console.log('OnboardingWrapper: Onboarding content ativado');
      }, 200);
    } else if (!shouldShowOnboarding) {
      // Se não deve mostrar, esconder imediatamente
      setShowOnboardingContent(false);
      setHasShown(false);
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [shouldShowOnboarding, isChecking, hasShown]);

  const handleOnboardingComplete = () => {
    console.log('OnboardingWrapper: handleOnboardingComplete called');
    
    // Esconder onboarding imediatamente
    setShowOnboardingContent(false);
    setHasShown(false);
    
    // Completar onboarding
    completeOnboarding();
  };

  console.log('OnboardingWrapper render:', { 
    shouldShowOnboarding, 
    isChecking, 
    showOnboardingContent,
    hasShown,
    pathname: location.pathname 
  });

  // Se ainda está checando, mostrar o conteúdo principal
  if (isChecking) {
    return <>{children}</>;
  }

  // Renderizar conteúdo principal sempre, onboarding como overlay quando necessário
  return (
    <>
      {children}
      {showOnboardingContent && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
    </>
  );
};

export default OnboardingWrapper;
