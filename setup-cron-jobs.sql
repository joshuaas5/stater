-- ========================================
-- CONFIGURAR CRON JOB PARA LEMBRETES DE CONTAS
-- ========================================

-- 1. Habilitar a extensão pg_cron (se ainda não estiver)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Permitir uso do schema cron
GRANT USAGE ON SCHEMA cron TO postgres;

-- 3. Criar o cron job para processar lembretes de contas
-- Executa todos os dias às 8:00 AM (horário UTC)
-- Para Brasil (UTC-3), isso será às 5:00 AM local

SELECT cron.schedule(
  'process-bill-reminders-daily',        -- nome do job
  '0 8 * * *',                           -- cron expression: 8:00 UTC diariamente
  $$
  SELECT net.http_post(
    url := 'https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/process-bill-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 4. Criar cron job para resumo semanal (aos domingos às 10:00 UTC)
SELECT cron.schedule(
  'send-weekly-summary',
  '0 10 * * 0',                          -- Domingo às 10:00 UTC
  $$
  SELECT net.http_post(
    url := 'https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/send-weekly-summary',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );
  $$
);

-- 5. Verificar jobs agendados
SELECT * FROM cron.job;

-- ========================================
-- NOTA: Se preferir horário brasileiro (8:00 BRT)
-- Use '0 11 * * *' (11:00 UTC = 8:00 BRT)
-- ========================================
