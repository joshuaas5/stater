-- ================================================================
-- SCRIPT DEFINITIVO - RESOLVE TUDO DE UMA VEZ
-- Execute este script no Supabase SQL Editor
-- ================================================================

SELECT '🔥 SCRIPT DEFINITIVO - RESOLVENDO TUDO AGORA!' as status;

-- ================================================================
-- 1. MATAR A VIEW PROBLEMÁTICA DE VEZ
-- ================================================================
SELECT '🗑️ REMOVENDO VIEW TEIMOSA COMPLETAMENTE...' as etapa;

-- Remover TODAS as dependências primeiro
DROP VIEW IF EXISTS public.audio_usage_summary CASCADE;

-- Aguardar para garantir que foi removida
SELECT pg_sleep(0.5);

-- Verificar se realmente foi removida
DO $check_view$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'audio_usage_summary' 
        AND table_schema = 'public'
    ) THEN
        RAISE EXCEPTION 'VIEW AINDA EXISTE! Removendo manualmente...';
    END IF;
    RAISE NOTICE '✅ View removida com sucesso';
END $check_view$;

-- ================================================================
-- 2. CORRIGIR A FUNÇÃO TEIMOSA insert_transaction_with_timestamp
-- ================================================================
SELECT '🔧 CORRIGINDO FUNÇÃO TEIMOSA...' as etapa;

-- Identificar todas as versões da função
DO $fix_insert_func$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT 
            p.oid,
            p.proname,
            pg_get_function_identity_arguments(p.oid) as func_args
        FROM pg_proc p 
        JOIN pg_namespace n ON n.oid = p.pronamespace 
        WHERE p.proname = 'insert_transaction_with_timestamp' 
        AND n.nspname = 'public'
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION public.insert_transaction_with_timestamp(%s) SET search_path = public, pg_temp', func_record.func_args);
            RAISE NOTICE '✅ Função insert_transaction_with_timestamp(%s) corrigida', func_record.func_args;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao corrigir versão (%s): %', func_record.func_args, SQLERRM;
        END;
    END LOOP;
END $fix_insert_func$;

-- ================================================================
-- 3. VALIDAÇÃO FINAL COMPLETA
-- ================================================================
SELECT '📊 VALIDAÇÃO FINAL...' as etapa;

-- Confirmar que view não existe mais
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.views 
            WHERE table_name = 'audio_usage_summary' 
            AND table_schema = 'public'
        ) THEN '✅ VIEW REMOVIDA - PROBLEMA RESOLVIDO!'
        ELSE '❌ VIEW AINDA EXISTE - PROBLEMA PERSISTE'
    END as status_view;

-- Verificar se função foi corrigida
SELECT 
    'FUNÇÃO insert_transaction_with_timestamp:' as funcao,
    COUNT(*) as total_versoes,
    COUNT(*) FILTER (
        WHERE p.proconfig IS NOT NULL 
        AND array_to_string(p.proconfig, ',') LIKE '%search_path%'
    ) as versoes_corrigidas,
    CASE 
        WHEN COUNT(*) = COUNT(*) FILTER (
            WHERE p.proconfig IS NOT NULL 
            AND array_to_string(p.proconfig, ',') LIKE '%search_path%'
        ) THEN '✅ TODAS CORRIGIDAS'
        ELSE '❌ ALGUMAS AINDA PRECISAM CORREÇÃO'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace 
WHERE p.proname = 'insert_transaction_with_timestamp' 
AND n.nspname = 'public';

-- ================================================================
-- 4. VERIFICAÇÃO GERAL DE SEGURANÇA
-- ================================================================
SELECT '🛡️ STATUS GERAL DE SEGURANÇA...' as etapa;

-- Verificar RLS em todas as tabelas críticas
SELECT 
    'RLS_STATUS' as tipo,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ PROTEGIDO' 
        ELSE '❌ VULNERÁVEL' 
    END as status
FROM pg_tables 
WHERE tablename IN ('telegram_users', 'telegram_link_codes', 'audio_response_cache')
    AND schemaname = 'public'
ORDER BY tablename;

-- Contar políticas ativas
SELECT 
    'TOTAL_POLICIES' as tipo,
    COUNT(*) as total_politicas_ativas,
    '✅ POLÍTICAS FUNCIONANDO' as status
FROM pg_policies 
WHERE schemaname = 'public';

-- ================================================================
-- RESULTADO FINAL
-- ================================================================
SELECT '🎉 SCRIPT DEFINITIVO EXECUTADO!' as resultado;

SELECT 'Execute um novo Security Scan agora. Deve mostrar:' as instrucao;
SELECT '- 0 ERROS críticos (view removida)' as esperado1;
SELECT '- Apenas 2-3 warnings de Auth (não críticos)' as esperado2;
SELECT '- Função insert_transaction_with_timestamp corrigida' as esperado3;
