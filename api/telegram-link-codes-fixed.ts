// API para gerenciar códigos de conexão do Telegram - VERSÃO CORRIGIDA
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Configuração Supabase com credenciais corretas
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://hlemutzuubhrkuhevsxo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsZW11dHp1dWJocmt1aGV2c3hvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzEzMzQ3MTcsImV4cCI6MjA0NjkxMDcxN30.pUaQVR-YwLo6r7_N8n4rZGDCqYeGfgFEhYpyB5YkbzI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🔗 API Telegram Link Codes:', req.method, req.url, req.body);

  try {
    if (req.method === 'POST') {
      return await handleGenerateCode(req, res);
    }
    
    if (req.method === 'GET') {
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

  console.log('📥 Dados recebidos:', { user_id, user_email, user_name });

  if (!user_id || !user_email) {
    console.log('❌ Dados obrigatórios faltando');
    return res.status(400).json({ error: 'user_id e user_email são obrigatórios' });
  }

  // Gerar código de 6 dígitos
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

  console.log('💾 Tentando salvar código:', codeData);

  // Primeiro, deletar códigos expirados do usuário
  try {
    await supabase
      .from('telegram_link_codes')
      .delete()
      .eq('user_id', user_id)
      .lt('expires_at', new Date().toISOString());
    
    console.log('🗑️ Códigos expirados removidos');
  } catch (cleanupError) {
    console.log('⚠️ Aviso ao limpar códigos:', cleanupError);
  }

  // Salvar novo código
  const { data, error } = await supabase
    .from('telegram_link_codes')
    .insert(codeData)
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao salvar código no Supabase:', error);
    return res.status(500).json({ 
      error: 'Erro ao salvar código',
      details: error.message,
      hint: error.hint || 'Verifique se a tabela telegram_link_codes existe'
    });
  }

  console.log('✅ Código salvo com sucesso:', data);

  return res.status(200).json({
    success: true,
    code: code,
    expires_in: 15 * 60, // 15 minutos em segundos
    expires_at: codeData.expires_at,
    message: 'Código gerado com sucesso'
  });
}

// Verificar código de conexão (usado pelo webhook do Telegram)
async function handleVerifyCode(req: VercelRequest, res: VercelResponse) {
  const { code } = req.query;

  console.log('🔍 Verificando código:', code);

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Código é obrigatório' });
  }

  // Buscar código válido (não expirado e não usado)
  const { data, error } = await supabase
    .from('telegram_link_codes')
    .select('*')
    .eq('code', code)
    .gt('expires_at', new Date().toISOString()) // Não expirado
    .is('used_at', null) // Não usado
    .single();

  if (error || !data) {
    console.log('❌ Código não encontrado ou inválido:', error);
    return res.status(404).json({ 
      success: false,
      error: 'Código inválido ou expirado',
      debug: error?.message || 'Código não encontrado'
    });
  }

  console.log('✅ Código válido encontrado:', data);

  return res.status(200).json({
    success: true,
    user_id: data.user_id,
    user_email: data.user_email,
    user_name: data.user_name,
    code: data.code,
    expires_at: data.expires_at,
    created_at: data.created_at
  });
}
