-- Script para criar a tabela transactions no Supabase
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela transactions existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'transactions'
);

-- Criar a tabela transactions se ela não existir
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  category VARCHAR(100),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_day INTEGER,
  recurrence_frequency VARCHAR(20) CHECK (recurrence_frequency IN ('weekly', 'monthly', 'yearly')),
  is_paid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários da tabela
COMMENT ON TABLE transactions IS 'Tabela para armazenar as transações financeiras dos usuários';
COMMENT ON COLUMN transactions.id IS 'ID único da transação';
COMMENT ON COLUMN transactions.user_id IS 'ID do usuário (referência à tabela auth.users)';
COMMENT ON COLUMN transactions.title IS 'Título ou descrição da transação';
COMMENT ON COLUMN transactions.amount IS 'Valor da transação';
COMMENT ON COLUMN transactions.type IS 'Tipo da transação (income=receita, expense=despesa)';
COMMENT ON COLUMN transactions.category IS 'Categoria da transação (ex: Alimentação, Transporte)';
COMMENT ON COLUMN transactions.date IS 'Data da transação';
COMMENT ON COLUMN transactions.is_recurring IS 'Indica se a transação é recorrente';
COMMENT ON COLUMN transactions.recurring_day IS 'Dia do mês para transações recorrentes mensais';
COMMENT ON COLUMN transactions.recurrence_frequency IS 'Frequência da recorrência (semanal, mensal, anual)';
COMMENT ON COLUMN transactions.is_paid IS 'Indica se a transação foi paga/recebida';
COMMENT ON COLUMN transactions.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN transactions.updated_at IS 'Data da última atualização do registro';

-- Configurar RLS (Row Level Security)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
-- Política para SELECT: usuários só podem ver suas próprias transações
CREATE POLICY transactions_select_policy
  ON transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para INSERT: usuários só podem inserir suas próprias transações
CREATE POLICY transactions_insert_policy
  ON transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários só podem atualizar suas próprias transações
CREATE POLICY transactions_update_policy
  ON transactions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para DELETE: usuários só podem excluir suas próprias transações
CREATE POLICY transactions_delete_policy
  ON transactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Conceder permissões ao papel 'authenticated'
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO authenticated;

-- Criar índices para melhorar a performance
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON transactions(date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON transactions(type);
