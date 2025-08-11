
const axios = require('axios');

// Use environment variables directly from Vercel
// No need to load .env in production

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

// In-memory cache for user sessions within a single request lifecycle.
const userSessions = new Map();
const TELEGRAM_API_URL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// =================================================================================
// API Helper Functions (Replaces node-telegram-bot-api)
// =================================================================================

async function sendMessage(chatId, text, options = {}) {
    try {
        const response = await axios.post(`${TELEGRAM_API_URL}/sendMessage`, {
            chat_id: chatId,
            text,
            ...options,
        });
        return response;
    } catch (error) {
        console.error('Error in sendMessage:', error.response?.data || error.message);
        throw error;
    }
}

async function deleteMessage(chatId, messageId) {
    return axios.post(`${TELEGRAM_API_URL}/deleteMessage`, {
        chat_id: chatId,
        message_id: messageId,
    });
}

async function getFileLink(fileId) {
    const response = await axios.post(`${TELEGRAM_API_URL}/getFile`, { file_id: fileId });
    const filePath = response.data.result.file_path;
    return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
}


// =================================================================================
// Vercel Serverless Function Handler
// =================================================================================

module.exports = async (req, res) => {
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: 'active', 
            message: 'Bot is running and ready for POST updates from Telegram.'
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        await handleUpdate(req.body);
        res.status(200).send('Update processed successfully');
    } catch (error) {
        console.error('Error processing Telegram update:', error.message, error.stack);
        res.status(500).send('Error processing update');
    }
};

// =================================================================================
// Update Router
// =================================================================================

async function handleUpdate(update) {
    const message = update.message || update.edited_message;
    if (!message) {
        console.log('Received a non-message update, ignoring.');
        return;
    }

    const text = message.text;
    const photo = message.photo;

    try {
        if (text) {
            if (text.startsWith('/start')) return await handleStart(message);
            if (text.startsWith('/help')) return await handleHelp(message);
            if (text.startsWith('/dashboard')) return await handleDashboard(message);
            if (text.startsWith('/conectar')) return await handleConectar(message);
            if (text.startsWith('/conta')) return await handleConta(message);
            if (text.startsWith('/sair')) return await handleSair(message);
            return await handleTextMessage(message);
        }

        if (photo) {
            return await handlePhoto(message);
        }
    } catch (error) {
        console.error('Error in handleUpdate:', error.message, error.stack);
        throw error;
    }
}

// =================================================================================
// Session Management
// =================================================================================

async function getSession(chatId) {
    if (userSessions.has(chatId)) {
        return userSessions.get(chatId);
    }
    try {
        const { data: activeUser, error } = await supabase
            .from('telegram_users')
            .select('user_id, user_email, user_name')
            .eq('telegram_chat_id', chatId.toString())
            .eq('is_active', true)
            .single();

        if (error || !activeUser) return null;

        const session = {
            userId: activeUser.user_id,
            userEmail: activeUser.user_email,
            userName: activeUser.user_name
        };
        userSessions.set(chatId, session);
        return session;
    } catch (e) {
        console.error(`Failed to load session for chat ${chatId}:`, e);
        return null;
    }
}

// =================================================================================
// Command Handlers
// =================================================================================

async function handleStart(msg) {    
    const chatId = msg.chat.id;
    const match = msg.text.match(/\/start(.*)/);
    const linkCode = match[1] ? match[1].trim() : null;

    if (linkCode) {
        const linkResult = await linkTelegramWithCode(chatId, linkCode);
        if (linkResult.success) {
            const welcomeMessage = `🎉 *Conectado com sucesso!*\n\nOi ${linkResult.userName}! 👋\n\n✨ *Agora você pode:*\n📸 Enviar foto do seu extrato\n💬 Fazer perguntas sobre dinheiro\n📊 Ver suas transações\n\n🚀 *Vamos começar?*\nMande uma foto do seu extrato ou pergunte algo!`;
            await sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
            return;
        }
    }

    const welcomeMessage = `👋 *Olá! Sou o Stater IA*\n\n🔒 *Para usar todos os recursos, conecte sua conta:*\n\n**Como conectar:**\n1. Acesse: https://stater.app\n2. Vá em Configurações → Bot Telegram\n3. Gere um código de vinculação\n4. Envie o código aqui no chat\n\n⚠️ *Importante:* Sem conexão, não posso acessar seus dados financeiros ou fazer análises personalizadas.\n\n💡 Use /help para ver mais comandos.`;
    
    try {
        await sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error sending welcome message:', error.message, error.stack);
        throw error;
    }
}

