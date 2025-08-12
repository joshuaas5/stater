# 🚀 GUIA DE DEPLOYMENT - TABELAS ESSENCIAIS

## 📋 **OBJETIVO:**
Criar as tabelas que estão faltando no Supabase para unificar o sistema de planos e permitir que o bot do Telegram funcione corretamente.

## 🎯 **TABELAS A CRIAR:**

### 1️⃣ **PRIMEIRA PRIORIDADE: `user_plans`**
**Arquivo:** `CREATE_USER_PLANS.sql`
**Motivo:** Sistema central de assinaturas - substitui localStorage

### 2️⃣ **SEGUNDA PRIORIDADE: `telegram_sessions`** 
**Arquivo:** `CREATE_TELEGRAM_SESSIONS.sql`
**Motivo:** Bot Telegram já usa esta tabela para transações pendentes

---

## 📝 **PASSO A PASSO PARA DEPLOYMENT:**

### **MÉTODO 1: Supabase Dashboard (RECOMENDADO)**

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Entre no seu projeto ICTUS

2. **Abra o SQL Editor:**
   - Menu lateral → "SQL Editor"
   - Clique em "New Query"

3. **Execute CREATE_USER_PLANS.sql:**
   - Copie todo o conteúdo do arquivo `CREATE_USER_PLANS.sql`
   - Cole no SQL Editor
   - Clique em "Run" (▶️)
   - ✅ Verifique se apareceu: "Success. No rows returned"

4. **Execute CREATE_TELEGRAM_SESSIONS.sql:**
   - Abra nova query
   - Copie todo o conteúdo do arquivo `CREATE_TELEGRAM_SESSIONS.sql`
   - Cole no SQL Editor
   - Clique em "Run" (▶️)
   - ✅ Verifique se apareceu: "Success. No rows returned"

5. **Verificar se as tabelas foram criadas:**
   - Menu lateral → "Table Editor"
   - Procure pelas tabelas: `user_plans` e `telegram_sessions`
   - ✅ Ambas devem aparecer na lista

---

### **MÉTODO 2: Via API (Alternativo)**

Se preferir via código, posso ajudar a criar um script que executa via API do Supabase.

---

## 🔍 **VERIFICAÇÃO PÓS-DEPLOYMENT:**

### **Teste 1: Verificar user_plans**
```sql
-- Execute no SQL Editor para testar
SELECT * FROM user_plans LIMIT 1;
-- Deve retornar: "No rows" (tabela vazia é normal)
```

### **Teste 2: Verificar telegram_sessions**
```sql
-- Execute no SQL Editor para testar  
SELECT * FROM telegram_sessions LIMIT 1;
-- Deve retornar: "No rows" (tabela vazia é normal)
```

### **Teste 3: Verificar RLS (Segurança)**
```sql
-- Verificar se RLS está ativo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_plans', 'telegram_sessions');
-- Ambas devem mostrar rowsecurity = true
```

---

## ⚠️ **PONTOS DE ATENÇÃO:**

1. **Ordem de Execução:** Execute `user_plans` ANTES de `telegram_sessions`
2. **Permissões:** Certifique-se de estar logado como owner do projeto
3. **Backup:** As tabelas têm `IF NOT EXISTS` - seguro executar múltiplas vezes
4. **RLS:** Ambas tabelas têm Row Level Security ativado por segurança

---

## 🎯 **PRÓXIMO PASSO APÓS DEPLOYMENT:**

Após criar as tabelas, precisaremos **migrar o UserPlanManager** para usar Supabase em vez de localStorage. Isso permitirá:

- ✅ Telegram bot funcionar com verificação premium
- ✅ Planos persistirem entre dispositivos  
- ✅ Sistema centralizado e consistente
- ✅ Backup automático dos dados de assinatura

---

## 🆘 **SE HOUVER ERRO:**

1. **Erro de permissão:** Verifique se você é owner do projeto
2. **Erro de syntax:** Copie exatamente como está nos arquivos
3. **Tabela já existe:** Normal - vai ignorar e continuar
4. **RLS Error:** Execute as policies uma por vez se necessário

**📞 Me chame quando terminar o deployment para continuarmos com a migração do código!**
