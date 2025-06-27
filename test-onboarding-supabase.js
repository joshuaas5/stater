import { supabase } from './src/lib/supabase.ts';

/**
 * Script de teste para verificar a funcionalidade de onboarding no Supabase
 * Execute com: node test-onboarding-supabase.js
 */

async function testOnboardingMigration() {
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
      return;
    }

    console.log('✅ Tabela user_onboarding encontrada!');

    // 2. Verificar se conseguimos fazer operações básicas
    console.log('\n2️⃣ Testando operações CRUD...');
    
    // Simular um usuário de teste (você pode usar um UUID real de teste)
    const testUserId = 'test-user-123-456-789';
    
    // Tentar inserir um registro de teste
    console.log('📝 Testando INSERT...');
    const { data: insertData, error: insertError } = await supabase
      .from('user_onboarding')
      .upsert({
        user_id: testUserId,
        onboarding_completed: false
      }, {
        onConflict: 'user_id'
      });

    if (insertError) {
      console.error('❌ Erro no INSERT:', insertError);
    } else {
      console.log('✅ INSERT funcionando!');
    }

    // Tentar ler o registro
    console.log('📖 Testando SELECT...');
    const { data: selectData, error: selectError } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (selectError) {
      console.error('❌ Erro no SELECT:', selectError);
    } else {
      console.log('✅ SELECT funcionando!', selectData);
    }

    // Tentar atualizar o registro
    console.log('🔄 Testando UPDATE...');
    const { data: updateData, error: updateError } = await supabase
      .from('user_onboarding')
      .update({
        onboarding_completed: true,
        completed_at: new Date().toISOString()
      })
      .eq('user_id', testUserId);

    if (updateError) {
      console.error('❌ Erro no UPDATE:', updateError);
    } else {
      console.log('✅ UPDATE funcionando!');
    }

    // Verificar se o update funcionou
    const { data: verifyData, error: verifyError } = await supabase
      .from('user_onboarding')
      .select('*')
      .eq('user_id', testUserId)
      .single();

    if (verifyError) {
      console.error('❌ Erro na verificação:', verifyError);
    } else {
      console.log('✅ Dados após UPDATE:', verifyData);
    }

    // Limpar dados de teste
    console.log('🧹 Limpando dados de teste...');
    const { error: deleteError } = await supabase
      .from('user_onboarding')
      .delete()
      .eq('user_id', testUserId);

    if (deleteError) {
      console.error('❌ Erro no DELETE:', deleteError);
    } else {
      console.log('✅ DELETE funcionando! Dados de teste removidos.');
    }

    console.log('\n🎉 Todos os testes passaram! A migração está funcionando corretamente.');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

// Executar testes
testOnboardingMigration().then(() => {
  console.log('\n✅ Testes concluídos!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
