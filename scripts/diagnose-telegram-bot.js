#!/usr/bin/env node
/**
 * Diagnóstico completo do bot do Telegram (Stater)
 * 
 * Uso: node scripts/diagnose-telegram-bot.js
 * Requer: TELEGRAM_BOT_TOKEN nas variáveis de ambiente ou no .env
 */

const axios = require('axios');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || 'https://stater.app/api/telegram-webhook';

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function diagnose() {
  console.log('🔍 DIAGNÓSTICO DO BOT DO TELEGRAM\n');
  console.log('=' .repeat(50));

  // 1. Verificar se o token existe
  if (!TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN não configurado!');
    console.log('   Adicione TELEGRAM_BOT_TOKEN nas variáveis de ambiente do Vercel ou no .env local.');
    process.exit(1);
  }
  console.log('✅ TELEGRAM_BOT_TOKEN está configurado');
  console.log(`   Token preview: ${TOKEN.substring(0, 10)}...${TOKEN.substring(TOKEN.length - 5)}`);

  // 2. Verificar se o token é válido (getMe)
  try {
    const meRes = await axios.get(`${TELEGRAM_API}/getMe`);
    if (meRes.data.ok) {
      const bot = meRes.data.result;
      console.log('\n✅ Token válido!');
      console.log(`   Bot: @${bot.username}`);
      console.log(`   Nome: ${bot.first_name}`);
      console.log(`   Pode ler grupos: ${bot.can_read_all_group_messages ? 'Sim' : 'Não'}`);
      console.log(`   Modo inline: ${bot.supports_inline_queries ? 'Sim' : 'Não'}`);
    } else {
      console.error('\n❌ Token inválido ou erro na API do Telegram:', meRes.data);
      process.exit(1);
    }
  } catch (err) {
    console.error('\n❌ Erro ao validar token:', err.response?.data?.description || err.message);
    console.log('   Verifique se o token está correto e se o bot não foi revogado no @BotFather.');
    process.exit(1);
  }

  // 3. Verificar webhook configurado
  try {
    const whRes = await axios.get(`${TELEGRAM_API}/getWebhookInfo`);
    if (whRes.data.ok) {
      const info = whRes.data.result;
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
        console.log('   O bot não receberá mensagens via webhook.');
        console.log(`   Para configurar, rode: node scripts/set-telegram-webhook.js`);
      } else if (info.url !== WEBHOOK_URL) {
        console.log(`\n⚠️  Webhook configurado para URL diferente da esperada!`);
        console.log(`   Esperado: ${WEBHOOK_URL}`);
        console.log(`   Atual:    ${info.url}`);
        console.log(`   Para corrigir, rode: node scripts/set-telegram-webhook.js`);
      } else {
        console.log('\n✅ Webhook configurado corretamente!');
      }

      if (info.pending_update_count > 0) {
        console.log(`\n⚠️  Há ${info.pending_update_count} updates pendentes!`);
        console.log('   Isso pode indicar que o webhook não está respondendo corretamente.');
      }
    }
  } catch (err) {
    console.error('\n❌ Erro ao verificar webhook:', err.response?.data?.description || err.message);
  }

  // 4. Testar se a URL do webhook responde
  console.log('\n🌐 Testando URL do webhook...');
  try {
    const healthRes = await axios.get(WEBHOOK_URL, { timeout: 10000 });
    console.log(`   Status: ${healthRes.status}`);
    console.log(`   Response:`, healthRes.data);
    if (healthRes.status === 200) {
      console.log('✅ Webhook está respondendo!');
    } else {
      console.log('⚠️  Webhook respondeu com status inesperado.');
    }
  } catch (err) {
    console.error(`   ❌ Webhook NÃO respondeu: ${err.message}`);
    console.log(`   URL testada: ${WEBHOOK_URL}`);
    console.log('   Possíveis causas:');
    console.log('   - O deploy no Vercel falhou');
    console.log('   - A variável de ambiente TELEGRAM_BOT_TOKEN não está no Vercel');
    console.log('   - O rewrite no vercel.json está incorreto');
  }

  // 5. Verificar variáveis críticas
  console.log('\n🔐 Variáveis de ambiente críticas:');
  const vars = [
    'TELEGRAM_BOT_TOKEN',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
    'GEMINI_API_KEY',
  ];
  for (const v of vars) {
    const val = process.env[v];
    console.log(`   ${v}: ${val ? `✅ configurado (${val.substring(0, 8)}...)` : '❌ AUSENTE'}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Diagnóstico concluído.\n');
}

diagnose().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
