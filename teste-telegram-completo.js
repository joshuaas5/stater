// Teste completo do fluxo Telegram
const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';

async function testTelegramFlow() {
  console.log('🧪 Testando fluxo completo do Telegram...');
  
  try {
    // 1. Testar se o webhook está respondendo
    console.log('\n🌐 Testando webhook na Vercel...');
    const webhookTest = await fetch('https://stater.app/api/telegram-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          chat: { id: 123456789 },
          text: '/start',
          from: { id: 123456789, first_name: 'Teste' }
        }
      })
    });
    
    console.log('- Status do webhook:', webhookTest.status);
    console.log('- Response OK:', webhookTest.ok);
    
    // 2. Verificar se a API de códigos está funcionando
    console.log('\n🔑 Testando API de códigos...');
    const codesTest = await fetch('https://stater.app/api/telegram-codes-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: '56d8f459-8650-4cd9-bf16-f7d70ddbc0a9',
        userEmail: 'teste@teste.com',
        userName: 'Teste'
      })
    });
    
    console.log('- Status da API de códigos:', codesTest.status);
    if (codesTest.ok) {
      const codesData = await codesTest.json();
      console.log('- Código gerado:', codesData.code);
    } else {
      const errorText = await codesTest.text();
      console.log('- Erro:', errorText);
    }
    
    // 3. Status final do bot
    console.log('\n🤖 Status final do bot...');
    const botResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const botData = await botResponse.json();
    console.log('- Bot ativo:', botData.result.username);
    
    const webhookInfo = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const webhookData = await webhookInfo.json();
    console.log('- Webhook URL:', webhookData.result.url);
    console.log('- Mensagens pendentes:', webhookData.result.pending_update_count);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testTelegramFlow();
