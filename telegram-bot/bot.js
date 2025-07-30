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

// Storage temporÃ¡rio para transaÃ§Ãµes pendentes
const pendingTransactions = new Map();
// Storage para associaÃ§Ãµes de usuÃ¡rios
const userSessions = new Map(); // chatId -> { userId, userEmail, linkCode }

console.log('ðŸ¤– Stater Telegram Bot iniciado!' );

// Recarregar sessÃµes ativas ao iniciar (CORRIGIDO com tratamento de erro melhorado)
async function reloadActiveSessions() {
    try {
        console.log('ðŸ”„ [PERSISTÃŠNCIA] Recarregando sessÃµes ativas...');
        
        const { data: activeUsers, error } = await supabase
            .from('telegram_users')
            .select('telegram_chat_id, user_id, user_email, user_name')
            .eq('is_active', true);
        
        if (error) {
            console.error('âŒ [PERSISTÃŠNCIA] Erro ao buscar usuÃ¡rios ativos:', error);
            console.log('âš ï¸ [PERSISTÃŠNCIA] Continuando sem sessÃµes...');
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
                console.log(`ðŸ”— [PERSISTÃŠNCIA] SessÃ£o restaurada: ${user.user_name} (Chat: ${chatId})`);
            });
            
            console.log(`âœ… [PERSISTÃŠNCIA] ${activeUsers.length} sessÃµes recarregadas com sucesso`);
        } else {
            console.log('ðŸ“­ [PERSISTÃŠNCIA] Nenhuma sessÃ£o ativa encontrada');
        }
    } catch (error) {
        console.error('âŒ [PERSISTÃŠNCIA] Erro ao recarregar sessÃµes:', error);
        console.log('âš ï¸ [PERSISTÃŠNCIA] Bot iniciando sem sessÃµes persistidas...');
    }
}

// Recarregar sessÃµes periodicamente para garantir persistÃªncia
setInterval(async () => {
    console.log('ðŸ”„ [PERSISTÃŠNCIA] SincronizaÃ§Ã£o automÃ¡tica de sessÃµes...');
    await reloadActiveSessions();
}, 10 * 60 * 1000); // A cada 10 minutos (reduzido frequÃªncia)

// Carregar sessÃµes na inicializaÃ§Ã£o
reloadActiveSessions();

// REMOVIDO: bot.on('message') que causava loop infinito

// Comando /start
bot.onText(/\/start(.*)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const linkCode = match[1] ? match[1].trim() : null;
      // Se veio com cÃ³digo de vinculaÃ§Ã£o do app
    if (linkCode) {
        const linkResult = await linkTelegramWithCode(chatId, linkCode);
        if (linkResult.success) {
            const welcomeMessage = `ðŸŽ‰ *Conectado com sucesso!*

Oi ${linkResult.userName}! ðŸ‘‹

âœ¨ *Agora vocÃª pode:*
ðŸ“¸ Enviar foto do seu extrato
ðŸ’¬ Fazer perguntas sobre dinheiro
ðŸ“Š Ver suas transaÃ§Ãµes

ðŸš€ *Vamos comeÃ§ar?*
Mande uma foto do seu extrato ou pergunte algo!`;
            
            await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
            return;
        }
    }
      const welcomeMessage = `ðŸ‘‹ *OlÃ¡! Sou o Stater IA*

ðŸ”’ *Para usar todos os recursos, conecte sua conta:*

**Como conectar:**
1. Acesse: ${process.env.APP_URL}
2. VÃ¡ em ConfiguraÃ§Ãµes â†’ Bot Telegram
3. Gere um cÃ³digo de vinculaÃ§Ã£o
4. Envie o cÃ³digo aqui no chat

âš ï¸ *Importante:* Sem conexÃ£o, nÃ£o posso acessar seus dados financeiros ou fazer anÃ¡lises personalizadas.

ðŸ’¡ Use /help para ver mais comandos.`;
    
    await bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Comando /help
bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
      let helpMessage = `ðŸ†˜ *Stater IA - Ajuda*

ï¿½ **COM CONTA CONECTADA:**
ðŸ“¸ AnÃ¡lise automÃ¡tica de extratos bancÃ¡rios
ðŸ’¬ Chat inteligente sobre suas finanÃ§as  
ðŸ“Š Consulta de transaÃ§Ãµes e saldo
ï¿½ NotificaÃ§Ãµes de contas vencendo

âš ï¸ **SEM CONTA CONECTADA:**
âŒ NÃ£o posso acessar seus dados financeiros
âŒ NÃ£o posso fazer anÃ¡lises personalizadas
âŒ NÃ£o tenho informaÃ§Ãµes sobre suas contas

ðŸ¤– **Comandos disponÃ­veis:**
â€¢ /start - Iniciar bot
â€¢ /conectar - Ver como conectar conta  
â€¢ /conta - Ver status da conexÃ£o
â€¢ /dashboard - Abrir app Stater
â€¢ /help - Esta ajuda

**Para conectar sua conta:**
1. Acesse: ${process.env.APP_URL}
2. VÃ¡ em ConfiguraÃ§Ãµes â†’ Bot Telegram
3. Gere um cÃ³digo de vinculaÃ§Ã£o
4. Envie o cÃ³digo aqui`;

    if (!userSession) {
        helpMessage += `\n\nðŸ”— **Status:** Conta nÃ£o conectada`;
    } else {
        helpMessage += `\n\nâœ… **Status:** Conectado como ${userSession.userName}`;
    }
    
    await bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Comando /chat
bot.onText(/\/chat/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
      if (!userSession) {
        await bot.sendMessage(chatId, `ï¿½ *Para usar o chat inteligente, conecte sua conta:*

**Como conectar:**
1. Acesse: ${process.env.APP_URL}
2. VÃ¡ em ConfiguraÃ§Ãµes â†’ Bot Telegram  
3. Gere um cÃ³digo de vinculaÃ§Ã£o
4. Envie o cÃ³digo aqui

âš ï¸ Sem conexÃ£o, nÃ£o posso acessar seus dados financeiros.`, { parse_mode: 'Markdown' });
        return;
    }
      await bot.sendMessage(chatId, `ðŸ’¬ *Chat inteligente ativo!*

Agora posso responder sobre suas finanÃ§as:
â€¢ "Como estÃ¡ meu saldo?"
â€¢ "Quais contas vencem esta semana?"
â€¢ "Onde mais gasto dinheiro?"
â€¢ "Minhas transaÃ§Ãµes recentes"

ðŸš€ *Pergunte qualquer coisa sobre suas finanÃ§as!*`, { parse_mode: 'Markdown' });
});

