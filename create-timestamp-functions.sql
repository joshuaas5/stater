-- Funções para garantir timestamps corretos do servidor

-- Função para obter timestamp atual do servidor
CREATE OR REPLACE FUNCTION get_server_timestamp()
RETURNS TIMESTAMP WITH TIME ZONE AS $$
BEGIN
    RETURN NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para obter data atual do servidor (apenas data, sem hora)
CREATE OR REPLACE FUNCTION get_server_date()
RETURNS DATE AS $$
BEGIN
    RETURN CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Função para inserir transação com timestamp correto
CREATE OR REPLACE FUNCTION insert_transaction_with_timestamp(
    p_user_id UUID,
    p_description TEXT,
    p_amount DECIMAL,
    p_type TEXT,
    p_category TEXT DEFAULT 'outros'
)
RETURNS TABLE(
    id UUID,
    description TEXT,
    amount DECIMAL,
    type TEXT,
    category TEXT,
    date DATE,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE,
    user_id UUID
) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO transactions (user_id, description, amount, type, category, date, created_at, updated_at)
    VALUES (p_user_id, p_description, p_amount, p_type, p_category, CURRENT_DATE, NOW(), NOW())
    RETURNING 
        transactions.id,
        transactions.description,
        transactions.amount,
        transactions.type,
        transactions.category,
        transactions.date,
        transactions.created_at,
        transactions.updated_at,
        transactions.user_id;
END;
$$ LANGUAGE plpgsql;
