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

        // Usar o ID do usuário para criar uma chave única de onboarding
        const userOnboardingKey = `ictus_onboarding_completed_${user.id}`;
        const hasSeenOnboarding = localStorage.getItem(userOnboardingKey);
        const isFirstVisit = !hasSeenOnboarding;
        
        console.log('Onboarding check:', { 
          userId: user.id, 
          hasSeenOnboarding: !!hasSeenOnboarding, 
          isFirstVisit,
          userOnboardingKey 
        });
        
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
    if (user?.id) {
      const userOnboardingKey = `ictus_onboarding_completed_${user.id}`;
      localStorage.setItem(userOnboardingKey, 'true');
      console.log('Onboarding completed for user:', user.id);
    }
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    if (user?.id) {
      const userOnboardingKey = `ictus_onboarding_completed_${user.id}`;
      localStorage.removeItem(userOnboardingKey);
      console.log('Onboarding reset for user:', user.id);
    }
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