// Comando /dashboard
bot.onText(/\/dashboard/, async (msg) => {
    const dashboardMessage = `ðŸ“Š *Abrir seu app Stater:*

ðŸ”— ${process.env.APP_URL}

ðŸ’° Veja suas transaÃ§Ãµes e grÃ¡ficos!`;
    
    await bot.sendMessage(msg.chat.id, dashboardMessage, { 
        parse_mode: 'Markdown',
        reply_markup: {
            inline_keyboard: [[
                { text: 'ðŸ“± Abrir Stater App', url: process.env.APP_URL }
            ]]
        }
    });
});

// Comando /conectar - mostra Chat ID para vinculaÃ§Ã£o
bot.onText(/\/conectar/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
    
    if (userSession) {
        await bot.sendMessage(chatId, `âœ… *VocÃª jÃ¡ estÃ¡ conectado!*

ðŸ‘¤ *Conta:* ${userSession.userName}
ðŸ“§ *Email:* ${userSession.userEmail}

Use /conta para ver detalhes ou /sair para desconectar.`, { parse_mode: 'Markdown' });
        return;
    }
    
    const connectMessage = `ðŸ”— *Como conectar sua conta Stater:*

**MÃ©todo recomendado:**
1. Acesse: ${process.env.APP_URL}
2. FaÃ§a login na sua conta
3. VÃ¡ em ConfiguraÃ§Ãµes â†’ Bot Telegram
4. Clique em "Gerar CÃ³digo de VinculaÃ§Ã£o"
5. Envie o cÃ³digo aqui no chat

âš ï¸ **Importante:** VocÃª precisa ter uma conta criada no app antes de conectar.

ðŸ’¡ *NÃ£o tem conta ainda? Acesse o link acima para criar.*`;
    
    await bot.sendMessage(chatId, connectMessage, { parse_mode: 'Markdown' });
});

// Comando /conta - mostra informaÃ§Ãµes da conta logada
bot.onText(/\/conta/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
    
    if (!userSession) {
        await bot.sendMessage(chatId, `ï¿½ *VocÃª nÃ£o estÃ¡ conectado.*

**Para conectar sua conta:**
1. Acesse: ${process.env.APP_URL}
2. FaÃ§a login na sua conta  
3. VÃ¡ em ConfiguraÃ§Ãµes â†’ Bot Telegram
4. Gere um cÃ³digo de vinculaÃ§Ã£o
5. Envie o cÃ³digo aqui

âš ï¸ Sem conexÃ£o, nÃ£o posso acessar seus dados financeiros.`, { parse_mode: 'Markdown' });
        return;
    }
    
    try {
        // Buscar dados atualizados do usuÃ¡rio
        const userContext = await getUserContextForChat(userSession.userId);
        
        const accountMessage = `ðŸ‘¤ *Sua Conta Stater:*

**Nome:** ${userSession.userName}
**Email:** ${userSession.userEmail}
**Chat ID:** \`${chatId}\`

ðŸ’° **Dados Financeiros:**
â€¢ Saldo atual: R$ ${userContext.balance.toFixed(2).replace('.', ',')}
â€¢ TransaÃ§Ãµes: ${userContext.transactionCount}

ðŸ”— **AÃ§Ãµes:**
â€¢ /dashboard - Abrir app
â€¢ /sair - Desconectar conta`;
        
        await bot.sendMessage(chatId, accountMessage, { 
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    { text: 'ðŸ“± Abrir Stater App', url: process.env.APP_URL }
                ]]
            }
        });
        
    } catch (error) {
        console.error('âŒ Erro ao buscar conta:', error);
        await bot.sendMessage(chatId, `ðŸ‘¤ *Sua Conta Stater:*

**Nome:** ${userSession.userName}
**Email:** ${userSession.userEmail}
**Chat ID:** \`${chatId}\`

âœ… *Conta conectada com sucesso!*`, { parse_mode: 'Markdown' });
    }
});

// Comando /sair - desconectar usuÃ¡rio
bot.onText(/\/sair/, async (msg) => {
    const chatId = msg.chat.id;
    const userSession = userSessions.get(chatId);
    
    if (!userSession) {
        await bot.sendMessage(chatId, `ðŸ¤” *VocÃª nÃ£o estÃ¡ conectado.*

Para conectar sua conta use /conectar`, { parse_mode: 'Markdown' });
        return;
    }
    
    try {
        console.log(`ðŸšª Desconectando usuÃ¡rio ${userSession.userName} (${chatId})`);
        
        // Remover da sessÃ£o em memÃ³ria
        userSessions.delete(chatId);
        
        // Marcar como inativo no banco (nÃ£o remover o registro)
        const { error: updateError } = await supabase
            .from('telegram_users')
            .update({ is_active: false })
            .eq('telegram_chat_id', chatId.toString());
        
        if (updateError) {
            console.error('âš ï¸ Erro ao desativar usuÃ¡rio no banco:', updateError);
        }
        
        const disconnectMessage = `ðŸ‘‹ *Desconectado com sucesso!*

Sua conta **${userSession.userName}** foi desvinculada deste chat.

ðŸ”— *Para reconectar:*
â€¢ Use /conectar para ver seu Chat ID
â€¢ Ou gere novo cÃ³digo no app Stater

ðŸ“· *VocÃª ainda pode enviar fotos para anÃ¡lise (modo demo).

Obrigado por usar o Stater! ðŸ’™`;
        
        await bot.sendMessage(chatId, disconnectMessage, { parse_mode: 'Markdown' });
        
    } catch (error) {
        console.error('âŒ Erro ao desconectar:', error);
        
        // Mesmo com erro, remover da sessÃ£o
        userSessions.delete(chatId);
        
        await bot.sendMessage(chatId, `ðŸšª *Desconectado!*

Use /conectar para reconectar quando quiser.`, { parse_mode: 'Markdown' });
    }
});

