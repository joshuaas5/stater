# APLICAR CORREÇÃO ERRO 406 - PASSO A PASSO

## ⚡ PROBLEMA IDENTIFICADO:
- Bot consegue INSERIR dados (conectar usuário) ✅
- Bot NÃO consegue fazer SELECT (verificar se usuário está conectado) ❌
- Erro 406 na URL: `telegram_users?select=*&user_id=eq.xxx&is_active=eq.true`
- **NOVO**: Códigos expirando muito rapidamente (10 min → 15 min)
- **NOVO**: Códigos não são copiados automaticamente

## 🔧 CORREÇÃO A APLICAR:

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Entre no projeto ICTUS

2. **Abra o SQL Editor:**
   - Menu lateral → SQL Editor
   - Clique em "New query"

3. **Cole e Execute o SQL:**
   - Copie todo o conteúdo do arquivo `fix-telegram-406-DEFINITIVO.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

4. **Execute a Limpeza de Códigos:**
   - Copie todo o conteúdo do arquivo `limpar-codigos-telegram-expirados.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar

## 📋 O QUE OS SCRIPTS FAZEM:

### **Script 1 (fix-telegram-406-DEFINITIVO.sql):**
1. **Limpa todas as políticas RLS conflitantes**
2. **Cria políticas permissivas para:**
   - `telegram_users` (para verificação de sessão)
   - `telegram_link_codes` (para códigos de vinculação)
3. **Permite acesso total para:**
   - Service role (bot)
   - Anon role (aplicação)
   - Authenticated users (usuários logados)

### **Script 2 (limpar-codigos-telegram-expirados.sql):**
1. **Remove códigos expirados e antigos**
2. **Permite apenas 1 código ativo por usuário**
3. **Melhora performance das consultas**
4. **Reduz conflitos de "código inválido"**

## ✅ RESULTADO ESPERADO:

Após aplicar os scripts:
- ✅ Bot consegue conectar usuários (INSERT)
- ✅ Bot consegue verificar sessões (SELECT)
- ✅ Erro 406 eliminado
- ✅ Códigos válidos por 15 minutos (em vez de 10)
- ✅ Código copiado automaticamente ao ser gerado
- ✅ Apenas 1 código ativo por usuário (sem conflitos)
- ✅ Performance melhorada
- ✅ Fluxo completo funcionando

## 🧪 TESTE:

1. Execute os scripts SQL (ambos)
2. Recarregue a página do app (F5)
3. Acesse Configurações → Bot Telegram
4. Clique em "Gerar Código de Vinculação"
5. **Verifique se o código foi copiado automaticamente**
6. Teste conectar no bot Telegram
7. Envie uma mensagem para o bot
8. Verifique se não aparece "usuário não conectado"

---

**IMPORTANTE:** Estes scripts são DEFINITIVOS e resolvem o problema pela raiz, limpando conflitos, criando políticas corretas e otimizando a geração de códigos com cópia automática.
