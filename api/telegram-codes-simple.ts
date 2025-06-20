// API simplificada que funciona SEM tabela específica
import { VercelRequest, VercelResponse } from '@vercel/node';

// Sistema em memória temporário para desenvolvimento
const codesMemory = new Map();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🔗 API Telegram Codes Simple:', req.method, req.body);

  try {
    if (req.method === 'POST') {
      return await handleGenerateCode(req, res);
    }
    
    if (req.method === 'GET') {
      return await handleVerifyCode(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Erro na API:', error);
    return res.status(500).json({ 
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Gerar código (sem Supabase, usando memória)
async function handleGenerateCode(req: VercelRequest, res: VercelResponse) {
  const { user_id, user_email, user_name } = req.body;

  console.log('📥 Dados recebidos:', { user_id, user_email, user_name });

  if (!user_id || !user_email) {
    return res.status(400).json({ error: 'user_id e user_email obrigatórios' });
  }

  // Gerar código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Salvar em memória com expiração de 15 minutos
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const codeData = {
    code: code,
    user_id: user_id,
    user_email: user_email,
    user_name: user_name || user_email.split('@')[0] || 'Usuário',
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
    used_at: null
  };

  // Salvar no sistema temporário
  codesMemory.set(code, codeData);

  // Limpar códigos expirados (cleanup)
  for (const [key, value] of codesMemory.entries()) {
    if (new Date(value.expires_at) < new Date()) {
      codesMemory.delete(key);
    }
  }

  console.log('✅ Código salvo em memória:', codeData);
  console.log('📊 Códigos ativos:', codesMemory.size);

  return res.status(200).json({
    success: true,
    code: code,
    expires_in: 15 * 60,
    expires_at: codeData.expires_at,
    message: 'Código gerado com sucesso! (Sistema temporário ativo)',
    debug_info: {
      storage: 'memory',
      active_codes: codesMemory.size
    }
  });
}

// Verificar código (em memória)
async function handleVerifyCode(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;

  console.log('🔍 Verificando código:', code);
  console.log('📊 Códigos em memória:', Array.from(codesMemory.keys()));

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Código obrigatório' });
  }

  const codeData = codesMemory.get(code);

  if (!codeData) {
    console.log('❌ Código não encontrado na memória');
    return res.status(404).json({ 
      success: false,
      error: 'Código não encontrado',
      debug_info: {
        searched_code: code,
        available_codes: Array.from(codesMemory.keys()),
        total_codes: codesMemory.size
      }
    });
  }

  // Verificar se expirou
  if (new Date(codeData.expires_at) < new Date()) {
    console.log('❌ Código expirado');
    codesMemory.delete(code); // Remove código expirado
    return res.status(404).json({ 
      success: false,
      error: 'Código expirado'
    });
  }

  // Verificar se já foi usado
  if (codeData.used_at) {
    console.log('❌ Código já foi usado');
    return res.status(404).json({ 
      success: false,
      error: 'Código já foi usado'
    });
  }

  console.log('✅ Código válido encontrado:', codeData);

  return res.status(200).json({
    success: true,
    user_id: codeData.user_id,
    user_email: codeData.user_email,
    user_name: codeData.user_name,
    code: codeData.code,
    expires_at: codeData.expires_at,
    storage: 'memory'
  });
}
