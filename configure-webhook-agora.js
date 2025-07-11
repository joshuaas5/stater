// Configurar webhook do bot Telegram
const BOT_TOKEN = '7971646954:AAHpeNAzvg3kq7A1uER58XRms94sTjWZy5g';
const WEBHOOK_URL = 'https://staterbills.vercel.app/api/telegram-webhook';

async function configureWebhook() {
  console.log('🔧 Configurando webhook do bot...');
  console.log('- URL do webhook:', WEBHOOK_URL);
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query'],
        max_connections: 100,
        drop_pending_updates: true // Limpa mensagens pendentes
      })
    });
    
    const data = await response.json();
    console.log('📊 Resultado da configuração:');
    console.log(data);
    
    if (data.ok) {
      console.log('✅ Webhook configurado com sucesso!');
      
      // Verificar se foi aplicado
      console.log('\n🔍 Verificando webhook configurado...');
      const checkResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
      const checkData = await checkResponse.json();
      console.log('📡 Nova configuração:', checkData.result);
    } else {
      console.log('❌ Erro ao configurar webhook:', data.description);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

configureWebhook();
