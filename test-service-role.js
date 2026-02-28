const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseServiceKey = 'YOUR_JWT_TOKEN';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testWithServiceRole() {
  console.log('🔍 Testando com service role...');
  
  try {
    // Buscar um usuário real
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, username')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado na tabela profiles');
      return;
    }
    
    const user = users[0];
    console.log('✅ Usuário encontrado:', user);
    
    // Tentar inserir código com service role
    const testData = {
      code: '999888',
      user_id: user.id,
      user_email: user.email,
      user_name: user.username || 'Test User',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };
    
    console.log('📝 Tentando inserir com service role:', testData);
    
    const { data, error } = await supabase
      .from('telegram_link_codes')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir com service role:', error);
    } else {
      console.log('✅ Inserção bem-sucedida com service role!', data);
      
      // Limpar
      await supabase
        .from('telegram_link_codes')
        .delete()
        .eq('code', '999888');
      console.log('🧹 Dados de teste removidos');
    }
    
  } catch (e) {
    console.error('❌ Erro geral:', e);
  }
}

testWithServiceRole();
