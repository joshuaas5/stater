// Executar SQL via Supabase API
// node run-sql-api.js

async function runSQL() {
  // Service Role Key do Supabase (tem permissão total)
  const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';
  
  // ⚠️ COLE SUA SERVICE_ROLE_KEY AQUI
  // Pegue em: Supabase Dashboard > Settings > API > service_role (secret)
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_JWT_TOKEN';

  const sql = `
    -- Remover job antigo se existir
    DO $$ BEGIN PERFORM cron.unschedule('weekly-email-digest'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
    
    -- Criar job
    SELECT cron.schedule(
      'weekly-email-digest',
      '0 11 * * 1',
      $$SELECT net.http_post(
        url := 'https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/weekly-email-digest',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')),
        body := '{}'::jsonb
      );$$
    );
  `;

  console.log('🔧 Configurando CRON job via Supabase API...\n');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({})
    });

    // A API REST não permite executar SQL arbitrário
    // Precisamos de outra abordagem...
    
    console.log('⚠️ A API REST do Supabase não permite executar SQL arbitrário.');
    console.log('');
    console.log('📋 SOLUÇÃO: Execute este SQL manualmente no Supabase Dashboard:');
    console.log('');
    console.log('1. Acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/sql');
    console.log('2. Cole e execute:');
    console.log('');
    console.log('─'.repeat(60));
    console.log(`
-- Remover job antigo se existir
DO $$ 
BEGIN 
  PERFORM cron.unschedule('weekly-email-digest'); 
EXCEPTION WHEN OTHERS THEN 
  NULL; 
END $$;

-- Criar novo job
SELECT cron.schedule(
  'weekly-email-digest',
  '0 11 * * 1',
  $$SELECT net.http_post(
    url := 'https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/weekly-email-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  );$$
);

-- Verificar
SELECT * FROM cron.job;
`);
    console.log('─'.repeat(60));
    console.log('');
    console.log('3. Para TESTAR AGORA (enviar emails):');
    console.log('   - Vá em Edge Functions > weekly-email-digest > Test');
    console.log('   - Ou acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/functions');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

runSQL();
