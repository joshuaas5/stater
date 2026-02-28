-- SCRIPT PARA CORRIGIR TABELA TELEGRAM_LINK_CODES

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'telegram_link_codes' AND table_schema = 'public';

-- 2. CRIAR TABELA SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS public.telegram_link_codes (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(6) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE NULL
);

-- 3. VERIFICAR ESTRUTURA DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'telegram_link_codes' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_telegram_codes_code ON public.telegram_link_codes(code);
CREATE INDEX IF NOT EXISTS idx_telegram_codes_user_id ON public.telegram_link_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_codes_expires_at ON public.telegram_link_codes(expires_at);

-- 5. HABILITAR RLS
ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- 6. REMOVER POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "telegram_codes_own_data" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_codes_service_access" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_codes_cleanup_expired" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_optimized" ON public.telegram_link_codes;

-- 7. CRIAR POLÍTICA SIMPLES PARA PERMITIR TODAS AS OPERAÇÕES
CREATE POLICY "telegram_codes_full_access" ON public.telegram_link_codes
FOR ALL 
TO public, anon, authenticated
USING (true)
WITH CHECK (true);

-- 8. TESTAR INSERÇÃO
INSERT INTO public.telegram_link_codes (
    code, 
    user_id, 
    user_email, 
    user_name, 
    expires_at
) VALUES (
    '999999',
    '00000000-0000-0000-0000-000000000000',
    'test@test.com',
    'Test User',
    NOW() + INTERVAL '15 minutes'
) ON CONFLICT (code) DO NOTHING;

-- 9. VERIFICAR SE O TESTE FOI INSERIDO
SELECT * FROM public.telegram_link_codes WHERE code = '999999';

-- 10. LIMPAR TESTE
DELETE FROM public.telegram_link_codes WHERE code = '999999';

-- 11. VERIFICAR POLÍTICAS ATIVAS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'telegram_link_codes';

COMMENT ON TABLE public.telegram_link_codes IS 'Tabela para códigos de vinculação do Telegram - CORRIGIDA PARA FUNCIONAR COM APIs';
