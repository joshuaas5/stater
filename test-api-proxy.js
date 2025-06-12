// Teste da API diretamente no servidor Express
async function testAPI() {
  try {
    console.log('Testando API diretamente no servidor Express...');
    
    const response = await fetch('http://localhost:3001/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-123'
      },
      body: JSON.stringify({
        originalPrompt: 'Olá, você está funcionando?'
      })
    });
    
    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Resposta:', data);
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testAPI();
