-- Script para corrigir a estrutura da tabela user_preferences

-- Verificar se a tabela existe e dropar se necessu00e1rio
DROP TABLE IF EXISTS user_preferences;

-- Recriar a tabela com todas as colunas necessu00e1rias
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  currency TEXT DEFAULT 'BRL',
  date_format TEXT DEFAULT 'DD/MM/YYYY',
  notifications_bills_due_soon BOOLEAN DEFAULT TRUE,
  notifications_bills_overdue BOOLEAN DEFAULT TRUE,
  notifications_large_transactions BOOLEAN DEFAULT TRUE,
  notifications_weekly_email BOOLEAN DEFAULT TRUE,
  notifications_push BOOLEAN DEFAULT TRUE,
  notifications_in_app BOOLEAN DEFAULT TRUE,
  notifications_email BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Configurar Row Level Security (RLS)
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Criar polu00edticas de seguranu00e7a
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Conceder permissu00f5es ao papel 'authenticated'
GRANT ALL ON user_preferences TO authenticated;

-- Criar funu00e7u00e3o para atualizar o timestamp de atualizau00e7u00e3o
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar o timestamp automaticamente
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON user_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Inserir preferu00eancias padru00e3o para usuu00e1rios existentes que ainda nu00e3o tu00eam
INSERT INTO user_preferences (user_id, theme, currency, date_format, 
                            notifications_bills_due_soon, notifications_bills_overdue,
                            notifications_large_transactions, notifications_weekly_email,
                            notifications_push, notifications_in_app, notifications_email)
SELECT id, 'light', 'BRL', 'DD/MM/YYYY', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_preferences);
