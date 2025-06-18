// Teste básico do bot Telegram - verificar se está funcionando
console.log('🤖 Testando bot Telegram...\n');

// Vou testar com um token genérico primeiro
const testBotStatus = async () => {
  try {
    // Teste sem token para ver a resposta
    const response = await fetch('https://api.telegram.org/bot/getMe');
    const result = await response.json();
    
    console.log('📝 Resposta da API:', JSON.stringify(result, null, 2));
    
    if (result.error_code === 401) {
      console.log('❌ Token inválido ou não fornecido');
      console.log('💡 Para corrigir:');
      console.log('1. Acesse @BotFather no Telegram');
      console.log('2. Digite /mybots');
      console.log('3. Selecione o bot');
      console.log('4. Clique em "API Token"');
      console.log('5. Copie o token e configure no Vercel');
    }
  } catch (error) {
    console.error('❌ Erro:', error);
  }
};

const testWebhookEndpoint = async () => {
  try {
    console.log('🔗 Testando endpoint do webhook...');
    
    const response = await fetch('https://ictus-six.vercel.app/api/telegram-webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          chat: { id: 123456789 },
          from: { first_name: 'Teste' },
          text: '/start'
        }
      })
    });
    
    const result = await response.json();
    console.log('📝 Resposta do webhook:', JSON.stringify(result, null, 2));
    
    if (response.ok) {
      console.log('✅ Webhook está funcionando!');
    } else {
      console.log('❌ Problema no webhook');
    }
  } catch (error) {
    console.error('❌ Erro ao testar webhook:', error);
  }
};

(async () => {
  await testBotStatus();
  console.log('\n' + '='.repeat(50) + '\n');
  await testWebhookEndpoint();
  
  console.log('\n✅ Teste concluído!');
  console.log('🔧 Próximos passos:');
  console.log('1. Configure o token correto no Vercel');
  console.log('2. Configure o webhook com o token válido');
  console.log('3. Teste novamente o bot');
})();
