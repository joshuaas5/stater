const https = require('https');

// SQL para criar cron job
const sql = `
SELECT cron.schedule(
  'process-bill-reminders-daily',
  '0 11 * * *',
  $$
  SELECT net.http_post(
    url := 'https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/process-bill-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjEzMDMwOCwiZXhwIjoyMDYxNzA2MzA4fQ.LCCOutviXdakdnQlWbSMhLoMCzJUEG2CLWxgfxkseg0"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
`;

const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjEzMDMwOCwiZXhwIjoyMDYxNzA2MzA4fQ.LCCOutviXdakdnQlWbSMhLoMCzJUEG2CLWxgfxkseg0';

// Usar a API de management do Supabase não é possível via REST simples
// Vamos apenas mostrar o SQL para copiar

console.log('===========================================');
console.log('COPIE E COLE NO SQL EDITOR DO SUPABASE:');
console.log('Dashboard > SQL Editor > New Query');
console.log('===========================================\n');

console.log(`-- 1. Primeiro, habilite a extensão pg_cron no Dashboard:
-- Database > Extensions > Procure "pg_cron" > Enable

-- 2. Depois execute este SQL:

-- Habilitar pg_net se não estiver
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar o cron job para lembretes de contas (8:00 BRT = 11:00 UTC)
SELECT cron.schedule(
  'process-bill-reminders-daily',
  '0 11 * * *',
  $$
  SELECT net.http_post(
    url := 'https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/process-bill-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer ${serviceKey}"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

-- Verificar se foi criado
SELECT * FROM cron.job;
`);

console.log('\n===========================================');
console.log('Após executar, você verá o job agendado!');
console.log('===========================================');
