// Teste rápido do Bot Telegram - Enviar mensagem de teste
const BOT_TOKEN = '7971646954:AAHpeNAzvg3kq7A1uER58XRms94sTjWZy5g';

// Para descobrir seu CHAT_ID:
// 1. Envie qualquer mensagem para @userinfobot no Telegram
// 2. Ou acesse: https://api.telegram.org/bot7971646954:AAHpeNAzvg3kq7A1uER58XRms94sTjWZy5g/getUpdates
// 3. Procure por "chat":{"id": SEU_NUMERO}

const TEST_CHAT_ID = 'SEU_CHAT_ID_AQUI'; // SUBSTITUA PELO SEU CHAT_ID

async function testBotResponse() {
  if (TEST_CHAT_ID === 'SEU_CHAT_ID_AQUI') {
    console.log('❌ CONFIGURE SEU CHAT_ID PRIMEIRO!');
    console.log('💡 Para descobrir:');
    console.log('1. Envie mensagem para @userinfobot');
    console.log('2. Ou acesse: https://api.telegram.org/bot' + BOT_TOKEN + '/getUpdates');
    return;
  }

  console.log('🧪 Testando resposta do bot...');
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TEST_CHAT_ID,
        text: '🧪 TESTE: Olá bot, você está funcionando?'
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Mensagem de teste enviada com sucesso!');
      console.log('💬 Verifique sua conversa com o bot para ver a resposta.');
      console.log('🤖 Bot: https://t.me/assistentefinanceiroiabot');
    } else {
      console.log('❌ Erro ao enviar:', result.description);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testBotResponse();
