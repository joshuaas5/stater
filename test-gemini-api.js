const testGeminiApi = async () => {
  try {
    console.log('Testando API Gemini...');
    
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer test-token-${Date.now()}`, // Token de teste
      },
      body: JSON.stringify({ 
        originalPrompt: 'Olá, como você está?' 
      }),
    });

    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro da API:', errorData);
      return;
    }

    const data = await response.json();
    console.log('Resposta da API:', data);
    
  } catch (error) {
    console.error('Erro ao testar API:', error);
  }
};

// Executar teste
testGeminiApi();
