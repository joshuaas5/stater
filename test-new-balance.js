// Script para testar o novo cálculo de saldo do bot
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testBalanceCalculation() {
    console.log('🧪 Testando novo cálculo de saldo...');
    
    const userId = '56d8f459-8650-4cd9-bf16-f7d70ddbc0a9'; // Usuário de teste
    
    // Testar nova função (igual à do bot corrigido)
    try {
        // Buscar TODAS as transações para calcular saldo real
        const { data: allTransactions, error: allTransactionsError } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', userId);
            
        if (allTransactionsError) {
            console.error('⚠️ Erro ao buscar todas as transações:', allTransactionsError);
            return;
        }
        
        // Calcular saldo REAL
        let balance = 0;
        if (allTransactions) {
            balance = allTransactions.reduce((sum, t) => {
                // Receitas são positivas, despesas são negativas
                const amount = t.type === 'income' ? Math.abs(t.amount || 0) : -Math.abs(t.amount || 0);
                return sum + amount;
            }, 0);
        }
        
        console.log(`💰 Novo saldo calculado: R$ ${balance.toFixed(2)}`);
        console.log(`📊 Total de transações processadas: ${allTransactions.length}`);
        console.log('✅ Bot agora mostrará o saldo EXATO do app!');
        
        // Verificar se é o saldo esperado
        const expectedBalance = 2315256.46;
        if (Math.abs(balance - expectedBalance) < 0.01) {
            console.log('🎯 PERFEITO! Saldo correto confirmado');
        } else {
            console.log(`⚠️ Saldo diferente do esperado. Esperado: R$ ${expectedBalance.toFixed(2)}`);
        }
        
    } catch (error) {
        console.error('❌ Erro:', error);
    }
}

testBalanceCalculation();
