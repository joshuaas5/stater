-- Script para criar todas as tabelas necessárias no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Tabela user_message_count
CREATE TABLE IF NOT EXISTS user_message_count (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    message_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por user_id
CREATE INDEX IF NOT EXISTS idx_user_message_count_user_id ON user_message_count(user_id);

-- Trigger para auto-update do updated_at
CREATE OR REPLACE FUNCTION update_message_count_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_message_count_updated_at 
    BEFORE UPDATE ON user_message_count 
    FOR EACH ROW 
    EXECUTE FUNCTION update_message_count_updated_at();

-- Comentários para documentação
COMMENT ON TABLE user_message_count IS 'Contador de mensagens enviadas para o Stater IA por usuário';
COMMENT ON COLUMN user_message_count.user_id IS 'ID do usuário (referência auth.users)';
COMMENT ON COLUMN user_message_count.message_count IS 'Número total de mensagens enviadas pelo usuário';

-- Política de segurança RLS
ALTER TABLE user_message_count ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios contadores" ON user_message_count;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios contadores" ON user_message_count;

-- Usuários podem ver apenas seus próprios contadores
CREATE POLICY "Usuários podem ver apenas seus próprios contadores" ON user_message_count
    FOR ALL USING (auth.uid() = user_id);

-- Permitir inserção/atualização para usuários autenticados
CREATE POLICY "Usuários podem gerenciar seus próprios contadores" ON user_message_count
    FOR ALL USING (auth.uid() = user_id);

-- 2. Tabela weekly_usage
CREATE TABLE IF NOT EXISTS weekly_usage (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    pdf_count INTEGER DEFAULT 0,
    image_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

-- Índices para busca eficiente
CREATE INDEX IF NOT EXISTS idx_weekly_usage_user_id ON weekly_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_usage_week_start ON weekly_usage(week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_usage_user_week ON weekly_usage(user_id, week_start);

-- RLS Security
ALTER TABLE weekly_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own weekly usage" ON weekly_usage;
DROP POLICY IF EXISTS "Users can insert their own weekly usage" ON weekly_usage;
DROP POLICY IF EXISTS "Users can update their own weekly usage" ON weekly_usage;

-- Users can view their own weekly usage
CREATE POLICY "Users can view their own weekly usage" ON weekly_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own weekly usage
CREATE POLICY "Users can insert their own weekly usage" ON weekly_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own weekly usage
CREATE POLICY "Users can update their own weekly usage" ON weekly_usage
    FOR UPDATE USING (auth.uid() = user_id);

COMMENT ON TABLE weekly_usage IS 'Controle de uso semanal de PDFs e imagens por usuário';
COMMENT ON COLUMN weekly_usage.user_id IS 'ID do usuário (referência para auth.users)';
COMMENT ON COLUMN weekly_usage.week_start IS 'Data de início da semana (segunda-feira)';
COMMENT ON COLUMN weekly_usage.week_end IS 'Data de fim da semana (domingo)';
COMMENT ON COLUMN weekly_usage.pdf_count IS 'Número de PDFs processados na semana';
COMMENT ON COLUMN weekly_usage.image_count IS 'Número de imagens processadas na semana';

-- Function for updating weekly_usage updated_at
CREATE OR REPLACE FUNCTION update_weekly_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_weekly_usage_updated_at
    BEFORE UPDATE ON weekly_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_weekly_usage_updated_at();

-- 3. Tabela para controle de cooldown de reward ads
CREATE TABLE IF NOT EXISTS reward_ad_cooldowns (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    feature_type VARCHAR(50) NOT NULL, -- 'financial_analysis', 'telegram_bot', etc.
    last_reward_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cooldown_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_type)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_reward_cooldowns_user_id ON reward_ad_cooldowns(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_cooldowns_feature ON reward_ad_cooldowns(feature_type);
CREATE INDEX IF NOT EXISTS idx_reward_cooldowns_ends_at ON reward_ad_cooldowns(cooldown_ends_at);

-- RLS Security
ALTER TABLE reward_ad_cooldowns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own cooldowns" ON reward_ad_cooldowns;
DROP POLICY IF EXISTS "Users can manage their own cooldowns" ON reward_ad_cooldowns;

-- Users can view their own cooldowns
CREATE POLICY "Users can view their own cooldowns" ON reward_ad_cooldowns
    FOR SELECT USING (auth.uid() = user_id);

-- Users can manage their own cooldowns
CREATE POLICY "Users can manage their own cooldowns" ON reward_ad_cooldowns
    FOR ALL USING (auth.uid() = user_id);

COMMENT ON TABLE reward_ad_cooldowns IS 'Controle de cooldown para reward ads por feature';
COMMENT ON COLUMN reward_ad_cooldowns.user_id IS 'ID do usuário';
COMMENT ON COLUMN reward_ad_cooldowns.feature_type IS 'Tipo de feature que teve reward ad assistido';
COMMENT ON COLUMN reward_ad_cooldowns.last_reward_at IS 'Timestamp do último reward ad assistido';
COMMENT ON COLUMN reward_ad_cooldowns.cooldown_ends_at IS 'Quando o cooldown termina';

-- Function for updating cooldowns updated_at
CREATE OR REPLACE FUNCTION update_cooldowns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_cooldowns_updated_at
    BEFORE UPDATE ON reward_ad_cooldowns
    FOR EACH ROW
    EXECUTE FUNCTION update_cooldowns_updated_at();

SELECT 'Todas as tabelas criadas com sucesso!' as status;
