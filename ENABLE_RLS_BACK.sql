-- REABILITAR RLS - O problema não é RLS
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- Verificar que foi reabilitado
SELECT 
    'RLS REABILITADO:' as status,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'telegram_link_codes';
