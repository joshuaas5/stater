-- ========================================
-- ðŸ”§ FIX: CRON JOB PARA EMAILS SEMANAIS
-- Execute no Supabase SQL Editor
-- ========================================

-- 0. Criar tabela de preferÃªncias (se nÃ£o existir)
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS para a tabela
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- PolÃ­ticas
DROP POLICY IF EXISTS "Users can view own preferences" ON user_notification_preferences;
CREATE POLICY "Users can view own preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_notification_preferences;
CREATE POLICY "Users can update own preferences" ON user_notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_notification_preferences;
CREATE POLICY "Users can insert own preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 1. Habilitar extensÃµes necessÃ¡rias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Remover job antigo (se existir)
DO $$
BEGIN
  PERFORM cron.unschedule('weekly-email-digest');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 3. Criar o cron job com a service_role_key fixa
-- âš ï¸ IMPORTANTE: A key estÃ¡ embedada diretamente para garantir funcionamento
SELECT cron.schedule(
  'weekly-email-digest',                 -- nome do job
  '0 11 * * 1',                          -- Segunda-feira Ã s 11:00 UTC (8:00 BRT)
  $$
  SELECT net.http_post(
    url := 'https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/weekly-email-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_JWT_TOKEN'
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 4. Verificar se o job foi criado
SELECT jobid, jobname, schedule, command 
FROM cron.job 
WHERE jobname = 'weekly-email-digest';

-- ========================================
-- ðŸ“‹ VERIFICAÃ‡Ã•ES ADICIONAIS
-- ========================================

-- Ver todos os jobs
SELECT * FROM cron.job;

-- Ver histÃ³rico de execuÃ§Ãµes (Ãºltimas 20)
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;

-- ========================================
-- ðŸ§ª TESTAR MANUALMENTE
-- Execute isso para disparar AGORA (teste):
-- ========================================
/*
SELECT net.http_post(
  url := 'https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/weekly-email-digest',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer YOUR_JWT_TOKEN'
  ),
  body := '{}'::jsonb
);
*/

-- ========================================
-- ðŸ“… EXPLICAÃ‡ÃƒO DO CRON
-- '0 11 * * 1' significa:
--   0 = minuto 0
--   11 = hora 11 UTC (8:00 BRT)
--   * = qualquer dia do mÃªs
--   * = qualquer mÃªs
--   1 = segunda-feira (0=domingo, 1=segunda, etc)
-- ========================================
