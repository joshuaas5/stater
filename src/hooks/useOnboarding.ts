import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        console.log('🔍 [ONBOARDING DEBUG] Iniciando verificação...');
        
        // Só verificar onboarding se o usuário estiver logado
        if (!user || loading) {
          console.log('🔍 [ONBOARDING DEBUG] Usuário não logado ou loading, escondendo onboarding');
          setShowOnboarding(false);
          setIsChecking(false);
          return;
        }

        console.log('🔍 [ONBOARDING DEBUG] Verificando no Supabase para usuário:', user.id);

        // Verificar no Supabase se o usuário já completou o onboarding
        const { data: onboardingData, error } = await supabase
          .from('user_onboarding')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
          console.error('❌ [ONBOARDING DEBUG] Erro ao buscar dados do onboarding:', error);
          // Em caso de erro, falhar de forma segura - não mostrar onboarding
          setShowOnboarding(false);
          setIsChecking(false);
          return;
        }

        const hasCompletedOnboarding = onboardingData?.onboarding_completed || false;
        const shouldShow = !hasCompletedOnboarding;
        
        console.log('🔍 [ONBOARDING DEBUG] Status do Supabase:', { 
          userId: user.id, 
          onboardingData,
          hasCompletedOnboarding,
          shouldShow
        });
        
        // Mostrar onboarding apenas se NÃO tiver completado E estiver logado
        setShowOnboarding(shouldShow);
        console.log('🔍 [ONBOARDING DEBUG] setShowOnboarding definido para:', shouldShow);
      } catch (error) {
        console.error('❌ [ONBOARDING DEBUG] Erro geral ao verificar status do onboarding:', error);
        // Em caso de erro, falhar de forma segura - não mostrar onboarding
        setShowOnboarding(false);
      } finally {
        setIsChecking(false);
        console.log('🔍 [ONBOARDING DEBUG] isChecking definido para false');
      }
    };

    // Pequeno delay para evitar flash e garantir que user esteja pronto
    const timer = setTimeout(checkOnboardingStatus, 300);
    
    return () => clearTimeout(timer);
  }, [user, loading]);

  const completeOnboarding = async () => {
    console.log('✅ [ONBOARDING DEBUG] completeOnboarding chamado');
    if (!user?.id) {
      console.error('❌ [ONBOARDING DEBUG] Usuário não encontrado para salvar onboarding');
      setShowOnboarding(false);
      return;
    }

    try {
      // Inserir ou atualizar o registro de onboarding no Supabase
      const { data, error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ [ONBOARDING DEBUG] Erro ao salvar onboarding no Supabase:', error);
        // Mesmo com erro, esconder o onboarding para não ficar em loop
        setShowOnboarding(false);
        return;
      }

      console.log('✅ [ONBOARDING DEBUG] Onboarding salvo com sucesso no Supabase para user:', user.id);
      console.log('✅ [ONBOARDING DEBUG] Dados salvos:', data);
      
      // Remover qualquer entrada do localStorage como cleanup (migração)
      const userOnboardingKey = `stater_onboarding_completed_${user.id}`;
      if (localStorage.getItem(userOnboardingKey)) {
        localStorage.removeItem(userOnboardingKey);
        console.log('✅ [ONBOARDING DEBUG] Limpeza: removido localStorage antigo');
      }
      
    } catch (error) {
      console.error('❌ [ONBOARDING DEBUG] Erro geral ao salvar onboarding:', error);
    }
    
    setShowOnboarding(false);
    console.log('✅ [ONBOARDING DEBUG] setShowOnboarding(false) executado');
  };

  const resetOnboarding = async () => {
    if (!user?.id) {
      console.error('❌ [ONBOARDING DEBUG] Usuário não encontrado para resetar onboarding');
      return;
    }

    try {
      // Deletar o registro do Supabase
      const { error } = await supabase
        .from('user_onboarding')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ [ONBOARDING DEBUG] Erro ao resetar onboarding no Supabase:', error);
      } else {
        console.log('✅ [ONBOARDING DEBUG] Onboarding resetado no Supabase para user:', user.id);
      }
    } catch (error) {
      console.error('❌ [ONBOARDING DEBUG] Erro geral ao resetar onboarding:', error);
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
