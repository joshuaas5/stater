// Teste específico da API telegram-link-codes
const https = require('https');

console.log('🔗 TESTANDO API TELEGRAM-LINK-CODES');
console.log('=====================================');

// Testar POST para gerar código
function testGenerateCode() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      user_id: 'test-user-123',
      user_email: 'test@example.com',
      user_name: 'Test User'
    });

    const options = {
      hostname: 'sprout-spending-hub-vb4x.vercel.app',
      path: '/api/telegram-link-codes',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📊 POST Status: ${res.statusCode}`);
        console.log(`📋 Response: ${data}`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.log('❌ POST Error:', error.message);
      resolve({ status: 'ERROR', error: error.message });
    });

    req.write(postData);
    req.end();
  });
}

// Testar GET para verificar código
function testVerifyCode(code) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'sprout-spending-hub-vb4x.vercel.app',
      path: `/api/telegram-link-codes?code=${code}`,
      method: 'GET'
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📊 GET Status: ${res.statusCode}`);
        console.log(`📋 Response: ${data}`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (error) => {
      console.log('❌ GET Error:', error.message);
      resolve({ status: 'ERROR', error: error.message });
    });

    req.end();
  });
}

// Executar testes
async function runTests() {
  console.log('1️⃣ Testando geração de código (POST)...');
  const generateResult = await testGenerateCode();
  
  if (generateResult.status === 200) {
    console.log('✅ API de geração funcionando!');
    
    try {
      const responseData = JSON.parse(generateResult.data);
      if (responseData.code) {
        console.log(`🔑 Código gerado: ${responseData.code}`);
        
        console.log('\n2️⃣ Testando verificação de código (GET)...');
        await testVerifyCode(responseData.code);
      }
    } catch (e) {
      console.log('⚠️ Erro ao parsear resposta JSON');
    }
  } else {
    console.log('❌ Falha na geração de código');
  }
  
  console.log('\n🎉 TESTE CONCLUÍDO!');
}

runTests().catch(console.error);
