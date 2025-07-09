-- 🔄 SCRIPT DE ROLLBACK - REVERTER CORREÇÕES DE SEGURANÇA
-- ⚠️  USE APENAS SE AS CORREÇÕES CAUSARAM PROBLEMAS!
-- 📋 FAZER BACKUP ANTES DE EXECUTAR QUALQUER ROLLBACK!

-- ===============================================
-- IMPORTANTE: LEIA ANTES DE EXECUTAR
-- ===============================================

/*
Este script desfaz as correções de segurança aplicadas anteriormente.
Use APENAS se:
1. As correções causaram problemas de login/funcionamento
2. Você tem certeza de que precisa reverter
3. Você tem um backup para restaurar se necessário

ORDEM DE EXECUÇÃO EM CASO DE PROBLEMA:
1. Primeiro, tente identificar o problema específico
2. Se possível, corrija apenas a parte problemática
3. Como último recurso, execute este rollback completo
4. Restaure um backup se o rollback também falhar
*/

-- ===============================================
-- 1. ROLLBACK DAS FUNÇÕES RPC
-- ===============================================

-- Remover a função check_user_exists com search_path seguro
DROP FUNCTION IF EXISTS check_user_exists(text);

-- Recriar a função original (SEM proteções de segurança)
-- ⚠️  ATENÇÃO: Esta versão é menos segura!
CREATE OR REPLACE FUNCTION check_user_exists(email_param text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    -- Versão original sem SECURITY DEFINER e search_path fixo
    RETURN EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE email = lower(trim(email_param))
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;

RAISE NOTICE '🔄 Função check_user_exists revertida para versão original (menos segura)';

-- ===============================================
-- 2. ROLLBACK DAS CONFIGURAÇÕES DE AUTENTICAÇÃO
-- ===============================================

-- Reverter configurações de OTP e senha
DO $$
BEGIN
    -- Tentar reverter via auth.config
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'config' AND table_schema = 'auth') THEN
        UPDATE auth.config SET
            otp_expiry = 600,  -- Voltar para 10 minutos (padrão)
            password_min_length = 6,  -- Voltar para 6 caracteres (menos seguro)
            password_require_letters = false,
            password_require_numbers = false,
            password_require_uppercase = false,
            password_require_symbols = false,
            rate_limit_login_per_hour = 0,  -- Remover rate limiting
            rate_limit_signup_per_hour = 0  -- Remover rate limiting
        WHERE instance_id = current_setting('app.settings.instance_id', true);
        
        RAISE NOTICE '🔄 Configurações de auth revertidas via auth.config';
    ELSE
        RAISE NOTICE '⚠️  Tabela auth.config não encontrada para rollback';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️  Erro ao reverter configurações de auth: %', SQLERRM;
        
        -- Tentar via ALTER SYSTEM como fallback
        BEGIN
            ALTER SYSTEM RESET auth.otp_expiry;
            ALTER SYSTEM RESET auth.password_min_length;
            ALTER SYSTEM RESET auth.password_require_letters;
            ALTER SYSTEM RESET auth.password_require_numbers;
            SELECT pg_reload_conf();
            RAISE NOTICE '🔄 Configurações revertidas via ALTER SYSTEM';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Falha ao reverter configurações via ALTER SYSTEM: %', SQLERRM;
        END;
END;
$$;

-- ===============================================
-- 3. ROLLBACK OPCIONAL DO RLS (SE CAUSOU PROBLEMAS)
-- ===============================================

-- ⚠️  DESCOMENTE APENAS SE RLS CAUSOU PROBLEMAS DE ACESSO
-- ⚠️  ISSO REMOVERÁ PROTEÇÕES IMPORTANTES DE SEGURANÇA!

/*
-- Desativar RLS nas tabelas (MUITO INSEGURO!)
DO $$
DECLARE
    table_name text;
    tables_to_modify text[] := ARRAY['profiles', 'transactions', 'bills', 'notifications'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_modify
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name AND table_schema = 'public') THEN
            EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', table_name);
            RAISE NOTICE '🔄 RLS desativado para tabela: % (INSEGURO!)', table_name;
        END IF;
    END LOOP;
END;
$$;
*/

RAISE NOTICE '⚠️  RLS mantido ativado (recomendado). Descomente o bloco acima se necessário.';

-- ===============================================
-- 4. REMOVER POLÍTICAS RLS PROBLEMÁTICAS (SE NECESSÁRIO)
-- ===============================================

-- Se políticas específicas estão causando problemas, removê-las individualmente:
-- DROP POLICY IF EXISTS "nome_da_politica" ON public.nome_da_tabela;

