// TESTE WEBHOOK - Execute no console para verificar se webhook está funcionando

console.log('🔍 Testando webhook do bot...');

// 1. Testar se a API do webhook responde
fetch('https://stater.app/api/telegram-webhook', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: {
      message_id: 999,
      from: {
        id: 123456789,
        first_name: 'Teste',
        username: 'teste'
      },
      chat: {
        id: 123456789,
        type: 'private'
      },
      date: Math.floor(Date.now() / 1000),
      text: '757875'
    }
  })
})
.then(response => {
  console.log('📊 Status webhook:', response.status);
  return response.text();
})
.then(data => {
  console.log('📄 Resposta webhook:', data);
})
.catch(error => {
  console.error('❌ Erro webhook:', error);
});

// 2. Verificar se o código ainda está disponível
setTimeout(() => {
  fetch('https://tmucbwlhkffrhtexmjze.supabase.co/rest/v1/telegram_link_codes?user_id=eq.56d8f459-8650-4cd9-bf16-f7d70ddbc0a9&used_at=is.null&select=code,id,created_at', {
    headers: {'apikey': 'YOUR_JWT_TOKEN'}
  })
  .then(r => r.json())
  .then(data => {
    console.log('🔑 Códigos disponíveis:', data);
    if (data.length > 0) {
      console.log('⚠️ CÓDIGO AINDA DISPONÍVEL - Bot não processou!');
    } else {
      console.log('✅ Código foi usado - verificando conexão...');
    }
  });
}, 2000);
