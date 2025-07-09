import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user, loading } = useAuth();
  
  // 🔧 NOVA CORREÇÃO: Controle para evitar verificações múltiplas
  const hasCheckedRef = useRef(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        console.log('🔍 [ONBOARDING DEBUG] Iniciando verificação única...');
        
        // VERIFICAR SE É LOGOUT MANUAL PRIMEIRO
        const isManualLogout = localStorage.getItem('manual_logout') === 'true';
        if (isManualLogout) {
          console.log('🔍 [ONBOARDING DEBUG] Logout manual detectado - abortando verificação');
          setShowOnboarding(false);
          setIsChecking(false);
          return;
        }
        
        // Só verificar onboarding se o usuário estiver logado e auth não estiver carregando
        if (!user || loading) {
          console.log('🔍 [ONBOARDING DEBUG] Usuário não logado ou loading, escondendo onboarding');
          setShowOnboarding(false);
          setIsChecking(false);
          return;
        }

        console.log('🔍 [ONBOARDING DEBUG] Verificando para usuário:', user.id);

        // Verificar localStorage primeiro para resposta imediata (cache)
        const localKey = `stater_onboarding_completed_${user.id}`;
        const localCompleted = localStorage.getItem(localKey) === 'true';
        
        if (localCompleted) {
          console.log('🔍 [ONBOARDING DEBUG] Onboarding já completo no localStorage (cache)');
          setShowOnboarding(false);
          setIsChecking(false);
          return;
        }

        // Verificar no Supabase se o usuário já completou o onboarding
        const { data: onboardingData, error } = await supabase
          .from('user_onboarding')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
          console.error('❌ [ONBOARDING DEBUG] Erro ao buscar dados do onboarding:', error);
          // Em caso de erro, verificar localStorage como fallback
          const hasCompletedFallback = localStorage.getItem(localKey) === 'true';
          setShowOnboarding(!hasCompletedFallback);
          setIsChecking(false);
          return;
        }

        const hasCompletedOnboarding = onboardingData?.onboarding_completed || false;
        
        // Se completou no Supabase, salvar cache no localStorage
        if (hasCompletedOnboarding) {
          localStorage.setItem(localKey, 'true');
        }
        
        const shouldShow = !hasCompletedOnboarding;
        
        console.log('🔍 [ONBOARDING DEBUG] Status final:', { 
          userId: user.id, 
          hasCompletedOnboarding,
          shouldShow
        });
        
        setShowOnboarding(shouldShow);
      } catch (error) {
        console.error('❌ [ONBOARDING DEBUG] Erro geral ao verificar status do onboarding:', error);
        setShowOnboarding(false);
      } finally {
        setIsChecking(false);
        hasCheckedRef.current = true;
        console.log('🔍 [ONBOARDING DEBUG] Verificação concluída');
      }
    };

    // Listener para parar verificação forçadamente
    const handleForceStop = () => {
      console.log('🔍 [ONBOARDING] Parando verificação forçadamente');
      setShowOnboarding(false);
      setIsChecking(false);
      hasCheckedRef.current = true;
    };

    window.addEventListener('force-stop-terms-check', handleForceStop);
    window.addEventListener('force-stop-onboarding-check', handleForceStop);

    // Verificar logout manual antes de qualquer operação
    const isManualLogout = localStorage.getItem('manual_logout') === 'true';
    if (isManualLogout) {
      console.log('🔍 [ONBOARDING] Logout manual detectado - abortando tudo');
      setShowOnboarding(false);
      setIsChecking(false);
      hasCheckedRef.current = true;
      window.removeEventListener('force-stop-terms-check', handleForceStop);
      window.removeEventListener('force-stop-onboarding-check', handleForceStop);
      return;
    }

    // 🔧 CRÍTICO: Só verificar UMA VEZ quando usuário estiver pronto e não verificamos ainda
    if (user && !loading && !hasCheckedRef.current) {
      // Limpar timeout anterior
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      
      // Delay para garantir que auth está estável
      checkTimeoutRef.current = setTimeout(checkOnboardingStatus, 500);
    } else if (!user) {
      // Sem usuário, limpar estados
      setShowOnboarding(false);
      setIsChecking(false);
      hasCheckedRef.current = false;
    }
    
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      window.removeEventListener('force-stop-terms-check', handleForceStop);
      window.removeEventListener('force-stop-onboarding-check', handleForceStop);
    };
  }, [user?.id, loading]); // 🔧 CRÍTICO: Dependências mínimas para evitar loops

  const completeOnboarding = async () => {
    console.log('✅ [ONBOARDING DEBUG] completeOnboarding chamado');
    if (!user?.id) {
      console.error('❌ [ONBOARDING DEBUG] Usuário não encontrado para salvar onboarding');
      setShowOnboarding(false);
      return;
    }

    try {
      // PASSO 1: Atualizar estado local IMEDIATAMENTE
      setShowOnboarding(false);
      console.log('✅ [ONBOARDING DEBUG] setShowOnboarding(false) executado imediatamente');
      
      // PASSO 2: Inserir ou atualizar o registro de onboarding no Supabase
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
        // Mesmo com erro, manter o estado local como concluído
      } else {
        console.log('✅ [ONBOARDING DEBUG] Onboarding salvo com sucesso no Supabase para user:', user.id);
        console.log('✅ [ONBOARDING DEBUG] Dados salvos:', data);
      }
      
      // PASSO 3: Salvar também no localStorage como backup/cache
      const localKey = `stater_onboarding_completed_${user.id}`;
      localStorage.setItem(localKey, 'true');
      console.log('✅ [ONBOARDING DEBUG] Onboarding salvo em localStorage como backup');
      
    } catch (error) {
      console.error('❌ [ONBOARDING DEBUG] Erro geral ao salvar onboarding:', error);
      // Mesmo com erro, manter estado local positivo
    }
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

export default useOnboarding;
