import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useTermsAcceptance = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { user, loading } = useAuth();

  // 🧹 Função para limpar estado dos termos durante logout
  const clearTermsState = useCallback(() => {
    console.log('🧹 [TERMS DEBUG] Limpando estado dos termos...');
    setHasAcceptedTerms(false);
    setShowTermsModal(false);
    setIsChecking(false);
    setHasInitialized(false);
    
    // Remover flags temporárias (mas manter flags permanentes de verificação)
    localStorage.removeItem('accepting_terms');
    localStorage.removeItem('just_accepted_terms');
    localStorage.removeItem('onboarding_in_progress');
  }, []);

  const checkTermsAcceptance = useCallback(async () => {
    try {
      console.log('🔍 [TERMS DEBUG] Iniciando verificação (ÚNICA VEZ)...');
      
      // PROTEÇÃO 0: Evitar múltiplas execuções durante inicialização
      if (!hasInitialized && (loading || !user)) {
        console.log('🔍 [TERMS DEBUG] Aguardando inicialização completa...');
        setIsChecking(false);
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
      
      // PRIORIDADE 2: Só verificar termos se o usuário estiver REALMENTE logado e carregado
      if (!user || loading || !user.id) {
        console.log('🔍 [TERMS DEBUG] Usuário não logado ou loading, escondendo modal');
        setShowTermsModal(false);
        setHasAcceptedTerms(false);
        setIsChecking(false);
        return;
      }

      // 🎯 NOVA LÓGICA: VERIFICAÇÃO ÚNICA POR USUÁRIO NA VIDA
      const termsCheckedKey = `terms_checked_${user.id}`;
      const alreadyChecked = localStorage.getItem(termsCheckedKey);
      
      if (alreadyChecked === 'true') {
        console.log('🔍 [TERMS DEBUG] ✅ Usuário já foi verificado anteriormente, NUNCA MAIS verificar');
        const localKey = `stater_terms_accepted_${user.id}`;
        const hasAccepted = localStorage.getItem(localKey) === 'true';
        
        setHasAcceptedTerms(hasAccepted);
        setShowTermsModal(!hasAccepted); // Só mostra se não aceitou ainda
        setIsChecking(false);
        return;
      }

      console.log('🔍 [TERMS DEBUG] 🆕 PRIMEIRA VEZ verificando este usuário...');

      // Verificar no Supabase se o usuário já aceitou os termos
      const { data: termsData, error } = await supabase
        .from('user_terms_acceptance')
        .select('accepted_at, version')
        .eq('user_id', user.id)
        .single();

      let hasAccepted = false;
      let shouldShowModal = false;

      if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
        console.warn('⚠️ [TERMS DEBUG] Erro ao buscar dados dos termos, usando fallback:', error);
        // Fallback: presumir que precisa aceitar
        hasAccepted = false;
        shouldShowModal = true;
      } else if (termsData) {
        console.log('🔍 [TERMS DEBUG] ✅ Usuário já aceitou os termos no Supabase');
        hasAccepted = true;
        shouldShowModal = false;
        // Salvar no localStorage para cache
        const localKey = `stater_terms_accepted_${user.id}`;
        localStorage.setItem(localKey, 'true');
      } else {
        console.log('🔍 [TERMS DEBUG] ⚠️ Usuário ainda não aceitou os termos');
        hasAccepted = false;
        shouldShowModal = true;
      }

      // 🎯 MARCAR QUE ESTE USUÁRIO JÁ FOI VERIFICADO (NUNCA MAIS VERIFICAR)
      localStorage.setItem(termsCheckedKey, 'true');
      console.log('🔍 [TERMS DEBUG] 🔒 Marcado como verificado, NUNCA MAIS será checado');
        
      console.log('🔍 [TERMS DEBUG] Status FINAL:', { 
        userId: user.id, 
        hasAccepted,
        shouldShowModal
      });
      
      setHasAcceptedTerms(hasAccepted);
      setShowTermsModal(shouldShowModal);
      console.log('🔍 [TERMS DEBUG] setShowTermsModal definido para:', shouldShowModal);
    } catch (error) {
      console.error('❌ [TERMS DEBUG] Erro geral ao verificar aceite dos termos:', error);
      // Em caso de erro, mostrar termos para garantir conformidade (SÓ NA PRIMEIRA VEZ)
      if (user?.id) {
        const termsCheckedKey = `terms_checked_${user.id}`;
        const alreadyChecked = localStorage.getItem(termsCheckedKey);
        
        if (alreadyChecked !== 'true') {
          setShowTermsModal(true);
          setHasAcceptedTerms(false);
          localStorage.setItem(termsCheckedKey, 'true'); // Marcar como verificado mesmo com erro
        }
      }
    } finally {
      setIsChecking(false);
      console.log('🔍 [TERMS DEBUG] isChecking definido para false');
    }
  }, [user?.id, loading, hasInitialized]);

  useEffect(() => {
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

    // 🎯 VERIFICAÇÃO ÚNICA: só roda se o usuário ainda não foi verificado
    if (user?.id) {
      const termsCheckedKey = `terms_checked_${user.id}`;
      const alreadyChecked = localStorage.getItem(termsCheckedKey);
      
      if (alreadyChecked === 'true') {
        console.log('🔍 [TERMS DEBUG] ⏩ Usuário já verificado, pulando useEffect');
        
        // Ainda precisa carregar o estado dos termos do localStorage
        const localKey = `stater_terms_accepted_${user.id}`;
        const hasAccepted = localStorage.getItem(localKey) === 'true';
        setHasAcceptedTerms(hasAccepted);
        setShowTermsModal(!hasAccepted);
        setIsChecking(false);
        return;
      }
    }

    // Listener para parar verificação durante logout
    const handleForceStop = () => {
      console.log('🔍 [TERMS DEBUG] Force stop recebido');
      setShowTermsModal(false);
      setHasAcceptedTerms(false);
      setIsChecking(false);
    };
    
    window.addEventListener('force-stop-terms-check', handleForceStop);

    // Executar verificação apenas UMA VEZ por usuário
    const timeoutId = setTimeout(checkTermsAcceptance, 500);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('force-stop-terms-check', handleForceStop);
    };
  }, [checkTermsAcceptance, hasInitialized, loading, user?.id]); // user?.id para detectar mudança de usuário

  const acceptTerms = async () => {
    console.log('✅ [TERMS DEBUG] acceptTerms chamado');
    if (!user?.id) {
      console.error('❌ [TERMS DEBUG] Usuário não encontrado para salvar aceite dos termos');
      setShowTermsModal(false);
      return false;
    }

    try {
      console.log('✅ [TERMS DEBUG] Processando aceite dos termos...');

      // Primeiro atualizar estado local IMEDIATAMENTE para evitar loops
      setHasAcceptedTerms(true);
      setShowTermsModal(false);
      console.log('✅ [TERMS DEBUG] Estados atualizados imediatamente - hasAccepted: true, showModal: false');

      // Salvar no localStorage imediatamente como backup
      const localKey = `stater_terms_accepted_${user.id}`;
      localStorage.setItem(localKey, 'true');
      console.log('✅ [TERMS DEBUG] Aceite salvo em localStorage imediatamente');

      // 🎯 MARCAR QUE ESTE USUÁRIO JÁ FOI VERIFICADO (NUNCA MAIS VERIFICAR)
      const termsCheckedKey = `terms_checked_${user.id}`;
      localStorage.setItem(termsCheckedKey, 'true');
      console.log('✅ [TERMS DEBUG] 🔒 Usuário marcado como verificado permanentemente');

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
      
      return true;
    } catch (error) {
      console.error('❌ [TERMS DEBUG] Erro ao aceitar termos:', error);
      
      // Mesmo com erro, garantir que o estado fica correto
      setHasAcceptedTerms(true);
      setShowTermsModal(false);
      
      // E marcar como verificado para não repetir
      if (user?.id) {
        const localKey = `stater_terms_accepted_${user.id}`;
        const termsCheckedKey = `terms_checked_${user.id}`;
        localStorage.setItem(localKey, 'true');
        localStorage.setItem(termsCheckedKey, 'true');
      }
      
      return true;
    }
  };

  return {
    hasAcceptedTerms,
    showTermsModal,
    isChecking,
    acceptTerms,
    clearTermsState
  };
};
