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

async function testUpdateUsedAt() {
    try {
        console.log('🔄 Testando atualização do campo `used_at`...');
        const { error } = await supabase
            .from('telegram_link_codes')
            .update({ used_at: new Date().toISOString() })
            .eq('code', '549939');

        if (error) {
            console.error('❌ Erro ao atualizar `used_at`:', error);
        } else {
            console.log('✅ Campo `used_at` atualizado com sucesso!');
        }
    } catch (err) {
        console.error('❌ Erro geral:', err);
    }
}

testUpdateUsedAt();
