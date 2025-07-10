-- LIMPEZA CÓDIGOS TELEGRAM EXPIRADOS E CONFLITANTES
-- Execute este script para resolver problemas de "código inválido ou expirado"

-- ================================================================
-- DIAGNÓSTICO: VERIFICAR CÓDIGOS EXISTENTES
-- ================================================================

-- Ver códigos ativos por usuário
SELECT 
  user_email,
  code,
  created_at,
  expires_at,
  used_at,
  CASE 
    WHEN used_at IS NOT NULL THEN 'USADO'
    WHEN expires_at < NOW() THEN 'EXPIRADO'
    ELSE 'ATIVO'
  END as status
FROM public.telegram_link_codes 
ORDER BY created_at DESC 
LIMIT 20;

-- ================================================================
-- LIMPEZA: REMOVER CÓDIGOS PROBLEMÁTICOS
-- ================================================================

-- 1. Remover códigos expirados (mais de 1 hora atrás)
DELETE FROM public.telegram_link_codes 
WHERE expires_at < NOW() - INTERVAL '1 hour';

-- 2. Remover códigos muito antigos (mais de 7 dias)
DELETE FROM public.telegram_link_codes 
WHERE created_at < NOW() - INTERVAL '7 days';

-- 3. Marcar como usado códigos órfãos (sem used_at mas criados há mais de 24h)
UPDATE public.telegram_link_codes 
SET used_at = NOW()
WHERE used_at IS NULL 
  AND created_at < NOW() - INTERVAL '24 hours';

-- ================================================================
-- OTIMIZAÇÃO: PERMITIR APENAS 1 CÓDIGO ATIVO POR USUÁRIO
-- ================================================================

-- Para cada usuário, manter apenas o código mais recente e marcar outros como usados
WITH ranked_codes AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
  FROM public.telegram_link_codes 
  WHERE used_at IS NULL 
    AND expires_at > NOW()
)
UPDATE public.telegram_link_codes 
SET used_at = NOW()
WHERE id IN (
  SELECT id FROM ranked_codes WHERE rn > 1
);

-- ================================================================
-- VERIFICAÇÃO FINAL
-- ================================================================

-- Contar códigos ativos por status
SELECT 
  CASE 
    WHEN used_at IS NOT NULL THEN 'USADO'
    WHEN expires_at < NOW() THEN 'EXPIRADO'
    ELSE 'ATIVO'
  END as status,
  COUNT(*) as quantidade
FROM public.telegram_link_codes 
GROUP BY status;

-- Ver apenas códigos ativos (devem ser poucos e recentes)
SELECT 
  user_email,
  code,
  created_at,
  expires_at,
  EXTRACT(EPOCH FROM (expires_at - NOW()))/60 as minutos_restantes
FROM public.telegram_link_codes 
WHERE used_at IS NULL 
  AND expires_at > NOW()
ORDER BY created_at DESC;

-- ================================================================
-- COMENTÁRIOS FINAIS
-- ================================================================

COMMENT ON TABLE public.telegram_link_codes IS 'Códigos Telegram - LIMPEZA APLICADA para resolver expiração';

-- ✅ RESULTADOS ESPERADOS:
-- 1. Códigos expirados removidos
-- 2. Apenas 1 código ativo por usuário
-- 3. Performance melhorada
-- 4. Redução de conflitos "código inválido"
