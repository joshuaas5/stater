// API Webhook do Telegram para conectar ao Assistente IA
import { createClient } from '@supabase/supabase-js';

// Configuração Supabase
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hlemutzuubhrkuhevsxo.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZW11dHp1dWJocmt1aGV2c3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMzQ3MTcsImV4cCI6MjA0NjkxMDcxN30.pUaQVR-YwLo6r7_N8n4rZGDCqYeGfgFEhYpyB5YkbzI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para enviar mensagem via Telegram Bot API
async function sendTelegramMessage(chatId: string, message: string) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN não configurado');
    return false;
  }

  try {
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

    if (!response.ok) {
      throw new Error(`Telegram API error: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem Telegram:', error);
    return false;
  }
}

// Handler principal do webhook
export default async function handler(req: any, res: any) {
  console.log('🤖 Webhook Telegram recebido');

  // Verificar se é uma requisição POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const update = req.body;
    console.log('📨 Update recebido:', JSON.stringify(update, null, 2));

    // Verificar se há uma mensagem
    if (!update.message || !update.message.text) {
      return res.status(200).json({ ok: true });
    }

    const chatId = update.message.chat.id.toString();
    const messageText = update.message.text;
    const username = update.message.from.username || update.message.from.first_name || 'Usuário';

    console.log(`💬 Mensagem de ${username} (${chatId}): ${messageText}`);

    // Comando /start com código de vinculação
    if (messageText.startsWith('/start ')) {
      const code = messageText.replace('/start ', '').trim();
      console.log(`🔑 Tentativa de vinculação com código: ${code}`);

      try {
        // Buscar código no banco de dados
        const { data: linkData, error: linkError } = await supabase
          .from('telegram_link_codes')
          .select('*')
          .eq('code', code)
          .single();

        if (linkError || !linkData) {
          console.log('❌ Código não encontrado:', linkError);
          await sendTelegramMessage(chatId, 
            '❌ *Código inválido ou expirado*\n\n' +
            'Gere um novo código no app ICTUS:\n' +
            '1. Abra o app\n' +
            '2. Vá para a Dashboard\n' +
            '3. Clique em "Conectar Agora" no card do Telegram'
          );
          return res.status(200).json({ ok: true });
        }

        // Verificar se o código ainda é válido
        const now = new Date();
        const expiresAt = new Date(linkData.expires_at);
        
        if (now > expiresAt) {
          console.log('⏰ Código expirado');
          await sendTelegramMessage(chatId,
            '⏰ *Código expirado*\n\n' +
            'Gere um novo código no app ICTUS.'
          );
          return res.status(200).json({ ok: true });
        }

        // Verificar se já foi usado
        if (linkData.used_at) {
          console.log('🔄 Código já foi usado');
          await sendTelegramMessage(chatId,
            '🔄 *Código já foi utilizado*\n\n' +
            'Se você já está conectado, pode começar a usar!\n' +
            'Caso contrário, gere um novo código no app.'
          );
          return res.status(200).json({ ok: true });
        }

        // Verificar se já existe uma vinculação para este chat
        const { data: existingUser } = await supabase
          .from('telegram_users')
          .select('*')
          .eq('telegram_chat_id', chatId)
          .single();

        if (existingUser) {
          console.log('👤 Usuário já vinculado, atualizando...');
          
          // Atualizar vinculação existente
          const { error: updateError } = await supabase
            .from('telegram_users')
            .update({
              user_id: linkData.user_id,
              user_email: linkData.user_email,
              user_name: linkData.user_name,
              linked_at: new Date().toISOString(),
              is_active: true
            })
            .eq('telegram_chat_id', chatId);

          if (updateError) throw updateError;
        } else {
          console.log('🆕 Criando nova vinculação...');
          
          // Criar nova vinculação
          const { error: insertError } = await supabase
            .from('telegram_users')
            .insert({
              telegram_chat_id: chatId,
              user_id: linkData.user_id,
              user_email: linkData.user_email,
              user_name: linkData.user_name,
              linked_at: new Date().toISOString(),
              is_active: true
            });

          if (insertError) throw insertError;
        }

        // Marcar código como usado
        const { error: usedError } = await supabase
          .from('telegram_link_codes')
          .update({ used_at: new Date().toISOString() })
          .eq('code', code);

        if (usedError) throw usedError;

        // Enviar mensagem de sucesso
        await sendTelegramMessage(chatId,
          '✅ *Conexão estabelecida com sucesso!*\n\n' +
          `👤 Olá, ${linkData.user_name}!\n\n` +
          '🎉 Seu Telegram está conectado ao ICTUS Assistente Financeiro IA.\n\n' +
          '*Você pode agora:*\n' +
          '💰 Receber notificações de transações\n' +
          '📊 Consultar seu saldo\n' +
          '📋 Ver relatórios financeiros\n' +
          '🔔 Receber lembretes de contas\n\n' +
          '_Digite /help para ver todos os comandos disponíveis._'
        );

        console.log('✅ Vinculação concluída com sucesso!');
        return res.status(200).json({ ok: true, message: 'Vinculação realizada' });

      } catch (error) {
        console.error('❌ Erro na vinculação:', error);
        await sendTelegramMessage(chatId,
          '❌ *Erro na conexão*\n\n' +
          'Ocorreu um problema. Tente gerar um novo código no app.'
        );
        return res.status(200).json({ ok: true });
      }
    }

    // Comando /help
    if (messageText === '/help') {
      await sendTelegramMessage(chatId,
        '🤖 *ICTUS Assistente Financeiro IA*\n\n' +
        '*Comandos disponíveis:*\n\n' +
        '/saldo - Ver saldo atual\n' +
        '/transacoes - Últimas transações\n' +
        '/gastos - Gastos do mês\n' +
        '/help - Este menu de ajuda\n\n' +
        '_Mais funcionalidades em desenvolvimento..._'
      );
      return res.status(200).json({ ok: true });
    }

    // Comando /saldo
    if (messageText === '/saldo') {
      // Verificar se usuário está vinculado
      const { data: telegramUser } = await supabase
        .from('telegram_users')
        .select('*')
        .eq('telegram_chat_id', chatId)
        .eq('is_active', true)
        .single();

      if (!telegramUser) {
        await sendTelegramMessage(chatId,
          '❌ *Não conectado*\n\n' +
          'Você precisa conectar sua conta primeiro.\n' +
          'Gere um código de vinculação no app ICTUS.'
        );
        return res.status(200).json({ ok: true });
      }

      await sendTelegramMessage(chatId,
        '💰 *Saldo Atual*\n\n' +
        '📊 Esta funcionalidade estará disponível em breve!\n\n' +
        '_Estamos integrando com o sistema de transações..._'
      );
      return res.status(200).json({ ok: true });
    }

    // Comando padrão para mensagens não reconhecidas
    if (messageText.startsWith('/')) {
      await sendTelegramMessage(chatId,
        '❓ *Comando não reconhecido*\n\n' +
        'Digite /help para ver os comandos disponíveis.'
      );
    } else {
      // Mensagem livre - resposta amigável
      await sendTelegramMessage(chatId,
        '👋 *Olá!*\n\n' +
        'Sou o assistente financeiro do ICTUS.\n\n' +
        'Digite /help para ver o que posso fazer por você!'
      );
    }

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
