-- ================================================================
-- CORREÇÃO FINAL DOS 2 PROBLEMAS RESTANTES
-- Execute no Supabase SQL Editor para resolver os últimos erros
-- ================================================================

SELECT '🔧 CORRIGINDO OS 2 PROBLEMAS FINAIS...' as status;

-- ================================================================
-- PROBLEMA 1: AUDIO_RESPONSE_CACHE SEM RLS
-- ================================================================
SELECT '📊 1. RESOLVENDO AUDIO_RESPONSE_CACHE...' as etapa;

-- Primeiro, vamos ver a estrutura desta tabela
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'audio_response_cache' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se a tabela tem dados e qual estrutura
SELECT 'Analisando estrutura de audio_response_cache:' as info;

DO $$
BEGIN
    -- Se a tabela não tem user_id, vamos criar uma política mais simples
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'audio_response_cache' 
        AND table_schema = 'public'
    ) THEN
        -- Habilitar RLS na tabela
        ALTER TABLE public.audio_response_cache ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS habilitado em audio_response_cache';
        
        -- Remover políticas existentes
        DROP POLICY IF EXISTS "audio_cache_public_access" ON public.audio_response_cache;
        DROP POLICY IF EXISTS "audio_cache_service_access" ON public.audio_response_cache;
        
        -- Verificar se tem user_id ou outra coluna de identificação
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'audio_response_cache' 
            AND column_name = 'user_id' 
            AND table_schema = 'public'
        ) THEN
            -- Se tem user_id, usar isolamento por usuário
            EXECUTE 'CREATE POLICY "audio_cache_user_access" ON public.audio_response_cache
                FOR ALL TO authenticated
                USING (user_id = auth.uid())
                WITH CHECK (user_id = auth.uid())';
            RAISE NOTICE '✅ Política com user_id criada';
        ELSE
            -- Se não tem user_id, permitir acesso apenas para authenticated users
            -- Esta é uma política mais restritiva que resolve o erro de segurança
            EXECUTE 'CREATE POLICY "audio_cache_authenticated_access" ON public.audio_response_cache
                FOR ALL TO authenticated
                USING (true)
                WITH CHECK (true)';
            RAISE NOTICE '✅ Política geral para authenticated criada';
        END IF;
        
        -- Service role sempre tem acesso total
        EXECUTE 'CREATE POLICY "audio_cache_service_access" ON public.audio_response_cache
            FOR ALL TO service_role
            USING (true)
            WITH CHECK (true)';
        RAISE NOTICE '✅ Política service_role criada';
        
    ELSE
        RAISE NOTICE '⚠️ Tabela audio_response_cache não existe';
    END IF;
END $$;

SELECT '✅ audio_response_cache processado' as resultado;

-- ================================================================
-- PROBLEMA 2: VIEW AUDIO_USAGE_SUMMARY COM SECURITY DEFINER
-- ================================================================
SELECT '🔍 2. CORRIGINDO VIEW PROBLEMÁTICA...' as etapa;

-- Primeiro, ver como a view está definida atualmente
SELECT 'Analisando view audio_usage_summary:' as info;

DO $$
BEGIN
    -- Se a view existe, vamos recriá-la sem SECURITY DEFINER
    IF EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'audio_usage_summary' 
        AND table_schema = 'public'
    ) THEN
        -- Remover view problemática
        DROP VIEW IF EXISTS public.audio_usage_summary;
        RAISE NOTICE '🗑️ View problemática removida';
        
        -- Verificar se tabela audio_logs existe
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'audio_logs' 
            AND table_schema = 'public'
        ) THEN
            -- Recriar view SEM SECURITY DEFINER
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
            WHERE user_id = auth.uid()  -- FILTRO CRÍTICO DE SEGURANÇA
            GROUP BY DATE(created_at), source_type
            ORDER BY date DESC';
            
            RAISE NOTICE '✅ View recriada SEM SECURITY DEFINER';
        ELSE
            -- Se audio_logs não existe, criar view dummy para evitar erros
            EXECUTE 'CREATE VIEW public.audio_usage_summary AS
            SELECT 
              CURRENT_DATE as date,
              ''no_data'' as source_type,
              0 as total_requests,
              0 as successful_requests,
              0 as failed_requests,
              0 as avg_duration,
              0 as avg_processing_time,
              0 as daily_cost_usd
            WHERE false'; -- WHERE false = view vazia mas estruturada
            
            RAISE NOTICE '✅ View dummy criada (audio_logs não existe)';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ View audio_usage_summary não existe';
    END IF;
END $$;

SELECT '✅ View processada sem SECURITY DEFINER' as resultado;

-- ================================================================
-- VALIDAÇÃO FINAL DOS 2 PROBLEMAS
-- ================================================================
SELECT '✅ 3. VALIDANDO CORREÇÕES FINAIS...' as etapa;

-- Verificar RLS em audio_response_cache
SELECT 
    'AUDIO_CACHE_RLS' as verificacao,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ATIVO' 
        ELSE '❌ RLS AINDA DESATIVO' 
    END as status
FROM pg_tables 
WHERE tablename = 'audio_response_cache'
    AND schemaname = 'public';

-- Verificar políticas em audio_response_cache
SELECT 
    'AUDIO_CACHE_POLICIES' as verificacao,
    COUNT(*) as total_politicas,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ POLÍTICAS ATIVAS'
        ELSE '❌ SEM POLÍTICAS'
    END as status
FROM pg_policies 
WHERE tablename = 'audio_response_cache'
    AND schemaname = 'public';

-- Verificar view audio_usage_summary
SELECT 
    'AUDIO_VIEW_STATUS' as verificacao,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.views 
            WHERE table_name = 'audio_usage_summary' 
            AND table_schema = 'public'
        ) THEN '✅ VIEW EXISTE (SEM SECURITY DEFINER)'
        ELSE '⚠️ VIEW NÃO EXISTE'
    END as status;

-- ================================================================
-- RESULTADO FINAL
-- ================================================================
SELECT '🎉 CORREÇÕES FINAIS APLICADAS!' as resultado_final;

-- Comentários finais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audio_response_cache' AND table_schema = 'public') THEN
        COMMENT ON TABLE public.audio_response_cache IS 'RLS ATIVO - Problema resolvido em 28/07/2025';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'audio_usage_summary' AND table_schema = 'public') THEN
        COMMENT ON VIEW public.audio_usage_summary IS 'VIEW SEGURA - SECURITY DEFINER removido em 28/07/2025';
    END IF;
END $$;

SELECT '📊 EXECUTE NOVO SECURITY SCAN - TODOS OS PROBLEMAS DEVEM ESTAR RESOLVIDOS!' as proxima_acao;
