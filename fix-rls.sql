-- Criar política RLS que permite inserção na tabela telegram_link_codes
-- Esta query deve ser executada no SQL Editor do Supabase

-- Primeiro, garantir que RLS está habilitado
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- Criar política que permite inserção para usuários autenticados
DROP POLICY IF EXISTS "Allow code generation" ON telegram_link_codes;

CREATE POLICY "Allow code generation" ON telegram_link_codes
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Alternativamente, se quiser ser mais restritivo:
-- CREATE POLICY "Allow authenticated insert" ON telegram_link_codes
--   FOR INSERT TO authenticated
--   WITH CHECK (true);
-- 
-- CREATE POLICY "Allow user read own codes" ON telegram_link_codes
--   FOR SELECT TO authenticated
--   USING (user_id = auth.uid());

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'telegram_link_codes';
