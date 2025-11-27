-- ========================================
-- CONFIGURAR CRON JOB PARA LEMBRETES DE CONTAS
-- VERSÃO: SEMANAL (economiza emails - 3000/mês limite)
-- ========================================

-- 1. Habilitar a extensão pg_cron (se ainda não estiver)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Permitir uso do schema cron
GRANT USAGE ON SCHEMA cron TO postgres;

-- 3. Remover cron job diário antigo (se existir)
SELECT cron.unschedule('process-bill-reminders-daily');

-- 4. Criar o cron job SEMANAL para processar lembretes de contas
-- Executa toda SEGUNDA-FEIRA às 11:00 UTC (8:00 BRT)
-- Só envia email para usuários com contas vencendo nos próximos 7 dias

SELECT cron.schedule(
  'process-bill-reminders-weekly',       -- nome do job (mudou de daily para weekly)
  '0 11 * * 1',                          -- cron: Segunda-feira às 11:00 UTC (8:00 BRT)
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

-- 5. Remover job de resumo semanal duplicado (agora é tudo em um)
SELECT cron.unschedule('send-weekly-summary');

-- 6. Verificar jobs agendados
SELECT * FROM cron.job;

-- ========================================
-- EXPLICAÇÃO:
-- - Roda 1x por semana (segunda às 8:00 BRT)
-- - Só envia para quem tem contas vencendo em 0-7 dias
-- - Inclui contas vencidas no email
-- - Economiza limite de 3000 emails/mês do Resend
-- 
-- Com 3000 emails/mês e envio semanal:
-- - 3000 / 4 semanas = 750 usuários por semana
-- - Muito melhor que 100/dia do plano diário!
-- ========================================
