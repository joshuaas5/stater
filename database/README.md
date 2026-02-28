# Database Setup - User Transaction Count

## Descrição
Esta tabela é necessária para o sistema de reward ads do Stater. Ela conta quantas transações cada usuário criou para determinar quando mostrar anúncios de recompensa.

## Como executar no Supabase

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione o projeto do Stater

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Ou acesse diretamente: `https://supabase.com/dashboard/project/[SEU_PROJECT_ID]/sql`

3. **Execute o script**
   - Copie todo o conteúdo do arquivo `create_user_transaction_count.sql`
   - Cole no SQL Editor
   - Clique em "Run" ou pressione `Ctrl+Enter`

4. **Verificar se funcionou**
   - Vá para "Table Editor" no menu lateral
   - Procure pela tabela `user_transaction_count`
   - Ela deve aparecer na lista de tabelas

## Funcionalidades da tabela

- **Contagem automática**: Incrementa a cada nova transação
- **Reward ads**: Mostra anúncio a cada 5 transações
- **Segurança RLS**: Usuários só veem seus próprios dados
- **Performance**: Índices otimizados para buscas rápidas
- **Auditoria**: Timestamps automáticos de criação e atualização

## Problemas conhecidos

Se você receber erro sobre `auth.users`, certifique-se de que:
1. O RLS está habilitado no projeto
2. Você tem permissões de administrador
3. A autenticação está configurada corretamente

## Testando

Após criar a tabela, você pode testar:

1. Crie uma transação no app
2. Verifique se o contador foi incrementado:
   ```sql
   SELECT * FROM user_transaction_count WHERE user_id = auth.uid();
   ```
3. Crie mais 4 transações para verificar se o reward ad aparece

## Manutenção

Para resetar o contador de um usuário específico:
```sql
UPDATE user_transaction_count 
SET transaction_count = 0 
WHERE user_id = 'USER_ID_AQUI';
```

Para ver estatísticas gerais:
```sql
SELECT 
  COUNT(*) as total_users,
  AVG(transaction_count) as avg_transactions,
  MAX(transaction_count) as max_transactions
FROM user_transaction_count;
```
