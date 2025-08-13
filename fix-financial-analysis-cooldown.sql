-- 🔧 SCRIPT PARA CORRIGIR COOLDOWN DE FINANCIAL_ANALYSIS
-- O problema: Usuários ficam com cooldown de 150+ horas (era 7 dias, agora deve ser 1 hora)
-- Solução: Limpar todos os cooldowns antigos de financial_analysis

-- 1. VERIFICAR o problema (registros com cooldown muito alto)
SELECT 
  user_id,
  feature_type,
  last_reward_at,
  cooldown_ends_at,
  EXTRACT(EPOCH FROM (cooldown_ends_at - NOW()))/60 as remaining_minutes
FROM reward_ad_cooldowns 
WHERE feature_type = 'financial_analysis'
  AND cooldown_ends_at > NOW() + INTERVAL '2 hours'
ORDER BY cooldown_ends_at DESC;

-- 2. LIMPAR todos os cooldowns problemáticos de financial_analysis
DELETE FROM reward_ad_cooldowns 
WHERE feature_type = 'financial_analysis'
  AND cooldown_ends_at > NOW() + INTERVAL '2 hours';

-- 3. OPCIONAL: Para garantir, limpar TODOS os cooldowns de financial_analysis
DELETE FROM reward_ad_cooldowns WHERE feature_type = 'financial_analysis';

-- 4. VERIFICAR se limpou corretamente (deve retornar 0)
SELECT COUNT(*) as cooldowns_restantes 
FROM reward_ad_cooldowns 
WHERE feature_type = 'financial_analysis';

-- 5. VERIFICAR configurações atuais do sistema (para debug)
-- Este SELECT é só informativo para ver se há outros problemas
SELECT 
  feature_type,
  COUNT(*) as total_users,
  AVG(EXTRACT(EPOCH FROM (cooldown_ends_at - NOW()))/60) as avg_remaining_minutes
FROM reward_ad_cooldowns 
WHERE cooldown_ends_at > NOW()
GROUP BY feature_type
ORDER BY avg_remaining_minutes DESC;
