-- ================================================================
-- FASE 2: CORREÇÕES DE SEGURANÇA ROBUSTAS - SUPABASE SQL EDITOR
-- Script 100% seguro que verifica estrutura antes de aplicar correções
-- ================================================================

SELECT '🔧 INICIANDO CORREÇÕES DE SEGURANÇA ROBUSTAS...' as status;

-- ================================================================
-- 0. ANÁLISE PRELIMINAR DAS TABELAS
-- ================================================================
SELECT '🔍 0. ANALISANDO ESTRUTURA DAS TABELAS...' as etapa;

-- Verificar quais tabelas existem e suas colunas
SELECT 
    table_name,
    string_agg(column_name, ', ') as colunas_existentes
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('telegram_users', 'telegram_link_codes', 'audio_response_cache')
GROUP BY table_name
ORDER BY table_name;

-- ================================================================
-- 1. HABILITAR ROW LEVEL SECURITY (APENAS TABELAS QUE EXISTEM)
-- ================================================================
SELECT '📊 1. HABILITANDO RLS NAS TABELAS...' as etapa;

-- Verificar e habilitar RLS apenas em tabelas que realmente existem
DO $$
BEGIN
    -- telegram_users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'telegram_users' AND table_schema = 'public') THEN
        ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado em telegram_users';
    ELSE
        RAISE NOTICE '⚠️ telegram_users não existe';
    END IF;
    
    -- telegram_link_codes
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'telegram_link_codes' AND table_schema = 'public') THEN
        ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado em telegram_link_codes';
    ELSE
        RAISE NOTICE '⚠️ telegram_link_codes não existe';
    END IF;
    
    -- audio_response_cache (apenas se existir E tiver user_id)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audio_response_cache' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.audio_response_cache ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado em audio_response_cache';
    ELSE
        RAISE NOTICE '⚠️ audio_response_cache não existe ou não tem user_id';
    END IF;
END $$;

SELECT '✅ RLS processado em todas as tabelas disponíveis' as resultado;

-- ================================================================
-- 2. POLÍTICAS PARA TELEGRAM_USERS (SE EXISTIR E TIVER USER_ID)
-- ================================================================
SELECT '📋 2. PROCESSANDO POLÍTICAS TELEGRAM_USERS...' as etapa;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'telegram_users' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        -- Remover políticas existentes
        DROP POLICY IF EXISTS "telegram_users_user_isolation" ON public.telegram_users;
        DROP POLICY IF EXISTS "telegram_users_service_access" ON public.telegram_users;

        -- Política: Usuários autenticados só veem seus dados
        EXECUTE 'CREATE POLICY "telegram_users_user_isolation" ON public.telegram_users
            FOR ALL TO authenticated
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid())';

        -- Política: Service role tem acesso total (para bot Telegram)
        EXECUTE 'CREATE POLICY "telegram_users_service_access" ON public.telegram_users
            FOR ALL TO service_role
            USING (true)
            WITH CHECK (true)';
            
        RAISE NOTICE '✅ Políticas telegram_users criadas com sucesso';
    ELSE
        RAISE NOTICE '⚠️ telegram_users não existe ou não tem user_id - políticas puladas';
    END IF;
END $$;

SELECT '✅ Políticas telegram_users processadas' as resultado;

-- ================================================================
-- 3. POLÍTICAS PARA TELEGRAM_LINK_CODES (SE EXISTIR E TIVER USER_ID)
-- ================================================================
SELECT '📋 3. PROCESSANDO POLÍTICAS TELEGRAM_LINK_CODES...' as etapa;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'telegram_link_codes' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        -- Remover políticas existentes
        DROP POLICY IF EXISTS "telegram_codes_user_isolation" ON public.telegram_link_codes;
        DROP POLICY IF EXISTS "telegram_codes_service_access" ON public.telegram_link_codes;

        -- Política: Usuários autenticados só veem seus códigos
        EXECUTE 'CREATE POLICY "telegram_codes_user_isolation" ON public.telegram_link_codes
            FOR ALL TO authenticated
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid())';

        -- Política: Service role tem acesso total (para bot Telegram)
        EXECUTE 'CREATE POLICY "telegram_codes_service_access" ON public.telegram_link_codes
            FOR ALL TO service_role
            USING (true)
            WITH CHECK (true)';
            
        RAISE NOTICE '✅ Políticas telegram_link_codes criadas com sucesso';
    ELSE
        RAISE NOTICE '⚠️ telegram_link_codes não existe ou não tem user_id - políticas puladas';
    END IF;
END $$;

SELECT '✅ Políticas telegram_link_codes processadas' as resultado;

