// Teste final do bot com código real
async function testBotWithCode() {
  console.log('🧪 Testando bot com código gerado...');
  
  try {
    // 1. Gerar código via API
    console.log('🔑 Gerando código...');
    const codeResponse = await fetch('https://staterbills.vercel.app/api/telegram-codes-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: '56d8f459-8650-4cd9-bf16-f7d70ddbc0a9',
        userEmail: 'teste@teste.com',
        userName: 'Teste'
      })
    });
    
    if (!codeResponse.ok) {
      console.log('❌ Erro ao gerar código:', codeResponse.status);
      return;
    }
    
    const codeData = await codeResponse.json();
    const generatedCode = codeData.code;
    console.log('✅ Código gerado:', generatedCode);
    
    // 2. Testar webhook com o código
    console.log('\n🤖 Testando webhook com código...');
    const webhookResponse = await fetch('https://staterbills.vercel.app/api/telegram-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          chat: { id: 123456789 },
          text: generatedCode,
          from: { id: 123456789, first_name: 'Teste' }
        }
      })
    });
    
    console.log('📊 Status webhook:', webhookResponse.status);
    if (webhookResponse.ok) {
      const webhookData = await webhookResponse.json();
      console.log('📋 Resposta webhook:', webhookData);
    } else {
      const errorText = await webhookResponse.text();
      console.log('❌ Erro webhook:', errorText);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testBotWithCode();
