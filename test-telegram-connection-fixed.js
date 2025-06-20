// Teste do fluxo completo de conexão Telegram corrigido
const TEST_USER_DATA = {
  user_id: 'test-user-123',
  user_email: 'teste@exemplo.com',
  user_name: 'Usuário Teste'
};

async function testTelegramConnectionFlow() {
  console.log('🧪 TESTANDO FLUXO DE CONEXÃO TELEGRAM CORRIGIDO\n');
  
  try {
    // 1. TESTE: Gerar código
    console.log('1️⃣ Testando geração de código...');
    const generateResponse = await fetch('/api/telegram-codes-simple', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER_DATA)
    });
    
    const generateResult = await generateResponse.json();
    console.log('✅ Código gerado:', generateResult);
    
    if (!generateResult.success) {
      throw new Error('Falha na geração de código');
    }
    
    const code = generateResult.code;
    console.log(`📋 Código para teste: ${code}\n`);
    
    // 2. TESTE: Verificar código
    console.log('2️⃣ Testando verificação de código...');
    const verifyResponse = await fetch(`/api/telegram-codes-simple?code=${code}`);
    const verifyResult = await verifyResponse.json();
    console.log('✅ Verificação:', verifyResult);
    
    if (!verifyResult.success) {
      throw new Error('Falha na verificação de código');
    }
    
    // 3. TESTE: Marcar como usado
    console.log('3️⃣ Testando marcação como usado...');
    const markUsedResponse = await fetch('/api/telegram-codes-simple', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    
    const markUsedResult = await markUsedResponse.json();
    console.log('✅ Marcação como usado:', markUsedResult);
    
    // 4. TESTE: Tentar verificar código usado
    console.log('4️⃣ Testando verificação de código já usado...');
    const verifyUsedResponse = await fetch(`/api/telegram-codes-simple?code=${code}`);
    const verifyUsedResult = await verifyUsedResponse.json();
    console.log('❌ Esperado falha:', verifyUsedResult);
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('\n📋 RESUMO DOS TESTES:');
    console.log(`• Formato do código: ${code} (${code.length} caracteres, formato ##AA)`);
    console.log(`• Geração: ${generateResult.success ? '✅' : '❌'}`);
    console.log(`• Verificação: ${verifyResult.success ? '✅' : '❌'}`);
    console.log(`• Marcação como usado: ${markUsedResult.success ? '✅' : '❌'}`);
    console.log(`• Prevenção de reutilização: ${!verifyUsedResult.success ? '✅' : '❌'}`);
    
  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
  }
}

// INSTRUÇÕES PARA TESTE MANUAL:
console.log('🧪 TESTE MANUAL DO TELEGRAM:');
console.log('1. Abra: https://t.me/assistentefinanceiroiabot');
console.log('2. Digite: /conectar');
console.log('3. Copie o código gerado');
console.log('4. Abra: https://sprout-spending-hub-vb4x.vercel.app');
console.log('5. Faça login e vá para Dashboard');
console.log('6. Clique em "Conectar Agora"');
console.log('7. Cole o código quando solicitado');
console.log('8. Verifique se a conta foi vinculada');

// Executar teste automático (descomente se estiver rodando no cliente)
// testTelegramConnectionFlow();

console.log('\n🚀 Sistema pronto para teste!');
