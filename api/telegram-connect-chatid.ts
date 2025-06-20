// API para conectar conta via Chat ID - Método Simples
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './supabase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }
  console.log('🔗 API Connect Chat ID:', req.body);

  try {
    const { chatId, userId, userEmail, userName } = req.body;

    if (!chatId || !userId) {
      return res.status(400).json({ 
        error: 'Chat ID e User ID são obrigatórios',
        details: { chatId: !!chatId, userId: !!userId }
      });
    }

    console.log('💾 Salvando conexão:', { chatId, userId, userEmail, userName });

    // Verificar se temos as variáveis de ambiente necessárias
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada!');
      return res.status(500).json({
        error: 'Configuração do servidor incompleta',
        details: 'SUPABASE_SERVICE_ROLE_KEY não configurada no Vercel',
        hint: 'Configure a variável de ambiente SUPABASE_SERVICE_ROLE_KEY no painel do Vercel'
      });
    }

    // Verificar se a tabela existe, se não, tentar criar
    const { data: existingConnection, error: selectError } = await supabaseAdmin
      .from('telegram_users')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .single();

    console.log('🔍 Conexão existente:', { existingConnection, selectError });

    // Upsert a conexão
    const { data, error } = await supabaseAdmin
      .from('telegram_users')
      .upsert({
        telegram_chat_id: chatId.toString(),
        user_id: userId,
        user_email: userEmail || '',
        user_name: userName || 'Usuário',
        linked_at: new Date().toISOString(),
        is_active: true
      }, {
        onConflict: 'telegram_chat_id'
      });

    if (error) {
      console.error('❌ Erro ao salvar conexão:', error);
      return res.status(500).json({ 
        error: 'Erro ao conectar conta',
        details: error.message,
        hint: 'Verifique se a tabela telegram_users existe no Supabase'
      });
    }

    console.log('✅ Conexão salva com sucesso:', data);

    return res.status(200).json({
      success: true,
      message: 'Conta conectada com sucesso!',
      data: {
        chatId: chatId,
        userId: userId,
        linkedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Erro crítico na API:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
