// Debug da API Gemini
console.log('=== DEBUG API GEMINI ===');

// Simular o que o backend está fazendo
console.log('1. Verificando variável de ambiente GEMINI_API_KEY...');
console.log('GEMINI_API_KEY presente:', !!process.env.GEMINI_API_KEY);
console.log('GEMINI_API_KEY valor:', process.env.GEMINI_API_KEY ? 'SIM' : 'NÃO');

// Testar requisição real para a API local
async function testLocalAPI() {
  console.log('\n2. Testando API local...');
  
  const testPayload = {
    originalPrompt: "Olá! Como você está?"
  };
  
  try {
    const response = await fetch('http://localhost:8082/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer fake-token-for-test'
      },
      body: JSON.stringify(testPayload)
    });
    
    console.log('Status da resposta da API local:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API local:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API local funcionando! Resposta:', data);
    
  } catch (error) {
    console.error('❌ Erro ao testar API local:', error);
  }
}

testLocalAPI();
