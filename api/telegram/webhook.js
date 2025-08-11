
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const path = require('path');

// Adjust .env path for the serverless environment. Assumes .env is in the root.
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// Instantiate bot without polling.
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// NOTE: In-memory storage is not reliable in a stateless serverless environment.
// These will only persist for the duration of a single request.
const pendingTransactions = new Map();
const userSessions = new Map();

// =================================================================================
// Vercel Serverless Function Handler
// =================================================================================

module.exports = async (req, res) => {
    // Handle UptimeRobot GET requests to keep the bot "warm" and show as "Up".
    if (req.method === 'GET') {
        return res.status(200).json({ status: 'active', message: 'Bot is running and ready for POST updates from Telegram.' });
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const update = req.body;
        // Process the update from Telegram.
        await handleUpdate(update);
        res.status(200).send('Update processed successfully');
    } catch (error) {
        console.error('Error processing Telegram update:', error);
        res.status(500).send('Error processing update');
    }
};


// =================================================================================
// Update Router
// This function replaces the bot.on() event listeners.
// =================================================================================

async function handleUpdate(update) {
    const message = update.message || update.edited_message;
    if (!message) {
        console.log('Received a non-message update, ignoring.');
        return;
    }

    const chatId = message.chat.id;
    const text = message.text;
    const photo = message.photo;

    // Route based on message content
    if (text) {
        if (text.startsWith('/start')) return await handleStart(message);
        if (text.startsWith('/help')) return await handleHelp(message);
        if (text.startsWith('/dashboard')) return await handleDashboard(message);
        if (text.startsWith('/conectar')) return await handleConectar(message);
        if (text.startsWith('/conta')) return await handleConta(message);
        if (text.startsWith('/sair')) return await handleSair(message);
        // If not a command, treat as a regular text message (chat, confirmation, link code)
        return await handleTextMessage(message);
    }

    if (photo) {
        return await handlePhoto(message);
    }
}


// =================================================================================
// Session Management (Crucial for Serverless)
// =================================================================================

async function getSession(chatId) {
    // Check cache for the current request first
    if (userSessions.has(chatId)) {
        return userSessions.get(chatId);
    }

    // If not in cache, fetch from the database
    try {
        const { data: activeUser, error } = await supabase
            .from('telegram_users')
            .select('user_id, user_email, user_name')
            .eq('telegram_chat_id', chatId.toString())
            .eq('is_active', true)
            .single();

        if (error || !activeUser) {
            return null; // User not found or not active
        }

        const session = {
            userId: activeUser.user_id,
            userEmail: activeUser.user_email,
            userName: activeUser.user_name
        };
        userSessions.set(chatId, session); // Cache for the duration of this single request
        return session;
    } catch (e) {
        console.error(`Failed to load session for chat ${chatId}:`, e);
        return null;
    }
}


// =================================================================================
// Refactored Bot Logic (from bot.js)
// Each function now gets the `msg` object directly.
// =================================================================================

async function handleStart(msg) {
    const chatId = msg.chat.id;
    const match = msg.text.match(/\/start(.*)/);
    const linkCode = match[1] ? match[1].trim() : null;

    if (linkCode) {
        const linkResult = await linkTelegramWithCode(chatId, linkCode);
        if (linkResult.success) {
            const welcomeMessage = `🎉 *Conectado com sucesso!*\n\nOi ${linkResult.userName}! 👋\n\n✨ *Agora você pode:*\n📸 Enviar foto do seu extrato\n💬 Fazer perguntas sobre dinheiro\n📊 Ver suas transações\n\n🚀 *Vamos começar?*\nMande uma foto do seu extrato ou pergunte algo!`;
            await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
            return;
        }
    }

    const welcomeMessage = `👋 *Olá! Sou o Stater IA*\n\n🔒 *Para usar todos os recursos, conecte sua conta:*\n\n**Como conectar:**\n1. Acesse: ${process.env.APP_URL}\n2. Vá em Configurações → Bot Telegram\n3. Gere um código de vinculação\n4. Envie o código aqui no chat\n\n⚠️ *Importante:* Sem conexão, não posso acessar seus dados financeiros ou fazer análises personalizadas.\n\n💡 Use /help para ver mais comandos.`;
    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
}

async function handleHelp(msg) {
    const chatId = msg.chat.id;
    const userSession = await getSession(chatId);

    let helpMessage = `🆘 *Stater IA - Ajuda*\n\n... (conteúdo do help) ...`; // Conteúdo do help aqui
    if (!userSession) {
        helpMessage += `\n\nSTATUS: Conta não conectada`;
    } else {
        helpMessage += `\n\nSTATUS: Conectado como ${userSession.userName}`;
    }
    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
}

async function handleDashboard(msg) {
    const dashboardMessage = `📊 *Abrir seu app Stater:*\n\n🔗 ${process.env.APP_URL}\n\n💰 Veja suas transações e gráficos!`;
    await bot.sendMessage(msg.chat.id, dashboardMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[{ text: '📱 Abrir Stater App', url: process.env.APP_URL }]]
        }
    });
}

