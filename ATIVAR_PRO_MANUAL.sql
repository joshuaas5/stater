-- 🔥 ATIVAR PRO MANUALMENTE PARA UM USUÁRIO
-- Execute este SQL no Supabase SQL Editor para ativar o plano PRO imediatamente

-- 1. Primeiro, descubra o user_id do usuário pelo email
-- (Substitua 'SEU_EMAIL@AQUI.COM' pelo email real)
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'SEU_EMAIL@AQUI.COM';

-- 2. Depois de encontrar o user_id, rode o comando abaixo 
-- (Substitua 'USER_ID_AQUI' pelo UUID encontrado)

-- Opção A: Se o usuário NÃO tem registro em user_plans ainda:
INSERT INTO user_plans (
    user_id,
    plan_type,
    is_active,
    start_date,
    expires_at,
    is_on_trial,
    payment_status,
    product_id,
    updated_at
) VALUES (
    'USER_ID_AQUI', -- ← Substitua pelo UUID do usuário
    'pro',
    true,
    NOW(),
    NOW() + INTERVAL '30 days', -- 30 dias de PRO
    false,
    'active',
    'stater_pro_1490',
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'pro',
    is_active = true,
    start_date = NOW(),
    expires_at = NOW() + INTERVAL '30 days',
    is_on_trial = false,
    payment_status = 'active',
    product_id = 'stater_pro_1490',
    updated_at = NOW();

-- 3. Verificar se funcionou:
SELECT * FROM user_plans WHERE user_id = 'USER_ID_AQUI';

-- ==========================================
-- EXEMPLO COMPLETO (se você já sabe o email):
-- ==========================================

-- Ativar PRO para joshuaas500@gmail.com (exemplo):
-- Passo 1: Encontrar o ID
-- SELECT id FROM auth.users WHERE email = 'joshuaas500@gmail.com';
-- Passo 2: Usar o ID retornado no INSERT acima

-- ==========================================
-- MODO AUTOMÁTICO (usando email diretamente):
-- ==========================================

-- Este comando funciona SEM precisar do UUID:
-- (Basta substituir o email)

/*
INSERT INTO user_plans (user_id, plan_type, is_active, start_date, expires_at, payment_status, product_id, updated_at)
SELECT 
    id,
    'pro',
    true,
    NOW(),
    NOW() + INTERVAL '30 days',
    'active',
    'stater_pro_1490',
    NOW()
FROM auth.users 
WHERE email = 'SEU_EMAIL@AQUI.COM'
ON CONFLICT (user_id) DO UPDATE SET
    plan_type = 'pro',
    is_active = true,
    start_date = NOW(),
    expires_at = NOW() + INTERVAL '30 days',
    payment_status = 'active',
    product_id = 'stater_pro_1490',
    updated_at = NOW();
*/
