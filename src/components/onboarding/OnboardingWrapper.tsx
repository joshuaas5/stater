import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const { shouldShowOnboarding, completeOnboarding } = useOnboarding();

  const handleOnboardingComplete = () => {
    console.log('OnboardingWrapper: handleOnboardingComplete called');
    completeOnboarding();
  };

  // Se deve mostrar onboarding, renderiza o onboarding sobrepondo o conteúdo
  return (
    <>
      {children}
      {shouldShowOnboarding && <OnboardingFlow onComplete={handleOnboardingComplete} />}
    </>
  );
};

export default OnboardingWrapper;
