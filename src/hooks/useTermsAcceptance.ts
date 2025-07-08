import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useTermsAcceptance = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(0); // Para throttling
  const { user, loading } = useAuth();

  useEffect(() => {
    let isAborted = false; // Flag para cancelar verificação em andamento
    let timeoutId: NodeJS.Timeout | null = null;
    
    const checkTermsAcceptance = async () => {
      try {
        console.log('🔍 [TERMS DEBUG] Iniciando verificação...');
        
        // Throttling: evitar execuções muito frequentes (máximo 1 por segundo)
        const now = Date.now();
        if (now - lastCheckTime < 1000) {
          console.log('🔍 [TERMS DEBUG] Throttled - muito recente, pulando');
          setIsChecking(false);
          return;
        }
        setLastCheckTime(now);
        
        // Verificar se foi cancelada
        if (isAborted) {
          console.log('🔍 [TERMS DEBUG] Verificação cancelada por abort');
          return;
        }
        
        // PRIORIDADE 1: Verificar se é um logout manual ou navegação para login
        const isManualLogout = localStorage.getItem('manual_logout') === 'true';
        const currentPath = window.location.pathname;
        const isLoginPage = currentPath === '/login' || currentPath === '/';
        
        if (isManualLogout || isLoginPage) {
          console.log('🔍 [TERMS DEBUG] Logout manual ou página de login, cancelando verificação');
          setShowTermsModal(false);
          setHasAcceptedTerms(false);
          setIsChecking(false);
          return;
        }
        
        // PRIORIDADE 2: Verificar se estamos em processo de onboarding ou aceite
        const isOnboardingInProgress = localStorage.getItem('onboarding_in_progress') === 'true';
        const isAcceptingTerms = localStorage.getItem('accepting_terms') === 'true';
        
        if (isOnboardingInProgress || isAcceptingTerms) {
          console.log('🔍 [TERMS DEBUG] Onboarding ou aceite em progresso, aguardando...');
          setIsChecking(false);
          return;
        }
        
        // PRIORIDADE 3: Só verificar termos se o usuário estiver REALMENTE logado e carregado
        if (!user || loading || !user.id) {
          console.log('🔍 [TERMS DEBUG] Usuário não logado ou loading, escondendo modal');
          setShowTermsModal(false);
          setHasAcceptedTerms(false);
          setIsChecking(false);
          return;
        }

        console.log('🔍 [TERMS DEBUG] Verificando no Supabase para usuário:', user.id);

        // Verificar no Supabase se o usuário já aceitou os termos
        const { data: termsData, error } = await supabase
          .from('user_terms_acceptance')
          .select('accepted_at, version')
          .eq('user_id', user.id)
          .single();

        let hasAccepted = false;

        if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
          console.warn('⚠️ [TERMS DEBUG] Erro ao buscar dados dos termos, usando fallback localStorage:', error);
          // Fallback para localStorage se a tabela não existir ainda
          const localKey = `stater_terms_accepted_${user.id}`;
          hasAccepted = localStorage.getItem(localKey) === 'true';
        } else {
          hasAccepted = !!termsData?.accepted_at;
        }
        const shouldShowModal = !hasAccepted;
        
        console.log('🔍 [TERMS DEBUG] Status:', { 
          userId: user.id, 
          termsData,
          hasAccepted,
          shouldShowModal,
          fallbackUsed: !!error
        });
        
        setHasAcceptedTerms(hasAccepted);
        setShowTermsModal(shouldShowModal);
        console.log('🔍 [TERMS DEBUG] setShowTermsModal definido para:', shouldShowModal);
      } catch (error) {
        console.error('❌ [TERMS DEBUG] Erro geral ao verificar aceite dos termos:', error);
        // Em caso de erro, mostrar termos para garantir conformidade
        setShowTermsModal(true);
        setHasAcceptedTerms(false);
      } finally {
        setIsChecking(false);
        console.log('🔍 [TERMS DEBUG] isChecking definido para false');
      }
    };

    // Listener para parar verificação durante logout
    const handleForceStop = () => {
      console.log('🔍 [TERMS DEBUG] Force stop recebido');
      isAborted = true;
      if (timeoutId) clearTimeout(timeoutId);
      setShowTermsModal(false);
      setHasAcceptedTerms(false);
      setIsChecking(false);
    };
    
    window.addEventListener('force-stop-terms-check', handleForceStop);

    // Usar timeout mais longo para evitar execuções repetidas durante transições
    timeoutId = setTimeout(checkTermsAcceptance, 500);
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      isAborted = true;
      window.removeEventListener('force-stop-terms-check', handleForceStop);
    };
  }, [user?.id, loading]); // Dependências mais específicas para evitar loops

  const acceptTerms = async () => {
    console.log('✅ [TERMS DEBUG] acceptTerms chamado');
    if (!user?.id) {
      console.error('❌ [TERMS DEBUG] Usuário não encontrado para salvar aceite dos termos');
      setShowTermsModal(false);
      return false;
    }

    try {
      // Marcar que está aceitando termos para evitar loops
      localStorage.setItem('accepting_terms', 'true');
      console.log('✅ [TERMS DEBUG] Marcado accepting_terms = true');

      // Primeiro atualizar estado local IMEDIATAMENTE para evitar loops
      setHasAcceptedTerms(true);
      setShowTermsModal(false);
      console.log('✅ [TERMS DEBUG] Estados atualizados imediatamente - hasAccepted: true, showModal: false');

      // Salvar no localStorage imediatamente como backup
      const localKey = `stater_terms_accepted_${user.id}`;
      localStorage.setItem(localKey, 'true');
      console.log('✅ [TERMS DEBUG] Aceite salvo em localStorage imediatamente');

      // Tentar salvar no Supabase em background (não bloquear UI)
      const { data, error } = await supabase
        .from('user_terms_acceptance')
        .upsert({
          user_id: user.id,
          accepted_at: new Date().toISOString(),
          version: '1.0',
          user_agent: navigator.userAgent,
          ip_address: 'client'
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.warn('⚠️ [TERMS DEBUG] Aviso: Erro ao salvar no Supabase (mas localStorage OK):', error);
      } else {
        console.log('✅ [TERMS DEBUG] Aceite dos termos salvo com sucesso no Supabase');
      }
      
      // Remover flag de aceite em progresso
      localStorage.removeItem('accepting_terms');
      console.log('✅ [TERMS DEBUG] Removido accepting_terms flag');
      
      return true;
    } catch (error) {
      console.error('❌ [TERMS DEBUG] Erro ao aceitar termos:', error);
      
      // Mesmo com erro, remover flag e manter estado local positivo
      localStorage.removeItem('accepting_terms');
      return true;
    }
  };

  return {
    hasAcceptedTerms,
    showTermsModal,
    isChecking,
    acceptTerms
  };
};
