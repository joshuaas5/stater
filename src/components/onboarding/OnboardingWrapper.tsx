import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const { shouldShowOnboarding, completeOnboarding, isChecking } = useOnboarding();

  const handleOnboardingComplete = () => {
    console.log('OnboardingWrapper: handleOnboardingComplete called');
    completeOnboarding();
  };

  console.log('OnboardingWrapper render:', { shouldShowOnboarding, isChecking });

  // Se ainda está checando, não renderiza o onboarding
  if (isChecking) {
    return <>{children}</>;
  }

  // Se deve mostrar onboarding, renderiza o onboarding sobrepondo o conteúdo
  return (
    <>
      {children}
      {shouldShowOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}
    </>
  );
};

export default OnboardingWrapper;
