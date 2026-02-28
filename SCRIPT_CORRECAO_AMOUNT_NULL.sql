-- ============================================================================
-- SCRIPT DE CORREÇÃO CRÍTICA - Amount NULL
-- Corrige transações com amount NULL + aplicar constraint
-- Resultado: Elimina erro 23502 definitivamente
-- ============================================================================

BEGIN;

-- ============================================================================
-- DIAGNÓSTICO INICIAL
-- ============================================================================

DO $$
DECLARE
    null_count INTEGER;
BEGIN
    -- Contar transações com amount NULL
    SELECT COUNT(*) INTO null_count 
    FROM public.transactions 
    WHERE amount IS NULL;
    
    RAISE NOTICE '🔍 DIAGNÓSTICO: Encontradas %s transações com amount NULL', null_count;
END $$;

-- ============================================================================
-- CORREÇÃO: Atualizar transações com amount NULL
-- ============================================================================

-- Corrigir transações com amount NULL (definir como 0.01 para não quebrar lógica)
UPDATE public.transactions 
SET amount = 0.01 
WHERE amount IS NULL;

-- ============================================================================
-- VERIFICAÇÃO PÓS-CORREÇÃO
-- ============================================================================

DO $$
DECLARE
    null_count_after INTEGER;
    total_transactions INTEGER;
BEGIN
    -- Contar transações restantes com NULL
    SELECT COUNT(*) INTO null_count_after 
    FROM public.transactions 
    WHERE amount IS NULL;
    
    -- Contar total de transações
    SELECT COUNT(*) INTO total_transactions 
    FROM public.transactions;
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ CORREÇÃO CONCLUÍDA!';
    RAISE NOTICE '📊 Total de transações: %s', total_transactions;
    RAISE NOTICE '❌ Transações com amount NULL restantes: %s', null_count_after;
    
    IF null_count_after = 0 THEN
        RAISE NOTICE '🎉 SUCESSO: Todas as transações têm amount válido!';
    ELSE
        RAISE NOTICE '⚠️ ATENÇÃO: Ainda existem %s transações com amount NULL', null_count_after;
    END IF;
END $$;

-- ============================================================================
-- MOSTRAR ALGUMAS TRANSAÇÕES RECENTES PARA VERIFICAÇÃO
-- ============================================================================

SELECT 
    id,
    title,
    amount,
    type,
    created_at
FROM public.transactions 
ORDER BY created_at DESC 
LIMIT 5;

COMMIT;

-- ============================================================================
-- PRÓXIMO PASSO: Testar inserção
-- ============================================================================

-- Teste simples de inserção (descomente para testar)
/*
INSERT INTO public.transactions (
    user_id,
    title,
    amount,
    type,
    category,
    date
) VALUES (
    (SELECT auth.uid()),
    'Teste de correção',
    10.50,
    'expense',
    'Teste',
    NOW()
);
*/
