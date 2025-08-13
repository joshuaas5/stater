-- Criar tabela para contador de transações do usuário
CREATE TABLE IF NOT EXISTS user_transaction_count (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE user_transaction_count ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios contadores
CREATE POLICY "Users can view own transaction count" ON user_transaction_count
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários atualizem apenas seus próprios contadores
CREATE POLICY "Users can update own transaction count" ON user_transaction_count
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios contadores
CREATE POLICY "Users can insert own transaction count" ON user_transaction_count
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_transaction_count_user_id ON user_transaction_count(user_id);

-- Comentário da tabela
COMMENT ON TABLE user_transaction_count IS 'Contador de transações por usuário para sistema de reward ads';
COMMENT ON COLUMN user_transaction_count.user_id IS 'ID do usuário';
COMMENT ON COLUMN user_transaction_count.transaction_count IS 'Número total de transações criadas pelo usuário';
COMMENT ON COLUMN user_transaction_count.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN user_transaction_count.updated_at IS 'Data da última atualização';

-- Criar tabela para contador de bills do usuário
CREATE TABLE IF NOT EXISTS user_bill_count (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE user_bill_count ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios contadores
CREATE POLICY "Users can view own bill count" ON user_bill_count
  FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários atualizem apenas seus próprios contadores
CREATE POLICY "Users can update own bill count" ON user_bill_count
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus próprios contadores
CREATE POLICY "Users can insert own bill count" ON user_bill_count
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_user_bill_count_user_id ON user_bill_count(user_id);

-- Comentário da tabela
COMMENT ON TABLE user_bill_count IS 'Contador de bills por usuário para sistema de reward ads';
COMMENT ON COLUMN user_bill_count.user_id IS 'ID do usuário';
COMMENT ON COLUMN user_bill_count.bill_count IS 'Número total de bills criadas pelo usuário';
COMMENT ON COLUMN user_bill_count.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN user_bill_count.updated_at IS 'Data da última atualização';

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
