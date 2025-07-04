-- Migração para adicionar coluna auth_provider na tabela profiles
-- Execute no Supabase SQL Editor

-- Adicionar coluna auth_provider se não existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'email';

-- Atualizar registros existentes que vieram do Google
UPDATE profiles 
SET auth_provider = 'google' 
WHERE auth_provider IS NULL 
AND id IN (
  SELECT id 
  FROM auth.users 
  WHERE app_metadata->>'provider' = 'google'
);

-- Atualizar registros existentes que vieram do email
UPDATE profiles 
SET auth_provider = 'email' 
WHERE auth_provider IS NULL 
AND id IN (
  SELECT id 
  FROM auth.users 
  WHERE app_metadata->>'provider' = 'email' OR app_metadata->>'provider' IS NULL
);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON profiles(auth_provider);

-- Comentários para documentação
COMMENT ON COLUMN profiles.auth_provider IS 'Método de autenticação usado: email, google, etc.';
