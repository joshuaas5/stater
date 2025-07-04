const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Configurar bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Configurar Supabase
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Storage temporário para transações pendentes
const pendingTransactions = new Map();
// Storage para associações de usuários
const userSessions = new Map(); // chatId -> { userId, userEmail, linkCode }

console.log('🤖 Stater Telegram Bot iniciado!' );

// Recarregar sessões ativas ao iniciar
async function reloadActiveSessions() {
    try {
        console.log('🔄 Recarregando sessões ativas...');
        
        const { data: activeUsers } = await supabase
            .from('telegram_users')
            .select('telegram_chat_id, user_id, user_email, user_name')
            .eq('is_active', true);
        
        if (activeUsers) {
            activeUsers.forEach(user => {
                userSessions.set(parseInt(user.telegram_chat_id), {
                    userId: user.user_id,
                    userEmail: user.user_email,
                    userName: user.user_name
                });
            });
            
            console.log(`✅ ${activeUsers.length} sessões recarregadas`);
        }
    } catch (error) {
        console.error('❌ Erro ao recarregar sessões:', error);
    }
}

// Carregar sessões na inicialização
reloadActiveSessions();

// Comando /start
bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const linkCode = match[1] ? match[1].trim() : null;
      // Se veio com código de vinculação do app
    if (linkCode) {
        const linkResult = await linkTelegramWithCode(chatId, linkCode);
        if (linkResult.success) {
            const welcomeMessage = `🎉 *Conectado com sucesso!*

Oi ${linkResult.userName}! 👋

✨ *Agora você pode:*
📸 Enviar foto do seu extrato
💬 Fazer perguntas sobre dinheiro
📊 Ver suas transações

🚀 *Vamos começar?*
Mande uma foto do seu extrato ou pergunte algo!`;
            
            await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
            return;
        }
    }
      const welcomeMessage = `👋 *Oi! Sou seu assistente financeiro*

Para conectar sua conta:
🔗 Acesse: ${process.env.APP_URL}
📱 Vá em Configurações > Telegram  
✨ Clique em "Conectar Agora"

Sem conexão você pode testar enviando uma foto!`;
    
    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Comando /help
bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
      let helpMessage = `🆘 *Como usar o Stater Bot:*

📷 *Enviar foto de extrato*
• Tire uma foto clara
• Mande pra mim
• Eu analiso tudo!

💬 *Fazer perguntas*
• "Como estão meus gastos?"
• "Onde mais gasto dinheiro?"
• "Dicas para economizar?"

🤖 *Comandos disponíveis:*
• /start - Iniciar ou vincular conta
• /conectar - Ver Chat ID para conexão
• /conta - Ver informações da conta
• /dashboard - Abrir app Stater
• /chat - Ativar modo conversa
• /sair - Desconectar conta
• /help - Esta ajuda

💡 *Dica: foto bem iluminada funciona melhor!*`;

    if (!userSession) {
        helpMessage += `\n\n⚠️ *Para usar tudo:*
• Use /conectar para ver seu Chat ID
• Conecte no app: Configurações > Telegram`;
    } else {
        helpMessage += `\n\n✅ *Conectado como:* ${userSession.userName}`;
    }
    
    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Comando /chat
bot.onText(/\/chat/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
      if (!userSession) {
        await bot.sendMessage(chatId, `🔗 *Para usar o chat, conecte sua conta:*

Acesse o app > Configurações > Telegram > "Conectar Agora"

📷 *Ou mande uma foto de extrato para testar!*`, { parse_mode: 'Markdown' });
        return;
    }
      await bot.sendMessage(chatId, `💬 *Chat ativado!*

Pode perguntar qualquer coisa:
• "Como estão meus gastos?"
• "Onde mais gasto?"
• "Dicas para economizar"

🚀 *Vamos conversar!*`, { parse_mode: 'Markdown' });
});

// Comando /dashboard
bot.onText(/\/dashboard/, async (msg) => {
    const dashboardMessage = `📊 *Abrir seu app Stater:*

🔗 ${process.env.APP_URL}

💰 Veja suas transações e gráficos!`;
    
    await bot.sendMessage(msg.chat.id, dashboardMessage, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[
                { text: '📱 Abrir Stater App', url: process.env.APP_URL }
            ]]
        }
    });
});

