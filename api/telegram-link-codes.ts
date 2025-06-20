// API para gerenciar códigos de conexão do Telegram
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './supabase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🔗 API Telegram Link Codes:', req.method, req.url);

  try {
    if (req.method === 'POST') {
      // Gerar e salvar código de conexão
      return await handleGenerateCode(req, res);
    }
    
    if (req.method === 'GET') {
      // Verificar código de conexão
      return await handleVerifyCode(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('❌ Erro na API telegram-link-codes:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

// Gerar código de conexão
async function handleGenerateCode(req: VercelRequest, res: VercelResponse) {
  const { user_id, user_email, user_name } = req.body;

  if (!user_id || !user_email) {
    return res.status(400).json({ error: 'Dados do usuário obrigatórios' });
  }

  // Gerar código único de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  const codeData = {
    code: code,
    user_id: user_id,
    user_email: user_email,
    user_name: user_name || user_email.split('@')[0] || 'Usuário',
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutos
    created_at: new Date().toISOString(),
    used_at: null
  };

  console.log('💾 Salvando código no Supabase:', codeData);

  const { data, error } = await supabaseAdmin
    .from('telegram_link_codes')
    .insert(codeData)
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao salvar código:', error);
    return res.status(500).json({ 
      error: 'Erro ao salvar código',
      details: error.message 
    });
  }

  console.log('✅ Código salvo com sucesso:', data);

  return res.status(200).json({
    success: true,
    code: code,
    expires_in: 15 * 60, // 15 minutos
    message: 'Código gerado com sucesso'
  });
}

// Verificar código de conexão
async function handleVerifyCode(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Código obrigatório' });
  }

  console.log('🔍 Verificando código:', code);

  const { data, error } = await supabaseAdmin
    .from('telegram_link_codes')
    .select('*')
    .eq('code', code)
    .gte('expires_at', new Date().toISOString())
    .is('used_at', null)
    .single();

  if (error || !data) {
    console.log('❌ Código não encontrado ou expirado:', error);
    return res.status(404).json({ 
      success: false,
      error: 'Código inválido ou expirado' 
    });
  }

  console.log('✅ Código válido encontrado:', data);

  return res.status(200).json({
    success: true,
    user_id: data.user_id,
    user_email: data.user_email,
    user_name: data.user_name,
    code: data.code,
    expires_at: data.expires_at
  });
}
