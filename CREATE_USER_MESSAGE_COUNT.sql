-- Criar tabela para contador de mensagens dos usuários
CREATE TABLE IF NOT EXISTS user_message_count (
    id SERIAL PRIMARY KEY,
    user_id UUID UNIQUE NOT NULL,
    message_count INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para busca rápida por user_id
CREATE INDEX IF NOT EXISTS idx_user_message_count_user_id ON user_message_count(user_id);

-- Trigger para auto-update do updated_at
CREATE OR REPLACE FUNCTION update_message_count_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_message_count_updated_at 
    BEFORE UPDATE ON user_message_count 
    FOR EACH ROW 
    EXECUTE FUNCTION update_message_count_updated_at();

-- Comentários para documentação
COMMENT ON TABLE user_message_count IS 'Contador de mensagens enviadas para o Stater IA por usuário';
COMMENT ON COLUMN user_message_count.user_id IS 'ID do usuário (referência auth.users)';
COMMENT ON COLUMN user_message_count.message_count IS 'Número total de mensagens enviadas pelo usuário';

-- Política de segurança RLS
ALTER TABLE user_message_count ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas seus próprios contadores
CREATE POLICY "Usuários podem ver apenas seus próprios contadores" ON user_message_count
    FOR ALL USING (auth.uid() = user_id);

-- Permitir inserção/atualização para usuários autenticados
CREATE POLICY "Usuários podem gerenciar seus próprios contadores" ON user_message_count
    FOR ALL USING (auth.uid() = user_id);
