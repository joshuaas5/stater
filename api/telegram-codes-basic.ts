// API básica para debug - sem banco de dados
export default async function handler(req: any, res: any) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  console.log('🔥 TELEGRAM CODES BASIC - Método:', req.method);
  console.log('🔥 Body recebido:', req.body);

  try {
    if (req.method === 'POST') {
      // Simular geração de código
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      console.log('✅ Código gerado básico:', code);
      
      return res.status(200).json({
        success: true,
        code: code,
        message: 'API básica funcionando',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(405).json({ error: 'Método não permitido' });
    
  } catch (error) {
    console.error('❌ Erro na API básica:', error);
    return res.status(500).json({ 
      error: 'Erro na API básica',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
