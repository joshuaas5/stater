# 🔐 CREDENCIAIS STRIPE - MODO PRODUÇÃO

**Data:** 15 de Outubro de 2025  
**Status:** ✅ TODAS AS CREDENCIAIS OBTIDAS

---

## 🔑 API KEYS DE PRODUÇÃO

### **Chave Publicável (Frontend - Vercel):**
```
pk_live_51SIF7P2HBVUtKi5t0ekFiXDkAUfZzkudiy7Kxi5FCIqyjYMUO9E6BsM8xBOpSGN499C0pfVP7dy24RNmNT0CGSQq00Qvvlgb4R
```

### **Chave Secreta (Backend - Supabase):**
```
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
```

---

## 🛍️ PRICE IDS

### **Plano Semanal (R$ 8,90):**
```
price_1SIZyF2HBVUtKi5t6y6opjHe
```

### **Plano Mensal (R$ 19,90):**
```
price_1SIZz12HBVUtKi5tFtu75oX4
```

---

## ⚠️ FALTA APENAS: WEBHOOK SECRET

Você precisa criar o webhook de PRODUÇÃO para obter o `whsec_...`

### **Como criar:**

1. **Acesse:** https://dashboard.stripe.com/webhooks
2. **Certifique-se:** Estar em MODO PRODUÇÃO (🔴)
3. **Clique:** "+ Adicionar endpoint"
4. **URL do endpoint:**
   ```
   https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/stripe-webhook
   ```
5. **Descrição:**
   ```
   Webhook produção - Stater Premium
   ```
6. **Eventos para escutar:**
   - ☑️ `checkout.session.completed`
   - ☑️ `customer.subscription.deleted`
   - ☑️ `invoice.payment_failed`
7. **Clique:** "Adicionar endpoint"
8. **Copie:** O "Signing secret" (`whsec_...`)

---

## 📋 CONFIGURAR AGORA

### **1️⃣ VERCEL - Environment Variables**

Acesse: https://vercel.com/dashboard

**Navegue:** Seu projeto → Settings → Environment Variables

**Adicione/Edite:**

```
VITE_STRIPE_PUBLIC_KEY
pk_live_51SIF7P2HBVUtKi5t0ekFiXDkAUfZzkudiy7Kxi5FCIqyjYMUO9E6BsM8xBOpSGN499C0pfVP7dy24RNmNT0CGSQq00Qvvlgb4R

VITE_STRIPE_PRICE_WEEKLY
price_1SIZyF2HBVUtKi5t6y6opjHe

VITE_STRIPE_PRICE_MONTHLY
price_1SIZz12HBVUtKi5tFtu75oX4

VITE_SUPABASE_URL
https://tmucbwlhkffrhtexmjze.supabase.co
```

**Depois:** Clique "Save" → Vá em Deployments → Redeploy

---

### **2️⃣ SUPABASE - Edge Functions Secrets**

Acesse: https://supabase.com/dashboard

**Navegue:** Seu projeto → Project Settings → Edge Functions → Secrets

**Adicione:**

```
STRIPE_SECRET_KEY
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

STRIPE_WEBHOOK_SECRET
[Cole aqui depois de criar o webhook - whsec_XXX]
```

---

## ✅ CHECKLIST FINAL

- [x] ✅ Chave publicável obtida
- [x] ✅ Chave secreta obtida
- [x] ✅ Price ID semanal obtido
- [x] ✅ Price ID mensal obtido
- [ ] 🔄 Criar webhook de produção
- [ ] 🔄 Copiar webhook secret
- [ ] 🔄 Configurar Vercel
- [ ] 🔄 Configurar Supabase
- [ ] 🔄 Redeploy Vercel
- [ ] 🔄 Testar pagamento
- [ ] 🔄 LANÇAR! 🚀

---

## 🚀 PRÓXIMOS PASSOS

### **AGORA:**
1. Criar webhook de produção
2. Copiar `whsec_...`
3. Configurar Vercel (4 variáveis)
4. Configurar Supabase (2 secrets)
5. Redeploy

### **DEPOIS:**
1. Testar com cartão real
2. Verificar ativação Premium
3. Divulgar nas redes
4. LUCRAR! 💰

---

⚠️ **NUNCA COMPARTILHE A CHAVE SECRETA!**
