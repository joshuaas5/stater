-- 🔐 SCRIPT CORRIGIDO - CORREÇÃO SEGURA DOS WARNINGS DO SUPABASE
-- ⚠️  APLICAR EM AMBIENTE DE TESTE PRIMEIRO!
-- 📋 FAZER BACKUP COMPLETO ANTES DE EXECUTAR!

-- ===============================================
-- PARTE 1: CORREÇÃO DA FUNÇÃO check_user_exists
-- ===============================================

-- Remover função existente se houver
DROP FUNCTION IF EXISTS check_user_exists(text);

-- Recriar função com search_path seguro
CREATE OR REPLACE FUNCTION check_user_exists(email_param text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Verificar se o email já existe na tabela profiles
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE email = lower(trim(email_param))
    );
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, retornar false para não bloquear o fluxo
        RETURN false;
END;
$$;

-- ===============================================
-- PARTE 2: VERIFICAR E ATIVAR RLS NAS TABELAS
-- ===============================================

-- Ativar RLS na tabela profiles (se não estiver ativa)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela transactions (se não estiver ativa)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela bills (se não estiver ativa)
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela notifications (se não estiver ativa)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- PARTE 3: LIMPEZA DE DADOS ANTIGOS (OPCIONAL)
-- ===============================================

-- Limpar sessões antigas (manter apenas últimos 30 dias)
-- DESCOMENTE SE QUISER EXECUTAR:
-- DELETE FROM auth.sessions WHERE created_at < NOW() - INTERVAL '30 days';

-- ===============================================
-- PARTE 4: VERIFICAÇÃO FINAL
-- ===============================================

-- Verificar se a função foi criada corretamente
SELECT 
    'check_user_exists' as funcao,
    routine_name,
    security_type as tipo_seguranca
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'check_user_exists';

-- Verificar RLS nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_ativo
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'transactions', 'bills', 'notifications');

-- ===============================================
-- MENSAGENS FINAIS
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '✅ SCRIPT EXECUTADO COM SUCESSO!';
    RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Testar login com Google OAuth';
    RAISE NOTICE '2. Testar login com email/senha';
    RAISE NOTICE '3. Testar função check_user_exists';
    RAISE NOTICE '4. Monitorar logs por 24h';
    RAISE NOTICE '⚠️  Se houver problemas, usar o script de rollback!';
END;
$$;
