// Test script para verificar a conexão com Supabase e as tabelas
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://hlemutzuubhrkuhevsxo.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZW11dHp1dWJocmt1aGV2c3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMzQ3MTcsImV4cCI6MjA0NjkxMDcxN30.pUaQVR-YwLo6r7_N8n4rZGDCqYeGfgFEhYpyB5YkbzI';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function testSupabaseConnection() {
  console.log('🔗 Testando conexão com Supabase...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseServiceRoleKey.substring(0, 20) + '...');

  try {
    // 1. Testar conexão básica
    console.log('\n1. Testando conexão básica...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('_unknown_table_')
      .select('*')
      .limit(1);
    
    // Esperamos um erro, mas se conectar é bom sinal
    console.log('Conexão básica funcionou (erro esperado):', healthError?.message);

    // 2. Verificar se tabela telegram_users existe
    console.log('\n2. Verificando tabela telegram_users...');
    const { data: telegramCheck, error: telegramError } = await supabase
      .from('telegram_users')
      .select('count(*)')
      .limit(1);

    if (telegramError) {
      console.error('❌ Erro na tabela telegram_users:', telegramError.message);
      
      if (telegramError.message.includes('does not exist') || telegramError.message.includes('relation')) {
        console.log('🔧 A tabela telegram_users não existe! Execute o SQL de setup.');
        return false;
      }
    } else {
      console.log('✅ Tabela telegram_users existe e funcionando');
      console.log('Count result:', telegramCheck);
    }

    // 3. Verificar se tabela telegram_link_codes existe
    console.log('\n3. Verificando tabela telegram_link_codes...');
    const { data: codesCheck, error: codesError } = await supabase
      .from('telegram_link_codes')
      .select('count(*)')
      .limit(1);

    if (codesError) {
      console.error('❌ Erro na tabela telegram_link_codes:', codesError.message);
    } else {
      console.log('✅ Tabela telegram_link_codes existe e funcionando');
      console.log('Count result:', codesCheck);
    }

    // 4. Testar inserção simples
    console.log('\n4. Testando inserção de teste...');
    const testChatId = `test_${Date.now()}`;
    
    const { data: insertResult, error: insertError } = await supabase
      .from('telegram_users')
      .insert([{
        telegram_chat_id: testChatId,
        user_id: '00000000-0000-0000-0000-000000000000', // UUID fictício
        user_email: 'test@test.com',
        user_name: 'Test User',
        is_active: true
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir teste:', insertError.message);
      
      // Tentar sem RLS
      console.log('\n4b. Testando sem RLS...');
      const { data: insertResult2, error: insertError2 } = await supabase
        .from('telegram_users')
        .insert([{
          telegram_chat_id: testChatId + '_norls',
          user_id: '00000000-0000-0000-0000-000000000000',
          user_email: 'test@test.com',
          user_name: 'Test User',
          is_active: true
        }]);

      if (insertError2) {
        console.error('❌ Erro mesmo sem RLS:', insertError2.message);
      } else {
        console.log('⚠️ Inserção funcionou sem RLS - problema pode ser nas políticas RLS');
      }
    } else {
      console.log('✅ Inserção de teste funcionou:', insertResult);
      
      // Limpar o teste
      await supabase
        .from('telegram_users')
        .delete()
        .eq('telegram_chat_id', testChatId);
      
      console.log('🧹 Dados de teste removidos');
    }

    return true;

  } catch (error) {
    console.error('❌ Erro geral ao testar Supabase:', error.message);
    return false;
  }
}

// Executar teste
testSupabaseConnection().then(success => {
  if (success) {
    console.log('\n✅ Teste de conexão Supabase concluído');
  } else {
    console.log('\n❌ Teste de conexão Supabase falhou');
  }
}).catch(error => {
  console.error('❌ Erro fatal no teste:', error);
});
