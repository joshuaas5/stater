-- Script para criar e configurar a tabela bills no Supabase
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela bills existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'bills'
);

-- Criar a tabela bills se não existir
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    title TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT,
    is_paid BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    is_infinite_recurrence BOOLEAN DEFAULT FALSE,
    recurring_day INTEGER,
    total_installments INTEGER,
    current_installment INTEGER,
    notifications_enabled BOOLEAN DEFAULT FALSE,
    notification_days INTEGER[],
    original_bill_id UUID,
    original_due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar comentários à tabela
COMMENT ON TABLE bills IS 'Tabela para armazenar as contas a pagar dos usuários';
COMMENT ON COLUMN bills.id IS 'ID único da conta';
COMMENT ON COLUMN bills.user_id IS 'ID do usuário (referência à tabela auth.users)';
COMMENT ON COLUMN bills.title IS 'Título ou descrição da conta';
COMMENT ON COLUMN bills.amount IS 'Valor da conta';
COMMENT ON COLUMN bills.due_date IS 'Data de vencimento da conta';
COMMENT ON COLUMN bills.category IS 'Categoria da conta (ex: Moradia, Transporte)';
COMMENT ON COLUMN bills.is_paid IS 'Indica se a conta foi paga';
COMMENT ON COLUMN bills.is_recurring IS 'Indica se a conta é recorrente';
COMMENT ON COLUMN bills.is_infinite_recurrence IS 'Indica se a recorrência é infinita ou tem um número definido de parcelas';
COMMENT ON COLUMN bills.recurring_day IS 'Dia do mês para contas recorrentes mensais';
COMMENT ON COLUMN bills.total_installments IS 'Número total de parcelas (para contas parceladas)';
COMMENT ON COLUMN bills.current_installment IS 'Número da parcela atual';
COMMENT ON COLUMN bills.notifications_enabled IS 'Indica se as notificações estão habilitadas para esta conta';
COMMENT ON COLUMN bills.notification_days IS 'Array com dias de antecedência para enviar notificações';
COMMENT ON COLUMN bills.original_bill_id IS 'ID da conta original (para contas recorrentes)';
COMMENT ON COLUMN bills.original_due_date IS 'Data de vencimento original (para contas recorrentes)';
COMMENT ON COLUMN bills.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN bills.updated_at IS 'Data da última atualização do registro';

-- Configurar RLS (Row Level Security)
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
-- Política para SELECT: usuários só podem ver suas próprias contas
CREATE POLICY bills_select_policy
  ON bills
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política para INSERT: usuários só podem inserir suas próprias contas
CREATE POLICY bills_insert_policy
  ON bills
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários só podem atualizar suas próprias contas
CREATE POLICY bills_update_policy
  ON bills
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política para DELETE: usuários só podem deletar suas próprias contas
CREATE POLICY bills_delete_policy
  ON bills
  FOR DELETE
  USING (auth.uid() = user_id);

-- Conceder permissões ao papel 'authenticated'
GRANT ALL ON bills TO authenticated;

-- Criar índice para melhorar a performance de consultas por usuário
CREATE INDEX IF NOT EXISTS bills_user_id_idx ON bills(user_id);

-- Criar índice para melhorar a performance de consultas por data de vencimento
CREATE INDEX IF NOT EXISTS bills_due_date_idx ON bills(due_date);

-- Verificar se a tabela foi criada corretamente
SELECT * FROM pg_tables WHERE tablename = 'bills';

-- Verificar as colunas da tabela
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'bills';
