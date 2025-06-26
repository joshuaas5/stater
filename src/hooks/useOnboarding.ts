import { useState, useEffect } from 'react';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = () => {
      try {
        const hasSeenOnboarding = localStorage.getItem('ictus_onboarding_completed');
        const isFirstVisit = !hasSeenOnboarding;
        
        // Mostrar onboarding apenas se for primeira visita
        setShowOnboarding(isFirstVisit);
      } catch (error) {
        console.error('Erro ao verificar status do onboarding:', error);
        // Em caso de erro, mostrar onboarding por segurança
        setShowOnboarding(true);
      } finally {
        setIsChecking(false);
      }
    };

    // Pequeno delay para evitar flash
    const timer = setTimeout(checkOnboardingStatus, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem('ictus_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem('ictus_onboarding_completed');
    setShowOnboarding(true);
  };
  return {
    shouldShowOnboarding: showOnboarding,
    showOnboarding,
    isChecking,
    completeOnboarding,
    resetOnboarding
  };
};
