// Teste do endpoint OCR com uma imagem de exemplo
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function testOCREndpoint() {
  console.log('🧪 Testando endpoint OCR...');
  
  try {
    // Criar uma imagem de teste simples em base64
    // Esta é uma imagem PNG de 1x1 pixel transparente
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    console.log('📤 Enviando requisição para /api/gemini-ocr...');
    
    const response = await fetch('http://localhost:3000/api/gemini-ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: testImageBase64
      })
    });
    
    console.log('📥 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('✅ Resultado do OCR:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('🎉 OCR funcionando corretamente!');
      console.log('📊 Transações encontradas:', result.data.transactions.length);
    } else {
      console.log('⚠️  OCR retornou erro:', result.error);
    }
    
  } catch (error) {
    console.error('💥 Erro ao testar OCR:', error.message);
  }
}

// Executar teste
testOCREndpoint();
