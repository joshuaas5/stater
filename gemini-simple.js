// Arquivo gemini-simple.js para suporte à exportação CommonJS
const GEMINI_API_KEY = "AIzaSyDTTPO0otruHVzh7bXsi7MCyG674P03758";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

async function handler(req, res) {
  console.log('[GEMINI-SIMPLE] Handler iniciado');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { originalPrompt } = req.body;
  if (!originalPrompt || typeof originalPrompt !== 'string') {
    return res.status(400).json({ error: 'Prompt original inválido' });
  }

  const today = new Date();
  const todayFormatted = today.toISOString().split('T')[0];
  
  const fullPrompt = `Você é um consultor financeiro especialista em finanças pessoais. 
Pergunta: ${originalPrompt}`;

  const geminiPayload = {
    contents: [{ 
      role: "user",
      parts: [{text: fullPrompt}] 
    }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048
    }
  };

  try {
    console.log('[GEMINI-SIMPLE] Enviando requisição para Gemini...');
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });
    
    if (!response.ok) {
      const errText = await response.text();
      console.error('[GEMINI-SIMPLE] Erro da API Gemini:', errText);
      return res.status(response.status).json({ error: 'Gemini API error: ' + errText });
    }

    const data = await response.json();
    console.log('[GEMINI-SIMPLE] Resposta recebida da Gemini');

    let outputText = '';
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
      outputText = data.candidates[0].content.parts[0].text || "";
      console.log('[GEMINI-SIMPLE] Texto extraído, tamanho:', outputText.length);
    } else {
      outputText = 'Desculpe, não consegui obter uma resposta da IA no momento.';
    }

    console.log('[GEMINI-SIMPLE] Enviando resposta para cliente');
    return res.status(200).json({ resposta: outputText });

  } catch (error) {
    console.error('[GEMINI-SIMPLE] Erro na requisição:', error);
    return res.status(500).json({ error: 'Erro ao processar requisição: ' + error.message });
  }
}

module.exports = handler;
