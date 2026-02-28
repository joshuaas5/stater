-- ========================================
-- 🧹 LIMPAR COMPLETAMENTE E RECRIAR CRON
-- ========================================

-- 1. Listar TODOS os jobs ativos para identificar o jobid
SELECT jobid, jobname, schedule 
FROM cron.job 
ORDER BY jobid;

-- 2. DELETAR o job usando cron.unschedule (substitui DELETE)
-- ⚠️ Se houver múltiplos jobs com mesmo nome, rode este bloco múltiplas vezes
SELECT cron.unschedule('weekly-email-digest');

-- 3. Verificar se deletou (deve retornar vazio)
SELECT * FROM cron.job WHERE jobname = 'weekly-email-digest';

-- 3. Habilitar extensões (garantir que estão ativas)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 4. Criar tabela de preferências (se não existir)
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 5. RLS e políticas
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own preferences" ON user_notification_preferences;
CREATE POLICY "Users can view own preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_notification_preferences;
CREATE POLICY "Users can update own preferences" ON user_notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_notification_preferences;
CREATE POLICY "Users can insert own preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Criar o NOVO job com a key embedada
SELECT cron.schedule(
  'weekly-email-digest',
  '0 11 * * 1',
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

-- ========================================
-- ✅ VERIFICAÇÕES FINAIS
-- ========================================

-- Ver o job criado (deve ter APENAS 1 job com jobname = 'weekly-email-digest')
SELECT jobid, jobname, schedule, command 
FROM cron.job 
WHERE jobname = 'weekly-email-digest';

-- Ver TODOS os jobs ativos
SELECT jobid, jobname, schedule 
FROM cron.job 
ORDER BY jobid;

-- ========================================
-- 🧪 TESTE MANUAL (descomente para testar AGORA)
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
-- 📊 HISTÓRICO DE EXECUÇÕES (últimas 10)
-- ========================================
SELECT jobid, runid, status, return_message, start_time 
FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;
