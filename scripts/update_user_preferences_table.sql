-- Script para atualizar a tabela user_preferences com novos campos de notificações

-- Verificar se a tabela existe
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
        -- Adicionar novas colunas se não existirem
        BEGIN
            ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS notifications_bills_overdue BOOLEAN DEFAULT TRUE;
            RAISE NOTICE 'Coluna notifications_bills_overdue adicionada ou já existente';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Coluna notifications_bills_overdue já existe';
        END;
        
        BEGIN
            ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS notifications_weekly_email BOOLEAN DEFAULT TRUE;
            RAISE NOTICE 'Coluna notifications_weekly_email adicionada ou já existente';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Coluna notifications_weekly_email já existe';
        END;
        
        BEGIN
            ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS notifications_push BOOLEAN DEFAULT TRUE;
            RAISE NOTICE 'Coluna notifications_push adicionada ou já existente';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Coluna notifications_push já existe';
        END;
        
        BEGIN
            ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS notifications_in_app BOOLEAN DEFAULT TRUE;
            RAISE NOTICE 'Coluna notifications_in_app adicionada ou já existente';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Coluna notifications_in_app já existe';
        END;
        
        BEGIN
            ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS notifications_email BOOLEAN DEFAULT TRUE;
            RAISE NOTICE 'Coluna notifications_email adicionada ou já existente';
        EXCEPTION WHEN duplicate_column THEN
            RAISE NOTICE 'Coluna notifications_email já existe';
        END;
        
        RAISE NOTICE 'Tabela user_preferences atualizada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela user_preferences não existe. Execute primeiro o script de criação da tabela.';
    END IF;
END $$;
