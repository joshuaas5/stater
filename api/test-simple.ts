export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    console.log('🔧 [SIMPLE DEBUG] API executando...');
    
    // Teste básico sem Supabase
    return res.status(200).json({ 
      success: true, 
      message: 'API funcionando',
      method: req.method,
      body: req.body,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ [SIMPLE DEBUG] Erro:', error);
    return res.status(500).json({ 
      error: 'Erro na API',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
