-- SOLUÇÃO SEGURA: CORRIGIR POLÍTICAS SEM COMPROMETER SEGURANÇA

-- STEP 1: Verificar políticas atuais (não remove nada ainda)
SELECT 
    'POLÍTICAS ATUAIS:' as status,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'telegram_link_codes'
ORDER BY policyname;

-- STEP 2: Verificar se service_role tem acesso
-- (Este teste vai mostrar se o problema é RLS ou não)
SELECT 
    'TESTE SERVICE ROLE:' as test,
    current_user as current_role,
    COUNT(*) as total_records
FROM telegram_link_codes;

-- STEP 3: Adicionar política específica para service_role SEM remover as outras
-- (Apenas adiciona se não existir)
DO $$
BEGIN
    -- Verifica se a política já existe
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'telegram_link_codes' 
        AND policyname = 'service_role_telegram_access'
    ) THEN
        -- Cria política específica para service_role
        EXECUTE 'CREATE POLICY "service_role_telegram_access" ON telegram_link_codes
          FOR ALL TO service_role
          USING (true)
          WITH CHECK (true)';
        
        RAISE NOTICE 'Política service_role_telegram_access criada com sucesso';
    ELSE
        RAISE NOTICE 'Política service_role_telegram_access já existe';
    END IF;
END $$;

-- STEP 4: Verificar se a nova política foi criada
SELECT 
    'POLÍTICA ADICIONADA:' as status,
    policyname,
    roles
FROM pg_policies 
WHERE tablename = 'telegram_link_codes'
  AND policyname = 'service_role_telegram_access';

-- STEP 5: Testar novamente o acesso do service_role
SELECT 
    'TESTE FINAL:' as test,
    COUNT(*) as total_records,
    COUNT(CASE WHEN expires_at > NOW() AND used_at IS NULL THEN 1 END) as valid_codes
FROM telegram_link_codes;
