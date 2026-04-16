# 🔑 CONFIGURAR VARIÁVEIS DE AMBIENTE - PRODUÇÃO

**Data:** 15 de Outubro de 2025  
**Status:** Price IDs de produção obtidos ✅

---

## 📋 PRICE IDS DE PRODUÇÃO

```
✅ Price ID Semanal:  price_1SIZyF2HBVUtKi5t6y6opjHe
✅ Price ID Mensal:   price_1SIZz12HBVUtKi5tFtu75oX4
```

---

## 🚀 PASSO 1: CONFIGURAR VERCEL

### **1. Acesse seu projeto no Vercel:**
```
https://vercel.com/dashboard
```

### **2. Navegue:**
- Clique no seu projeto (Stater)
- **Settings** (menu lateral)
- **Environment Variables**

### **3. Adicione/Edite estas variáveis:**

#### **VITE_STRIPE_PUBLIC_KEY**
```
Valor: chave_publica_producao_stripe51SIF7wFog1FXcH5v9uSLdcEArKlpzVSUEaCn2XjIoX3B98YL8y0q9kZxtZtMGhNaTz344ZLNB668nPtUG1Kk21H700Mq7mI5JP
```
⚠️ **ATENÇÃO:** Você vai precisar pegar a chave de PRODUÇÃO no Stripe!

#### **VITE_STRIPE_PRICE_WEEKLY**
```
Valor: price_1SIZyF2HBVUtKi5t6y6opjHe
```

#### **VITE_STRIPE_PRICE_MONTHLY**
```
Valor: price_1SIZz12HBVUtKi5tFtu75oX4
```

#### **VITE_SUPABASE_URL**
```
Valor: https://tmucbwlhkffrhtexmjze.supabase.co
```

#### **VITE_SUPABASE_ANON_KEY**
```
Valor: [sua chave anon atual - não mude se já tiver]
```

### **4. Clique em "Save"**

### **5. REDEPLOY:**
- Vá em: **Deployments**
- Clique nos **⋮** (três pontinhos) do último deploy
- Clique: **Redeploy**

---

## 🔧 PASSO 2: CONFIGURAR SUPABASE

### **1. Acesse Supabase:**
```
https://supabase.com/dashboard
```

### **2. Navegue:**
- Seu projeto
- **Project Settings** (engrenagem, canto inferior esquerdo)
- **Edge Functions**
- Aba **"Secrets"** ou **"Environment Variables"**

### **3. Configure estas secrets:**

#### **STRIPE_SECRET_KEY**
```
STRIPE_SECRET_KEY_PROD_PLACEHOLDERÇÃO]
```
⚠️ **VOCÊ PRECISA PEGAR NO STRIPE!**

Onde pegar:
1. https://dashboard.stripe.com/apikeys
2. Certifique-se de estar em **MODO PRODUÇÃO** (🔴)
3. Copie a **Secret key** (começa com `chave_secreta_producao_stripe`)

#### **STRIPE_WEBHOOK_SECRET**
```
STRIPE_WEBHOOK_SECRET_PLACEHOLDERÇÃO]
```
⚠️ **VOCÊ PRECISA CRIAR WEBHOOK DE PRODUÇÃO!**

