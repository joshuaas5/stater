import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export const useTermsAcceptance = () => {
  // 🔥 HOOK COMPLETAMENTE DESABILITADO PARA RESOLVER LOOP INFINITO
  const [hasAcceptedTerms] = useState(true);  // ← SEMPRE TRUE
  const [showTermsModal] = useState(false);   // ← SEMPRE FALSE
  const [isChecking] = useState(false);       // ← SEMPRE FALSE
  const { user } = useAuth();

  // 🔥 FUNÇÃO VAZIA - NÃO FAZ NADA
  const acceptTerms = useCallback(async () => {
    console.log('🔍 [TERMS] Hook completamente desabilitado - termos sempre aceitos');
    return true;
  }, []);

  // 🔥 FUNÇÃO VAZIA - NÃO FAZ NADA
  const clearTermsState = useCallback(() => {
    console.log('🔍 [TERMS] clearTermsState - hook desabilitado');
  }, []);

  // 🔥 USEEFFECT VAZIO - NÃO EXECUTA NADA
  useEffect(() => {
    console.log('🔍 [TERMS] Hook completamente desabilitado - não executando verificações');
    // NÃO FAZ NADA - hook desabilitado
  }, [user]); // Apenas para evitar warnings

  return {
    hasAcceptedTerms: true,   // ← SEMPRE TRUE - termos sempre aceitos
    showTermsModal: false,    // ← SEMPRE FALSE - nunca mostra modal
    isChecking: false,        // ← SEMPRE FALSE - nunca está checando
    acceptTerms,              // ← FUNÇÃO VAZIA
    clearTermsState           // ← FUNÇÃO VAZIA
  };
};
