-- Função RPC SIMPLES para verificar se email já existe
-- Esta função é mais direta e só retorna true/false

CREATE OR REPLACE FUNCTION email_exists(email_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se email existe no auth.users
  RETURN EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = email_input
  );
END;
$$;

-- Dar permissões
GRANT EXECUTE ON FUNCTION email_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION email_exists(text) TO anon;
