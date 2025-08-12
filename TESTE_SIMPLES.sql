-- DIAGNÓSTICO DIRETO - SEM COMPLICAÇÃO

-- 1. Desabilitar RLS temporariamente para testar
ALTER TABLE telegram_link_codes DISABLE ROW LEVEL SECURITY;

-- 2. Criar um código simples para teste
INSERT INTO telegram_link_codes (code, user_id, user_email, user_name, expires_at, created_at)
VALUES ('123456', '068371a3-c7fa-4285-8799-e10380c155a9', 'test@test.com', 'Test', NOW() + INTERVAL '2 hours', NOW())
ON CONFLICT (code) DO UPDATE SET expires_at = NOW() + INTERVAL '2 hours', used_at = NULL;

-- 3. Verificar se foi criado
SELECT * FROM telegram_link_codes WHERE code = '123456';

-- 4. Reabilitar RLS depois do teste
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;
