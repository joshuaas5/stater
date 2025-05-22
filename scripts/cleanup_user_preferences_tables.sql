-- Script para limpar tabelas duplicadas de user_preferences
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos listar todas as tabelas que contêm "user_preferences" no nome
-- para verificar quais tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE '%user_preferences%';

-- Agora, vamos verificar quantos registros existem em cada tabela
-- Substitua 'user_preferences' pelo nome exato da tabela se for diferente
SELECT COUNT(*) FROM user_preferences;

-- Se existirem duas tabelas com o mesmo nome, vamos manter apenas uma
-- Primeiro, vamos renomear a tabela atual para um nome temporário
ALTER TABLE IF EXISTS user_preferences RENAME TO user_preferences_old;

-- Agora, vamos criar uma nova tabela com a estrutura correta
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

-- Configurar RLS (Row Level Security)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY user_preferences_select_policy
  ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY user_preferences_insert_policy
  ON user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_preferences_update_policy
  ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY user_preferences_delete_policy
  ON user_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Conceder permissões ao papel 'authenticated'
GRANT SELECT, INSERT, UPDATE, DELETE ON user_preferences TO authenticated;

-- Opcional: Se quiser migrar os dados da tabela antiga para a nova
-- Descomente as linhas abaixo
/*
INSERT INTO user_preferences (
  id, user_id, theme, currency, date_format, 
  notifications_bills_due_soon, notifications_large_transactions,
  created_at, updated_at
)
SELECT 
  id, user_id, theme, currency, date_format, 
  notifications_bills_due_soon, notifications_large_transactions,
  created_at, updated_at
FROM user_preferences_old
ON CONFLICT (user_id) 
DO UPDATE SET
  theme = EXCLUDED.theme,
  currency = EXCLUDED.currency,
  date_format = EXCLUDED.date_format,
  notifications_bills_due_soon = EXCLUDED.notifications_bills_due_soon,
  notifications_large_transactions = EXCLUDED.notifications_large_transactions,
  updated_at = EXCLUDED.updated_at;

-- Depois de migrar os dados, você pode remover a tabela antiga
DROP TABLE user_preferences_old;
*/
