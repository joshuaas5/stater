// Script para verificar status do deploy e endpoint do Vercel
// Executa teste completo das APIs e webhook do Telegram

import https from 'https';
import fs from 'fs';

const VERCEL_DOMAIN = 'sprout-spending-hub-vb4x.vercel.app';
const ENDPOINTS_TO_TEST = [
  '/',
  '/api/telegram-webhook',
  '/api/debug-connection'
];

console.log('🚀 TESTANDO DEPLOY VERCEL - ICTUS BOT TELEGRAM');
console.log('='.repeat(60));

// Função para fazer requisição HTTPS
function testEndpoint(path) {
  return new Promise((resolve) => {
    const options = {
      hostname: VERCEL_DOMAIN,
      path: path,
      method: 'GET',
      headers: {
        'User-Agent': 'ICTUS-Deploy-Test/1.0'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          headers: res.headers,
          bodySize: data.length,
          success: res.statusCode < 400
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        path,
        status: 'ERROR',
        error: error.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        path,
        status: 'TIMEOUT',
        error: 'Request timed out',
        success: false
      });
    });

    req.end();
  });
}

// Teste específico do webhook do Telegram
function testTelegramWebhook() {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      message: {
        message_id: 999,
        from: { id: 123456789, first_name: "Test", username: "testuser" },
        chat: { id: 123456789, type: "private" },
        date: Math.floor(Date.now() / 1000),
        text: "/start"
      }
    });

    const options = {
      hostname: VERCEL_DOMAIN,
      path: '/api/telegram-webhook',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'ICTUS-Webhook-Test/1.0'
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          path: '/api/telegram-webhook (POST)',
          status: res.statusCode,
          response: data.substring(0, 200),
          success: res.statusCode === 200
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        path: '/api/telegram-webhook (POST)',
        status: 'ERROR',
        error: error.message,
        success: false
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        path: '/api/telegram-webhook (POST)',
        status: 'TIMEOUT',
        error: 'Request timed out',
        success: false
      });
    });

    req.write(postData);
    req.end();
  });
}

// Executar todos os testes
async function runAllTests() {
  console.log(`⏳ Testando domínio: https://${VERCEL_DOMAIN}`);
  console.log('');

  const results = [];
  
  // Testar endpoints básicos
  console.log('📊 TESTANDO ENDPOINTS BÁSICOS...');
  for (const endpoint of ENDPOINTS_TO_TEST) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${endpoint}: ${result.status} ${result.error || ''}`);
    
    if (result.success && result.headers) {
      console.log(`   Content-Type: ${result.headers['content-type'] || 'N/A'}`);
      console.log(`   Body Size: ${result.bodySize} bytes`);
    }
    console.log('');
  }

  // Testar webhook do Telegram especificamente
  console.log('🤖 TESTANDO WEBHOOK TELEGRAM (POST)...');
  const webhookResult = await testTelegramWebhook();
  results.push(webhookResult);
  
  const webhookStatus = webhookResult.success ? '✅' : '❌';
  console.log(`${webhookStatus} ${webhookResult.path}: ${webhookResult.status}`);
  if (webhookResult.response) {
    console.log(`   Response: ${webhookResult.response}`);
  }
  if (webhookResult.error) {
    console.log(`   Error: ${webhookResult.error}`);
  }
  
  // Resumo final
  console.log('');
  console.log('📋 RESUMO DOS TESTES:');
  console.log('='.repeat(40));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Sucessos: ${successful}/${total}`);
  console.log(`❌ Falhas: ${total - successful}/${total}`);
  
  if (successful === total) {
    console.log('');
    console.log('🎉 DEPLOY VERCEL FUNCIONANDO PERFEITAMENTE!');
    console.log('✅ Todos os endpoints estão respondendo corretamente');
    console.log('✅ Webhook do Telegram está operacional');
    console.log(`✅ Sistema disponível em: https://${VERCEL_DOMAIN}`);
  } else {
    console.log('');
    console.log('⚠️  ALGUNS PROBLEMAS DETECTADOS:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`❌ ${r.path}: ${r.error || r.status}`);
    });
  }
  
  // Salvar resultados
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    domain: VERCEL_DOMAIN,
    results,
    summary: {
      total,
      successful,
      failed: total - successful,
      success_rate: Math.round((successful / total) * 100)
    }
  };
  
  fs.writeFileSync('deploy-test-results.json', JSON.stringify(logData, null, 2));
  console.log('');
  console.log('💾 Resultados salvos em: deploy-test-results.json');
}

// Executar testes
runAllTests().catch(console.error);
