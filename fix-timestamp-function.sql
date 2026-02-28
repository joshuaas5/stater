-- CORREÇÃO CRÍTICA: Função RPC com timestamp correto
-- Esta correção resolve o problema de transações aparecendo com data/hora incorreta

-- Remover função antiga se existir
DROP FUNCTION IF EXISTS insert_transaction_with_timestamp(UUID, TEXT, DECIMAL, TEXT, TEXT);

-- Criar função corrigida que preserva timestamp completo
CREATE OR REPLACE FUNCTION insert_transaction_with_timestamp(
    p_user_id UUID,
    p_description TEXT,
    p_amount DECIMAL,
    p_type TEXT,
    p_category TEXT DEFAULT 'outros'
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    amount DECIMAL,
    type TEXT,
    category TEXT,
    date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_id UUID
) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO transactions (user_id, title, amount, type, category, date, created_at, updated_at)
    VALUES (p_user_id, p_description, p_amount, p_type, p_category, NOW(), NOW(), NOW())
    RETURNING 
        transactions.id,
        transactions.title,
        transactions.amount,
        transactions.type,
        transactions.category,
        transactions.date,
        transactions.created_at,
        transactions.updated_at,
        transactions.user_id;
END;
$$ LANGUAGE plpgsql;

-- Garantir permissões corretas
GRANT EXECUTE ON FUNCTION insert_transaction_with_timestamp(UUID, TEXT, DECIMAL, TEXT, TEXT) TO authenticated;

-- Teste rápido da função (opcional - comentar se não quiser testar)
-- SELECT * FROM insert_transaction_with_timestamp(
--     auth.uid(),
--     'Teste de timestamp',
--     100.00,
--     'expense',
--     'teste'
-- );
