// API simplificada para teste de OCR
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AIzaSyDTTPO0otruHVzh7bXsi7MCyG674P03758";

const SIMPLE_PROMPT = `
Analise esta imagem e extraia informações financeiras.

Retorne APENAS um JSON válido no formato:
{
  "documentType": "outros",
  "confidence": 0.8,
  "shouldGroup": false,
  "transactions": [
    {
      "description": "Descrição do item",
      "amount": 100.50,
      "date": "2025-06-13",
      "category": "outros",
      "type": "expense",
      "confidence": 0.9
    }
  ],
  "summary": {
    "totalAmount": 100.50,
    "itemCount": 1,
    "establishment": "Local"
  }
}
`;

export default async function handler(req: any, res: any) {
  console.log('[GEMINI_VISION_SIMPLE] Iniciando...');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { imageBase64 } = req.body;
    
    console.log('[GEMINI_VISION_SIMPLE] Imagem recebida:', !!imageBase64);
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Imagem não fornecida' });
    }

    if (!GEMINI_API_KEY) {
      console.error('[GEMINI_VISION_SIMPLE] API Key não encontrada');
      return res.status(500).json({ error: 'API não configurada' });
    }

    console.log('[GEMINI_VISION_SIMPLE] Chamando Gemini API...');

    const payload = {
      contents: [{
        parts: [
          { text: SIMPLE_PROMPT },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageBase64
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    console.log('[GEMINI_VISION_SIMPLE] Status resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GEMINI_VISION_SIMPLE] Erro Gemini:', errorText);
      return res.status(500).json({ 
        error: 'Erro na API Gemini',
        details: errorText 
      });
    }    const data = await response.json() as any;
    console.log('[GEMINI_VISION_SIMPLE] Resposta recebida');

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return res.status(500).json({ error: 'Resposta inválida da IA' });
    }

    const responseText = data.candidates[0].content.parts[0].text;
    console.log('[GEMINI_VISION_SIMPLE] Texto:', responseText.substring(0, 200));

    // Parse JSON
    let result;
    try {
      const cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      result = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('[GEMINI_VISION_SIMPLE] Erro parse:', parseError);
      return res.status(500).json({ 
        error: 'Erro ao interpretar resposta',
        rawResponse: responseText
      });
    }

    console.log('[GEMINI_VISION_SIMPLE] Sucesso!');
    
    return res.status(200).json({
      success: true,
      data: result,
      metadata: {
        processedAt: new Date().toISOString(),
        tokensUsed: data.usageMetadata?.totalTokenCount || 0
      }
    });

  } catch (error: any) {
    console.error('[GEMINI_VISION_SIMPLE] Erro:', error);
    return res.status(500).json({ 
      error: 'Erro interno',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
