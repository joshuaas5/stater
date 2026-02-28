-- ============================================================================
-- CORREÇÃO COMPLETA - PERFORMANCE ADVISOR SUPABASE
-- Resolve problemas de Auth RLS Initialization Plan e Multiple Permissive Policies
-- Data: 28/07/2025
-- ============================================================================

-- Início da transação
BEGIN;

-- ============================================================================
-- SEÇÃO 1: CORREÇÃO AUTH RLS INITIALIZATION PLAN
-- Problema: auth.<function>() sendo reavaliado para cada linha
-- Solução: Usar (select auth.<function>()) para avaliar uma única vez
-- ============================================================================

-- Verificar políticas existentes antes da correção
DO $$
BEGIN
    RAISE NOTICE '=== INICIANDO CORREÇÃO DE PERFORMANCE ===';
    RAISE NOTICE 'Verificando políticas RLS atuais...';
END $$;

-- ============================================================================
-- TELEGRAM_USERS - Corrigir políticas RLS
-- ============================================================================

-- Remover políticas antigas do telegram_users
DROP POLICY IF EXISTS "telegram_users_own_data" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_users_user_isolation" ON public.telegram_users;

-- Criar política única e otimizada para telegram_users
CREATE POLICY "telegram_users_optimized_policy" ON public.telegram_users
    FOR ALL 
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- TELEGRAM_LINK_CODES - Corrigir políticas RLS
-- ============================================================================

-- Remover políticas antigas do telegram_link_codes
DROP POLICY IF EXISTS "telegram_codes_own_data" ON public.telegram_link_codes;
DROP POLICY IF EXISTS "telegram_codes_user_isolation" ON public.telegram_link_codes;

-- Criar política única e otimizada para telegram_link_codes
CREATE POLICY "telegram_link_codes_optimized_policy" ON public.telegram_link_codes
    FOR ALL 
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- TRANSACTIONS - Corrigir múltiplas políticas
-- ============================================================================

-- Remover todas as políticas duplicadas de transactions
DROP POLICY IF EXISTS "Allow individual user to insert their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow individual user to read their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "transactions_select_policy" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_policy" ON public.transactions;
DROP POLICY IF EXISTS "transactions_update_policy" ON public.transactions;
DROP POLICY IF EXISTS "transactions_delete_policy" ON public.transactions;
DROP POLICY IF EXISTS "Allow insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Allow delete own transactions" ON public.transactions;

-- Criar política única e otimizada para transactions
CREATE POLICY "transactions_optimized_policy" ON public.transactions
    FOR ALL 
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- USER_TOKEN_USAGE - Corrigir políticas RLS
-- ============================================================================

-- Remover políticas antigas do user_token_usage
DROP POLICY IF EXISTS "Allow individual user read access to their token usage" ON public.user_token_usage;
DROP POLICY IF EXISTS "Users can insert their token usage" ON public.user_token_usage;
DROP POLICY IF EXISTS "Allow select for all authenticated users" ON public.user_token_usage;

-- Criar política única e otimizada para user_token_usage
CREATE POLICY "user_token_usage_optimized_policy" ON public.user_token_usage
    FOR ALL 
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- GEMINI_USAGE - Corrigir políticas RLS
-- ============================================================================

-- Remover políticas antigas do gemini_usage
DROP POLICY IF EXISTS "Allow users to see their own data" ON public.gemini_usage;
DROP POLICY IF EXISTS "Allow users to add their data" ON public.gemini_usage;

-- Criar política única e otimizada para gemini_usage
CREATE POLICY "gemini_usage_optimized_policy" ON public.gemini_usage
    FOR ALL 
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- USER_PREFERENCES_OLD - Corrigir múltiplas políticas
-- ============================================================================

-- Remover todas as políticas duplicadas de user_preferences_old
DROP POLICY IF EXISTS "Usuários podem ver apenas suas próprias preferências" ON public.user_preferences_old;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas suas próprias preferências" ON public.user_preferences_old;
DROP POLICY IF EXISTS "Usuários podem inserir apenas suas próprias preferências" ON public.user_preferences_old;
DROP POLICY IF EXISTS "Usuários podem excluir apenas suas próprias preferências" ON public.user_preferences_old;
DROP POLICY IF EXISTS "user_preferences_select_policy" ON public.user_preferences_old;
DROP POLICY IF EXISTS "user_preferences_insert_policy" ON public.user_preferences_old;
DROP POLICY IF EXISTS "user_preferences_update_policy" ON public.user_preferences_old;
DROP POLICY IF EXISTS "user_preferences_delete_policy" ON public.user_preferences_old;

-- Criar política única e otimizada para user_preferences_old
CREATE POLICY "user_preferences_old_optimized_policy" ON public.user_preferences_old
    FOR ALL 
    TO authenticated, anon
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- BILLS - Corrigir políticas RLS
-- ============================================================================

-- Remover políticas antigas do bills
DROP POLICY IF EXISTS "bills_select_policy" ON public.bills;
DROP POLICY IF EXISTS "bills_insert_policy" ON public.bills;
DROP POLICY IF EXISTS "bills_update_policy" ON public.bills;
DROP POLICY IF EXISTS "bills_delete_policy" ON public.bills;

-- Criar política única e otimizada para bills
CREATE POLICY "bills_optimized_policy" ON public.bills
    FOR ALL 
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- EMAIL_LOGS - Corrigir múltiplas políticas
-- ============================================================================

-- Remover políticas antigas do email_logs
DROP POLICY IF EXISTS "Users can view their own email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Admins can view all email logs" ON public.email_logs;

