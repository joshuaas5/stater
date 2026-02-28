-- Script para adicionar colunas de notificação faltantes na tabela user_preferences

-- Adicionar colunas de notificações que estão faltando
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS notifications_bills_overdue BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notifications_bills_due_soon BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notifications_large_transactions BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notifications_weekly_email BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notifications_push BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notifications_in_app BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS notifications_email BOOLEAN DEFAULT TRUE;

-- Atualizar registros existentes para ter valores padrão
UPDATE user_preferences
SET 
  notifications_bills_overdue = TRUE,
  notifications_bills_due_soon = TRUE,
  notifications_large_transactions = TRUE,
  notifications_weekly_email = TRUE,
  notifications_push = TRUE,
  notifications_in_app = TRUE,
  notifications_email = TRUE
WHERE notifications_bills_overdue IS NULL
   OR notifications_bills_due_soon IS NULL
   OR notifications_large_transactions IS NULL
   OR notifications_weekly_email IS NULL
   OR notifications_push IS NULL
   OR notifications_in_app IS NULL
   OR notifications_email IS NULL;
