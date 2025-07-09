-- 🔐 SCRIPT SUPER SIMPLES - CORREÇÃO DOS WARNINGS (PASSO A PASSO)
-- Execute um bloco por vez para maior segurança

-- ===============================================
-- PASSO 1: CORRIGIR FUNÇÃO check_user_exists
-- ===============================================
-- Execute este bloco primeiro:

DROP FUNCTION IF EXISTS check_user_exists(text);

CREATE OR REPLACE FUNCTION check_user_exists(email_param text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.profiles 
        WHERE email = lower(trim(email_param))
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

-- ===============================================
-- PASSO 2: VERIFICAR SE FUNCIONOU
-- ===============================================
-- Execute este bloco para testar:

SELECT check_user_exists('test@example.com') as teste_funcao;

-- ===============================================
-- PASSO 3: ATIVAR RLS (Row Level Security)
-- ===============================================
-- Execute este bloco para ativar proteções:

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- PASSO 4: VERIFICAR RLS
-- ===============================================
-- Execute este bloco para confirmar:

SELECT 
    tablename,
    rowsecurity as rls_ativo
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'transactions', 'bills', 'notifications');

-- ===============================================
-- PASSO 5: FINALIZAÇÃO
-- ===============================================
-- Execute por último:

DO $$
BEGIN
    RAISE NOTICE '✅ Correções aplicadas com sucesso!';
    RAISE NOTICE '🧪 Agora teste o login/logout no app!';
END;
$$;
