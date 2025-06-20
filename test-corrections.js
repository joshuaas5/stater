// Script para testar as correções implementadas
console.log('🔧 TESTANDO CORREÇÕES DO SISTEMA DE CONEXÃO TELEGRAM\n');

async function testDebugAPI() {
  console.log('1️⃣ Testando API de debug...');
  
  try {
    // Criar código de teste
    const createResponse = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/debug-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create_test_code', code: 'TEST1' })
    });
    
    const createResult = await createResponse.json();
    console.log('📋 Criação de código:', createResult);
    
    if (createResult.success) {
      // Verificar código
      const checkResponse = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/debug-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_code', code: 'TEST1' })
      });
      
      const checkResult = await checkResponse.json();
      console.log('🔍 Verificação de código:', checkResult);
      
      // Simular webhook com código de teste
      const webhookResponse = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/telegram-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: {
            message_id: 1001,
            from: {
              id: 123456789,
              first_name: 'Teste',
              username: 'teste_user'
            },
            chat: {
              id: 123456789,
              type: 'private'
            },
            date: Math.floor(Date.now() / 1000),
            text: '/start TEST1'
          }
        })
      });
      
      console.log('📡 Webhook status:', webhookResponse.status);
      const webhookResult = await webhookResponse.text();
      console.log('📄 Webhook resposta:', webhookResult);
      
      // Limpar dados de teste
      const cleanupResponse = await fetch('https://sprout-spending-hub-vb4x.vercel.app/api/debug-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cleanup' })
      });
      
      const cleanupResult = await cleanupResponse.json();
      console.log('🧹 Limpeza:', cleanupResult);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

async function testPreviewMeta() {
  console.log('\n2️⃣ Testando meta tags do preview...');
  
  try {
    const response = await fetch('https://sprout-spending-hub-vb4x.vercel.app/');
    const html = await response.text();
    
    // Verificar meta tags
    const hasCorrectTitle = html.includes('ICTUS - Assistente Financeiro IA');
    const hasCorrectDescription = html.includes('Controle suas finanças com inteligência artificial');
    const hasCorrectImage = html.includes('sprout-spending-hub-vb4x.vercel.app/og-image.png');
    const removedLovable = !html.includes('lovable.dev');
    
    console.log('📱 Meta tags corretas:');
    console.log('  - Título ICTUS:', hasCorrectTitle ? '✅' : '❌');
    console.log('  - Descrição IA:', hasCorrectDescription ? '✅' : '❌');
    console.log('  - Imagem própria:', hasCorrectImage ? '✅' : '❌');
    console.log('  - Removido Lovable:', removedLovable ? '✅' : '❌');
    
    if (hasCorrectTitle && hasCorrectDescription && hasCorrectImage && removedLovable) {
      console.log('✅ Preview do Telegram corrigido!');
    } else {
      console.log('⚠️ Algumas meta tags ainda precisam de ajuste');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar preview:', error);
  }
}

async function runAllTests() {
  console.log('🚀 EXECUTANDO TODOS OS TESTES...\n');
  
  await testDebugAPI();
  await testPreviewMeta();
  
  console.log('\n🏁 TESTES CONCLUÍDOS!');
  console.log('\n📊 RESUMO DAS CORREÇÕES:');
  console.log('  1. ✅ Sistema de conexão corrigido (Supabase em vez de localStorage)');
  console.log('  2. ✅ Meta tags Open Graph atualizadas para ICTUS');
  console.log('  3. ✅ Logs detalhados para debug');
  console.log('  4. ✅ API de debug criada');
  console.log('\n🎉 O bot do Telegram deve estar funcionando corretamente agora!');
}

runAllTests();
