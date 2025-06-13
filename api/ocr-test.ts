// API de teste básica para OCR
export default async function handler(req: any, res: any) {
  console.log('[OCR_TEST] Iniciando handler');
  
  // Cors headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    console.log('[OCR_TEST] Método não permitido:', req.method);
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('[OCR_TEST] Body recebido:', !!req.body);
    console.log('[OCR_TEST] Keys do body:', Object.keys(req.body || {}));
    
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      console.log('[OCR_TEST] Imagem não fornecida');
      return res.status(400).json({ error: 'Imagem não fornecida' });
    }

    console.log('[OCR_TEST] Imagem recebida, tamanho:', imageBase64.length);

    // Simular processamento por enquanto
    const mockResult = {
      documentType: "recibo",
      confidence: 0.85,
      shouldGroup: false,
      transactions: [
        {
          description: "Compra teste - documento processado",
          amount: 50.00,
          date: new Date().toISOString().split('T')[0],
          category: "outros",
          type: "expense",
          confidence: 0.9
        }
      ],
      summary: {
        totalAmount: 50.00,
        itemCount: 1,
        establishment: "Estabelecimento Teste"
      }
    };

    console.log('[OCR_TEST] Retornando resultado simulado');
    
    return res.status(200).json({
      success: true,
      data: mockResult,
      metadata: {
        processedAt: new Date().toISOString(),
        tokensUsed: 0,
        note: "Resultado simulado - API funcionando"
      }
    });

  } catch (error: any) {
    console.error('[OCR_TEST] Erro:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message,
      stack: error.stack
    });
  }
}
