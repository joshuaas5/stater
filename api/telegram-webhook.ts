// API Webhook do Telegram - Versão Simplificada e Funcional
import { createClient } from '@supabase/supabase-js';

// Configuração Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hlemutzuubhrkuhevsxo.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZW11dHp1dWJocmt1aGV2c3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMzQ3MTcsImV4cCI6MjA0NjkxMDcxN30.pUaQVR-YwLo6r7_N8n4rZGDCqYeGfgFEhYpyB5YkbzI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Token do bot - IMPORTANTE: configurar no Vercel
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7971646954:AAHpeNAzvg3kq7A1uER58XRms94sTjWZy5g';

// Função para enviar mensagem via Telegram Bot API
async function sendTelegramMessage(chatId: string, message: string) {
  try {
    console.log(`📤 Enviando mensagem para ${chatId}:`, message.substring(0, 100));
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro API Telegram:', result);
      return false;
    }

    console.log('✅ Mensagem enviada com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return false;
  }
}

// Handler principal do webhook
export default async function handler(req: any, res: any) {
  // Log detalhado para debug
  console.log('🤖 =================================');
  console.log('🤖 Webhook Telegram recebido');
  console.log('🤖 Método:', req.method);
  console.log('🤖 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🤖 Body:', JSON.stringify(req.body, null, 2));
  console.log('🤖 =================================');

  // Verificar se é uma requisição POST
  if (req.method !== 'POST') {
    console.log('❌ Método não é POST');
    return res.status(405).json({ error: 'Método não permitido' });
  }
  // Responder imediatamente para evitar timeout
  res.status(200).json({ ok: true, message: 'Webhook recebido' });

  try {
    const update = req.body;

    // Verificar se há uma mensagem
    if (!update || !update.message || !update.message.text) {
      console.log('📭 Sem mensagem de texto');
      return;
    }

    const chatId = update.message.chat.id.toString();
    const messageText = update.message.text.trim();
    const username = update.message.from.username || update.message.from.first_name || 'Usuário';

    console.log(`💬 Mensagem de ${username} (${chatId}): ${messageText}`);

    // Processar comandos de forma assíncrona
    setImmediate(async () => {
      try {
        // Comando /start - sempre responde
        if (messageText.startsWith('/start')) {
          const code = messageText.replace('/start', '').trim();
          
          if (code) {
            console.log(`🔑 Código de vinculação: ${code}`);
            await sendTelegramMessage(chatId, 
              `✅ *Código recebido!*\n\n` +
              `🔑 Código: \`${code}\`\n\n` +
              `⏳ Verificando vinculação...\n\n` +
              `_Em desenvolvimento - funcionalidade completa em breve!_`
            );
          } else {
            await sendTelegramMessage(chatId,
              '👋 *Bem-vindo ao ICTUS!*\n\n' +
              '🤖 Sou seu assistente financeiro.\n\n' +
              '📱 Para conectar sua conta:\n' +
              '1. Abra o app ICTUS\n' +
              '2. Vá para a Dashboard\n' +
              '3. Clique em "Conectar Agora"\n' +
              '4. Use o código gerado aqui\n\n' +
              '_Digite /help para mais comandos_'
            );
          }
          return;
        }

        // Comando /help
        if (messageText === '/help') {
          await sendTelegramMessage(chatId,
            '🤖 *ICTUS Assistente Financeiro*\n\n' +
            '*Comandos disponíveis:*\n\n' +
            '🔗 `/start [código]` - Conectar conta\n' +
            '💰 `/saldo` - Ver saldo atual\n' +
            '📊 `/gastos` - Gastos do mês\n' +
            '❓ `/help` - Este menu\n\n' +
            '_Mais funcionalidades em desenvolvimento..._'
          );
          return;
        }

        // Comando /saldo
        if (messageText === '/saldo') {
          await sendTelegramMessage(chatId,
            '💰 *Consulta de Saldo*\n\n' +
            '📊 Esta funcionalidade estará disponível em breve!\n\n' +
            '� *Para ativar:*\n' +
            '1. Conecte sua conta com `/start [código]`\n' +
            '2. Gere o código no app ICTUS\n\n' +
            '_Estamos finalizando a integração..._'
          );
          return;
        }

        // Comando /gastos
        if (messageText === '/gastos') {
          await sendTelegramMessage(chatId,
            '📊 *Relatório de Gastos*\n\n' +
            '📈 Esta funcionalidade estará disponível em breve!\n\n' +
            '🔗 *Para ativar:*\n' +
            '1. Conecte sua conta com `/start [código]`\n' +
            '2. Gere o código no app ICTUS\n\n' +
            '_Aguarde as próximas atualizações..._'
          );
          return;
        }

        // Outros comandos
        if (messageText.startsWith('/')) {
          await sendTelegramMessage(chatId,
            '❓ *Comando não reconhecido*\n\n' +
            'Digite `/help` para ver os comandos disponíveis.'
          );
          return;
        }

        // Mensagem livre
        await sendTelegramMessage(chatId,
          '� *Olá!*\n\n' +
          '🤖 Sou o assistente financeiro do ICTUS.\n\n' +
          '💡 *Dica:* Digite `/help` para ver o que posso fazer!\n\n' +
          '🔗 Para conectar sua conta, use `/start` e siga as instruções.'
        );

      } catch (error) {
        console.error('❌ Erro ao processar mensagem:', error);
        await sendTelegramMessage(chatId,
          '❌ *Ops! Algo deu errado*\n\n' +
          'Tente novamente em alguns segundos.\n\n' +
          '_Se o problema persistir, contate o suporte._'
        );
      }
    });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
  }
}
