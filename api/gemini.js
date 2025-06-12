// API Gemini básica para testes locais
// A chave já está definida no .env.local
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

console.log('[GEMINI_API] Chave API configurada:', !!GEMINI_API_KEY);

const handler = async (req, res) => {
  console.log('[GEMINI_API] Requisição recebida');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada' });
  }

  // Extrair prompt
  const { originalPrompt } = req.body;
  if (!originalPrompt || typeof originalPrompt !== 'string') {
    return res.status(400).json({ error: 'Prompt original inválido' });
  }

  // Construir payload simples
  const geminiPayload = {
    contents: [{ 
      role: "user",
      parts: [{text: originalPrompt}] 
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  };

  try {
    // Enviar requisição para API do Gemini
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GEMINI_API] Erro da API:', errorText);
      return res.status(response.status).json({ 
        error: 'Erro na API do Gemini: ' + errorText 
      });
    }

    // Extrair resposta
    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && data.candidates[0].content.parts) {
      const resposta = data.candidates[0].content.parts[0].text;
      return res.status(200).json({ resposta });
    } else {
      return res.status(500).json({ error: 'Formato de resposta inválido da API' });
    }
    
  } catch (error) {
    console.error('[GEMINI_API] Erro:', error);
    return res.status(500).json({ error: 'Erro ao processar requisição: ' + error.message });
  }
};

// Exportar handler
module.exports = handler;
