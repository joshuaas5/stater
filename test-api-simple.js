// Teste da API telegram-connect-simple - Debug do erro 500
console.log('🧪 Testando conexão com API telegram-connect-simple...');

async function testAPI() {
  try {
    // Teste GET (verificação)
    console.log('📡 Testando GET...');
    const getResponse = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/telegram-connect-simple?chatId=123456789');
    const getResult = await getResponse.text();
    
    console.log('📥 GET Response Status:', getResponse.status);
    console.log('📥 GET Response:', getResult);

    // Teste POST (conexão)
    console.log('\n📡 Testando POST...');
    const postResponse = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/telegram-connect-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatId: '123456789',
        userId: 'test-user-123',
        userEmail: 'test@example.com',
        userName: 'Test User'
      })
    });
    
    const postResult = await postResponse.text();
    
    console.log('📤 POST Response Status:', postResponse.status);
    console.log('📤 POST Response:', postResult);

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testAPI();
