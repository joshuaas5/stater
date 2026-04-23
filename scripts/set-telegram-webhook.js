#!/usr/bin/env node
/**
 * Configuração/correção do webhook do Telegram (Stater)
 * 
 * Uso: node scripts/set-telegram-webhook.js
 * Requer: TELEGRAM_BOT_TOKEN nas variáveis de ambiente
 */

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || 'https://stater.app/api/telegram/webhook';

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function setupWebhook() {
  console.log('🔧 CONFIGURAÇÃO DO WEBHOOK DO TELEGRAM\n');
  console.log('=' .repeat(50));

  if (!TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN não configurado!');
    process.exit(1);
  }

  console.log(`🌐 URL do webhook: ${WEBHOOK_URL}`);
  console.log(`🤖 Token preview: ${TOKEN.substring(0, 10)}...${TOKEN.substring(TOKEN.length - 5)}\n`);

  // 1. Deletar webhook antigo
  console.log('🧹 Limpando webhook antigo...');
  try {
    await fetch(`${TELEGRAM_API}/deleteWebhook?drop_pending_updates=true`);
    console.log('✅ Webhook antigo removido.\n');
  } catch (err) {
    console.warn('⚠️  Não foi possível remover webhook antigo:', err.message);
  }

  // 2. Configurar novo webhook
  console.log('📡 Configurando novo webhook...');
  try {
    const res = await fetch(`${TELEGRAM_API}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query'],
        max_connections: 40,
      }),
    });
    const data = await res.json();

    if (data.ok) {
      console.log('✅ Webhook configurado com sucesso!\n');
    } else {
      console.error('❌ Erro ao configurar webhook:', data);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Falha ao configurar webhook:', err.message);
    process.exit(1);
  }

  // 3. Verificar configuração
  console.log('🔍 Verificando configuração...');
  try {
    const infoRes = await fetch(`${TELEGRAM_API}/getWebhookInfo`);
    const infoData = await infoRes.json();
    const info = infoData.result;
    console.log(`   URL: ${info.url}`);
    console.log(`   Pending updates: ${info.pending_update_count}`);
    if (info.last_error_date) {
      console.log(`   ⚠️  Last error: ${info.last_error_message}`);
    }
  } catch (err) {
    console.warn('⚠️  Não foi possível verificar webhook:', err.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Configuração concluída.\n');
}

setupWebhook().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
