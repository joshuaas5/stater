// API para conectar Telegram com Stater - CORRIGIDA
import { supabaseAdmin } from './supabase-admin';

export default async function handler(req: any, res: any) {
  console.log('🔗 API telegram-connect-simple chamada');
  console.log('🔗 Método:', req.method);
  console.log('🔗 Body:', req.body);

  // Apenas POST permitido
  if (req.method !== 'POST') {
    console.log('❌ Método não permitido:', req.method);
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { chatId, userId, userEmail, userName } = req.body;

    // Validar dados obrigatórios
    if (!chatId || !userId) {
      return res.status(400).json({ 
        error: 'chatId e userId são obrigatórios' 
      });
    }

    console.log('🔗 Conectando Telegram:', { chatId, userId, userEmail, userName });

    // Verificar se o chat_id já está em uso
    const { data: existingConnection } = await supabaseAdmin
      .from('telegram_users')
      .select('*')
      .eq('telegram_chat_id', chatId)
      .single();

    if (existingConnection) {
      if (existingConnection.user_id === userId) {
        return res.status(200).json({
          success: true,
          message: 'Telegram já conectado a esta conta',
          connection: existingConnection
        });
      } else {
        return res.status(400).json({
          error: 'Este Telegram já está conectado a outra conta'
        });
      }
    }

    // Verificar se o usuário já tem outro Telegram conectado
    const { data: userConnection } = await supabaseAdmin
      .from('telegram_users')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (userConnection) {
      // Atualizar conexão existente
      const { data, error } = await supabaseAdmin
        .from('telegram_users')
        .update({
          telegram_chat_id: chatId,
          linked_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar conexão:', error);
        return res.status(500).json({ error: 'Erro ao atualizar conexão' });
      }

      console.log('✅ Conexão atualizada:', data);
      return res.status(200).json({
        success: true,
        message: 'Telegram reconectado com sucesso!',
        connection: data
      });
    } else {
      // Criar nova conexão
      const { data, error } = await supabaseAdmin
        .from('telegram_users')
        .insert([{
          user_id: userId,
          telegram_chat_id: chatId,
          user_email: userEmail,
          user_name: userName,
          linked_at: new Date().toISOString(),
          is_active: true
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao criar conexão:', error);
        console.error('❌ Detalhes do erro:', error.message);
        console.error('❌ Dados que causaram erro:', { userId, chatId, userEmail, userName });
        return res.status(500).json({ error: 'Erro ao conectar Telegram' });
      }

      console.log('✅ Nova conexão criada:', data);
      return res.status(200).json({
        success: true,
        message: 'Telegram conectado com sucesso!',
        connection: data
      });
    }

  } catch (error) {
    console.error('❌ Erro crítico na API:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
