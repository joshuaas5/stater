// Teste direto do Supabase REST API
async function testeSupabaseREST() {
    const url = 'https://tmucbwlhkffrhtexmjze.supabase.co';
    const anonKey = 'YOUR_JWT_TOKEN';
    
    console.log('🔍 Testando acesso direto ao Supabase REST API...');
    
    try {
        // Primeiro, testar se conseguimos ler a tabela telegram_link_codes
        console.log('\n📋 Teste 1: Listar códigos existentes...');
        const listResponse = await fetch(`${url}/rest/v1/telegram_link_codes?select=*&limit=5`, {
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`
            }
        });
        
        console.log('Status:', listResponse.status);
        const listData = await listResponse.json();
        console.log('Dados existentes:', listData);
        
        // Teste 2: Tentar inserir um código de teste
        console.log('\n📝 Teste 2: Inserir código de teste...');
        const insertResponse = await fetch(`${url}/rest/v1/telegram_link_codes`, {
            method: 'POST',
            headers: {
                'apikey': anonKey,
                'Authorization': `Bearer ${anonKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                code: '999999',
                user_id: 'test-user-123',
                user_email: 'test@test.com',
                user_name: 'Test User',
                expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
                created_at: new Date().toISOString()
            })
        });
        
        console.log('Status inserção:', insertResponse.status);
        const insertData = await insertResponse.json();
        console.log('Resultado inserção:', insertData);
        
        if (!insertResponse.ok) {
            console.log('❌ Erro ao inserir - possivelmente precisa de Service Role Key');
        } else {
            console.log('✅ Inserção bem-sucedida!');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error);
    }
}

testeSupabaseREST();
