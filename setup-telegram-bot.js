// Script para configurar webhook do Telegram Bot
const BOT_TOKEN = '7774906065:AAGnHNWKAmj9xj-KxKs8SnQi5l3SJ4MrFgQ';
const WEBHOOK_URL = 'https://ictus-six.vercel.app/api/telegram-webhook';

async function setWebhook() {
  try {
    console.log('🤖 Configurando webhook do Telegram...');
    console.log('📡 URL:', WEBHOOK_URL);
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message'],
        drop_pending_updates: true
      })
    });

    const result = await response.json();
    console.log('📝 Resposta:', JSON.stringify(result, null, 2));

    if (result.ok) {
      console.log('✅ Webhook configurado com sucesso!');
    } else {
      console.log('❌ Erro ao configurar webhook:', result.description);
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

async function getWebhookInfo() {
  try {
    console.log('🔍 Verificando webhook atual...');
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const result = await response.json();
    
    console.log('📊 Informações do webhook:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

async function sendTestMessage() {
  try {
    console.log('🧪 Enviando mensagem de teste...');
    
    // ID do chat do desenvolvedor (substitua pelo seu chat_id)
    const CHAT_ID = '123456789'; // SUBSTITUA pelo seu chat_id
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: '🤖 *Teste do Bot ICTUS*\n\nBot configurado e funcionando!\n\nDigite /help para começar.',
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();
    console.log('📝 Resposta:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

// Executar configuração
console.log('🚀 Iniciando configuração do bot...\n');

(async () => {
  await getWebhookInfo();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await setWebhook();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await getWebhookInfo();
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('✅ Configuração concluída!');
  console.log('📱 Agora teste no bot: https://t.me/assistentefinanceiroiabot');
  console.log('💬 Comandos disponíveis: /start, /help, /saldo, /gastos');
})();
