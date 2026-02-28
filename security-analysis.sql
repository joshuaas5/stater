-- ================================================================
-- ANÁLISE DE SEGURANÇA - DIAGNÓSTICO ATUAL
-- Execute este script primeiro para entender o estado atual
-- ================================================================

-- 1. VERIFICAR ESTADO ATUAL DO RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ATIVO' 
        ELSE '🚨 RLS DESABILITADO' 
    END as status_seguranca
FROM pg_tables 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes', 'profiles', 'transactions')
ORDER BY tablename;

-- 2. VERIFICAR POLÍTICAS EXISTENTES
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    CASE 
        WHEN cmd = 'ALL' THEN '🔄 TODAS OPERAÇÕES'
        WHEN cmd = 'SELECT' THEN '👁️ LEITURA'
        WHEN cmd = 'INSERT' THEN '➕ INSERÇÃO'
        WHEN cmd = 'UPDATE' THEN '✏️ ATUALIZAÇÃO'
        WHEN cmd = 'DELETE' THEN '🗑️ EXCLUSÃO'
    END as tipo_operacao
FROM pg_policies 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes', 'profiles', 'transactions')
ORDER BY tablename, policyname;

-- 3. VERIFICAR ESTRUTURA DAS TABELAS CRÍTICAS
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    CASE 
        WHEN column_name = 'user_id' THEN '🔑 CHAVE DE ISOLAMENTO'
        WHEN column_name LIKE '%id' THEN '🆔 IDENTIFICADOR'
        ELSE '📄 DADO'
    END as tipo_coluna
FROM information_schema.columns 
WHERE table_name IN ('api_usage', 'telegram_users', 'telegram_link_codes')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 4. CONTAR REGISTROS POR TABELA (para entender impacto)
SELECT 
    'api_usage' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos
FROM api_usage
UNION ALL
SELECT 
    'telegram_users' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos
FROM telegram_users
UNION ALL
SELECT 
    'telegram_link_codes' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos
FROM telegram_link_codes;

-- 5. VERIFICAR SE EXISTEM REGISTROS SEM user_id (podem quebrar após RLS)
SELECT 
    'api_usage' as tabela,
    COUNT(*) as registros_sem_user_id
FROM api_usage 
WHERE user_id IS NULL
UNION ALL
SELECT 
    'telegram_users' as tabela,
    COUNT(*) as registros_sem_user_id
FROM telegram_users 
WHERE user_id IS NULL
UNION ALL
SELECT 
    'telegram_link_codes' as tabela,
    COUNT(*) as registros_sem_user_id
FROM telegram_link_codes 
WHERE user_id IS NULL;
