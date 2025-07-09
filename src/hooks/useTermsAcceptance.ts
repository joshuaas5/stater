import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

// Chave para armazenar no localStorage se os termos já foram aceitos
const TERMS_ACCEPTED_KEY = 'stater_terms_accepted';
// RESET ÚNICO - versão dos termos que força reaceitação
const TERMS_VERSION = '2025_01_09'; // Data do reset único

export const useTermsAcceptance = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const { user } = useAuth();

  // Função para verificar aceitação dos termos
  const checkTermsAcceptance = useCallback(async (userId: string) => {
    console.log('🔍 [TERMS] Verificando aceitação de termos para usuário:', userId);
    
    try {
      // PRIMEIRO: Verificar se é a nova versão dos termos
      const localTermsAccepted = localStorage.getItem(`${TERMS_ACCEPTED_KEY}_${userId}_${TERMS_VERSION}`);
      
      if (localTermsAccepted === 'true') {
        console.log('🔍 [TERMS] Termos da nova versão já aceitos (localStorage)');
        setHasAcceptedTerms(true);
        setShowTermsModal(false);
        setIsChecking(false);
        return true;
      }
      
      // RESET ÚNICO: Verificar se há versão antiga e removê-la
      const oldTermsKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(`${TERMS_ACCEPTED_KEY}_${userId}`) && 
        !key.includes(TERMS_VERSION)
      );
      
      if (oldTermsKeys.length > 0) {
        console.log('🔍 [TERMS] Removendo versões antigas dos termos para forçar reaceitação');
        oldTermsKeys.forEach(key => localStorage.removeItem(key));
      }
      
      // Se não temos a nova versão aceita, verificamos no Supabase (se a tabela existir)
      try {
        const { data, error } = await supabase
          .from('user_terms_acceptance')
          .select('*')
          .eq('user_id', userId)
          .eq('version', TERMS_VERSION) // Verificar apenas a nova versão
          .single();
        
        if (error && error.code !== 'PGRST116') {  // PGRST116 = not found
          console.log('🔍 [TERMS] Erro 406 ou outro na tabela user_terms_acceptance:', error.message);
          // Para erro 406 (Not Acceptable), tratar como se termos não foram aceitos
          setHasAcceptedTerms(false);
          setShowTermsModal(true);
          setIsChecking(false);
          return false;
        }
        
        if (data) {
          console.log('🔍 [TERMS] Termos da nova versão já aceitos (Supabase):', data);
          // Armazenar no localStorage para futuras verificações
          localStorage.setItem(`${TERMS_ACCEPTED_KEY}_${userId}_${TERMS_VERSION}`, 'true');
          setHasAcceptedTerms(true);
          setShowTermsModal(false);
          setIsChecking(false);
          return true;
        } else {
          console.log('🔍 [TERMS] Termos da nova versão não aceitos ainda');
          setHasAcceptedTerms(false);
          setShowTermsModal(true);
          setIsChecking(false);
          return false;
        }
      } catch (supabaseError) {
        console.log('🔍 [TERMS] Tabela user_terms_acceptance não existe - mostrando termos');
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
      
      // Salvar no localStorage primeiro (sempre funciona) com nova versão
      localStorage.setItem(`${TERMS_ACCEPTED_KEY}_${user.id}_${TERMS_VERSION}`, 'true');
      console.log('🔍 [TERMS] Termos salvos no localStorage com nova versão');
      
      // Tentar salvar no Supabase (pode falhar se tabela não existir)
      try {
        const { error } = await supabase
          .from('user_terms_acceptance')
          .upsert([
            { 
              user_id: user.id,
              accepted_at: new Date().toISOString(),
              version: TERMS_VERSION, // Nova versão dos termos
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
      
      // CORREÇÃO: NÃO redirecionar - deixar o fluxo normal funcionar
      console.log('🔍 [TERMS] Termos aceitos - seguindo fluxo normal (sem redirecionamento forçado)');
      
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
    // 🔧 NOVA CORREÇÃO: Função de limpeza e controle
    const cleanup = () => {
      setHasAcceptedTerms(null);
      setShowTermsModal(false);
      setIsChecking(false);
    };

    // Verificar se devemos parar a verificação
    const shouldStop = localStorage.getItem('manual_logout') === 'true';
    if (shouldStop) {
      console.log('🔍 [TERMS] Parando verificação - logout manual detectado');
      cleanup();
      return;
    }

    // Listener para parar verificação forçadamente
    const handleForceStop = () => {
      console.log('🔍 [TERMS] Parando verificação forçadamente');
      cleanup();
    };

    window.addEventListener('force-stop-terms-check', handleForceStop);

    // 🔧 NOVA CORREÇÃO: Só verificar se temos usuário E ainda não verificamos
    if (user?.id && hasAcceptedTerms === null) {
      console.log('🔍 [TERMS] Iniciando verificação única para usuário:', user.id);
      
      // Verificar localStorage primeiro (cache rápido)
      const localTermsAccepted = localStorage.getItem(`${TERMS_ACCEPTED_KEY}_${user.id}_${TERMS_VERSION}`);
      
      if (localTermsAccepted === 'true') {
        console.log('🔍 [TERMS] Termos da nova versão já aceitos (cache localStorage)');
        setHasAcceptedTerms(true);
        setShowTermsModal(false);
        setIsChecking(false);
      } else {
        // Só verificar no Supabase se não temos cache local
        console.log('🔍 [TERMS] Cache não encontrado - verificando no Supabase');
        checkTermsAcceptance(user.id);
      }
    } else if (!user) {
      // Sem usuário, resetar estado imediatamente
      cleanup();
    }

    return () => {
      window.removeEventListener('force-stop-terms-check', handleForceStop);
    };
  }, [user?.id, checkTermsAcceptance]); // 🔧 CRÍTICO: removido hasAcceptedTerms das dependências para evitar loops

  return {
    hasAcceptedTerms: hasAcceptedTerms === true, // Exportar como booleano
    showTermsModal,
    isChecking,
    acceptTerms,
    clearTermsState
  };
};
