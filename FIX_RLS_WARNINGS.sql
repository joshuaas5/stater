-- SCRIPT PARA RESOLVER WARNINGS DE RLS DO SUPABASE
-- Execute este script no SQL Editor do Supabase para corrigir os warnings de segurança

-- 1. Ativar RLS na tabela telegram_link_codes_backup
ALTER TABLE public.telegram_link_codes_backup ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para telegram_link_codes_backup
-- Esta tabela provavelmente é usada para backup, então vamos permitir acesso apenas para usuários autenticados

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view telegram link codes backup" ON public.telegram_link_codes_backup;
DROP POLICY IF EXISTS "Users can manage telegram link codes backup" ON public.telegram_link_codes_backup;

-- Política para visualizar registros (apenas usuários autenticados)
CREATE POLICY "Users can view telegram link codes backup" 
ON public.telegram_link_codes_backup 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Política para inserir/atualizar/deletar (apenas usuários autenticados)
CREATE POLICY "Users can manage telegram link codes backup" 
ON public.telegram_link_codes_backup 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- 2. Ativar RLS na tabela telegram_sessions
ALTER TABLE public.telegram_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para telegram_sessions
-- Esta tabela gerencia sessões do Telegram, vamos permitir que usuários vejam apenas suas próprias sessões

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own telegram sessions" ON public.telegram_sessions;
DROP POLICY IF EXISTS "Users can manage their own telegram sessions" ON public.telegram_sessions;

-- Se a tabela tem uma coluna user_id, use esta política:
-- Primeiro vamos verificar se existe coluna user_id
DO $$
BEGIN
    -- Política para ver apenas suas próprias sessões (se existir user_id)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'telegram_sessions' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        CREATE POLICY "Users can view their own telegram sessions" 
        ON public.telegram_sessions 
        FOR SELECT 
        USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can manage their own telegram sessions" 
        ON public.telegram_sessions 
        FOR ALL 
        USING (auth.uid() = user_id);
    ELSE
        -- Se não existe user_id, permitir acesso apenas para usuários autenticados
        CREATE POLICY "Users can view telegram sessions" 
        ON public.telegram_sessions 
        FOR SELECT 
        USING (auth.uid() IS NOT NULL);
        
        CREATE POLICY "Users can manage telegram sessions" 
        ON public.telegram_sessions 
        FOR ALL 
        USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Verificar o resultado
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    'RLS ATIVADO' as status
FROM pg_tables 
WHERE tablename IN ('telegram_link_codes_backup', 'telegram_sessions')
AND schemaname = 'public';

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    'POLÍTICA CRIADA' as status
FROM pg_policies 
WHERE tablename IN ('telegram_link_codes_backup', 'telegram_sessions')
AND schemaname = 'public';

SELECT 'RLS WARNINGS RESOLVIDOS! Segurança ativada nas tabelas telegram_link_codes_backup e telegram_sessions' as resultado_final;
