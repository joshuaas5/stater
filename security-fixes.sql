-- ================================================================
-- CORREÇÃO CRÍTICA DE SEGURANÇA - APLICAÇÃO DE RLS
-- Execute este script após revisar os resultados da análise
-- ================================================================

-- BACKUP: Criar snapshot das políticas atuais antes da mudança
-- (Execute apenas se desejar backup das políticas existentes)
/*
CREATE TABLE IF NOT EXISTS backup_policies AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual,
    with_check,
    current_timestamp as backup_date
FROM pg_policies 
WHERE tablename IN ('api_usage', 'telegram_users', 'telegram_link_codes');
*/

-- ================================================================
-- CORREÇÃO 1: TABELA api_usage
-- ================================================================

-- Habilitar RLS
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver (para evitar conflitos)
DROP POLICY IF EXISTS "api_usage_user_isolation" ON public.api_usage;
DROP POLICY IF EXISTS "api_usage_select" ON public.api_usage;
DROP POLICY IF EXISTS "api_usage_insert" ON public.api_usage;
DROP POLICY IF EXISTS "api_usage_update" ON public.api_usage;
DROP POLICY IF EXISTS "api_usage_delete" ON public.api_usage;

-- Política principal: usuários só acessam seus próprios dados
CREATE POLICY "api_usage_user_isolation" ON public.api_usage
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política especial para serviços internos (se necessário)
-- Permite que funções de sistema acessem sem restrições
CREATE POLICY "api_usage_service_access" ON public.api_usage
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- CORREÇÃO 2: TABELA telegram_users
-- ================================================================

-- Habilitar RLS
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "telegram_users_user_isolation" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_users_select" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_users_insert" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_users_update" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_users_delete" ON public.telegram_users;

-- Política principal: usuários só acessam suas próprias conexões
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

-- ================================================================
-- CORREÇÃO 3: TABELA telegram_link_codes
-- ================================================================

-- Habilitar RLS
ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "telegram_link_codes_user_isolation" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_creation" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_unlinked_read" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_select" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_insert" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_update" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_link_codes_delete" ON public.telegram_link_codes;

-- Política 1: Usuários acessam apenas seus códigos vinculados
CREATE POLICY "telegram_link_codes_user_isolation" ON public.telegram_link_codes
    FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política 2: Permite criação de códigos não vinculados (para linking inicial)
CREATE POLICY "telegram_link_codes_creation" ON public.telegram_link_codes
    FOR INSERT 
    WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Política 3: Permite leitura de códigos não vinculados (processo de linking)
-- CRÍTICO: Esta política é necessária para o funcionamento do bot
CREATE POLICY "telegram_link_codes_unlinked_read" ON public.telegram_link_codes
    FOR SELECT 
    USING (user_id IS NULL OR user_id = auth.uid());

-- Política 4: Permite atualização de códigos não vinculados para vinculá-los
CREATE POLICY "telegram_link_codes_linking_update" ON public.telegram_link_codes
    FOR UPDATE 
    USING (user_id IS NULL) -- Só pode atualizar se ainda não está vinculado
    WITH CHECK (user_id = auth.uid()); -- Depois da atualização, deve ser do usuário atual

-- Política para serviços internos
CREATE POLICY "telegram_link_codes_service_access" ON public.telegram_link_codes
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- VERIFICAÇÃO FINAL
-- ================================================================

-- Verificar se RLS foi habilitado corretamente
SELECT 
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ATIVO - SEGURO' 
        ELSE '🚨 RLS FALHOU - VERIFICAR' 
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
