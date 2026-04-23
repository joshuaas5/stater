#!/usr/bin/env node
/**
 * Configuração/correção do webhook do Telegram (Stater)
 * 
 * Uso: node scripts/set-telegram-webhook.js
 * Requer: TELEGRAM_BOT_TOKEN nas variáveis de ambiente
 */

const axios = require('axios');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || 'https://stater.app/api/telegram-webhook';

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

async function setupWebhook() {
  console.log('🔧 CONFIGURAÇÃO DO WEBHOOK DO TELEGRAM\n');
  console.log('=' .repeat(50));

  if (!TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN não configurado!');
    console.log('   Adicione nas variáveis de ambiente ou crie um arquivo .env na raiz do projeto.');
    process.exit(1);
  }

  console.log(`🌐 URL do webhook: ${WEBHOOK_URL}`);
  console.log(`🤖 Token preview: ${TOKEN.substring(0, 10)}...${TOKEN.substring(TOKEN.length - 5)}\n`);

  // 1. Deletar webhook antigo (limpa updates pendentes)
  console.log('🧹 Limpando webhook antigo...');
  try {
    await axios.get(`${TELEGRAM_API}/deleteWebhook?drop_pending_updates=true`);
    console.log('✅ Webhook antigo removido e updates pendentes limpos.\n');
  } catch (err) {
    console.warn('⚠️  Não foi possível remover webhook antigo:', err.response?.data?.description || err.message);
  }

  // 2. Configurar novo webhook
  console.log('📡 Configurando novo webhook...');
  try {
    const res = await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: WEBHOOK_URL,
      allowed_updates: ['message', 'callback_query', 'inline_query'],
      max_connections: 40,
    });

    if (res.data.ok) {
      console.log('✅ Webhook configurado com sucesso!\n');
    } else {
      console.error('❌ Erro ao configurar webhook:', res.data);
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Falha ao configurar webhook:', err.response?.data?.description || err.message);
    console.log('\nPossíveis causas:');
    console.log('- Token inválido ou bot deletado no @BotFather');
    console.log('- URL do webhook inacessível (o Telegram faz um HEAD request para validar)');
    console.log('- Certificado SSL inválido na URL');
    process.exit(1);
  }

  // 3. Verificar configuração
  console.log('🔍 Verificando configuração...');
  try {
    const infoRes = await axios.get(`${TELEGRAM_API}/getWebhookInfo`);
    const info = infoRes.data.result;
    console.log(`   URL: ${info.url}`);
    console.log(`   Pending updates: ${info.pending_update_count}`);
    console.log(`   Max connections: ${info.max_connections || 40}`);
    if (info.last_error_date) {
      console.log(`   ⚠️  Atenção: houve erro recente: ${info.last_error_message}`);
    }
  } catch (err) {
    console.warn('⚠️  Não foi possível verificar webhook:', err.message);
  }

  // 4. Testar envio de mensagem (se houver chat_id de teste)
  const TEST_CHAT_ID = process.env.TELEGRAM_TEST_CHAT_ID;
  if (TEST_CHAT_ID) {
    console.log(`\n📤 Enviando mensagem de teste para chat ${TEST_CHAT_ID}...`);
    try {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: TEST_CHAT_ID,
        text: '✅ Webhook do Stater configurado e funcionando!',
      });
      console.log('✅ Mensagem de teste enviada com sucesso!');
    } catch (err) {
      console.warn('⚠️  Falha ao enviar mensagem de teste:', err.response?.data?.description || err.message);
    }
  } else {
    console.log('\n💡 Dica: defina TELEGRAM_TEST_CHAT_ID para enviar uma mensagem de teste automática.');
    console.log('   Você pode descobrir seu chat ID enviando uma mensagem para o bot e acessando:');
    console.log('   https://api.telegram.org/bot<SEU_TOKEN>/getUpdates');
  }

  console.log('\n' + '='.repeat(50));
  console.log('Configuração concluída.\n');
}

setupWebhook().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
