-- ================================================================
-- BACKUP DE SEGURANÇA - ESTADO ATUAL DAS POLÍTICAS
-- Execute ANTES de fazer qualquer alteração
-- ================================================================

SELECT '💾 CRIANDO BACKUP DE SEGURANÇA...' as status;

-- Criar tabela de backup das políticas atuais
CREATE TABLE IF NOT EXISTS backup_security_state_20250728 AS
SELECT 
    'policies' as backup_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    current_timestamp as backup_date,
    'Pre-security-fix' as backup_label
FROM pg_policies 
WHERE tablename IN ('telegram_users', 'telegram_link_codes', 'audio_response_cache')
    AND schemaname = 'public';

-- Backup do estado das tabelas (RLS ativo/inativo)
INSERT INTO backup_security_state_20250728 
SELECT 
    'table_rls_status' as backup_type,
    schemaname,
    tablename,
    NULL as policyname,
    NULL as permissive,
    NULL as roles,
    NULL as cmd,
    rowsecurity::text as qual,
    NULL as with_check,
    current_timestamp as backup_date,
    'Pre-security-fix' as backup_label
FROM pg_tables 
WHERE tablename IN ('telegram_users', 'telegram_link_codes', 'audio_response_cache')
    AND schemaname = 'public';

-- Backup da definição da view problemática
INSERT INTO backup_security_state_20250728 
SELECT 
    'view_definition' as backup_type,
    schemaname,
    viewname as tablename,
    NULL as policyname,
    NULL as permissive,
    NULL as roles,
    NULL as cmd,
    definition as qual,
    NULL as with_check,
    current_timestamp as backup_date,
    'Pre-security-fix' as backup_label
FROM pg_views 
WHERE viewname = 'audio_usage_summary'
    AND schemaname = 'public';

-- Verificar se o backup foi criado
SELECT 
    backup_type,
    COUNT(*) as items_backed_up,
    '✅ Backup realizado' as status
FROM backup_security_state_20250728 
GROUP BY backup_type
ORDER BY backup_type;

SELECT '💾 BACKUP CONCLUÍDO COM SUCESSO!' as resultado;
SELECT 'Em caso de problemas, use: SELECT * FROM backup_security_state_20250728;' as instrucao_rollback;
