-- ============================================
-- 📊 ANALYTICS PRÓPRIO DO STATER
-- ============================================
-- Sistema de rastreamento 100% preciso e em tempo real
-- Não é bloqueado por adblockers, dados instantâneos

-- Tabela: Visualizações de página
CREATE TABLE IF NOT EXISTS analytics_pageviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  device TEXT CHECK (device IN ('mobile', 'desktop', 'tablet')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: Eventos customizados
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_category TEXT DEFAULT 'General',
  event_label TEXT,
  event_value NUMERIC,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: Propriedades dos usuários
CREATE TABLE IF NOT EXISTS analytics_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  plan TEXT,
  metadata JSONB,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX IF NOT EXISTS idx_pageviews_created_at ON analytics_pageviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pageviews_path ON analytics_pageviews(path);
CREATE INDEX IF NOT EXISTS idx_pageviews_user_id ON analytics_pageviews(user_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_device ON analytics_pageviews(device);

CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON analytics_events(user_id);

CREATE INDEX IF NOT EXISTS idx_users_last_seen ON analytics_users(last_seen DESC);

-- RLS (Row Level Security) - PÚBLICO para rastreamento
ALTER TABLE analytics_pageviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_users ENABLE ROW LEVEL SECURITY;

-- Permitir INSERT de qualquer usuário (mesmo não autenticado)
CREATE POLICY "Permitir insert público em pageviews"
  ON analytics_pageviews
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir insert público em events"
  ON analytics_events
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir upsert em users"
  ON analytics_users
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Permitir SELECT apenas para admins (você)
-- Substitua 'SEU_EMAIL_ADMIN@gmail.com' pelo seu email do Supabase
CREATE POLICY "Admins podem ler pageviews"
  ON analytics_pageviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN ('joshuaas5@gmail.com') -- COLOQUE SEU EMAIL AQUI
    )
  );

CREATE POLICY "Admins podem ler events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN ('joshuaas5@gmail.com') -- COLOQUE SEU EMAIL AQUI
    )
  );

CREATE POLICY "Admins podem ler users"
  ON analytics_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND email IN ('joshuaas5@gmail.com') -- COLOQUE SEU EMAIL AQUI
    )
  );

-- ============================================
-- 📊 QUERIES ÚTEIS PARA VER OS DADOS
-- ============================================

-- 1. Visitantes AGORA (últimos 5 minutos)
COMMENT ON TABLE analytics_pageviews IS 
'Query para ver visitantes online:
SELECT COUNT(DISTINCT user_agent) as online_agora
FROM analytics_pageviews
WHERE created_at >= NOW() - INTERVAL ''5 minutes'';';

-- 2. Dashboard de hoje
COMMENT ON TABLE analytics_events IS 
'Query para dashboard completo de hoje:
SELECT 
  (SELECT COUNT(DISTINCT user_agent) FROM analytics_pageviews WHERE created_at >= CURRENT_DATE) as visitantes_unicos,
  (SELECT COUNT(*) FROM analytics_pageviews WHERE created_at >= CURRENT_DATE) as total_pageviews,
  (SELECT COUNT(*) FROM analytics_events WHERE event_name = ''sign_up'' AND created_at >= CURRENT_DATE) as novos_usuarios,
  (SELECT COUNT(*) FROM analytics_events WHERE event_name = ''purchase'' AND created_at >= CURRENT_DATE) as vendas_hoje;';

-- 3. Conversão (signups -> compras)
COMMENT ON TABLE analytics_users IS
'Query para taxa de conversão:
WITH stats AS (
  SELECT 
    COUNT(*) FILTER (WHERE event_name = ''sign_up'') as signups,
    COUNT(*) FILTER (WHERE event_name = ''purchase'') as purchases
  FROM analytics_events
  WHERE created_at >= CURRENT_DATE
)
SELECT 
  signups,
  purchases,
  ROUND((purchases::numeric / NULLIF(signups, 0)) * 100, 2) as taxa_conversao_percent
FROM stats;';

-- Função para limpar dados antigos (opcional, executar mensalmente)
CREATE OR REPLACE FUNCTION cleanup_old_analytics()
RETURNS void AS $$
BEGIN
  -- Manter apenas últimos 90 dias
  DELETE FROM analytics_pageviews WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM analytics_events WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_analytics IS 'Executar mensalmente para limpar dados antigos: SELECT cleanup_old_analytics();';
