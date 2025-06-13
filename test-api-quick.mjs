// Teste rápido da API OCR com modelo único
console.log('🧪 Testando API OCR com Gemini 2.0 Flash Exp...');

// Teste com imagem pequena
const testImageBase64 = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAABf/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AA';

async function testOCR() {
  try {
    const response = await fetch('http://localhost:8083/api/gemini-ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64: testImageBase64
      })
    });

    console.log('📡 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ API OCR funcionando!');
    console.log('📊 Modelo usado:', result.metadata?.processingMode || 'gemini');
    console.log('🔢 Tokens usados:', result.metadata?.tokensUsed || 0);
    console.log('📋 Transações encontradas:', result.data?.transactions?.length || 0);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

testOCR();
