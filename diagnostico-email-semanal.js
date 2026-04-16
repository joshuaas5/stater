// ========================================
// ðŸ”§ DIAGNÃ“STICO DO SISTEMA DE EMAIL SEMANAL
// Execute: node diagnostico-email-semanal.js
// ========================================

const SERVICE_ROLE_KEY = 'YOUR_JWT_TOKEN';
const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';

async function runDiagnostic() {
  console.log('ðŸ” DIAGNÃ“STICO DO SISTEMA DE EMAIL SEMANAL\n');
  console.log('='.repeat(50));
  
  // 1. Testar conexÃ£o com Supabase
  console.log('\n1ï¸âƒ£ Testando conexÃ£o com Supabase...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bills?select=count`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });
    if (response.ok) {
      console.log('   âœ… ConexÃ£o OK');
    } else {
      console.log('   âŒ Erro:', response.status, await response.text());
    }
  } catch (e) {
    console.log('   âŒ Erro de conexÃ£o:', e.message);
  }

  // 2. Verificar se existem contas nÃ£o pagas
  console.log('\n2ï¸âƒ£ Verificando contas nÃ£o pagas...');
  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/bills?select=id,title,due_date,user_id,is_paid&is_paid=eq.false&order=due_date`, 
      {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      }
    );
    
    if (response.ok) {
      const bills = await response.json();
      console.log(`   âœ… ${bills.length} contas nÃ£o pagas encontradas`);
      
      if (bills.length > 0) {
        console.log('   ðŸ“‹ Primeiras 5:');
        bills.slice(0, 5).forEach(b => {
          console.log(`      - ${b.title} (vence: ${b.due_date})`);
        });
      }
    } else {
      console.log('   âŒ Erro:', response.status);
    }
  } catch (e) {
    console.log('   âŒ Erro:', e.message);
  }

  // 3. Verificar preferÃªncias de notificaÃ§Ã£o
  console.log('\n3ï¸âƒ£ Verificando preferÃªncias de notificaÃ§Ã£o...');
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/user_notification_preferences?select=user_id,email_notifications`, 
      {
        headers: {
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
        }
      }
    );
    
    if (response.ok) {
      const prefs = await response.json();
      const emailEnabled = prefs.filter(p => p.email_notifications !== false).length;
      console.log(`   âœ… ${prefs.length} preferÃªncias encontradas`);
      console.log(`   ðŸ“§ ${emailEnabled} usuÃ¡rios com email habilitado`);
    } else {
      console.log('   âŒ Erro:', response.status);
    }
  } catch (e) {
    console.log('   âŒ Erro:', e.message);
  }

  // 4. Testar a Edge Function diretamente
  console.log('\n4ï¸âƒ£ Testando Edge Function weekly-email-digest...');
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/weekly-email-digest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('   âœ… Edge Function executada com sucesso!');
      console.log(`   ðŸ“§ Emails enviados: ${data.emailsSent || 0}`);
      console.log(`   â­ï¸ Emails pulados: ${data.emailsSkipped || 0}`);
      if (data.errors?.length > 0) {
        console.log(`   âš ï¸ Erros: ${data.errors.length}`);
        data.errors.forEach(e => console.log(`      - ${e}`));
      }
    } else {
      console.log('   âŒ Erro HTTP:', response.status);
      console.log('   ðŸ“‹ Resposta:', JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log('   âŒ Erro ao chamar funÃ§Ã£o:', e.message);
    console.log('');
    console.log('   ðŸ’¡ POSSÃVEIS CAUSAS:');
    console.log('      - Edge Function nÃ£o estÃ¡ deployada');
    console.log('      - RESEND_API_KEY nÃ£o configurada nos secrets');
    console.log('      - Erro no cÃ³digo da funÃ§Ã£o');
  }

  // 5. Verificar CRON jobs
  console.log('\n5ï¸âƒ£ Verificando CRON jobs...');
  console.log('   âš ï¸ Para verificar os CRON jobs, execute no SQL Editor do Supabase:');
  console.log('   SELECT * FROM cron.job;');
  console.log('   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;');

  console.log('\n' + '='.repeat(50));
  console.log('ðŸ“‹ RESUMO DE VERIFICAÃ‡Ã•ES');
  console.log('='.repeat(50));
  console.log(`
1. âœ… Execute o SQL em FIX_CRON_EMAIL_SEMANAL.sql no Supabase
2. âœ… Verifique se RESEND_API_KEY estÃ¡ nos secrets da Edge Function
3. âœ… Verifique os logs da Edge Function no Supabase Dashboard
4. âœ… Verifique cron.job_run_details para ver histÃ³rico de execuÃ§Ãµes

ðŸ“ Links Ãºteis:
- SQL Editor: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/sql/new
- Edge Functions: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/functions
- Logs: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/logs/edge-logs
`);
}

runDiagnostic().catch(console.error);
