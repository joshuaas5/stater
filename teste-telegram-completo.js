const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

if (!BOT_TOKEN) {
  console.error('Defina TELEGRAM_BOT_TOKEN no ambiente.');
  process.exit(1);
}

async function testTelegramFlow() {
  try {
    const webhookTest = await fetch('https://stater.app/api/telegram-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: {
          chat: { id: 123456789 },
          text: '/start',
          from: { id: 123456789, first_name: 'Teste' }
        }
      })
    });
    console.log('Webhook status:', webhookTest.status);

    const botResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    console.log('Bot:', await botResponse.json());

    const webhookInfo = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    console.log('Webhook info:', await webhookInfo.json());
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testTelegramFlow();