/**
 * Script simples para testar conexÃ£o com Supabase
 * Execute com: node test-supabase-simple.js
 */

const { createClient } = require('@supabase/supabase-js');

// ConfiguraÃ§Ã£o do Supabase
const supabaseUrl = 'https://tmucbwlhkffrhtexmjze.supabase.co';
const supabaseAnonKey = 'YOUR_JWT_TOKEN';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testOnboardingTable() {
  console.log('ðŸ§ª [TESTE ONBOARDING] Iniciando testes...');

  try {
    // 1. Verificar se a tabela foi criada
    console.log('\n1ï¸âƒ£ Verificando se a tabela user_onboarding existe...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('user_onboarding')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('âŒ Erro ao verificar tabela:', tableError);
      console.log('ðŸ“ Execute o script migrate-onboarding-supabase.sql no Supabase Dashboard primeiro!');
      console.log('\nðŸ”— Acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/sql/new');
      console.log('ðŸ“‹ Copie e cole o conteÃºdo de migrate-onboarding-supabase.sql');
      return;
    }

    console.log('âœ… Tabela user_onboarding encontrada!');
    console.log('ðŸ“Š Dados atuais na tabela:', tableCheck);

    console.log('\nðŸŽ‰ Tabela estÃ¡ funcionando! O onboarding usarÃ¡ persistÃªncia global via Supabase.');
    
  } catch (error) {
    console.error('âŒ Erro geral no teste:', error);
  }
}

// Executar testes
testOnboardingTable().then(() => {
  console.log('\nâœ… Testes concluÃ­dos!');
  process.exit(0);
}).catch((error) => {
  console.error('âŒ Erro fatal:', error);
  process.exit(1);
});
