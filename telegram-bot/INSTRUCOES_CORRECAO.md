// Correção específica na função bot.on('message') - linha ~437
// Mover verificação do código de 6 dígitos para ANTES da verificação de sessão

// Localizar esta parte do código:
// Chat com IA (se usuário vinculado)
const userSession = userSessions.get(chatId);
if (userSession) {
    await processChatMessage(chatId, text, userSession);
} else {
    // Verificar se é um código de vinculação (formato: 6 dígitos)
    const codePattern = /^\d{6}$/;
    if (codePattern.test(text.trim())) {
        // ... resto do código

// SUBSTITUIR POR:
// PRIORIDADE: Verificar se é um código de vinculação (formato: 6 dígitos) - SEMPRE PRIMEIRO
const codePattern = /^\d{6}$/;
if (codePattern.test(text.trim())) {
    console.log(`🔗 [CODIGO] Tentativa de vinculação com código: ${text.trim()}`);
    
    // Remover sessão existente se houver
    const existingSession = userSessions.get(chatId);
    if (existingSession) {
        console.log(`🔄 [CODIGO] Removendo sessão anterior de: ${existingSession.userName}`);
        userSessions.delete(chatId);
    }
    
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

⏰ *Códigos expiram em 15 minutos.*`, { parse_mode: 'Markdown' });
        return;
    }
}

// Chat com IA (se usuário vinculado)
const userSession = userSessions.get(chatId);
if (userSession) {
    await processChatMessage(chatId, text, userSession);
} else {
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
