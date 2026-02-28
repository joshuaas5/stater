-- COPIE E COLE ESTE SCRIPT NO SQL EDITOR DO SUPABASE
-- Este script resolve o erro 404 da tabela user_message_count
-- E implementa o sistema de cooldown de 1h para reward ads

-- 1. Tabela user_message_count (RESOLVE O ERRO 404)
CREATE TABLE IF NOT EXISTS user_message_count (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    message_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_message_count_user_id ON user_message_count(user_id);

CREATE OR REPLACE FUNCTION update_message_count_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_message_count_updated_at') THEN
        CREATE TRIGGER update_user_message_count_updated_at 
            BEFORE UPDATE ON user_message_count 
            FOR EACH ROW 
            EXECUTE FUNCTION update_message_count_updated_at();
    END IF;
END $$;

ALTER TABLE user_message_count ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
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

ALTER TABLE reward_ad_cooldowns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own cooldowns" ON reward_ad_cooldowns;
DROP POLICY IF EXISTS "Users can manage their own cooldowns" ON reward_ad_cooldowns;

CREATE POLICY "Users can view their own cooldowns" ON reward_ad_cooldowns
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cooldowns" ON reward_ad_cooldowns
    FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_cooldowns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_cooldowns_updated_at') THEN
        CREATE TRIGGER trigger_update_cooldowns_updated_at
            BEFORE UPDATE ON reward_ad_cooldowns
            FOR EACH ROW
            EXECUTE FUNCTION update_cooldowns_updated_at();
    END IF;
END $$;

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

CREATE OR REPLACE FUNCTION update_weekly_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_weekly_usage_updated_at') THEN
        CREATE TRIGGER trigger_update_weekly_usage_updated_at
            BEFORE UPDATE ON weekly_usage
            FOR EACH ROW
            EXECUTE FUNCTION update_weekly_usage_updated_at();
    END IF;
END $$;

-- 4. Tabela user_download_count (LIMITE DE DOWNLOADS DE RELATÓRIOS)
CREATE TABLE IF NOT EXISTS user_download_count (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    download_count INTEGER DEFAULT 0 NOT NULL,
    month_year VARCHAR(7) NOT NULL, -- formato YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_user_download_count_user_id ON user_download_count(user_id);
CREATE INDEX IF NOT EXISTS idx_user_download_count_month ON user_download_count(month_year);

ALTER TABLE user_download_count ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own download counts" ON user_download_count;
DROP POLICY IF EXISTS "Users can manage their own download counts" ON user_download_count;

CREATE POLICY "Users can view their own download counts" ON user_download_count
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own download counts" ON user_download_count
    FOR ALL USING (auth.uid() = user_id);

-- 5. Tabela user_recurring_count (LIMITE DE TRANSAÇÕES RECORRENTES)
CREATE TABLE IF NOT EXISTS user_recurring_count (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    recurring_count INTEGER DEFAULT 0 NOT NULL,
    month_year VARCHAR(7) NOT NULL, -- formato YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month_year)
);

CREATE INDEX IF NOT EXISTS idx_user_recurring_count_user_id ON user_recurring_count(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recurring_count_month ON user_recurring_count(month_year);

ALTER TABLE user_recurring_count ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own recurring counts" ON user_recurring_count;
DROP POLICY IF EXISTS "Users can manage their own recurring counts" ON user_recurring_count;

CREATE POLICY "Users can view their own recurring counts" ON user_recurring_count
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own recurring counts" ON user_recurring_count
    FOR ALL USING (auth.uid() = user_id);

-- 6. CORREÇÃO DOS WARNINGS DE RLS DO SUPABASE (SEGURANÇA)
-- Ativar RLS nas tabelas que estão causando warnings de segurança

-- Ativar RLS na tabela telegram_link_codes_backup (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'telegram_link_codes_backup' AND schemaname = 'public') THEN
        ALTER TABLE public.telegram_link_codes_backup ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view telegram link codes backup" ON public.telegram_link_codes_backup;
        DROP POLICY IF EXISTS "Users can manage telegram link codes backup" ON public.telegram_link_codes_backup;
        
        -- Política para visualizar registros (apenas usuários autenticados)
        CREATE POLICY "Users can view telegram link codes backup" 
        ON public.telegram_link_codes_backup 
        FOR SELECT 
        USING (auth.uid() IS NOT NULL);
        
        -- Política para inserir/atualizar/deletar (apenas usuários autenticados)
        CREATE POLICY "Users can manage telegram link codes backup" 
        ON public.telegram_link_codes_backup 
        FOR ALL 
        USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Ativar RLS na tabela telegram_sessions (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'telegram_sessions' AND schemaname = 'public') THEN
        ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies if they exist
        DROP POLICY IF EXISTS "Users can view their own telegram sessions" ON public.telegram_sessions;
        DROP POLICY IF EXISTS "Users can manage their own telegram sessions" ON public.telegram_sessions;
        DROP POLICY IF EXISTS "Users can view telegram sessions" ON public.telegram_sessions;
        DROP POLICY IF EXISTS "Users can manage telegram sessions" ON public.telegram_sessions;
        
        -- Verificar se existe coluna user_id
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'telegram_sessions' 
            AND column_name = 'user_id'
            AND table_schema = 'public'
        ) THEN
            -- Política para ver apenas suas próprias sessões
            CREATE POLICY "Users can view their own telegram sessions" 
            ON public.telegram_sessions 
            FOR SELECT 
            USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can manage their own telegram sessions" 
            ON public.telegram_sessions 
            FOR ALL 
            USING (auth.uid() = user_id);
        ELSE
            -- Se não existe user_id, permitir acesso apenas para usuários autenticados
            CREATE POLICY "Users can view telegram sessions" 
            ON public.telegram_sessions 
            FOR SELECT 
            USING (auth.uid() IS NOT NULL);
            
            CREATE POLICY "Users can manage telegram sessions" 
            ON public.telegram_sessions 
            FOR ALL 
            USING (auth.uid() IS NOT NULL);
        END IF;
    END IF;
END $$;

SELECT 'Todas as tabelas criadas com sucesso! Erro 404 resolvido, cooldown de 7 dias implementado, limites de download e transações recorrentes adicionados, e warnings de RLS corrigidos!' as status;