// Comando /conectar - mostra Chat ID para vinculação
bot.onText(/\/conectar/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
    
    if (userSession) {
        await bot.sendMessage(chatId, `✅ *Você já está conectado!*

👤 *Conta:* ${userSession.userName}
📧 *Email:* ${userSession.userEmail}

Use /conta para ver detalhes ou /sair para desconectar.`, { parse_mode: 'Markdown' });
        return;
    }
    
    const connectMessage = `🔗 *Para conectar sua conta Stater:*

**Seu Chat ID:** \`${chatId}\`

**Como conectar:**
1. Abra o app Stater
2. Vá em Configurações > Telegram
3. Clique em "Conectar Agora"
4. Use este Chat ID: **${chatId}**

💡 *Ou gere um código no app e use: /start CODIGO*`;
    
    await bot.sendMessage(chatId, connectMessage, { parse_mode: 'Markdown' });
});

// Comando /conta - mostra informações da conta logada
bot.onText(/\/conta/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
    
    if (!userSession) {
        await bot.sendMessage(chatId, `🔓 *Você não está conectado ainda.*

🔗 *Para conectar:*
• Use /conectar para ver seu Chat ID
• Ou acesse: ${process.env.APP_URL}
• Vá em Configurações > Telegram

📷 *Sem conexão você pode testar enviando uma foto!*`, { parse_mode: 'Markdown' });
        return;
    }
    
    try {
        // Buscar dados atualizados do usuário
        const userContext = await getUserContextForChat(userSession.userId);
        
        const accountMessage = `👤 *Sua Conta Stater:*

**Nome:** ${userSession.userName}
**Email:** ${userSession.userEmail}
**Chat ID:** \`${chatId}\`

💰 **Dados Financeiros:**
• Saldo atual: R$ ${userContext.balance.toFixed(2).replace('.', ',')}
• Transações: ${userContext.transactionCount}

🔗 **Ações:**
• /dashboard - Abrir app
• /sair - Desconectar conta`;
        
        await bot.sendMessage(chatId, accountMessage, { 
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    { text: '📱 Abrir Stater App', url: process.env.APP_URL }
                ]]
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao buscar conta:', error);
        await bot.sendMessage(chatId, `👤 *Sua Conta Stater:*

**Nome:** ${userSession.userName}
**Email:** ${userSession.userEmail}
**Chat ID:** \`${chatId}\`

✅ *Conta conectada com sucesso!*`, { parse_mode: 'Markdown' });
    }
});

// Comando /sair - desconectar usuário
bot.onText(/\/sair/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
    
    if (!userSession) {
        await bot.sendMessage(chatId, `🤔 *Você não está conectado.*

Para conectar sua conta use /conectar`, { parse_mode: 'Markdown' });
        return;
    }
    
    try {
        console.log(`🚪 Desconectando usuário ${userSession.userName} (${chatId})`);
        
        // Remover da sessão em memória
        userSessions.delete(chatId);
        
        // Marcar como inativo no banco (não remover o registro)
        await supabase
            .from('telegram_users')
            .update({ is_active: false })
            .eq('telegram_chat_id', chatId.toString());
        
        const disconnectMessage = `👋 *Desconectado com sucesso!*

Sua conta **${userSession.userName}** foi desvinculada deste chat.

🔗 *Para reconectar:*
• Use /conectar para ver seu Chat ID
• Ou gere novo código no app Stater

📷 *Você ainda pode enviar fotos para análise (modo demo).

Obrigado por usar o Stater! 💙`;
        
        await bot.sendMessage(chatId, disconnectMessage, { parse_mode: 'Markdown' });
        
    } catch (error) {
        console.error('❌ Erro ao desconectar:', error);
        
        // Mesmo com erro, remover da sessão
        userSessions.delete(chatId);
        
        await bot.sendMessage(chatId, `🚪 *Desconectado!*

Use /conectar para reconectar quando quiser.`, { parse_mode: 'Markdown' });
    }
});

