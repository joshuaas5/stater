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
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_telegram_sessions_updated_at 
    BEFORE UPDATE ON telegram_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE telegram_sessions IS 'Sessões do bot Telegram com transações pendentes de confirmação';
COMMENT ON COLUMN telegram_sessions.chat_id IS 'ID único do chat do Telegram';
COMMENT ON COLUMN telegram_sessions.pending_transaction IS 'JSON da transação aguardando confirmação de tipo';
