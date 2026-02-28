// Teste rápido do bot com domínio correto
const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const WEBHOOK_URL = 'https://sprout-spending-hub-vb4x.vercel.app/api/telegram-webhook';

async function testeRapido() {
  console.log('🚀 Teste rápido do bot Telegram');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  // Teste simples /help
  const testUpdate = {
    update_id: Date.now(),
    message: {
      message_id: Date.now(),
      from: { id: 123456789, is_bot: false, first_name: "TesteUser", username: "teste" },
      chat: { id: 123456789, first_name: "TesteUser", type: "private" },
      date: Math.floor(Date.now() / 1000),
      text: "/help"
    }
  };
  
  try {
    console.log('📤 Testando comando /help...');
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUpdate)
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    if (response.status === 200) {
      console.log('✅ Bot funcionando!');
      const result = await response.text();
      console.log('📋 Resposta:', result.substring(0, 100));
    } else {
      console.log('❌ Erro:', response.status);
    }
    
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
  
  console.log('\n🎯 Teste no Telegram: https://t.me/stater');
  console.log('💬 Comandos para testar:');
  console.log('• /start - Boas vindas');
  console.log('• /help - Ajuda');
  console.log('• /conectar - Conectar conta (NOVO!)');
  console.log('• /dashboard - Link do app');
  console.log('• "Olá" - Teste IA');
}

testeRapido().catch(console.error);
