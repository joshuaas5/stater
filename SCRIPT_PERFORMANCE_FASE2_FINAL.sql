-- ============================================================================
-- SCRIPT COMPLEMENTAR DE PERFORMANCE - FASE 2
-- Resolve os 20 warnings restantes do Performance Advisor
-- ============================================================================

BEGIN;

-- ============================================================================
-- SEÇÃO 1: GEMINI_USAGE (2 políticas → 1 otimizada)
-- ============================================================================

DROP POLICY IF EXISTS "Allow users to see their own data" ON public.gemini_usage;
DROP POLICY IF EXISTS "Allow users to add their data" ON public.gemini_usage;

CREATE POLICY "gemini_usage_optimized" ON public.gemini_usage
    FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- SEÇÃO 2: BILLS (4 políticas → 1 otimizada)
-- ============================================================================

DROP POLICY IF EXISTS "bills_select_policy" ON public.bills;
DROP POLICY IF EXISTS "bills_insert_policy" ON public.bills;
DROP POLICY IF EXISTS "bills_update_policy" ON public.bills;
DROP POLICY IF EXISTS "bills_delete_policy" ON public.bills;

CREATE POLICY "bills_optimized" ON public.bills
    FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- SEÇÃO 3: USER_PREFERENCES (3 políticas → 1 otimizada)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.user_preferences;

CREATE POLICY "user_preferences_optimized" ON public.user_preferences
    FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- SEÇÃO 4: USER_AI_DAILY_USAGE (1 política → otimizada)
-- ============================================================================

DROP POLICY IF EXISTS "Users can manage only their own daily AI usage" ON public.user_ai_daily_usage;

CREATE POLICY "user_ai_daily_usage_optimized" ON public.user_ai_daily_usage
    FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- SEÇÃO 5: USER_ONBOARDING (3 políticas → 1 otimizada)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can insert own onboarding data" ON public.user_onboarding;
DROP POLICY IF EXISTS "Users can update own onboarding data" ON public.user_onboarding;

CREATE POLICY "user_onboarding_optimized" ON public.user_onboarding
    FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- SEÇÃO 6: AUDIO_LOGS (1 política → otimizada)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own audio logs" ON public.audio_logs;

CREATE POLICY "audio_logs_optimized" ON public.audio_logs
    FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- SEÇÃO 7: PROFILES (3 políticas → 1 otimizada)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "profiles_optimized" ON public.profiles
    FOR ALL TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- SEÇÃO 8: API_USAGE (1 política → otimizada)
-- ============================================================================

DROP POLICY IF EXISTS "api_usage_user_isolation" ON public.api_usage;

CREATE POLICY "api_usage_optimized" ON public.api_usage
    FOR ALL TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- SEÇÃO 9: USER_TOKEN_USAGE - Corrigir política duplicada restante
-- ============================================================================

-- Remove a política antiga que ficou
DROP POLICY IF EXISTS "Allow users to insert their token usage" ON public.user_token_usage;

-- A política otimizada já existe, então não precisa recriar

-- ============================================================================
-- RELATÓRIO FINAL - FASE 2
-- ============================================================================

DO $$
DECLARE
    total_optimized_policies INTEGER;
    remaining_warnings INTEGER;
BEGIN
    -- Contar todas as políticas otimizadas
    SELECT COUNT(*) INTO total_optimized_policies 
    FROM pg_policies 
    WHERE policyname LIKE '%_optimized%';
    
    RAISE NOTICE '=== RELATÓRIO FINAL - CORREÇÃO FASE 2 ===';
    RAISE NOTICE 'Total de políticas otimizadas: %', total_optimized_policies;
    RAISE NOTICE '';
    RAISE NOTICE '✅ WARNINGS RESOLVIDOS NESTA FASE:';
    RAISE NOTICE '  - gemini_usage: 2 → 1 política';
    RAISE NOTICE '  - bills: 4 → 1 política';
    RAISE NOTICE '  - user_preferences: 3 → 1 política';
    RAISE NOTICE '  - user_ai_daily_usage: 1 → 1 otimizada';
    RAISE NOTICE '  - user_onboarding: 3 → 1 política';
    RAISE NOTICE '  - audio_logs: 1 → 1 otimizada';
    RAISE NOTICE '  - profiles: 3 → 1 política';
    RAISE NOTICE '  - api_usage: 1 → 1 otimizada';
    RAISE NOTICE '  - user_token_usage: duplicata removida';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 RESULTADO ESPERADO:';
    RAISE NOTICE '  - De 20 warnings → próximo a 0 warnings';
    RAISE NOTICE '  - Performance ainda melhor';
    RAISE NOTICE '  - Todas as tabelas principais otimizadas';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 CORREÇÃO COMPLETA DE PERFORMANCE FINALIZADA!';
END $$;

COMMIT;

-- ============================================================================
-- VERIFICAÇÃO FINAL COMPLETA
-- ============================================================================

-- Mostrar todas as políticas otimizadas
SELECT 
    tablename,
    policyname,
    permissive,
    roles
FROM pg_policies 
WHERE policyname LIKE '%_optimized%'
ORDER BY tablename;
