-- ================================================================
-- APLICAÇÃO COMPLETA DE SEGURANÇA RLS - PROJETO ICTUS
-- Execute este script COMPLETO no SQL Editor do Supabase
-- Data: $(Get-Date)
-- ================================================================

-- PARTE 1: ANÁLISE ATUAL (PARA VERIFICAR ANTES)
-- ================================================================
SELECT 'ESTADO ATUAL DAS TABELAS:' as info;

SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ATIVO' 
        ELSE '🚨 RLS DESABILITADO' 
    END as status_rls
FROM pg_tables 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes')
ORDER BY tablename;

-- PARTE 2: APLICAÇÃO DAS CORREÇÕES
-- ================================================================

-- CORREÇÃO 1: TABELA api_usage
-- ================================================================
SELECT 'APLICANDO CORREÇÕES PARA api_usage...' as info;

ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Remover políticas conflitantes
DROP POLICY IF EXISTS "api_usage_user_isolation" ON public.api_usage;
DROP POLICY IF EXISTS "api_usage_service_access" ON public.api_usage;

-- Política principal: isolamento por usuário
CREATE POLICY "api_usage_user_isolation" ON public.api_usage
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política para serviços internos
CREATE POLICY "api_usage_service_access" ON public.api_usage
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- CORREÇÃO 2: TABELA telegram_users
-- ================================================================
SELECT 'APLICANDO CORREÇÕES PARA telegram_users...' as info;

ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;

-- Remover políticas conflitantes
DROP POLICY IF EXISTS "telegram_users_user_isolation" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_users_service_access" ON public.telegram_users;

-- Política principal: isolamento por usuário
CREATE POLICY "telegram_users_user_isolation" ON public.telegram_users
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política para serviços internos
CREATE POLICY "telegram_users_service_access" ON public.telegram_users
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- CORREÇÃO 3: TABELA telegram_link_codes
-- ================================================================
SELECT 'APLICANDO CORREÇÕES PARA telegram_link_codes...' as info;

ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- Remover políticas conflitantes
DROP POLICY IF EXISTS "telegram_link_codes_user_isolation" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_service_access" ON public.telegram_link_codes;

-- Política principal: isolamento por usuário
CREATE POLICY "telegram_link_codes_user_isolation" ON public.telegram_link_codes
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política para serviços internos
CREATE POLICY "telegram_link_codes_service_access" ON public.telegram_link_codes
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- PARTE 3: VALIDAÇÃO FINAL
-- ================================================================
SELECT 'VALIDANDO CORREÇÕES APLICADAS:' as info;

-- Verificar se RLS foi habilitado
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ATIVO' 
        ELSE '❌ RLS AINDA DESABILITADO' 
    END as status_final
FROM pg_tables 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes')
ORDER BY tablename;

-- Verificar políticas criadas
SELECT 
    tablename,
    policyname,
    cmd,
    '✅ POLÍTICA ATIVA' as status
FROM pg_policies 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes')
ORDER BY tablename, policyname;

-- CONCLUSÃO
SELECT 'CORREÇÕES DE SEGURANÇA APLICADAS COM SUCESSO!' as resultado;
SELECT 'As tabelas agora estão protegidas com RLS (Row Level Security)' as detalhes;
SELECT 'Cada usuário só pode acessar seus próprios dados' as garantia;
