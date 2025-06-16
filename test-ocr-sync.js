// Script para testar sincronização de transações OCR
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hkukcqaxftlykrcyjzlg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrdwtjcWF4ZnRseWtyY3lqemxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5OTA0ODEsImV4cCI6MjA0ODU2NjQ4MX0.uWdGjOHtUYv8nNuAJONZCvJyNOwpNpLLfCl5_y5UrPQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOCRSync() {
  console.log('🧪 Testando sincronização de transações OCR...\n');
  
  try {
    // 1. Verificar autenticação
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.log('❌ Erro: Usuário não autenticado');
      return;
    }
    
    const userId = sessionData.session.user.id;
    console.log('✅ Usuário autenticado:', userId);
    
    // 2. Buscar últimas transações
    const { data: transactions, error: transError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (transError) {
      console.error('❌ Erro ao buscar transações:', transError);
      return;
    }
    
    console.log(`\n📊 Últimas ${transactions.length} transações do usuário:`);
    transactions.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.title} - R$ ${tx.amount} (${tx.type}) - ${new Date(tx.date).toLocaleDateString('pt-BR')}`);
    });
    
    // 3. Simular uma transação OCR
    const testTransaction = {
      id: `test-ocr-${Date.now()}`,
      user_id: userId,
      title: 'Teste OCR Sync',
      amount: 50.00,
      type: 'expense',
      category: 'teste',
      date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('\n🧪 Inserindo transação de teste...');
    const { data: insertedTx, error: insertError } = await supabase
      .from('transactions')
      .insert(testTransaction)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ Erro ao inserir transação:', insertError);
      return;
    }
    
    console.log('✅ Transação inserida:', insertedTx.title);
    
    // 4. Verificar se a transação foi salva corretamente
    const { data: verifyTx, error: verifyError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', testTransaction.id)
      .single();
    
    if (verifyError) {
      console.error('❌ Erro ao verificar transação:', verifyError);
      return;
    }
    
    console.log('✅ Transação verificada no banco:', verifyTx.title);
    
    // 5. Limpar transação de teste
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', testTransaction.id);
    
    if (deleteError) {
      console.error('❌ Erro ao limpar transação de teste:', deleteError);
    } else {
      console.log('🧹 Transação de teste removida');
    }
    
    console.log('\n✅ Teste de sincronização OCR concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar teste
testOCRSync().then(() => {
  console.log('\n📝 Instruções para debug OCR:');
  console.log('1. Abra o DevTools (F12) no navegador');
  console.log('2. Vá para a aba Console');
  console.log('3. Envie um documento para OCR');
  console.log('4. Procure por logs com [OCR] ou 📊 [Dashboard]');
  console.log('5. Após confirmar transações, verifique se aparecem no Dashboard');
  console.log('\n🔍 Para debug adicional:');
  console.log('- localStorage.getItem("transactions_[USER_ID]")');
  console.log('- window.dispatchEvent(new Event("transactionsUpdated"))');
}).catch(console.error);
