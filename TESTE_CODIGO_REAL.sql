-- TESTE ESPECÍFICO PARA IDENTIFICAR O PROBLEMA EXATO

-- 1. Verificar se conseguimos ver registros como service_role
SELECT 
    'ACESSO DIRETO:' as test,
    current_user as role_atual,
    session_user as session_role,
    COUNT(*) as total_registros
FROM telegram_link_codes;

-- 2. Criar código de teste com dados específicos do usuário
INSERT INTO telegram_link_codes (
    code,
    user_id,
    user_email,
    user_name,
    expires_at,
    created_at
) VALUES (
    '999888',
    '068371a3-c7fa-4285-8799-e10380c155a9',  -- Seu user_id real do console
    'usuario@stater.app',
    'Usuario Teste',
    NOW() + INTERVAL '1 hour',  -- Expira em 1 hora
    NOW()
) ON CONFLICT (code) DO UPDATE SET
    expires_at = NOW() + INTERVAL '1 hour',
    used_at = NULL;  -- Garantir que não está usado

-- 3. Verificar se o código foi inserido
SELECT 
    'CÓDIGO TESTE INSERIDO:' as status,
    code,
    user_id,
    created_at,
    expires_at,
    used_at,
    expires_at > NOW() as ainda_valido
FROM telegram_link_codes
WHERE code = '999888';

-- 4. Simular EXATAMENTE a query do webhook
SELECT 
    'SIMULAÇÃO WEBHOOK QUERY:' as test,
    user_id, 
    user_email, 
    user_name, 
    expires_at
FROM telegram_link_codes
WHERE code = '999888';

-- 5. Verificar se a comparação de data está funcionando
SELECT 
    'TESTE DE DATA:' as test,
    code,
    expires_at,
    NOW() as agora,
    expires_at > NOW() as nao_expirado,
    EXTRACT(EPOCH FROM expires_at) as expires_timestamp,
    EXTRACT(EPOCH FROM NOW()) as now_timestamp
FROM telegram_link_codes
WHERE code = '999888';

-- Para limpar depois dos testes:
-- DELETE FROM telegram_link_codes WHERE code = '999888';
