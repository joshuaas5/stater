-- EXECUTE ESTE SCRIPT NO SQL EDITOR DO SUPABASE
-- Versão segura com verificações condicionais para evitar erros de triggers

-- 1. Tabela user_message_count (RESOLVE O ERRO 404)
CREATE TABLE IF NOT EXISTS user_message_count (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    message_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_message_count_user_id ON user_message_count(user_id);

-- Function e trigger para user_message_count
CREATE OR REPLACE FUNCTION update_message_count_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_message_count_updated_at ON user_message_count;
CREATE TRIGGER update_user_message_count_updated_at 
    BEFORE UPDATE ON user_message_count 
    FOR EACH ROW 
    EXECUTE FUNCTION update_message_count_updated_at();

-- RLS para user_message_count
ALTER TABLE user_message_count ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuários podem ver apenas seus próprios contadores" ON user_message_count;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus próprios contadores" ON user_message_count;

CREATE POLICY "Usuários podem ver apenas seus próprios contadores" ON user_message_count
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar seus próprios contadores" ON user_message_count
    FOR ALL USING (auth.uid() = user_id);

-- 2. Tabela reward_ad_cooldowns (COOLDOWN DE 1H)
CREATE TABLE IF NOT EXISTS reward_ad_cooldowns (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    feature_type VARCHAR(50) NOT NULL,
    last_reward_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    cooldown_ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_type)
);

CREATE INDEX IF NOT EXISTS idx_reward_cooldowns_user_id ON reward_ad_cooldowns(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_cooldowns_feature ON reward_ad_cooldowns(feature_type);
CREATE INDEX IF NOT EXISTS idx_reward_cooldowns_ends_at ON reward_ad_cooldowns(cooldown_ends_at);

-- Function e trigger para reward_ad_cooldowns
CREATE OR REPLACE FUNCTION update_cooldowns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_cooldowns_updated_at ON reward_ad_cooldowns;
CREATE TRIGGER trigger_update_cooldowns_updated_at
    BEFORE UPDATE ON reward_ad_cooldowns
    FOR EACH ROW
    EXECUTE FUNCTION update_cooldowns_updated_at();

-- RLS para reward_ad_cooldowns
ALTER TABLE reward_ad_cooldowns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cooldowns" ON reward_ad_cooldowns;
DROP POLICY IF EXISTS "Users can manage their own cooldowns" ON reward_ad_cooldowns;

CREATE POLICY "Users can view their own cooldowns" ON reward_ad_cooldowns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cooldowns" ON reward_ad_cooldowns
    FOR ALL USING (auth.uid() = user_id);

-- 3. Tabela weekly_usage (SE NÃO EXISTIR)
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

CREATE INDEX IF NOT EXISTS idx_weekly_usage_user_id ON weekly_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_usage_week_start ON weekly_usage(week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_usage_user_week ON weekly_usage(user_id, week_start);

-- Function e trigger para weekly_usage
CREATE OR REPLACE FUNCTION update_weekly_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_weekly_usage_updated_at ON weekly_usage;
CREATE TRIGGER trigger_update_weekly_usage_updated_at
    BEFORE UPDATE ON weekly_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_weekly_usage_updated_at();

-- RLS para weekly_usage
ALTER TABLE weekly_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own weekly usage" ON weekly_usage;
DROP POLICY IF EXISTS "Users can insert their own weekly usage" ON weekly_usage;
DROP POLICY IF EXISTS "Users can update their own weekly usage" ON weekly_usage;

CREATE POLICY "Users can view their own weekly usage" ON weekly_usage
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly usage" ON weekly_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly usage" ON weekly_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE user_message_count IS 'Contador de mensagens enviadas para o Stater IA por usuário';
COMMENT ON TABLE reward_ad_cooldowns IS 'Controle de cooldown para reward ads por feature';
COMMENT ON TABLE weekly_usage IS 'Controle de uso semanal de PDFs e imagens por usuário';

SELECT 'Todas as tabelas criadas com sucesso! Erro 404 resolvido e cooldown implementado!' as status;
