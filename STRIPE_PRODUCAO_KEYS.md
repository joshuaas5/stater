# 🔑 COMO PEGAR API KEYS DE PRODUÇÃO - STRIPE

**Data:** 15 de Outubro de 2025  
**Objetivo:** Ativar modo produção e obter chaves reais

---

## 🚀 PASSO A PASSO COMPLETO

### **PASSO 1: Ativar Modo Produção no Stripe**

#### 1. Acesse o Stripe Dashboard:
```
https://dashboard.stripe.com
```

#### 2. Procure o toggle no TOPO da página:

```
┌─────────────────────────────────────────────┐
│  🔄 Modo de teste  ◀── CLIQUE AQUI          │
│                                              │
│  Mudar para: Modo ativo (produção)          │
└─────────────────────────────────────────────┘
```

#### 3. Clique para alternar:
- ❌ "Modo de teste" → 🔄
- ✅ "Modo ativo" (ou "Live mode")

---

### **PASSO 2: Obter API Keys de Produção**

#### 1. Com modo produção ativo, acesse:
```
https://dashboard.stripe.com/apikeys
```

**OU navegue:**
- Dashboard → Developers (canto inferior esquerdo)
- Developers → API keys

#### 2. Você verá DUAS seções:

```
┌─────────────────────────────────────────────┐
│ 🔴 Modo ativo (Live keys)                   │
├─────────────────────────────────────────────┤
│                                              │
│ Publishable key (Chave publicável):         │
│ pk_live_51SIF7wFog1FXcH5v...                │
│ [👁️ Mostrar] [📋 Copiar]                    │
│                                              │
│ Secret key (Chave secreta):                 │
│ sk_live_51SIF7wFog1FXcH5v... (oculta)       │
│ [👁️ Revelar] [📋 Copiar]                    │
│                                              │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 🔵 Modo de teste (Test keys)                │
│ (Suas keys atuais que você já tem)          │
└─────────────────────────────────────────────┘
```

#### 3. Copie as 2 chaves de PRODUÇÃO:

**Publishable key (começa com `pk_live_`):**
```
pk_live_51SIF7wFog1FXcH5v9uSLdcEArKlpzVSUEaCn2XjIoX3B98YL8y0q9kZxtZtMGhNaTz344ZLNB668nPtUG1Kk21H700Mq7mI5JP
```
👆 Essa vai no FRONTEND (Vercel)

**Secret key (começa com `sk_live_`):**
```
sk_live_51SIF7wFog1FXcH5v[resto da chave]
```
👆 Essa vai no BACKEND (Supabase) - NUNCA exponha!

---

### **PASSO 3: Obter Webhook Secret de Produção**

#### 1. Ainda no modo produção, acesse:
```
https://dashboard.stripe.com/webhooks
```

#### 2. Você verá 2 abas:

```
┌─────────────────────────────────────────────┐
│ [🔴 Webhooks ativos] [🔵 Webhooks de teste] │
├─────────────────────────────────────────────┤
│                                              │
│ Você precisa CRIAR um novo webhook para     │
│ produção (o de teste não funciona aqui!)    │
│                                              │
└─────────────────────────────────────────────┘
```

#### 3. Clique: **"+ Adicionar endpoint"**

#### 4. Preencha:

**URL do endpoint:**
```
https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/stripe-webhook
```

**Descrição:**
```
Webhook de produção - Stater Premium
```

**Eventos para escutar (IMPORTANTE!):**
```
☑️ checkout.session.completed
☑️ customer.subscription.deleted
☑️ invoice.payment_failed
```

**Versão da API:**
```
2023-10-16 (ou mais recente)
```

#### 5. Clique: **"Adicionar endpoint"**

#### 6. Copie o **Signing secret:**

```
┌─────────────────────────────────────────────┐
│ Signing secret:                              │
│ whsec_[código de produção]                   │
│ [👁️ Revelar] [📋 Copiar]                    │
└─────────────────────────────────────────────┘
```

**Exemplo:**
```
whsec_REDACTED
```

---

### **PASSO 4: Atualizar Price IDs (se necessário)**

#### Os Price IDs também mudam em produção!

#### 1. Acesse seus produtos:
```
https://dashboard.stripe.com/products
```

#### 2. Certifique-se que está em **Modo ativo** (🔴)

#### 3. Clique em cada produto:

**Plano Semanal:**
```
Nome: Stater Premium - Plano Semanal
Preço: R$ 8,90 / semana
Price ID: price_[código de produção]
```

**Plano Mensal:**
```
Nome: Stater Premium - Plano Mensal  
Preço: R$ 19,90 / mês
Price ID: price_[código de produção]
```

#### 4. Se os produtos NÃO existem em produção:

