-- Criar tabela para contagem de transações dos usuários
-- Esta tabela é usada pelo sistema de reward ads

CREATE TABLE IF NOT EXISTS user_transaction_count (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Índices para performance
  CONSTRAINT unique_user_transaction_count UNIQUE(user_id)
);

-- Criar índice para buscas rápidas por user_id
CREATE INDEX IF NOT EXISTS idx_user_transaction_count_user_id ON user_transaction_count(user_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_transaction_count ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houverem
DROP POLICY IF EXISTS "Users can view their own transaction count" ON user_transaction_count;
DROP POLICY IF EXISTS "Users can update their own transaction count" ON user_transaction_count;
DROP POLICY IF EXISTS "Users can insert their own transaction count" ON user_transaction_count;

-- Política RLS: Usuários podem ver/modificar apenas seus próprios registros
CREATE POLICY "Users can view their own transaction count" ON user_transaction_count
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own transaction count" ON user_transaction_count
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transaction count" ON user_transaction_count
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover trigger existente se houver e criar novamente
DROP TRIGGER IF EXISTS update_user_transaction_count_updated_at ON user_transaction_count;

CREATE TRIGGER update_user_transaction_count_updated_at 
    BEFORE UPDATE ON user_transaction_count 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE user_transaction_count IS 'Contagem de transações por usuário para sistema de reward ads';
COMMENT ON COLUMN user_transaction_count.user_id IS 'ID do usuário (referência para auth.users)';
COMMENT ON COLUMN user_transaction_count.transaction_count IS 'Número total de transações criadas pelo usuário';
COMMENT ON COLUMN user_transaction_count.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN user_transaction_count.updated_at IS 'Data da última atualização do contador';
