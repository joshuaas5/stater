const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

if (!BOT_TOKEN) {
  console.error('Defina TELEGRAM_BOT_TOKEN no ambiente.');
  process.exit(1);
}

async function testBotStatus() {
  try {
    const botResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    console.log('getMe:', await botResponse.json());

    const webhookResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    console.log('getWebhookInfo:', await webhookResponse.json());
  } catch (error) {
    console.error('Erro ao testar bot:', error);
  }
}

testBotStatus();