// Script para testar o sistema de conexão do bot Telegram
console.log('🔍 Testando sistema de conexão do bot Telegram...');

// Função para testar a API do webhook
async function testWebhookAPI() {
  try {
    console.log('📡 Testando endpoint do webhook...');
    
    const response = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/telegram-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          message_id: 999,
          from: {
            id: 123456789,
            first_name: 'Teste',
            username: 'teste_user'
          },
          chat: {
            id: 123456789,
            type: 'private'
          },
          date: Math.floor(Date.now() / 1000),
          text: '/start 12AB'
        }
      })
    });

    const result = await response.text();
    console.log('📋 Status:', response.status);
    console.log('📄 Resposta:', result);
    
    if (response.ok) {
      console.log('✅ Webhook está funcionando');
    } else {
      console.log('❌ Problema no webhook');
    }
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error);
  }
}

// Função para testar simulação de código
async function testCodeGeneration() {
  console.log('🔑 Testando geração de códigos...');
  
  // Simular geração de código (igual ao frontend)
  const numbers = Math.floor(10 + Math.random() * 90).toString();
  const letters = Math.random().toString(36).substring(2, 4).toUpperCase();
  const code = numbers + letters;
  
  console.log('📋 Código gerado:', code);
  console.log('🕒 Expira em 15 minutos');
  
  // Verificar formato
  const codePattern = /^[0-9]{2}[A-Z]{2}$/;
  if (codePattern.test(code)) {
    console.log('✅ Formato do código está correto');
  } else {
    console.log('❌ Formato do código está incorreto');
  }
}

// Executar testes
async function runTests() {
  console.log('🚀 Iniciando testes do sistema de conexão...\n');
  
  await testCodeGeneration();
  console.log('\n' + '='.repeat(50) + '\n');
  await testWebhookAPI();
  
  console.log('\n🏁 Testes concluídos!');
}

runTests();
