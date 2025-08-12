-- Criar tabela user_plans para centralizar o sistema de planos no Supabase
-- Esta tabela substitui o localStorage e permite verificação premium no Telegram

CREATE TABLE IF NOT EXISTS user_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'free', -- 'free', 'weekly', 'monthly', 'pro', 'enterprise'
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    is_on_trial BOOLEAN DEFAULT FALSE,
    payment_status TEXT DEFAULT 'cancelled', -- 'active', 'pending', 'failed', 'cancelled'
    purchase_token TEXT,
    product_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir apenas um plano ativo por usuário
    UNIQUE(user_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_plans_plan_type ON user_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_user_plans_active ON user_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_user_plans_expires_at ON user_plans(expires_at);

-- Trigger para auto-update do updated_at
CREATE OR REPLACE FUNCTION update_user_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_plans_updated_at 
    BEFORE UPDATE ON user_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_plans_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_plans ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança - usuários só podem ver/gerenciar seus próprios planos
CREATE POLICY "Usuários podem ver apenas seus próprios planos" ON user_plans
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar seus próprios planos" ON user_plans
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE user_plans IS 'Planos de assinatura dos usuários - sistema de monetização centralizado';
COMMENT ON COLUMN user_plans.user_id IS 'ID do usuário (referência auth.users)';
COMMENT ON COLUMN user_plans.plan_type IS 'Tipo do plano: free, weekly, monthly, pro, enterprise';
COMMENT ON COLUMN user_plans.is_active IS 'Se o plano está ativo';
COMMENT ON COLUMN user_plans.expires_at IS 'Data de expiração do plano (NULL = não expira)';
COMMENT ON COLUMN user_plans.trial_ends_at IS 'Data de fim do período trial';
COMMENT ON COLUMN user_plans.payment_status IS 'Status do pagamento: active, pending, failed, cancelled';
COMMENT ON COLUMN user_plans.purchase_token IS 'Token de compra do Google Play/App Store';
COMMENT ON COLUMN user_plans.product_id IS 'ID do produto no Google Play/App Store';
