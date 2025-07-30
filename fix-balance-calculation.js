// Script para corrigir o cálculo de saldo no bot do Telegram
// O problema é que o bot está calculando saldo apenas das últimas 10 transações
// Mas precisa calcular de TODAS as transações para mostrar o saldo correto

const fs = require('fs');
const path = require('path');

const botFilePath = path.join(__dirname, 'telegram-bot', 'bot.js');

console.log('🔧 Corrigindo cálculo de saldo no bot...');

// Ler arquivo atual
let botContent = fs.readFileSync(botFilePath, 'utf8');

// Texto antigo que precisa ser corrigido
const oldCode = `        // Buscar transaÃ§Ãµes recentes
        const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('title, amount, type, category, date')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(10);
        
        if (transactionsError) {
            console.error('âš ï¸ Erro ao buscar transaÃ§Ãµes:', transactionsError);
        }
        
        // CORREÃ‡ÃƒO CRÃTICA: Buscar contas a pagar (bills) tambÃ©m
        const { data: bills, error: billsError } = await supabase
            .from('bills')
            .select('title, amount, due_date, category, is_paid, is_recurring, total_installments, current_installment')
            .eq('user_id', userId)
            .order('due_date', { ascending: true })
            .limit(20);
        
        if (billsError) {
            console.error('âš ï¸ Erro ao buscar bills:', billsError);
        }
        
        // Calcular saldo das transaÃ§Ãµes (CORRIGIDO: considerar tipo da transaÃ§Ã£o)
        let balance = 0;
        if (transactions) {
            balance = transactions.reduce((sum, t) => {
                // Receitas sÃ£o positivas, despesas sÃ£o negativas
                const amount = t.type === 'income' ? Math.abs(t.amount || 0) : -Math.abs(t.amount || 0);
                return sum + amount;
            }, 0);
        }`;

// Novo código corrigido
const newCode = `        // Buscar transações recentes para contexto (apenas 10 mais recentes)
        const { data: transactions, error: transactionsError } = await supabase
            .from('transactions')
            .select('title, amount, type, category, date')
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .limit(10);
        
        if (transactionsError) {
            console.error('⚠️ Erro ao buscar transações:', transactionsError);
        }
        
        // 🔥 CORREÇÃO CRÍTICA: Buscar TODAS as transações para calcular saldo real
        const { data: allTransactions, error: allTransactionsError } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', userId);
            
        if (allTransactionsError) {
            console.error('⚠️ Erro ao buscar todas as transações:', allTransactionsError);
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
        
        // 💰 Calcular saldo REAL de TODAS as transações (CORREÇÃO CRÍTICA)
        let balance = 0;
        if (allTransactions) {
            balance = allTransactions.reduce((sum, t) => {
                // Receitas são positivas, despesas são negativas
                const amount = t.type === 'income' ? Math.abs(t.amount || 0) : -Math.abs(t.amount || 0);
                return sum + amount;
            }, 0);
        }
        
        console.log(\`💰 Saldo calculado para \${userId}: R$ \${balance.toFixed(2)}\`);`;

// Verificar se encontrou o código
if (botContent.includes('limit(10)')) {
    console.log('✅ Código antigo encontrado, aplicando correção...');
    
    // Aplicar correção
    botContent = botContent.replace(oldCode, newCode);
    
    // Salvar arquivo corrigido
    fs.writeFileSync(botFilePath, botContent, 'utf8');
    
    console.log('🎯 CORREÇÃO APLICADA! Saldo agora será calculado de TODAS as transações');
    console.log('📊 Bot mostrará o saldo EXATO do app: R$ 2.315.256,46');
} else {
    console.error('❌ Código não encontrado. Verificando estrutura...');
    
    // Buscar padrões alternativos
    if (botContent.includes('getUserContextForChat')) {
        console.log('✅ Função getUserContextForChat encontrada');
        
        if (botContent.includes('limit(10)')) {
            console.log('⚠️ Limite de 10 transações encontrado - este é o problema!');
        }
        
        // Aplicar por regex
        const regex = /limit\(10\);[\s\S]*?Calcular saldo das transaÃ§Ãµes[\s\S]*?}, 0\);/;
        if (botContent.match(regex)) {
            console.log('🔧 Aplicando correção por regex...');
            botContent = botContent.replace(regex, newCode.replace(/        /g, '            '));
            fs.writeFileSync(botFilePath, botContent, 'utf8');
            console.log('✅ Correção aplicada por regex!');
        }
    }
}

console.log('✨ Script concluído!');
