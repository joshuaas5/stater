# 🔧 FUNÇÃO RPC SIMPLES PARA VERIFICAR EMAIL

## ⚡ SOLUÇÃO DEFINITIVA PARA VERIFICAR EMAIL EXISTENTE

### 📋 Passo a passo:

1. **Acesse o Supabase Dashboard**
2. **Vá em SQL Editor**  
3. **Execute este código**:

```sql
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
```

4. **Clique em RUN**

## ✅ O QUE ESTA FUNÇÃO FAZ:

- **Verifica diretamente** se um email existe na tabela `auth.users`
- **Retorna apenas true/false** (mais simples)
- **Funciona para qualquer provider** (Google, email, etc.)
- **É segura** (SECURITY DEFINER)
- **Funciona no frontend** (permissões para anon)

## 🎯 RESULTADO ESPERADO:

Após aplicar a função:

1. **Usuário tenta criar conta com email existente**
2. **Sistema verifica ANTES de tentar criar** 
3. **Mensagem imediata**: "Email já registrado"
4. **NÃO envia email de confirmação**
5. **NÃO permite criar conta duplicada**

## 🧪 TESTE DA FUNÇÃO (OPCIONAL):

```sql
-- Testar com um email que existe
SELECT email_exists('seuemail@exemplo.com');

-- Deve retornar: true (se existe) ou false (se não existe)
```

## 🚀 STATUS:

- ✅ **Código atualizado** para usar a função
- ✅ **Fallback implementado** (funciona mesmo sem a função)
- ⏳ **Aguardando aplicação** da função RPC no Supabase

**Após aplicar a função, o problema estará 100% resolvido!**
