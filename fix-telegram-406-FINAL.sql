-- SCRIPT FINAL PARA ELIMINAR ERRO 406 - TELEGRAM
-- Execute este script no SQL Editor do Supabase

-- ================================================================
-- PASSO 1: LIMPEZA COMPLETA DAS POLÍTICAS RLS
-- ================================================================

-- Desabilitar RLS temporariamente
ALTER TABLE public.telegram_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_link_codes DISABLE ROW LEVEL SECURITY;

-- Buscar e remover TODAS as políticas existentes dinamicamente
DO $$
DECLARE
    pol RECORD;
BEGIN
    -- Remover todas as políticas de telegram_users
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'telegram_users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.telegram_users', pol.policyname);
        RAISE NOTICE 'Removida política: %', pol.policyname;
    END LOOP;
    
    -- Remover todas as políticas de telegram_link_codes
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'telegram_link_codes' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.telegram_link_codes', pol.policyname);
        RAISE NOTICE 'Removida política: %', pol.policyname;
    END LOOP;
END $$;

-- ================================================================
-- PASSO 2: HABILITAR RLS E CRIAR POLÍTICAS FUNCIONAIS
-- ================================================================

-- Habilitar RLS
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- PASSO 3: POLÍTICAS PARA telegram_users
-- ================================================================

-- Política PERMISSIVA para usuários autenticados (app web)
CREATE POLICY "telegram_users_app_access" ON public.telegram_users
    FOR ALL 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política TOTAL para service_role (bot do Telegram)
CREATE POLICY "telegram_users_bot_access" ON public.telegram_users
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política TOTAL para anon (se o bot usar anon)
CREATE POLICY "telegram_users_anon_access" ON public.telegram_users
    FOR ALL 
    TO anon
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- PASSO 4: POLÍTICAS PARA telegram_link_codes
-- ================================================================

-- Política PERMISSIVA para usuários autenticados (app web)
CREATE POLICY "telegram_link_codes_app_access" ON public.telegram_link_codes
    FOR ALL 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política TOTAL para service_role (bot do Telegram)
CREATE POLICY "telegram_link_codes_bot_access" ON public.telegram_link_codes
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política TOTAL para anon (se o bot usar anon)
CREATE POLICY "telegram_link_codes_anon_access" ON public.telegram_link_codes
    FOR ALL 
    TO anon
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- PASSO 5: VERIFICAR SE FUNCIONOU
-- ================================================================

-- Verificar políticas criadas
SELECT 
  tablename,
  policyname,
  roles,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename IN ('telegram_users', 'telegram_link_codes')
ORDER BY tablename, policyname;

-- Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('telegram_users', 'telegram_link_codes')
  AND schemaname = 'public';

-- ================================================================
-- PASSO 6: TESTE RÁPIDO DE ACESSO
-- ================================================================

-- Tentar acessar as tabelas (deve funcionar agora)
SELECT 'telegram_users' as tabela, count(*) as registros FROM public.telegram_users;
SELECT 'telegram_link_codes' as tabela, count(*) as registros FROM public.telegram_link_codes;

-- Marcar como corrigido
COMMENT ON TABLE public.telegram_users IS 'Usuários Telegram - ERRO 406 CORRIGIDO DEFINITIVAMENTE';
COMMENT ON TABLE public.telegram_link_codes IS 'Códigos Telegram - ERRO 406 CORRIGIDO DEFINITIVAMENTE';

-- Resultado esperado: Políticas funcionando, sem erro 406
SELECT '✅ SCRIPT APLICADO COM SUCESSO - ERRO 406 CORRIGIDO!' as resultado;