async function handleConectar(msg) {
    const chatId = msg.chat.id;
    const userSession = await getSession(chatId);

    if (userSession) {
        await bot.sendMessage(chatId, `✅ *Você já está conectado!*\n\n👤 *Conta:* ${userSession.userName}\n📧 *Email:* ${userSession.userEmail}\n\nUse /conta para ver detalhes ou /sair para desconectar.`, { parse_mode: 'Markdown' });
        return;
    }

    const connectMessage = `🔗 *Como conectar sua conta Stater:*\n\n**Método recomendado:**\n1. Acesse: ${process.env.APP_URL}\n2. Faça login na sua conta\n3. Vá em Configurações → Bot Telegram\n4. Clique em "Gerar Código de Vinculação"\n5. Envie o código aqui no chat\n\n⚠️ *Importante:* Você precisa ter uma conta criada no app antes de conectar.`;
    await bot.sendMessage(chatId, connectMessage, { parse_mode: 'Markdown' });
}

async function handleConta(msg) {
    const chatId = msg.chat.id;
    const userSession = await getSession(chatId);

    if (!userSession) {
        await bot.sendMessage(chatId, `🚫 *Você não está conectado.*\n\nUse /conectar para saber como vincular sua conta.`, { parse_mode: 'Markdown' });
        return;
    }

    const accountMessage = `👤 *Sua Conta Stater:*\n\n**Nome:** ${userSession.userName}\n**Email:** ${userSession.userEmail}\n**Chat ID:** \`${chatId}\`\n\n*Para mais detalhes, acesse o app.*`;
    await bot.sendMessage(chatId, accountMessage, { parse_mode: 'Markdown' });
}

