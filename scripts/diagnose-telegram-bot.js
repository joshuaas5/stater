#!/usr/bin/env node
/**
 * Diagnóstico completo do bot do Telegram (Stater)
 * 
 * Uso: TELEGRAM_BOT_TOKEN=seu_token node scripts/diagnose-telegram-bot.js
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || 'https://stater.app/api/telegram-webhook';

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function diagnose() {
  console.log('🔍 DIAGNÓSTICO DO BOT DO TELEGRAM\n');
  console.log('=' .repeat(50));

  if (!TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN não configurado!');
    console.log('   Defina a variável de ambiente TELEGRAM_BOT_TOKEN.');
    process.exit(1);
  }
  console.log('✅ TELEGRAM_BOT_TOKEN está configurado');
  console.log(`   Token preview: ${TOKEN.substring(0, 10)}...${TOKEN.substring(TOKEN.length - 5)}`);

  // 2. Verificar token (getMe)
  try {
    const meRes = await fetch(`${TELEGRAM_API}/getMe`);
    const meData = await meRes.json();
    if (meData.ok) {
      const bot = meData.result;
      console.log('\n✅ Token válido!');
      console.log(`   Bot: @${bot.username}`);
      console.log(`   Nome: ${bot.first_name}`);
      console.log(`   Pode ler grupos: ${bot.can_read_all_group_messages ? 'Sim' : 'Não'}`);
      console.log(`   Modo inline: ${bot.supports_inline_queries ? 'Sim' : 'Não'}`);
    } else {
      console.error('\n❌ Token inválido:', meData);
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ Erro ao validar token:', err.message);
    console.log('   Verifique se o token está correto e se o bot não foi revogado no @BotFather.');
    process.exit(1);
  }

  // 3. Verificar webhook
  try {
    const whRes = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const whData = await whRes.json();
    if (whData.ok) {
      const info = whData.result;
      console.log('\n📡 Informações do Webhook:');
      console.log(`   URL: ${info.url || '(não configurado)'}`);
      console.log(`   Has custom certificate: ${info.has_custom_certificate}`);
      console.log(`   Pending updates: ${info.pending_update_count}`);
      if (info.last_error_date) {
        console.log(`   ⚠️  Last error: ${info.last_error_message}`);
        console.log(`   ⚠️  Last error date: ${new Date(info.last_error_date * 1000).toISOString()}`);
      }
      if (info.max_connections) {
        console.log(`   Max connections: ${info.max_connections}`);
      }

      if (!info.url) {
        console.log('\n⚠️  Webhook NÃO está configurado!');
        console.log(`   Para configurar: TELEGRAM_BOT_TOKEN=seu_token node scripts/set-telegram-webhook.js`);
      } else if (info.url !== WEBHOOK_URL) {
        console.log(`\n⚠️  Webhook configurado para URL diferente!`);
        console.log(`   Esperado: ${WEBHOOK_URL}`);
        console.log(`   Atual:    ${info.url}`);
      } else {
        console.log('\n✅ Webhook configurado corretamente!');
      }

      if (info.pending_update_count > 0) {
        console.log(`\n⚠️  Há ${info.pending_update_count} updates pendentes!`);
      }
    }
  } catch (err) {
    console.error('\n❌ Erro ao verificar webhook:', err.message);
  }

  // 4. Testar URL do webhook
  console.log('\n🌐 Testando URL do webhook...');
  try {
    const healthRes = await fetch(WEBHOOK_URL, { method: 'GET' });
    const healthData = await healthRes.json().catch(() => ({}));
    console.log(`   Status: ${healthRes.status}`);
    console.log(`   Response:`, healthData);
    if (healthRes.status === 200) {
      console.log('✅ Webhook está respondendo!');
    } else {
      console.log('⚠️  Webhook respondeu com status inesperado.');
    }
  } catch (err) {
    console.error(`   ❌ Webhook NÃO respondeu: ${err.message}`);
    console.log(`   URL: ${WEBHOOK_URL}`);
    console.log('   Causas possíveis: deploy falhou, variáveis de ambiente faltando no Vercel, rewrite incorreto.');
  }

  console.log('\n' + '='.repeat(50));
  console.log('Diagnóstico concluído.\n');
}

diagnose().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
