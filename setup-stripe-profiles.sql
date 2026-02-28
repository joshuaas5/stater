-- ====================================
-- 💳 CONFIGURAÇÃO STRIPE - TABELA PROFILES
-- ====================================
-- Adiciona colunas para gerenciar assinaturas Premium
-- Data: 15 de Outubro de 2025

-- Adicionar colunas na tabela profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_plan_type ON profiles(plan_type);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id ON profiles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Comentários nas colunas
COMMENT ON COLUMN profiles.plan_type IS 'Tipo do plano: free ou premium';
COMMENT ON COLUMN profiles.subscription_status IS 'Status da assinatura: inactive, active, canceled, past_due';
COMMENT ON COLUMN profiles.subscription_id IS 'ID da assinatura no Stripe';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'ID do cliente no Stripe';

-- Verificar estrutura atualizada
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('plan_type', 'subscription_status', 'subscription_id', 'stripe_customer_id')
ORDER BY ordinal_position;
