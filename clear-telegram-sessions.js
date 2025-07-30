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

async function clearTelegramSessions() {
    console.log('🧹 Limpando todas as sessões do Telegram...');
    
    try {
        // Listar primeiro para ver a estrutura
        const { data: users, error: getUsersError } = await supabase
            .from('telegram_users')
            .select('*')
            .limit(3);
        
        console.log('📋 Estrutura telegram_users:', users);
        
        const { data: codes, error: getCodesError } = await supabase
            .from('telegram_link_codes')
            .select('*')
            .limit(3);
        
        console.log('📋 Estrutura telegram_link_codes:', codes);

        // Limpar usuários ativos do Telegram usando truncate
        const { error: usersError } = await supabase.rpc('truncate_telegram_users');
        
        if (usersError) {
            console.log('🔄 Tentando DELETE normal...');
            const { error: deleteUsersError } = await supabase
                .from('telegram_users')
                .delete()
                .not('telegram_chat_id', 'is', null);
            
            if (deleteUsersError) {
                console.error('❌ Erro ao limpar telegram_users:', deleteUsersError);
            } else {
                console.log('✅ Tabela telegram_users limpa');
            }
        } else {
            console.log('✅ Tabela telegram_users limpa via RPC');
        }

        // Limpar códigos de vinculação
        const { error: codesError } = await supabase
            .from('telegram_link_codes')
            .delete()
            .not('code', 'is', null);
        
        if (codesError) {
            console.error('❌ Erro ao limpar telegram_link_codes:', codesError);
        } else {
            console.log('✅ Tabela telegram_link_codes limpa');
        }

        console.log('🎯 Todas as sessões do Telegram foram removidas!');
        
    } catch (error) {
        console.error('❌ Erro geral:', error);
    }
}

clearTelegramSessions();
