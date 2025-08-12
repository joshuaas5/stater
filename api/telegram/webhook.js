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
            message: 'Bot is running and ready for POST updates from Telegram.',
            supabaseUrl: process.env.SUPABASE_URL ? 'set' : 'missing',
            serviceRole: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
            anonKeyFallback: !!(!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_ANON_KEY),
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
    const voice = message.voice;
    const audio = message.audio;
    const document = message.document;

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
        
        if (voice || audio) {
            return await handleAudio(message);
        }
        
        if (document) {
            return await handleDocument(message);
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
    // Sempre consultar o banco para garantir dados atualizados
    // (funções serverless são stateless - cache em memória não persiste)
    try {
        console.log(`Checking session for chat ${chatId}`);
        const { data: activeUser, error } = await supabase
            .from('telegram_users')
            .select('user_id, user_email, user_name')
            .eq('telegram_chat_id', chatId.toString())
            .eq('is_active', true)
            .single();

        if (error || !activeUser) {
            console.log(`No active session found for chat ${chatId}:`, error?.message || 'No data');
            return null;
        }

        console.log(`Session found for chat ${chatId}: ${activeUser.user_name}`);
        const session = {
            userId: activeUser.user_id,
            userEmail: activeUser.user_email,
            userName: activeUser.user_name
        };
        
        // Cache apenas para esta execução da função
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

    const connectMessage = `🔗 *Como conectar sua conta Stater:*\n\n**Método recomendado:**\n1. Acesse o Stater App\n2. Faça login\n3. Vá em Configurações → Bot Telegram\n4. Clique em "Gerar Código"\n5. Envie o código aqui.`;
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
        console.log('URL da imagem obtida:', fileUrl);
        
        const result = await processImageWithGemini(fileUrl);
        console.log('Resultado do processamento:', result);
        
        await deleteMessage(chatId, processingMsg.data.result.message_id);

        if (result.transactions && result.transactions.length > 0) {
            console.log('Transações encontradas:', result.transactions.length);
            
            // Salvar transações pendentes no banco
            await supabase
                .from('telegram_users')
                .update({ pending_transactions: result.transactions })
                .eq('telegram_chat_id', chatId.toString());

            const response = formatTransactionsResponse(result);
            await sendMessage(chatId, response, {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: [[{ text: '✅ Confirmar' }, { text: '❌ Cancelar' }]],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
        } else {
            console.log('Nenhuma transação encontrada na imagem');
            await sendMessage(chatId, 
                '� *Não consegui encontrar transações nesta imagem.*\n\n' +
                '💡 **Dicas para melhorar a análise:**\n' +
                '📸 Tire a foto com boa iluminação\n' +
                '📱 Certifique-se que o texto está legível\n' +
                '🔍 Foque na área das transações/movimentações\n' +
                '📄 Para faturas em PDF, envie como documento\n\n' +
                '🔄 Tente novamente com uma foto melhor!', 
                { parse_mode: 'Markdown' }
            );
        }
    } catch (error) {
        if (processingMsg.data.result.message_id) {
            await deleteMessage(chatId, processingMsg.data.result.message_id);
        }
        console.error('Erro completo ao processar imagem:', error);
        await sendMessage(chatId, 
            '😥 *Erro ao processar imagem.*\n\n' +
            '💡 **Tente:**\n' +
            '📸 Tirar uma nova foto mais nítida\n' +
            '📝 Ou digite manualmente: "50 supermercado é saída"\n' +
            '📄 Para PDFs, envie como documento', 
            { parse_mode: 'Markdown' }
        );
    }
}

async function handleAudio(msg) {
    const chatId = msg.chat.id;
    const userSession = await getSession(chatId);

    if (!userSession) {
        await sendMessage(chatId, '🔒 Para processar áudio, sua conta precisa estar conectada. Use /conectar.');
        return;
    }

    const audioFile = msg.voice || msg.audio;
    const processingMsg = await sendMessage(chatId, '🎤 *Processando áudio...* Aguarde um momento.', { parse_mode: 'Markdown' });

    try {
        // Get audio file
        const fileUrl = await getFileLink(audioFile.file_id);
        
        // For now, we'll send a message asking the user to type instead
        // In the future, you could integrate speech-to-text services like Google Speech API
        await deleteMessage(chatId, processingMsg.data.result.message_id);
        await sendMessage(chatId, '🎤 *Áudio recebido!*\n\n📝 Por enquanto, digite sua transação usando texto. Em breve adicionaremos suporte completo para áudio!\n\n💡 *Exemplo:* "entrada 100" ou "saída 50"', { parse_mode: 'Markdown' });
        
    } catch (error) {
        if (processingMsg.data.result.message_id) {
            await deleteMessage(chatId, processingMsg.data.result.message_id);
        }
        console.error('Error processing audio:', error);
        await sendMessage(chatId, '😥 *Erro ao processar áudio.* Por favor, tente digitando sua transação.', { parse_mode: 'Markdown' });
    }
}

async function handleDocument(msg) {
    const chatId = msg.chat.id;
    const userSession = await getSession(chatId);

    if (!userSession) {
        await sendMessage(chatId, '🔒 Para analisar documentos, sua conta precisa estar conectada. Use /conectar.');
        return;
    }

    const document = msg.document;
    
    // Check if it's a PDF
    if (document.mime_type === 'application/pdf' || document.file_name?.toLowerCase().endsWith('.pdf')) {
        const processingMsg = await sendMessage(chatId, '📄 *Analisando PDF...* Aguarde um momento.', { parse_mode: 'Markdown' });

        try {
            // For now, we'll ask users to convert PDF to image
            // In the future, you could integrate PDF processing services
            await deleteMessage(chatId, processingMsg.data.result.message_id);
            await sendMessage(chatId, '📄 *PDF recebido!*\n\n📸 Por enquanto, tire uma foto ou screenshot do extrato e envie como imagem. Em breve adicionaremos suporte completo para PDFs!\n\n💡 *Dica:* Fotos de extratos funcionam muito bem!', { parse_mode: 'Markdown' });
            
        } catch (error) {
            if (processingMsg.data.result.message_id) {
                await deleteMessage(chatId, processingMsg.data.result.message_id);
            }
            console.error('Error processing document:', error);
            await sendMessage(chatId, '😥 *Erro ao processar documento.* Tente enviar uma foto do extrato.', { parse_mode: 'Markdown' });
        }
    } else {
        await sendMessage(chatId, '📎 *Documento recebido!*\n\n📄 Atualmente suporto apenas PDFs de extratos e fotos. Tente enviar uma foto do seu extrato bancário.', { parse_mode: 'Markdown' });
    }
}

async function handleTextMessage(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    console.log('handleTextMessage called with:', text);

    const lowerText = text.toLowerCase().trim();
    
    // Handle confirmation responses - be very explicit about what we accept
    console.log('Checking if text is confirmation. lowerText:', `"${lowerText}"`);
    
    if (lowerText === 'sim' || lowerText === 'confirmar' || lowerText === '✅ sim' || lowerText === '✅ confirmar' || lowerText === 'confirmar' || lowerText === '✅ confirmar') {
        console.log('✅ CONFIRMATION DETECTED! Calling confirmTransactions');
        return await confirmTransactions(chatId);
    }
    
    if (lowerText === 'não' || lowerText === 'nao' || lowerText === 'cancelar' || lowerText === '❌ não' || lowerText === '❌ cancelar' || lowerText === '❌ cancelar') {
        console.log('❌ CANCELLATION DETECTED!');
        // Clear pending transactions from the database
        await supabase
            .from('telegram_users')
            .update({ pending_transactions: null })
            .eq('telegram_chat_id', chatId.toString());
            
        await sendMessage(chatId, `❌ *Cancelado!* Transação não foi adicionada.`, { 
            parse_mode: 'Markdown',
            reply_markup: { remove_keyboard: true } 
        });
        return;
    }
    
    // Handle transaction type selection
    if (lowerText === '📈 entrada' || lowerText === 'entrada') {
        console.log('Income type selected');
        return await handlePendingTransactionType(chatId, 'income');
    }
    if (lowerText === '📉 saída' || lowerText === 'saida' || lowerText === 'saída') {
        console.log('Expense type selected');
        return await handlePendingTransactionType(chatId, 'expense');
    }

    if (/^\d{6}$/.test(text.trim())) {
        console.log('6-digit code detected');
        const linkResult = await linkTelegramWithCode(chatId, text.trim());
        if (linkResult.success) {
            await sendMessage(chatId, `🎉 *Conectado com sucesso!*\n\nOi ${linkResult.userName}! 👋\n\n✨ *Agora você pode:*\n📸 Enviar foto do seu extrato\n💬 Fazer perguntas sobre dinheiro\n📊 Ver suas transações\n\n🚀 *Vamos começar?*\nMande "saldo" para ver seu saldo atual!`, { parse_mode: 'Markdown' });
        } else {
            await sendMessage(chatId, `❌ *Código inválido ou expirado.*\n\nGere um novo código no app.`, { parse_mode: 'Markdown' });
        }
        return;
    }

    const userSession = await getSession(chatId);
    if (userSession) {
        console.log('User session found for text message:', userSession.userName);
        
        // Handle direct commands first (no AI needed)
        if (lowerText.includes('saldo') || lowerText === 'saldo' || lowerText.includes('quanto tenho')) {
            console.log('Direct balance request detected');
            return await handleDirectBalanceRequest(chatId, userSession);
        }
        
        // Check if user wants to add a transaction
        const transactionMatch = await detectTransactionIntent(text);
        console.log('Transaction match result:', transactionMatch);
        
        if (transactionMatch) {
            if (transactionMatch.isConfirmation) {
                console.log('Processing transaction type confirmation');
                return await handlePendingTransactionType(chatId, transactionMatch.type);
            } else {
                console.log('Handling quick transaction');
                await handleQuickTransaction(chatId, transactionMatch, userSession);
            }
        } else {
            console.log('Processing as chat message');
            await processChatMessage(chatId, text, userSession);
        }
    } else {
        console.log('No user session found');
        await sendMessage(chatId, `🔒 *Conta não conectada.*\n\nPara usar o chat, preciso que conecte sua conta. Use o comando /conectar para saber como.`, { parse_mode: 'Markdown' });
    }
}

// =================================================================================
// Direct Command Handlers (No AI needed)
// =================================================================================

async function handleDirectBalanceRequest(chatId, userSession) {
    try {
        // RESPOSTA INSTANTÂNEA - Apenas buscar transações básicas
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', userSession.userId)
            .limit(1000); // Limitar para evitar timeout

        if (error) {
            console.error('Error fetching balance:', error);
            await sendMessage(chatId, '😥 Erro ao buscar saldo. Tente novamente.', { parse_mode: 'Markdown' });
            return;
        }

        const balance = transactions?.reduce((sum, t) => {
            const amount = t.type === 'income' ? Math.abs(t.amount || 0) : -Math.abs(t.amount || 0);
            return sum + amount;
        }, 0) || 0;

        const transactionCount = transactions?.length || 0;

        await sendMessage(chatId, `💰 *Saldo Atual*\n\nR$ ${balance.toFixed(2)}\n\n📊 ${transactionCount} transações`, { 
            parse_mode: 'Markdown' 
        });
    } catch (error) {
        console.error('Error in handleDirectBalanceRequest:', error);
        await sendMessage(chatId, '😥 Erro ao buscar saldo.', { parse_mode: 'Markdown' });
    }
}

// =================================================================================
// Quick Transaction Processing
// =================================================================================

// Handle transactions where type confirmation is needed
async function handlePendingTransactionType(chatId, confirmedType) {
    try {
        // Get pending transaction from session or temporary storage
        const { data: sessionData } = await supabase
            .from('telegram_sessions')
            .select('pending_transaction')
            .eq('chat_id', chatId)
            .single();

        if (!sessionData?.pending_transaction) {
            await sendMessage(chatId, '❌ Não encontrei nenhuma transação pendente para confirmar.');
            return;
        }

        const pendingTransaction = JSON.parse(sessionData.pending_transaction);
        console.log('Confirming transaction type:', { confirmedType, pendingTransaction });

        // Apply the confirmed type
        pendingTransaction.type = confirmedType;

        // Save the transaction
        const success = await saveTransaction(chatId, pendingTransaction);
        
        if (success) {
            // Clear pending transaction
            await supabase
                .from('telegram_sessions')
                .update({ pending_transaction: null })
                .eq('chat_id', chatId);

            const typeEmoji = confirmedType === 'income' ? '💰' : '💸';
            const typeText = confirmedType === 'income' ? 'entrada' : 'saída';
            
            await sendMessage(chatId, 
                `✅ Transação de ${typeText} confirmada!\n` +
                `${typeEmoji} R$ ${pendingTransaction.amount.toFixed(2)}\n` +
                `📝 ${pendingTransaction.description}`
            );
        } else {
            await sendMessage(chatId, '❌ Erro ao salvar a transação confirmada.');
        }

    } catch (error) {
        console.error('Error handling pending transaction:', error);
        await sendMessage(chatId, '❌ Erro interno ao processar confirmação.');
    }
}

// Handle quick transactions with detected patterns
async function handleQuickTransaction(chatId, transactionData, userSession) {
    try {
        console.log('Processing quick transaction:', transactionData);

        if (transactionData.type === 'unknown') {
            // Save as pending transaction and ask for type
            await supabase
                .from('telegram_sessions')
                .upsert({
                    chat_id: chatId,
                    pending_transaction: JSON.stringify(transactionData)
                }, {
                    onConflict: 'chat_id'
                });

            const askTypeMessage = 
                `💰 R$ ${transactionData.amount.toFixed(2)}\n` +
                `📝 ${transactionData.description}\n\n` +
                `❓ **É entrada ou saída?**`;
            
            await sendMessage(chatId, askTypeMessage, {
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: [[
                        { text: '📈 Entrada' },
                        { text: '📉 Saída' }
                    ]],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
            return;
        }

        // Process complete transaction
        const success = await saveTransaction(chatId, transactionData);
        
        if (success) {
            const typeEmoji = transactionData.type === 'income' ? '💰' : '💸';
            const typeText = transactionData.type === 'income' ? 'entrada' : 'saída';
            
            await sendMessage(chatId, 
                `✅ Transação de ${typeText} adicionada!\n` +
                `${typeEmoji} R$ ${transactionData.amount.toFixed(2)}\n` +
                `📝 ${transactionData.description}`
            );
        } else {
            await sendMessage(chatId, '❌ Erro ao salvar a transação.');
        }

    } catch (error) {
        console.error('Error in handleQuickTransaction:', error);
        await sendMessage(chatId, '❌ Erro ao processar transação.');
    }
}

// Chat message processing (for non-transaction messages)
async function processChatMessage(chatId, text, userSession) {
    try {
        console.log('Processing chat message with AI for user:', userSession.userName);
        
        // Get user context
        const userContext = await getUserContextForChat(userSession.userId);
        
        // Call AI
        const response = await processAIRequest(text, userContext);
        await sendMessage(chatId, response, { parse_mode: 'Markdown' });
        
    } catch (error) {
        console.error('Error in processChatMessage:', error);
        await sendMessage(chatId, '😥 Erro ao processar sua mensagem. Tente novamente.');
    }
}

async function detectTransactionIntent(message) {
    const originalText = message.trim();
    const text = message.toLowerCase().trim();
    console.log('Detecting transaction intent for:', originalText);
    
    let amount = null;
    let type = null;
    let description = null;
    let category = 'Não categorizado';
    
    // Quick patterns first - most common cases
    const quickPatterns = [
        // "entrada 50", "saida 100", etc
        { regex: /^entrada\s+(\d+(?:[,.]\d{1,2})?)/, type: 'income' },
        { regex: /^(?:saida|saída)\s+(\d+(?:[,.]\d{1,2})?)/, type: 'expense' },
        // "50 entrada", "100 é entrada", "70 é saída" 
        { regex: /^(\d+(?:[,.]\d{1,2})?)\s+(?:é\s+(?:uma?\s+)?)?entrada/i, type: 'income' },
        { regex: /^(\d+(?:[,.]\d{1,2})?)\s+(?:é\s+(?:uma?\s+)?)?(?:saida|saída)/i, type: 'expense' },
        // "50 reais entrada", "100 reais é saída"
        { regex: /^(\d+(?:[,.]\d{1,2})?)\s+reais?\s+(?:é\s+(?:uma?\s+)?)?entrada/i, type: 'income' },
        { regex: /^(\d+(?:[,.]\d{1,2})?)\s+reais?\s+(?:é\s+(?:uma?\s+)?)?(?:saida|saída)/i, type: 'expense' },
        // "50", "100 reais" (sem tipo especificado)
        { regex: /^(\d+(?:[,.]\d{1,2})?)\s*(?:reais?)?$/, type: 'unknown' },
        // "adicione 50", "remova 50"
        { regex: /^(?:adicione|adicionar)\s+(\d+(?:[,.]\d{1,2})?)/, type: 'income' },
        { regex: /^(?:remova|remover|retire|retirar)\s+(\d+(?:[,.]\d{1,2})?)/, type: 'expense' },
        // Padrões com descrição + tipo
        { regex: /(\d+(?:[,.]\d{1,2})?)\s+.*?(?:é\s+(?:uma?\s+)?entrada|entrada)/i, type: 'income' },
        { regex: /(\d+(?:[,.]\d{1,2})?)\s+.*?(?:é\s+(?:uma?\s+)?(?:saida|saída)|(?:saida|saída))/i, type: 'expense' }
    ];
    
    // Padrões para respostas de confirmação (quando já perguntou o tipo)
    const confirmationPatterns = [
        // "é entrada", "é uma entrada", "é saída"
        { regex: /^(?:é\s+(?:uma?\s+)?entrada|entrada)$/i, type: 'income' },
        { regex: /^(?:é\s+(?:uma?\s+)?(?:saida|saída)|(?:saida|saída))$/i, type: 'expense' },
        // "sim, é entrada", "não, é saída"
        { regex: /^(?:sim,?\s*)?(?:é\s+(?:uma?\s+)?entrada|entrada)$/i, type: 'income' },
        { regex: /^(?:não,?\s*)?(?:é\s+(?:uma?\s+)?(?:saida|saída)|(?:saida|saída))$/i, type: 'expense' }
    ];
    
    // Try quick patterns first
    for (const pattern of quickPatterns) {
        const match = text.match(pattern.regex);
        if (match) {
            amount = parseFloat(match[1].replace(',', '.'));
            type = pattern.type;
            break;
        }
    }
    
    // Check if it's a confirmation response (no amount, just type)
    if (amount === null) {
        for (const pattern of confirmationPatterns) {
            const match = text.match(pattern.regex);
            if (match) {
                // This is a type confirmation, not a new transaction
                return { isConfirmation: true, type: pattern.type };
            }
        }
    }
    
    // If no quick pattern, try to find amount in text
    if (amount === null) {
        const amountMatches = [
            /(\d+(?:[,.]\d{1,2})?)\s*(?:reais?|r\$)/i,
            /(?:r\$|rs)\s*(\d+(?:[,.]\d{1,2})?)/i,
            /(\d+(?:[,.]\d{1,2})?)/
        ];
        
        for (const amountPattern of amountMatches) {
            const match = text.match(amountPattern);
            if (match) {
                amount = parseFloat(match[1].replace(',', '.'));
                break;
            }
        }
    }
    
    // If no amount found, it's not a transaction
    if (amount === null || amount <= 0) {
        console.log('No valid amount found');
        return null;
    }
    
    // Determine type if not already set
    if (type === null || type === 'unknown') {
        // Enhanced keyword detection including "é entrada/saída"
        const incomeKeywords = ['recebi', 'ganhei', 'vale', 'salário', 'salario', 'bônus', 'bonus', 'renda', 'vendeu', 'vendi', 'é entrada', 'entrada'];
        const expenseKeywords = ['gastei', 'comprei', 'paguei', 'perdi', 'remova', 'remover', 'despesa', 'gasto', 'conta', 'é saída', 'é saida', 'saída', 'saida'];
        
        const hasIncomeKeyword = incomeKeywords.some(keyword => text.includes(keyword));
        const hasExpenseKeyword = expenseKeywords.some(keyword => text.includes(keyword));
        
        if (hasIncomeKeyword && !hasExpenseKeyword) {
            type = 'income';
        } else if (hasExpenseKeyword && !hasIncomeKeyword) {
            type = 'expense';
        } else {
            // Se ainda não conseguiu determinar, verificar padrões mais específicos
            if (/(?:é\s+(?:uma?\s+)?entrada|entrada)/i.test(text)) {
                type = 'income';
            } else if (/(?:é\s+(?:uma?\s+)?(?:saida|saída)|(?:saida|saída))/i.test(text)) {
                type = 'expense';
            } else {
                type = 'unknown';
            }
        }
    }
    
    // Extract description
    description = extractSmartDescription(originalText, amount.toString());
    if (!description) {
        description = type === 'income' ? 'Entrada via bot' : type === 'expense' ? 'Saída via bot' : 'Transação via bot';
    }
    
    // Simple category detection
    if (text.includes('alimentação') || text.includes('mercado') || text.includes('vale alimentação')) {
        category = 'Alimentação';
    } else if (text.includes('vale') || text.includes('salário') || text.includes('salario')) {
        category = 'Trabalho';
    } else {
        // Enhanced intelligent categorization
        category = detectSmartCategory(originalText, type);
    }
    
    const result = { amount, type, description, category };
    console.log('Transaction detected:', result);
    return result;
}

// Enhanced intelligent categorization using the same categories as the app
function detectSmartCategory(text, type) {
    const textLower = text.toLowerCase();
    
    // Categorias de Receita (Income Categories)
    const incomeCategories = {
        'Salário': ['salario', 'salário', 'salario 13', '13º', 'pagar', 'ordenado', 'vencimento', 'pagamento do trabalho'],
        'Freelance': ['freelance', 'freela', 'projeto', 'serviço independente', 'trabalho autônomo', 'consultoria'],
        'Prestação de Serviços': ['serviço', 'prestação', 'atendimento', 'manutenção'],
        'Venda de Produtos': ['venda', 'vendeu', 'vendido', 'produto', 'mercadoria'],
        'Investimentos': ['investimento', 'renda', 'rendimento', 'aplicação', 'dividendo', 'juros'],
        'Renda de Aluguel': ['aluguel recebido', 'renda aluguel', 'locação', 'inquilino'],
        'Restituição de IR': ['restituição', 'imposto renda', 'ir', 'restituição ir'],
        'FGTS': ['fgts', 'fundo garantia', 'saque fgts'],
        'Auxílios Governamentais': ['auxilio', 'auxílio', 'bolsa familia', 'auxilio brasil', 'seguro desemprego'],
        'Cashback': ['cashback', 'cash back', 'dinheiro de volta', 'estorno'],
        'Reembolsos': ['reembolso', 'devolução', 'estorno'],
        'Prêmios e Sorteios': ['premio', 'prêmio', 'sorteio', 'loteria', 'rifa'],
        'Vendas Ocasionais': ['venda', 'vendeu'],
        'Outras Receitas': ['entrada', 'receita', 'ganho', 'recebimento']
    };

    // Categorias de Despesa (Expense Categories)
    const expenseCategories = {
        // Habitação
        'Aluguel': ['aluguel', 'aluguer', 'locação', 'rent'],
        'Condomínio': ['condominio', 'condomínio', 'cond', 'taxa condominial'],
        'Luz': ['luz', 'energia', 'eletrica', 'elétrica', 'conta luz', 'energia elétrica'],
        'Água': ['agua', 'água', 'saneamento', 'conta agua', 'conta água'],
        'Gás': ['gas', 'gás', 'conta gas', 'botijão', 'gás de cozinha'],
        'Internet': ['internet', 'wifi', 'banda larga', 'fibra', 'net'],
        'TV por Assinatura': ['tv', 'televisão', 'sky', 'claro tv', 'oi tv', 'vivo tv'],
        'Telefone Fixo': ['telefone', 'fixo', 'linha telefonica'],
        
        // Transporte
        'Combustível': ['combustivel', 'combustível', 'gasolina', 'alcool', 'álcool', 'diesel', 'posto', 'gas natural'],
        'Transporte Público': ['transporte', 'onibus', 'ônibus', 'metro', 'metrô', 'trem', 'bilhete único'],
        'Uber/99/Táxi': ['uber', '99', 'taxi', 'táxi', 'corrida', 'app transporte'],
        'Estacionamento': ['estacionamento', 'parking', 'zona azul', 'vaga'],
        'Pedágio': ['pedagio', 'pedágio', 'via dutra'],
        'Seguro do Veículo': ['seguro', 'seguro auto', 'seguro carro'],
        'IPVA': ['ipva', 'imposto veiculo'],
        'Manutenção do Veículo': ['manutenção', 'manutencao', 'oficina', 'mecânico', 'peças'],
        
        // Alimentação
        'Supermercado': ['supermercado', 'mercado', 'compras', 'extra', 'carrefour', 'pão de açúcar'],
        'Restaurantes': ['restaurante', 'jantar', 'almoço', 'almoçar', 'jantar', 'comida'],
        'Lanchonetes': ['lanche', 'lanchonete', 'sanduiche', 'hamburguer'],
        'Fast Food': ['fast food', 'mcdonalds', 'burger king', 'kfc', 'subway'],
        'Delivery': ['delivery', 'ifood', 'uber eats', 'rappi', 'entrega'],
        'Padaria': ['padaria', 'pão', 'café manhã'],
        'Açougue/Peixaria': ['açougue', 'carne', 'peixe', 'frango'],
        'Feira': ['feira', 'verdura', 'legume', 'fruta'],
        'Bebidas': ['bebida', 'refrigerante', 'cerveja', 'vinho', 'agua', 'água'],
        
        // Saúde
        'Plano de Saúde': ['plano saude', 'plano saúde', 'unimed', 'amil', 'sulamerica'],
        'Consultas Médicas': ['consulta', 'medico', 'médico', 'clinica', 'clínica'],
        'Medicamentos': ['medicamento', 'remedio', 'remédio', 'farmacia', 'farmácia'],
        'Dentista': ['dentista', 'odonto', 'dental'],
        'Academia': ['academia', 'ginastica', 'ginástica', 'musculação', 'personal'],
        'Exames': ['exame', 'laboratorio', 'laboratório', 'raio x'],
        
        // Educação
        'Mensalidade Escolar': ['escola', 'mensalidade', 'colegio', 'colégio'],
        'Faculdade': ['faculdade', 'universidade', 'curso superior'],
        'Cursos Online': ['curso', 'curso online', 'udemy', 'coursera'],
        'Livros': ['livro', 'livros', 'material escolar'],
        
        // Entretenimento
        'Cinema': ['cinema', 'filme', 'ingresso'],
        'Streaming (Netflix, etc)': ['netflix', 'amazon prime', 'disney', 'spotify', 'youtube premium', 'streaming'],
        'Viagens': ['viagem', 'trip', 'turismo', 'passagem'],
        'Shows': ['show', 'concert', 'ingresso'],
        'Jogos': ['jogo', 'game', 'playstation', 'xbox', 'steam'],
        
        // Cuidados Pessoais
        'Cabeleireiro': ['cabelo', 'cabeleireiro', 'salão', 'corte'],
        'Roupas': ['roupa', 'vestuario', 'vestuário', 'camisa', 'calça', 'vestido'],
        'Calçados': ['sapato', 'tenis', 'tênis', 'sandalia', 'sandália'],
        'Cosméticos': ['cosmetico', 'cosmético', 'maquiagem', 'perfume'],
        
        // Tecnologia
        'Celular (Conta)': ['celular', 'tim', 'vivo', 'claro', 'oi', 'conta celular'],
        'Aplicativos': ['app', 'aplicativo', 'assinatura'],
        'Equipamentos Eletrônicos': ['eletrônico', 'computador', 'notebook', 'tablet'],
        
        // Financeiro
        'Cartão de Crédito': ['cartão', 'cartao', 'credito', 'crédito', 'fatura'],
        'Pagamentos de Dívidas': ['divida', 'dívida', 'parcela', 'emprestimo', 'empréstimo'],
        'Tarifa Bancária': ['tarifa', 'banco', 'taxa bancaria', 'conta corrente'],
        'Juros e Multas': ['juros', 'multa', 'atraso'],
        
        // Família e Pets
        'Pet Shop': ['pet', 'cachorro', 'gato', 'animal', 'veterinario', 'veterinário'],
        'Presentes': ['presente', 'gift', 'aniversario', 'aniversário'],
        
        // Outros patterns comuns
        'Despesas Diversas': ['gasto', 'despesa', 'compra', 'pagamento']
    };

    // Função para verificar se alguma palavra-chave está presente no texto
    const findMatchingCategory = (categories) => {
        for (const [category, keywords] of Object.entries(categories)) {
            for (const keyword of keywords) {
                if (textLower.includes(keyword)) {
                    return category;
                }
            }
        }
        return null;
    };

    // Verificar categoria baseada no tipo
    if (type === 'income') {
        const matchedCategory = findMatchingCategory(incomeCategories);
        return matchedCategory || 'Outras Receitas';
    } else if (type === 'expense') {
        const matchedCategory = findMatchingCategory(expenseCategories);
        return matchedCategory || 'Despesas Diversas';
    }

    return 'Não Categorizado';
}

function extractSmartDescription(originalText, amountStr) {
    // Remove palavras comuns e o valor para extrair a descrição
    let desc = originalText;
    
    // Remove palavras de comando e tipos
    desc = desc.replace(/^(?:adicione|adicionar|adiciona|entrada|saida|saída|gastei|recebi|ganhei|comprei|paguei|perdi|remova|remover|retire|retirar)\s*/i, '');
    
    // Remove "é entrada", "é saída", etc.
    desc = desc.replace(/\s*(?:é\s+(?:uma?\s+)?(?:entrada|saida|saída))\s*/gi, ' ');
    desc = desc.replace(/\s*(?:entrada|saida|saída)\s*/gi, ' ');
    
    // Remove valores monetários
    desc = desc.replace(/\d+(?:[,.]\d{1,2})?\s*(?:reais?|r\$|real)?/gi, '');
    desc = desc.replace(/(?:r\$|rs)\s*\d+(?:[,.]\d{1,2})?/gi, '');
    
    // Remove palavras conectoras desnecessárias
    desc = desc.replace(/\b(?:que|de|da|do|na|no|em|com|para|por|reais?)\b/gi, ' ');
    
    // Limpa espaços extras
    desc = desc.replace(/\s+/g, ' ').trim();
    
    // Se a descrição ficou muito curta ou vazia, retorna null
    if (desc.length < 3) {
        return null;
    }
    
    // Capitaliza primeira letra
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    
    return desc;
}

// Save transaction to database
async function saveTransaction(chatId, transactionData) {
    try {
        const userSession = await getSession(chatId);
        if (!userSession) {
            console.error('No user session found for transaction save');
            return false;
        }

        const transactionToSave = {
            user_id: userSession.userId,
            amount: transactionData.amount,
            description: transactionData.description || 'Transação via bot',
            type: transactionData.type,
            category: transactionData.category || 'Não categorizado',
            date: new Date().toISOString(),
            created_via: 'telegram_bot'
        };

        console.log('Saving transaction to database:', transactionToSave);

        const { data, error } = await supabase
            .from('transactions')
            .insert([transactionToSave])
            .select();

        if (error) {
            console.error('Error saving transaction:', error);
            return false;
        }

        console.log('Transaction saved successfully:', data);
        return true;

    } catch (error) {
        console.error('Error in saveTransaction:', error);
        return false;
    }
}

async function handleQuickTransaction(chatId, transactionData, userSession) {
    console.log('handleQuickTransaction called:', { chatId, transactionData, userSession: userSession.userName });
    
    if (transactionData.type === 'unknown') {
        console.log('Transaction type unknown, asking user');
        // Ask user to specify type first
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
        const pendingTx = {
            amount: transactionData.amount,
            description: transactionData.description || 'Transação via bot',
            type: 'pending_type',
            category: 'Não categorizado'
        };
        console.log('Storing pending transaction:', pendingTx);
        
        await supabase
            .from('telegram_users')
            .update({ 
                pending_transactions: [pendingTx]
            })
            .eq('telegram_chat_id', chatId.toString());
        return;
    }
    
    console.log('Transaction type specified, showing detailed confirmation modal');
    
    // ALWAYS show detailed confirmation modal
    const typeEmoji = transactionData.type === 'income' ? '📈' : '📉';
    const typeText = transactionData.type === 'income' ? 'Entrada' : 'Saída';
    const category = transactionData.category || 'Não categorizado';
    
    const confirmationMessage = `🤔 *CONFIRMAR TRANSAÇÃO?*

${typeEmoji} **Tipo:** ${typeText}
💰 **Valor:** R$ ${transactionData.amount.toFixed(2)}
📝 **Descrição:** ${transactionData.description}
🏷️ **Categoria:** ${category}

*Deseja adicionar esta transação?*`;

    await sendMessage(chatId, confirmationMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: [
                [{ text: '✅ CONFIRMAR' }, { text: '❌ CANCELAR' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    
    // Store pending transaction for confirmation
    const pendingTx = {
        amount: transactionData.amount,
        description: transactionData.description,
        type: transactionData.type,
        category: category
    };
    console.log('Storing pending transaction for confirmation:', pendingTx);
    
    await supabase
        .from('telegram_users')
        .update({ 
            pending_transactions: [pendingTx]
        })
        .eq('telegram_chat_id', chatId.toString());
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
    
    // Show detailed confirmation modal
    const typeEmoji = type === 'income' ? '📈' : '📉';
    const typeText = type === 'income' ? 'Entrada' : 'Saída';
    const category = 'Não categorizado';
    
    const confirmationMessage = `🤔 *CONFIRMAR TRANSAÇÃO?*

${typeEmoji} **Tipo:** ${typeText}
💰 **Valor:** R$ ${pendingTx.amount.toFixed(2)}
📝 **Descrição:** ${pendingTx.description}
🏷️ **Categoria:** ${category}

*Deseja adicionar esta transação?*`;

    await sendMessage(chatId, confirmationMessage, {
        parse_mode: 'Markdown',
        reply_markup: {
            keyboard: [
                [{ text: '✅ CONFIRMAR' }, { text: '❌ CANCELAR' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
    
    // Update pending transaction with the specified type and category
    await supabase
        .from('telegram_users')
        .update({ 
            pending_transactions: [{
                amount: pendingTx.amount,
                description: pendingTx.description,
                type: type,
                category: category
            }]
        })
        .eq('telegram_chat_id', chatId.toString());
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
    console.log('confirmTransactions called for chat:', chatId);
    
    // Resposta imediata para o usuário
    await sendMessage(chatId, '💾 *Salvando...*', { 
        parse_mode: 'Markdown',
        reply_markup: { remove_keyboard: true } 
    });
    
    const userSession = await getSession(chatId);
    if (!userSession) {
        console.log('No user session found');
        await sendMessage(chatId, '🔒 Você precisa estar conectado para salvar.');
        return;
    }

    console.log('User session found:', userSession.userName);

    // Retrieve pending transactions from the database
    const { data: userData, error: fetchError } = await supabase
        .from('telegram_users')
        .select('pending_transactions')
        .eq('telegram_chat_id', chatId.toString())
        .single();

    console.log('Database query result:', { userData, fetchError });

    if (fetchError || !userData || !userData.pending_transactions) {
        console.log('No pending transactions found in database');
        await sendMessage(chatId, '🤔 Nenhuma transação pendente para confirmar.');
        return;
    }

    const pending = userData.pending_transactions;
    console.log('Pending transactions:', pending);
    
    let savedCount = 0;
    
    // Handle single transaction (from text input) vs multiple transactions (from image)
    for (const tx of pending) {
        let success = false;
        
        if (tx.type === 'pending_type') {
            // This shouldn't happen, but handle it gracefully
            console.log('Skipping pending_type transaction');
            continue;
        } else if (tx.type === 'income' || tx.type === 'expense') {
            // Single transaction from text input
            console.log('Saving single transaction:', tx);
            success = await saveTransactionToSupabase(userSession.userId, {
                descricao: tx.description,
                valor: tx.type === 'income' ? tx.amount : -tx.amount,
                categoria: tx.category || (tx.type === 'income' ? 'outros' : 'diversos')
            });
        } else {
            // Multiple transactions from image (original format)
            console.log('Saving image transaction:', tx);
            success = await saveTransactionToSupabase(userSession.userId, tx);
        }
        
        console.log('Transaction save result:', success);
        if (success) savedCount++;
    }

    // Clear pending transactions from the database
    await supabase
        .from('telegram_users')
        .update({ pending_transactions: null })
        .eq('telegram_chat_id', chatId.toString());

    console.log('Saved count:', savedCount, 'Total:', pending.length);

    if (pending.length === 1 && (pending[0].type === 'income' || pending[0].type === 'expense')) {
        // Single transaction confirmation
        const tx = pending[0];
        const userContext = await getUserContextForChat(userSession.userId);
        const typeEmoji = tx.type === 'income' ? '📈' : '📉';
        const typeText = tx.type === 'income' ? 'Entrada' : 'Saída';
        
        await sendMessage(chatId, `✅ *${typeText} adicionada!*\n\n${typeEmoji} *${tx.description}*\nR$ ${tx.amount.toFixed(2)}\n\n💰 Novo saldo: *R$ ${userContext.balance.toFixed(2)}*`, {
            parse_mode: 'Markdown',
            reply_markup: { remove_keyboard: true }
        });
    } else {
        // Multiple transactions confirmation (from image)
        const userContext = await getUserContextForChat(userSession.userId);
        await sendMessage(chatId, `✅ *Transações salvas!*\n\n${savedCount} de ${pending.length} foram importadas.\n\n💰 Seu novo saldo é: *R$ ${userContext.balance.toFixed(2)}*`, {
            parse_mode: 'Markdown',
            reply_markup: { remove_keyboard: true }
        });
    }
}

async function linkTelegramWithCode(chatId, linkCode) {
    try {
        console.log(`[LINK] === DEBUG DETALHADO ===`);
        console.log(`[LINK] ChatID: ${chatId}`);
        console.log(`[LINK] Código: ${linkCode}`);
        console.log(`[LINK] Supabase URL: ${process.env.SUPABASE_URL}`);
        console.log(`[LINK] Service Role disponível: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`);
        
        const { data, error } = await supabase
            .from('telegram_link_codes')
            .select('user_id, user_email, user_name, expires_at, used_at, created_at')
            .eq('code', linkCode)
            .single();

        console.log(`[LINK] Query executada. Error:`, error);
        console.log(`[LINK] Data retornada:`, data);

        if (error) {
            console.error('[LINK] Erro detalhado:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            });
            return { success: false, message: `Erro no banco: ${error.message}` };
        }

        if (!data) {
            console.log('[LINK] Nenhum código encontrado na base.');
            // Vamos verificar se existe algum código na tabela
            const { data: allCodes, error: countError } = await supabase
                .from('telegram_link_codes')
                .select('code, user_id, expires_at, used_at')
                .limit(5);
            console.log('[LINK] Códigos existentes na tabela:', allCodes);
            return { success: false, message: 'Código não encontrado' };
        }

        const now = new Date();
        const exp = new Date(data.expires_at);
        console.log(`[LINK] Verificação de expiração:`);
        console.log(`[LINK] - Agora: ${now.toISOString()}`);
        console.log(`[LINK] - Expira: ${exp.toISOString()}`);
        console.log(`[LINK] - Usado em: ${data.used_at}`);
        console.log(`[LINK] - Criado em: ${data.created_at}`);
        
        if (data.used_at) {
            console.log('[LINK] Código já foi usado anteriormente.');
            return { success: false, message: 'Código já foi usado' };
        }
        
        if (now > exp) {
            console.log('[LINK] Código expirado.');
            return { success: false, message: 'Código expirado' };
        }

        console.log('[LINK] Código válido! Marcando como usado...');
        
        // Mark code as used
        const { error: updateError } = await supabase
            .from('telegram_link_codes')
            .update({ used_at: new Date().toISOString() })
            .eq('code', linkCode);
            
        if (updateError) {
            console.error('[LINK] Erro ao marcar código como usado:', updateError);
            return { success: false, message: 'Erro ao processar código' };
        }
        
        console.log('[LINK] Código marcado como usado com sucesso.');
        
        // Create/update telegram user record
        console.log(`Creating telegram_users record for chat ${chatId}, user ${data.user_id}`);
        const { error: upsertError } = await supabase.from('telegram_users').upsert({
            telegram_chat_id: chatId.toString(),
            user_id: data.user_id,
            user_email: data.user_email,
            user_name: data.user_name,
            linked_at: new Date().toISOString(),
            is_active: true
        }, {
            onConflict: 'telegram_chat_id'
        });

        if (upsertError) {
            console.error('Error creating telegram_users record:', upsertError);
            return { success: false, message: 'Erro ao salvar conexão' };
        }

        console.log(`Successfully created telegram_users record for chat ${chatId}`);

        // Cache para esta execução
        userSessions.set(chatId, { userId: data.user_id, userEmail: data.user_email, userName: data.user_name });
        return { success: true, userName: data.user_name };
    } catch (e) {
        console.error('Error linking code:', e);
        return { success: false, message: 'Erro interno' };
    }
}

async function processImageWithGemini(imageUrl) {
    try {
        console.log('Processando imagem com Gemini melhorado:', imageUrl);
        
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBase64 = Buffer.from(imageResponse.data).toString('base64');
        
        // Prompt ultra especializado para extratos brasileiros
        const prompt = `
VOCÊ É UM ESPECIALISTA OCR EM DOCUMENTOS FINANCEIROS BRASILEIROS COM FOCO ABSOLUTO EM EXTRAIR TRANSAÇÕES.

🎯 OBJETIVO: ENCONTRAR **TODAS** AS TRANSAÇÕES na imagem de extrato/fatura.

🔍 ESTRATÉGIAS DE ANÁLISE:
1. 📖 EXAMINE toda a imagem cuidadosamente  
2. 🔎 PROCURE por qualquer padrão de transação financeira
3. 💰 IDENTIFIQUE valores em R$ (Reais) 
4. 📅 ASSOCIE datas às transações
5. 🏪 CAPTURE estabelecimentos ou descrições

PROCURE ESPECIFICAMENTE POR:
- LISTA DE TRANSAÇÕES com datas e valores
- COMPRAS com nomes de estabelecimentos  
- TRANSFERÊNCIAS (PIX, TED, DOC)
- DEPÓSITOS e SAQUES
- DÉBITOS e CRÉDITOS
- MOVIMENTAÇÕES de qualquer tipo
- FATURAS de cartão de crédito

🏛️ PADRÕES COMUNS:

💜 NUBANK: "DD/MM ESTABELECIMENTO R$ VALOR"
🟢 BRADESCO: "Data | Histórico | Valor | Saldo"  
🔶 ITAÚ: "DD/MM DESCRIÇÃO VALOR"
🔵 CAIXA: "Data | Histórico | Doc | Valor"
🟡 BB: "Data | Histórico | Documento | Valor"

📱 APPS BANCÁRIOS:
- Interfaces modernas com listas de transações
- Valores podem estar em formato: R$ 1.234,56 ou 1234,56
- Procure por seções "Extrato", "Movimentação", "Histórico"

⚠️ REGRAS CRÍTICAS:
- NÃO IGNORE transações pequenas (R$ 5,00 é válido)
- EXTRAIA TUDO mesmo que pareça irrelevante  
- USE CONTEXTO para determinar entrada/saída
- SEMPRE tente extrair ao menos UMA transação

FORMATO JSON OBRIGATÓRIO:
{
  "documentType": "extrato_app" ou "fatura_cartao",
  "confidence": 0.95,
  "summary": {
    "totalAmount": [soma total],
    "totalIncome": [soma entradas], 
    "totalExpense": [soma saídas],
    "establishment": "Banco identificado",
    "period": "Período do extrato"
  },
  "transactions": [
    {
      "description": "Nome estabelecimento ou descrição",
      "amount": 127.89,
      "type": "expense",
      "category": "Supermercado", 
      "date": "2024-12-15",
      "confidence": 0.95
    }
  ]
}

CATEGORIAS (use exatamente):
RECEITAS: "Salário", "PIX Recebido", "Transferência Recebida", "Outras Receitas"
DESPESAS: "Supermercado", "Combustível", "Restaurantes", "Farmácia", "Uber/99/Táxi", "Internet", "Luz", "Cartão de Crédito", "Não Categorizado"

🚨 RETORNE APENAS JSON VÁLIDO, sem texto adicional.
💡 Esta é uma imagem real de extrato brasileiro. SEMPRE há transações para extrair!`;
        
        console.log('Enviando requisição para Gemini...');
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/jpeg", data: imageBase64 } }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1,
                    topK: 10,
                    topP: 0.8,
                    maxOutputTokens: 4096,
                }
            },
            {
                timeout: 45000 // 45 segundos de timeout
            }
        );

        const text = response.data.candidates[0].content.parts[0].text;
        console.log('Resposta do Gemini:', text);
        
        // Extrair JSON da resposta
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsedResult = JSON.parse(jsonMatch[0]);
                console.log('Transações extraídas:', parsedResult.transactions?.length || 0);
                return parsedResult;
            } catch (parseError) {
                console.error('Erro ao parsear JSON:', parseError);
                return { transactions: [] };
            }
        }
        
        console.log('Nenhum JSON válido encontrado na resposta');
        return { transactions: [] };
        
    } catch (error) {
        console.error('Erro completo no processamento:', error.response?.data || error.message);
        return { transactions: [] };
    }
}

function formatTransactionsResponse(result) {
    let response = `👀 *Transações detectadas!*\n\n`;
    
    // Mostrar resumo se disponível
    if (result.summary) {
        response += `📊 *Resumo:*\n`;
        if (result.summary.establishment) {
            response += `🏦 ${result.summary.establishment}\n`;
        }
        if (result.summary.period) {
            response += `📅 ${result.summary.period}\n`;
        }
        response += `� Total: R$ ${(result.summary.totalAmount || 0).toFixed(2)}\n\n`;
    }
    
    // Mostrar transações
    if (result.transactions && result.transactions.length > 0) {
        response += `📋 *${result.transactions.length} transação(ões):*\n\n`;
        
        result.transactions.forEach((t, index) => {
            const type = t.type === 'income' ? '📈 Entrada' : '📉 Saída';
            const amount = Math.abs(t.amount || 0);
            const description = t.description || 'Transação';
            const category = t.category || 'Não Categorizado';
            const date = t.date || 'Data não identificada';
            
            response += `*${index + 1}.* ${description}\n`;
            response += `${type} - R$ ${amount.toFixed(2)}\n`;
            response += `📂 ${category} | 📅 ${date}\n\n`;
        });
    } else {
        response += `❌ Nenhuma transação encontrada\n\n`;
    }
    
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
        // Optimized: Single query for recent transactions
        const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('title, amount, type, date')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(5); // Reduced from 10 to 5 for faster response
        if (transactionsError) console.error('Error fetching transactions:', transactionsError);

        // Optimized: Only get unpaid bills
        const { data: activeBills, error: billsError } = await supabase
            .from('bills')
            .select('title, amount')
            .eq('user_id', userId)
            .eq('is_paid', false)
            .limit(3); // Reduced from 20 to 3 for faster response
        if (billsError) console.error('Error fetching bills:', billsError);

        // Quick balance calculation using PostgreSQL SUM
        const { data: balanceResult, error: balanceError } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', userId);
        if (balanceError) console.error('Error fetching balance:', balanceError);

        const balance = balanceResult?.reduce((sum, t) => {
            const amount = t.type === 'income' ? Math.abs(t.amount || 0) : -Math.abs(t.amount || 0);
            return sum + amount;
        }, 0) || 0;

        const totalBillsValue = activeBills?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;

        return {
            balance: balance,
            transactionCount: balanceResult?.length || 0,
            recentTransactions: transactions || [],
            activeBills: activeBills || [],
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