// Processar imagens
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const photo = msg.photo[msg.photo.length - 1]; // Maior resoluÃ§Ã£o
    
    try {
        // Mensagem de processamento
        const processingMsg = await bot.sendMessage(chatId, 'ðŸ”„ *Analisando extrato...* Aguarde um momento.', { parse_mode: 'Markdown' });
        
        // Download da imagem
        const fileUrl = await bot.getFileLink(photo.file_id);
        console.log(`ðŸ“· Processando imagem: ${fileUrl}`);
        
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
            
            console.log(`ðŸ’° Encontradas ${result.transactions.length} transaÃ§Ãµes para ${chatId}`);
            
            // Formatar resposta
            const response = formatTransactionsResponse(result.transactions);
            
            await bot.sendMessage(chatId, response, { 
                parse_mode: 'Markdown',
                reply_markup: {
                    keyboard: [
                        [{ text: 'âœ… SIM' }, { text: 'âŒ NÃƒO' }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                }
            });
            
        } else {
            await bot.sendMessage(chatId, 'ðŸ˜” *NÃ£o consegui encontrar transaÃ§Ãµes neste extrato.*\n\nTente uma foto mais nÃ­tida e bem iluminada.', { parse_mode: 'Markdown' });
        }
        
    } catch (error) {
        console.error('âŒ Erro ao processar imagem:', error);
        await bot.sendMessage(chatId, 'ðŸ˜” *Erro ao processar imagem.* Tente novamente em alguns segundos.', { parse_mode: 'Markdown' });
    }
});

// Processar confirmaÃ§Ãµes e chat
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    console.log(`ðŸ“¨ [MESSAGE] Recebida de ${chatId}: "${text}"`);
    
    // Ignorar comandos e fotos
    if (!text || text.startsWith('/') || msg.photo) {
        console.log(`âŒ [MESSAGE] Ignorada: texto vazio, comando ou foto`);
        return;
    }
    
    // Confirmar transaÃ§Ãµes
    if (text === 'âœ… SIM' || text === 'âœ… CONFIRMAR' || text.toLowerCase() === 'sim' || text.toLowerCase() === 'confirmar') {
        console.log(`âœ… [MESSAGE] ConfirmaÃ§Ã£o detectada: ${text}`);
        await confirmTransactions(chatId);
        return;
    }
    
    // Cancelar transaÃ§Ãµes
    else if (text === 'âŒ NÃƒO' || text === 'âŒ CANCELAR' || text.toLowerCase() === 'nÃ£o' || text.toLowerCase() === 'nao' || text.toLowerCase() === 'cancelar') {
        console.log(`âŒ [MESSAGE] Cancelamento detectado: ${text}`);
        pendingTransactions.delete(chatId);
        await bot.sendMessage(chatId, `âŒ *TRANSAÃ‡Ã•ES CANCELADAS*

ðŸ—‘ï¸ *Todas as transaÃ§Ãµes pendentes foram descartadas.*

ðŸ’¬ *Para adicionar novas transaÃ§Ãµes, fale comigo:*
â€¢ "Adicione 50 reais de mercado"
â€¢ "Recebi 100 de salÃ¡rio"
â€¢ Ou envie uma foto de extrato

ðŸŽ¤ *Estou aqui para ajudar!*`, { 
            parse_mode: 'Markdown',
            reply_markup: { remove_keyboard: true }
        });
        return;
    }
    
    // Chat com IA (se usuÃ¡rio vinculado)
    const userSession = userSessions.get(chatId);
    if (userSession) {
        await processChatMessage(chatId, text, userSession);
    } else {
        // Verificar se é um código de vinculação (formato: 6 dígitos)
        const codePattern = /^\d{6}$/;
        if (codePattern.test(text.trim())) {
            console.log(`ðŸ”— Tentativa de vinculaÃ§Ã£o com cÃ³digo: ${text.trim()}`);
            const linkResult = await linkTelegramWithCode(chatId, text.trim());
            
            if (linkResult.success) {
                const successMessage = `ðŸŽ‰ *Conectado com sucesso!*

Oi ${linkResult.userName}! ðŸ‘‹

âœ… *Sua conta foi conectada ao bot.*

ðŸ’¬ Agora posso responder sobre suas finanÃ§as:
â€¢ "Como estÃ¡ meu saldo?"
â€¢ "Quais contas vencem esta semana?"  
â€¢ "Minhas transaÃ§Ãµes recentes"

ðŸš€ *Pergunte qualquer coisa!*`;
                
                await bot.sendMessage(chatId, successMessage, { parse_mode: 'Markdown' });
                return;
            } else {
                await bot.sendMessage(chatId, `âŒ *CÃ³digo invÃ¡lido ou expirado*

Para gerar um novo cÃ³digo:
1. Acesse: ${process.env.APP_URL}
2. VÃ¡ em ConfiguraÃ§Ãµes â†’ Bot Telegram
3. Clique em "Gerar CÃ³digo de VinculaÃ§Ã£o"
4. Envie o novo cÃ³digo aqui

â° *CÃ³digos expiram em 10 minutos.*`, { parse_mode: 'Markdown' });
                return;
            }
        }
        
        // UsuÃ¡rio nÃ£o vinculado - resposta clara sobre limitaÃ§Ãµes
        await bot.sendMessage(chatId, `ðŸ”’ *Conta nÃ£o conectada*

Para que eu possa responder sobre suas finanÃ§as, vocÃª precisa conectar sua conta:

**Como conectar:**
1. Acesse: ${process.env.APP_URL}
2. FaÃ§a login na sua conta
3. VÃ¡ em ConfiguraÃ§Ãµes â†’ Bot Telegram  
4. Gere um cÃ³digo de vinculaÃ§Ã£o
5. Envie o cÃ³digo aqui

âš ï¸ **Sem conexÃ£o, nÃ£o posso:**
â€¢ Acessar seus dados financeiros
â€¢ Fazer anÃ¡lises personalizadas  
â€¢ Responder sobre suas contas

ðŸ’¡ Use /help para mais informaÃ§Ãµes.`, { parse_mode: 'Markdown' });
    }
});