async function handleSair(msg) {
    const chatId = msg.chat.id;
    const userSession = await getSession(chatId);

    if (!userSession) {
        await bot.sendMessage(chatId, `🤔 *Você não está conectado.*`, { parse_mode: 'Markdown' });
        return;
    }

    try {
        userSessions.delete(chatId); // Remove from local cache
        await supabase.from('telegram_users').update({ is_active: false }).eq('telegram_chat_id', chatId.toString());
        await bot.sendMessage(chatId, `👋 *Desconectado com sucesso!*\n\nSua conta **${userSession.userName}** foi desvinculada. Para reconectar, use /conectar.`, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error during sign out:', error);
        await bot.sendMessage(chatId, `❌ Erro ao desconectar. Tente novamente.`, { parse_mode: 'Markdown' });
    }
}

async function handlePhoto(msg) {
    const chatId = msg.chat.id;
    const photo = msg.photo[msg.photo.length - 1];
    const processingMsg = await bot.sendMessage(chatId, '🧠 *Analisando extrato...* Aguarde um momento.', { parse_mode: 'Markdown' });

    try {
        const fileUrl = await bot.getFileLink(photo.file_id);
        const result = await processImageWithGemini(fileUrl);
        await bot.deleteMessage(chatId, processingMsg.message_id);

        if (result.transactions && result.transactions.length > 0) {
            pendingTransactions.set(chatId, { transactions: result.transactions });
            const response = formatTransactionsResponse(result.transactions);
            await bot.sendMessage(chatId, response, {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: [[{ text: '✅ SIM' }, { text: '❌ NÃO' }]],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        } else {
            await bot.sendMessage(chatId, '😥 *Não consegui encontrar transações neste extrato.*\nTente uma foto mais nítida.', { parse_mode: 'Markdown' });
        }
    } catch (error) {
        await bot.deleteMessage(chatId, processingMsg.message_id);
        console.error('Error processing image:', error);
        await bot.sendMessage(chatId, '😥 *Erro ao processar imagem.* Tente novamente.', { parse_mode: 'Markdown' });
    }
}

async function handleTextMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;

    // 1. Handle confirmation
    if (text.toLowerCase() === '✅ sim' || text.toLowerCase() === 'sim') {
        return await confirmTransactions(chatId);
    }
    if (text.toLowerCase() === '❌ não' || text.toLowerCase() === 'nao' || text.toLowerCase() === 'não') {
        pendingTransactions.delete(chatId);
        await bot.sendMessage(chatId, `OK, transações descartadas.`, { reply_markup: { remove_keyboard: true } });
        return;
    }

    // 2. Handle link code
    if (/^\d{6}$/.test(text.trim())) {
        const linkResult = await linkTelegramWithCode(chatId, text.trim());
        if (linkResult.success) {
            await bot.sendMessage(chatId, `🎉 *Conectado com sucesso!*\n\nOi ${linkResult.userName}! 👋`, { parse_mode: 'Markdown' });
        } else {
            await bot.sendMessage(chatId, `❌ *Código inválido ou expirado.*\n\nGere um novo código no app.`, { parse_mode: 'Markdown' });
        }
        return;
    }

    // 3. Handle chat
    const userSession = await getSession(chatId);
    if (userSession) {
        await processChatMessage(chatId, text, userSession);
    } else {
        await bot.sendMessage(chatId, `🔒 *Conta não conectada.*\n\nPara usar o chat, preciso que conecte sua conta. Use o comando /conectar para saber como.`, { parse_mode: 'Markdown' });
    }
}


// =================================================================================
// Helper Functions (Copied and verified from bot.js)
// =================================================================================

async function processChatMessage(chatId, message, userSession) {
    const processingMsg = await bot.sendMessage(chatId, '🤔 *Pensando...*', { parse_mode: 'Markdown' });
    try {
        const userContext = await getUserContextForChat(userSession.userId);
        const response = await callGeminiForChat(message, userContext, userSession);
        await bot.deleteMessage(chatId, processingMsg.message_id);
        await bot.sendMessage(chatId, response, { parse_mode: 'Markdown', disable_web_page_preview: true });
    } catch (error) {
        await bot.deleteMessage(chatId, processingMsg.message_id);
        console.error('Error in chat processing:', error);
        await bot.sendMessage(chatId, '😥 Desculpe, ocorreu um erro. Tente novamente.', { parse_mode: 'Markdown' });
    }
}

async function confirmTransactions(chatId) {
    const pending = pendingTransactions.get(chatId);
    const userSession = await getSession(chatId);

    if (!pending) {
        await bot.sendMessage(chatId, '🤔 Nenhuma transação pendente.', { reply_markup: { remove_keyboard: true } });
        return;
    }
    if (!userSession) {
        await bot.sendMessage(chatId, '🔒 Você precisa estar conectado para salvar. Use /conectar.', { reply_markup: { remove_keyboard: true } });
        return;
    }

    let savedCount = 0;
    for (const tx of pending.transactions) {
        const success = await saveTransactionToSupabase(userSession.userId, tx);
        if (success) savedCount++;
    }

    pendingTransactions.delete(chatId);
    await bot.sendMessage(chatId, `✅ *Transações salvas!*\n\n${savedCount} de ${pending.transactions.length} foram salvas com sucesso.`, {
        parse_mode: 'Markdown',
        reply_markup: { remove_keyboard: true }
    });
}

async function linkTelegramWithCode(chatId, linkCode) {
    try {
        const { data, error } = await supabase
            .from('telegram_link_codes')
            .select('user_id, user_email, user_name, expires_at')
            .eq('code', linkCode)
            .single();

        if (error || !data || new Date() > new Date(data.expires_at)) {
            return { success: false, message: 'Código inválido ou expirado' };
        }

        await supabase.from('telegram_link_codes').update({ used_at: new Date().toISOString() }).eq('code', linkCode);
        await supabase.from('telegram_users').upsert({
            telegram_chat_id: chatId.toString(),
            user_id: data.user_id,
            user_email: data.user_email,
            user_name: data.user_name,
            linked_at: new Date().toISOString(),
            is_active: true
        });

        // Manually update session cache for the current request
        userSessions.set(chatId, { userId: data.user_id, userEmail: data.user_email, userName: data.user_name });

        return { success: true, userName: data.user_name };
    } catch (e) {
        console.error('Error linking code:', e);
        return { success: false, message: 'Erro interno' };
    }
}

// All other helper functions (processImageWithGemini, formatTransactionsResponse, etc.)
// should be copied here without modification as they are self-contained.

async function processImageWithGemini(imageUrl) {
    try {
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBase64 = Buffer.from(imageResponse.data).toString('base64');
        const prompt = `Analise este extrato bancário e extraia as transações em formato JSON: [{"data": "DD/MM/YYYY", "descricao": "...", "valor": numero, "categoria": "..."}]. Retorne APENAS o array JSON.`;
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                    ]
                }]
            }
        );

        const text = response.data.candidates[0].content.parts[0].text;
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return { transactions: JSON.parse(jsonMatch[0]) };
        }
        return { transactions: [] };
    } catch (error) {
        console.error('Gemini Error:', error.response?.data || error.message);
        return { transactions: [] };
    }
}

function formatTransactionsResponse(transactions) {
    let response = `👀 *Transações detectadas!*\n\n`;
    transactions.forEach(t => {
        response += `*${t.descricao}*\n`;
        response += `R$ ${t.valor.toFixed(2)} | Categoria: ${t.categoria}\n\n`;
    });
    response += `🤔 *Confirma que está correto?* (SIM/NÃO)`;
    return response;
}

async function saveTransactionToSupabase(userId, transaction) {
    try {
        const { error } = await supabase.from('transactions').insert({
            user_id: userId,
            title: transaction.descricao,
            amount: Math.abs(transaction.valor),
            type: transaction.valor > 0 ? 'income' : 'expense',
            category: transaction.categoria.toLowerCase(),
            date: new Date().toISOString() // Or use date from transaction if available
        });
        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Error saving transaction to Supabase:', e);
        return false;
    }
}

async function getUserContextForChat(userId) {
    // Dummy context for now. Implement real data fetching as in bot.js
    return {
        balance: 1000,
        transactionCount: 5,
        recentTransactions: [],
        activeBills: []
    };
}

async function callGeminiForChat(message, userContext, userSession) {
    // Dummy response for now. Implement real Gemini call as in bot.js
    return `Olá ${userSession.userName}, recebi sua mensagem: "${message}". Esta é uma resposta de chat.`;
}
