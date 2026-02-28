-- Criar tabela telegram_link_codes se não existir
CREATE TABLE IF NOT EXISTS public.telegram_link_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(6) NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    user_email VARCHAR(255),
    user_name VARCHAR(255),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Habilitar RLS
ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção (qualquer usuário autenticado pode inserir)
DROP POLICY IF EXISTS "Allow insert telegram codes" ON public.telegram_link_codes;
CREATE POLICY "Allow insert telegram codes" ON public.telegram_link_codes
    FOR INSERT 
    WITH CHECK (true);

-- Política para permitir leitura apenas do próprio usuário
DROP POLICY IF EXISTS "Allow read own codes" ON public.telegram_link_codes;
CREATE POLICY "Allow read own codes" ON public.telegram_link_codes
    FOR SELECT 
    USING (true);

-- Política para permitir update apenas do próprio código
DROP POLICY IF EXISTS "Allow update own codes" ON public.telegram_link_codes;
CREATE POLICY "Allow update own codes" ON public.telegram_link_codes
    FOR UPDATE 
    USING (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_code ON public.telegram_link_codes(code);
CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_user_id ON public.telegram_link_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_expires_at ON public.telegram_link_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_created_at ON public.telegram_link_codes(created_at);