async function handleHelp(msg) {
    const chatId = msg.chat.id;
    const userSession = await getSession(chatId);
    let helpMessage = `🆘 *Stater IA - Ajuda*\n\n... (conteúdo do help) ...`;
    if (!userSession) {
        helpMessage += `\n\nSTATUS: Conta não conectada`;
    } else {
        helpMessage += `\n\nSTATUS: Conectado como ${userSession.userName}`;
    }
    await sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
}

async function handleDashboard(msg) {
    const dashboardMessage = `📊 *Abrir seu app Stater:*\n\n🔗 ${process.env.APP_URL}\n\n💰 Veja suas transações e gráficos!`;
    await sendMessage(msg.chat.id, dashboardMessage, {
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
        await sendMessage(chatId, `✅ *Você já está conectado!*\n\n👤 *Conta:* ${userSession.userName}\n📧 *Email:* ${userSession.userEmail}\n\nUse /conta para ver detalhes ou /sair para desconectar.`, { parse_mode: 'Markdown' });
        return;
    }

    const connectMessage = `🔗 *Como conectar sua conta Stater:*\n\n**Método recomendado:**\n1. Acesse: ${process.env.APP_URL}\n2. Faça login\n3. Vá em Configurações → Bot Telegram\n4. Clique em "Gerar Código"\n5. Envie o código aqui.`;
    await sendMessage(chatId, connectMessage, { parse_mode: 'Markdown' });
}

async function handleConta(msg) {
    const chatId = msg.chat.id;
    const userSession = await getSession(chatId);

    if (!userSession) {
        await sendMessage(chatId, `🚫 *Você não está conectado.*\n\nUse /conectar para saber como vincular sua conta.`, { parse_mode: 'Markdown' });
        return;
    }
    
    const userContext = await getUserContextForChat(userSession.userId);
    const accountMessage = `👤 *Sua Conta Stater:*\n\n**Nome:** ${userSession.userName}\n**Email:** ${userSession.userEmail}\n**Chat ID:** \`${chatId}\`\n\n💰 **Dados Financeiros:**\n • Saldo atual: R$ ${userContext.balance.toFixed(2)}\n • Transações: ${userContext.transactionCount}`;
    await sendMessage(chatId, accountMessage, { parse_mode: 'Markdown' });
}

async function handleSair(msg) {
    const chatId = msg.chat.id;
    const userSession = await getSession(chatId);

    if (!userSession) {
        await sendMessage(chatId, `🤔 *Você não está conectado.*`, { parse_mode: 'Markdown' });
        return;
    }

    try {
        userSessions.delete(chatId);
        await supabase.from('telegram_users').update({ is_active: false }).eq('telegram_chat_id', chatId.toString());
        await sendMessage(chatId, `👋 *Desconectado com sucesso!*\n\nSua conta **${userSession.userName}** foi desvinculada.`, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error('Error during sign out:', error);
        await sendMessage(chatId, `❌ Erro ao desconectar. Tente novamente.`, { parse_mode: 'Markdown' });
    }
}

// =================================================================================
// Message Type Handlers
// =================================================================================

async function handlePhoto(msg) {
    const chatId = msg.chat.id;
    const userSession = await getSession(chatId);

    if (!userSession) {
        await sendMessage(chatId, '🔒 Para analisar uma imagem, sua conta precisa estar conectada. Use /conectar.');
        return;
    }

    const photo = msg.photo[msg.photo.length - 1];
    const processingMsg = await sendMessage(chatId, '🧠 *Analisando extrato...* Aguarde um momento.', { parse_mode: 'Markdown' });

    try {
        const fileUrl = await getFileLink(photo.file_id);
        const result = await processImageWithGemini(fileUrl);
        await deleteMessage(chatId, processingMsg.data.result.message_id);

        if (result.transactions && result.transactions.length > 0) {
            // Save pending transactions to the database instead of in-memory
            await supabase
                .from('telegram_users')
                .update({ pending_transactions: result.transactions })
                .eq('telegram_chat_id', chatId.toString());

            const response = formatTransactionsResponse(result.transactions);
            await sendMessage(chatId, response, {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: [[{ text: '✅ SIM' }, { text: '❌ NÃO' }]],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        } else {
            await sendMessage(chatId, '😥 *Não consegui encontrar transações neste extrato.*\nTente uma foto mais nítida.', { parse_mode: 'Markdown' });
        }
    } catch (error) {
        if (processingMsg.data.result.message_id) {
            await deleteMessage(chatId, processingMsg.data.result.message_id);
        }
        console.error('Error processing image:', error);
        await sendMessage(chatId, '😥 *Erro ao processar imagem.* Tente novamente.', { parse_mode: 'Markdown' });
    }
}

async function handleTextMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;

    const lowerText = text.toLowerCase();
    if (lowerText === '✅ sim' || lowerText === 'sim' || lowerText === 'confirmar') {
        return await confirmTransactions(chatId);
    }
    if (lowerText === '❌ não' || lowerText === 'nao' || lowerText === 'não' || lowerText === 'cancelar') {
        // Clear pending transactions from the database
        await supabase
            .from('telegram_users')
            .update({ pending_transactions: null })
            .eq('telegram_chat_id', chatId.toString());
            
        await sendMessage(chatId, `OK, transações descartadas.`, { reply_markup: { remove_keyboard: true } });
        return;
    }
    
    // Handle transaction type selection
    if (lowerText === '📈 entrada' || lowerText === 'entrada') {
        return await handlePendingTransactionType(chatId, 'income');
    }
    if (lowerText === '📉 saída' || lowerText === 'saida' || lowerText === 'saída') {
        return await handlePendingTransactionType(chatId, 'expense');
    }

    if (/^\d{6}$/.test(text.trim())) {
        const linkResult = await linkTelegramWithCode(chatId, text.trim());
        if (linkResult.success) {
            await sendMessage(chatId, `🎉 *Conectado com sucesso!*\n\nOi ${linkResult.userName}! 👋`, { parse_mode: 'Markdown' });
        } else {
            await sendMessage(chatId, `❌ *Código inválido ou expirado.*\n\nGere um novo código no app.`, { parse_mode: 'Markdown' });
        }
        return;
    }

    const userSession = await getSession(chatId);
    if (userSession) {
        // Check if user wants to add a transaction
        const transactionMatch = await detectTransactionIntent(text);
        if (transactionMatch) {
            await handleQuickTransaction(chatId, transactionMatch, userSession);
        } else {
            await processChatMessage(chatId, text, userSession);
        }
    } else {
        await sendMessage(chatId, `🔒 *Conta não conectada.*\n\nPara usar o chat, preciso que conecte sua conta. Use o comando /conectar para saber como.`, { parse_mode: 'Markdown' });
    }
}

// =================================================================================
// Quick Transaction Processing
// =================================================================================

async function detectTransactionIntent(message) {
    const text = message.toLowerCase();
    
    // Patterns for adding income/expenses
    const addPatterns = [
        /adicionar?\s+(?:entrada|receita|ganho)\s+(?:de\s+)?r?\$?\s*(\d+(?:[,.]\d{2})?)/i,
        /(?:entrada|receita|ganho)\s+(?:de\s+)?r?\$?\s*(\d+(?:[,.]\d{2})?)/i,
        /adicionar?\s+r?\$?\s*(\d+(?:[,.]\d{2})?)\s+(?:entrada|receita|ganho)/i,
        /adicionar?\s+(?:saida|saída|gasto|despesa)\s+(?:de\s+)?r?\$?\s*(\d+(?:[,.]\d{2})?)/i,
        /(?:saida|saída|gasto|despesa)\s+(?:de\s+)?r?\$?\s*(\d+(?:[,.]\d{2})?)/i,
        /adicionar?\s+r?\$?\s*(\d+(?:[,.]\d{2})?)\s+(?:saida|saída|gasto|despesa)/i,
        /adicionar?\s+r?\$?\s*(\d+(?:[,.]\d{2})?)/i,
        /^r?\$?\s*(\d+(?:[,.]\d{2})?)\s+(?:entrada|receita|ganho|saida|saída|gasto|despesa)?/i
    ];
    
    for (const pattern of addPatterns) {
        const match = text.match(pattern);
        if (match) {
            const amount = parseFloat(match[1].replace(',', '.'));
            const isIncome = /entrada|receita|ganho/.test(text);
            const isExpense = /saida|saída|gasto|despesa/.test(text);
            
            // If not explicitly specified, ask user
            if (!isIncome && !isExpense) {
                return { amount, type: 'unknown' };
            }
            
            return {
                amount,
                type: isIncome ? 'income' : 'expense',
                description: extractDescription(message, match[1]) || (isIncome ? 'Entrada via bot' : 'Saída via bot')
            };
        }
    }
    
    return null;
}

function extractDescription(message, amountStr) {
    let desc = message.replace(new RegExp(amountStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), '');
    desc = desc.replace(/adicionar?|entrada|receita|ganho|saida|saída|gasto|despesa|r\$|\$|de/gi, '');
    desc = desc.trim();
    return desc.length > 3 ? desc : null;
}

async function handleQuickTransaction(chatId, transactionData, userSession) {
    if (transactionData.type === 'unknown') {
        // Ask user to specify type
        await sendMessage(chatId, `💰 *R$ ${transactionData.amount.toFixed(2)}*\n\nÉ uma entrada ou saída?`, {
            parse_mode: 'Markdown',
            reply_markup: {
                keyboard: [
                    [{ text: '📈 Entrada' }, { text: '📉 Saída' }],
                    [{ text: '❌ Cancelar' }]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            }
        });
        
        // Store pending transaction
        await supabase
            .from('telegram_users')
            .update({ 
                pending_transactions: [{
                    amount: transactionData.amount,
                    description: transactionData.description || 'Transação via bot',
                    type: 'pending_type'
                }]
            })
            .eq('telegram_chat_id', chatId.toString());
        return;
    }
    
    // Save transaction directly
    const success = await saveTransactionToSupabase(userSession.userId, {
        descricao: transactionData.description,
        valor: transactionData.type === 'income' ? transactionData.amount : -transactionData.amount,
        categoria: transactionData.type === 'income' ? 'outros' : 'diversos'
    });
    
    if (success) {
        const userContext = await getUserContextForChat(userSession.userId);
        const typeEmoji = transactionData.type === 'income' ? '📈' : '📉';
        const typeText = transactionData.type === 'income' ? 'Entrada' : 'Saída';
        
        await sendMessage(chatId, `✅ *${typeText} adicionada!*\n\n${typeEmoji} *${transactionData.description}*\nR$ ${transactionData.amount.toFixed(2)}\n\n💰 Novo saldo: *R$ ${userContext.balance.toFixed(2)}*`, {
            parse_mode: 'Markdown'
        });
    } else {
        await sendMessage(chatId, '❌ *Erro ao salvar transação.* Tente novamente.', { parse_mode: 'Markdown' });
    }
}

async function handlePendingTransactionType(chatId, type) {
    const userSession = await getSession(chatId);
    if (!userSession) {
        await sendMessage(chatId, '🔒 Você precisa estar conectado.', { reply_markup: { remove_keyboard: true } });
        return;
    }

    // Get pending transaction
    const { data: userData } = await supabase
        .from('telegram_users')
        .select('pending_transactions')
        .eq('telegram_chat_id', chatId.toString())
        .single();

    if (!userData?.pending_transactions?.[0]) {
        await sendMessage(chatId, '🤔 Nenhuma transação pendente encontrada.', { reply_markup: { remove_keyboard: true } });
        return;
    }

    const pendingTx = userData.pending_transactions[0];
    
    // Save transaction
    const success = await saveTransactionToSupabase(userSession.userId, {
        descricao: pendingTx.description,
        valor: type === 'income' ? pendingTx.amount : -pendingTx.amount,
        categoria: type === 'income' ? 'outros' : 'diversos'
    });

    if (success) {
        // Clear pending transaction
        await supabase
            .from('telegram_users')
            .update({ pending_transactions: null })
            .eq('telegram_chat_id', chatId.toString());

        const userContext = await getUserContextForChat(userSession.userId);
        const typeEmoji = type === 'income' ? '📈' : '📉';
        const typeText = type === 'income' ? 'Entrada' : 'Saída';
        
        await sendMessage(chatId, `✅ *${typeText} adicionada!*\n\n${typeEmoji} *${pendingTx.description}*\nR$ ${pendingTx.amount.toFixed(2)}\n\n💰 Novo saldo: *R$ ${userContext.balance.toFixed(2)}*`, {
            parse_mode: 'Markdown',
            reply_markup: { remove_keyboard: true }
        });
    } else {
        await sendMessage(chatId, '❌ *Erro ao salvar transação.* Tente novamente.', { 
            parse_mode: 'Markdown',
            reply_markup: { remove_keyboard: true }
        });
    }
}

// =================================================================================
// Core Logic & Helper Functions
// =================================================================================

async function processChatMessage(chatId, message, userSession) {
    const processingMsg = await sendMessage(chatId, '🤔 *Pensando...*', { parse_mode: 'Markdown' });
    try {
        const userContext = await getUserContextForChat(userSession.userId);
        const response = await callGeminiForChat(message, userContext, userSession);
        await deleteMessage(chatId, processingMsg.data.result.message_id);
        await sendMessage(chatId, response, { parse_mode: 'Markdown', disable_web_page_preview: true });
    } catch (error) {
        if (processingMsg.data.result.message_id) {
            await deleteMessage(chatId, processingMsg.data.result.message_id);
        }
        console.error('Error in chat processing:', error);
        await sendMessage(chatId, '😥 Desculpe, ocorreu um erro. Tente novamente.', { parse_mode: 'Markdown' });
    }
}

async function confirmTransactions(chatId) {
    const userSession = await getSession(chatId);
    if (!userSession) {
        await sendMessage(chatId, '🔒 Você precisa estar conectado para salvar. Use /conectar.', { reply_markup: { remove_keyboard: true } });
        return;
    }

    // Retrieve pending transactions from the database
    const { data: userData, error: fetchError } = await supabase
        .from('telegram_users')
        .select('pending_transactions')
        .eq('telegram_chat_id', chatId.toString())
        .single();

    if (fetchError || !userData || !userData.pending_transactions) {
        await sendMessage(chatId, '🤔 Nenhuma transação pendente para confirmar.', { reply_markup: { remove_keyboard: true } });
        return;
    }

    const pending = userData.pending_transactions;
    let savedCount = 0;
    for (const tx of pending) {
        const success = await saveTransactionToSupabase(userSession.userId, tx);
        if (success) savedCount++;
    }

    // Clear pending transactions from the database
    await supabase
        .from('telegram_users')
        .update({ pending_transactions: null })
        .eq('telegram_chat_id', chatId.toString());

    const userContext = await getUserContextForChat(userSession.userId);
    await sendMessage(chatId, `✅ *Transações salvas!*\n\n${savedCount} de ${pending.length} foram importadas.\n\n💰 Seu novo saldo é: *R$ ${userContext.balance.toFixed(2)}*`, {
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

        userSessions.set(chatId, { userId: data.user_id, userEmail: data.user_email, userName: data.user_name });
        return { success: true, userName: data.user_name };
    } catch (e) {
        console.error('Error linking code:', e);
        return { success: false, message: 'Erro interno' };
    }
}

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
        const type = t.valor > 0 ? 'Receita' : 'Despesa';
        response += `*${t.descricao}*\n`;
        response += `R$ ${Math.abs(t.valor).toFixed(2)} | ${t.categoria} (${type})\n\n`;
    });
    response += `🤔 *Confirma a importação?*`;
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
            date: new Date().toISOString()
        });
        if (error) throw error;
        return true;
    } catch (e) {
        console.error('Error saving transaction to Supabase:', e);
        return false;
    }
}

