-- ================================================================
-- SCRIPT DE ROLLBACK - APENAS SE HOUVER PROBLEMAS
-- Execute apenas se as correções causarem problemas no app
-- ================================================================

SELECT '⚠️ EXECUTANDO ROLLBACK DE SEGURANÇA...' as aviso;

-- DESABILITAR RLS (apenas se necessário)
-- ALTER TABLE public.telegram_users DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.telegram_link_codes DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.audio_response_cache DISABLE ROW LEVEL SECURITY;

-- REMOVER POLÍTICAS (apenas se necessário)
-- DROP POLICY IF EXISTS "telegram_users_user_isolation" ON public.telegram_users;
-- DROP POLICY IF EXISTS "telegram_users_service_access" ON public.telegram_users;
-- DROP POLICY IF EXISTS "telegram_codes_user_isolation" ON public.telegram_link_codes;
-- DROP POLICY IF EXISTS "telegram_codes_service_access" ON public.telegram_link_codes;
-- DROP POLICY IF EXISTS "audio_cache_user_isolation" ON public.audio_response_cache;
-- DROP POLICY IF EXISTS "audio_cache_service_access" ON public.audio_response_cache;

SELECT 'Rollback em standby - remova os comentários apenas se necessário' as status;