// Processar imagem com Gemini
async function processImageWithGemini(imageUrl) {
    try {
        console.log('ðŸ§  Processando com Gemini IA...');
        
        // Download da imagem
        const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const imageBase64 = Buffer.from(imageResponse.data).toString('base64');
        
        // Prompt para Gemini
        const prompt = `Analise este extrato bancÃ¡rio brasileiro e extraia TODAS as transaÃ§Ãµes visÃ­veis.

IMPORTANTE: Foque em extratos de bancos brasileiros (Bradesco, ItaÃº, Santander, Banco do Brasil, Caixa, etc.).

Para cada transaÃ§Ã£o, retorne em formato JSON:
- data: "DD/MM/YYYY" 
- descricao: "DescriÃ§Ã£o limpa da transaÃ§Ã£o"
- valor: nÃºmero (negativo para dÃ©bitos/saÃ­das, positivo para crÃ©ditos/entradas)
- categoria: "categoria estimada"

CATEGORIAS VÃLIDAS: AlimentaÃ§Ã£o, Transporte, SaÃºde, EducaÃ§Ã£o, Lazer, Compras, Contas, Renda, TransferÃªncia, Outros

EXEMPLO:
[
  {"data": "15/06/2024", "descricao": "Supermercado PÃ£o de AÃ§Ãºcar", "valor": -89.50, "categoria": "AlimentaÃ§Ã£o"},
  {"data": "15/06/2024", "descricao": "SalÃ¡rio Empresa XYZ", "valor": 2500.00, "categoria": "Renda"},
  {"data": "16/06/2024", "descricao": "PIX TransferÃªncia", "valor": -150.00, "categoria": "TransferÃªncia"}
]

Retorne APENAS o array JSON, sem explicaÃ§Ãµes adicionais.`;
        
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
        
        console.log('ðŸ¤– Resposta Gemini:', text);
        
        // Extrair JSON da resposta
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const transactions = JSON.parse(jsonMatch[0]);
            
            // Validar e corrigir categorias
            const categoriasValidas = [
                'alimentacao', 'transporte', 'saude', 'educacao', 'lazer', 
                'casa', 'vestuario', 'tecnologia', 'investimentos', 'outros',
                'salario', 'freelance', 'vendas', 'bonus', 'presente'
            ];
            
            transactions.forEach(t => {
                // Capitalizar primeira letra da descriÃ§Ã£o
                if (t.descricao) {
                    t.descricao = t.descricao.charAt(0).toUpperCase() + t.descricao.slice(1).toLowerCase();
                }
                
                // Validar categoria
                if (t.categoria) {
                    const categoriaLower = t.categoria.toLowerCase();
                    if (!categoriasValidas.includes(categoriaLower)) {
                        console.log(`âš ï¸ Categoria "${t.categoria}" nÃ£o reconhecida, usando "outros"`);
                        t.categoria = 'outros';
                    } else {
                        t.categoria = categoriaLower;
                    }
                } else {
                    t.categoria = 'outros';
                }
            });
            
            console.log(`âœ… ${transactions.length} transaÃ§Ãµes extraÃ­das e validadas`);
            return { transactions };
        }
        
        console.log('âŒ Nenhuma transaÃ§Ã£o encontrada no JSON');
        return { transactions: [] };
        
    } catch (error) {
        console.error('âŒ Erro Gemini:', error.response?.data || error.message);
        return { transactions: [] };
    }
}

// Formatar resposta das transaÃ§Ãµes - FORMATO LIMPO E BONITO
function formatTransactionsResponse(transactions) {
    let response = `ï¿½ *TransaÃ§Ã£o detectada!*\n\n`;
    
    transactions.forEach((t, index) => {
        const isIncome = t.valor > 0;
        const valor = Math.abs(t.valor).toFixed(2);
        const tipoEmoji = isIncome ? 'ðŸ“ˆ' : 'ðŸ“‰';
        const tipoTexto = isIncome ? 'RECEITA (aumenta saldo)' : 'DESPESA (diminui saldo)';
        const valorEmoji = isIncome ? 'ðŸ’°' : 'ðŸ’¸';
        
        response += `${valorEmoji} *${t.descricao}*\n`;
        response += `ï¿½ R$ ${valor} | ðŸ“‚ ${t.categoria.toLowerCase()}\n`;
        response += `ðŸ“… ${new Date().toLocaleDateString('pt-BR')}\n`;
        response += `ðŸ“Š Tipo: ${tipoEmoji} *${tipoTexto}*\n\n`;
    });
    
    response += `â“ *Confirma que estÃ¡ correto?*\n\n`;
    response += `ðŸ’¬ *Digite:*\n`;
    response += `â€¢ *SIM* ou *CONFIRMAR* - Para salvar\n`;
    response += `â€¢ *NÃƒO* ou *CANCELAR* - Para descartar\n\n`;
    response += `â° *Aguardando sua confirmaÃ§Ã£o...*`;
    
    return response;
}

