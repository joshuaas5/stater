// Executar SQL via Supabase API
// node run-sql-api.js

async function runSQL() {
  // Service Role Key do Supabase (tem permissÃƒÂ£o total)
  const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';
  
  // Ã¢Å¡Â Ã¯Â¸Â COLE SUA SERVICE_ROLE_KEY AQUI
  // Pegue em: Supabase Dashboard > Settings > API > service_role (secret)
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!SERVICE_ROLE_KEY) {
    throw new Error('Defina SUPABASE_SERVICE_ROLE_KEY no ambiente.');
  }

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

  console.log('Ã°Å¸â€Â§ Configurando CRON job via Supabase API...\n');

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

    // A API REST nÃƒÂ£o permite executar SQL arbitrÃƒÂ¡rio
    // Precisamos de outra abordagem...
    
    console.log('Ã¢Å¡Â Ã¯Â¸Â A API REST do Supabase nÃƒÂ£o permite executar SQL arbitrÃƒÂ¡rio.');
    console.log('');
    console.log('Ã°Å¸â€œâ€¹ SOLUÃƒâ€¡ÃƒÆ’O: Execute este SQL manualmente no Supabase Dashboard:');
    console.log('');
    console.log('1. Acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/sql');
    console.log('2. Cole e execute:');
    console.log('');
    console.log('Ã¢â€â‚¬'.repeat(60));
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
    console.log('Ã¢â€â‚¬'.repeat(60));
    console.log('');
    console.log('3. Para TESTAR AGORA (enviar emails):');
    console.log('   - VÃƒÂ¡ em Edge Functions > weekly-email-digest > Test');
    console.log('   - Ou acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/functions');
    
  } catch (error) {
    console.error('Ã¢ÂÅ’ Erro:', error.message);
  }
}

runSQL();
