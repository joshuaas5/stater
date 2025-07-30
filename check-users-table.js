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

async function checkUsersTable() {
    try {
        console.log('🔍 Verificando estrutura da tabela users...');
        
        // Buscar um usuário para ver campos disponíveis
        const { data: users, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        
        if (error) {
            console.error('❌ Erro ao acessar tabela users:', error);
        } else if (users && users.length > 0) {
            console.log('📋 Campos disponíveis na tabela users:');
            console.log(Object.keys(users[0]));
            console.log('\n📄 Exemplo de registro:');
            console.log(users[0]);
        } else {
            console.log('📭 Tabela users está vazia');
        }
        
        // Verificar se existe tabela auth.users
        console.log('\n🔍 Verificando auth.users...');
        const { data: authUsers, error: authError } = await supabase.auth.getSession();
        console.log('Auth session:', authUsers ? 'Existe' : 'Não encontrada');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

checkUsersTable();
