
const axios = require('axios');
require('dotenv').config({ path: './telegram-bot/.env' });

const token = process.env.TELEGRAM_BOT_TOKEN;
// The public URL of your Vercel deployment, pointing to the new webhook rewrite.
const webhookUrl = `https://stater.app/api/telegram-webhook`; 

const telegramApiUrl = `https://api.telegram.org/bot${token}/setWebhook`;

async function setWebhook() {
  if (!token) {
    console.error('Error: TELEGRAM_BOT_TOKEN is not defined in your .env file.');
    return;
  }

  console.log(`Setting webhook to: ${webhookUrl}`);

  try {
    const response = await axios.post(telegramApiUrl, {
      url: webhookUrl,
    });

    if (response.data.ok) {
      console.log('✅ Webhook set successfully!');
      console.log(response.data.description);
    } else {
      console.error('❌ Failed to set webhook:');
      console.error(response.data);
    }
  } catch (error) {
    console.error('❌ An error occurred while setting the webhook:');
    console.error(error.response ? error.response.data : error.message);
  }
}

setWebhook();
