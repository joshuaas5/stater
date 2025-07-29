-- ================================================================
-- COMANDOS MANUAIS ADICIONAIS - Execute após o script principal
-- ================================================================

-- Primeiro, vamos identificar as assinaturas exatas das funções
SELECT 
    routine_name,
    routine_type,
    data_type,
    pg_get_function_identity_arguments(p.oid) as argumentos
FROM information_schema.routines r
JOIN pg_proc p ON p.proname = r.routine_name AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = r.routine_schema)
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'get_user_audio_costs',
        'cleanup_old_audio_logs', 
        'insert_transaction_with_timestamp'
    )
ORDER BY routine_name, argumentos;

-- Corrigir search_path das funções (com tratamento de múltiplas assinaturas)
DO $fix_functions$
DECLARE
    rec RECORD;
    func_args TEXT;
BEGIN
    -- get_user_audio_costs
    BEGIN
        EXECUTE 'ALTER FUNCTION public.get_user_audio_costs SET search_path = public, pg_temp';
        RAISE NOTICE '✅ get_user_audio_costs corrigida';
    EXCEPTION 
        WHEN duplicate_function THEN
            -- Se há múltiplas versões, corrigir todas
            FOR rec IN 
                SELECT pg_get_function_identity_arguments(p.oid) as args
                FROM pg_proc p 
                JOIN pg_namespace n ON n.oid = p.pronamespace 
                WHERE p.proname = 'get_user_audio_costs' AND n.nspname = 'public'
            LOOP
                EXECUTE format('ALTER FUNCTION public.get_user_audio_costs(%s) SET search_path = public, pg_temp', rec.args);
            END LOOP;
            RAISE NOTICE '✅ get_user_audio_costs (todas as versões) corrigidas';
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao corrigir get_user_audio_costs: %', SQLERRM;
    END;

    -- cleanup_old_audio_logs
    BEGIN
        EXECUTE 'ALTER FUNCTION public.cleanup_old_audio_logs SET search_path = public, pg_temp';
        RAISE NOTICE '✅ cleanup_old_audio_logs corrigida';
    EXCEPTION 
        WHEN duplicate_function THEN
            FOR rec IN 
                SELECT pg_get_function_identity_arguments(p.oid) as args
                FROM pg_proc p 
                JOIN pg_namespace n ON n.oid = p.pronamespace 
                WHERE p.proname = 'cleanup_old_audio_logs' AND n.nspname = 'public'
            LOOP
                EXECUTE format('ALTER FUNCTION public.cleanup_old_audio_logs(%s) SET search_path = public, pg_temp', rec.args);
            END LOOP;
            RAISE NOTICE '✅ cleanup_old_audio_logs (todas as versões) corrigidas';
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao corrigir cleanup_old_audio_logs: %', SQLERRM;
    END;

    -- insert_transaction_with_timestamp
    BEGIN
        EXECUTE 'ALTER FUNCTION public.insert_transaction_with_timestamp SET search_path = public, pg_temp';
        RAISE NOTICE '✅ insert_transaction_with_timestamp corrigida';
    EXCEPTION 
        WHEN duplicate_function THEN
            FOR rec IN 
                SELECT pg_get_function_identity_arguments(p.oid) as args
                FROM pg_proc p 
                JOIN pg_namespace n ON n.oid = p.pronamespace 
                WHERE p.proname = 'insert_transaction_with_timestamp' AND n.nspname = 'public'
            LOOP
                EXECUTE format('ALTER FUNCTION public.insert_transaction_with_timestamp(%s) SET search_path = public, pg_temp', rec.args);
                RAISE NOTICE '✅ insert_transaction_with_timestamp(%s) corrigida', rec.args;
            END LOOP;
        WHEN OTHERS THEN
            RAISE NOTICE '⚠️ Erro ao corrigir insert_transaction_with_timestamp: %', SQLERRM;
    END;
END $fix_functions$;

-- Verificar se as funções foram corrigidas
SELECT 
    r.routine_name,
    pg_get_function_identity_arguments(p.oid) as argumentos,
    CASE 
        WHEN p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path%'
        THEN '✅ SEARCH_PATH DEFINIDO'
        ELSE '❌ SEARCH_PATH MUTÁVEL'
    END as status,
    COALESCE(array_to_string(p.proconfig, ', '), 'Nenhuma configuração') as configuracao
FROM information_schema.routines r
JOIN pg_proc p ON p.proname = r.routine_name AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = r.routine_schema)
WHERE routine_schema = 'public' 
    AND routine_name IN (
        'get_user_audio_costs',
        'cleanup_old_audio_logs', 
        'insert_transaction_with_timestamp'
    )
ORDER BY routine_name, argumentos;
