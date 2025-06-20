// Teste Final Bot Telegram - ICTUS
const BOT_TOKEN = '7971646954:AAHpeNAzvg3kq7A1uER58XRms94sTjWZy5g';

async function testBotFinal() {
  console.log('🤖 === TESTE FINAL BOT TELEGRAM ICTUS ===');
  console.log('🕐 Timestamp:', new Date().toISOString());
  
  try {
    // 1. Verificar status do bot
    console.log('\n1️⃣ Verificando status do bot...');
    const meResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const meData = await meResponse.json();
    
    if (meData.ok) {
      console.log('✅ Bot ativo:', meData.result.username);
      console.log('📋 Nome:', meData.result.first_name);
    } else {
      throw new Error('Bot não está ativo');
    }
    
    // 2. Verificar webhook
    console.log('\n2️⃣ Verificando configuração do webhook...');
    const webhookResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const webhookData = await webhookResponse.json();
    
    if (webhookData.ok) {
      console.log('🔗 URL Webhook:', webhookData.result.url);
      console.log('📊 Updates pendentes:', webhookData.result.pending_update_count);
      console.log('🌐 IP:', webhookData.result.ip_address);
      
      if (webhookData.result.last_error_date) {
        console.log('⚠️ Último erro:', new Date(webhookData.result.last_error_date * 1000).toISOString());
        console.log('❌ Mensagem erro:', webhookData.result.last_error_message);
      } else {
        console.log('✅ Nenhum erro recente no webhook');
      }
    } else {
      throw new Error('Erro ao verificar webhook');
    }
    
    // 3. Testar endpoint API diretamente
    console.log('\n3️⃣ Testando endpoint da API...');
    try {
      const endpointResponse = await fetch('https://ictus-six.vercel.app/api/telegram-webhook', {
        method: 'GET'
      });
      console.log('📡 Status endpoint:', endpointResponse.status);
      console.log('📋 Status text:', endpointResponse.statusText);
    } catch (endpointError) {
      console.log('⚠️ Endpoint não respondeu ao GET (normal para webhook)');
    }
    
    // 4. Simular mensagem de teste
    console.log('\n4️⃣ Simulando webhook de teste...');
    const testUpdate = {
      update_id: Date.now(),
      message: {
        message_id: Date.now(),
        from: {
          id: 123456789,
          is_bot: false,
          first_name: "Teste",
          username: "teste_user"
        },
        chat: {
          id: 123456789,
          first_name: "Teste",
          username: "teste_user",
          type: "private"
        },
        date: Math.floor(Date.now() / 1000),
        text: "/help"
      }
    };
    
    try {
      const webhookTest = await fetch('https://ictus-six.vercel.app/api/telegram-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testUpdate)
      });
      
      console.log('📤 Status resposta webhook:', webhookTest.status);
      const webhookResult = await webhookTest.text();
      console.log('📋 Resposta webhook:', webhookResult.substring(0, 200));
    } catch (webhookError) {
      console.log('❌ Erro no teste webhook:', webhookError.message);
    }
    
    console.log('\n✅ === TESTE CONCLUÍDO ===');
    console.log('📱 Teste manual: https://t.me/assistentefinanceiroiabot');
    console.log('💬 Comandos: /start, /help, "Olá", "Como economizar?"');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testBotFinal().catch(console.error);
