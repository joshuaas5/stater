// TESTE FOCADO - Execute este cÃ³digo no console do navegador
// para diagnosticar o erro 406 especificamente

console.log('ðŸŽ¯ TESTE FOCADO - ERRO 406 TELEGRAM_USERS');
console.log('==============================================');

// Fazer a mesma requisiÃ§Ã£o que estÃ¡ falhando, mas com logs detalhados
const testUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co/rest/v1/telegram_users?select=*&user_id=eq.56d8f459-8650-4cd9-bf16-f7d70ddbc0a9&is_active=eq.true';
const apiKey = 'YOUR_JWT_TOKEN';

console.log('ðŸ“ URL da requisiÃ§Ã£o:', testUrl);
console.log('ðŸ”‘ API Key (Ãºltimos 10 chars):', '...' + apiKey.slice(-10));

// Teste 1: RequisiÃ§Ã£o exata que estÃ¡ falhando
console.log('\nðŸ§ª TESTE 1: RequisiÃ§Ã£o exata que falha no app');
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
  console.log('ðŸ“Š Resposta do Teste 1:');
  console.log('  Status:', response.status, response.statusText);
  console.log('  Headers de resposta:');
  for (let [key, value] of response.headers.entries()) {
    console.log(`    ${key}: ${value}`);
  }
  
  if (response.status === 406) {
    console.log('âŒ ERRO 406 confirmado!');
    return response.text();
  } else if (response.ok) {
    console.log('âœ… RequisiÃ§Ã£o funcionou!');
    return response.json();
  } else {
    console.log('âš ï¸ Outro erro:', response.status);
    return response.text();
  }
})
.then(data => {
  console.log('ðŸ“„ Dados/Erro retornados:', data);
})
.catch(error => {
  console.error('ðŸ’¥ Erro na requisiÃ§Ã£o:', error);
});

// Teste 2: Simplificar a requisiÃ§Ã£o
setTimeout(() => {
  console.log('\nðŸ§ª TESTE 2: RequisiÃ§Ã£o simplificada');
  const simpleUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co/rest/v1/telegram_users?select=id&limit=1';
  
  fetch(simpleUrl, {
    method: 'GET',
    headers: {
      'apikey': apiKey,
      'Authorization': `Bearer ${apiKey}`
    }
  })
  .then(response => {
    console.log('ðŸ“Š Resposta do Teste 2 (simplificado):');
    console.log('  Status:', response.status, response.statusText);
    return response.text();
  })
  .then(data => {
    console.log('ðŸ“„ Dados retornados:', data);
  });
}, 2000);

// Teste 3: Verificar se existe problema com user_id especÃ­fico
setTimeout(() => {
  console.log('\nðŸ§ª TESTE 3: Verificar filtro user_id');
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
    console.log('ðŸ“Š Resposta do Teste 3 (count):');
    console.log('  Status:', response.status, response.statusText);
    if (response.headers.get('content-range')) {
      console.log('  Count:', response.headers.get('content-range'));
    }
    return response.text();
  })
  .then(data => {
    console.log('ðŸ“„ Resposta count:', data);
  });
}, 4000);

console.log('\nâ±ï¸ Aguardando resultados dos testes...');
