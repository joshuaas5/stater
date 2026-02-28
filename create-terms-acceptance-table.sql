-- Tabela para armazenar o aceite dos termos de uso pelos usuários
CREATE TABLE IF NOT EXISTS user_terms_acceptance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  version VARCHAR(10) NOT NULL DEFAULT '1.0',
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que cada usuário só pode ter um registro de aceite
  UNIQUE(user_id)
);

-- RLS (Row Level Security) para garantir que usuários só vejam seus próprios dados
ALTER TABLE user_terms_acceptance ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios dados
CREATE POLICY "Users can view their own terms acceptance" ON user_terms_acceptance
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram/atualizem apenas seus próprios dados
CREATE POLICY "Users can insert/update their own terms acceptance" ON user_terms_acceptance
  FOR ALL USING (auth.uid() = user_id);

-- Índice para melhorar performance de consultas por user_id
CREATE INDEX IF NOT EXISTS idx_user_terms_acceptance_user_id ON user_terms_acceptance(user_id);

-- Função para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_terms_acceptance_updated_at 
  BEFORE UPDATE ON user_terms_acceptance 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
