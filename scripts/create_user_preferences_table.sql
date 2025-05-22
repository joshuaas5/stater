-- Script para criar a tabela user_preferences no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar a tabela user_preferences se ela não existir
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(10) NOT NULL DEFAULT 'system',
  currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
  date_format VARCHAR(20) NOT NULL DEFAULT 'dd/MM/yyyy',
  notifications_bills_due_soon BOOLEAN NOT NULL DEFAULT true,
  notifications_large_transactions BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Comentários da tabela
COMMENT ON TABLE user_preferences IS 'Tabela para armazenar as preferências dos usuários';
COMMENT ON COLUMN user_preferences.id IS 'ID único da preferência';
COMMENT ON COLUMN user_preferences.user_id IS 'ID do usuário (referência à tabela auth.users)';
COMMENT ON COLUMN user_preferences.theme IS 'Tema preferido do usuário (light, dark, system)';
COMMENT ON COLUMN user_preferences.currency IS 'Moeda preferida do usuário (BRL, USD, EUR)';
COMMENT ON COLUMN user_preferences.date_format IS 'Formato de data preferido do usuário';
COMMENT ON COLUMN user_preferences.notifications_bills_due_soon IS 'Receber notificações de contas a vencer em breve';
COMMENT ON COLUMN user_preferences.notifications_large_transactions IS 'Receber notificações de transações de grande valor';

-- Configurar RLS (Row Level Security)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
-- Política para SELECT: usuários só podem ver suas próprias preferências
CREATE POLICY user_preferences_select_policy
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para INSERT: usuários só podem inserir suas próprias preferências
CREATE POLICY user_preferences_insert_policy
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários só podem atualizar suas próprias preferências
CREATE POLICY user_preferences_update_policy
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para DELETE: usuários só podem excluir suas próprias preferências
CREATE POLICY user_preferences_delete_policy
  ON user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Conceder permissões ao papel 'authenticated'
GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences TO authenticated;
