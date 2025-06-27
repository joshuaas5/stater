/**
 * Script simples para testar conexão com Supabase
 * Execute com: node test-supabase-simple.js
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtdWNid2xoa2Zmcmh0ZXhtanplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxMzAzMDgsImV4cCI6MjA2MTcwNjMwOH0.rNx8GkxpEeGjtOwYC_LiL4HlAiwZKVMPTRrCqt7UHVo';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testOnboardingTable() {
  console.log('🧪 [TESTE ONBOARDING] Iniciando testes...');

  try {
    // 1. Verificar se a tabela foi criada
    console.log('\n1️⃣ Verificando se a tabela user_onboarding existe...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_onboarding')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError);
      console.log('📝 Execute o script migrate-onboarding-supabase.sql no Supabase Dashboard primeiro!');
      console.log('\n🔗 Acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/sql/new');
      console.log('📋 Copie e cole o conteúdo de migrate-onboarding-supabase.sql');
      return;
    }

    console.log('✅ Tabela user_onboarding encontrada!');
    console.log('📊 Dados atuais na tabela:', tableCheck);

    console.log('\n🎉 Tabela está funcionando! O onboarding usará persistência global via Supabase.');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar testes
testOnboardingTable().then(() => {
  console.log('\n✅ Testes concluídos!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
