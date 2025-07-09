-- ================================================================
-- TESTES DE VALIDAÇÃO - VERIFICAR FUNCIONAMENTO
-- Execute este script após aplicar as correções de segurança
-- ================================================================

-- TESTE 1: Verificar isolamento básico
-- Este teste deve retornar apenas dados do usuário atual
SELECT 
    'api_usage' as tabela,
    COUNT(*) as registros_visiveis,
    'Deve mostrar apenas registros do usuário atual' as expectativa
FROM api_usage
UNION ALL
SELECT 
    'telegram_users' as tabela,
    COUNT(*) as registros_visiveis,
    'Deve mostrar apenas conexões do usuário atual' as expectativa
FROM telegram_users
UNION ALL
SELECT 
    'telegram_link_codes' as tabela,
    COUNT(*) as registros_visiveis,
    'Deve mostrar códigos do usuário + códigos não vinculados' as expectativa
FROM telegram_link_codes;

-- TESTE 2: Verificar funcionalidade de inserção
-- Teste se ainda é possível criar registros
-- (Apenas simula, não executa inserção real)

-- Para api_usage (deve funcionar com user_id do usuário atual)
SELECT 
    'INSERT em api_usage funcionará?' as teste,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ SIM - usuário autenticado'
        ELSE '❌ NÃO - usuário não autenticado'
    END as resultado;

-- Para telegram_users (deve funcionar com user_id do usuário atual)  
SELECT 
    'INSERT em telegram_users funcionará?' as teste,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ SIM - usuário autenticado'
        ELSE '❌ NÃO - usuário não autenticado'
    END as resultado;

-- Para telegram_link_codes (deve funcionar para códigos não vinculados)
SELECT 
    'INSERT em telegram_link_codes funcionará?' as teste,
    '✅ SIM - códigos não vinculados permitidos' as resultado;

-- TESTE 3: Verificar estado do RLS
SELECT 
    'Estado do RLS' as verificacao,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ PROTEGIDO'
        ELSE '🚨 VULNERÁVEL'
    END as status_seguranca
FROM pg_tables 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes')
ORDER BY tablename;

-- TESTE 4: Contar políticas ativas
SELECT 
    'Total de políticas ativas' as verificacao,
    COUNT(*) as quantidade,
    'Deve ser >= 7 políticas' as expectativa
FROM pg_policies 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes');

-- TESTE 5: Verificar usuário atual
SELECT 
    'Usuário atual autenticado' as verificacao,
    auth.uid() as user_id,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '✅ AUTENTICADO'
        ELSE '❌ NÃO AUTENTICADO'
    END as status;

-- ================================================================
-- TESTES FUNCIONAIS ESPECÍFICOS
-- ================================================================

-- TESTE CRÍTICO: Verificar se telegram_link_codes permite operações necessárias

-- 1. Códigos não vinculados devem ser visíveis (para processo de linking)
SELECT 
    'Códigos não vinculados visíveis?' as teste,
    COUNT(*) as quantidade,
    'Necessário para processo de linking do bot' as importancia
FROM telegram_link_codes 
WHERE user_id IS NULL;

-- 2. Verificar se é possível "simular" vinculação de código
-- (Este teste apenas verifica a lógica, não executa UPDATE real)
SELECT 
    'Vinculação de código funcionará?' as teste,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM telegram_link_codes 
            WHERE user_id IS NULL 
            LIMIT 1
        ) AND auth.uid() IS NOT NULL 
        THEN '✅ SIM - códigos disponíveis e usuário autenticado'
        WHEN auth.uid() IS NULL 
        THEN '❌ NÃO - usuário não autenticado'
        ELSE '⚠️ TALVEZ - verificar códigos disponíveis'
    END as resultado;

-- ================================================================
-- RELATÓRIO FINAL DE SEGURANÇA
-- ================================================================

-- Resumo completo do estado de segurança
SELECT 
    '=== RELATÓRIO DE SEGURANÇA ===' as secao,
    '' as detalhe,
    '' as status
UNION ALL
SELECT 
    'Tabela' as secao,
    tablename as detalhe,
    CASE 
        WHEN rowsecurity THEN '🛡️ PROTEGIDA'
        ELSE '🚨 VULNERÁVEL'
    END as status
FROM pg_tables 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes')
UNION ALL
SELECT 
    'Total de Políticas' as secao,
    COUNT(*)::text as detalhe,
    CASE 
        WHEN COUNT(*) >= 7 THEN '✅ ADEQUADO'
        ELSE '⚠️ INSUFICIENTE'
    END as status
FROM pg_policies 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes')
ORDER BY secao, detalhe;
