import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      console.log('[ONBOARDING] Iniciando verificacao...', { user: user?.id, loading });
      
      // Aguardar auth carregar
      if (loading) {
        console.log('[ONBOARDING] Auth ainda carregando...');
        return;
      }
      
      // Sem usuario = sem onboarding
      if (!user) {
        console.log('[ONBOARDING] Sem usuario logado');
        setShowOnboarding(false);
        setIsChecking(false);
        return;
      }

      // FALLBACK: verificar localStorage (funciona offline)
      const localKey = 'stater_onboarding_completed_' + user.id;
      if (localStorage.getItem(localKey) === 'true') {
        console.log('[ONBOARDING] Ja completou (localStorage)');
        setShowOnboarding(false);
        setIsChecking(false);
        return;
      }

      try {
        console.log('[ONBOARDING] Verificando no Supabase para user:', user.id);
        
        // Verificar no Supabase se usuario ja completou onboarding
        const { data, error } = await supabase
          .from('user_onboarding')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        console.log('[ONBOARDING] Resposta Supabase:', { data, error });

        // PGRST116 = nao encontrou registro = usuario nunca fez onboarding
        if (error && error.code === 'PGRST116') {
          console.log('[ONBOARDING] Usuario sem registro - MOSTRAR ONBOARDING!');
          setShowOnboarding(true);
          setIsChecking(false);
          return;
        }

        // Outro erro = mostrar onboarding por seguranca
        if (error) {
          console.log('[ONBOARDING] Erro desconhecido, mostrando onboarding:', error);
          setShowOnboarding(true);
          setIsChecking(false);
          return;
        }

        // Tem registro - verificar se completou
        const completed = data?.onboarding_completed === true;
        console.log('[ONBOARDING] Status:', completed ? 'JA COMPLETOU' : 'NAO COMPLETOU - MOSTRAR');
        
        setShowOnboarding(!completed);
        setIsChecking(false);
        
      } catch (err) {
        console.error('[ONBOARDING] Erro geral:', err);
        setShowOnboarding(true);
        setIsChecking(false);
      }
    };

    checkOnboardingStatus();
  }, [user, loading]);

  const completeOnboarding = async () => {
    console.log('[ONBOARDING] Completando onboarding...');
    
    if (!user?.id) {
      console.error('[ONBOARDING] Sem usuario para salvar');
      setShowOnboarding(false);
      return;
    }

    try {
      setShowOnboarding(false);
      
      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('[ONBOARDING] Erro ao salvar:', error);
      } else {
        console.log('[ONBOARDING] Salvo com sucesso!');
      }
      
      localStorage.setItem(`stater_onboarding_completed_${user.id}`, 'true');
      
    } catch (err) {
      console.error('[ONBOARDING] Erro geral ao salvar:', err);
    }
  };

  const resetOnboarding = async () => {
    if (!user?.id) return;
    
    try {
      await supabase
        .from('user_onboarding')
        .delete()
        .eq('user_id', user.id);
      
      localStorage.removeItem(`stater_onboarding_completed_${user.id}`);
      setShowOnboarding(true);
      console.log('[ONBOARDING] Reset completo!');
    } catch (err) {
      console.error('[ONBOARDING] Erro ao resetar:', err);
    }
  };

  return {
    shouldShowOnboarding: showOnboarding,
    showOnboarding,
    isChecking,
    completeOnboarding,
    resetOnboarding
  };
};

export default useOnboarding;
