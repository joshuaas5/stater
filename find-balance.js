const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL, 
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

async function findBalanceStorage() {
    try {
        console.log('🔍 Procurando onde o saldo é armazenado...');
        
        // Verificar tabelas existentes
        const tables = ['transactions', 'bills', 'user_profiles', 'profiles'];
        
        for (const table of tables) {
            try {
                console.log(`\n📋 Verificando tabela: ${table}`);
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .limit(1);
                
                if (error) {
                    console.log(`❌ ${table}: ${error.message}`);
                } else if (data && data.length > 0) {
                    console.log(`✅ ${table} existe! Campos:`, Object.keys(data[0]));
                    if (table === 'transactions') {
                        console.log('📊 Exemplo de transação:', data[0]);
                    }
                } else {
                    console.log(`📭 ${table}: vazia`);
                }
            } catch (err) {
                console.log(`❌ ${table}: erro ao acessar`);
            }
        }
        
        // Calcular saldo real das transações do usuário específico
        const userId = '56d8f459-8650-4cd9-bf16-f7d70ddbc0a9'; // Seu user_id
        console.log(`\n💰 Calculando saldo real para usuário: ${userId}`);
        
        const { data: transactions, error: transError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        
        if (transError) {
            console.error('❌ Erro ao buscar transações:', transError);
        } else {
            console.log(`📊 Total de transações: ${transactions.length}`);
            
            let balance = 0;
            transactions.forEach(t => {
                const amount = t.type === 'income' ? Math.abs(t.amount || 0) : -Math.abs(t.amount || 0);
                balance += amount;
                console.log(`${t.type === 'income' ? '+' : '-'}R$ ${Math.abs(t.amount)} - ${t.title} (${t.date})`);
            });
            
            console.log(`\n💸 SALDO CALCULADO: R$ ${balance.toFixed(2)}`);
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

findBalanceStorage();
