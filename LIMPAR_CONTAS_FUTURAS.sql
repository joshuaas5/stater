-- ===========================================
-- LIMPEZA DE CONTAS FUTURAS DUPLICADAS
-- ===========================================
-- Este script remove contas com vencimento após 2025
-- que foram geradas erroneamente pelo sistema de recorrência

-- 1. Verificar quantas contas existem com data futura (após 2025)
SELECT 
  COUNT(*) as total_contas_futuras,
  MIN(due_date) as data_mais_antiga,
  MAX(due_date) as data_mais_distante
FROM bills 
WHERE due_date > '2025-12-31';

-- 2. Ver exemplos de contas que serão removidas
SELECT 
  id, 
  title, 
  amount, 
  due_date, 
  is_recurring, 
  is_infinite_recurrence,
  original_bill_id
FROM bills 
WHERE due_date > '2025-12-31'
ORDER BY due_date DESC
LIMIT 20;

-- 3. EXECUTAR A LIMPEZA - Remove contas com vencimento após 2025
-- ATENÇÃO: Execute apenas se tiver certeza!
DELETE FROM bills 
WHERE due_date > '2025-12-31'
AND is_recurring = true;

-- 4. Verificar resultado após limpeza
SELECT 
  COUNT(*) as total_contas_restantes,
  MAX(due_date) as data_mais_distante
FROM bills;

-- 5. Também limpar do localStorage do navegador (executar no console do navegador):
-- localStorage.clear() ou limpar apenas bills específicas
