// Script simples para testar a API no CMD
const path = require('path');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '.env.local') });

// Verificar se a API key está disponível
console.log('GEMINI_API_KEY configurada:', !!process.env.GEMINI_API_KEY);

// URL da API
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';
const API_KEY = process.env.GEMINI_API_KEY;

// Função para testar a API
async function testApi() {
  try {
    console.log('Testando API Gemini...');
    
    const requestUrl = `${API_URL}?key=${API_KEY}`;
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{text: 'Responda apenas "API funcionando!"'}]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50
        }
      })
    });
    
    console.log('Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na API:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Resposta completa:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      console.log('SUCESSO! Resposta:', data.candidates[0].content.parts[0].text);
    }
  } catch (error) {
    console.error('Erro ao testar API:', error);
  }
}

// Executar o teste
testApi();
