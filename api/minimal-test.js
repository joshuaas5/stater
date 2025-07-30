export default function handler(req, res) {
  try {
    console.log('🔧 [MINIMAL] API básica chamada');
    
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Resposta básica
    const result = {
      success: true,
      message: 'Minimal API Test',
      timestamp: new Date().toISOString(),
      method: req.method
    };
    
    console.log('✅ [MINIMAL] Retornando:', result);
    
    return res.status(200).json(result);
    
  } catch (error) {
    console.error('❌ [MINIMAL] Erro:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Minimal API Error',
      message: error?.message || 'Erro desconhecido'
    });
  }
}
