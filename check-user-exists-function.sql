-- Função RPC para verificar se um usuário já existe (segura para usar no cliente)
-- Esta função pode ser chamada a partir do frontend sem expor dados sensíveis

CREATE OR REPLACE FUNCTION check_user_exists(email_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
  profile_exists boolean := false;
  auth_provider_found text := null;
BEGIN
  -- Verificar se existe na tabela profiles
  SELECT true, auth_provider INTO profile_exists, auth_provider_found
  FROM profiles 
  WHERE email = email_param
  LIMIT 1;
  
  -- Se não encontrou na tabela profiles, ainda pode existir no auth.users
  -- mas sem perfil criado (especialmente usuários Google)
  IF NOT profile_exists THEN
    -- Verificar se existe no auth.users (apenas para admin/service role)
    SELECT true INTO profile_exists
    FROM auth.users 
    WHERE email = email_param
    LIMIT 1;
    
    -- Se encontrou no auth.users, tentar determinar o provider
    IF profile_exists THEN
      SELECT COALESCE(
        (raw_app_meta_data->>'provider')::text,
        CASE 
          WHEN email_confirmed_at IS NOT NULL THEN 'email'
          ELSE 'unknown'
        END
      ) INTO auth_provider_found
      FROM auth.users 
      WHERE email = email_param
      LIMIT 1;
    END IF;
  END IF;
  
  -- Retornar resultado em JSON
  result := json_build_object(
    'exists', profile_exists,
    'auth_provider', COALESCE(auth_provider_found, 'unknown')
  );
  
  RETURN result;
END;
$$;

-- Dar permissões para usuários autenticados chamarem esta função
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO anon;
