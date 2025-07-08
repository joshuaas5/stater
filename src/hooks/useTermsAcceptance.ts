import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useTermsAcceptance = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastCheckTime, setLastCheckTime] = useState(0); // Para throttling
  const [hasInitialized, setHasInitialized] = useState(false); // Flag de inicialização
  const { user, loading } = useAuth();

  const checkTermsAcceptance = useCallback(async () => {
    try {
      console.log('🔍 [TERMS DEBUG] Iniciando verificação...');
      
      // PROTEÇÃO 0: Evitar múltiplas execuções durante inicialização
      if (!hasInitialized && (loading || !user)) {
        console.log('🔍 [TERMS DEBUG] Aguardando inicialização completa...');
        setIsChecking(false);
        return;
      }
      
      // PROTEÇÃO 1: Throttling - evitar execuções muito frequentes (máximo 1 por 3 segundos)
      const now = Date.now();
      if (now - lastCheckTime < 3000) {
        console.log('🔍 [TERMS DEBUG] Throttled - muito recente, pulando');
        setIsChecking(false);
        return;
      }
      setLastCheckTime(now);
      
      // PROTEÇÃO 2: Verificar se acabou de aceitar termos
      const justAcceptedTerms = localStorage.getItem('just_accepted_terms');
      if (justAcceptedTerms) {
        const timestamp = parseInt(justAcceptedTerms);
        const timeSinceAccepted = now - timestamp;
        
        if (timeSinceAccepted < 5000) { // 5 segundos
          console.log('🔍 [TERMS DEBUG] Termos aceitos recentemente, pulando verificação');
          setHasAcceptedTerms(true);
          setShowTermsModal(false);
          setIsChecking(false);
          return;
        } else {
          // Limpar flag antigo
          localStorage.removeItem('just_accepted_terms');
        }
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
      const isAcceptingTermsFlag = localStorage.getItem('accepting_terms') === 'true';
      
      if (isOnboardingInProgress || isAcceptingTermsFlag) {
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

      // Verificar localStorage primeiro para performance
      const localKey = `stater_terms_accepted_${user.id}`;
      const localAccepted = localStorage.getItem(localKey);
      
      if (localAccepted === 'true') {
        console.log('🔍 [TERMS DEBUG] Termos aceitos no localStorage');
        setHasAcceptedTerms(true);
        setShowTermsModal(false);
        setIsChecking(false);
        return;
      }

      // Verificar no Supabase se o usuário já aceitou os termos
      const { data: termsData, error } = await supabase
        .from('user_terms_acceptance')
        .select('accepted_at, version')
        .eq('user_id', user.id)
        .single();

      let hasAccepted = false;
      let shouldShowModal = false;

      if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
        console.warn('⚠️ [TERMS DEBUG] Erro ao buscar dados dos termos, usando fallback localStorage:', error);
        // Fallback para localStorage se a tabela não existir ainda
        hasAccepted = localStorage.getItem(localKey) === 'true';
      } else if (termsData) {
        hasAccepted = true;
        // Salvar no localStorage para cache
        localStorage.setItem(localKey, 'true');
      } else {
        // Usuário não aceitou ainda
        hasAccepted = false;
        shouldShowModal = true;
      }
        
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
  }, [user?.id, loading, lastCheckTime]);

  useEffect(() => {
    let isAborted = false; // Flag para cancelar verificação em andamento
    let timeoutId: NodeJS.Timeout | null = null;

    // Marcar como inicializado após o usuário estar carregado
    if (!loading && user && !hasInitialized) {
      console.log('🔍 [TERMS DEBUG] Sistema inicializado, habilitando verificações');
      setHasInitialized(true);
    }

    // Só executar verificação se estiver inicializado
    if (!hasInitialized) {
      setIsChecking(false);
      return;
    }

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
    if (!isAborted) {
      timeoutId = setTimeout(checkTermsAcceptance, 1000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      isAborted = true;
      window.removeEventListener('force-stop-terms-check', handleForceStop);
    };
  }, [checkTermsAcceptance, hasInitialized, loading, user]); // Dependência da flag de inicialização

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
      localStorage.setItem('just_accepted_terms', Date.now().toString());
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
      
      // Remover flag de aceite em progresso após um delay
      setTimeout(() => {
        localStorage.removeItem('accepting_terms');
        console.log('✅ [TERMS DEBUG] Removido accepting_terms flag');
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('❌ [TERMS DEBUG] Erro ao aceitar termos:', error);
      
      // Mesmo com erro, remover flag e manter estado local positivo
      setTimeout(() => {
        localStorage.removeItem('accepting_terms');
      }, 1000);
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
