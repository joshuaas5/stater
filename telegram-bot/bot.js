const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Configurar bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Configurar Supabase com SERVICE_ROLE para evitar problemas RLS
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

// Storage temporário para transações pendentes
const pendingTransactions = new Map();
// Storage para associações de usuários
const userSessions = new Map(); // chatId -> { userId, userEmail, linkCode }

console.log('🤖 Stater Telegram Bot iniciado!' );

// Recarregar sessões ativas ao iniciar (CORRIGIDO com tratamento de erro melhorado)
async function reloadActiveSessions() {
    try {
        console.log('🔄 [PERSISTÊNCIA] Recarregando sessões ativas...');
        
        const { data: activeUsers, error } = await supabase
            .from('telegram_users')
            .select('telegram_chat_id, user_id, user_email, user_name')
            .eq('is_active', true);
        
        if (error) {
            console.error('❌ [PERSISTÊNCIA] Erro ao buscar usuários ativos:', error);
            console.log('⚠️ [PERSISTÊNCIA] Continuando sem sessões...');
            return;
        }
        
        if (activeUsers && activeUsers.length > 0) {
            activeUsers.forEach(user => {
                const chatId = parseInt(user.telegram_chat_id);
                userSessions.set(chatId, {
                    userId: user.user_id,
                    userEmail: user.user_email,
                    userName: user.user_name
                });
                console.log(`🔗 [PERSISTÊNCIA] Sessão restaurada: ${user.user_name} (Chat: ${chatId})`);
            });
            
            console.log(`✅ [PERSISTÊNCIA] ${activeUsers.length} sessões recarregadas com sucesso`);
        } else {
            console.log('📭 [PERSISTÊNCIA] Nenhuma sessão ativa encontrada');
        }
    } catch (error) {
        console.error('❌ [PERSISTÊNCIA] Erro ao recarregar sessões:', error);
        console.log('⚠️ [PERSISTÊNCIA] Bot iniciando sem sessões persistidas...');
    }
}

// Recarregar sessões periodicamente para garantir persistência
setInterval(async () => {
    console.log('🔄 [PERSISTÊNCIA] Sincronização automática de sessões...');
    await reloadActiveSessions();
}, 10 * 60 * 1000); // A cada 10 minutos (reduzido frequência)

// Carregar sessões na inicialização
reloadActiveSessions();

// REMOVIDO: bot.on('message') que causava loop infinito

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
      const welcomeMessage = `👋 *Olá! Sou o Stater IA*

🔒 *Para usar todos os recursos, conecte sua conta:*

**Como conectar:**
1. Acesse: ${process.env.APP_URL}
2. Vá em Configurações → Bot Telegram
3. Gere um código de vinculação
4. Envie o código aqui no chat

⚠️ *Importante:* Sem conexão, não posso acessar seus dados financeiros ou fazer análises personalizadas.

💡 Use /help para ver mais comandos.`;
    
    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Comando /help
bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
      let helpMessage = `🆘 *Stater IA - Ajuda*

� **COM CONTA CONECTADA:**
📸 Análise automática de extratos bancários
💬 Chat inteligente sobre suas finanças  
📊 Consulta de transações e saldo
� Notificações de contas vencendo

⚠️ **SEM CONTA CONECTADA:**
❌ Não posso acessar seus dados financeiros
❌ Não posso fazer análises personalizadas
❌ Não tenho informações sobre suas contas

🤖 **Comandos disponíveis:**
• /start - Iniciar bot
• /conectar - Ver como conectar conta  
• /conta - Ver status da conexão
• /dashboard - Abrir app Stater
• /help - Esta ajuda

**Para conectar sua conta:**
1. Acesse: ${process.env.APP_URL}
2. Vá em Configurações → Bot Telegram
3. Gere um código de vinculação
4. Envie o código aqui`;

    if (!userSession) {
        helpMessage += `\n\n🔗 **Status:** Conta não conectada`;
    } else {
        helpMessage += `\n\n✅ **Status:** Conectado como ${userSession.userName}`;
    }
    
    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Comando /chat