// Processar imagens
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const photo = msg.photo[msg.photo.length - 1]; // Maior resolução
    
    try {
        // Mensagem de processamento
        const processingMsg = await bot.sendMessage(chatId, '🔄 *Analisando extrato...* Aguarde um momento.', { parse_mode: 'Markdown' });
        
        // Download da imagem
        const fileUrl = await bot.getFileLink(photo.file_id);
        console.log(`📷 Processando imagem: ${fileUrl}`);
        
        // Processar com Gemini IA
        const result = await processImageWithGemini(fileUrl);
        
        // Deletar mensagem de processamento
        await bot.deleteMessage(chatId, processingMsg.message_id);
        
        if (result.transactions && result.transactions.length > 0) {
            // Salvar temporariamente
            pendingTransactions.set(chatId, {
                transactions: result.transactions,
                timestamp: Date.now()
            });
            
            console.log(`💰 Encontradas ${result.transactions.length} transações para ${chatId}`);
            
            // Formatar resposta
            const response = formatTransactionsResponse(result.transactions);
            
            await bot.sendMessage(chatId, response, { 
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: [
                        [{ text: '✅ SIM' }, { text: '❌ NÃO' }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
            
        } else {
            await bot.sendMessage(chatId, '😔 *Não consegui encontrar transações neste extrato.*\n\nTente uma foto mais nítida e bem iluminada.', { parse_mode: 'Markdown' });
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar imagem:', error);
        await bot.sendMessage(chatId, '😔 *Erro ao processar imagem.* Tente novamente em alguns segundos.', { parse_mode: 'Markdown' });
    }
});

// Processar confirmações e chat
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    // Ignorar comandos e fotos
    if (!text || text.startsWith('/') || msg.photo) return;
    
    // Confirmar transações
    if (text === '✅ SIM' || text.toLowerCase() === 'sim') {
        await confirmTransactions(chatId);
        return;
    }
    
    // Cancelar transações
    else if (text === '❌ NÃO' || text.toLowerCase() === 'não' || text.toLowerCase() === 'nao') {
        pendingTransactions.delete(chatId);
        await bot.sendMessage(chatId, '❌ *Transações canceladas.*\n\n📷 Envie outra foto quando quiser!', { 
            parse_mode: 'Markdown',
            reply_markup: { remove_keyboard: true }
        });
        return;
    }
    
    // Chat com IA (se usuário vinculado)
    const userSession = userSessions.get(chatId);
    if (userSession) {
        await processChatMessage(chatId, text, userSession);
    } else {
        // Usuário não vinculado - resposta genérica
        await bot.sendMessage(chatId, `🤖 *Olá! Para conversas personalizadas, vincule sua conta Stater:*

🔗 *Vincular conta:*
1. Acesse: ${process.env.APP_URL}
2. Vá em Configurações > Telegram
3. Use o código de vinculação

📷 *Ou envie uma foto de extrato para análise automática!*

💡 Use /help para ver todos os comandos.`, { parse_mode: 'Markdown' });
    }
});

// Processar imagem com Gemini
async function processImageWithGemini(imageUrl) {
    try {
        console.log('🧠 Processando com Gemini IA...');
        
        // Download da imagem
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBase64 = Buffer.from(imageResponse.data).toString('base64');
        
        // Prompt para Gemini
        const prompt = `Analise este extrato bancário brasileiro e extraia TODAS as transações visíveis.

IMPORTANTE: Foque em extratos de bancos brasileiros (Bradesco, Itaú, Santander, Banco do Brasil, Caixa, etc.).

Para cada transação, retorne em formato JSON:
- data: "DD/MM/YYYY" 
- descricao: "Descrição limpa da transação"
- valor: número (negativo para débitos/saídas, positivo para créditos/entradas)
- categoria: "categoria estimada"

CATEGORIAS VÁLIDAS: Alimentação, Transporte, Saúde, Educação, Lazer, Compras, Contas, Renda, Transferência, Outros

EXEMPLO:
[
  {"data": "15/06/2024", "descricao": "Supermercado Pão de Açúcar", "valor": -89.50, "categoria": "Alimentação"},
  {"data": "15/06/2024", "descricao": "Salário Empresa XYZ", "valor": 2500.00, "categoria": "Renda"},
  {"data": "16/06/2024", "descricao": "PIX Transferência", "valor": -150.00, "categoria": "Transferência"}
]

Retorne APENAS o array JSON, sem explicações adicionais.`;
        
        // Chamar Gemini API
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [
                        { text: prompt },
                        {
                            inline_data: {
                                mime_type: "image/jpeg",
                                data: imageBase64
                            }
                        }
                    ]
                }]
            }
        );
        
        const result = response.data;
        const text = result.candidates[0].content.parts[0].text;
        
        console.log('🤖 Resposta Gemini:', text);
        
        // Extrair JSON da resposta
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const transactions = JSON.parse(jsonMatch[0]);
            console.log(`✅ ${transactions.length} transações extraídas`);
            return { transactions };
        }
        
        console.log('❌ Nenhuma transação encontrada no JSON');
        return { transactions: [] };
        
    } catch (error) {
        console.error('❌ Erro Gemini:', error.response?.data || error.message);
        return { transactions: [] };
    }
}

