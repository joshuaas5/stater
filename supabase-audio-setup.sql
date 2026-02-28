-- =====================================================
-- CONFIGURAÇÕES SUPABASE PARA SISTEMA DE ÁUDIO
-- =====================================================

-- 1. TABELA PARA LOGS DE ÁUDIO (OPCIONAL - APENAS METADADOS)
CREATE TABLE IF NOT EXISTS audio_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    audio_duration INTEGER, -- em segundos
    transcription_preview TEXT, -- primeiras palavras
    intent_detected TEXT, -- ADD_TRANSACTION, GET_BALANCE, etc
    gemini_cost DECIMAL(10,6), -- custo da operação
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_successfully BOOLEAN DEFAULT false
);

-- 2. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_audio_logs_user_id ON audio_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_logs_created_at ON audio_logs(created_at);

-- 3. RLS (ROW LEVEL SECURITY)
ALTER TABLE audio_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audio logs" ON audio_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own audio logs" ON audio_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- ARMAZENAMENTO DE ÁUDIO (SE NECESSÁRIO NO FUTURO)
-- =====================================================

-- STORAGE BUCKET (OPCIONAL - PARA CASOS ESPECÍFICOS)
-- Só criar se quiser manter histórico de áudios
INSERT INTO storage.buckets (id, name, public) 
VALUES ('audio-files', 'audio-files', false)
ON CONFLICT DO NOTHING;

-- POLÍTICA PARA STORAGE (SE USAR)
CREATE POLICY "Users can upload their audio files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'audio-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their audio files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'audio-files' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- =====================================================
-- FUNÇÕES PARA CONTROLE DE CUSTOS
-- =====================================================

-- Função para calcular custos totais do usuário
CREATE OR REPLACE FUNCTION get_user_audio_costs(user_uuid UUID)
RETURNS TABLE (
    total_cost DECIMAL(10,6),
    monthly_cost DECIMAL(10,6),
    session_count INTEGER
) 
LANGUAGE SQL SECURITY DEFINER
AS $$
    SELECT 
        COALESCE(SUM(gemini_cost), 0) as total_cost,
        COALESCE(SUM(CASE 
            WHEN created_at >= date_trunc('month', now()) 
            THEN gemini_cost 
            ELSE 0 
        END), 0) as monthly_cost,
        COUNT(*)::INTEGER as session_count
    FROM audio_logs 
    WHERE user_id = user_uuid;
$$;

-- =====================================================
-- TRIGGER PARA LIMPEZA AUTOMÁTICA (OPCIONAL)
-- =====================================================

-- Limpar logs antigos automaticamente (após 30 dias)
CREATE OR REPLACE FUNCTION cleanup_old_audio_logs()
RETURNS void
LANGUAGE SQL SECURITY DEFINER
AS $$
    DELETE FROM audio_logs 
    WHERE created_at < NOW() - INTERVAL '30 days';
$$;

-- Agendar limpeza (se tiver pg_cron ativo)
-- SELECT cron.schedule('cleanup-audio-logs', '0 2 * * *', 'SELECT cleanup_old_audio_logs();');