-- Exemplo (descomente se necessário):
-- DROP POLICY IF EXISTS "Users can only access their own data" ON public.profiles;
-- DROP POLICY IF EXISTS "Users can only access their own transactions" ON public.transactions;

RAISE NOTICE '⚠️  Políticas RLS mantidas. Remova individualmente se causarem problemas específicos.';

-- ===============================================
-- 5. VERIFICAÇÕES PÓS-ROLLBACK
-- ===============================================

-- Verificar se a função foi revertida corretamente
SELECT 
    routine_name,
    security_type,
    CASE 
        WHEN routine_definition LIKE '%SECURITY DEFINER%' THEN '❌ Ainda tem SECURITY DEFINER'
        ELSE '✅ SECURITY DEFINER removido'
    END as security_status,
    CASE 
        WHEN routine_definition LIKE '%SET search_path%' THEN '❌ Ainda tem search_path'
        ELSE '✅ search_path removido'
    END as search_path_status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'check_user_exists';

-- Testar se a função ainda funciona
SELECT 
    'Teste pós-rollback' as teste,
    check_user_exists('teste@exemplo.com') as resultado,
    CASE 
        WHEN check_user_exists('teste@exemplo.com') IS NOT NULL THEN '✅ Função funciona'
        ELSE '❌ Função falhou'
    END as status;

-- ===============================================
-- 6. REGISTRAR O ROLLBACK
-- ===============================================

-- Registrar que o rollback foi executado
INSERT INTO public.system_logs (
    log_level,
    message,
    details,
    created_at
) VALUES (
    'WARNING',
    'Rollback de correções de segurança executado',
    'Correções de segurança foram revertidas. Sistema menos seguro agora.',
    NOW()
);

-- ===============================================
-- 7. AVISOS IMPORTANTES PÓS-ROLLBACK
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE '=====================================';
    RAISE NOTICE '⚠️  ROLLBACK EXECUTADO - AVISOS IMPORTANTES';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '1. 🔓 O sistema está MENOS SEGURO agora';
    RAISE NOTICE '2. 🔄 Considere reaplica correções após identificar problema';
    RAISE NOTICE '3. 🔍 Investigue a causa do problema original';
    RAISE NOTICE '4. 📋 Monitore logs para identificar issues';
    RAISE NOTICE '5. 🛡️  Considere implementar correções graduais';
    RAISE NOTICE '=====================================';
    RAISE NOTICE '📊 PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. ✅ Testar login/logout imediatamente';
    RAISE NOTICE '2. ✅ Verificar todas as funcionalidades';
    RAISE NOTICE '3. ✅ Identificar causa raiz do problema';
    RAISE NOTICE '4. 🔧 Planejar correção incremental';
    RAISE NOTICE '5. 📝 Documentar lições aprendidas';
    RAISE NOTICE '=====================================';
END;
$$;

-- ===============================================
-- 8. TESTE BÁSICO DE FUNCIONALIDADE
-- ===============================================

-- Testar funcionalidades básicas após rollback
DO $$
BEGIN
    RAISE NOTICE '🧪 EXECUTANDO TESTES BÁSICOS PÓS-ROLLBACK...';
    
    -- Teste 1: Função check_user_exists
    IF check_user_exists('test@test.com') IS NOT NULL THEN
        RAISE NOTICE '✅ Teste 1: Função check_user_exists funciona';
    ELSE
        RAISE NOTICE '❌ Teste 1: Função check_user_exists FALHOU';
    END IF;
    
    -- Teste 2: Acesso às tabelas principais
    IF EXISTS (SELECT 1 FROM public.profiles LIMIT 1) THEN
        RAISE NOTICE '✅ Teste 2: Acesso à tabela profiles OK';
    ELSE
        RAISE NOTICE '⚠️  Teste 2: Tabela profiles vazia ou inacessível';
    END IF;
    
    RAISE NOTICE '🧪 Testes básicos concluídos. Testar login/logout manualmente agora!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro durante testes pós-rollback: %', SQLERRM;
END;
$$;

-- ===============================================
-- FINAL
-- ===============================================

RAISE NOTICE '🔄 ROLLBACK CONCLUÍDO!';
RAISE NOTICE '⚠️  IMPORTANTE: TESTAR TODAS AS FUNCIONALIDADES AGORA!';
RAISE NOTICE '🔍 Se problemas persistirem, considere restaurar backup completo.';

-- ⚠️  LEMBRETE FINAL:
-- Este rollback remove proteções de segurança importantes.
-- Trabalhe para reintegrar as correções de forma incremental
-- assim que identificar e resolver o problema raiz.
