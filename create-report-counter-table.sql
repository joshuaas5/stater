-- Script para criar tabela de contador de relatórios
-- Execute este script no Supabase SQL Editor

-- Criar tabela para contador de reports do usuário
CREATE TABLE IF NOT EXISTS user_report_count (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE user_report_count ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios contadores
CREATE POLICY "Users can view own report count" ON user_report_count
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários atualizem apenas seus próprios contadores
CREATE POLICY "Users can update own report count" ON user_report_count
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios contadores
CREATE POLICY "Users can insert own report count" ON user_report_count
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_report_count_user_id ON user_report_count(user_id);

-- Comentário da tabela
COMMENT ON TABLE user_report_count IS 'Contador de relatórios por usuário para sistema de reward ads';
COMMENT ON COLUMN user_report_count.user_id IS 'ID do usuário';
COMMENT ON COLUMN user_report_count.report_count IS 'Número total de relatórios baixados pelo usuário';
COMMENT ON COLUMN user_report_count.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN user_report_count.updated_at IS 'Data da última atualização';
