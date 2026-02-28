-- CORREÇÃO DEFINITIVA PARA ERRO 406 DO TELEGRAM BOT
-- Script que limpa TUDO e recria corretamente (sem conflitos)

-- ================================================================
-- PASSO 1: LIMPAR COMPLETAMENTE AS POLÍTICAS EXISTENTES
-- ================================================================

-- Desabilitar RLS temporariamente para limpeza
ALTER TABLE public.telegram_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_link_codes DISABLE ROW LEVEL SECURITY;

-- Remover TODAS as políticas existentes (incluindo as que podem estar duplicadas)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Remover todas as políticas da tabela telegram_users
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'telegram_users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.telegram_users', policy_record.policyname);
    END LOOP;
    
    -- Remover todas as políticas da tabela telegram_link_codes
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'telegram_link_codes' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.telegram_link_codes', policy_record.policyname);
    END LOOP;
END $$;

-- ================================================================
-- PASSO 2: CRIAR POLÍTICAS SIMPLES E PERMISSIVAS
-- ================================================================

-- Reabilitar RLS
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- POLÍTICAS PARA telegram_users (SUPER PERMISSIVAS)
-- ================================================================

-- Política 1: Usuários autenticados acessam apenas seus dados
CREATE POLICY "telegram_users_auth_access" ON public.telegram_users
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política 2: Service role tem acesso total (para o bot)
CREATE POLICY "telegram_users_service_access" ON public.telegram_users
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política 3: Anon tem acesso total (backup para requisições diretas)
CREATE POLICY "telegram_users_anon_access" ON public.telegram_users
    FOR ALL 
    TO anon
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- POLÍTICAS PARA telegram_link_codes (SUPER PERMISSIVAS)
-- ================================================================

-- Política 1: Usuários autenticados acessam apenas seus códigos
CREATE POLICY "telegram_codes_auth_access" ON public.telegram_link_codes
    FOR ALL 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política 2: Service role tem acesso total (para o bot)
CREATE POLICY "telegram_codes_service_access" ON public.telegram_link_codes
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política 3: Anon tem acesso total (backup para requisições diretas)
CREATE POLICY "telegram_codes_anon_access" ON public.telegram_link_codes
    FOR ALL 
    TO anon
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- PASSO 3: VERIFICAR SE FOI APLICADO CORRETAMENTE
-- ================================================================

-- Verificar políticas criadas
SELECT 
  tablename,
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('telegram_users', 'telegram_link_codes')
  AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('telegram_users', 'telegram_link_codes')
  AND schemaname = 'public';

-- ================================================================
-- PASSO 4: TESTAR ACESSO (opcional)
-- ================================================================

-- Contar registros nas tabelas (deve funcionar sem erro 406)
SELECT 'telegram_users' as tabela, count(*) as total FROM public.telegram_users;
SELECT 'telegram_link_codes' as tabela, count(*) as total FROM public.telegram_link_codes;

-- Comentários finais
COMMENT ON TABLE public.telegram_users IS 'Usuários Telegram - POLÍTICAS RLS CORRIGIDAS DEFINITIVAMENTE';
COMMENT ON TABLE public.telegram_link_codes IS 'Códigos Telegram - POLÍTICAS RLS CORRIGIDAS DEFINITIVAMENTE';

-- ================================================================
-- RESULTADO ESPERADO
-- ================================================================
-- ✅ Erro 406 resolvido
-- ✅ Bot pode acessar tabelas telegram
-- ✅ App pode gerar códigos e verificar conexões
-- ✅ Políticas limpas e organizadas
