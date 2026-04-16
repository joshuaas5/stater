// Teste direto da API do Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

async function testGeminiDirect() {
  console.log('Testando API do Gemini diretamente...');

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY nao configurada. Defina a variavel de ambiente.');
    process.exit(1);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Responda apenas "Teste funcionando!" em portugues.' }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 32,
            topP: 1,
            maxOutputTokens: 100,
          }
        })
      }
    );

    console.log('Status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro:', errorText);
      return;
    }

    const data = await response.json();
    console.log('Resposta completa:', JSON.stringify(data, null, 2));

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const text = data.candidates[0].content.parts[0].text;
      console.log('Texto da resposta:', text);
    }

  } catch (error) {
    console.error('Erro na requisicao:', error);
  }
}

testGeminiDirect();