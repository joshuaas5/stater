// API para conectar conta via método simples - Compatibilidade com Dashboard
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './supabase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('🔗 API Connect Simple:', { method: req.method, query: req.query, body: req.body });

  // Lidar com GET (verificação de conexão)
  if (req.method === 'GET') {
    const { chatId } = req.query;
    
    if (!chatId) {
      return res.status(400).json({ 
        error: 'Chat ID é obrigatório',
        success: false 
      });
    }

    console.log('🔍 Verificando conexão para chat:', chatId);

    try {
      // Tentar consultar a tabela
      console.log('🔍 Tentando consultar telegram_users...');
      
      const { data: connection, error } = await supabaseAdmin
        .from('telegram_users')
        .select('user_id, user_email, user_name, linked_at, is_active')
        .eq('telegram_chat_id', String(chatId))
        .eq('is_active', true)
        .limit(1);

      console.log('📊 Resultado da consulta:', { data: connection, error });

      if (error) {
        console.error('❌ Erro na consulta Supabase:', error);
        
        // Se a tabela não existe, retornar erro específico
        if (error.message.includes('does not exist') || error.message.includes('relation')) {
          return res.status(500).json({
            success: false,
            connected: false,
            error: 'Tabela telegram_users não existe',
            details: 'Execute o SQL de setup: supabase-telegram-setup.sql',
            tableError: true
          });
        }
        
        return res.status(500).json({
          success: false,
          connected: false,
          error: 'Erro ao consultar banco de dados',
          details: error.message
        });
      }

      if (!connection || connection.length === 0) {
        console.log('❌ Conexão não encontrada para chat:', chatId);
        return res.status(200).json({
          success: false,
          connected: false,
          message: 'Usuário não conectado'
        });
      }

      console.log('✅ Conexão encontrada:', connection[0]);
      return res.status(200).json({
        success: true,
        connected: true,
        data: connection[0],
        message: 'Usuário conectado'
      });

    } catch (error: any) {
      console.error('❌ Erro geral ao verificar conexão:', error);
      return res.status(500).json({
        success: false,
        connected: false,
        error: 'Erro interno do servidor',
        details: error.message,
        stack: error.stack
      });
    }
  }

  // Lidar com POST (criar conexão)
  if (req.method === 'POST') {
    const { chatId, userId, userEmail, userName } = req.body;

    if (!chatId || !userId) {
      return res.status(400).json({ 
        error: 'Chat ID e User ID são obrigatórios',
        details: { chatId: !!chatId, userId: !!userId }
      });
    }

    console.log('💾 Salvando conexão simples:', { chatId, userId, userEmail, userName });

    try {
      // Tentar inserir diretamente (upsert)
      const { data: newConnection, error: insertError } = await supabaseAdmin
        .from('telegram_users')
        .upsert([{
          telegram_chat_id: String(chatId),
          user_id: userId,
          user_email: userEmail || 'no-email',
          user_name: userName || 'no-name',
          linked_at: new Date().toISOString(),
          is_active: true
        }], {
          onConflict: 'telegram_chat_id'
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao salvar conexão:', insertError);
        
        // Se a tabela não existe
        if (insertError.message.includes('does not exist') || insertError.message.includes('relation')) {
          return res.status(500).json({
            error: 'Tabela telegram_users não existe no banco de dados',
            details: 'Execute o SQL de setup primeiro',
            suggestion: 'Execute supabase-telegram-setup.sql no Supabase',
            tableError: true
          });
        }
        
        return res.status(500).json({
          error: 'Erro ao salvar conexão',
          details: insertError.message
        });
      }

      console.log('✅ Conexão salva com sucesso:', newConnection);

      return res.status(200).json({
        success: true,
        message: 'Conexão salva com sucesso',
        chatId,
        userId,
        action: 'upserted',
        connection: newConnection
      });

    } catch (error: any) {
      console.error('❌ Erro geral ao salvar conexão:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message,
        stack: error.stack
      });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
