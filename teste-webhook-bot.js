// TESTE WEBHOOK - Execute no console para verificar se webhook estÃ¡ funcionando

console.log('ðŸ” Testando webhook do bot...');

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
  console.log('ðŸ“Š Status webhook:', response.status);
  return response.text();
})
.then(data => {
  console.log('ðŸ“„ Resposta webhook:', data);
})
.catch(error => {
  console.error('âŒ Erro webhook:', error);
});

// 2. Verificar se o cÃ³digo ainda estÃ¡ disponÃ­vel
setTimeout(() => {
  fetch('https://tmucbwlhkffrhtexmjze.supabase.co/rest/v1/telegram_link_codes?user_id=eq.56d8f459-8650-4cd9-bf16-f7d70ddbc0a9&used_at=is.null&select=code,id,created_at', {
    headers: {'apikey': 'YOUR_JWT_TOKEN'}
  })
  .then(r => r.json())
  .then(data => {
    console.log('ðŸ”‘ CÃ³digos disponÃ­veis:', data);
    if (data.length > 0) {
      console.log('âš ï¸ CÃ“DIGO AINDA DISPONÃVEL - Bot nÃ£o processou!');
    } else {
      console.log('âœ… CÃ³digo foi usado - verificando conexÃ£o...');
    }
  });
}, 2000);
