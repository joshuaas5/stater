
# Configuração do Supabase

Este documento contém as instruções para configurar o Supabase corretamente para este aplicativo.

## URL e Chave do Supabase

O aplicativo utiliza as seguintes variáveis de ambiente:

- `VITE_SUPABASE_URL`: URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY`: Chave anônima do seu projeto Supabase

Essas variáveis já estão configuradas no código-fonte com valores padrão, mas você pode querer configurá-las como variáveis de ambiente em produção.

## Criação das Tabelas

Para criar as tabelas necessárias no Supabase, siga os passos abaixo:

1. Acesse o [Painel do Supabase](https://app.supabase.io)
2. Selecione seu projeto
3. Vá para a seção "SQL Editor"
4. Crie uma nova consulta
5. Cole o conteúdo do arquivo `src/lib/supabase-schema.sql`
6. Execute a consulta

## Autenticação

Este aplicativo utiliza a autenticação do Supabase. Certifique-se de que:

1. A autenticação por email/senha está habilitada
2. A autenticação Google está habilitada (opcional)

Para habilitar a autenticação Google:

1. Vá para "Authentication" > "Providers" no painel do Supabase
2. Ative o provedor "Google"
3. Configure o OAuth com suas credenciais do Google

## Políticas de Segurança

As políticas de segurança (RLS - Row Level Security) já estão definidas no script SQL. Elas garantem que:

- Usuários só podem ver, modificar e excluir seus próprios dados
- Dados de usuários diferentes são isolados

## Verificação da Configuração

Para verificar se tudo está configurado corretamente:

1. Crie uma conta no aplicativo
2. Verifique se os dados são salvos no Supabase
3. Teste as operações de CRUD (Create, Read, Update, Delete)

## Possíveis Problemas

Se encontrar algum erro, verifique:

1. A conexão com o Supabase está correta? (URL e chave)
2. As tabelas foram criadas corretamente?
3. As políticas de segurança estão funcionando como esperado?

## Next Steps e API

Para integrar com outros serviços ou APIs, você pode utilizar as Edge Functions do Supabase. Veja a [documentação do Supabase](https://supabase.com/docs/guides/functions) para mais informações.
