-- Desabilitar RLS temporariamente para telegram_link_codes
ALTER TABLE telegram_link_codes DISABLE ROW LEVEL SECURITY;

-- Ou criar uma política que permita inserção para usuários autenticados
-- ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Allow authenticated users to insert codes" ON telegram_link_codes
--   FOR INSERT TO authenticated
--   WITH CHECK (true);
-- 
-- CREATE POLICY "Allow users to read their own codes" ON telegram_link_codes
--   FOR SELECT TO authenticated
--   USING (user_id = auth.uid());