// Formatar resposta das transações
function formatTransactionsResponse(transactions) {
    let response = `💰 *Encontrei ${transactions.length} transação(ões):*\n\n`;
    
    transactions.forEach((t, index) => {
        const emoji = t.valor > 0 ? '💚' : '💸';
        const valor = Math.abs(t.valor).toFixed(2).replace('.', ',');
        
        response += `${emoji} *${t.data}* - ${t.descricao}\n`;
        response += `   R$ ${t.valor > 0 ? '+' : '-'}${valor}\n`;
        response += `   📋 ${t.categoria}\n\n`;
    });
    
    response += '✅ *Confirma essas transações?*';
    
    return response;
}

// Confirmar e salvar transações
async function confirmTransactions(chatId) {
    const pending = pendingTransactions.get(chatId);
    
    if (!pending) {
        await bot.sendMessage(chatId, '🤔 *Não encontrei transações pendentes.*\n\n📷 Envie uma foto do extrato primeiro.', { parse_mode: 'Markdown' });
        return;
    }
    
    try {
        console.log(`💾 Salvando ${pending.transactions.length} transações para ${chatId}`);
        
        // Salvar no Supabase (integrar com seu app)
        const userId = await getUserIdFromTelegram(chatId);
        
        if (userId) {
            for (const transaction of pending.transactions) {
                await saveTransactionToSupabase(userId, transaction);
            }
        } else {
            // Salvar para usuário genérico se não vinculado
            console.log('⚠️ Usuário não vinculado, salvando como demo');
        }
        
        // Limpar pendentes
        pendingTransactions.delete(chatId);
        
        const successMessage = `✅ *Perfeito! Salvei ${pending.transactions.length} transação(ões) no seu Stater!*

🔗 *Acesse seu dashboard:*
${process.env.APP_URL}/dashboard

📊 Suas transações já estão disponíveis no app!`;
        
        await bot.sendMessage(chatId, successMessage, { 
            parse_mode: 'Markdown',
            reply_markup: { 
                remove_keyboard: true,
                inline_keyboard: [[
                    { text: '📱 Abrir Stater App', url: process.env.APP_URL }
                ]]
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        await bot.sendMessage(chatId, '😔 *Erro ao salvar transações.* Tente novamente.', { parse_mode: 'Markdown' });
    }
}

// Vincular Telegram com código do app
async function linkTelegramWithCode(chatId, linkCode) {
    try {
        console.log(`🔗 Tentando vincular ${chatId} com código ${linkCode}`);
        
        // Buscar código de vinculação no Supabase
        const { data, error } = await supabase
            .from('telegram_link_codes')
            .select('user_id, user_email, user_name, expires_at')
            .eq('code', linkCode)
            .single();
        
        if (error || !data) {
            console.log('❌ Código inválido ou expirado');
            return { success: false, message: 'Código inválido ou expirado' };
        }
        
        // Verificar se não expirou
        if (new Date() > new Date(data.expires_at)) {
            return { success: false, message: 'Código expirado' };
        }
        
        // Salvar vinculação
        userSessions.set(chatId, {
            userId: data.user_id,
            userEmail: data.user_email,
            userName: data.user_name,
            linkCode: linkCode
        });
        
        // Marcar código como usado
        await supabase
            .from('telegram_link_codes')
            .update({ used_at: new Date().toISOString() })
            .eq('code', linkCode);
        
        // Salvar vinculação permanente
        await supabase
            .from('telegram_users')
            .upsert({
                telegram_chat_id: chatId.toString(),
                user_id: data.user_id,
                user_email: data.user_email,
                user_name: data.user_name,
                linked_at: new Date().toISOString()
            });
        
        console.log(`✅ Usuário ${data.user_name} vinculado com sucesso`);
        return { 
            success: true, 
            userName: data.user_name,
            userEmail: data.user_email
        };
        
    } catch (error) {
        console.error('❌ Erro ao vincular:', error);
        return { success: false, message: 'Erro interno' };
    }
}

// Processar mensagem de chat com IA
async function processChatMessage(chatId, message, userSession) {
    try {
        // Mensagem de processamento
        const processingMsg = await bot.sendMessage(chatId, '🤔 *Pensando...* Aguarde um momento.', { parse_mode: 'Markdown' });
        
        console.log(`💬 Processando chat de ${userSession.userName}: ${message}`);
        
        // Buscar dados do usuário para contexto
        const userContext = await getUserContextForChat(userSession.userId);
        
        // Chamar API do Gemini (igual ao app principal)
        const response = await callGeminiForChat(message, userContext, userSession);
        
        // Deletar mensagem de processamento
        await bot.deleteMessage(chatId, processingMsg.message_id);
        
        // Enviar resposta
        await bot.sendMessage(chatId, response, { 
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
        
    } catch (error) {
        console.error('❌ Erro no chat:', error);
        await bot.sendMessage(chatId, '😔 *Desculpe, ocorreu um erro.* Tente novamente em alguns momentos.', { parse_mode: 'Markdown' });
    }
}

// Buscar contexto do usuário para chat
async function getUserContextForChat(userId) {
    try {
        // Buscar transações recentes
        const { data: transactions } = await supabase
            .from('transactions')
            .select('title, amount, type, category, date')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(10);
        
        // Calcular saldo
        let balance = 0;
        if (transactions) {
            balance = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        }
        
        return {
            recentTransactions: transactions || [],
            balance: balance,
            transactionCount: transactions?.length || 0
        };
        
    } catch (error) {
        console.error('❌ Erro ao buscar contexto:', error);
        return { recentTransactions: [], balance: 0, transactionCount: 0 };
    }
}

// Chamar Gemini para chat (similar ao app principal)
async function callGeminiForChat(message, userContext, userSession) {
    try {
        let contextPrompt = `Você é o Stater IA, assistente financeiro pessoal do ${userSession.userName}.`;
        
        if (userContext.transactionCount > 0) {
            contextPrompt += `\n\nDados recentes do usuário:`;
            contextPrompt += `\n- Saldo atual: R$ ${userContext.balance.toFixed(2)}`;
            contextPrompt += `\n- Transações recentes (${userContext.transactionCount}):`;
            
            userContext.recentTransactions.forEach((t, i) => {
                contextPrompt += `\n  ${i+1}. ${t.title}: R$ ${t.amount.toFixed(2)} (${t.category})`;
            });
        }
        
        contextPrompt += `\n\nPergunta do usuário: ${message}`;
        contextPrompt += `\n\nResponda de forma útil, personalizada e em português brasileiro. Use emojis e seja amigável. Sempre se refira ao usuário pelo nome "${userSession.userName}" quando apropriado.`;
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: contextPrompt }]
                }]
            }
        );
        
        const aiResponse = response.data.candidates[0].content.parts[0].text;
        return aiResponse;
        
    } catch (error) {
        console.error('❌ Erro Gemini chat:', error);
        return '😔 Desculpe, não consegui processar sua pergunta no momento. Tente novamente.';
    }
}

