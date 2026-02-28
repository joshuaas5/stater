// Disparar envio de emails AGORA
// node trigger-weekly-digest.js

const { Client } = require('pg');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = 'postgresql://postgres.tmucbwlhkffrhtexmjze:joshuaegabriela190169%40@aws-0-sa-east-1.pooler.supabase.com:6543/postgres';

async function triggerDigest() {
  const client = new Client({ connectionString, ssl: true });
  
  try {
    await client.connect();
    console.log('✅ Conectado ao Supabase\n');
    console.log('📧 Disparando weekly-email-digest...\n');

    // Chamar a função via net.http_post
    const result = await client.query(`
      SELECT net.http_post(
        url := 'https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/weekly-email-digest',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
        ),
        body := '{}'::jsonb
      );
    `);

    console.log('✅ Requisição enviada!');
    console.log('📬 Os emails estão sendo processados...\n');
    console.log('Resultado:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await client.end();
  }
}

triggerDigest();
