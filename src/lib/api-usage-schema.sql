-- Tabela para controle de uso de APIs externas, focada em tokens
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Para vincular ao usuário que fez a chamada
  api_name TEXT NOT NULL DEFAULT 'gemini', -- Nome da API, pode ser fixo se só usar Gemini
  model_name TEXT,                         -- Ex: 'gemini-2.5-flash-preview-05-20'
  prompt_tokens INTEGER,                   -- Tokens enviados no prompt
  candidates_tokens INTEGER,               -- Tokens recebidos na resposta da IA
  total_tokens INTEGER,                    -- Soma de prompt_tokens e candidates_tokens
  api_key_source TEXT,                     -- De onde a chave foi obtida (env, localStorage, etc.)
  error_message TEXT,                      -- Para registrar mensagens de erro, se houver
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('UTC'::TEXT, NOW()) NOT NULL
);

-- Índices para otimizar consultas comuns
CREATE INDEX IF NOT EXISTS idx_api_usage_user_id ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_api_name_model ON api_usage(api_name, model_name);

-- Habilitar RLS (Row Level Security)
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para api_usage:

-- 1. Usuários autenticados podem inserir seus próprios registros de uso.
--    O user_id no registro deve corresponder ao UID do usuário autenticado.
CREATE POLICY "Usuários podem inserir seus próprios registros de uso da API"
ON api_usage
FOR INSERT
TO authenticated -- Aplica-se a qualquer usuário autenticado
WITH CHECK (auth.uid() = user_id);

-- 2. Usuários autenticados podem ver apenas seus próprios registros de uso.
CREATE POLICY "Usuários podem ver seus próprios registros de uso da API"
ON api_usage
FOR SELECT
TO authenticated -- Aplica-se a qualquer usuário autenticado
USING (auth.uid() = user_id);

-- 3. Ninguém pode atualizar ou deletar registros via RLS por padrão.
--    Atualizações ou deleções, se necessárias, devem ser feitas com privilégios de superusuário
--    ou através de funções de segurança (SECURITY DEFINER functions) no Supabase.
--    CREATE POLICY "Ninguém pode atualizar registros de uso via RLS" ON api_usage FOR UPDATE USING (false);
--    CREATE POLICY "Ninguém pode deletar registros de uso via RLS" ON api_usage FOR DELETE USING (false);

-- Comentário: As políticas acima garantem que um usuário só possa inserir e ler seus próprios dados de uso.
-- A chave de serviço (service_role key) do Supabase, se usada no backend (ex: Edge Functions), bypassa RLS
-- e teria acesso total para inserir/gerenciar esses registros, o que é ideal para registrar o uso da API
-- de forma segura sem depender do cliente para fornecer o user_id correto sem chance de manipulação.
-- Se as inserções forem feitas pelo cliente, a política de INSERT com `auth.uid() = user_id` é crucial.

-- (Opcional) Se você tiver um papel de 'admin' e quiser que eles vejam todos os registros:
-- CREATE POLICY "Administradores podem visualizar todos os registros de uso da API"
-- ON api_usage
-- FOR SELECT
-- TO authenticated
-- USING ( (SELECT rolname FROM pg_roles WHERE rolname = current_user) = 'admin_user_role_name_here' );
-- ou verificando um campo customizado na tabela auth.users:
-- USING (EXISTS (SELECT 1 FROM auth.users u WHERE u.id = auth.uid() AND u.role = 'admin'));

-- Nota sobre GRANTs: Supabase por padrão concede permissões apropriadas para `anon` e `authenticated`
-- baseado nas políticas de RLS. Se você estiver usando um papel específico, pode precisar de GRANTs explícitos.
-- Exemplo: GRANT SELECT, INSERT ON TABLE api_usage TO authenticated;
-- No entanto, com as políticas acima, o acesso já está definido para 'authenticated'.
