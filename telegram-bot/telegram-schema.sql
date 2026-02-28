-- Schema adicional para integração com Telegram Bot

-- Tabela para códigos de vinculação Telegram
CREATE TABLE IF NOT EXISTS telegram_link_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NULL
);

-- Tabela para usuários vinculados ao Telegram
CREATE TABLE IF NOT EXISTS telegram_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_chat_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_email TEXT NOT NULL,
  user_name TEXT NOT NULL,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Políticas RLS para telegram_link_codes
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas seus próprios códigos" ON telegram_link_codes
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Usuários podem inserir seus próprios códigos" ON telegram_link_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Usuários podem atualizar apenas seus próprios códigos" ON telegram_link_codes
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas RLS para telegram_users
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver apenas suas próprias vinculações" ON telegram_users
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Usuários podem inserir suas próprias vinculações" ON telegram_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Usuários podem atualizar apenas suas próprias vinculações" ON telegram_users
  FOR UPDATE USING (auth.uid() = user_id);

-- Índices para performance
CREATE INDEX idx_telegram_link_codes_code ON telegram_link_codes(code);
CREATE INDEX idx_telegram_link_codes_user_id ON telegram_link_codes(user_id);
CREATE INDEX idx_telegram_users_chat_id ON telegram_users(telegram_chat_id);
CREATE INDEX idx_telegram_users_user_id ON telegram_users(user_id);
