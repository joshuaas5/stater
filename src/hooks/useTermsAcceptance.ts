import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useTermsAcceptance = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    let isAborted = false; // Flag para cancelar verificação em andamento
    
    const checkTermsAcceptance = async () => {
      try {
        console.log('🔍 [TERMS DEBUG] Iniciando verificação...');
        
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
        
        // PRIORIDADE 2: Só verificar termos se o usuário estiver REALMENTE logado e carregado
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
      setShowTermsModal(false);
      setHasAcceptedTerms(false);
      setIsChecking(false);
    };
    
    window.addEventListener('force-stop-terms-check', handleForceStop);

    // Pequeno delay para evitar flash e garantir que user esteja pronto
    const timer = setTimeout(checkTermsAcceptance, 300);
    
    return () => {
      clearTimeout(timer);
      isAborted = true;
      window.removeEventListener('force-stop-terms-check', handleForceStop);
    };
  }, [user, loading]);

  const acceptTerms = async () => {
    console.log('✅ [TERMS DEBUG] acceptTerms chamado');
    if (!user?.id) {
      console.error('❌ [TERMS DEBUG] Usuário não encontrado para salvar aceite dos termos');
      setShowTermsModal(false);
      return false;
    }

    try {
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
      
      return true;
    } catch (error) {
      console.error('❌ [TERMS DEBUG] Erro ao aceitar termos:', error);
      // Mesmo com erro, manter estado local positivo se localStorage funcionou
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
