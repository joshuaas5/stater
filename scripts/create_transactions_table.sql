-- Script para verificar e atualizar a tabela transactions no Supabase
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela transactions existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'transactions'
);

-- IMPORTANTE: Este script não vai criar uma nova tabela se já existir uma
-- Apenas vai verificar e adicionar colunas que possam estar faltando

-- Verificar as colunas existentes na tabela transactions
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'transactions';

-- Adicionar colunas que podem estar faltando (só serão adicionadas se não existirem)
DO $$ 
BEGIN
    -- Verificar e adicionar coluna is_recurring se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'transactions' 
                   AND column_name = 'is_recurring') THEN
        ALTER TABLE transactions ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
    END IF;

    -- Verificar e adicionar coluna recurring_day se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'transactions' 
                   AND column_name = 'recurring_day') THEN
        ALTER TABLE transactions ADD COLUMN recurring_day INTEGER;
    END IF;

    -- Verificar e adicionar coluna recurrence_frequency se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'transactions' 
                   AND column_name = 'recurrence_frequency') THEN
        ALTER TABLE transactions ADD COLUMN recurrence_frequency VARCHAR(20);
    END IF;

    -- Verificar e adicionar coluna is_paid se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'transactions' 
                   AND column_name = 'is_paid') THEN
        ALTER TABLE transactions ADD COLUMN is_paid BOOLEAN DEFAULT TRUE;
    END IF;

    -- Verificar e adicionar coluna updated_at se não existir
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'transactions' 
                   AND column_name = 'updated_at') THEN
        ALTER TABLE transactions ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Adicionar comentários à tabela existente
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