bot.onText(/\/chat/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
      if (!userSession) {
        await bot.sendMessage(chatId, `� *Para usar o chat inteligente, conecte sua conta:*

**Como conectar:**
1. Acesse: ${process.env.APP_URL}
2. Vá em Configurações → Bot Telegram  
3. Gere um código de vinculação
4. Envie o código aqui

⚠️ Sem conexão, não posso acessar seus dados financeiros.`, { parse_mode: 'Markdown' });
        return;
    }
      await bot.sendMessage(chatId, `💬 *Chat inteligente ativo!*

Agora posso responder sobre suas finanças:
• "Como está meu saldo?"
• "Quais contas vencem esta semana?"
• "Onde mais gasto dinheiro?"
• "Minhas transações recentes"

🚀 *Pergunte qualquer coisa sobre suas finanças!*`, { parse_mode: 'Markdown' });
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
    
    const connectMessage = `🔗 *Como conectar sua conta Stater:*

**Método recomendado:**
1. Acesse: ${process.env.APP_URL}
2. Faça login na sua conta
3. Vá em Configurações → Bot Telegram
4. Clique em "Gerar Código de Vinculação"
5. Envie o código aqui no chat

⚠️ **Importante:** Você precisa ter uma conta criada no app antes de conectar.

💡 *Não tem conta ainda? Acesse o link acima para criar.*`;
    
    await bot.sendMessage(chatId, connectMessage, { parse_mode: 'Markdown' });
});

