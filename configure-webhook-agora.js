const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || 'https://stater.app/api/telegram-webhook';

if (!BOT_TOKEN) {
  console.error('Defina TELEGRAM_BOT_TOKEN no ambiente.');
  process.exit(1);
}

async function configureWebhook() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true
      })
    });

    const data = await response.json();
    console.log('setWebhook:', data);

    const check = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const checkData = await check.json();
    console.log('getWebhookInfo:', checkData);
  } catch (error) {
    console.error('Erro ao configurar webhook:', error);
  }
}

configureWebhook();