Você precisa CRIAR NOVAMENTE em modo produção:
- Acesse: https://dashboard.stripe.com/products
- Clique: "+ Adicionar produto"
- Preencha igual ao teste:
  - Nome: Stater Premium - Plano Semanal
  - Preço: R$ 8,90 BRL
  - Recorrência: A cada semana
  - Clique "Salvar produto"
- Copie o **Price ID** gerado

Repita para o plano mensal!

---

## 📝 RESUMO DAS KEYS QUE VOCÊ PRECISA

Depois de seguir os passos acima, você terá:

```env
# STRIPE - PRODUÇÃO
VITE_STRIPE_PUBLIC_KEY=pk_live_51SIF7wFog1FXcH5v...
STRIPE_SECRET_KEY=sk_live_51SIF7wFog1FXcH5v...
STRIPE_WEBHOOK_SECRET=whsec_[código_produção]

# STRIPE PRICE IDS - PRODUÇÃO
VITE_STRIPE_PRICE_WEEKLY=price_[código_produção_semanal]
VITE_STRIPE_PRICE_MONTHLY=price_[código_produção_mensal]
```

---

## 🔧 ONDE COLOCAR CADA KEY

### **1. Vercel (Frontend)**

Acesse: https://vercel.com/dashboard

1. Clique no seu projeto
2. Settings → Environment Variables
3. Adicione/Edite:

```
VITE_STRIPE_PUBLIC_KEY
Valor: pk_live_51SIF7wFog1FXcH5v...

VITE_STRIPE_PRICE_WEEKLY
Valor: price_[código_produção]

VITE_STRIPE_PRICE_MONTHLY
Valor: price_[código_produção]
```

4. Clique **"Save"**
5. Vá em: Deployments → [Último deploy] → ⋮ → **Redeploy**

---

### **2. Supabase (Backend)**

#### Via Dashboard (Recomendado):

1. Acesse: https://supabase.com/dashboard
2. Seu projeto → Project Settings → Edge Functions
3. Vá em **"Secrets"** ou **"Environment Variables"**
4. Adicione:

```
STRIPE_SECRET_KEY
Valor: sk_live_51SIF7wFog1FXcH5v...

STRIPE_WEBHOOK_SECRET
Valor: whsec_[código_produção]
```

#### Via CLI (Alternativo):

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_XXX
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_XXX
```

---

## ✅ CHECKLIST DE VERIFICAÇÃO

Antes de usar as keys de produção:

- [ ] ✅ Modo produção ATIVADO no Stripe
- [ ] ✅ API Keys de produção copiadas (pk_live_ e sk_live_)
- [ ] ✅ Webhook de PRODUÇÃO criado
- [ ] ✅ Webhook secret de produção copiado (whsec_)
- [ ] ✅ Produtos existem em modo produção
- [ ] ✅ Price IDs de produção copiados
- [ ] ✅ Keys atualizadas no Vercel
- [ ] ✅ Secrets atualizados no Supabase
- [ ] ✅ Vercel redeployado

---

## 🧪 TESTANDO PRODUÇÃO

### **⚠️ ATENÇÃO: Agora os pagamentos são REAIS!**

1. Acesse: https://stater.app
2. Faça login
3. Clique em "Assinar Premium"
4. Use um **cartão de teste** primeiro:
   ```
   4242 4242 4242 4242
   Data: 12/28
   CVV: 123
   ```

5. Se funcionar, teste com **seu próprio cartão**
6. Cancele imediatamente se não quiser cobrar

### **Verificar se funcionou:**

1. Stripe Dashboard → Pagamentos
   - Deve aparecer o pagamento
2. Supabase → Table Editor → profiles
   - `plan_type` deve ser "premium"
   - `subscription_status` deve ser "active"

---

## 🚨 IMPORTANTE - SEGURANÇA

### **❌ NUNCA FAÇA:**
- Commitar sk_live_ no Git
- Expor sk_live_ no frontend
- Compartilhar whsec_ publicamente

### **✅ SEMPRE FAÇA:**
- Mantenha sk_live_ apenas no Supabase
- Use pk_live_ no frontend (essa pode ser pública)
- Rotacione keys se houver vazamento

---

## 🔄 VOLTAR PARA TESTE (se precisar)

1. Stripe Dashboard → Toggle no topo
2. Mude de "Modo ativo" → "Modo de teste"
3. Use as keys antigas (pk_test_ e sk_test_)

---

## 📞 PRECISA DE AJUDA?

Se não encontrar algo:
- Suporte Stripe: https://support.stripe.com/contact
- Chat ao vivo: Disponível no dashboard (canto inferior direito)

---

**PRONTO!** Agora você sabe exatamente onde pegar cada key! 🚀

Alguma dúvida sobre algum passo específico?
