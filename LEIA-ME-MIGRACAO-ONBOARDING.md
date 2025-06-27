# 🚀 PASSO A PASSO - Migração de Onboarding no Supabase

## ⚠️ EXECUTAR OBRIGATORIAMENTE

Para que o onboarding funcione com persistência global, você DEVE executar a migração no Supabase Dashboard.

### 📋 Passos:

1. **Acesse o Supabase Dashboard**:
   - URL: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/sql/new

2. **Abra o SQL Editor**:
   - Clique em "SQL Editor" no menu lateral

3. **Execute a migração**:
   - Copie TODO o conteúdo do arquivo `migrate-onboarding-supabase.sql`
   - Cole no SQL Editor
   - Clique em "Run" ou pressione Ctrl+Enter

4. **Verificar se funcionou**:
   ```bash
   node test-supabase-simple.js
   ```
   - Deve mostrar "✅ Tabela user_onboarding encontrada!"

### 🎯 Resultado Esperado:

Após executar a migração:
- ✅ Onboarding aparece apenas na primeira vez que usuário loga NA VIDA
- ✅ Não depende mais de localStorage, navegador ou dispositivo
- ✅ Funciona globalmente entre diferentes sessões
- ✅ Dados seguros com Row Level Security

### 🐛 Se der erro:

1. Verifique se está logado no projeto correto no Supabase
2. Execute o SQL linha por linha se der erro geral
3. Verifique permissões de usuário no projeto
4. Execute `node test-supabase-simple.js` para diagnóstico

### 📊 Para verificar dados:

No Supabase Dashboard > Table Editor > user_onboarding
- Verá registros de usuários que completaram onboarding
- Campo `onboarding_completed` = true indica que já viram

---

**IMPORTANTE**: Esta migração é OBRIGATÓRIA para o funcionamento correto do onboarding global.
