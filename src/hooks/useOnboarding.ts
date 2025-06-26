import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = () => {
      try {
        // Só verificar onboarding se o usuário estiver logado
        if (!user || loading) {
          setShowOnboarding(false);
          setIsChecking(false);
          return;
        }

        const hasSeenOnboarding = localStorage.getItem('ictus_onboarding_completed');
        const isFirstVisit = !hasSeenOnboarding;
        
        // Mostrar onboarding apenas se for primeira visita E estiver logado
        setShowOnboarding(isFirstVisit);
      } catch (error) {
        console.error('Erro ao verificar status do onboarding:', error);
        setShowOnboarding(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Pequeno delay para evitar flash
    const timer = setTimeout(checkOnboardingStatus, 300);
    
    return () => clearTimeout(timer);
  }, [user, loading]);

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
