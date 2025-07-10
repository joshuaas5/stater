-- ================================================================
-- AUDITORIA DE SEGURANÇA RLS - VERIFICAR TODAS AS POLÍTICAS
-- Execute no Supabase SQL Editor para revisar segurança
-- ================================================================

-- Verificar TODAS as políticas RLS ativas no projeto
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual as using_expression,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ================================================================
-- VERIFICAR TABELAS COM RLS DESABILITADO (RISCO CRÍTICO)
-- ================================================================
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = false;

-- ================================================================
-- VERIFICAR POLÍTICAS MUITO PERMISSIVAS (RISCO ALTO)
-- ================================================================
SELECT 
  tablename,
  policyname,
  'POLÍTICA MUITO PERMISSIVA - REVISAR!' as alerta
FROM pg_policies 
WHERE schemaname = 'public'
  AND (qual = 'true' OR with_check = 'true')
  AND policyname NOT LIKE '%service%';

-- ================================================================
-- SUGESTÕES DE CORREÇÃO
-- ================================================================
/*
PROBLEMAS ENCONTRADOS E CORREÇÕES:

1. TABELAS SEM RLS:
   - Habilitar: ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;
   
2. POLÍTICAS MUITO PERMISSIVAS:
   - Trocar USING (true) por USING (auth.uid() = user_id)
   - Aplicar apenas ao role service_role quando necessário
   
3. POLÍTICAS FALTANDO:
   - Criar políticas para authenticated e service_role
   - Testar acesso após implementação
*/
