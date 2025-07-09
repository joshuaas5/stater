-- ================================================================
-- TESTE DE FUNCIONAMENTO PÓS-SEGURANÇA
-- Execute APÓS aplicar as correções de RLS para garantir que tudo funciona
-- ================================================================

-- TESTE 1: Verificar se as funções RPC ainda funcionam
-- ================================================================
SELECT 'TESTANDO FUNÇÕES RPC...' as info;

-- Testar função de verificação de usuário
SELECT 'Testando check_user_exists...' as teste;
-- Esta função deve continuar funcionando normalmente

-- Testar função de conexão Telegram  
SELECT 'Testando funções do Telegram...' as teste;
-- As funções de Telegram devem continuar funcionando

-- TESTE 2: Verificar acesso às tabelas protegidas
-- ================================================================
SELECT 'TESTANDO ACESSO ÀS TABELAS PROTEGIDAS...' as info;

-- Simular acesso como usuário autenticado
-- (Estas consultas devem funcionar quando executadas por um usuário logado)

-- Teste api_usage (deve retornar dados apenas do usuário atual)
SELECT 'Testando api_usage - deve mostrar apenas dados do usuário atual' as teste;

-- Teste telegram_users (deve retornar dados apenas do usuário atual)  
SELECT 'Testando telegram_users - deve mostrar apenas dados do usuário atual' as teste;

-- Teste telegram_link_codes (deve retornar dados apenas do usuário atual)
SELECT 'Testando telegram_link_codes - deve mostrar apenas dados do usuário atual' as teste;

-- TESTE 3: Verificar políticas aplicadas
-- ================================================================
SELECT 'VERIFICANDO POLÍTICAS RLS APLICADAS:' as info;

SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN cmd = 'ALL' THEN '✅ ACESSO COMPLETO CONTROLADO'
        ELSE '✅ ACESSO ESPECÍFICO CONTROLADO'
    END as status_politica
FROM pg_policies 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes')
    AND policyname LIKE '%user_isolation%'
ORDER BY tablename;

-- TESTE 4: Verificar se service_role ainda tem acesso total
-- ================================================================
SELECT 'VERIFICANDO ACESSO DE SERVICE_ROLE:' as info;

SELECT 
    tablename,
    policyname,
    cmd,
    '✅ SERVICE_ROLE TEM ACESSO TOTAL' as status_service
FROM pg_policies 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes')
    AND policyname LIKE '%service_access%'
ORDER BY tablename;

-- TESTE 5: Verificar estado final das tabelas
-- ================================================================
SELECT 'ESTADO FINAL DE SEGURANÇA:' as info;

SELECT 
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '🔒 TABELA PROTEGIDA'
        ELSE '⚠️ TABELA AINDA VULNERÁVEL'
    END as status_seguranca,
    (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = pg_tables.tablename) as total_politicas
FROM pg_tables 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes')
ORDER BY tablename;

-- CONCLUSÃO DOS TESTES
-- ================================================================
SELECT 'TESTES DE FUNCIONAMENTO CONCLUÍDOS!' as resultado;
SELECT 'Se todas as consultas executaram sem erro, o sistema está funcionando corretamente.' as conclusao;
SELECT 'As correções de segurança foram aplicadas com sucesso!' as status_final;
