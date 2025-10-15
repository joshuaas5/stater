-- ====================================
-- 💳 CONFIGURAÇÃO BANCO DE DADOS STRIPE
-- ====================================
-- Adiciona colunas para gerenciar assinaturas Premium
-- Data: 15 de Outubro de 2025

-- Adicionar colunas na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_plan_type ON users(plan_type);
CREATE INDEX IF NOT EXISTS idx_users_subscription_id ON users(subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);

-- Comentários nas colunas
COMMENT ON COLUMN users.plan_type IS 'Tipo do plano: free ou premium';
COMMENT ON COLUMN users.subscription_status IS 'Status da assinatura: inactive, active, canceled, past_due';
COMMENT ON COLUMN users.subscription_id IS 'ID da assinatura no Stripe';
COMMENT ON COLUMN users.stripe_customer_id IS 'ID do cliente no Stripe';

-- Verificar estrutura atualizada
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('plan_type', 'subscription_status', 'subscription_id', 'stripe_customer_id')
ORDER BY ordinal_position;
