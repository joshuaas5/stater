// API endpoint para receber notificações de sincronização do Telegram
export default async function handler(req: any, res: any) {
  // Aceitar apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, transactionId, action, timestamp } = req.body;
    
    console.log('📢 [TELEGRAM SYNC] Notificação recebida:', {
      userId,
      transactionId,
      action,
      timestamp: new Date(timestamp).toISOString()
    });

    // Aqui poderíamos implementar logic adicional como:
    // - Notificar via WebSocket se estivesse implementado
    // - Atualizar cache
    // - Enviar push notifications
    
    // Por enquanto, apenas log e retorno de sucesso
    res.status(200).json({ 
      success: true, 
      message: 'Sync notification received',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('❌ [TELEGRAM SYNC] Erro ao processar notificação:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to process sync notification'
    });
  }
}
