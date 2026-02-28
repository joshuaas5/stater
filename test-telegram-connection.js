// Script de teste para verificar se o fluxo de conexão Telegram está funcionando
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './telegram-bot/.env' });

// Configurar cliente Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testTelegramConnection() {
    console.log('🧪 TESTE: Fluxo de Conexão Telegram');
    console.log('=====================================');
    
    // 1. Testar criação de código de vinculação
    console.log('\n1. Testando criação de código...');
    
    const testUserId = '123e4567-e89b-12d3-a456-426614174000'; // UUID fictício
    const testUserEmail = 'teste@stater.com';
    const testUserName = 'Usuario Teste';
    
    const code = Math.random().toString(36).substring(2, 12).toUpperCase();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    try {
        const { data: insertData, error: insertError } = await supabase
            .from('telegram_link_codes')
            .insert({
                code: code,
                user_id: testUserId,
                user_email: testUserEmail,
                user_name: testUserName,
                expires_at: expiresAt.toISOString(),
                created_at: new Date().toISOString()
            })
            .select()
            .single();
        
        if (insertError) {
            console.error('❌ Erro ao inserir código:', insertError);
            return false;
        }
        
        console.log('✅ Código criado:', code);
        
        // 2. Testar busca do código (simulando o bot)
        console.log('\n2. Testando busca do código...');
        
        const { data: fetchData, error: fetchError } = await supabase
            .from('telegram_link_codes')
            .select('user_id, user_email, user_name, expires_at')
            .eq('code', code)
            .single();
        
        if (fetchError) {
            console.error('❌ Erro ao buscar código:', fetchError);
            return false;
        }
        
        console.log('✅ Código encontrado:', fetchData);
        
        // 3. Testar criação de vinculação (simulando o bot)
        console.log('\n3. Testando criação de vinculação...');
        
        const testChatId = '123456789';
        
        const { data: upsertData, error: upsertError } = await supabase
            .from('telegram_users')
            .upsert({
                telegram_chat_id: testChatId,
                user_id: testUserId,
                user_email: testUserEmail,
                user_name: testUserName,
                linked_at: new Date().toISOString(),
                is_active: true
            })
            .select()
            .single();
        
        if (upsertError) {
            console.error('❌ Erro ao criar vinculação:', upsertError);
            return false;
        }
        
        console.log('✅ Vinculação criada:', upsertData);
        
        // 4. Testar marcar código como usado
        console.log('\n4. Testando marcar código como usado...');
        
        const { error: updateError } = await supabase
            .from('telegram_link_codes')
            .update({ used_at: new Date().toISOString() })
            .eq('code', code);
        
        if (updateError) {
            console.error('❌ Erro ao marcar código como usado:', updateError);
        } else {
            console.log('✅ Código marcado como usado');
        }
        
        // 5. Limpar dados de teste
        console.log('\n5. Limpando dados de teste...');
        
        await supabase.from('telegram_users').delete().eq('user_id', testUserId);
        await supabase.from('telegram_link_codes').delete().eq('code', code);
        
        console.log('✅ Dados de teste removidos');
        
        console.log('\n🎉 TESTE COMPLETO: Fluxo funcionando corretamente!');
        return true;
        
    } catch (error) {
        console.error('❌ Erro geral no teste:', error);
        return false;
    }
}

// Executar teste
testTelegramConnection()
    .then(success => {
        if (success) {
            console.log('\n✅ RESULTADO: Conexão Telegram funcionando!');
        } else {
            console.log('\n❌ RESULTADO: Há problemas na conexão!');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ Erro fatal:', error);
        process.exit(1);
    });
