# ðŸ” CREDENCIAIS STRIPE - MODO PRODUÃ‡ÃƒO

**Data:** 15 de Outubro de 2025  
**Status:** âœ… TODAS AS CREDENCIAIS OBTIDAS

---

## ðŸ”‘ API KEYS DE PRODUÃ‡ÃƒO

### **Chave PublicÃ¡vel (Frontend - Vercel):**
```
pk_live_51SIF7P2HBVUtKi5t0ekFiXDkAUfZzkudiy7Kxi5FCIqyjYMUO9E6BsM8xBOpSGN499C0pfVP7dy24RNmNT0CGSQq00Qvvlgb4R
```

### **Chave Secreta (Backend - Supabase):**
```
sk_live_REDACTED
```

---

## ðŸ›ï¸ PRICE IDS

### **Plano Semanal (R$ 8,90):**
```
price_1SIZyF2HBVUtKi5t6y6opjHe
```

### **Plano Mensal (R$ 19,90):**
```
price_1SIZz12HBVUtKi5tFtu75oX4
```

---

## âš ï¸ FALTA APENAS: WEBHOOK SECRET

VocÃª precisa criar o webhook de PRODUÃ‡ÃƒO para obter o `whsec_...`

### **Como criar:**

1. **Acesse:** https://dashboard.stripe.com/webhooks
2. **Certifique-se:** Estar em MODO PRODUÃ‡ÃƒO (ðŸ”´)
3. **Clique:** "+ Adicionar endpoint"
4. **URL do endpoint:**
   ```
   https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/stripe-webhook
   ```
5. **DescriÃ§Ã£o:**
   ```
   Webhook produÃ§Ã£o - Stater Premium
   ```
6. **Eventos para escutar:**
   - â˜‘ï¸ `checkout.session.completed`
   - â˜‘ï¸ `customer.subscription.deleted`
   - â˜‘ï¸ `invoice.payment_failed`
7. **Clique:** "Adicionar endpoint"
8. **Copie:** O "Signing secret" (`whsec_...`)

---

## ðŸ“‹ CONFIGURAR AGORA

### **1ï¸âƒ£ VERCEL - Environment Variables**

Acesse: https://vercel.com/dashboard

**Navegue:** Seu projeto â†’ Settings â†’ Environment Variables

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

**Depois:** Clique "Save" â†’ VÃ¡ em Deployments â†’ Redeploy

---

### **2ï¸âƒ£ SUPABASE - Edge Functions Secrets**

Acesse: https://supabase.com/dashboard

**Navegue:** Seu projeto â†’ Project Settings â†’ Edge Functions â†’ Secrets

**Adicione:**

```
STRIPE_SECRET_KEY
sk_live_REDACTED

STRIPE_WEBHOOK_SECRET
[Cole aqui depois de criar o webhook - whsec_XXX]
```

---

## âœ… CHECKLIST FINAL

- [x] âœ… Chave publicÃ¡vel obtida
- [x] âœ… Chave secreta obtida
- [x] âœ… Price ID semanal obtido
- [x] âœ… Price ID mensal obtido
- [ ] ðŸ”„ Criar webhook de produÃ§Ã£o
- [ ] ðŸ”„ Copiar webhook secret
- [ ] ðŸ”„ Configurar Vercel
- [ ] ðŸ”„ Configurar Supabase
- [ ] ðŸ”„ Redeploy Vercel
- [ ] ðŸ”„ Testar pagamento
- [ ] ðŸ”„ LANÃ‡AR! ðŸš€

---

## ðŸš€ PRÃ“XIMOS PASSOS

### **AGORA:**
1. Criar webhook de produÃ§Ã£o
2. Copiar `whsec_...`
3. Configurar Vercel (4 variÃ¡veis)
4. Configurar Supabase (2 secrets)
5. Redeploy

### **DEPOIS:**
1. Testar com cartÃ£o real
2. Verificar ativaÃ§Ã£o Premium
3. Divulgar nas redes
4. LUCRAR! ðŸ’°

---

âš ï¸ **NUNCA COMPARTILHE A CHAVE SECRETA!**

