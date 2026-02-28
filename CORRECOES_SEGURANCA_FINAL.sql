-- ================================================================
-- FASE 2: CORREÇÕES DE SEGURANÇA - EXECUTE NO SUPABASE SQL EDITOR
-- Copie e cole este script no SQL Editor do Supabase Dashboard
-- ================================================================

SELECT '🔧 INICIANDO CORREÇÕES DE SEGURANÇA...' as status;

-- ================================================================
-- 1. HABILITAR ROW LEVEL SECURITY
-- ================================================================
SELECT '📊 1. HABILITANDO RLS NAS TABELAS...' as etapa;

-- Habilitar RLS em telegram_users
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS em telegram_link_codes  
ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- Verificar se audio_response_cache existe e tem user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audio_response_cache' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.audio_response_cache ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

SELECT '✅ RLS habilitado nas tabelas disponíveis' as resultado;

-- ================================================================
-- 2. CRIAR POLÍTICAS PARA TELEGRAM_USERS
-- ================================================================
SELECT '📋 2. CRIANDO POLÍTICAS TELEGRAM_USERS...' as etapa;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "telegram_users_user_isolation" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_users_service_access" ON public.telegram_users;

-- Política: Usuários autenticados só veem seus dados
CREATE POLICY "telegram_users_user_isolation" ON public.telegram_users
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política: Service role tem acesso total (para bot Telegram)
CREATE POLICY "telegram_users_service_access" ON public.telegram_users
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

SELECT '✅ Políticas telegram_users criadas' as resultado;

-- ================================================================
-- 3. CRIAR POLÍTICAS PARA TELEGRAM_LINK_CODES
-- ================================================================
SELECT '📋 3. CRIANDO POLÍTICAS TELEGRAM_LINK_CODES...' as etapa;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "telegram_codes_user_isolation" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_codes_service_access" ON public.telegram_link_codes;

-- Política: Usuários autenticados só veem seus códigos
CREATE POLICY "telegram_codes_user_isolation" ON public.telegram_link_codes
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política: Service role tem acesso total (para bot Telegram)
CREATE POLICY "telegram_codes_service_access" ON public.telegram_link_codes
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

SELECT '✅ Políticas telegram_link_codes criadas' as resultado;

-- ================================================================
-- 4. CRIAR POLÍTICAS PARA AUDIO_RESPONSE_CACHE (SE EXISTIR E TIVER USER_ID)
-- ================================================================
SELECT '📋 4. VERIFICANDO AUDIO_RESPONSE_CACHE...' as etapa;

-- Criar políticas apenas se a tabela existir e tiver user_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'audio_response_cache' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        -- Remover políticas existentes (se houver)
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
            
        RAISE NOTICE '✅ Políticas audio_response_cache criadas';
    ELSE
        RAISE NOTICE '⚠️ audio_response_cache não existe ou não tem user_id - pulando';
    END IF;
END $$;

SELECT '✅ Políticas audio_response_cache processadas' as resultado;

-- ================================================================
-- 5. CORRIGIR VIEW AUDIO_USAGE_SUMMARY (SE EXISTIR)
-- ================================================================
SELECT '🔍 5. VERIFICANDO VIEW PROBLEMÁTICA...' as etapa;

-- Verificar se a view existe e tem dependências problemáticas
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'audio_usage_summary' 
        AND table_schema = 'public'
    ) THEN
        -- Remover view existente
        DROP VIEW IF EXISTS public.audio_usage_summary;
        
        -- Verificar se tabela audio_logs existe
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'audio_logs' 
            AND table_schema = 'public'
        ) THEN
            -- Criar nova view SEGURA (sem SECURITY DEFINER)
            EXECUTE 'CREATE VIEW public.audio_usage_summary AS
            SELECT 
              DATE(created_at) as date,
              source_type,
              COUNT(*) as total_requests,
              COUNT(*) FILTER (WHERE success = true) as successful_requests,
              COUNT(*) FILTER (WHERE success = false) as failed_requests,
              AVG(audio_duration_seconds) as avg_duration,
              AVG(processing_time_ms) as avg_processing_time,
              SUM(estimated_cost_usd) as daily_cost_usd
            FROM audio_logs
            WHERE user_id = auth.uid()  -- FILTRO CRÍTICO: só dados do usuário atual
            GROUP BY DATE(created_at), source_type
            ORDER BY date DESC';
            
            RAISE NOTICE '✅ View audio_usage_summary corrigida';
        ELSE
            RAISE NOTICE '⚠️ Tabela audio_logs não existe - view não criada';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ View audio_usage_summary não existe - nada a corrigir';
    END IF;
END $$;

SELECT '✅ View processada com segurança' as resultado;

-- ================================================================
-- 6. VALIDAÇÃO FINAL
-- ================================================================
SELECT '✅ 6. VALIDANDO CORREÇÕES...' as etapa;

-- Verificar se RLS foi habilitado (apenas tabelas que realmente processamos)
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ PROTEGIDO' 
        ELSE '❌ AINDA VULNERÁVEL' 
    END as status_rls
FROM pg_tables 
WHERE tablename IN ('telegram_users', 'telegram_link_codes')
    AND schemaname = 'public'
ORDER BY tablename;

-- Verificar políticas criadas (apenas tabelas que realmente processamos)
SELECT 
    tablename,
    COUNT(*) as total_politicas,
    '✅ POLÍTICAS ATIVAS' as status
FROM pg_policies 
WHERE tablename IN ('telegram_users', 'telegram_link_codes')
    AND schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ================================================================
-- RESULTADO FINAL
-- ================================================================
SELECT '🎉 CORREÇÕES DE SEGURANÇA CONCLUÍDAS!' as resultado_final;

-- Comentários de confirmação (apenas tabelas que processamos)
COMMENT ON TABLE public.telegram_users IS 'RLS ATIVO - Segurança aplicada em 28/07/2025';
COMMENT ON TABLE public.telegram_link_codes IS 'RLS ATIVO - Segurança aplicada em 28/07/2025';
COMMENT ON VIEW public.audio_usage_summary IS 'VIEW SEGURA - Sem SECURITY DEFINER - 28/07/2025';

SELECT 'Execute um novo scan de segurança no Supabase para confirmar' as proxima_acao;
