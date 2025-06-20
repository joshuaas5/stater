// Script de teste para o Bot Telegram com IA
const BOT_TOKEN = '7971646954:AAHpeNAzvg3kq7A1uER58XRms94sTjWZy5g';

// ID do chat para teste (substitua pelo seu)
const TEST_CHAT_ID = '123456789'; // COLOQUE SEU CHAT_ID AQUI

async function testBot() {
  console.log('🧪 Testando Bot Telegram com IA...\n');
  
  // Teste 1: Mensagem simples
  console.log('1️⃣ Testando mensagem simples...');
  await sendTestMessage('Olá, como você pode me ajudar?');
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Teste 2: Pergunta financeira
  console.log('2️⃣ Testando pergunta financeira...');
  await sendTestMessage('Qual é meu saldo atual?');
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Teste 3: Comando /help
  console.log('3️⃣ Testando comando /help...');
  await sendTestMessage('/help');
  
  // Aguardar um pouco
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Teste 4: Transação
  console.log('4️⃣ Testando detecção de transação...');
  await sendTestMessage('Gastei R$ 50 no supermercado hoje');
  
  console.log('\n✅ Testes enviados! Verifique as respostas no Telegram.');
  console.log('📱 Bot: https://t.me/assistentefinanceiroiabot');
}

async function sendTestMessage(message) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TEST_CHAT_ID,
        text: `🧪 TESTE: ${message}`,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log(`✅ Mensagem enviada: "${message}"`);
    } else {
      console.log(`❌ Erro: ${result.description}`);
    }
  } catch (error) {
    console.error('❌ Erro ao enviar:', error.message);
  }
}

// Executar teste
if (TEST_CHAT_ID === '123456789') {
  console.log('❌ ERRO: Configure seu CHAT_ID no script!');
  console.log('💡 Para descobrir seu CHAT_ID:');
  console.log('1. Envie uma mensagem para @userinfobot');
  console.log('2. Ou use: https://t.me/assistentefinanceiroiabot');
  console.log('3. Substitua TEST_CHAT_ID no script');
} else {
  testBot();
}
