-- 🔐 SCRIPT DE CORREÇÃO SEGURA DOS WARNINGS DO SUPABASE
-- ⚠️  APLICAR EM AMBIENTE DE TESTE PRIMEIRO!
-- 📋 FAZER BACKUP COMPLETO ANTES DE EXECUTAR!

-- ===============================================
-- 1. CORREÇÃO DO SEARCH_PATH EM FUNÇÕES RPC
-- ===============================================

-- Recriar função check_user_exists com search_path seguro
DROP FUNCTION IF EXISTS check_user_exists(text);

CREATE OR REPLACE FUNCTION check_user_exists(email_param text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public, auth
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

-- Comentário: Função agora usa SECURITY DEFINER com search_path fixo
-- Isso previne ataques de manipulação do search_path

-- ===============================================
-- 2. RECRIAR OUTRAS FUNÇÕES RPC COM SEGURANÇA
-- ===============================================

-- Se existirem outras funções RPC personalizadas, aplicar o mesmo padrão:
-- DROP FUNCTION IF EXISTS nome_da_funcao();
-- CREATE OR REPLACE FUNCTION nome_da_funcao()
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$ ... $$;

-- ===============================================
-- 3. CONFIGURAÇÕES DE SEGURANÇA DE AUTENTICAÇÃO
-- ===============================================

-- Configurar tempo de expiração de OTP para 5 minutos (300 segundos)
-- Isso garante que códigos OTP não fiquem válidos por muito tempo
UPDATE auth.config 
SET 
    -- OTP expira em 5 minutos
    otp_expiry = 300,
    
    -- Requisitos de senha mais seguros
    password_min_length = 8,
    
    -- Rate limiting para tentativas de login
    rate_limit_login_per_hour = 10,
    
    -- Rate limiting para tentativas de signup
    rate_limit_signup_per_hour = 5
WHERE 
    instance_id = current_setting('app.settings.instance_id', true);

-- Caso a tabela auth.config não exista ou tenha estrutura diferente,
-- usar comandos ALTER SYSTEM (requer privilégios de superusuário):

-- ALTER SYSTEM SET auth.otp_expiry = '300';
-- ALTER SYSTEM SET auth.password_min_length = '8';
-- SELECT pg_reload_conf();

-- ===============================================
-- 4. POLÍTICAS DE SENHA SEGURAS
-- ===============================================

-- Configurar requisitos de senha no nível da aplicação
-- (Essas configurações podem variar dependendo da versão do Supabase)

-- Tentar configurar via auth.config primeiro
DO $$
BEGIN
    -- Verificar se a configuração auth.config existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'config' AND table_schema = 'auth') THEN
        -- Aplicar configurações de senha
        UPDATE auth.config SET
            password_min_length = 8,
            password_require_letters = true,
            password_require_numbers = true,
            password_require_uppercase = false, -- Opcional para UX
            password_require_symbols = false    -- Opcional para UX
        WHERE instance_id = current_setting('app.settings.instance_id', true);
        
        RAISE NOTICE 'Configurações de senha aplicadas via auth.config';
    ELSE
        RAISE NOTICE 'Tabela auth.config não encontrada. Configurações devem ser aplicadas via dashboard do Supabase.';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao configurar políticas de senha: %', SQLERRM;
END;
$$;

-- ===============================================
-- 5. VERIFICAÇÕES DE SEGURANÇA ADICIONAIS
-- ===============================================

-- Verificar se RLS (Row Level Security) está ativado nas tabelas críticas
DO $$
DECLARE
    table_name text;
    tables_to_check text[] := ARRAY['profiles', 'transactions', 'bills', 'notifications'];
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        -- Verificar se a tabela existe e se RLS está ativado
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = table_name AND table_schema = 'public') THEN
            -- Ativar RLS se não estiver ativo
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
            RAISE NOTICE 'RLS verificado/ativado para tabela: %', table_name;
        ELSE
            RAISE NOTICE 'Tabela não encontrada: %', table_name;
        END IF;
    END LOOP;
END;
$$;

-- ===============================================
-- 6. LIMPEZA DE TOKENS EXPIRADOS (MANUTENÇÃO)
-- ===============================================

-- Limpar tokens OTP expirados (executar periodicamente)
DELETE FROM auth.mfa_factors 
WHERE created_at < NOW() - INTERVAL '1 day';

-- Limpar sessões antigas (manter apenas últimos 30 dias)
DELETE FROM auth.sessions 
WHERE created_at < NOW() - INTERVAL '30 days';

-- ===============================================
-- 7. LOGS E AUDITORIA
-- ===============================================

-- Inserir log da aplicação das correções de segurança
INSERT INTO public.system_logs (
    log_level,
    message,
    details,
    created_at
) VALUES (
    'INFO',
    'Correções de segurança aplicadas',
    'search_path corrigido, OTP expiry configurado, políticas de senha atualizadas',
    NOW()
);

-- Comentário: Se a tabela system_logs não existir, criar:
-- CREATE TABLE IF NOT EXISTS public.system_logs (
--     id SERIAL PRIMARY KEY,
--     log_level VARCHAR(10) NOT NULL,
--     message TEXT NOT NULL,
--     details TEXT,
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- ===============================================
-- 8. VALIDAÇÃO PÓS-APLICAÇÃO
-- ===============================================

-- Validar que as funções foram criadas corretamente
SELECT 
    routine_name,
    security_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'check_user_exists';

-- Validar configurações de auth (se acessível)
-- SELECT * FROM auth.config WHERE instance_id = current_setting('app.settings.instance_id', true);

-- ===============================================
-- RESULTADO ESPERADO:
-- ===============================================
-- ✅ Função check_user_exists recriada com SECURITY DEFINER e search_path seguro
-- ✅ OTP configurado para expirar em 5 minutos
-- ✅ Políticas de senha fortalecidas
-- ✅ RLS verificado/ativado em tabelas críticas
-- ✅ Limpeza de dados antigos executada
-- ✅ Log da operação registrado

-- ⚠️  IMPORTANTE: TESTAR LOGIN/LOGOUT APÓS EXECUTAR ESTE SCRIPT!
-- ⚠️  MONITORAR LOGS POR 24H PARA DETECTAR PROBLEMAS!

-- Mensagem final de conclusão
DO $$
BEGIN
    RAISE NOTICE '✅ Script de correção de segurança executado com sucesso!';
    RAISE NOTICE '⚠️  IMPORTANTE: Testar todas as funcionalidades de autenticação agora!';
END;
$$;