// Comando /conta - mostra informações da conta logada
bot.onText(/\/conta/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
    
    if (!userSession) {
        await bot.sendMessage(chatId, `� *Você não está conectado.*

**Para conectar sua conta:**
1. Acesse: ${process.env.APP_URL}
2. Faça login na sua conta  
3. Vá em Configurações → Bot Telegram
4. Gere um código de vinculação
5. Envie o código aqui

⚠️ Sem conexão, não posso acessar seus dados financeiros.`, { parse_mode: 'Markdown' });
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
        const { error: updateError } = await supabase
            .from('telegram_users')
            .update({ is_active: false })
            .eq('telegram_chat_id', chatId.toString());
        
        if (updateError) {
            console.error('⚠️ Erro ao desativar usuário no banco:', updateError);
        }
        
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
    
    console.log(`📨 [MESSAGE] Recebida de ${chatId}: "${text}"`);
    
    // Ignorar comandos e fotos
    if (!text || text.startsWith('/') || msg.photo) {
        console.log(`❌ [MESSAGE] Ignorada: texto vazio, comando ou foto`);
        return;
    }
    
    // Confirmar transações
    if (text === '✅ SIM' || text.toLowerCase() === 'sim') {
        console.log(`✅ [MESSAGE] Confirmação detectada: ${text}`);
        await confirmTransactions(chatId);
        return;
    }
    
    // Cancelar transações
    else if (text === '❌ NÃO' || text.toLowerCase() === 'não' || text.toLowerCase() === 'nao') {
        console.log(`❌ [MESSAGE] Cancelamento detectado: ${text}`);
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
        // Verificar se é um código de vinculação (formato: letras/números maiúsculos, 8-12 caracteres)
        const codePattern = /^[A-Z0-9]{8,12}$/;
        if (codePattern.test(text.trim())) {
            console.log(`🔗 Tentativa de vinculação com código: ${text.trim()}`);
            const linkResult = await linkTelegramWithCode(chatId, text.trim());
            
            if (linkResult.success) {
                const successMessage = `🎉 *Conectado com sucesso!*

Oi ${linkResult.userName}! 👋

✅ *Sua conta foi conectada ao bot.*

💬 Agora posso responder sobre suas finanças:
• "Como está meu saldo?"
• "Quais contas vencem esta semana?"  
• "Minhas transações recentes"

🚀 *Pergunte qualquer coisa!*`;
                
                await bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });
                return;
            } else {
                await bot.sendMessage(chatId, `❌ *Código inválido ou expirado*

Para gerar um novo código:
1. Acesse: ${process.env.APP_URL}
2. Vá em Configurações → Bot Telegram
3. Clique em "Gerar Código de Vinculação"
4. Envie o novo código aqui

⏰ *Códigos expiram em 10 minutos.*`, { parse_mode: 'Markdown' });
                return;
            }
        }
        
        // Usuário não vinculado - resposta clara sobre limitações
        await bot.sendMessage(chatId, `🔒 *Conta não conectada*

Para que eu possa responder sobre suas finanças, você precisa conectar sua conta:

**Como conectar:**
1. Acesse: ${process.env.APP_URL}
2. Faça login na sua conta
3. Vá em Configurações → Bot Telegram  
4. Gere um código de vinculação
5. Envie o código aqui

⚠️ **Sem conexão, não posso:**
• Acessar seus dados financeiros
• Fazer análises personalizadas  
• Responder sobre suas contas

💡 Use /help para mais informações.`, { parse_mode: 'Markdown' });
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
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

// Formatar resposta das transações - FORMATO LIMPO
function formatTransactionsResponse(transactions) {
    let response = `💰 *Encontrei ${transactions.length} transação(ões):*\n\n`;
    
    transactions.forEach((t, index) => {
        const emoji = t.valor > 0 ? '💚' : '💸';
        const valor = Math.abs(t.valor).toFixed(2).replace('.', ',');
        
        response += `${emoji} **${t.descricao}**\n`;
        response += `💵 R$ ${t.valor > 0 ? '+' : '-'}${valor}\n`;
        response += `📅 ${t.data}\n`;
        response += `� ${t.categoria}\n`;
        response += `${'─'.repeat(25)}\n\n`;
    });
    
    response += '❓ *Confirmar essas transações?*';
    
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
        console.log(`💾 [CONFIRMAÇÃO] Iniciando salvamento de ${pending.transactions.length} transações para chat ${chatId}`);
        
        // Salvar no Supabase (integrar com seu app)
        const userId = await getUserIdFromTelegram(chatId);
        console.log(`🔍 [CONFIRMAÇÃO] UserID encontrado: ${userId}`);
        
        let salvasComSucesso = 0; // 🔧 CORREÇÃO: Declarar sempre
        
        if (userId) {
            console.log(`✅ [CONFIRMAÇÃO] Usuário vinculado! Salvando ${pending.transactions.length} transações...`);
            
            for (const transaction of pending.transactions) {
                console.log(`💾 [CONFIRMAÇÃO] Salvando: ${transaction.descricao} - R$ ${transaction.valor}`);
                const sucesso = await saveTransactionToSupabase(userId, transaction);
                if (sucesso !== false) {
                    salvasComSucesso++;
                }
            }
            
            console.log(`📊 [CONFIRMAÇÃO] Total salvas: ${salvasComSucesso}/${pending.transactions.length}`);
        } else {
            // Salvar para usuário genérico se não vinculado
            console.log('⚠️ [CONFIRMAÇÃO] Usuário não vinculado, não salvando transações');
        }
        
        // Limpar pendentes
        pendingTransactions.delete(chatId);
        
        let successMessage;
        if (userId && salvasComSucesso > 0) {
            successMessage = `✅ *Perfeito! Salvei ${salvasComSucesso} transação(ões) no seu Stater!*

🔗 *Acesse seu dashboard:*
${process.env.APP_URL}/dashboard

📊 Suas transações já estão disponíveis no app!`;
        } else if (!userId) {
            successMessage = `⚠️ *Conta não vinculada!*

Para salvar transações, você precisa vincular sua conta primeiro.

🔗 *Acesse:* ${process.env.APP_URL}
🤖 Copie o código de vinculação e envie aqui!`;
        } else {
            successMessage = `❌ *Erro ao salvar transações.*

Não foi possível salvar nenhuma transação. Tente novamente.`;
        }
        
        await bot.sendMessage(chatId, successMessage, { 
            parse_mode: 'Markdown',
            reply_markup: { 
                remove_keyboard: true
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao salvar:', error);
        await bot.sendMessage(chatId, '😔 *Erro ao salvar transações.* Tente novamente.', { parse_mode: 'Markdown' });
    }
}

// Vincular Telegram com código do app (CORRIGIDO com melhor tratamento de erro)
async function linkTelegramWithCode(chatId, linkCode) {
    try {
        console.log(`🔗 Tentando vincular ${chatId} com código ${linkCode}`);
        
        // Buscar código de vinculação no Supabase
        const { data, error } = await supabase
            .from('telegram_link_codes')
            .select('user_id, user_email, user_name, expires_at')
            .eq('code', linkCode)
            .single();
        
        if (error) {
            console.error('❌ Erro ao buscar código:', error);
            if (error.code === 'PGRST116') {
                return { success: false, message: 'Código não encontrado' };
            }
            return { success: false, message: 'Erro ao validar código. Tente novamente.' };
        }
        
        if (!data) {
            console.log('❌ Código não encontrado');
            return { success: false, message: 'Código inválido' };
        }
        
        // Verificar se não expirou
        if (new Date() > new Date(data.expires_at)) {
            console.log('❌ Código expirado:', data.expires_at);
            return { success: false, message: 'Código expirado' };
        }
        
        // Salvar vinculação em memória
        userSessions.set(chatId, {
            userId: data.user_id,
            userEmail: data.user_email,
            userName: data.user_name,
            linkCode: linkCode
        });
        
        // Marcar código como usado
        const { error: updateError } = await supabase
            .from('telegram_link_codes')
            .update({ used_at: new Date().toISOString() })
            .eq('code', linkCode);
        
        if (updateError) {
            console.error('⚠️ Erro ao marcar código como usado:', updateError);
        }
        
        // Salvar vinculação permanente
        const { error: upsertError } = await supabase
            .from('telegram_users')
            .upsert({
                telegram_chat_id: chatId.toString(),
                user_id: data.user_id,
                user_email: data.user_email,
                user_name: data.user_name,
                linked_at: new Date().toISOString(),
                is_active: true
            });
        
        if (upsertError) {
            console.error('⚠️ Erro ao salvar vinculação:', upsertError);
            // Mesmo com erro na persistência, mantém sessão em memória
        }
        
        console.log(`✅ Usuário ${data.user_name} vinculado com sucesso`);
        return { 
            success: true, 
            userName: data.user_name,
            userEmail: data.user_email
        };
        
    } catch (error) {
        console.error('❌ Erro ao vincular:', error);
        return { success: false, message: 'Erro interno. Tente novamente.' };
    }
}

// Processar mensagem de chat com IA
async function processChatMessage(chatId, message, userSession) {
    try {
        console.log(`💬 Processando chat de ${userSession.userName}: ${message}`);
        
        // 🔥 DETECTAR SE É PEDIDO DE TRANSAÇÃO (nova funcionalidade)
        const isTransactionRequest = detectTransactionRequest(message);
        
        if (isTransactionRequest) {
            console.log(`💰 [TRANSAÇÃO] Detectado pedido de transação: ${message}`);
            
            // Processar transações do texto com Gemini
            const processingMsg = await bot.sendMessage(chatId, '💰 *Detectei pedido de transação...*\n🤔 Processando com IA...', { parse_mode: 'Markdown' });
            
            const transactions = await extractTransactionsFromText(message, userSession);
            
            await bot.deleteMessage(chatId, processingMsg.message_id);
            
            if (transactions && transactions.length > 0) {
                // Salvar transações pendentes
                pendingTransactions.set(chatId, {
                    transactions: transactions,
                    timestamp: Date.now()
                });
                
                // Mostrar transações encontradas e pedir confirmação
                const transactionList = formatTransactionsResponse(transactions);
                const confirmMessage = `💰 *Encontrei ${transactions.length} transação(ões):*\n\n${transactionList}\n\n❓ *Confirma que devo salvar no seu Stater?*`;
                
                await bot.sendMessage(chatId, confirmMessage, { 
                    parse_mode: 'Markdown',
                    reply_markup: {
                        keyboard: [
                            [{ text: '✅ SIM' }, { text: '❌ NÃO' }]
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                });
                return;
            } else {
                await bot.sendMessage(chatId, '🤔 *Não consegui identificar transações claras neste texto.*\n\n💡 Tente ser mais específico:\n• "Adicione gasto de 50 reais com comida"\n• "Entrada de 100 reais salário"', { parse_mode: 'Markdown' });
                return;
            }
        }
        
        // Chat normal com IA (se não é transação)
        const processingMsg = await bot.sendMessage(chatId, '🤔 *Pensando...* Aguarde um momento.', { parse_mode: 'Markdown' });
        
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

// Buscar contexto do usuário para chat (CORRIGIDO: incluir bills + tratamento de erro)
async function getUserContextForChat(userId) {
    try {
        // Buscar transações recentes
        const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('title, amount, type, category, date')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(10);
        
        if (transactionsError) {
            console.error('⚠️ Erro ao buscar transações:', transactionsError);
        }
        
        // CORREÇÃO CRÍTICA: Buscar contas a pagar (bills) também
        const { data: bills, error: billsError } = await supabase
            .from('bills')
            .select('title, amount, due_date, category, is_paid, is_recurring, total_installments, current_installment')
            .eq('user_id', userId)
            .order('due_date', { ascending: true })
            .limit(20);
        
        if (billsError) {
            console.error('⚠️ Erro ao buscar bills:', billsError);
        }
        
        // Calcular saldo das transações (CORRIGIDO: considerar tipo da transação)
        let balance = 0;
        if (transactions) {
            balance = transactions.reduce((sum, t) => {
                // Receitas são positivas, despesas são negativas
                const amount = t.type === 'income' ? Math.abs(t.amount || 0) : -Math.abs(t.amount || 0);
                return sum + amount;
            }, 0);
        }
        
        // Calcular estatísticas das bills
        const activeBills = bills?.filter(b => !b.is_paid) || [];
        const totalBillsValue = activeBills.reduce((sum, b) => sum + (b.amount || 0), 0);
        
        return {
            recentTransactions: transactions || [],
            bills: bills || [],
            activeBills: activeBills,
            balance: balance,
            transactionCount: transactions?.length || 0,
            billsCount: bills?.length || 0,
            activeBillsCount: activeBills.length,
            totalBillsValue: totalBillsValue
        };
        
    } catch (error) {
        console.error('❌ Erro ao buscar contexto:', error);
        return { 
            recentTransactions: [], 
            bills: [],
            activeBills: [],
            balance: 0, 
            transactionCount: 0,
            billsCount: 0,
            activeBillsCount: 0,
            activeBillsCount: 0,
            totalBillsValue: 0
        };
    }
}

// Chamar Gemini para chat (similar ao app principal)
async function callGeminiForChat(message, userContext, userSession) {
    try {
        let contextPrompt = `Você é o Stater IA, assistente financeiro pessoal do ${userSession.userName}.`;
        
        if (userContext.transactionCount > 0 || userContext.billsCount > 0) {
            contextPrompt += `\n\nDados recentes do usuário:`;
            
            if (userContext.transactionCount > 0) {
                contextPrompt += `\n- Saldo atual: R$ ${userContext.balance.toFixed(2)}`;
                contextPrompt += `\n- Transações recentes (${userContext.transactionCount}):`;
                
                userContext.recentTransactions.forEach((t, i) => {
                    contextPrompt += `\n  ${i+1}. ${t.title}: R$ ${t.amount.toFixed(2)} (${t.category})`;
                });
            }
            
            // CORREÇÃO CRÍTICA: Incluir bills/contas no contexto (igual ao Stater IA do app)
            if (userContext.billsCount > 0) {
                contextPrompt += `\n\nContas a pagar/receber (${userContext.billsCount}):`;
                
                userContext.bills.forEach((b, i) => {
                    const status = b.is_paid ? '✅ Paga' : '⏰ Pendente';
                    const installmentInfo = b.total_installments ? ` (${b.current_installment}/${b.total_installments})` : '';
                    const recurringInfo = b.is_recurring ? ' 🔄 Recorrente' : '';
                    contextPrompt += `\n  ${i+1}. ${b.title}: R$ ${b.amount.toFixed(2)} - Venc: ${new Date(b.due_date).toLocaleDateString()} - ${status}${installmentInfo}${recurringInfo}`;
                });
                
                if (userContext.activeBillsCount > 0) {
                    contextPrompt += `\n- Total contas pendentes: R$ ${userContext.totalBillsValue.toFixed(2)} (${userContext.activeBillsCount} contas)`;
                }
            }
        } else {
            contextPrompt += `\n\nO usuário ainda não possui transações ou contas registradas no sistema.`;
        }
        
        contextPrompt += `\n\nPergunta do usuário: ${message}`;
        contextPrompt += `\n\nResponda de forma útil, personalizada e em português brasileiro. Use emojis quando apropriado e seja amigável. NUNCA use asteriscos (*) ou duplos asteriscos (**) nas suas respostas. Sempre se refira ao usuário pelo nome "${userSession.userName}" quando apropriado. 

IMPORTANTE: Ao confirmar receitas ou transações, seja conciso e direto. NÃO mencione totais de receitas/despesas desnecessariamente - foque apenas na confirmação específica da ação solicitada.`;
        
        console.log('🤖 [GEMINI] Enviando prompt para API...');
        console.log('🤖 [GEMINI] API Key presente:', !!process.env.GEMINI_API_KEY);
        
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY não configurada!');
            return '😔 Erro de configuração. Contate o administrador.';
        }
        
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: contextPrompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            }
        );
        
        const aiResponse = response.data.candidates[0].content.parts[0].text;
        
        // Remover asteriscos das respostas
        const cleanResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');
        
        return cleanResponse;
        
    } catch (error) {
        console.error('❌ Erro Gemini chat:', error);
        console.error('❌ Erro detalhado:', error.response?.data || error.message);
        console.error('❌ Status do erro:', error.response?.status);
        return '😔 Desculpe, não consegui processar sua pergunta no momento. Tente novamente.';
    }
}

// Buscar user ID pelo Telegram (CORRIGIDO para persistência)
async function getUserIdFromTelegram(chatId) {
    try {
        console.log(`🔍 [PERSISTÊNCIA] Buscando usuário para chat: ${chatId}`);
        
        // Primeiro verificar sessão em memória
        const userSession = userSessions.get(chatId);
        if (userSession && userSession.userId) {
            console.log(`✅ [PERSISTÊNCIA] Encontrado na memória: ${userSession.userName}`);
            return userSession.userId;
        }
        
        console.log(`🔍 [PERSISTÊNCIA] Não encontrado na memória, buscando no banco...`);
        
        // Buscar no banco de dados (apenas usuários ativos)
        const { data, error } = await supabase
            .from('telegram_users')
            .select('user_id, user_email, user_name')
            .eq('telegram_chat_id', chatId.toString())
            .eq('is_active', true)
            .single();
        
        if (error) {
            console.log(`❌ [PERSISTÊNCIA] Erro no banco: ${error.message}`);
            return null;
        }
        
        if (data && data.user_id) {
            console.log(`✅ [PERSISTÊNCIA] Encontrado no banco: ${data.user_name}`);
            
            // Restaurar sessão na memória para futuras consultas
            userSessions.set(chatId, {
                userId: data.user_id,
                userEmail: data.user_email,
                userName: data.user_name
            });
            
            console.log(`🔗 [PERSISTÊNCIA] Sessão restaurada na memória para ${data.user_name}`);
            return data.user_id;
        }
        
        console.log(`❌ [PERSISTÊNCIA] Usuário não encontrado no banco`);
        return null;
    } catch (error) {
        console.error('❌ [PERSISTÊNCIA] Erro ao buscar usuário:', error);
        return null;
    }
}

// Salvar transação no Supabase
async function saveTransactionToSupabase(userId, transaction) {
    try {
        console.log(`💾 [SAVE] Preparando transação: ${transaction.descricao} - R$ ${transaction.valor} para usuário ${userId}`);
        
        const transactionData = {
            user_id: userId,
            title: transaction.descricao,
            amount: transaction.valor,
            type: transaction.valor > 0 ? 'income' : 'expense',
            category: transaction.categoria,
            date: new Date().toISOString(), // 🔧 CORREÇÃO: Data/hora atual completa
            created_at: new Date().toISOString()
        };
        
        console.log(`📝 [SAVE] Dados preparados:`, JSON.stringify(transactionData, null, 2));
        
        const { data, error } = await supabase
            .from('transactions')
            .insert(transactionData)
            .select()
            .single();
        
        if (error) {
            console.error('❌ [SAVE] Erro Supabase:', error);
            return false;
        }
        
        console.log(`✅ [SAVE] Transação salva com ID: ${data.id} - ${transaction.descricao} - R$ ${transaction.valor}`);
        
        // TODO: NOTIFICAR O APP SOBRE A NOVA TRANSAÇÃO (quando webhook estiver configurado)
        console.log('📢 [SYNC] Transação salva no Supabase - sincronização automática habilitada');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro salvar transação:', error);
        return false;
    }
}

// 🔥 DETECTAR SE MENSAGEM É PEDIDO DE TRANSAÇÃO
function detectTransactionRequest(message) {
    const text = message.toLowerCase();
    
    // Palavras-chave que indicam transação
    const transactionKeywords = [
        'adicione', 'adicionar', 'add', 'registre', 'registrar',
        'gasto', 'gastei', 'comprei', 'paguei', 'despesa',
        'recebi', 'entrada', 'receita', 'salário', 'ganho',
        'transferir', 'saiu', 'entrou', 'débito', 'crédito'
    ];
    
    // Padrões de valor (R$, reais, etc)
    const valuePatterns = [
        /\d+\s*(reais|real|r\$)/,
        /r\$\s*\d+/,
        /\d+[\.,]\d+\s*(reais|real)/
    ];
    
    const hasKeyword = transactionKeywords.some(keyword => text.includes(keyword));
    const hasValue = valuePatterns.some(pattern => pattern.test(text));
    
    return hasKeyword && hasValue;
}

// 🔥 EXTRAIR TRANSAÇÕES DO TEXTO COM GEMINI
async function extractTransactionsFromText(message, userSession) {
    try {
        const prompt = `Você é um extrator de transações financeiras. Analise o texto e extraia APENAS transações financeiras claras e específicas.

TEXTO DO USUÁRIO: "${message}"

REGRAS:
1. Extraia apenas transações com valor específico
2. Determine se é receita (entrada/ganho) ou despesa (gasto/saída)
3. Identifique categoria apropriada
4. Use valores positivos para receitas, negativos para despesas

FORMATO DE RESPOSTA (JSON):
[
  {
    "descricao": "descrição da transação",
    "valor": 50.00,
    "categoria": "categoria apropriada"
  }
]

CATEGORIAS VÁLIDAS: Alimentação, Transporte, Saúde, Educação, Entretenimento, Compras, Serviços, Salário, Freelance, Investimentos, Outros

Se não encontrar transações claras, retorne: []`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 1000
                }
            },
            { timeout: 10000 }
        );

        const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiResponse) {
            console.error('❌ [EXTRAÇÃO] Resposta vazia do Gemini');
            return [];
        }

        console.log(`🤖 [EXTRAÇÃO] Resposta Gemini: ${aiResponse}`);

        // Tentar extrair JSON da resposta
        const jsonMatch = aiResponse.match(/\[([\s\S]*?)\]/);
        if (!jsonMatch) {
            console.log('⚠️ [EXTRAÇÃO] Nenhum JSON encontrado na resposta');
            return [];
        }

        const transactions = JSON.parse(jsonMatch[0]);
        console.log(`✅ [EXTRAÇÃO] ${transactions.length} transações extraídas`);
        
        return transactions;

    } catch (error) {
        console.error('❌ [EXTRAÇÃO] Erro ao extrair transações:', error);
        return [];
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
