import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('🔧 [HELLO TEST] API chamada');
    
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Teste básico sem dependências
    const result = {
      success: true,
      message: 'Hello World Test API',
      timestamp: new Date().toISOString(),
      method: req.method,
      headers: req.headers,
      body: req.body
    };
    
    console.log('✅ [HELLO TEST] Retornando:', result);
    
    return res.status(200).json(result);
    
  } catch (error: any) {
    console.error('❌ [HELLO TEST] Erro:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Hello Test API Error',
      message: error?.message || 'Erro desconhecido',
      stack: error?.stack
    });
  }
}
