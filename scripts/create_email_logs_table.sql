-- Script para criar a tabela de logs de email no Supabase

-- Verificar se a tabela já existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_logs') THEN
        -- Criar a tabela de logs de email
        CREATE TABLE public.email_logs (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            email_to VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            status VARCHAR(50) NOT NULL,
            error_message TEXT,
            type VARCHAR(50) NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ
        );

        -- Comentários na tabela
        COMMENT ON TABLE public.email_logs IS 'Registros de emails enviados pelo sistema';
        COMMENT ON COLUMN public.email_logs.id IS 'ID único do log';
        COMMENT ON COLUMN public.email_logs.user_id IS 'ID do usuário para quem o email foi enviado';
        COMMENT ON COLUMN public.email_logs.email_to IS 'Endereço de email do destinatário';
        COMMENT ON COLUMN public.email_logs.subject IS 'Assunto do email enviado';
        COMMENT ON COLUMN public.email_logs.status IS 'Status do envio (sent, failed)';
        COMMENT ON COLUMN public.email_logs.error_message IS 'Mensagem de erro, se houver';
        COMMENT ON COLUMN public.email_logs.type IS 'Tipo do email (weekly_summary, bill_reminder, etc.)';
        COMMENT ON COLUMN public.email_logs.created_at IS 'Data e hora de criação do registro';
        COMMENT ON COLUMN public.email_logs.updated_at IS 'Data e hora da última atualização do registro';

        -- Configurar RLS (Row Level Security)
        ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

        -- Criar políticas de segurança
        -- Apenas administradores podem inserir registros
        CREATE POLICY "Apenas administradores podem inserir logs" ON public.email_logs
            FOR INSERT TO authenticated
            USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));

        -- Usuários podem ver apenas seus próprios logs
        CREATE POLICY "Usuários veem apenas seus próprios logs" ON public.email_logs
            FOR SELECT TO authenticated
            USING (auth.uid() = user_id);

        -- Administradores podem ver todos os logs
        CREATE POLICY "Administradores veem todos os logs" ON public.email_logs
            FOR SELECT TO authenticated
            USING (auth.uid() IN (SELECT id FROM auth.users WHERE is_admin = true));

        -- Criar trigger para atualizar o campo updated_at
        CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON public.email_logs
            FOR EACH ROW
            EXECUTE FUNCTION public.set_updated_at();

        -- Conceder permissões
        GRANT SELECT ON public.email_logs TO authenticated;
        GRANT INSERT ON public.email_logs TO service_role;

        RAISE NOTICE 'Tabela email_logs criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela email_logs já existe';
    END IF;
END $$;
