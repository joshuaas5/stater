// Teste manual do weekly-email-digest
// Executar: node test-weekly-digest.js

const SUPABASE_URL = 'https://tmucbwlhkffrhtexmjze.supabase.co';

// Importante: use a SERVICE_ROLE_KEY via variavel de ambiente
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'COLE_SUA_SERVICE_ROLE_KEY_AQUI';

async function testWeeklyDigest() {
  console.log('Testando weekly-email-digest...\n');

  if (SERVICE_ROLE_KEY === 'COLE_SUA_SERVICE_ROLE_KEY_AQUI') {
    console.log('ERRO: voce precisa configurar a SERVICE_ROLE_KEY!');
    console.log('');
    console.log('Opcao 1: Definir variavel de ambiente:');
    console.log('   $env:SUPABASE_SERVICE_ROLE_KEY = "YOUR_SUPABASE_SERVICE_ROLE_KEY"');
    console.log('   node test-weekly-digest.js');
    console.log('');
    console.log('Opcao 2: Editar este arquivo e colar a key');
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
      console.log('\nSucesso!');
      console.log(`Emails enviados: ${data.emailsSent}`);
      console.log(`Emails pulados (opt-out): ${data.emailsSkipped}`);
      if (data.errors?.length > 0) {
        console.log(`Erros: ${data.errors.length}`);
        data.errors.forEach(e => console.log(` - ${e}`));
      }
    } else {
      console.log('\nErro:', data.error || data);
    }

  } catch (error) {
    console.error('Erro na requisicao:', error.message);
  }
}

testWeeklyDigest();