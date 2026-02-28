// Executar CRON setup via Node.js
// node run-cron-setup.js

const { Client } = require('pg');
const dns = require('dns');

// Forçar IPv4
dns.setDefaultResultOrder('ipv4first');

// Desabilitar verificação de SSL para Supabase
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Conexão direta ao Supabase (usando pooler que funciona melhor)
const connectionString = 'postgresql://postgres.tmucbwlhkffrhtexmjze:joshuaegabriela190169%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

async function setupCron() {
  const client = new Client({ 
    connectionString,
    ssl: true
  });
  
  try {
    await client.connect();
    console.log('✅ Conectado ao Supabase PostgreSQL\n');

    // 1. Verificar se pg_cron existe
    console.log('1️⃣ Verificando pg_cron...');
    try {
      await client.query('CREATE EXTENSION IF NOT EXISTS pg_cron');
      console.log('   ✅ pg_cron OK\n');
    } catch (e) {
      console.log('   ⚠️ pg_cron já existe ou erro:', e.message, '\n');
    }

    // 2. Remover jobs antigos (ignorando erros)
    console.log('2️⃣ Removendo jobs antigos...');
    const jobsToRemove = [
      'process-bill-reminders-daily',
      'process-bill-reminders-weekly', 
      'send-weekly-summary',
      'weekly-email-digest'
    ];
    
    for (const job of jobsToRemove) {
      try {
        await client.query(`SELECT cron.unschedule('${job}')`);
        console.log(`   ✅ Removido: ${job}`);
      } catch (e) {
        console.log(`   ⏭️ ${job} não existia`);
      }
    }
    console.log('');

    // 3. Criar novo job
    console.log('3️⃣ Criando job weekly-email-digest...');
    const createJobSQL = `
      SELECT cron.schedule(
        'weekly-email-digest',
        '0 11 * * 1',
        $$
        SELECT net.http_post(
          url := 'https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/weekly-email-digest',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
          ),
          body := '{}'::jsonb
        );
        $$
      );
    `;
    
    await client.query(createJobSQL);
    console.log('   ✅ Job criado: weekly-email-digest\n');

    // 4. Verificar jobs
    console.log('4️⃣ Jobs agendados:');
    const result = await client.query('SELECT jobid, jobname, schedule FROM cron.job');
    console.table(result.rows);

    console.log('\n🎉 CRON configurado com sucesso!');
    console.log('📅 O email será enviado toda Segunda às 8:00 BRT');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

setupCron();
