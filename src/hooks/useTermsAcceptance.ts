import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Chave para armazenar no localStorage se os termos já foram aceitos
const TERMS_ACCEPTED_KEY = 'stater_terms_accepted';

export const useTermsAcceptance = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user } = useAuth();

  // Função para verificar aceitação dos termos
  const checkTermsAcceptance = useCallback(async (userId: string) => {
    console.log('🔍 [TERMS] Verificando aceitação de termos para usuário:', userId);
    
    try {
      // Primeiro verificamos no localStorage para evitar requisições desnecessárias
      const localTermsAccepted = localStorage.getItem(`${TERMS_ACCEPTED_KEY}_${userId}`);
      
      if (localTermsAccepted === 'true') {
        console.log('🔍 [TERMS] Termos já aceitos (localStorage)');
        setHasAcceptedTerms(true);
        setShowTermsModal(false);
        setIsChecking(false);
        return true;
      }
      
      // Se não temos no localStorage, verificamos no Supabase (se a tabela existir)
      try {
        const { data, error } = await supabase
          .from('user_terms_acceptance')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (error && error.code !== 'PGRST116') {  // PGRST116 = not found
          console.log('🔍 [TERMS] Tabela user_terms_acceptance não existe ou erro no Supabase:', error.message);
          // Assumir que não aceitou ainda
          setHasAcceptedTerms(false);
          setShowTermsModal(true);
          setIsChecking(false);
          return false;
        }
        
        if (data) {
          console.log('🔍 [TERMS] Termos já aceitos (Supabase):', data);
          // Armazenar no localStorage para futuras verificações
          localStorage.setItem(`${TERMS_ACCEPTED_KEY}_${userId}`, 'true');
          setHasAcceptedTerms(true);
          setShowTermsModal(false);
          setIsChecking(false);
          return true;
        } else {
          console.log('🔍 [TERMS] Termos não aceitos ainda');
          setHasAcceptedTerms(false);
          setShowTermsModal(true);
          setIsChecking(false);
          return false;
        }        } catch (supabaseError) {
        console.log('🔍 [TERMS] Tabela user_terms_acceptance não existe - usando apenas localStorage');
        // Se a tabela não existe, assumir que precisa aceitar
        setHasAcceptedTerms(false);
        setShowTermsModal(true);
        setIsChecking(false);
        return false;
      }
    } catch (error) {
      console.error('🔍 [TERMS] Erro ao verificar aceitação de termos:', error);
      setIsChecking(false);
      return false;
    }
  }, []);

  // Função para salvar a aceitação dos termos
  const acceptTerms = useCallback(async () => {
    if (!user) return false;
    
    setIsChecking(true);
    
    try {
      console.log('🔍 [TERMS] Salvando aceitação de termos para:', user.id);
      
      // Salvar no localStorage primeiro (sempre funciona)
      localStorage.setItem(`${TERMS_ACCEPTED_KEY}_${user.id}`, 'true');
      console.log('🔍 [TERMS] Termos salvos no localStorage');
      
      // Tentar salvar no Supabase (pode falhar se tabela não existir)
      try {
        const { error } = await supabase
          .from('user_terms_acceptance')
          .upsert([
            { 
              user_id: user.id,
              accepted_at: new Date().toISOString(),
              version: '1.0', // Versão atual dos termos
            }
          ], {
            onConflict: 'user_id'
          });
        
        if (error) {
          console.log('🔍 [TERMS] Aviso - erro ao salvar no Supabase (tabela pode não existir):', error.message);
          // Não retornar erro - localStorage já foi salvo
        } else {
          console.log('🔍 [TERMS] Termos salvos no Supabase também');
        }
      } catch (supabaseError) {
        console.log('🔍 [TERMS] Tabela user_terms_acceptance não existe no Supabase - usando apenas localStorage');
      }
      
      setHasAcceptedTerms(true);
      setShowTermsModal(false);
      setIsChecking(false);
      
      return true;
    } catch (error) {
      console.error('🔍 [TERMS] Erro ao aceitar termos:', error);
      setIsChecking(false);
      return false;
    }
  }, [user]);

  // Limpar o estado se necessário (ex: logout)
  const clearTermsState = useCallback(() => {
    setHasAcceptedTerms(null);
    setShowTermsModal(false);
  }, []);

  // Efeito para verificar aceitação quando o usuário muda
  useEffect(() => {
    // Verificar se devemos parar a verificação
    const stopCheck = () => {
      const shouldStop = localStorage.getItem('manual_logout') === 'true';
      if (shouldStop) {
        console.log('🔍 [TERMS] Parando verificação - logout manual detectado');
        clearTermsState();
        setIsChecking(false);
        return true;
      }
      return false;
    };

    // Listener para parar verificação forçadamente
    const handleForceStop = () => {
      console.log('🔍 [TERMS] Parando verificação forçadamente');
      clearTermsState();
      setIsChecking(false);
    };

    window.addEventListener('force-stop-terms-check', handleForceStop);

    if (user?.id && !stopCheck()) {
      // Verificar se já temos informação no localStorage primeiro
      const localTermsAccepted = localStorage.getItem(`${TERMS_ACCEPTED_KEY}_${user.id}`);
      
      if (localTermsAccepted === 'true') {
        console.log('🔍 [TERMS] Termos já aceitos (localStorage - useEffect)');
        setHasAcceptedTerms(true);
        setShowTermsModal(false);
        setIsChecking(false);
      } else {
        // Não temos no localStorage, precisamos verificar no Supabase
        // Mas só fazemos isso UMA VEZ após o login
        if (hasAcceptedTerms === null) {
          checkTermsAcceptance(user.id);
        }
      }
    } else {
      // Sem usuário, resetar estado
      clearTermsState();
      setIsChecking(false);
    }

    return () => {
      window.removeEventListener('force-stop-terms-check', handleForceStop);
    };
  }, [user, checkTermsAcceptance, clearTermsState]); // Removido hasAcceptedTerms da dependência

  return {
    hasAcceptedTerms: !!hasAcceptedTerms, // Converter para booleano
    showTermsModal,
    isChecking,
    acceptTerms,
    clearTermsState
  };
};
