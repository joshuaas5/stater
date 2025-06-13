// Simulação de teste do endpoint OCR sem servidor
console.log('🧪 Iniciando teste direto do endpoint OCR...');

// Importar o handler
const path = require('path');

// Simular objeto de requisição e resposta
const mockReq = {
  method: 'POST',
  body: {
    imageBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  }
};

const mockRes = {
  status: function(code) {
    this.statusCode = code;
    return this;
  },
  json: function(data) {
    console.log('📤 Resposta do endpoint:');
    console.log('Status:', this.statusCode);
    console.log('Data:', JSON.stringify(data, null, 2));
    return this;
  }
};

// Testar o endpoint diretamente
async function testDirectOCR() {
  try {
    console.log('🔧 Carregando handler OCR...');
    
    // Carregar o handler
    const handler = require('./api/gemini-ocr.ts');
    
    console.log('🚀 Executando handler...');
    await handler.default(mockReq, mockRes);
    
  } catch (error) {
    console.error('💥 Erro no teste direto:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDirectOCR();
