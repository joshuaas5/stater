# APLICAR FUNÇÃO RPC NO SUPABASE

## Passos para aplicar a correção da verificação de usuário existente:

### 1. Acesse o Dashboard do Supabase
- Vá para https://supabase.com/dashboard
- Entre no projeto do Stater

### 2. Acesse o SQL Editor
- No menu lateral, clique em "SQL Editor"

### 3. Execute a seguinte função RPC:

```sql
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
```

### 4. Clique em "Run" para executar

### 5. Teste a função (opcional):
```sql
-- Teste com um email existente
SELECT check_user_exists('teste@exemplo.com');
```

## O que esta função resolve:

1. **Verifica usuários existentes de forma segura** - Funciona no frontend sem expor dados sensíveis
2. **Detecta usuários Google** - Identifica quando um email já foi registrado via Google OAuth
3. **Detecta usuários de email** - Identifica quando um email já foi registrado via email/senha
4. **Evita tentativas de signup duplicadas** - Mostra mensagens claras para o usuário

## Mensagens que o usuário verá:

- **Email já registrado via Google**: "Este email já possui uma conta criada via Google. Use o botão 'Continuar com Google' para fazer login."
- **Email já registrado via Email**: "Este email já possui uma conta. Faça login ou recupere sua senha se não lembrar."

## Após aplicar a função:

O sistema agora conseguirá detectar corretamente quando um usuário tenta se registrar com um email que já existe, seja via Google OAuth ou email/senha, e exibirá mensagens claras em português para orientar o usuário sobre o que fazer.
