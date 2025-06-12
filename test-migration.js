// Teste rápido da migração para Gemini 2.5 Flash Preview
const dotenv = require('dotenv');
const path = require('path');

// Carregar variáveis de ambiente
dotenv.config({ path: path.join(__dirname, '.env.local') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDTTPO0otruHVzh7bXsi7MCyG674P03758";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;

async function testMigration() {
  console.log('🚀 Testando migração para Gemini 2.5 Flash Preview...');
  console.log('📡 Endpoint:', GEMINI_ENDPOINT.replace(GEMINI_API_KEY, 'XXXXX'));
  
  const testPrompt = 'Olá! Você é a VOYB IA?';
  
  const payload = {
    contents: [{
      role: "user",
      parts: [{text: testPrompt}]
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 100
    }
  };

  try {
    console.log('📤 Enviando requisição...');
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('📊 Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Migração bem-sucedida!');
    console.log('🤖 Resposta da VOYB IA:', data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sem resposta');
    
    if (data.usageMetadata) {
      console.log('📈 Tokens usados:', {
        prompt: data.usageMetadata.promptTokenCount,
        resposta: data.usageMetadata.candidatesTokenCount,
        total: data.usageMetadata.totalTokenCount
      });
    }

    console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('🔄 Modelo atualizado: Gemini 1.5 Flash → Gemini 2.5 Flash Preview');
    console.log('🤖 IA atualizada: Consultor financeiro → VOYB IA');

  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
  }
}

testMigration();
