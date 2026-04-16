// DIAGNÃ“STICO COMPLETO DO ERRO 406 - Execute no console do navegador

console.log('ðŸ” INICIANDO DIAGNÃ“STICO COMPLETO DO ERRO 406...');

// 1. Verificar se Service Worker foi realmente atualizado
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('ðŸ“‹ Service Workers registrados:', registrations.length);
    registrations.forEach((reg, index) => {
      console.log(`SW ${index + 1}:`, {
        scope: reg.scope,
        state: reg.active?.state,
        scriptURL: reg.active?.scriptURL
      });
    });
  });
  
  // Verificar versÃ£o do cache
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      console.log('ðŸ’¾ Caches ativos:', cacheNames);
      cacheNames.forEach(cacheName => {
        if (cacheName.includes('stater')) {
          console.log(`Cache encontrado: ${cacheName} (deve ser 'stater-app-v2')`);
        }
      });
    });
  }
}

// 2. Teste direto da API do Supabase
console.log('ðŸ§ª Testando API do Supabase diretamente...');

// Pegar as configuraÃ§Ãµes do Supabase do app
const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const anonKey = 'YOUR_JWT_TOKEN'; // Esta chave estava visÃ­vel nos logs

// Teste 1: RequisiÃ§Ã£o bÃ¡sica sem autenticaÃ§Ã£o
fetch(`${supabaseUrl}/rest/v1/telegram_users?select=count`, {
  method: 'GET',
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'count=exact'
  }
})
.then(response => {
  console.log('ðŸ” Teste 1 - RequisiÃ§Ã£o bÃ¡sica:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });
  return response.text();
})
.then(data => {
  console.log('ðŸ“„ Resposta do Teste 1:', data);
})
.catch(error => {
  console.error('âŒ Erro no Teste 1:', error);
});

// 3. Verificar headers e CORS
console.log('ðŸŒ Verificando configuraÃ§Ã£o de CORS e headers...');

// Teste com diferentes headers
setTimeout(() => {
  fetch(`${supabaseUrl}/rest/v1/telegram_users?select=*&limit=1`, {
    method: 'GET',
    headers: {
      'apikey': anonKey,
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache'
    }
  })
  .then(response => {
    console.log('ðŸ” Teste 2 - Com headers completos:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      return response.text().then(text => {
        console.log('ðŸ“„ Corpo da resposta de erro:', text);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('ðŸ“„ Dados retornados:', data);
  })
  .catch(error => {
    console.error('âŒ Erro no Teste 2:', error);
  });
}, 2000);

// 4. Verificar se hÃ¡ interceptadores de requisiÃ§Ã£o
console.log('ðŸ” Verificando interceptadores de requisiÃ§Ã£o...');
console.log('XMLHttpRequest original:', XMLHttpRequest.prototype.open.toString().includes('native'));
console.log('Fetch original:', fetch.toString().includes('native'));

// 5. Testar em modo incÃ³gnito (manual)
console.log('ðŸ’¡ PRÃ“XIMO PASSO: Teste em modo incÃ³gnito');
console.log('Abra uma aba incÃ³gnita e acesse: https://stater.app/settings/telegram');
console.log('Se funcionar em incÃ³gnito, o problema Ã© cache/SW local');

console.log('ðŸ” DIAGNÃ“STICO FINALIZADO - Aguarde resultados...');
