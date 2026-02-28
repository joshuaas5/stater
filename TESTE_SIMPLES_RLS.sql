-- TESTE SIMPLES PARA VERIFICAR SE O PROBLEMA FOI RESOLVIDO

-- 1. Verificar se as políticas estão corretas
SELECT 
    'POLÍTICAS ATUAIS:' as info,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'telegram_link_codes'
ORDER BY policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
    'RLS STATUS:' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'telegram_link_codes';

-- 3. Testar se service_role consegue acessar
SELECT 
    'TESTE ACCESS:' as info,
    COUNT(*) as total_records
FROM telegram_link_codes;

-- 4. Verificar códigos válidos (não expirados e não usados)
SELECT 
    'CÓDIGOS VÁLIDOS:' as info,
    LEFT(code, 3) || '***' as code_partial,
    user_id,
    created_at,
    expires_at,
    used_at,
    CASE 
        WHEN used_at IS NOT NULL THEN '❌ USADO'
        WHEN expires_at < NOW() THEN '⏰ EXPIRADO'
        ELSE '✅ VÁLIDO'
    END as status
FROM telegram_link_codes
ORDER BY created_at DESC
LIMIT 5;