async function getUserContextForChat(userId) {
    try {
        const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('title, amount, type, date')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(10);
        if (transactionsError) console.error('Error fetching transactions:', transactionsError);

        const { data: bills, error: billsError } = await supabase
            .from('bills')
            .select('title, amount, due_date, is_paid')
            .eq('user_id', userId)
            .order('due_date', { ascending: true })
            .limit(20);
        if (billsError) console.error('Error fetching bills:', billsError);

        const { data: allTransactions, error: allTransactionsError } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', userId);
        if (allTransactionsError) console.error('Error fetching all transactions for balance:', allTransactionsError);

        const balance = allTransactions?.reduce((sum, t) => {
            const amount = t.type === 'income' ? Math.abs(t.amount || 0) : -Math.abs(t.amount || 0);
            return sum + amount;
        }, 0) || 0;

        const activeBills = bills?.filter(b => !b.is_paid) || [];
        const totalBillsValue = activeBills.reduce((sum, b) => sum + (b.amount || 0), 0);

        return {
            balance: balance,
            transactionCount: allTransactions?.length || 0,
            recentTransactions: transactions || [],
            activeBills: activeBills,
            totalBillsValue: totalBillsValue
        };
    } catch (error) {
        console.error('Error getting user context:', error);
        return { balance: 0, transactionCount: 0, recentTransactions: [], activeBills: [], totalBillsValue: 0 };
    }
}

async function callGeminiForChat(message, userContext, userSession) {
    try {
        const prompt = `Você é o Stater, um assistente financeiro direto e objetivo. 

CONTEXTO:
- Usuário: ${userSession.userName}
- Saldo: R$ ${userContext.balance.toFixed(2)}
- Contas pendentes: ${userContext.activeBills.length}

INSTRUÇÕES:
- Seja DIRETO e CONCISO (máximo 3 linhas)
- NÃO dê palestras ou conselhos longos
- Responda apenas o que foi perguntado
- Use emojis para deixar amigável
- Se a pergunta for sobre adicionar transação, apenas confirme se entendeu corretamente

PERGUNTA: "${message}"

Resposta:`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] }
        );

        const text = response.data.candidates[0].content.parts[0].text;
        return text.trim();
    } catch (error) {
        console.error('Error calling Gemini for chat:', error.response?.data || error.message);
        return '😥 Desculpe, não consegui processar sua pergunta no momento.';
    }
}
