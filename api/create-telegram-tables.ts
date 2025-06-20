// API para criar tabelas do Telegram automaticamente
import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseAdmin } from './supabase-admin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  console.log('🛠️ Criando tabelas do Telegram...');

  try {
    // SQL para criar as tabelas
    const createTablesSQL = `
      -- Criar tabela telegram_users
      CREATE TABLE IF NOT EXISTS public.telegram_users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        telegram_chat_id TEXT UNIQUE NOT NULL,
        user_id UUID NOT NULL,
        user_email TEXT NOT NULL,
        user_name TEXT NOT NULL,
        linked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE
      );

      -- Criar tabela telegram_link_codes
      CREATE TABLE IF NOT EXISTS public.telegram_link_codes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        user_id UUID NOT NULL,
        user_email TEXT NOT NULL,
        user_name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used_at TIMESTAMP WITH TIME ZONE NULL
      );

      -- Índices para performance
      CREATE INDEX IF NOT EXISTS idx_telegram_users_chat_id ON public.telegram_users(telegram_chat_id);
      CREATE INDEX IF NOT EXISTS idx_telegram_users_user_id ON public.telegram_users(user_id);
      CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_code ON public.telegram_link_codes(code);
    `;

    // Executar SQL usando supabaseAdmin
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql_query: createTablesSQL });

    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      
      // Tentar método alternativo - criar uma por vez
      console.log('🔄 Tentando método alternativo...');
      
      // Verificar se a tabela existe consultando
      const { data: tables, error: checkError } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['telegram_users', 'telegram_link_codes']);

      console.log('📋 Tabelas existentes:', tables);
      
      if (checkError) {
        console.error('❌ Erro ao verificar tabelas:', checkError);
        return res.status(500).json({
          error: 'Erro ao verificar tabelas existentes',
          details: checkError.message,
          suggestion: 'Execute o SQL manualmente no painel do Supabase'
        });
      }

      const existingTables = tables?.map(t => t.table_name) || [];
      
      return res.status(200).json({
        success: false,
        message: 'SQL direto falhou, mas sistema pode funcionar',
        existingTables,
        suggestion: 'Execute create-telegram-tables.sql manualmente no Supabase'
      });
    }

    // Verificar se as tabelas foram criadas
    const { data: verification, error: verifyError } = await supabaseAdmin
      .from('telegram_users')
      .select('id')
      .limit(1);

    if (verifyError) {
      console.log('⚠️ Tabela ainda não existe:', verifyError.message);
      return res.status(500).json({
        error: 'Tabelas não foram criadas corretamente',
        details: verifyError.message,
        action: 'Execute o SQL manualmente no painel do Supabase',
        sql: 'Veja create-telegram-tables.sql'
      });
    }

    console.log('✅ Tabelas criadas com sucesso!');

    return res.status(200).json({
      success: true,
      message: 'Tabelas do Telegram criadas com sucesso!',
      tables: ['telegram_users', 'telegram_link_codes'],
      status: 'ready'
    });

  } catch (error: any) {
    console.error('❌ Erro crítico:', error);
    return res.status(500).json({
      error: 'Erro interno ao criar tabelas',
      details: error.message,
      suggestion: 'Execute create-telegram-tables.sql manualmente no Supabase'
    });
  }
}
