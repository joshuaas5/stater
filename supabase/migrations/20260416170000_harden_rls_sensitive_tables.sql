-- Security hardening migration
-- Objective: enforce RLS on sensitive/internal tables and avoid direct client access.

DO $$
BEGIN
  -- Ensure Gemini usage metrics are protected
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'gemini_usage'
  ) THEN
    EXECUTE 'ALTER TABLE public.gemini_usage ENABLE ROW LEVEL SECURITY';

    EXECUTE 'DROP POLICY IF EXISTS "Allow users to see their own data" ON public.gemini_usage';
    EXECUTE 'DROP POLICY IF EXISTS "Allow users to add their data" ON public.gemini_usage';
    EXECUTE 'DROP POLICY IF EXISTS "gemini_usage_optimized" ON public.gemini_usage';
    EXECUTE 'DROP POLICY IF EXISTS "gemini_usage_optimized_policy" ON public.gemini_usage';
    EXECUTE 'DROP POLICY IF EXISTS "gemini_usage_no_direct_access" ON public.gemini_usage';

    EXECUTE 'CREATE POLICY "gemini_usage_no_direct_access" ON public.gemini_usage FOR ALL USING (false) WITH CHECK (false)';
  END IF;

  -- Ensure optional system logs table is protected if present
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'system_logs'
  ) THEN
    EXECUTE 'ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "system_logs_no_direct_access" ON public.system_logs';
    EXECUTE 'CREATE POLICY "system_logs_no_direct_access" ON public.system_logs FOR ALL USING (false) WITH CHECK (false)';
  END IF;

  -- Safety: force RLS enabled for Telegram integration tables when available
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'telegram_users'
  ) THEN
    EXECUTE 'ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'telegram_link_codes'
  ) THEN
    EXECUTE 'ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY';
  END IF;

  -- Protect backup snapshot tables when they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'backup_policies'
  ) THEN
    EXECUTE 'ALTER TABLE public.backup_policies ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "backup_policies_no_direct_access" ON public.backup_policies';
    EXECUTE 'CREATE POLICY "backup_policies_no_direct_access" ON public.backup_policies FOR ALL USING (false) WITH CHECK (false)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'backup_security_state_20250728'
  ) THEN
    EXECUTE 'ALTER TABLE public.backup_security_state_20250728 ENABLE ROW LEVEL SECURITY';
    EXECUTE 'DROP POLICY IF EXISTS "backup_security_state_no_direct_access" ON public.backup_security_state_20250728';
    EXECUTE 'CREATE POLICY "backup_security_state_no_direct_access" ON public.backup_security_state_20250728 FOR ALL USING (false) WITH CHECK (false)';
  END IF;
END $$;