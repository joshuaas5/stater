-- =====================================================
-- CORREÇÃO - REMOVER POLÍTICAS DUPLICADAS SUPABASE
-- =====================================================
-- Execute este SQL antes do SUPABASE_AUDIO_FINAL.sql

-- 1. REMOVER POLÍTICAS EXISTENTES (se existirem)
DROP POLICY IF EXISTS "Users can view own audio logs" ON audio_logs;
DROP POLICY IF EXISTS "System can insert audio logs" ON audio_logs;

-- 2. REMOVER TABELA SE EXISTIR (para começar limpo)
DROP TABLE IF EXISTS audio_logs CASCADE;

-- 3. REMOVER FUNÇÕES SE EXISTIREM
DROP FUNCTION IF EXISTS get_user_audio_costs(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS cleanup_old_audio_logs();

-- 4. REMOVER VIEW SE EXISTIR
DROP VIEW IF EXISTS audio_usage_summary;

-- =====================================================
-- AGORA EXECUTE O ARQUIVO SUPABASE_AUDIO_FINAL.sql
-- =====================================================
-- Após executar este arquivo, execute o SUPABASE_AUDIO_FINAL.sql
-- Isso irá criar tudo limpo e sem conflitos
