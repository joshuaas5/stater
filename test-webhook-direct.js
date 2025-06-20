// Teste Direto do Endpoint do Bot Telegram
const TEST_UPDATE = {
  "update_id": 123456789,
  "message": {
    "message_id": 123456,
    "from": {
      "id": 987654321,
      "is_bot": false,
      "first_name": "Teste",
      "username": "teste_usuario",
      "language_code": "pt-br"
    },
    "chat": {
      "id": 987654321,
      "first_name": "Teste",
      "username": "teste_usuario",
      "type": "private"
    },
    "date": Math.floor(Date.now() / 1000),
    "text": "/start"
  }
};

async function testarWebhookDireto() {
  console.log('🚀 Testando webhook do Telegram diretamente...');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  try {
    console.log('📤 Enviando update de teste para:', 'https://ictus-six.vercel.app/api/telegram-webhook');
    console.log('📋 Dados do update:', JSON.stringify(TEST_UPDATE, null, 2));
    
    const response = await fetch('https://ictus-six.vercel.app/api/telegram-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TelegramBot'
      },
      body: JSON.stringify(TEST_UPDATE)
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    console.log('📊 Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📋 Resposta completa:', responseText);
    
    if (response.status === 200) {
      console.log('✅ Webhook funcionando corretamente!');
    } else {
      console.log('❌ Problema no webhook:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error.message);
  }
}

// Testar com diferentes comandos
async function testarComandos() {
  const comandos = ['/start', '/help', '/dashboard', 'Olá', 'Como economizar dinheiro?'];
  
  for (const comando of comandos) {
    console.log(`\n🔄 Testando comando: "${comando}"`);
    
    const update = {
      ...TEST_UPDATE,
      update_id: TEST_UPDATE.update_id + comandos.indexOf(comando),
      message: {
        ...TEST_UPDATE.message,
        message_id: TEST_UPDATE.message.message_id + comandos.indexOf(comando),
        text: comando
      }
    };
    
    try {
      const response = await fetch('https://ictus-six.vercel.app/api/telegram-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TelegramBot'
        },
        body: JSON.stringify(update)
      });
      
      console.log(`📊 ${comando}: ${response.status} ${response.statusText}`);
      
      if (response.status !== 200) {
        const errorText = await response.text();
        console.log(`❌ Erro ${comando}:`, errorText.substring(0, 100));
      }
      
    } catch (error) {
      console.log(`❌ Erro ${comando}:`, error.message);
    }
    
    // Aguardar 1 segundo entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function executarTeste() {
  await testarWebhookDireto();
  console.log('\n' + '='.repeat(50));
  await testarComandos();
  
  console.log('\n✅ Teste concluído!');
  console.log('📱 Teste manual em: https://t.me/assistentefinanceiroiabot');
}

executarTeste().catch(console.error);
