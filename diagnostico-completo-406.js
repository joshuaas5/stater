// DIAGNÓSTICO COMPLETO DO ERRO 406 - Execute no console do navegador

console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DO ERRO 406...');

// 1. Verificar se Service Worker foi realmente atualizado
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    console.log('📋 Service Workers registrados:', registrations.length);
    registrations.forEach((reg, index) => {
      console.log(`SW ${index + 1}:`, {
        scope: reg.scope,
        state: reg.active?.state,
        scriptURL: reg.active?.scriptURL
      });
    });
  });
  
  // Verificar versão do cache
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      console.log('💾 Caches ativos:', cacheNames);
      cacheNames.forEach(cacheName => {
        if (cacheName.includes('stater')) {
          console.log(`Cache encontrado: ${cacheName} (deve ser 'stater-app-v2')`);
        }
      });
    });
  }
}

// 2. Teste direto da API do Supabase
console.log('🧪 Testando API do Supabase diretamente...');

// Pegar as configurações do Supabase do app
const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcyNDQ0MzgsImV4cCI6MjAyMjgyMDQzOH0.PeITSS8Up_TfNEKaKI7zT2jnhO8F4W3c2Ni3W_Q4IWE'; // Esta chave estava visível nos logs

// Teste 1: Requisição básica sem autenticação
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
  console.log('🔍 Teste 1 - Requisição básica:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });
  return response.text();
})
.then(data => {
  console.log('📄 Resposta do Teste 1:', data);
})
.catch(error => {
  console.error('❌ Erro no Teste 1:', error);
});

// 3. Verificar headers e CORS
console.log('🌐 Verificando configuração de CORS e headers...');

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
    console.log('🔍 Teste 2 - Com headers completos:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    if (!response.ok) {
      return response.text().then(text => {
        console.log('📄 Corpo da resposta de erro:', text);
      });
    }
    return response.json();
  })
  .then(data => {
    console.log('📄 Dados retornados:', data);
  })
  .catch(error => {
    console.error('❌ Erro no Teste 2:', error);
  });
}, 2000);

// 4. Verificar se há interceptadores de requisição
console.log('🔍 Verificando interceptadores de requisição...');
console.log('XMLHttpRequest original:', XMLHttpRequest.prototype.open.toString().includes('native'));
console.log('Fetch original:', fetch.toString().includes('native'));

// 5. Testar em modo incógnito (manual)
console.log('💡 PRÓXIMO PASSO: Teste em modo incógnito');
console.log('Abra uma aba incógnita e acesse: https://staterbills.vercel.app/settings/telegram');
console.log('Se funcionar em incógnito, o problema é cache/SW local');

console.log('🔍 DIAGNÓSTICO FINALIZADO - Aguarde resultados...');
