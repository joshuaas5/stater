# Sistema de Reward Ads - Implementação das Novas Estratégias

## ✅ IMPLEMENTAÇÕES CONCLUÍDAS

### 1. 🤖 **FinancialAdvisorPage** - Reward Ad na Primeira Mensagem
**Localização:** `src/pages/FinancialAdvisorPage.tsx`

**Estratégia Implementada:**
- **Usuários FREE:** Sempre mostram reward ad na primeira mensagem
- **Lógica:** Se reward ad assistido → mensagem processada; Se não assistido → verifica mensagens gratuitas restantes
- **Fallback:** Se há mensagens gratuitas, consome uma; se não há → paywall
- **Cooldown:** 1 hora entre reward ads para financial_analysis

**Código Principal:**
```typescript
// Verificar se o usuário é premium
const userPlan = await UserPlanManager.getUserPlan(user.id);
const isPremium = userPlan.planType !== 'free';

if (!isPremium) {
  // Verificar cooldown do reward ad para messages
  const cooldownResult = await RewardCooldownManager.checkCooldownStatus(user.id, 'financial_analysis');
  
  if (cooldownResult.canWatchAd) {
    // Mostrar reward ad
    const adResult = await AdManager.showRewardedAd('messages');
    // ... lógica de processamento
  }
}
```

### 2. 📱 **Mídia Premium** - Paywall Imediato
**Localização:** `src/pages/FinancialAdvisorPage.tsx`

**Estratégia Implementada:**
- **PDFs, Imagens, Áudios:** Exigem premium imediatamente (não reward ads)
- **Comportamento:** Usuários FREE veem paywall imediato ao tentar usar mídia
- **Justificativa:** Recursos mais avançados devem direcionar para conversão premium

**Código Principal:**
```typescript
// Para PDFs, imagens e mídias - PAYWALL IMEDIATO para usuários FREE
if (isPdf || (!isTextFile && !imageBase64.startsWith('data:text/'))) {
  const userPlan = await UserPlanManager.getUserPlan(user.id);
  const isPremium = userPlan.planType !== 'free';
  
  if (!isPremium) {
    // Mostrar paywall imediato
    setShowPaywall(true);
    return;
  }
}
```

### 3. 💰 **Sistema de Contador de Transações** - Reward Ad a cada 5 transações
**Localização:** `src/utils/transactionCounter.ts` + `src/pages/Transactions.tsx`

**Estratégia Implementada:**
- **Contador:** Incrementa a cada transação adicionada/clonada
- **Trigger:** A cada 5ª transação, mostra reward ad automaticamente
- **Banco de Dados:** Tabela `user_transaction_count` para persistência
- **Tipo de Ad:** `transactions`

**Componentes Criados:**
- `TransactionCounter.incrementAndCheck()`: Incrementa e verifica se deve mostrar ad
- Integração na função `handleSaveClonedTransaction()`

### 4. 📋 **Sistema de Contador de Bills** - Reward Ad a cada 3 bills
**Localização:** `src/utils/billCounter.ts` + `src/pages/AddBillPage.tsx`

**Estratégia Implementada:**
- **Contador:** Incrementa a cada bill criada
- **Trigger:** A cada 3ª bill, mostra reward ad automaticamente
- **Banco de Dados:** Tabela `user_bill_count` para persistência
- **Lógica Especial:** Bills recorrentes contam como 1 (não por parcela)

**Código Principal:**
```typescript
// Para bills recorrentes, incrementar o contador apenas uma vez
const incrementCount = values.isRecurring && !values.isInfiniteRecurrence && totalInstallments > 1 ? 1 : billsAdded;

for (let i = 0; i < incrementCount; i++) {
  const counterResult = await BillCounter.incrementAndCheck(user.id);
  
  if (counterResult.shouldShowRewardAd) {
    const adResult = await AdManager.showRewardedAd('bills');
    // ... lógica de recompensa
  }
}
```

### 5. 📊 **ExportReportPage** - Reward Ad Imediato
**Localização:** `src/pages/ExportReportPage.tsx`

**Estratégia Implementada:**
- **Primeiro Acesso:** Usuários FREE veem reward ad imediatamente
- **Cooldown:** 1 hora entre acessos para report_downloads
- **Fallback:** Se cooldown ativo, informa tempo restante ou sugere premium

**Código Principal:**
```typescript
// Para usuários FREE, mostrar reward ad imediatamente no primeiro acesso
const userPlan = await UserPlanManager.getUserPlan(user.id);
const isPremium = userPlan.planType !== 'free';

if (!isPremium) {
  const cooldownResult = await RewardCooldownManager.checkCooldownStatus(user.id, 'report_downloads');
  
  if (cooldownResult.canWatchAd) {
    const adResult = await AdManager.showRewardedAd('messages');
    // ... lógica de acesso
  }
}
```

## 🗄️ **BANCO DE DADOS**

### Tabelas Criadas:
**Arquivo:** `supabase-transaction-counter.sql`

1. **`user_transaction_count`**
   - Contador de transações por usuário
   - Trigger para reward ad a cada 5 transações

2. **`user_bill_count`**
   - Contador de bills por usuário  
   - Trigger para reward ad a cada 3 bills

### Políticas RLS:
- Usuários só acessam próprios contadores
- CRUD completo com segurança
- Índices para performance

## 🎯 **RESUMO DAS ESTRATÉGIAS**

| Funcionalidade | Usuário FREE | Usuário Premium | Tipo de Ad |
|---|---|---|---|
| **Mensagens IA** | Reward ad na 1ª mensagem | Ilimitado | `messages` |
| **PDFs/Imagens/Áudios** | Paywall imediato | Ilimitado | - |
| **Transações** | Reward ad a cada 5 | Ilimitado | `transactions` |
| **Bills** | Reward ad a cada 3 | Ilimitado | `bills` |
| **Relatórios** | Reward ad imediato | Ilimitado | `messages` |

## 🛠️ **ARQUIVOS MODIFICADOS**

1. `src/pages/FinancialAdvisorPage.tsx` - Sistema de reward ad para mensagens e paywall para mídia
2. `src/pages/Transactions.tsx` - Integração do contador de transações
3. `src/pages/AddBillPage.tsx` - Integração do contador de bills
4. `src/pages/ExportReportPage.tsx` - Reward ad imediato para relatórios
5. `src/utils/transactionCounter.ts` - Novo utilitário para contador de transações
6. `src/utils/billCounter.ts` - Novo utilitário para contador de bills
7. `supabase-transaction-counter.sql` - Script SQL para tabelas de contadores

## ✅ **STATUS DO BUILD**
- ✅ Build bem-sucedido
- ✅ Sem erros de TypeScript
- ✅ Todas as funcionalidades integradas
- ✅ Compatível com sistema existente

## 🎯 **PRÓXIMOS PASSOS SUGERIDOS**

1. **Executar SQL no Supabase:** Aplicar `supabase-transaction-counter.sql`
2. **Testes de QA:** Verificar funcionamento em ambiente de desenvolvimento
3. **Análise de Métricas:** Monitorar impacto nas conversões premium
4. **Ajustes de Cooldown:** Otimizar tempos baseado no comportamento do usuário
