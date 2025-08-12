-- Função segura para validar e consumir código do Telegram via RPC
-- Mantém RLS (usa SECURITY DEFINER) e limita a operação ao código informado

CREATE OR REPLACE FUNCTION public.link_telegram_code(in_code text)
RETURNS TABLE (
  user_id uuid,
  user_email text,
  user_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_email text;
  v_name text;
  v_expires_at timestamptz;
BEGIN
  -- Buscar código válido (não usado)
  SELECT tlc.user_id, tlc.user_email, tlc.user_name, tlc.expires_at
    INTO v_user_id, v_email, v_name, v_expires_at
  FROM telegram_link_codes tlc
  WHERE tlc.code = in_code
    AND tlc.used_at IS NULL
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVALID_OR_USED';
  END IF;

  -- Verificar expiração
  IF v_expires_at <= NOW() THEN
    RAISE EXCEPTION 'EXPIRED';
  END IF;

  -- Marcar como usado
  UPDATE telegram_link_codes
     SET used_at = NOW()
   WHERE code = in_code;

  -- Retornar dados do usuário
  RETURN QUERY SELECT v_user_id, v_email, v_name;
END;
$$;

-- Permissões mínimas necessárias
REVOKE ALL ON FUNCTION public.link_telegram_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_telegram_code(text) TO anon;
GRANT EXECUTE ON FUNCTION public.link_telegram_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_telegram_code(text) TO service_role;
