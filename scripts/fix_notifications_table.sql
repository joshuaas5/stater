-- Script para corrigir as políticas de segurança da tabela de notificações

-- Verificar se a tabela existe
SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications');

-- Listar as políticas existentes para a tabela de notificações
SELECT * FROM pg_policies WHERE tablename = 'notifications';

-- Remover políticas existentes (se necessário)
DROP POLICY IF EXISTS "Usuários podem ver suas próprias notificações" ON "public"."notifications";
DROP POLICY IF EXISTS "Usuários podem inserir suas próprias notificações" ON "public"."notifications";
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias notificações" ON "public"."notifications";
DROP POLICY IF EXISTS "Usuários podem excluir suas próprias notificações" ON "public"."notifications";

-- Habilitar RLS na tabela
ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

-- Criar políticas corretas
CREATE POLICY "Usuários podem ver suas próprias notificações"
  ON "public"."notifications"
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir suas próprias notificações"
  ON "public"."notifications"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias notificações"
  ON "public"."notifications"
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir suas próprias notificações"
  ON "public"."notifications"
  FOR DELETE
  USING (auth.uid() = user_id);

-- Garantir que a tabela tenha os campos corretos
DO $$
BEGIN
  -- Adicionar campos se não existirem
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'entity_id') THEN
    ALTER TABLE "public"."notifications" ADD COLUMN "entity_id" UUID;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'entity_type') THEN
    ALTER TABLE "public"."notifications" ADD COLUMN "entity_type" TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'title') THEN
    ALTER TABLE "public"."notifications" ADD COLUMN "title" TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'is_read') THEN
    ALTER TABLE "public"."notifications" ADD COLUMN "is_read" BOOLEAN DEFAULT FALSE;
  END IF;
END
$$;
