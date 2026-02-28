-- 🔓 POLÍTICA RLS PARA EDGE FUNCTIONS (SERVICE ROLE)
-- Execute este SQL no Supabase SQL Editor ANTES de usar os webhooks

-- As Edge Functions usam SUPABASE_SERVICE_ROLE_KEY que bypassa RLS por padrão,
-- MAS é bom garantir que a tabela aceite operações do service_role

-- 1. Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'user_plans';

-- 2. Adicionar política para service role (edge functions)
-- Nota: Service role já bypassa RLS, mas adicionar uma política explícita pode ajudar

-- Permitir INSERT pelo service_role
CREATE POLICY "Service role pode inserir planos" ON user_plans
    FOR INSERT
    WITH CHECK (true);

-- Permitir UPDATE pelo service_role  
CREATE POLICY "Service role pode atualizar planos" ON user_plans
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Permitir SELECT pelo service_role
CREATE POLICY "Service role pode ler planos" ON user_plans
    FOR SELECT
    USING (true);

-- 3. OU: Desabilitar RLS temporariamente para testes (NÃO RECOMENDADO em produção)
-- ALTER TABLE user_plans DISABLE ROW LEVEL SECURITY;

-- 4. Verificar políticas existentes
SELECT 
    policyname,
    tablename,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_plans';

-- 5. ALTERNATIVA MELHOR: Usar função com SECURITY DEFINER
-- Isso permite que uma função execute como superuser

CREATE OR REPLACE FUNCTION public.activate_pro_plan(
    p_user_id UUID,
    p_subscription_id TEXT DEFAULT NULL,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '30 days'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Esta função executa com privilégios elevados
SET search_path = public
AS $$
BEGIN
    INSERT INTO user_plans (
        user_id,
        plan_type,
        is_active,
        start_date,
        expires_at,
        is_on_trial,
        payment_status,
        purchase_token,
        product_id,
        updated_at
    ) VALUES (
        p_user_id,
        'pro',
        true,
        NOW(),
        p_expires_at,
        false,
        'active',
        p_subscription_id,
        'stater_pro_1490',
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        plan_type = 'pro',
        is_active = true,
        start_date = NOW(),
        expires_at = p_expires_at,
        is_on_trial = false,
        payment_status = 'active',
        purchase_token = COALESCE(p_subscription_id, user_plans.purchase_token),
        product_id = 'stater_pro_1490',
        updated_at = NOW();
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao ativar PRO: %', SQLERRM;
        RETURN false;
END;
$$;

-- Permitir que qualquer usuário autenticado chame a função
GRANT EXECUTE ON FUNCTION public.activate_pro_plan TO authenticated;
GRANT EXECUTE ON FUNCTION public.activate_pro_plan TO service_role;

-- 6. Função para desativar PRO (cancelamento)
CREATE OR REPLACE FUNCTION public.deactivate_pro_plan(
    p_user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE user_plans
    SET 
        plan_type = 'free',
        is_active = true,
        payment_status = 'cancelled',
        updated_at = NOW()
    WHERE user_id = p_user_id;
    
    RETURN true;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao desativar PRO: %', SQLERRM;
        RETURN false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.deactivate_pro_plan TO authenticated;
GRANT EXECUTE ON FUNCTION public.deactivate_pro_plan TO service_role;

-- 7. VERIFICAR SE A TABELA user_plans EXISTE
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_plans'
) AS tabela_existe;

-- 8. Se a tabela não existir, criar (copie de CREATE_USER_PLANS.sql)
