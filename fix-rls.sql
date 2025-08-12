-- Política RLS segura para telegram_link_codes
-- Esta política é mais restritiva e segura

-- Garantir que RLS está habilitado
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Allow code generation" ON telegram_link_codes;
DROP POLICY IF EXISTS "Allow authenticated insert" ON telegram_link_codes;
DROP POLICY IF EXISTS "Allow user read own codes" ON telegram_link_codes;

-- POLÍTICA SEGURA: Apenas usuários autenticados podem inserir códigos para si mesmos
CREATE POLICY "Allow authenticated users to insert own codes" ON telegram_link_codes
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- POLÍTICA SEGURA: Usuários só podem ler seus próprios códigos
CREATE POLICY "Allow users to read own codes" ON telegram_link_codes
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- POLÍTICA SEGURA: Apenas o webhook (service role) pode ler qualquer código para verificação
-- Esta política permite que o bot do Telegram verifique códigos
CREATE POLICY "Allow service role to read codes" ON telegram_link_codes
  FOR SELECT TO service_role
  USING (true);

-- POLÍTICA SEGURA: Apenas o webhook (service role) pode marcar códigos como usados
CREATE POLICY "Allow service role to update codes" ON telegram_link_codes
  FOR UPDATE TO service_role
  USING (true);

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'telegram_link_codes';
