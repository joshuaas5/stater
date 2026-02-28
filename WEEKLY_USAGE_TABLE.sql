-- 🔥 TABELA PARA SISTEMA DE LIMITES SEMANAIS
-- Criar tabela weekly_usage para controlar limites semanais de PDF e imagens

CREATE TABLE IF NOT EXISTS weekly_usage (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    pdf_count INTEGER NOT NULL DEFAULT 0,
    image_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Garantir apenas um registro por usuário por semana
    UNIQUE(user_id, week_start)
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_weekly_usage_user_id ON weekly_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_usage_week_start ON weekly_usage(week_start);
CREATE INDEX IF NOT EXISTS idx_weekly_usage_user_week ON weekly_usage(user_id, week_start);

-- RLS (Row Level Security) - usuários só podem ver seus próprios dados
ALTER TABLE weekly_usage ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus dados
CREATE POLICY "Users can view their own weekly usage" ON weekly_usage
    FOR SELECT USING (auth.uid() = user_id);

-- Política para permitir que usuários insiram seus dados
CREATE POLICY "Users can insert their own weekly usage" ON weekly_usage
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus dados
CREATE POLICY "Users can update their own weekly usage" ON weekly_usage
    FOR UPDATE USING (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE weekly_usage IS 'Controle de uso semanal de PDFs e imagens por usuário';
COMMENT ON COLUMN weekly_usage.user_id IS 'ID do usuário (referência para auth.users)';
COMMENT ON COLUMN weekly_usage.week_start IS 'Data de início da semana (segunda-feira)';
COMMENT ON COLUMN weekly_usage.week_end IS 'Data de fim da semana (domingo)';
COMMENT ON COLUMN weekly_usage.pdf_count IS 'Número de PDFs processados na semana';
COMMENT ON COLUMN weekly_usage.image_count IS 'Número de imagens processadas na semana';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_weekly_usage_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_weekly_usage_updated_at
    BEFORE UPDATE ON weekly_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_weekly_usage_updated_at();

-- 📊 VERIFICAR IMPLEMENTAÇÃO
SELECT 'Tabela weekly_usage criada com sucesso!' as status;
