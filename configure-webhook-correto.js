const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || 'https://stater.app/api/telegram-webhook';

if (!BOT_TOKEN) {
  console.error('Defina TELEGRAM_BOT_TOKEN no ambiente.');
  process.exit(1);
}

async function configurarWebhookCorreto() {
  try {
    const currentWebhook = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    console.log('Webhook atual:', await currentWebhook.json());

    const setWebhook = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message'],
        max_connections: 40,
        drop_pending_updates: true
      })
    });

    console.log('Resultado:', await setWebhook.json());
  } catch (error) {
    console.error('Erro:', error);
  }
}

configurarWebhookCorreto();