// Confirmar e salvar transaÃ§Ãµes
async function confirmTransactions(chatId) {
    const pending = pendingTransactions.get(chatId);
    
    if (!pending) {
        await bot.sendMessage(chatId, 'ðŸ¤” *NÃ£o encontrei transaÃ§Ãµes pendentes.*\n\nðŸ“· Envie uma foto do extrato primeiro.', { parse_mode: 'Markdown' });
        return;
    }
    
    try {
        console.log(`ðŸ’¾ [CONFIRMAÃ‡ÃƒO] Iniciando salvamento de ${pending.transactions.length} transaÃ§Ãµes para chat ${chatId}`);
        
        // Salvar no Supabase (integrar com seu app)
        const userId = await getUserIdFromTelegram(chatId);
        console.log(`ðŸ” [CONFIRMAÃ‡ÃƒO] UserID encontrado: ${userId}`);
        
        let salvasComSucesso = 0; // ðŸ”§ CORREÃ‡ÃƒO: Declarar sempre
        
        if (userId) {
            console.log(`âœ… [CONFIRMAÃ‡ÃƒO] UsuÃ¡rio vinculado! Salvando ${pending.transactions.length} transaÃ§Ãµes...`);
            
            for (const transaction of pending.transactions) {
                console.log(`ðŸ’¾ [CONFIRMAÃ‡ÃƒO] Salvando: ${transaction.descricao} - R$ ${transaction.valor}`);
                const sucesso = await saveTransactionToSupabase(userId, transaction);
                if (sucesso !== false) {
                    salvasComSucesso++;
                }
            }
            
            console.log(`ðŸ“Š [CONFIRMAÃ‡ÃƒO] Total salvas: ${salvasComSucesso}/${pending.transactions.length}`);
        } else {
            // Salvar para usuÃ¡rio genÃ©rico se nÃ£o vinculado
            console.log('âš ï¸ [CONFIRMAÃ‡ÃƒO] UsuÃ¡rio nÃ£o vinculado, nÃ£o salvando transaÃ§Ãµes');
        }
        
        // Limpar pendentes
        pendingTransactions.delete(chatId);
        
        let successMessage;
        if (userId && salvasComSucesso > 0) {
            // Buscar saldo ATUALIZADO apÃ³s salvar as transaÃ§Ãµes
            const userContextAtualizado = await getUserContextForChat(userId);
            const saldoAtual = userContextAtualizado.balance || 0;
            
            // Contar receitas e despesas
            const receitas = pending.transactions.filter(t => t.valor > 0);
            const despesas = pending.transactions.filter(t => t.valor < 0);
            
            successMessage = `âœ… *TRANSAÃ‡Ã•ES SALVAS COM SUCESSO!*\n\n`;
            successMessage += `ðŸ’¾ *Salvas:* ${salvasComSucesso}/${pending.transactions.length}\n`;
            
            if (receitas.length > 0) {
                successMessage += `ðŸ“ˆ *Receitas:* ${receitas.length} (aumentaram o saldo)\n`;
            }
            if (despesas.length > 0) {
                successMessage += `ðŸ“‰ *Despesas:* ${despesas.length} (diminuÃ­ram o saldo)\n`;
            }
            
            successMessage += `\nðŸ’° *SEU SALDO ATUALIZADO:* R$ ${saldoAtual.toFixed(2)}\n\n`;
            successMessage += `ðŸŽ‰ *Todas as transaÃ§Ãµes foram processadas corretamente!*\n`;
            successMessage += `ðŸ“± *Abra seu app para ver o detalhamento completo!*`;
            
        } else if (!userId) {
            successMessage = `âš ï¸ *Conta nÃ£o vinculada!*

Para salvar transaÃ§Ãµes, vocÃª precisa vincular sua conta primeiro.

ðŸ”— *Acesse:* ${process.env.APP_URL}
ðŸ¤– Copie o cÃ³digo de vinculaÃ§Ã£o e envie aqui!`;
        } else {
            successMessage = `âŒ *Erro ao salvar transaÃ§Ãµes.*

NÃ£o foi possÃ­vel salvar nenhuma transaÃ§Ã£o. Tente novamente.`;
        }
        
        await bot.sendMessage(chatId, successMessage, { 
            parse_mode: 'Markdown',
            reply_markup: { 
                remove_keyboard: true
            }
        });
        
    } catch (error) {
        console.error('âŒ Erro ao salvar:', error);
        await bot.sendMessage(chatId, 'ðŸ˜” *Erro ao salvar transaÃ§Ãµes.* Tente novamente.', { parse_mode: 'Markdown' });
    }
}

// Vincular Telegram com cÃ³digo do app (CORRIGIDO com melhor tratamento de erro)
async function linkTelegramWithCode(chatId, linkCode) {
    try {
        console.log(`ðŸ”— Tentando vincular ${chatId} com cÃ³digo ${linkCode}`);
        
        // Buscar cÃ³digo de vinculaÃ§Ã£o no Supabase
        const { data, error } = await supabase
            .from('telegram_link_codes')
            .select('user_id, user_email, user_name, expires_at')
            .eq('code', linkCode)
            .single();
        
        if (error) {
            console.error('âŒ Erro ao buscar cÃ³digo:', error);
            if (error.code === 'PGRST116') {
                return { success: false, message: 'CÃ³digo nÃ£o encontrado' };
            }
            return { success: false, message: 'Erro ao validar cÃ³digo. Tente novamente.' };
        }
        
        if (!data) {
            console.log('âŒ CÃ³digo nÃ£o encontrado');
            return { success: false, message: 'CÃ³digo invÃ¡lido' };
        }
        
        // Verificar se nÃ£o expirou
        if (new Date() > new Date(data.expires_at)) {
            console.log('âŒ CÃ³digo expirado:', data.expires_at);
            return { success: false, message: 'CÃ³digo expirado' };
        }
        
        // Salvar vinculaÃ§Ã£o em memÃ³ria
        userSessions.set(chatId, {
            userId: data.user_id,
            userEmail: data.user_email,
            userName: data.user_name,
            linkCode: linkCode
        });
        
        // Marcar cÃ³digo como usado
        const { error: updateError } = await supabase
            .from('telegram_link_codes')
            .update({ used_at: new Date().toISOString() })
            .eq('code', linkCode);
        
        if (updateError) {
            console.error('âš ï¸ Erro ao marcar cÃ³digo como usado:', updateError);
        }
        
        // Salvar vinculaÃ§Ã£o permanente
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
            console.error('âš ï¸ Erro ao salvar vinculaÃ§Ã£o:', upsertError);
            // Mesmo com erro na persistÃªncia, mantÃ©m sessÃ£o em memÃ³ria
        }
        
        console.log(`âœ… UsuÃ¡rio ${data.user_name} vinculado com sucesso`);
        return { 
            success: true, 
            userName: data.user_name,
            userEmail: data.user_email
        };
        
    } catch (error) {
        console.error('âŒ Erro ao vincular:', error);
        return { success: false, message: 'Erro interno. Tente novamente.' };
    }
}