Como criar:
1. https://dashboard.stripe.com/webhooks (em modo produção)
2. Clique: "+ Adicionar endpoint"
3. URL: `https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/stripe-webhook`
4. Eventos: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`
5. Clique "Adicionar"
6. Copie o **Signing secret** (segredo_assinatura_webhook...)

#### **SUPABASE_SERVICE_ROLE_KEY**
```
[sua service role key atual - já deve estar configurada]
```

---

## 📝 CHECKLIST COMPLETO

### **✅ O que você já tem:**
- [x] Price ID Semanal: `price_1SIZyF2HBVUtKi5t6y6opjHe`
- [x] Price ID Mensal: `price_1SIZz12HBVUtKi5tFtu75oX4`
- [x] Stripe Public Key (teste): `chave_publica_teste_stripe51SIF7w...`

### **🔄 O que você PRECISA fazer AGORA:**

#### **1. Pegar API Keys de PRODUÇÃO do Stripe:**
- [ ] Acessar: https://dashboard.stripe.com/apikeys (modo produção 🔴)
- [ ] Copiar: `chave_publica_producao_stripe51SIF7w...` (Publishable key)
- [ ] Copiar: `STRIPE_SECRET_KEY_PROD_PLACEHOLDER` (Secret key)

#### **2. Criar Webhook de PRODUÇÃO:**
- [ ] Acessar: https://dashboard.stripe.com/webhooks (modo produção 🔴)
- [ ] Criar endpoint: `https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/stripe-webhook`
- [ ] Copiar: `segredo_assinatura_webhook...` (Webhook secret)

#### **3. Configurar Vercel:**
- [ ] Adicionar `VITE_STRIPE_PUBLIC_KEY` (chave_publica_producao_stripe...)
- [ ] Adicionar `VITE_STRIPE_PRICE_WEEKLY` (price_1SIZyF...)
- [ ] Adicionar `VITE_STRIPE_PRICE_MONTHLY` (price_1SIZz1...)
- [ ] Redeploy

#### **4. Configurar Supabase:**
- [ ] Adicionar `STRIPE_SECRET_KEY` (chave_secreta_producao_stripe...)
- [ ] Adicionar `STRIPE_WEBHOOK_SECRET` (segredo_assinatura_webhook...)

#### **5. Testar:**
- [ ] Acessar https://stater.app
- [ ] Tentar assinar Premium
- [ ] Usar cartão teste: 4242 4242 4242 4242
- [ ] Verificar se ativa Premium no banco

---

## 🚨 IMPORTANTE: PEGAR AS KEYS DE PRODUÇÃO

### **Você ainda está em "Área restrita"?**

Se sim, primeiro complete:
1. https://dashboard.stripe.com/account/onboarding
2. Preencha todos os dados pessoais/bancários
3. Aguarde aprovação (geralmente instantânea)
4. **Depois** pegue as keys de produção

### **Conta já ativada?**

Se a área restrita sumiu:
1. https://dashboard.stripe.com/apikeys
2. Toggle: **"Modo ativo"** (🔴)
3. Copie as keys que começam com `chave_publica_producao_stripe` e `chave_secreta_producao_stripe`

---

## 💡 ATALHO: USAR MODO TESTE POR ENQUANTO

Se quiser lançar HOJE mas ainda não tem produção ativada:

### **Opção Temporária:**
1. Use as keys de TESTE por enquanto
2. Price IDs que você acabou de criar (já são de produção, mas você não pode cobrar ainda)
3. Lance Beta "gratuito temporário"
4. Quando Stripe aprovar, troca para keys de produção

**Configuração temporária:**
```
VITE_STRIPE_PUBLIC_KEY=chave_publica_teste_stripe51SIF7wFog1FXcH5v9uSLdcEArKlpzVSUEaCn2XjIoX3B98YL8y0q9kZxtZtMGhNaTz344ZLNB668nPtUG1Kk21H700Mq7mI5JP
VITE_STRIPE_PRICE_WEEKLY=price_1SIZyF2HBVUtKi5t6y6opjHe
VITE_STRIPE_PRICE_MONTHLY=price_1SIZz12HBVUtKi5tFtu75oX4
```

⚠️ **Mas não vai cobrar de verdade ainda!** Só quando ativar produção.

---

## 🎯 PRÓXIMOS PASSOS

**Escolha:**

### **A) Ativar Stripe e lançar com pagamentos HOJE:**
1. Complete: https://dashboard.stripe.com/account/onboarding
2. Pegue keys de produção
3. Configure Vercel + Supabase
4. Teste
5. LANCE! 🚀

### **B) Lançar Beta grátis e ativar pagamentos depois:**
1. Use keys de teste por enquanto
2. Lance Beta "funcionalidades premium liberadas temporariamente"
3. Complete Stripe nos próximos dias
4. Ativa pagamentos quando aprovar

---

**O QUE VOCÊ PREFERE FAZER?** Me avisa que te ajudo no próximo passo! 💪
