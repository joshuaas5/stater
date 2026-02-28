-- Script para corrigir timestamps das transações

-- Verificar e corrigir estrutura da tabela transactions
ALTER TABLE transactions 
ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE transactions 
ALTER COLUMN updated_at SET DEFAULT NOW();

-- Criar função para timestamp automático se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para updated_at automático
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at 
    BEFORE UPDATE ON transactions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Atualizar transações existentes para usar timezone correto
UPDATE transactions 
SET updated_at = NOW() 
WHERE updated_at IS NULL;
