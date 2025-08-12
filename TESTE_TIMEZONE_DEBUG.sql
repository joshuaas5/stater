-- TESTE DE TIMEZONE E DEBUGGING ESPECÍFICO

-- 1. Verificar timezone do banco
SELECT 
    'TIMEZONE INFO:' as info,
    NOW() as server_time,
    CURRENT_TIMESTAMP as current_timestamp,
    timezone('UTC', NOW()) as utc_time;

-- 2. Criar um código de teste manual
INSERT INTO telegram_link_codes (
    code,
    user_id,
    user_email,
    user_name,
    expires_at,
    created_at
) VALUES (
    'TEST99',
    '068371a3-c7fa-4285-8799-e10380c155a9',
    'test@test.com',
    'Test User',
    NOW() + INTERVAL '15 minutes',
    NOW()
);

-- 3. Verificar se o código foi criado
SELECT 
    'CÓDIGO TESTE CRIADO:' as info,
    code,
    user_id,
    created_at,
    expires_at,
    expires_at > NOW() as is_valid,
    used_at
FROM telegram_link_codes
WHERE code = 'TEST99';

-- 4. Simular a query que o webhook faz
SELECT 
    'SIMULAÇÃO WEBHOOK:' as info,
    user_id, 
    user_email, 
    user_name, 
    expires_at,
    NOW() as current_time,
    expires_at > NOW() as not_expired
FROM telegram_link_codes
WHERE code = 'TEST99';

-- 5. Limpar o teste
-- DELETE FROM telegram_link_codes WHERE code = 'TEST99';
