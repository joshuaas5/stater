// TESTE FOCADO - Execute este código no console do navegador
// para diagnosticar o erro 406 especificamente

console.log('🎯 TESTE FOCADO - ERRO 406 TELEGRAM_USERS');
console.log('==============================================');

// Fazer a mesma requisição que está falhando, mas com logs detalhados
const testUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co/rest/v1/telegram_users?select=*&user_id=eq.56d8f459-8650-4cd9-bf16-f7d70ddbc0a9&is_active=eq.true';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

console.log('📍 URL da requisição:', testUrl);
console.log('🔑 API Key (últimos 10 chars):', '...' + apiKey.slice(-10));

// Teste 1: Requisição exata que está falhando
console.log('\n🧪 TESTE 1: Requisição exata que falha no app');
fetch(testUrl, {
  method: 'GET',
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})
.then(response => {
  console.log('📊 Resposta do Teste 1:');
  console.log('  Status:', response.status, response.statusText);
  console.log('  Headers de resposta:');
  for (let [key, value] of response.headers.entries()) {
    console.log(`    ${key}: ${value}`);
  }
  
  if (response.status === 406) {
    console.log('❌ ERRO 406 confirmado!');
    return response.text();
  } else if (response.ok) {
    console.log('✅ Requisição funcionou!');
    return response.json();
  } else {
    console.log('⚠️ Outro erro:', response.status);
    return response.text();
  }
})
.then(data => {
  console.log('📄 Dados/Erro retornados:', data);
})
.catch(error => {
  console.error('💥 Erro na requisição:', error);
});

// Teste 2: Simplificar a requisição
setTimeout(() => {
  console.log('\n🧪 TESTE 2: Requisição simplificada');
  const simpleUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co/rest/v1/telegram_users?select=id&limit=1';
  
  fetch(simpleUrl, {
    method: 'GET',
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`
    }
  })
  .then(response => {
    console.log('📊 Resposta do Teste 2 (simplificado):');
    console.log('  Status:', response.status, response.statusText);
    return response.text();
  })
  .then(data => {
    console.log('📄 Dados retornados:', data);
  });
}, 2000);

// Teste 3: Verificar se existe problema com user_id específico
setTimeout(() => {
  console.log('\n🧪 TESTE 3: Verificar filtro user_id');
  const filterUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co/rest/v1/telegram_users?select=count';
  
  fetch(filterUrl, {
    method: 'GET',
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`,
      'Prefer': 'count=exact'
    }
  })
  .then(response => {
    console.log('📊 Resposta do Teste 3 (count):');
    console.log('  Status:', response.status, response.statusText);
    if (response.headers.get('content-range')) {
      console.log('  Count:', response.headers.get('content-range'));
    }
    return response.text();
  })
  .then(data => {
    console.log('📄 Resposta count:', data);
  });
}, 4000);

console.log('\n⏱️ Aguardando resultados dos testes...');
