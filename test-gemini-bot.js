const axios = require('axios');
require('dotenv').config({ path: './telegram-bot/.env' });

console.log('🔍 Testando API Gemini do bot...');
console.log('🔑 API Key presente:', !!process.env.GEMINI_API_KEY);
console.log('🔑 API Key length:', process.env.GEMINI_API_KEY?.length);

async function testGemini() {
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                contents: [{
                    parts: [{ text: 'Teste simples' }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100
                }
            }
        );
        
        console.log('✅ API Gemini funcionando!');
        console.log('📝 Resposta:', response.data.candidates[0].content.parts[0].text);
    } catch (error) {
        console.error('❌ Erro API Gemini:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
    }
}

testGemini();