// Validar se a sessão ainda é válida no banco de dados
async function validateUserSession(chatId, userSession) {
    try {
        const { data: activeUser, error } = await supabase
            .from('telegram_users')
            .select('is_active')
            .eq('telegram_chat_id', chatId.toString())
            .eq('user_id', userSession.userId)
            .eq('is_active', true)
            .single();
        
        if (error || !activeUser) {
            console.log(`🚫 [SESSÃO] Sessão inválida para ${chatId}, removendo do cache`);
            userSessions.delete(chatId);
            
            await bot.sendMessage(chatId, `🔒 **Sessão expirada**

Sua conexão foi desativada. Para continuar:

**Como reconectar:**
1. Acesse: ${process.env.APP_URL}
2. Faça login na sua conta
3. Vá em Configurações → Bot Telegram  
4. Gere um novo código de vinculação
5. Envie o código aqui

💡 Use /help para mais informações.`, { parse_mode: 'Markdown' });
            return false;
        }
        return true;
    } catch (sessionError) {
        console.error('❌ [SESSÃO] Erro ao verificar sessão:', sessionError);
        return true; // Continuar mesmo com erro para não bloquear completamente
    }
}

// Processar mensagem de chat com IA
async function processChatMessage(chatId, message, userSession) {
    try {
        console.log(`ðŸ’¬ Processando chat de ${userSession.userName}: ${message}`);
        
        // ðŸ”¥ DETECTAR SE Ã‰ PEDIDO DE TRANSAÃ‡ÃƒO (nova funcionalidade)
        const isTransactionRequest = detectTransactionRequest(message);
        
        if (isTransactionRequest) {
            console.log(`ðŸ’° [TRANSAÃ‡ÃƒO] Detectado pedido de transaÃ§Ã£o: ${message}`);
            
            // Mostrar mensagem bonita de detecÃ§Ã£o (SEM "Ouvi" para texto)
            const detectionMsg = await bot.sendMessage(chatId, `ðŸ¤” *Processando transaÃ§Ã£o com IA...*`, { parse_mode: 'Markdown' });
            
            const transactions = await extractTransactionsFromText(message, userSession);
            
            await bot.deleteMessage(chatId, detectionMsg.message_id);
            
            if (transactions && transactions.length > 0) {
                // Salvar transaÃ§Ãµes pendentes
                pendingTransactions.set(chatId, {
                    transactions: transactions,
                    timestamp: Date.now()
                });
                
                // Mostrar transaÃ§Ãµes encontradas e pedir confirmaÃ§Ã£o
                const transactionList = formatTransactionsResponse(transactions);
                
                await bot.sendMessage(chatId, transactionList, { 
                    parse_mode: 'Markdown',
                    reply_markup: {
                        keyboard: [
                            [{ text: 'âœ… CONFIRMAR' }, { text: 'âŒ CANCELAR' }]
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                });
                return;
            } else {
                await bot.sendMessage(chatId, `âŒ *NÃ£o consegui identificar transaÃ§Ãµes claras neste texto.*

ðŸ’¡ *Tente ser mais especÃ­fico:*
â€¢ "Adicione gasto de 50 reais com comida"
â€¢ "Entrada de 100 reais salÃ¡rio"
â€¢ "Comprei patÃª por 5 reais"

ðŸŽ¤ *Fale de forma natural que eu entendo!*`, { parse_mode: 'Markdown' });
                return;
            }
        }
        
        // Chat normal com IA (se nÃ£o Ã© transaÃ§Ã£o)
        const processingMsg = await bot.sendMessage(chatId, 'ðŸ¤” *Pensando...* Aguarde um momento.', { parse_mode: 'Markdown' });
        
        // Buscar dados do usuÃ¡rio para contexto
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
        console.error('âŒ Erro no chat:', error);
        await bot.sendMessage(chatId, 'ðŸ˜” *Desculpe, ocorreu um erro.* Tente novamente em alguns momentos.', { parse_mode: 'Markdown' });
    }
}

// Buscar contexto do usuÃ¡rio para chat (CORRIGIDO: incluir bills + tratamento de erro)
async function getUserContextForChat(userId) {
    try {
        // Buscar transaÃ§Ãµes recentes
        const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('title, amount, type, category, date')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(10);
        
        if (transactionsError) {
            console.error('âš ï¸ Erro ao buscar transaÃ§Ãµes:', transactionsError);
        }
        
        // CORREÃ‡ÃƒO CRÃTICA: Buscar contas a pagar (bills) tambÃ©m
        const { data: bills, error: billsError } = await supabase
            .from('bills')
            .select('title, amount, due_date, category, is_paid, is_recurring, total_installments, current_installment')
            .eq('user_id', userId)
            .order('due_date', { ascending: true })
            .limit(20);
        
        if (billsError) {
            console.error('âš ï¸ Erro ao buscar bills:', billsError);
        }
        
        // Calcular saldo das transaÃ§Ãµes (CORRIGIDO: considerar tipo da transaÃ§Ã£o)
        let balance = 0;
        if (transactions) {
            balance = transactions.reduce((sum, t) => {
                // Receitas sÃ£o positivas, despesas sÃ£o negativas
                const amount = t.type === 'income' ? Math.abs(t.amount || 0) : -Math.abs(t.amount || 0);
                return sum + amount;
            }, 0);
        }
        
        // Calcular estatÃ­sticas das bills
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
        console.error('âŒ Erro ao buscar contexto:', error);
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
        let contextPrompt = `VocÃª Ã© o Stater IA, assistente financeiro pessoal do ${userSession.userName}.`;
        
        if (userContext.transactionCount > 0 || userContext.billsCount > 0) {
            contextPrompt += `\n\nDados recentes do usuÃ¡rio:`;
            
            if (userContext.transactionCount > 0) {
                contextPrompt += `\n- Saldo atual: R$ ${userContext.balance.toFixed(2)}`;
                contextPrompt += `\n- TransaÃ§Ãµes recentes (${userContext.transactionCount}):`;
                
                userContext.recentTransactions.forEach((t, i) => {
                    contextPrompt += `\n  ${i+1}. ${t.title}: R$ ${t.amount.toFixed(2)} (${t.category})`;
                });
            }
            
            // CORREÃ‡ÃƒO CRÃTICA: Incluir bills/contas no contexto (igual ao Stater IA do app)
            if (userContext.billsCount > 0) {
                contextPrompt += `\n\nContas a pagar/receber (${userContext.billsCount}):`;
                
                userContext.bills.forEach((b, i) => {
                    const status = b.is_paid ? 'âœ… Paga' : 'â° Pendente';
                    const installmentInfo = b.total_installments ? ` (${b.current_installment}/${b.total_installments})` : '';
                    const recurringInfo = b.is_recurring ? ' ðŸ”„ Recorrente' : '';
                    contextPrompt += `\n  ${i+1}. ${b.title}: R$ ${b.amount.toFixed(2)} - Venc: ${new Date(b.due_date).toLocaleDateString()} - ${status}${installmentInfo}${recurringInfo}`;
                });
                
                if (userContext.activeBillsCount > 0) {
                    contextPrompt += `\n- Total contas pendentes: R$ ${userContext.totalBillsValue.toFixed(2)} (${userContext.activeBillsCount} contas)`;
                }
            }
        } else {
            contextPrompt += `\n\nO usuÃ¡rio ainda nÃ£o possui transaÃ§Ãµes ou contas registradas no sistema.`;
        }
        
        contextPrompt += `\n\nPergunta do usuÃ¡rio: ${message}`;
        contextPrompt += `\n\nResponda de forma Ãºtil, personalizada e em portuguÃªs brasileiro. Use emojis quando apropriado e seja amigÃ¡vel. NUNCA use asteriscos (*) ou duplos asteriscos (**) nas suas respostas. Sempre se refira ao usuÃ¡rio pelo nome "${userSession.userName}" quando apropriado. 

IMPORTANTE: Ao confirmar receitas ou transaÃ§Ãµes, seja conciso e direto. NÃƒO mencione totais de receitas/despesas desnecessariamente - foque apenas na confirmaÃ§Ã£o especÃ­fica da aÃ§Ã£o solicitada.`;
        
        console.log('ðŸ¤– [GEMINI] Enviando prompt para API...');
        console.log('ðŸ¤– [GEMINI] API Key presente:', !!process.env.GEMINI_API_KEY);
        
        if (!process.env.GEMINI_API_KEY) {
            console.error('âŒ GEMINI_API_KEY nÃ£o configurada!');
            return 'ðŸ˜” Erro de configuraÃ§Ã£o. Contate o administrador.';
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
        console.error('âŒ Erro Gemini chat:', error);
        console.error('âŒ Erro detalhado:', error.response?.data || error.message);
        console.error('âŒ Status do erro:', error.response?.status);
        return 'ðŸ˜” Desculpe, nÃ£o consegui processar sua pergunta no momento. Tente novamente.';
    }
}

// Buscar user ID pelo Telegram (CORRIGIDO para persistÃªncia)
async function getUserIdFromTelegram(chatId) {
    try {
        console.log(`ðŸ” [PERSISTÃŠNCIA] Buscando usuÃ¡rio para chat: ${chatId}`);
        
        // Primeiro verificar sessÃ£o em memÃ³ria
        const userSession = userSessions.get(chatId);
        if (userSession && userSession.userId) {
            console.log(`âœ… [PERSISTÃŠNCIA] Encontrado na memÃ³ria: ${userSession.userName}`);
            return userSession.userId;
        }
        
        console.log(`ðŸ” [PERSISTÃŠNCIA] NÃ£o encontrado na memÃ³ria, buscando no banco...`);
        
        // Buscar no banco de dados (apenas usuÃ¡rios ativos)
        const { data, error } = await supabase
            .from('telegram_users')
            .select('user_id, user_email, user_name')
            .eq('telegram_chat_id', chatId.toString())
            .eq('is_active', true)
            .single();
        
        if (error) {
            console.log(`âŒ [PERSISTÃŠNCIA] Erro no banco: ${error.message}`);
            return null;
        }
        
        if (data && data.user_id) {
            console.log(`âœ… [PERSISTÃŠNCIA] Encontrado no banco: ${data.user_name}`);
            
            // Restaurar sessÃ£o na memÃ³ria para futuras consultas
            userSessions.set(chatId, {
                userId: data.user_id,
                userEmail: data.user_email,
                userName: data.user_name
            });
            
            console.log(`ðŸ”— [PERSISTÃŠNCIA] SessÃ£o restaurada na memÃ³ria para ${data.user_name}`);
            return data.user_id;
        }
        
        console.log(`âŒ [PERSISTÃŠNCIA] UsuÃ¡rio nÃ£o encontrado no banco`);
        return null;
    } catch (error) {
        console.error('âŒ [PERSISTÃŠNCIA] Erro ao buscar usuÃ¡rio:', error);
        return null;
    }
}

// Salvar transaÃ§Ã£o no Supabase
async function saveTransactionToSupabase(userId, transaction) {
    try {
        console.log(`ðŸ’¾ [SAVE] Preparando transaÃ§Ã£o: ${transaction.descricao} - R$ ${transaction.valor} para usuÃ¡rio ${userId}`);
        
        const transactionData = {
            user_id: userId,
            title: transaction.descricao,
            amount: transaction.valor,
            type: transaction.valor > 0 ? 'income' : 'expense',
            category: transaction.categoria,
            date: new Date().toISOString(), // ðŸ”§ CORREÃ‡ÃƒO: Data/hora atual completa
            created_at: new Date().toISOString()
        };
        
        console.log(`ðŸ“ [SAVE] Dados preparados:`, JSON.stringify(transactionData, null, 2));
        
        const { data, error } = await supabase
            .from('transactions')
            .insert(transactionData)
            .select()
            .single();
        
        if (error) {
            console.error('âŒ [SAVE] Erro Supabase:', error);
            return false;
        }
        
        console.log(`âœ… [SAVE] TransaÃ§Ã£o salva com ID: ${data.id} - ${transaction.descricao} - R$ ${transaction.valor}`);
        
        // TODO: NOTIFICAR O APP SOBRE A NOVA TRANSAÃ‡ÃƒO (quando webhook estiver configurado)
        console.log('ðŸ“¢ [SYNC] TransaÃ§Ã£o salva no Supabase - sincronizaÃ§Ã£o automÃ¡tica habilitada');
        
        return true;
        
    } catch (error) {
        console.error('âŒ Erro salvar transaÃ§Ã£o:', error);
        return false;
    }
}

// ðŸ”¥ DETECTAR SE MENSAGEM Ã‰ PEDIDO DE TRANSAÃ‡ÃƒO
function detectTransactionRequest(message) {
    const text = message.toLowerCase();
    
    // Palavras-chave que indicam transaÃ§Ã£o
    const transactionKeywords = [
        'adicione', 'adicionar', 'add', 'registre', 'registrar',
        'gasto', 'gastei', 'comprei', 'paguei', 'despesa',
        'recebi', 'entrada', 'receita', 'salÃ¡rio', 'ganho',
        'transferir', 'saiu', 'entrou', 'dÃ©bito', 'crÃ©dito'
    ];
    
    // PadrÃµes de valor (R$, reais, etc)
    const valuePatterns = [
        /\d+\s*(reais|real|r\$)/,
        /r\$\s*\d+/,
        /\d+[\.,]\d+\s*(reais|real)/
    ];
    
    const hasKeyword = transactionKeywords.some(keyword => text.includes(keyword));
    const hasValue = valuePatterns.some(pattern => pattern.test(text));
    
    return hasKeyword && hasValue;
}

// ðŸ”¥ EXTRAIR TRANSAÃ‡Ã•ES DO TEXTO COM GEMINI
async function extractTransactionsFromText(message, userSession) {
    try {
        const prompt = `VocÃª Ã© um extrator de transaÃ§Ãµes financeiras. Analise o texto e extraia APENAS transaÃ§Ãµes financeiras claras e especÃ­ficas.

TEXTO DO USUÃRIO: "${message}"

REGRAS:
1. Extraia apenas transaÃ§Ãµes com valor especÃ­fico
2. Determine se Ã© receita (entrada/ganho) ou despesa (gasto/saÃ­da)
3. Identifique categoria apropriada
4. Use valores positivos para receitas, negativos para despesas

FORMATO DE RESPOSTA (JSON):
[
  {
    "descricao": "descriÃ§Ã£o da transaÃ§Ã£o",
    "valor": 50.00,
    "categoria": "categoria apropriada"
  }
]

CATEGORIAS VÃLIDAS: AlimentaÃ§Ã£o, Transporte, SaÃºde, EducaÃ§Ã£o, Entretenimento, Compras, ServiÃ§os, SalÃ¡rio, Freelance, Investimentos, Outros

Se nÃ£o encontrar transaÃ§Ãµes claras, retorne: []`;

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
            console.error('âŒ [EXTRAÃ‡ÃƒO] Resposta vazia do Gemini');
            return [];
        }

        console.log(`ðŸ¤– [EXTRAÃ‡ÃƒO] Resposta Gemini: ${aiResponse}`);

        // Tentar extrair JSON da resposta
        const jsonMatch = aiResponse.match(/\[([\s\S]*?)\]/);
        if (!jsonMatch) {
            console.log('âš ï¸ [EXTRAÃ‡ÃƒO] Nenhum JSON encontrado na resposta');
            return [];
        }

        const transactions = JSON.parse(jsonMatch[0]);
        console.log(`âœ… [EXTRAÃ‡ÃƒO] ${transactions.length} transaÃ§Ãµes extraÃ­das`);
        
        return transactions;

    } catch (error) {
        console.error('âŒ [EXTRAÃ‡ÃƒO] Erro ao extrair transaÃ§Ãµes:', error);
        return [];
    }
}

// Limpeza automÃ¡tica de transaÃ§Ãµes pendentes (10 minutos)
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
        console.log(`ðŸ§¹ Limpando ${cleaned} transaÃ§Ãµes pendentes expiradas`);
    }
}, 60000); // Check a cada minuto

// Error handling
bot.on('polling_error', (error) => {
    console.error('âŒ Polling error:', error);
});

process.on('uncaughtException', (error) => {
    console.error('âŒ Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('âŒ Unhandled Rejection:', error);
});

console.log('ðŸš€ Bot configurado e aguardando mensagens...');


