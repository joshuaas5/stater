// API simplificada para teste - sem Supabase
export default async function handler(req: any, res: any) {
  console.log('🧪 API telegram-codes-simple-test chamada:', {
    method: req.method,
    query: req.query,
    body: req.body,
    timestamp: new Date().toISOString()
  });

  try {
    if (req.method === 'POST') {
      // Simular geração de código sem banco de dados
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      
      console.log('✅ Código simulado gerado:', newCode);
      
      return res.status(200).json({
        success: true,
        code: newCode,
        expiresAt: expiresAt.toISOString(),
        message: 'Código gerado (simulação - sem banco)',
        timestamp: new Date().toISOString()
      });
    }
    
    return res.status(405).json({ error: 'Método não permitido' });
    
  } catch (error) {
    console.error('❌ Erro na API de teste:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
