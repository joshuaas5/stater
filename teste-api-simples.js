// Teste simples da API
async function testAPI() {
  try {
    console.log('🧪 Testando API...');
    
    const response = await fetch('https://staterbills.vercel.app/api/telegram-codes-simple', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: '56d8f459-8650-4cd9-bf16-f7d70ddbc0a9',
        userEmail: 'teste@teste.com',
        userName: 'Teste'
      })
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 OK:', response.ok);
    
    const result = await response.text();
    console.log('📋 Resposta:', result);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

testAPI();
