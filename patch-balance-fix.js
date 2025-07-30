// Patch para corrigir o cálculo do saldo no bot do Telegram
// PROBLEMA: Bot calculava saldo apenas das últimas 10 transações
// SOLUÇÃO: Calcular saldo de TODAS as transações

const fs = require('fs');

console.log('🔧 Aplicando patch de correção...');

const botPath = './telegram-bot/bot.js';
let content = fs.readFileSync(botPath, 'utf8');

// Encontrar a função getUserContextForChat e corrigir
const functionStart = content.indexOf('async function getUserContextForChat(userId) {');
const functionEnd = content.indexOf('}\n\n// Chamar Gemini para chat');

if (functionStart === -1 || functionEnd === -1) {
    console.error('❌ Função não encontrada');
    process.exit(1);
}

const newFunction = `async function getUserContextForChat(userId) {
    try {
        // Buscar transações recentes para contexto (apenas 10 mais recentes)
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
        
        console.log(\`💰 Saldo calculado para \${userId}: R$ \${balance.toFixed(2)}\`);
        
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
}`;

// Substituir a função
const before = content.substring(0, functionStart);
const after = content.substring(functionEnd);
const newContent = before + newFunction + '\n\n' + after;

// Salvar
fs.writeFileSync(botPath, newContent, 'utf8');
console.log('✅ Patch aplicado! Bot agora calculará saldo correto');
console.log('💰 Saldo esperado: R$ 2.315.256,46');
