// API TEMPORÁRIA para conectar via Chat ID sem SERVICE_ROLE_KEY
import { VercelRequest, VercelResponse } from '@vercel/node';

// Sistema em memória temporário para conexões
const connectionsMemory = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🔗 API Connect Simple:', req.method, req.body);

  try {
    if (req.method === 'POST') {
      return await handleConnect(req, res);
    }
    
    if (req.method === 'GET') {
      return await handleCheck(req, res);
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    console.error('❌ Erro na API:', error);
    return res.status(500).json({ 
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Conectar conta (salvar em memória)
async function handleConnect(req: VercelRequest, res: VercelResponse) {
  const { chatId, userId, userEmail, userName } = req.body;

  if (!chatId || !userId) {
    return res.status(400).json({ 
      error: 'Chat ID e User ID são obrigatórios',
      details: { chatId: !!chatId, userId: !!userId }
    });
  }

  console.log('💾 Salvando conexão em memória:', { chatId, userId, userEmail, userName });

  // Salvar conexão em memória
  const connectionData = {
    telegram_chat_id: chatId.toString(),
    user_id: userId,
    user_email: userEmail || '',
    user_name: userName || 'Usuário',
    linked_at: new Date().toISOString(),
    is_active: true
  };

  // Usar chatId como chave
  connectionsMemory.set(chatId.toString(), connectionData);

  console.log('✅ Conexão salva em memória!');
  console.log('📊 Conexões ativas:', connectionsMemory.size);

  return res.status(200).json({
    success: true,
    message: 'Conta conectada com sucesso! (Sistema temporário ativo)',
    data: {
      chatId: chatId,
      userId: userId,
      linkedAt: connectionData.linked_at,
      storage: 'memory',
      active_connections: connectionsMemory.size
    }
  });
}

// Verificar se chat está conectado
async function handleCheck(req: VercelRequest, res: VercelResponse) {
  const { chatId } = req.query;

  if (!chatId || typeof chatId !== 'string') {
    return res.status(400).json({ error: 'Chat ID obrigatório' });
  }

  const connectionData = connectionsMemory.get(chatId);

  if (!connectionData) {
    return res.status(404).json({ 
      success: false,
      error: 'Conexão não encontrada',
      connected: false
    });
  }

  return res.status(200).json({
    success: true,
    connected: true,
    data: connectionData,
    storage: 'memory'
  });
}
