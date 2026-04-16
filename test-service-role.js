const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseServiceKey = 'YOUR_JWT_TOKEN';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testWithServiceRole() {
  console.log('ðŸ” Testando com service role...');
  
  try {
    // Buscar um usuÃ¡rio real
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, username')
      .limit(1);
    
    if (usersError) {
      console.error('âŒ Erro ao buscar usuÃ¡rios:', usersError);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('âš ï¸ Nenhum usuÃ¡rio encontrado na tabela profiles');
      return;
    }
    
    const user = users[0];
    console.log('âœ… UsuÃ¡rio encontrado:', user);
    
    // Tentar inserir cÃ³digo com service role
    const testData = {
      code: '999888',
      user_id: user.id,
      user_email: user.email,
      user_name: user.username || 'Test User',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };
    
    console.log('ðŸ“ Tentando inserir com service role:', testData);
    
    const { data, error } = await supabase
      .from('telegram_link_codes')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('âŒ Erro ao inserir com service role:', error);
    } else {
      console.log('âœ… InserÃ§Ã£o bem-sucedida com service role!', data);
      
      // Limpar
      await supabase
        .from('telegram_link_codes')
        .delete()
        .eq('code', '999888');
      console.log('ðŸ§¹ Dados de teste removidos');
    }
    
  } catch (e) {
    console.error('âŒ Erro geral:', e);
  }
}

testWithServiceRole();