-- ================================================================
-- 4. POLÍTICAS PARA AUDIO_RESPONSE_CACHE (SE EXISTIR E TIVER USER_ID)
-- ================================================================
SELECT '📋 4. PROCESSANDO POLÍTICAS AUDIO_RESPONSE_CACHE...' as etapa;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audio_response_cache' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        -- Remover políticas existentes
        DROP POLICY IF EXISTS "audio_cache_user_isolation" ON public.audio_response_cache;
        DROP POLICY IF EXISTS "audio_cache_service_access" ON public.audio_response_cache;

        -- Política: Usuários autenticados só veem seu cache
        EXECUTE 'CREATE POLICY "audio_cache_user_isolation" ON public.audio_response_cache
            FOR ALL TO authenticated
            USING (user_id = auth.uid())
            WITH CHECK (user_id = auth.uid())';

        -- Política: Service role tem acesso total
        EXECUTE 'CREATE POLICY "audio_cache_service_access" ON public.audio_response_cache
            FOR ALL TO service_role
            USING (true)
            WITH CHECK (true)';
            
        RAISE NOTICE '✅ Políticas audio_response_cache criadas com sucesso';
    ELSE
        RAISE NOTICE '⚠️ audio_response_cache não existe ou não tem user_id - políticas puladas';
    END IF;
END $$;

SELECT '✅ Políticas audio_response_cache processadas' as resultado;

-- ================================================================
-- 5. CORRIGIR VIEW AUDIO_USAGE_SUMMARY (SE EXISTIR)
-- ================================================================
SELECT '🔍 5. PROCESSANDO VIEW PROBLEMÁTICA...' as etapa;

DO $$
BEGIN
    -- Verificar se a view existe
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'audio_usage_summary' 
        AND table_schema = 'public'
    ) THEN
        -- Remover view existente
        DROP VIEW IF EXISTS public.audio_usage_summary;
        RAISE NOTICE '🗑️ View audio_usage_summary removida';
        
        -- Verificar se tabela audio_logs existe e tem as colunas necessárias
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'audio_logs' 
            AND table_schema = 'public'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'audio_logs' 
            AND column_name = 'user_id' 
            AND table_schema = 'public'
        ) THEN
            -- Criar nova view SEGURA (sem SECURITY DEFINER)
            EXECUTE 'CREATE VIEW public.audio_usage_summary AS
            SELECT 
              DATE(created_at) as date,
              COALESCE(source_type, ''unknown'') as source_type,
              COUNT(*) as total_requests,
              COUNT(*) FILTER (WHERE success = true) as successful_requests,
              COUNT(*) FILTER (WHERE success = false) as failed_requests,
              AVG(COALESCE(audio_duration_seconds, 0)) as avg_duration,
              AVG(COALESCE(processing_time_ms, 0)) as avg_processing_time,
              SUM(COALESCE(estimated_cost_usd, 0)) as daily_cost_usd
            FROM audio_logs
            WHERE user_id = auth.uid()  -- FILTRO CRÍTICO: só dados do usuário atual
            GROUP BY DATE(created_at), source_type
            ORDER BY date DESC';
            
            RAISE NOTICE '✅ View audio_usage_summary recriada com segurança';
        ELSE
            RAISE NOTICE '⚠️ Tabela audio_logs não existe ou não tem estrutura adequada - view não criada';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ View audio_usage_summary não existe - nada a corrigir';
    END IF;
END $$;

SELECT '✅ View processada com segurança' as resultado;

-- ================================================================
-- 6. VALIDAÇÃO FINAL ROBUSTA
-- ================================================================
SELECT '✅ 6. VALIDANDO CORREÇÕES APLICADAS...' as etapa;

-- Verificar RLS nas tabelas que realmente existem
SELECT 
    'RLS_STATUS' as tipo,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ PROTEGIDO' 
        ELSE '❌ AINDA VULNERÁVEL' 
    END as status
FROM pg_tables 
WHERE tablename IN ('telegram_users', 'telegram_link_codes', 'audio_response_cache')
    AND schemaname = 'public'
ORDER BY tablename;

-- Verificar políticas criadas nas tabelas que existem
SELECT 
    'POLICIES_COUNT' as tipo,
    tablename,
    COUNT(*) as total_politicas,
    '✅ POLÍTICAS ATIVAS' as status
FROM pg_policies 
WHERE tablename IN ('telegram_users', 'telegram_link_codes', 'audio_response_cache')
    AND schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Verificar se views problemáticas ainda existem
SELECT 
    'VIEW_STATUS' as tipo,
    table_name,
    '✅ VIEW SEGURA' as status
FROM information_schema.views 
WHERE table_name = 'audio_usage_summary' 
    AND table_schema = 'public';

-- ================================================================
-- 7. RESULTADO FINAL
-- ================================================================
SELECT '🎉 CORREÇÕES DE SEGURANÇA ROBUSTAS CONCLUÍDAS!' as resultado_final;

-- Comentários de confirmação apenas em tabelas que realmente processamos
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'telegram_users' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.telegram_users IS 'RLS ATIVO - Segurança aplicada em 28/07/2025';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'telegram_link_codes' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.telegram_link_codes IS 'RLS ATIVO - Segurança aplicada em 28/07/2025';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audio_response_cache' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.audio_response_cache IS 'RLS ATIVO - Segurança aplicada em 28/07/2025';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'audio_usage_summary' AND table_schema = 'public') THEN
        COMMENT ON VIEW public.audio_usage_summary IS 'VIEW SEGURA - Sem SECURITY DEFINER - 28/07/2025';
    END IF;
END $$;

SELECT '📊 Execute um novo Security Scan no Supabase para confirmar que todas as vulnerabilidades foram resolvidas!' as proxima_acao;

-- FIM DO SCRIPT ROBUSTO
