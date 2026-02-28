// Teste manual do weekly-email-digest
// Executar: node test-weekly-digest.js

const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';

// ⚠️ IMPORTANTE: Você precisa usar a SERVICE_ROLE_KEY aqui
// Pegue em: Supabase Dashboard > Settings > API > service_role (secret)
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'COLE_SUA_SERVICE_ROLE_KEY_AQUI';

async function testWeeklyDigest() {
  console.log('🧪 Testando weekly-email-digest...\n');
  
  if (SERVICE_ROLE_KEY === 'COLE_SUA_SERVICE_ROLE_KEY_AQUI') {
    console.log('❌ ERRO: Você precisa configurar a SERVICE_ROLE_KEY!');
    console.log('');
    console.log('Opção 1: Definir variável de ambiente:');
    console.log('   $env:SUPABASE_SERVICE_ROLE_KEY = "sua_key_aqui"');
    console.log('   node test-weekly-digest.js');
    console.log('');
    console.log('Opção 2: Editar este arquivo e colar a key');
    return;
  }
  
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
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n✅ Sucesso!');
      console.log(`📧 Emails enviados: ${data.emailsSent}`);
      console.log(`⏭️ Emails pulados (opt-out): ${data.emailsSkipped}`);
      if (data.errors?.length > 0) {
        console.log(`❌ Erros: ${data.errors.length}`);
        data.errors.forEach(e => console.log(`   - ${e}`));
      }
    } else {
      console.log('\n❌ Erro:', data.error || data);
    }
    
  } catch (error) {
    console.error('❌ Erro na requisição:', error.message);
  }
}

testWeeklyDigest();
