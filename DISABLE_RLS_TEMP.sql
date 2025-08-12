-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS para resolver o problema imediato
-- A função segura já está criada para uso futuro quando quisermos reabilitar RLS

-- 1. Desabilitar RLS temporariamente
ALTER TABLE telegram_link_codes DISABLE ROW LEVEL SECURITY;

-- 2. Verificar se foi desabilitado
SELECT 
    'RLS STATUS:' as info,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'telegram_link_codes';

-- 3. Testar acesso direto
SELECT 
    'TESTE ACESSO:' as info,
    COUNT(*) as total_codes,
    COUNT(CASE WHEN expires_at > NOW() AND used_at IS NULL THEN 1 END) as valid_codes
FROM telegram_link_codes;

-- NOTA: Com RLS desabilitado, o webhook volta a funcionar normalmente
-- A função link_telegram_code() continua disponível para uso futuro
-- Quando quiser reabilitar RLS: ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;
