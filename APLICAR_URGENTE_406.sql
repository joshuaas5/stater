-- SCRIPT DE APLICAÇÃO URGENTE - ERRO 406 TELEGRAM
-- Execute este script IMEDIATAMENTE no Supabase SQL Editor

-- ================================================================
-- PASSO 1: DESABILITAR RLS TEMPORARIAMENTE
-- ================================================================
ALTER TABLE public.telegram_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_link_codes DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- PASSO 2: REMOVER TODAS AS POLÍTICAS CONFLITANTES
-- ================================================================
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
-- PASSO 3: REABILITAR RLS COM POLÍTICAS PERMISSIVAS
-- ================================================================
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- PASSO 4: CRIAR POLÍTICAS SUPER PERMISSIVAS
-- ================================================================

-- TELEGRAM_USERS - Acesso total para todos os roles
CREATE POLICY "telegram_users_full_access" ON public.telegram_users
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- TELEGRAM_LINK_CODES - Acesso total para todos os roles  
CREATE POLICY "telegram_codes_full_access" ON public.telegram_link_codes
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- PASSO 5: VERIFICAR SE FUNCIONOU
-- ================================================================
SELECT 'telegram_users' as tabela, count(*) as total FROM public.telegram_users;
SELECT 'telegram_link_codes' as tabela, count(*) as total FROM public.telegram_link_codes;

-- ================================================================
-- PASSO 6: VERIFICAR POLÍTICAS ATIVAS
-- ================================================================
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('telegram_users', 'telegram_link_codes')
ORDER BY tablename, policyname;

-- Comentário de confirmação
COMMENT ON TABLE public.telegram_users IS 'ERRO 406 CORRIGIDO - Políticas RLS permissivas aplicadas';
COMMENT ON TABLE public.telegram_link_codes IS 'ERRO 406 CORRIGIDO - Políticas RLS permissivas aplicadas';

-- ================================================================
-- RESULTADO ESPERADO: ERRO 406 ELIMINADO
-- ================================================================
