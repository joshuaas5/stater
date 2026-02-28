# 🚀 CONFIGURAÇÃO FINAL - MODO PRODUÇÃO

**Data:** 15 de Outubro de 2025  
**Status:** ✅ TODAS AS CREDENCIAIS OBTIDAS - PRONTO PARA CONFIGURAR

---

## 🔐 CREDENCIAIS COMPLETAS

### **Stripe - API Keys:**
```
Publishable Key: pk_live_51SIF7P2HBVUtKi5t0ekFiXDkAUfZzkudiy7Kxi5FCIqyjYMUO9E6BsM8xBOpSGN499C0pfVP7dy24RNmNT0CGSQq00Qvvlgb4R
Secret Key: sk_live_REDACTED
Webhook Secret: whsec_REDACTED
```

### **Stripe - Price IDs:**
```
Semanal (R$ 8,90):  price_1SIZyF2HBVUtKi5t6y6opjHe
Mensal (R$ 19,90):  price_1SIZz12HBVUtKi5tFtu75oX4
```

---

## ⚡ CONFIGURAR AGORA

### **1️⃣ VERCEL - PASSO A PASSO**

#### **Acesse:**
```
https://vercel.com/dashboard
```

#### **Navegue:**
1. Clique no seu projeto (Stater/ICTUS)
2. **Settings** (menu lateral)
3. **Environment Variables**

#### **Adicione/Edite estas 4 variáveis:**

**Variável 1:**
```
Name: VITE_STRIPE_PUBLIC_KEY
Value: pk_live_51SIF7P2HBVUtKi5t0ekFiXDkAUfZzkudiy7Kxi5FCIqyjYMUO9E6BsM8xBOpSGN499C0pfVP7dy24RNmNT0CGSQq00Qvvlgb4R
Environment: Production, Preview, Development (marque todos)
```

**Variável 2:**
```
Name: VITE_STRIPE_PRICE_WEEKLY
Value: price_1SIZyF2HBVUtKi5t6y6opjHe
Environment: Production, Preview, Development (marque todos)
```

**Variável 3:**
```
Name: VITE_STRIPE_PRICE_MONTHLY
Value: price_1SIZz12HBVUtKi5tFtu75oX4
Environment: Production, Preview, Development (marque todos)
```

**Variável 4:**
```
Name: VITE_SUPABASE_URL
Value: https://tmucbwlhkffrhtexmjze.supabase.co
Environment: Production, Preview, Development (marque todos)
```

#### **Depois de adicionar todas:**
1. Clique em **"Save"** em cada uma
2. Vá em **"Deployments"** (menu lateral)
3. Encontre o último deploy
4. Clique nos **⋮** (três pontinhos)
5. Clique em **"Redeploy"**
6. Aguarde ~2 minutos

---

### **2️⃣ SUPABASE - PASSO A PASSO**

#### **Acesse:**
```
https://supabase.com/dashboard
```

#### **Navegue:**
1. Selecione seu projeto
2. **⚙️ Project Settings** (engrenagem, canto inferior esquerdo)
3. **Edge Functions**
4. Aba **"Secrets"** ou **"Environment Variables"**

#### **Adicione estas 2 secrets:**

**Secret 1:**
```
Name: STRIPE_SECRET_KEY
Value: sk_live_REDACTED
```

**Secret 2:**
```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_REDACTED
```

#### **Como adicionar no Supabase:**
- Se tiver interface: Clique "New secret" → Cole nome → Cole valor → Save
- Se não tiver interface, use CLI:
  ```bash
  supabase secrets set STRIPE_SECRET_KEY=sk_live_REDACTED
  supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_REDACTED
  ```

---

## 🧪 TESTAR TUDO

### **Após configurar Vercel e Supabase:**

#### **1. Aguarde o deploy do Vercel terminar**
- Vercel → Deployments → Status: ✅ Ready

#### **2. Acesse seu site:**
```
https://stater.app
```

#### **3. Faça login**

#### **4. Tente assinar Premium:**
- Clique em "Premium" ou "Assinar"
- Escolha um plano (Semanal ou Mensal)
- Deve redirecionar para Stripe Checkout

#### **5. Use cartão de TESTE primeiro:**
```
Número: 4242 4242 4242 4242
Data: 12/28
CVV: 123
CEP: 12345-678
```

#### **6. Complete o pagamento**

#### **7. Verifique se ativou Premium:**
- Você deve ser redirecionado de volta para o dashboard
- Premium deve estar ativo
- Verifique no Supabase → Table Editor → profiles
  - `plan_type` deve ser "premium"
  - `subscription_status` deve ser "active"

---

## ✅ CHECKLIST FINAL

- [ ] ✅ Vercel configurado (4 variáveis)
- [ ] ✅ Vercel redeployado
- [ ] ✅ Deploy concluído (Ready)
- [ ] ✅ Supabase configurado (2 secrets)
- [ ] ✅ Teste com cartão fake funcionou
- [ ] ✅ Premium ativado corretamente
- [ ] ✅ Teste com cartão REAL (seu próprio)
- [ ] 🚀 **LANÇAR PARA O PÚBLICO!**

---

## 🎉 DEPOIS DE TESTAR

### **Se tudo funcionar:**

1. **Divulgue nas redes sociais:**
   ```
   🎉 Stater está OFICIAL!
   
   Gestão financeira inteligente com IA
   ✅ Telegram Bot integrado
   ✅ OCR de documentos
   ✅ Análise financeira avançada
   
   Comece grátis: https://stater.app
   Premium a partir de R$ 8,90/semana
   
   #FinTech #GestãoFinanceira #IA
   ```

2. **Monitore os primeiros usuários:**
   - Stripe Dashboard → Pagamentos
   - Supabase Dashboard → Table Editor → profiles
   - Vercel Analytics → Tráfego

3. **Crie cupom de lançamento (opcional):**
   - Stripe → Produtos → Cupons
   - Código: `LANCAMENTO50`
   - 50% OFF no primeiro mês

---

## 🚨 SE DER ERRO

### **Erro ao redirecionar para Stripe:**
- Verifique se Vercel fez redeploy
- Abra console (F12) e veja erros
- Confirme que variáveis estão salvas

### **Pagamento não ativa Premium:**
- Verifique logs do webhook no Stripe
- Stripe Dashboard → Webhooks → Seu webhook → Logs
- Supabase → Edge Functions → stripe-webhook → Logs

### **Precisa de ajuda:**
- Manda print do erro
- Console do navegador (F12)
- Logs do Stripe/Supabase

---

## 💰 PRÓXIMOS PASSOS (PÓS-LANÇAMENTO)

1. **Semana 1:**
   - Monitorar erros
   - Coletar feedback
   - Corrigir bugs urgentes

2. **Semana 2-4:**
   - Adicionar features pedidas
   - Otimizar conversão
   - Criar conteúdo de marketing

3. **Mês 2:**
   - Analisar métricas
   - Escalar marketing
   - Aumentar MRR

---

**AGORA CONFIGURE VERCEL E SUPABASE!** 🚀

**Me avisa quando terminar o redeploy para testarmos juntos!** 💪
