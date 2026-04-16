const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || 'https://stater.app/api/telegram-webhook';
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || undefined;

if (!BOT_TOKEN) {
  console.error('Defina TELEGRAM_BOT_TOKEN no ambiente.');
  process.exit(1);
}

async function configureWebhook() {
  try {
    const deleteResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    console.log('deleteWebhook:', await deleteResponse.json());

    const body = {
      url: WEBHOOK_URL,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true,
      max_connections: 40,
      secret_token: WEBHOOK_SECRET
    };

    const setResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    console.log('setWebhook:', await setResponse.json());

    const infoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    console.log('getWebhookInfo:', await infoResponse.json());
  } catch (error) {
    console.error('Erro na configuracao:', error);
  }
}

configureWebhook();