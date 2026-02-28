-- ================================================================
-- FASE 1: ANÁLISE PRÉ-CORREÇÃO DE SEGURANÇA
-- Execute este script no Supabase SQL Editor
-- SEGURO: Apenas consultas SELECT - nenhuma alteração
-- ================================================================

SELECT '🔍 INICIANDO ANÁLISE DE SEGURANÇA...' as status;

-- ================================================================
-- 1. VERIFICAR TABELAS SEM RLS (VULNERÁVEIS)
-- ================================================================
SELECT '📊 VERIFICANDO ESTADO DO RLS...' as info;

SELECT 
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ PROTEGIDO' 
        ELSE '🚨 VULNERÁVEL' 
    END as status_seguranca,
    CASE 
        WHEN rowsecurity THEN 'RLS ativo - dados isolados por usuário'
        ELSE 'RLS DESABILITADO - usuários podem ver dados de outros!'
    END as detalhes
FROM pg_tables 
WHERE tablename IN ('telegram_users', 'telegram_link_codes', 'audio_response_cache')
    AND schemaname = 'public'
ORDER BY rowsecurity ASC, tablename;

-- ================================================================
-- 2. VERIFICAR VIEW PROBLEMÁTICA (SECURITY DEFINER)
-- ================================================================
SELECT '🔍 VERIFICANDO VIEW PROBLEMÁTICA...' as info;

SELECT 
    viewname,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN '🚨 SECURITY DEFINER DETECTADO'
        ELSE '✅ VIEW NORMAL'
    END as status_view,
    'audio_usage_summary' as nome_view,
    CASE 
        WHEN definition LIKE '%SECURITY DEFINER%' THEN 'View executa com privilégios elevados'
        ELSE 'View normal'
    END as explicacao
FROM pg_views 
WHERE viewname = 'audio_usage_summary'
    AND schemaname = 'public';

-- ================================================================
-- 3. VERIFICAR POLÍTICAS RLS EXISTENTES
-- ================================================================
SELECT '📋 VERIFICANDO POLÍTICAS RLS EXISTENTES...' as info;

SELECT 
    tablename,
    COUNT(*) as total_politicas,
    string_agg(policyname, ', ') as nomes_politicas
FROM pg_policies 
WHERE tablename IN ('telegram_users', 'telegram_link_codes', 'audio_response_cache')
    AND schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ================================================================
-- 4. CONTAR REGISTROS POR TABELA (IMPACTO)
-- ================================================================
SELECT '📈 CONTANDO REGISTROS (IMPACTO DA CORREÇÃO)...' as info;

-- Telegram Users
SELECT 
    'telegram_users' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    CASE 
        WHEN COUNT(*) = 0 THEN 'Nenhum registro - seguro corrigir'
        WHEN COUNT(*) < 10 THEN 'Poucos registros - baixo risco'
        WHEN COUNT(*) < 100 THEN 'Registros moderados - risco médio'
        ELSE 'Muitos registros - teste bem após correção'
    END as nivel_risco
FROM telegram_users

UNION ALL

-- Telegram Link Codes  
SELECT 
    'telegram_link_codes' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    CASE 
        WHEN COUNT(*) = 0 THEN 'Nenhum registro - seguro corrigir'
        WHEN COUNT(*) < 10 THEN 'Poucos registros - baixo risco'
        WHEN COUNT(*) < 100 THEN 'Registros moderados - risco médio'
        ELSE 'Muitos registros - teste bem após correção'
    END as nivel_risco
FROM telegram_link_codes

UNION ALL

-- Audio Response Cache
SELECT 
    'audio_response_cache' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    CASE 
        WHEN COUNT(*) = 0 THEN 'Nenhum registro - seguro corrigir'
        WHEN COUNT(*) < 10 THEN 'Poucos registros - baixo risco'
        WHEN COUNT(*) < 100 THEN 'Registros moderados - risco médio'
        ELSE 'Muitos registros - teste bem após correção'
    END as nivel_risco
FROM audio_response_cache;

-- ================================================================
-- 5. VERIFICAR REGISTROS SEM USER_ID (PODEM QUEBRAR)
-- ================================================================
SELECT '⚠️ VERIFICANDO REGISTROS SEM USER_ID...' as info;

SELECT 
    'telegram_users' as tabela,
    COUNT(*) as registros_sem_user_id,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Todos têm user_id'
        ELSE '⚠️ Registros órfãos - podem quebrar'
    END as status
FROM telegram_users 
WHERE user_id IS NULL

UNION ALL

SELECT 
    'telegram_link_codes' as tabela,
    COUNT(*) as registros_sem_user_id,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Todos têm user_id'
        ELSE '⚠️ Registros órfãos - podem quebrar'
    END as status
FROM telegram_link_codes 
WHERE user_id IS NULL

UNION ALL

SELECT 
    'audio_response_cache' as tabela,
    COUNT(*) as registros_sem_user_id,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Todos têm user_id'
        ELSE '⚠️ Registros órfãos - podem quebrar'
    END as status
FROM audio_response_cache 
WHERE user_id IS NULL;

-- ================================================================
-- 6. VERIFICAR USUÁRIO ATUAL (CONTEXTO DOS TESTES)
-- ================================================================
SELECT '👤 VERIFICANDO CONTEXTO DO USUÁRIO...' as info;

SELECT 
    'Usuário atual' as contexto,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ Autenticado como usuário'
        ELSE '⚠️ Executando como service_role'
    END as tipo_sessao,
    auth.role() as role_atual;

-- ================================================================
-- 7. RESUMO DA ANÁLISE
-- ================================================================
SELECT '📊 RESUMO DA ANÁLISE DE SEGURANÇA:' as resultado;

WITH vulnerabilidades AS (
    SELECT COUNT(*) as tabelas_vulneraveis
    FROM pg_tables 
    WHERE tablename IN ('telegram_users', 'telegram_link_codes', 'audio_response_cache')
        AND schemaname = 'public'
        AND rowsecurity = false
),
views_problematicas AS (
    SELECT COUNT(*) as views_com_security_definer
    FROM pg_views 
    WHERE viewname = 'audio_usage_summary'
        AND schemaname = 'public'
        AND definition LIKE '%SECURITY DEFINER%'
)
SELECT 
    v.tabelas_vulneraveis,
    vp.views_com_security_definer,
    CASE 
        WHEN v.tabelas_vulneraveis = 0 AND vp.views_com_security_definer = 0 THEN '✅ TUDO SEGURO'
        WHEN v.tabelas_vulneraveis > 0 AND vp.views_com_security_definer > 0 THEN '🚨 MÚLTIPLAS VULNERABILIDADES'
        WHEN v.tabelas_vulneraveis > 0 THEN '⚠️ PROBLEMAS DE RLS'
        WHEN vp.views_com_security_definer > 0 THEN '⚠️ PROBLEMA DE VIEW'
        ELSE '✅ STATUS DESCONHECIDO'
    END as status_geral,
    CASE 
        WHEN v.tabelas_vulneraveis + vp.views_com_security_definer = 0 THEN 'Nenhuma correção necessária'
        ELSE 'Prosseguir para FASE 2: Correções'
    END as proxima_acao
FROM vulnerabilidades v, views_problematicas vp;

-- ================================================================
-- FINAL DA ANÁLISE
-- ================================================================
SELECT '✅ ANÁLISE CONCLUÍDA!' as status;
SELECT 'Próximo passo: Revisar resultados e aprovar FASE 2' as instrucao;
