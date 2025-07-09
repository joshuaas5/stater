import React, { useEffect, useState } from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { useLocation } from 'react-router-dom';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const { shouldShowOnboarding, completeOnboarding, isChecking } = useOnboarding();
  const location = useLocation();
  // Adicionamos um estado local para prevenir flash do onboarding
  const [showOnboardingContent, setShowOnboardingContent] = useState(false);

  // Adicionamos um efeito para lidar com a transição suave
  useEffect(() => {
    // Se deve mostrar onboarding e não está verificando, iniciar a transição
    if (shouldShowOnboarding && !isChecking) {
      // Pequeno delay para garantir que renderização do fundo esteja pronta
      const timer = setTimeout(() => {
        setShowOnboardingContent(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setShowOnboardingContent(false);
    }
  }, [shouldShowOnboarding, isChecking]);

  const handleOnboardingComplete = () => {
    console.log('OnboardingWrapper: handleOnboardingComplete called');
    completeOnboarding();
    setShowOnboardingContent(false);
  };

  console.log('OnboardingWrapper render:', { 
    shouldShowOnboarding, 
    isChecking, 
    showOnboardingContent,
    pathname: location.pathname 
  });

  // Se ainda está checando, mostrar o conteúdo principal enquanto verifica
  if (isChecking) {
    return <>{children}</>;
  }

  // Se deve mostrar onboarding, renderiza o onboarding sobrepondo o conteúdo
  // mas só após o estado de transição estar pronto
  return (
    <>
      {children}
      {shouldShowOnboarding && showOnboardingContent && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
    </>
  );
};

export default OnboardingWrapper;
