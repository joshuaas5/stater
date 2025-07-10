-- CORREÇÃO COMPLETA PARA ERRO 406 DO TELEGRAM BOT
-- Este script corrige políticas RLS e acesso às tabelas telegram

-- ================================================================
-- VERIFICAR E CRIAR TABELAS (se necessário)
-- ================================================================

-- Garantir que as tabelas existam com estrutura correta
CREATE TABLE IF NOT EXISTS public.telegram_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_chat_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.telegram_link_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NULL
);

-- ================================================================
-- DESABILITAR RLS TEMPORARIAMENTE PARA CORREÇÃO
-- ================================================================

-- Desabilitar RLS nas tabelas telegram para evitar erro 406
ALTER TABLE public.telegram_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_link_codes DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ================================================================

-- Remover políticas telegram_users
DROP POLICY IF EXISTS "telegram_users_user_isolation" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_users_service_access" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_users_select" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_users_insert" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_users_update" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_users_delete" ON public.telegram_users;
DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias vinculações" ON public.telegram_users;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias vinculações" ON public.telegram_users;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas próprias vinculações" ON public.telegram_users;
DROP POLICY IF EXISTS "Usuários podem deletar apenas suas próprias vinculações" ON public.telegram_users;

-- Remover políticas telegram_link_codes
DROP POLICY IF EXISTS "telegram_link_codes_user_isolation" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_creation" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_unlinked_read" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_select" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_insert" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_update" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_delete" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios códigos" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios códigos" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seus próprios códigos" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "Usuários podem deletar apenas seus próprios códigos" ON public.telegram_link_codes;

-- ================================================================
-- HABILITAR RLS E CRIAR POLÍTICAS SIMPLES
-- ================================================================

-- Habilitar RLS
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- POLÍTICAS PERMISSIVAS PARA telegram_users
-- ================================================================

-- Política para usuários autenticados (app)
CREATE POLICY "telegram_users_authenticated_access" ON public.telegram_users
    FOR ALL 
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Política para service_role (bot do Telegram)
CREATE POLICY "telegram_users_service_role_access" ON public.telegram_users
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política para anon (requisições do bot)
CREATE POLICY "telegram_users_anon_access" ON public.telegram_users
    FOR ALL 
    TO anon
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- POLÍTICAS PERMISSIVAS PARA telegram_link_codes
-- ================================================================

-- Política para usuários autenticados (app)
CREATE POLICY "telegram_link_codes_authenticated_access" ON public.telegram_link_codes
    FOR ALL 
    USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
    WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Política para service_role (bot do Telegram)
CREATE POLICY "telegram_link_codes_service_role_access" ON public.telegram_link_codes
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política para anon (requisições do bot)
CREATE POLICY "telegram_link_codes_anon_access" ON public.telegram_link_codes
    FOR ALL 
    TO anon
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_telegram_users_chat_id ON public.telegram_users(telegram_chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_user_id ON public.telegram_users(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_users_is_active ON public.telegram_users(is_active);
CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_code ON public.telegram_link_codes(code);
CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_expires_at ON public.telegram_link_codes(expires_at);

-- ================================================================
-- VERIFICAR ESTRUTURA DAS TABELAS
-- ================================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'telegram_users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'telegram_link_codes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- ================================================================
-- VERIFICAR POLÍTICAS CRIADAS
-- ================================================================

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
WHERE tablename IN ('telegram_users', 'telegram_link_codes')
ORDER BY tablename, policyname;

COMMENT ON TABLE public.telegram_users IS 'Usuários conectados ao bot Telegram - POLÍTICAS CORRIGIDAS';
COMMENT ON TABLE public.telegram_link_codes IS 'Códigos temporários para vinculação Telegram - POLÍTICAS CORRIGIDAS';
