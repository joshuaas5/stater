// Teste de status do bot Telegram
const BOT_TOKEN = '7971646954:AAHpeNAzvg3kq7A1uER58XRms94sTjWZy5g';

async function testBotStatus() {
  console.log('🤖 Testando status do bot...');
  
  try {
    // 1. Verificar se o bot está ativo
    const botResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const botData = await botResponse.json();
    
    console.log('📊 Status do Bot:');
    console.log('- Resposta:', botData);
    
    if (botData.ok) {
      console.log('✅ Bot está ativo:', botData.result.username);
    } else {
      console.log('❌ Bot não está ativo:', botData.description);
      return;
    }
    
    // 2. Verificar webhook atual
    const webhookResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const webhookData = await webhookResponse.json();
    
    console.log('\n📡 Webhook Info:');
    console.log('- URL:', webhookData.result.url);
    console.log('- Has Custom Certificate:', webhookData.result.has_custom_certificate);
    console.log('- Pending Update Count:', webhookData.result.pending_update_count);
    console.log('- Last Error Date:', webhookData.result.last_error_date);
    console.log('- Last Error Message:', webhookData.result.last_error_message);
    
    // 3. Testar envio de mensagem para um chat específico (substitua pelo seu chat ID)
    // console.log('\n📤 Testando envio de mensagem...');
    // const testMessage = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     chat_id: 'YOUR_CHAT_ID', // Substitua pelo seu chat ID
    //     text: 'Teste de conectividade - Bot funcionando! 🚀'
    //   })
    // });
    // const messageData = await testMessage.json();
    // console.log('- Resultado do envio:', messageData);
    
  } catch (error) {
    console.error('❌ Erro ao testar bot:', error);
  }
}

testBotStatus();
