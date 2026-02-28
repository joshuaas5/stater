-- =====================================================
-- CONFIGURAÇÃO FINAL PARA SISTEMA DE ÁUDIO - SUPABASE
-- =====================================================
-- Execute este SQL no seu Supabase Dashboard
-- Data: 2025-01-11

-- 1. TABELA PARA LOGS DE ÁUDIO
CREATE TABLE IF NOT EXISTS audio_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  
  -- Metadados da requisição
  audio_duration_seconds DECIMAL(5,2) NOT NULL,
  audio_size_bytes INTEGER NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('web', 'telegram')),
  
  -- Processamento
  transcript TEXT NOT NULL,
  detected_intent TEXT NOT NULL,
  processing_time_ms INTEGER NOT NULL,
  
  -- Custos e tokens
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  estimated_cost_usd DECIMAL(8,6) DEFAULT 0,
  
  -- Status
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_audio_logs_user_id ON audio_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audio_logs_created_at ON audio_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audio_logs_source_type ON audio_logs(source_type);
CREATE INDEX IF NOT EXISTS idx_audio_logs_success ON audio_logs(success);

-- 3. ROW LEVEL SECURITY (RLS)
ALTER TABLE audio_logs ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só veem seus próprios logs
CREATE POLICY "Users can view own audio logs" ON audio_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Política: Sistema pode inserir logs
CREATE POLICY "System can insert audio logs" ON audio_logs
  FOR INSERT WITH CHECK (true);

-- 4. FUNÇÃO PARA CALCULAR CUSTOS E LIMITES
CREATE OR REPLACE FUNCTION get_user_audio_costs(
  target_user_id UUID,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  daily_interactions INTEGER,
  monthly_interactions INTEGER,
  total_cost_usd DECIMAL(10,6),
  total_cost_brl DECIMAL(10,2),
  avg_processing_time_ms DECIMAL(8,2),
  can_use_audio BOOLEAN,
  warning_level TEXT
) AS $$
DECLARE
  daily_limit INTEGER := 15;
  monthly_limit INTEGER := 500;
  month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
BEGIN
  RETURN QUERY
  WITH daily_stats AS (
    SELECT COUNT(*)::INTEGER as daily_count
    FROM audio_logs 
    WHERE user_id = target_user_id 
      AND created_at >= start_date 
      AND created_at < end_date + INTERVAL '1 day'
      AND success = true
  ),
  monthly_stats AS (
    SELECT 
      COUNT(*)::INTEGER as monthly_count,
      COALESCE(SUM(estimated_cost_usd), 0)::DECIMAL(10,6) as total_usd,
      COALESCE(AVG(processing_time_ms), 0)::DECIMAL(8,2) as avg_time
    FROM audio_logs 
    WHERE user_id = target_user_id 
      AND created_at >= month_start
      AND success = true
  )
  SELECT 
    d.daily_count,
    m.monthly_count,
    m.total_usd,
    (m.total_usd * 5.7)::DECIMAL(10,2), -- Conversão USD->BRL
    m.avg_time,
    (d.daily_count < daily_limit AND m.monthly_count < monthly_limit) as can_use,
    CASE 
      WHEN d.daily_count >= daily_limit OR m.monthly_count >= monthly_limit THEN 'critical'
      WHEN d.daily_count >= (daily_limit * 0.8) OR m.monthly_count >= (monthly_limit * 0.8) THEN 'warning'
      ELSE 'none'
    END as warning_level
  FROM daily_stats d, monthly_stats m;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. FUNÇÃO PARA LIMPEZA AUTOMÁTICA (OPCIONAL)
CREATE OR REPLACE FUNCTION cleanup_old_audio_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Remove logs mais antigos que 90 dias
  DELETE FROM audio_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. VIEW PARA ANALYTICS SIMPLES
CREATE OR REPLACE VIEW audio_usage_summary AS
SELECT 
  DATE(created_at) as date,
  source_type,
  COUNT(*) as total_requests,
  COUNT(*) FILTER (WHERE success = true) as successful_requests,
  COUNT(*) FILTER (WHERE success = false) as failed_requests,
  AVG(audio_duration_seconds) as avg_duration,
  AVG(processing_time_ms) as avg_processing_time,
  SUM(estimated_cost_usd) as daily_cost_usd
FROM audio_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), source_type
ORDER BY date DESC;

-- =====================================================
-- DADOS DE TESTE (OPCIONAL)
-- =====================================================
-- Descomente para inserir dados de exemplo
/*
INSERT INTO audio_logs (
  user_id, session_id, audio_duration_seconds, audio_size_bytes,
  source_type, transcript, detected_intent, processing_time_ms,
  input_tokens, output_tokens, estimated_cost_usd, success
) VALUES (
  auth.uid(), 'test-session-1', 3.5, 28000,
  'web', 'Adicionar gasto de 50 reais em alimentação', 'ADD_TRANSACTION', 1200,
  25, 15, 0.0001, true
);
*/

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================
-- Para verificar se tudo foi criado corretamente:
SELECT 
  'audio_logs' as table_name,
  count(*) as total_records
FROM audio_logs
UNION ALL
SELECT 
  'Functions Created' as table_name,
  count(*) as total_records
FROM information_schema.routines 
WHERE routine_name IN ('get_user_audio_costs', 'cleanup_old_audio_logs')
  AND routine_schema = 'public';

-- =====================================================
-- NOTA IMPORTANTE
-- =====================================================
-- Após executar este SQL:
-- 1. Verifique se as tabelas foram criadas: audio_logs
-- 2. Verifique se as funções foram criadas: get_user_audio_costs, cleanup_old_audio_logs
-- 3. Teste inserindo um log de exemplo
-- 4. Teste a função de custos: SELECT * FROM get_user_audio_costs(auth.uid());
-- =====================================================