// Buscar user ID pelo Telegram
async function getUserIdFromTelegram(chatId) {
    try {
        // Primeiro verificar sessão em memória
        const userSession = userSessions.get(chatId);
        if (userSession) {
            return userSession.userId;
        }
        
        // Buscar no banco de dados (apenas usuários ativos)
        const { data } = await supabase
            .from('telegram_users')
            .select('user_id, user_email, user_name')
            .eq('telegram_chat_id', chatId.toString())
            .eq('is_active', true)
            .single();
        
        if (data) {
            // Restaurar sessão
            userSessions.set(chatId, {
                userId: data.user_id,
                userEmail: data.user_email,
                userName: data.user_name
            });
            return data.user_id;
        }
        
        return null;
    } catch (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        return null;
    }
}

// Salvar transação no Supabase
async function saveTransactionToSupabase(userId, transaction) {
    try {
        // Converter data brasileira para ISO
        const [day, month, year] = transaction.data.split('/');
        const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        
        const transactionData = {
            user_id: userId,
            title: transaction.descricao,
            amount: transaction.valor,
            type: transaction.valor > 0 ? 'income' : 'expense',
            category: transaction.categoria,
            date: isoDate,
            source: 'telegram_bot',
            created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
            .from('transactions')
            .insert(transactionData)
            .select()
            .single();
        
        if (error) {
            console.error('❌ Erro Supabase:', error);
            return false;
        }
        
        console.log(`✅ Transação salva: ${transaction.descricao} - R$ ${transaction.valor}`);
        return true;
        
    } catch (error) {
        console.error('❌ Erro salvar transação:', error);
        return false;
    }
}

// Limpeza automática de transações pendentes (10 minutos)
setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [chatId, data] of pendingTransactions.entries()) {
        if (now - data.timestamp > 10 * 60 * 1000) { // 10 minutos
            pendingTransactions.delete(chatId);
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        console.log(`🧹 Limpando ${cleaned} transações pendentes expiradas`);
    }
}, 60000); // Check a cada minuto

// Error handling
bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
});

console.log('🚀 Bot configurado e aguardando mensagens...');
