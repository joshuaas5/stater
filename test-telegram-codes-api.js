// Teste da API telegram-codes
const https = require('https');

console.log('🧪 TESTANDO API TELEGRAM-CODES');
console.log('===============================');

// Dados de teste
const testData = {
  user_id: 'test-user-123',
  user_email: 'test@example.com', 
  user_name: 'Test User'
};

// Testar criação de código
function testGenerateCode() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testData);
      const options = {
      hostname: 'sprout-spending-hub-vb4x.vercel.app',
      path: '/api/telegram-codes-simple',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('📤 Enviando dados para geração de código...');
    console.log('📋 Dados:', testData);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`📋 Response: ${data}`);
        
        if (res.statusCode === 200) {
          try {
            const result = JSON.parse(data);
            console.log('✅ CÓDIGO GERADO COM SUCESSO!');
            console.log(`🔑 Código: ${result.code}`);
            console.log(`⏰ Expira em: ${result.expires_in} segundos`);
            resolve(result.code);
          } catch (e) {
            console.log('❌ Erro ao parsear resposta');
            reject(e);
          }
        } else {
          console.log('❌ Erro na API');
          reject(new Error(data));
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Erro na requisição:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// Testar verificação de código
function testVerifyCode(code) {
  return new Promise((resolve, reject) => {    const options = {
      hostname: 'sprout-spending-hub-vb4x.vercel.app',
      path: `/api/telegram-codes-simple?code=${code}`,
      method: 'GET'
    };

    console.log(`🔍 Verificando código: ${code}`);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`📊 Status verificação: ${res.statusCode}`);
        console.log(`📋 Response verificação: ${data}`);
        
        if (res.statusCode === 200) {
          console.log('✅ CÓDIGO VÁLIDO!');
          resolve(true);
        } else {
          console.log('❌ Código inválido ou expirado');
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Erro na verificação:', error.message);
      reject(error);
    });

    req.end();
  });
}

// Executar testes
async function runTests() {
  try {
    console.log('1️⃣ Testando geração de código...');
    const code = await testGenerateCode();
    
    console.log('\n2️⃣ Testando verificação de código...');
    const isValid = await testVerifyCode(code);
    
    console.log('\n📋 RESUMO:');
    console.log('✅ Geração de código: FUNCIONANDO');
    console.log(`✅ Verificação de código: ${isValid ? 'FUNCIONANDO' : 'FALHOU'}`);
    
    if (isValid) {
      console.log('\n🎉 API TELEGRAM-CODES FUNCIONANDO PERFEITAMENTE!');
      console.log('✅ Sistema de conexão pronto para uso');
      console.log('✅ Agora teste no Dashboard do app');
    }
    
  } catch (error) {
    console.log('\n❌ ERRO NOS TESTES:', error.message);
    console.log('🔧 Verifique se a tabela telegram_link_codes existe no Supabase');
  }
}

runTests();
