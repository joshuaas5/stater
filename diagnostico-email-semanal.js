// ========================================
// 🔧 DIAGNÓSTICO DO SISTEMA DE EMAIL SEMANAL
// Execute: node diagnostico-email-semanal.js
// ========================================

const SERVICE_ROLE_KEY = 'YOUR_JWT_TOKEN';
const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';

async function runDiagnostic() {
  console.log('🔍 DIAGNÓSTICO DO SISTEMA DE EMAIL SEMANAL\n');
  console.log('='.repeat(50));
  
  // 1. Testar conexão com Supabase
  console.log('\n1️⃣ Testando conexão com Supabase...');
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/bills?select=count`, {
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`
      }
    });
    if (response.ok) {
      console.log('   ✅ Conexão OK');
    } else {
      console.log('   ❌ Erro:', response.status, await response.text());
    }
  } catch (e) {
    console.log('   ❌ Erro de conexão:', e.message);
  }

  // 2. Verificar se existem contas não pagas
  console.log('\n2️⃣ Verificando contas não pagas...');
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
      console.log(`   ✅ ${bills.length} contas não pagas encontradas`);
      
      if (bills.length > 0) {
        console.log('   📋 Primeiras 5:');
        bills.slice(0, 5).forEach(b => {
          console.log(`      - ${b.title} (vence: ${b.due_date})`);
        });
      }
    } else {
      console.log('   ❌ Erro:', response.status);
    }
  } catch (e) {
    console.log('   ❌ Erro:', e.message);
  }

  // 3. Verificar preferências de notificação
  console.log('\n3️⃣ Verificando preferências de notificação...');
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
      console.log(`   ✅ ${prefs.length} preferências encontradas`);
      console.log(`   📧 ${emailEnabled} usuários com email habilitado`);
    } else {
      console.log('   ❌ Erro:', response.status);
    }
  } catch (e) {
    console.log('   ❌ Erro:', e.message);
  }

  // 4. Testar a Edge Function diretamente
  console.log('\n4️⃣ Testando Edge Function weekly-email-digest...');
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
      console.log('   ✅ Edge Function executada com sucesso!');
      console.log(`   📧 Emails enviados: ${data.emailsSent || 0}`);
      console.log(`   ⏭️ Emails pulados: ${data.emailsSkipped || 0}`);
      if (data.errors?.length > 0) {
        console.log(`   ⚠️ Erros: ${data.errors.length}`);
        data.errors.forEach(e => console.log(`      - ${e}`));
      }
    } else {
      console.log('   ❌ Erro HTTP:', response.status);
      console.log('   📋 Resposta:', JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log('   ❌ Erro ao chamar função:', e.message);
    console.log('');
    console.log('   💡 POSSÍVEIS CAUSAS:');
    console.log('      - Edge Function não está deployada');
    console.log('      - RESEND_API_KEY não configurada nos secrets');
    console.log('      - Erro no código da função');
  }

  // 5. Verificar CRON jobs
  console.log('\n5️⃣ Verificando CRON jobs...');
  console.log('   ⚠️ Para verificar os CRON jobs, execute no SQL Editor do Supabase:');
  console.log('   SELECT * FROM cron.job;');
  console.log('   SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;');

  console.log('\n' + '='.repeat(50));
  console.log('📋 RESUMO DE VERIFICAÇÕES');
  console.log('='.repeat(50));
  console.log(`
1. ✅ Execute o SQL em FIX_CRON_EMAIL_SEMANAL.sql no Supabase
2. ✅ Verifique se RESEND_API_KEY está nos secrets da Edge Function
3. ✅ Verifique os logs da Edge Function no Supabase Dashboard
4. ✅ Verifique cron.job_run_details para ver histórico de execuções

📍 Links úteis:
- SQL Editor: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/sql/new
- Edge Functions: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/functions
- Logs: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/logs/edge-logs
`);
}

runDiagnostic().catch(console.error);
