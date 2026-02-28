# 🔒 RESTAURAÇÃO DE SEGURANÇA RLS - GUIA COMPLETO

## ⚠️ SITUAÇÃO ATUAL
Você aplicou políticas RLS **MUITO PERMISSIVAS** (`USING (true)`) que são um **risco de segurança**:
- Qualquer usuário pode ver dados de outros usuários
- Não há controle de acesso adequado
- Dados sensíveis estão expostos

## 🎯 PLANO DE AÇÃO

### 1. PRIMEIRO - Confirmar que Service Worker foi corrigido
Antes de restaurar a segurança, **teste que o erro 406 foi resolvido**:

1. **Atualizar Service Worker** (se ainda não fez):
   ```javascript
   // Execute no console do navegador
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.getRegistrations().then(function(registrations) {
       registrations.forEach(reg => reg.unregister());
       if ('caches' in window) {
         caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))));
       }
       setTimeout(() => window.location.reload(), 1000);
     });
   }
   ```

2. **Testar fluxo Telegram**:
   - Gerar código no app ✅
   - Enviar para bot ✅  
   - Verificar conexão sem erro 406 ✅

### 2. SEGUNDO - Aplicar políticas RLS seguras
**APENAS após confirmar que não há mais erro 406**, execute no Supabase SQL Editor:

```sql
-- Execute o arquivo: restaurar-rls-seguro.sql
```

### 3. TERCEIRO - Testar segurança restaurada
Após aplicar as políticas seguras:

1. **Testar no app**: Gerar código e conectar no Telegram
2. **Verificar logs**: Não deve haver erro 406
3. **Confirmar segurança**: Usuários só veem seus próprios dados

## 🔒 POLÍTICAS SEGURAS QUE SERÃO APLICADAS

### TELEGRAM_USERS
```sql
-- Usuários autenticados: só seus próprios dados
CREATE POLICY "telegram_users_own_data" ON public.telegram_users
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role: acesso total (para o bot funcionar)
CREATE POLICY "telegram_users_service_access" ON public.telegram_users
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);
```

### TELEGRAM_LINK_CODES
```sql
-- Usuários autenticados: só seus próprios códigos
CREATE POLICY "telegram_codes_own_data" ON public.telegram_link_codes
    FOR ALL TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Service role: acesso total (para o bot validar códigos)
CREATE POLICY "telegram_codes_service_access" ON public.telegram_link_codes
    FOR ALL TO service_role
    USING (true) WITH CHECK (true);
```

## ✅ BENEFÍCIOS DA SEGURANÇA RESTAURADA

1. **Privacidade protegida**: Usuários só veem seus próprios dados
2. **Bot funcionando**: Service role mantém acesso necessário
3. **Sem erro 406**: Service Worker corrigido permite requisições
4. **Segurança adequada**: Controle de acesso por usuário
5. **Limpeza automática**: Códigos expirados podem ser removidos

## 🚨 CRONOGRAMA RECOMENDADO

1. **AGORA**: Testar Service Worker e confirmar erro 406 resolvido
2. **HOJE**: Aplicar políticas RLS seguras após confirmação
3. **MONITORAR**: Acompanhar logs para garantir que tudo funciona

## 📋 CHECKLIST DE SEGURANÇA

- [ ] Service Worker atualizado e funcionando
- [ ] Erro 406 completamente resolvido
- [ ] Fluxo Telegram funcionando normalmente
- [ ] Políticas RLS seguras aplicadas
- [ ] Testado que usuários só veem seus dados
- [ ] Bot continua funcionando após políticas seguras

---

**NÃO deixe as políticas permissivas por muito tempo!** Execute a restauração de segurança assim que confirmar que o Service Worker foi corrigido. 🔒
