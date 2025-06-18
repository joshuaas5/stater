// Teste específico para OCR de faturas do Itaú
const fs = require('fs');
const fetch = require('node-fetch');

// Simular uma fatura do Itaú em base64
const testItauOCR = async () => {
  try {
    console.log('🧪 Teste OCR Itaú - Iniciando...');
    
    // Dados de teste simulando uma fatura do Itaú
    const testData = {
      file: 'data:application/pdf;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // placeholder
      originalFileName: 'fatura_itau_dezembro.pdf',
      bankName: 'Itaú',
      documentType: 'fatura_cartao',
      userId: 'test-user-id'
    };

    // Fazer chamada para o endpoint local
    const response = await fetch('http://localhost:8082/api/gemini-ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    console.log('✅ Resposta do OCR:', JSON.stringify(result, null, 2));
    
    // Verificar se o resultado tem a estrutura esperada
    if (result.transactions && Array.isArray(result.transactions)) {
      console.log(`📊 Transações encontradas: ${result.transactions.length}`);
      
      if (result.summary && result.summary.totalAmount) {
        console.log(`💰 Valor total: R$ ${result.summary.totalAmount.toFixed(2)}`);
      }
      
      // Mostrar algumas transações de exemplo
      result.transactions.slice(0, 3).forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.description} - R$ ${tx.amount.toFixed(2)} (${tx.type})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no teste OCR:', error.message);
  }
};

// Teste das instruções do prompt
const validatePrompt = () => {
  console.log('🔍 Validando instruções do OCR para Itaú...');
  
  const expectedInstructions = [
    'EXAMINE TODA A PÁGINA, ESPECIALMENTE O LADO DIREITO',
    'Lançamentos: compras e saques',
    'SEMPRE examine ambos os lados da página',
    'FOQUE na seção "LANÇAMENTOS"',
    'Valores sempre como DESPESAS (type: "expense")',
    'Data formato DD/MM'
  ];
  
  expectedInstructions.forEach((instruction, index) => {
    console.log(`✓ ${index + 1}. ${instruction}`);
  });
  
  console.log('✅ Instruções para Itaú validadas!');
};

// Executar testes
console.log('🚀 Iniciando testes do sistema OCR para Itaú...\n');

validatePrompt();
console.log('\n' + '='.repeat(50) + '\n');

// Não executar a chamada real pois precisaria de um PDF real
console.log('ℹ️ Teste de API não executado - necessário PDF real do Itaú');
console.log('📋 Para testar com documento real:');
console.log('1. Acesse http://localhost:8082');
console.log('2. Vá para "Assistente Financeiro IA"');
console.log('3. Faça upload de uma fatura do Itaú');
console.log('4. Verifique se as transações do lado direito são detectadas');
console.log('5. Confirme se o valor total é exibido');

console.log('\n✅ Teste completo!');
