// Teste simples para API gemini-vision
export default async function handler(req: any, res: any) {
  console.log('[TEST] API gemini-vision recebida');
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Log dos dados recebidos
    console.log('[TEST] Headers:', JSON.stringify(req.headers, null, 2));
    console.log('[TEST] Body keys:', Object.keys(req.body || {}));
    
    return res.status(200).json({ 
      success: true,
      message: 'API está funcionando',
      received: {
        method: req.method,
        hasAuth: !!req.headers.authorization,
        hasImageBase64: !!req.body?.imageBase64,
        bodyKeys: Object.keys(req.body || {})
      }
    });
    
  } catch (error: any) {
    console.error('[TEST] Erro:', error);
    return res.status(500).json({ 
      error: 'Erro no teste',
      message: error.message 
    });
  }
}
