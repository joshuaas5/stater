const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseKey = 'YOUR_JWT_TOKEN';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTables() {
  console.log('🔍 Verificando tabela telegram_link_codes...');
  
  try {
    // Tentar inserir um registro de teste
    const testData = {
      code: '123456',
      user_id: '550e8400-e29b-41d4-a716-446655440000', // UUID de teste válido
      user_email: 'test@example.com',
      user_name: 'Test User',
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };
    
    console.log('Tentando inserir dados de teste:', testData);
    
    const { data, error } = await supabase
      .from('telegram_link_codes')
      .insert([testData])
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir:', error);
    } else {
      console.log('✅ Inserção bem-sucedida:', data);
      
      // Limpar o teste
      await supabase
        .from('telegram_link_codes')
        .delete()
        .eq('code', '123456');
      console.log('🧹 Dados de teste removidos');
    }
    
  } catch (e) {
    console.error('❌ Erro geral:', e);
  }
  
  // Verificar se a tabela existe
  try {
    const { data, error } = await supabase
      .from('telegram_link_codes')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro ao consultar tabela:', error);
    } else {
      console.log('✅ Tabela existe e é acessível');
    }
  } catch (e) {
    console.error('❌ Tabela pode não existir:', e);
  }
}

debugTables();
