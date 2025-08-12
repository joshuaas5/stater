-- VERSÃO SIMPLIFICADA - Criar tabela telegram_sessions sem conflitos
-- Execute este SQL se a versão principal der erro de trigger

CREATE TABLE IF NOT EXISTS telegram_sessions (
    id SERIAL PRIMARY KEY,
    chat_id BIGINT UNIQUE NOT NULL,
    pending_transaction TEXT, -- JSON string da transação pendente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por chat_id
CREATE INDEX IF NOT EXISTS idx_telegram_sessions_chat_id ON telegram_sessions(chat_id);

-- Comentários para documentação
COMMENT ON TABLE telegram_sessions IS 'Sessões do bot Telegram com transações pendentes de confirmação';
COMMENT ON COLUMN telegram_sessions.chat_id IS 'ID único do chat do Telegram';
COMMENT ON COLUMN telegram_sessions.pending_transaction IS 'JSON da transação aguardando confirmação de tipo';

-- NOTA: Se já existe uma função update_updated_at_column() no banco,
-- ela será reutilizada automaticamente pela tabela user_message_count
-- Não precisamos recriar triggers que já existem
