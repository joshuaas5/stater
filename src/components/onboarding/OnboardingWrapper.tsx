import React from 'react';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

interface OnboardingWrapperProps {
  children: React.ReactNode;
}

export const OnboardingWrapper: React.FC<OnboardingWrapperProps> = ({ children }) => {
  const { shouldShowOnboarding, completeOnboarding, isChecking } = useOnboarding();

  console.log('[WRAPPER] Estado:', { shouldShowOnboarding, isChecking });

  const handleOnboardingComplete = () => {
    console.log('[WRAPPER] Onboarding completo!');
    completeOnboarding();
  };

  // Sempre renderiza children, onboarding como overlay
  return (
    <>
      {children}
      {shouldShowOnboarding && !isChecking && (
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      )}
    </>
  );
};

export default OnboardingWrapper;