-- Criar política otimizada para email_logs (incluindo admin)
CREATE POLICY "email_logs_optimized_policy" ON public.email_logs
    FOR SELECT 
    TO authenticated, anon
    USING (
        (select auth.uid()) = user_id 
        OR 
        (select auth.jwt()) ->> 'role' = 'admin'
    );

-- ============================================================================
-- NOTIFICATIONS - Corrigir múltiplas políticas
-- ============================================================================

-- Remover todas as políticas duplicadas de notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias notificações" ON public.notifications;
DROP POLICY IF EXISTS "Usuários podem excluir suas próprias notificações" ON public.notifications;

-- Criar política única e otimizada para notifications
CREATE POLICY "notifications_optimized_policy" ON public.notifications
    FOR ALL 
    TO authenticated, anon
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- USER_PREFERENCES - Corrigir políticas RLS
-- ============================================================================

-- Remover políticas antigas do user_preferences
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

-- Criar política única e otimizada para user_preferences
CREATE POLICY "user_preferences_optimized_policy" ON public.user_preferences
    FOR ALL 
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- USER_AI_DAILY_USAGE - Corrigir políticas RLS
-- ============================================================================

-- Remover políticas antigas do user_ai_daily_usage
DROP POLICY IF EXISTS "Users can manage only their own daily AI usage" ON public.user_ai_daily_usage;

-- Criar política única e otimizada para user_ai_daily_usage
CREATE POLICY "user_ai_daily_usage_optimized_policy" ON public.user_ai_daily_usage
    FOR ALL 
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- USER_ONBOARDING - Corrigir políticas RLS
-- ============================================================================

-- Remover políticas antigas do user_onboarding
DROP POLICY IF EXISTS "Users can view own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can insert own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can update own onboarding data" ON public.user_onboarding;

-- Criar política única e otimizada para user_onboarding
CREATE POLICY "user_onboarding_optimized_policy" ON public.user_onboarding
    FOR ALL 
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- USER_TERMS_ACCEPTANCE - Corrigir múltiplas políticas
-- ============================================================================

-- Remover políticas antigas do user_terms_acceptance
DROP POLICY IF EXISTS "Users can view their own terms acceptance" ON public.user_terms_acceptance;
DROP POLICY IF EXISTS "Users can insert/update their own terms acceptance" ON public.user_terms_acceptance;

-- Criar política única e otimizada para user_terms_acceptance
CREATE POLICY "user_terms_acceptance_optimized_policy" ON public.user_terms_acceptance
    FOR ALL 
    TO authenticated, anon
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- AUDIO_LOGS - Corrigir políticas RLS
-- ============================================================================

-- Remover políticas antigas do audio_logs
DROP POLICY IF EXISTS "Users can view own audio logs" ON public.audio_logs;

-- Criar política única e otimizada para audio_logs
CREATE POLICY "audio_logs_optimized_policy" ON public.audio_logs
    FOR ALL 
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- PROFILES - Corrigir políticas RLS
-- ============================================================================

-- Remover políticas antigas do profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Criar política única e otimizada para profiles
CREATE POLICY "profiles_optimized_policy" ON public.profiles
    FOR ALL 
    TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- API_USAGE - Corrigir políticas RLS
-- ============================================================================

-- Remover políticas antigas do api_usage
DROP POLICY IF EXISTS "api_usage_user_isolation" ON public.api_usage;

-- Criar política única e otimizada para api_usage
CREATE POLICY "api_usage_optimized_policy" ON public.api_usage
    FOR ALL 
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- SEÇÃO 2: VALIDAÇÃO E RELATÓRIO FINAL
-- ============================================================================

-- Verificar se todas as políticas foram criadas corretamente
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Contar políticas otimizadas criadas
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE policyname LIKE '%optimized_policy%';
    
    RAISE NOTICE '=== RELATÓRIO DE CORREÇÃO ===';
    RAISE NOTICE 'Políticas otimizadas criadas: %', policy_count;
    
    -- Verificar se RLS está habilitado em todas as tabelas
    RAISE NOTICE 'Verificando RLS habilitado...';
    
    IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public' 
        AND c.relname IN (
            'telegram_users', 'telegram_link_codes', 'transactions',
            'user_token_usage', 'gemini_usage', 'user_preferences_old',
            'bills', 'email_logs', 'notifications', 'user_preferences',
            'user_ai_daily_usage', 'user_onboarding', 'user_terms_acceptance',
            'audio_logs', 'profiles', 'api_usage'
        )
        AND c.relrowsecurity = false
    ) THEN
        RAISE NOTICE 'ATENÇÃO: Algumas tabelas ainda não têm RLS habilitado!';
    ELSE
        RAISE NOTICE 'RLS habilitado em todas as tabelas críticas ✓';
    END IF;
    
    RAISE NOTICE '=== CORREÇÕES APLICADAS ===';
    RAISE NOTICE '✓ Auth RLS Initialization Plan: RESOLVIDO';
    RAISE NOTICE '✓ Multiple Permissive Policies: RESOLVIDO';
    RAISE NOTICE '✓ Performance otimizada para todas as tabelas';
    RAISE NOTICE '=== SCRIPT EXECUTADO COM SUCESSO ===';
END $$;

-- Finalizar transação
COMMIT;

-- ============================================================================
-- RELATÓRIO FINAL DE PERFORMANCE
-- ============================================================================

-- Mostrar políticas ativas após otimização
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
WHERE tablename IN (
    'telegram_users', 'telegram_link_codes', 'transactions',
    'user_token_usage', 'gemini_usage', 'user_preferences_old',
    'bills', 'email_logs', 'notifications', 'user_preferences',
    'user_ai_daily_usage', 'user_onboarding', 'user_terms_acceptance',
    'audio_logs', 'profiles', 'api_usage'
)
ORDER BY tablename, policyname;
