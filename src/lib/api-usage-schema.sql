-- Tabela para controle de uso de APIs externas
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  api_name TEXT NOT NULL,
  month_year TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL,
  UNIQUE(api_name, month_year)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para api_usage (somente administradores podem ver/editar)
CREATE POLICY "Somente administradores podem ver registros de uso de API" ON api_usage
  FOR SELECT USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN ('admin@example.com')
  ));
  
CREATE POLICY "Somente administradores podem inserir registros de uso de API" ON api_usage
  FOR INSERT WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN ('admin@example.com')
  ));
  
CREATE POLICY "Somente administradores podem atualizar registros de uso de API" ON api_usage
  FOR UPDATE USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email IN ('admin@example.com')
  ));

-- Permitir que a aplicação acesse a tabela api_usage
CREATE POLICY "Aplicação pode acessar registros de uso de API" ON api_usage
  FOR ALL USING (true);
