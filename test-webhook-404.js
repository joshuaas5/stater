// Teste específico para o webhook que está dando 404
console.log('🔍 Testando webhook que está dando 404...\n');

async function testWebhook404() {
  const webhookUrl = 'https://sprout-spending-hub-vb4x.vercel.app/api/telegram-webhook';
  
  console.log('📡 URL sendo testada:', webhookUrl);
  
  try {
    console.log('1️⃣ Testando GET (deve dar 405)...');
    const getResponse = await fetch(webhookUrl, { method: 'GET' });
    console.log('GET Status:', getResponse.status);
    const getResult = await getResponse.text();
    console.log('GET Response:', getResult.substring(0, 200));
    
    console.log('\n2️⃣ Testando POST vazio...');
    const postEmptyResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    console.log('POST Empty Status:', postEmptyResponse.status);
    const postEmptyResult = await postEmptyResponse.text();
    console.log('POST Empty Response:', postEmptyResult.substring(0, 200));
    
    console.log('\n3️⃣ Testando POST com mensagem simples...');
    const postValidResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          message_id: 1,
          from: { id: 123, first_name: 'Test' },
          chat: { id: 123, type: 'private' },
          date: Math.floor(Date.now() / 1000),
          text: '/help'
        }
      })
    });
    console.log('POST Valid Status:', postValidResponse.status);
    const postValidResult = await postValidResponse.text();
    console.log('POST Valid Response:', postValidResult.substring(0, 200));
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

async function testOtherEndpoints() {
  console.log('\n4️⃣ Testando outros endpoints...');
  
  const endpoints = [
    'https://sprout-spending-hub-vb4x.vercel.app/api/gemini',
    'https://sprout-spending-hub-vb4x.vercel.app/api/debug-connection'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testando: ${endpoint}`);
      const response = await fetch(endpoint, { method: 'GET' });
      console.log(`Status: ${response.status}`);
    } catch (error) {
      console.error(`Erro em ${endpoint}:`, error.message);
    }
  }
}

async function runTest() {
  console.log('🚀 DIAGNÓSTICO COMPLETO DO ERRO 404\n');
  
  await testWebhook404();
  await testOtherEndpoints();
  
  console.log('\n🏁 TESTE CONCLUÍDO!');
  console.log('\n💡 Se todos os testes derem 404, o problema é no deploy do Vercel');
  console.log('💡 Se apenas alguns derem 404, o problema é específico do arquivo');
}

runTest();
