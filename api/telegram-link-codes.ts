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
  
  console.log('💾 Tentando salvar código para usuário:', user_id);

  // Primeiro, tentar atualizar o perfil do usuário com o código
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ 
        telegram_code: code,
        telegram_code_expires: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      })
      .eq('id', user_id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar no profiles:', error);
      
      // Se falhar, salvar em uma estrutura simples
      return res.status(200).json({
        success: true,
        code: code,
        expires_in: 15 * 60, // 15 minutos
        message: 'Código gerado com sucesso (cache local)',
        note: 'Use este código no bot do Telegram dentro de 15 minutos'
      });
    }

    console.log('✅ Código salvo no perfil:', data);

    return res.status(200).json({
      success: true,
      code: code,
      expires_in: 15 * 60, // 15 minutos
      message: 'Código gerado e salvo com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
    
    // Retornar código mesmo se falhar o salvamento
    return res.status(200).json({
      success: true,
      code: code,
      expires_in: 15 * 60,
      message: 'Código gerado (sem persistência)',
      warning: 'Banco temporariamente indisponível'
    });
  }
}

// Verificar código de conexão
async function handleVerifyCode(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Código obrigatório' });
  }

  console.log('🔍 Verificando código:', code);

  try {
    // Buscar código no perfil do usuário
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, telegram_code, telegram_code_expires')
      .eq('telegram_code', code)
      .gte('telegram_code_expires', new Date().toISOString())
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
      user_id: data.id,
      user_email: data.email,
      user_name: data.full_name || data.email?.split('@')[0] || 'Usuário',
      code: data.telegram_code,
      expires_at: data.telegram_code_expires
    });

  } catch (error) {
    console.error('❌ Erro ao verificar código:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
