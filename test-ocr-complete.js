// Teste completo do OCR
const { testOCRHandler } = require('./test-ocr-handler');

console.log('🧪 Testando OCR com Gemini 2.5 Flash Vision...\n');

// Simular requisição e resposta
const mockReq = {
  method: 'POST',
  body: {
    // Imagem de teste de 1x1 pixel em base64
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  }
};

const mockRes = {
  statusCode: null,
  data: null,
  status: function(code) {
    this.statusCode = code;
    console.log(`📊 Status HTTP: ${code}`);
    return this;
  },
  json: function(data) {
    this.data = data;
    console.log('📦 Resposta JSON:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n' + '='.repeat(50));
    
    if (data.success) {
      console.log('✅ TESTE PASSOU! OCR funcionando corretamente');
      console.log(`📈 Transações encontradas: ${data.data.transactions.length}`);
      console.log(`🎯 Modo de processamento: ${data.metadata.processingMode}`);
    } else {
      console.log('❌ TESTE FALHOU:', data.error);
    }
    
    return this;
  }
};

// Executar teste
async function runTest() {
  try {
    console.log('🚀 Iniciando teste...\n');
    await testOCRHandler(mockReq, mockRes);
  } catch (error) {
    console.error('💥 Erro no teste:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

runTest();
