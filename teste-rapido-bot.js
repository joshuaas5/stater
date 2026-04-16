const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || 'https://stater.app/api/telegram-webhook';

if (!BOT_TOKEN) {
  console.error('Defina TELEGRAM_BOT_TOKEN no ambiente.');
  process.exit(1);
}

async function testeRapido() {
  const testUpdate = {
    update_id: Date.now(),
    message: {
      message_id: Date.now(),
      from: { id: 123456789, is_bot: false, first_name: 'TesteUser', username: 'teste' },
      chat: { id: 123456789, first_name: 'TesteUser', type: 'private' },
      date: Math.floor(Date.now() / 1000),
      text: '/help'
    }
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUpdate)
    });

    console.log('Status:', response.status, response.statusText);
    const text = await response.text();
    console.log('Resposta:', text.substring(0, 300));
  } catch (error) {
    console.error('Erro na requisicao:', error);
  }
}

testeRapido();