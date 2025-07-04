import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useTermsAcceptance = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user, loading } = useAuth();

  useEffect(() => {
    const checkTermsAcceptance = async () => {
      try {
        console.log('🔍 [TERMS DEBUG] Iniciando verificação...');
        
        // Só verificar termos se o usuário estiver logado
        if (!user || loading) {
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

    // Pequeno delay para evitar flash e garantir que user esteja pronto
    const timer = setTimeout(checkTermsAcceptance, 300);
    
    return () => clearTimeout(timer);
  }, [user, loading]);

  const acceptTerms = async () => {
    console.log('✅ [TERMS DEBUG] acceptTerms chamado');
    if (!user?.id) {
      console.error('❌ [TERMS DEBUG] Usuário não encontrado para salvar aceite dos termos');
      setShowTermsModal(false);
      return false;
    }

    try {
      // Tentar inserir no Supabase primeiro
      const { data, error } = await supabase
        .from('user_terms_acceptance')
        .upsert({
          user_id: user.id,
          accepted_at: new Date().toISOString(),
          version: '1.0', // Versão atual dos termos
          user_agent: navigator.userAgent,
          ip_address: 'client' // Placeholder - em produção seria obtido pelo backend
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.warn('⚠️ [TERMS DEBUG] Erro ao salvar no Supabase, usando fallback localStorage:', error);
        // Fallback para localStorage se a tabela não existir
        const localKey = `stater_terms_accepted_${user.id}`;
        localStorage.setItem(localKey, 'true');
        console.log('✅ [TERMS DEBUG] Aceite dos termos salvo em localStorage para user:', user.id);
      } else {
        console.log('✅ [TERMS DEBUG] Aceite dos termos salvo com sucesso no Supabase para user:', user.id);
        console.log('✅ [TERMS DEBUG] Dados salvos:', data);
      }
      
      setHasAcceptedTerms(true);
      setShowTermsModal(false);
      return true;
    } catch (error) {
      console.error('❌ [TERMS DEBUG] Erro ao aceitar termos:', error);
      return false;
    }
  };

  return {
    hasAcceptedTerms,
    showTermsModal,
    isChecking,
    acceptTerms
  };
};
