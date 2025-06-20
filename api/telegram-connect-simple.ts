// API para conectar conta via método simples - Compatibilidade com Dashboard
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

  console.log('🔗 API Connect Simple:', req.body);

  try {
    const { chatId, userId, userEmail, userName } = req.body;

    if (!chatId || !userId) {
      return res.status(400).json({ 
        error: 'Chat ID e User ID são obrigatórios',
        details: { chatId: !!chatId, userId: !!userId }
      });
    }

    console.log('💾 Salvando conexão simples:', { chatId, userId, userEmail, userName });

    // Verificar se já existe uma conexão para este chat ID
    const { data: existingConnection, error: selectError } = await supabaseAdmin
      .from('telegram_users')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .single();

    if (existingConnection) {
      console.log('✅ Conexão já existe, atualizando...');
      
      // Atualizar conexão existente
      const { error: updateError } = await supabaseAdmin
        .from('telegram_users')
        .update({
          user_id: userId,
          user_email: userEmail,
          user_name: userName,
          connected_at: new Date().toISOString(),
          is_active: true
        })
        .eq('telegram_chat_id', chatId);

      if (updateError) {
        console.error('❌ Erro ao atualizar conexão:', updateError);
        return res.status(500).json({
          error: 'Erro ao atualizar conexão',
          details: updateError.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Conexão atualizada com sucesso',
        chatId,
        userId,
        action: 'updated'
      });
    }

    // Criar nova conexão
    const { data: newConnection, error: insertError } = await supabaseAdmin
      .from('telegram_users')
      .insert([{
        telegram_chat_id: chatId,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        connected_at: new Date().toISOString(),
        is_active: true
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar conexão:', insertError);
      return res.status(500).json({
        error: 'Erro ao criar conexão',
        details: insertError.message
      });
    }

    console.log('✅ Conexão criada com sucesso:', newConnection);

    return res.status(200).json({
      success: true,
      message: 'Conexão criada com sucesso',
      chatId,
      userId,
      action: 'created',
      connection: newConnection
    });

  } catch (error: any) {
    console.error('❌ Erro na API connect simple:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}
