// API simplificada para códigos de conexão do Telegram
import { VercelRequest, VercelResponse } from '@vercel/node';

// Cache em memória para códigos (temporário)
const codeCache = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🔗 API Telegram Connection:', req.method, req.url);

  try {
    if (req.method === 'POST') {
      // Gerar código de conexão
      const { user_id, user_email, user_name } = req.body;

      if (!user_id || !user_email) {
        return res.status(400).json({ error: 'Dados do usuário obrigatórios' });
      }

      // Gerar código único de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Salvar no cache por 15 minutos
      const expiresAt = Date.now() + (15 * 60 * 1000);
      codeCache.set(code, {
        user_id,
        user_email,
        user_name: user_name || user_email.split('@')[0] || 'Usuário',
        expires_at: expiresAt,
        created_at: Date.now()
      });

      console.log('✅ Código gerado e armazenado:', code);

      return res.status(200).json({
        success: true,
        code: code,
        expires_in: 15 * 60, // 15 minutos
        message: 'Código gerado com sucesso'
      });
    }
    
    if (req.method === 'GET') {
      // Verificar código de conexão
      const { code } = req.query;

      if (!code) {
        return res.status(400).json({ error: 'Código obrigatório' });
      }

      const codeData = codeCache.get(code as string);
      
      if (!codeData || codeData.expires_at < Date.now()) {
        // Remover código expirado
        if (codeData) {
          codeCache.delete(code as string);
        }
        
        return res.status(404).json({ 
          success: false,
          error: 'Código inválido ou expirado' 
        });
      }

      console.log('✅ Código válido encontrado:', code);

      return res.status(200).json({
        success: true,
        user_id: codeData.user_id,
        user_email: codeData.user_email,
        user_name: codeData.user_name,
        code: code,
        expires_at: new Date(codeData.expires_at).toISOString()
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Erro na API telegram-connection:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Limpeza automática de códigos expirados
setInterval(() => {
  const now = Date.now();
  for (const [code, data] of codeCache.entries()) {
    if (data.expires_at < now) {
      codeCache.delete(code);
      console.log('🧹 Código expirado removido:', code);
    }
  }
}, 5 * 60 * 1000); // Limpar a cada 5 minutos
