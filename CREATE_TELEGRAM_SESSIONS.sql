-- Criar tabela para sessions do Telegram com transações pendentes
CREATE TABLE IF NOT EXISTS telegram_sessions (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT UNIQUE NOT NULL,
    pending_transaction TEXT, -- JSON string da transação pendente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por chat_id
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_chat_id ON telegram_sessions(chat_id);

-- Trigger para auto-update do updated_at
-- Criar função apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $func$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $func$ language 'plpgsql';
    END IF;
END $$;

-- Criar trigger apenas se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_telegram_sessions_updated_at') THEN
        CREATE TRIGGER update_telegram_sessions_updated_at 
            BEFORE UPDATE ON telegram_sessions 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Comentários para documentação
COMMENT ON TABLE telegram_sessions IS 'Sessões do bot Telegram com transações pendentes de confirmação';
COMMENT ON COLUMN telegram_sessions.chat_id IS 'ID único do chat do Telegram';
COMMENT ON COLUMN telegram_sessions.pending_transaction IS 'JSON da transação aguardando confirmação de tipo';
