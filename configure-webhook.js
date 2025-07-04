// Configuração rápida do webhook via fetch
const configureWebhook = async () => {
  // Token do bot (usar o que está configurado no Vercel)
  const BOT_TOKEN = '7774906065:AAGnHNWKAmj9xj-KxKs8SnQi5l3SJ4MrFgQ';
  const WEBHOOK_URL = 'https://ictus-six.vercel.app/api/telegram-webhook';

  console.log('🤖 Configurando webhook do bot Telegram...');
  console.log('🔗 Bot: https://t.me/stater');
  console.log('📡 Webhook URL:', WEBHOOK_URL);

  try {
    // 1. Primeiro, vamos limpar qualquer webhook existente
    console.log('\n🧹 Limpando webhook anterior...');
    const deleteResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    const deleteResult = await deleteResponse.json();
    console.log('📝 Limpeza:', deleteResult.ok ? '✅ Sucesso' : '❌ Falha');

    // 2. Configurar novo webhook
    console.log('\n⚙️ Configurando novo webhook...');
    const setResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true,
        max_connections: 40,
        secret_token: 'stater_webhook_secret_2025'
      })
    });

    const setResult = await setResponse.json();
    console.log('📝 Configuração:', JSON.stringify(setResult, null, 2));

    if (setResult.ok) {
      console.log('✅ Webhook configurado com sucesso!');
    } else {
      console.log('❌ Erro ao configurar webhook:', setResult.description);
      return;
    }

    // 3. Verificar configuração
    console.log('\n🔍 Verificando configuração...');
    const infoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const infoResult = await infoResponse.json();
    console.log('📊 Status do webhook:', JSON.stringify(infoResult, null, 2));

    // 4. Testar com getMe
    console.log('\n🤖 Testando bot...');
    const meResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const meResult = await meResponse.json();
    console.log('👤 Info do bot:', JSON.stringify(meResult, null, 2));

    if (meResult.ok) {
      console.log(`\n✅ Bot @${meResult.result.username} está ativo!`);
      console.log('🎉 Configuração completa!');
      console.log('\n📱 Para testar:');
      console.log('1. Acesse: https://t.me/stater');
      console.log('2. Digite: /start');
      console.log('3. Digite: /help');
      console.log('4. Teste: qualquer mensagem');
    }

  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
};

// Executar configuração
configureWebhook();
