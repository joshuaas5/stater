import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = () => {
      try {
        console.log('🔍 [ONBOARDING DEBUG] Iniciando verificação...');
        
        // Só verificar onboarding se o usuário estiver logado
        if (!user || loading) {
          console.log('🔍 [ONBOARDING DEBUG] Usuário não logado ou loading, escondendo onboarding');
          setShowOnboarding(false);
          setIsChecking(false);
          return;
        }

        // Usar o ID do usuário para criar uma chave única de onboarding
        const userOnboardingKey = `ictus_onboarding_completed_${user.id}`;
        const hasSeenOnboarding = localStorage.getItem(userOnboardingKey);
        const isFirstVisit = !hasSeenOnboarding;
        
        console.log('🔍 [ONBOARDING DEBUG] Status:', { 
          userId: user.id, 
          userOnboardingKey,
          hasSeenOnboarding: hasSeenOnboarding,
          hasSeenOnboardingBoolean: !!hasSeenOnboarding, 
          isFirstVisit,
          localStorage_content: Object.keys(localStorage).filter(k => k.includes('onboarding'))
        });
        
        // Mostrar onboarding apenas se for primeira visita E estiver logado
        setShowOnboarding(isFirstVisit);
        console.log('🔍 [ONBOARDING DEBUG] setShowOnboarding definido para:', isFirstVisit);
      } catch (error) {
        console.error('❌ [ONBOARDING DEBUG] Erro ao verificar status do onboarding:', error);
        setShowOnboarding(false);
      } finally {
        setIsChecking(false);
        console.log('🔍 [ONBOARDING DEBUG] isChecking definido para false');
      }
    };

    // Pequeno delay para evitar flash
    const timer = setTimeout(checkOnboardingStatus, 300);
    
    return () => clearTimeout(timer);
  }, [user, loading]);

  const completeOnboarding = () => {
    console.log('✅ [ONBOARDING DEBUG] completeOnboarding chamado');
    if (user?.id) {
      const userOnboardingKey = `ictus_onboarding_completed_${user.id}`;
      localStorage.setItem(userOnboardingKey, 'true');
      console.log('✅ [ONBOARDING DEBUG] Onboarding marcado como completo para user:', user.id);
      console.log('✅ [ONBOARDING DEBUG] Chave salva:', userOnboardingKey);
      console.log('✅ [ONBOARDING DEBUG] Valor salvo:', localStorage.getItem(userOnboardingKey));
    } else {
      console.error('❌ [ONBOARDING DEBUG] Usuário não encontrado para salvar onboarding');
    }
    setShowOnboarding(false);
    console.log('✅ [ONBOARDING DEBUG] setShowOnboarding(false) executado');
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
