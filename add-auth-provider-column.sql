-- Migração para criar tabela profiles e adicionar coluna auth_provider
-- Execute no Supabase SQL Editor

-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  auth_provider VARCHAR(20) DEFAULT 'email',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso (usuários só podem ver/editar seu próprio perfil)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Se a tabela já existir, adicionar coluna auth_provider se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='auth_provider') THEN
    ALTER TABLE profiles ADD COLUMN auth_provider VARCHAR(20) DEFAULT 'email';
  END IF;
END $$;

-- Atualizar registros existentes que vieram do Google
UPDATE profiles 
SET auth_provider = 'google' 
WHERE (auth_provider IS NULL OR auth_provider = 'email')
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

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON profiles(auth_provider);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Comentários para documentação
COMMENT ON TABLE profiles IS 'Perfis de usuários do Stater';
COMMENT ON COLUMN profiles.auth_provider IS 'Método de autenticação usado: email, google, etc.';
COMMENT ON COLUMN profiles.username IS 'Nome de usuário escolhido';
COMMENT ON COLUMN profiles.email IS 'Email do usuário (único)';
