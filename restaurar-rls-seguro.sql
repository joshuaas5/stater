-- ================================================================
-- RESTAURAÇÃO DE POLÍTICAS RLS SEGURAS - PÓS CORREÇÃO SW
-- Execute após confirmar que o Service Worker foi corrigido
-- ================================================================

-- IMPORTANTE: Execute este script APENAS após testar que o erro 406 foi resolvido
-- com a correção do Service Worker

-- ================================================================
-- PASSO 1: REMOVER POLÍTICAS PERMISSIVAS TEMPORÁRIAS
-- ================================================================
DROP POLICY IF EXISTS "telegram_users_full_access" ON public.telegram_users;
DROP POLICY IF EXISTS "telegram_codes_full_access" ON public.telegram_link_codes;

-- ================================================================
-- PASSO 2: CRIAR POLÍTICAS RLS SEGURAS PARA TELEGRAM_USERS
-- ================================================================

-- Política para usuários autenticados (só veem seus próprios dados)
CREATE POLICY "telegram_users_own_data" ON public.telegram_users
    FOR ALL 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para service_role (bot precisa acessar para verificar conexões)
CREATE POLICY "telegram_users_service_access" ON public.telegram_users
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- PASSO 3: CRIAR POLÍTICAS RLS SEGURAS PARA TELEGRAM_LINK_CODES
-- ================================================================

-- Política para usuários autenticados (só veem seus próprios códigos)
CREATE POLICY "telegram_codes_own_data" ON public.telegram_link_codes
    FOR ALL 
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política para service_role (bot precisa acessar para validar códigos)
CREATE POLICY "telegram_codes_service_access" ON public.telegram_link_codes
    FOR ALL 
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ================================================================
-- PASSO 4: ADICIONAR POLÍTICA DE LIMPEZA AUTOMÁTICA (OPCIONAL)
-- ================================================================

-- Política para permitir limpeza de códigos expirados
CREATE POLICY "telegram_codes_cleanup_expired" ON public.telegram_link_codes
    FOR DELETE 
    TO service_role
    USING (expires_at < NOW());

-- ================================================================
-- PASSO 5: VERIFICAR POLÍTICAS APLICADAS
-- ================================================================
SELECT 
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('telegram_users', 'telegram_link_codes')
ORDER BY tablename, policyname;

-- ================================================================
-- PASSO 6: TESTAR ACESSO (Execute após aplicar as políticas)
-- ================================================================

-- Teste 1: Verificar se usuário autenticado consegue ver seus dados
-- (Substitua USER_ID_AQUI pelo seu user_id real)
-- SELECT * FROM telegram_users WHERE user_id = 'USER_ID_AQUI';

-- Teste 2: Verificar se consegue inserir código
-- (Este teste deve ser feito pelo frontend, não manualmente)

-- ================================================================
-- COMENTÁRIOS DE CONFIRMAÇÃO
-- ================================================================
COMMENT ON TABLE public.telegram_users IS 'RLS SEGURO APLICADO - Usuários veem apenas seus dados, service_role tem acesso total';
COMMENT ON TABLE public.telegram_link_codes IS 'RLS SEGURO APLICADO - Usuários veem apenas seus códigos, service_role tem acesso total';

-- ================================================================
-- RESUMO DAS POLÍTICAS DE SEGURANÇA
-- ================================================================
/*
TELEGRAM_USERS:
- authenticated: Só pode ver/modificar registros onde user_id = auth.uid()
- service_role: Acesso total (necessário para bot verificar conexões)

TELEGRAM_LINK_CODES:
- authenticated: Só pode ver/modificar códigos onde user_id = auth.uid()
- service_role: Acesso total (necessário para bot validar códigos)
- Limpeza automática de códigos expirados permitida para service_role

SEGURANÇA MANTIDA:
✅ Usuários só acessam seus próprios dados
✅ Bot (service_role) pode operar normalmente
✅ Dados de outros usuários protegidos
✅ Códigos expirados podem ser limpos automaticamente
*/
