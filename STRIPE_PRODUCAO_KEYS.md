# ðŸ”‘ COMO PEGAR API KEYS DE PRODUÃ‡ÃƒO - STRIPE

**Data:** 15 de Outubro de 2025  
**Objetivo:** Ativar modo produÃ§Ã£o e obter chaves reais

---

## ðŸš€ PASSO A PASSO COMPLETO

### **PASSO 1: Ativar Modo ProduÃ§Ã£o no Stripe**

#### 1. Acesse o Stripe Dashboard:
```
https://dashboard.stripe.com
```

#### 2. Procure o toggle no TOPO da pÃ¡gina:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ”„ Modo de teste  â—€â”€â”€ CLIQUE AQUI          â”‚
â”‚                                              â”‚
â”‚  Mudar para: Modo ativo (produÃ§Ã£o)          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### 3. Clique para alternar:
- âŒ "Modo de teste" â†’ ðŸ”„
- âœ… "Modo ativo" (ou "Live mode")

---

### **PASSO 2: Obter API Keys de ProduÃ§Ã£o**

#### 1. Com modo produÃ§Ã£o ativo, acesse:
```
https://dashboard.stripe.com/apikeys
```

**OU navegue:**
- Dashboard â†’ Developers (canto inferior esquerdo)
- Developers â†’ API keys

#### 2. VocÃª verÃ¡ DUAS seÃ§Ãµes:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ”´ Modo ativo (Live keys)                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                              â”‚
â”‚ Publishable key (Chave publicÃ¡vel):         â”‚
â”‚ chave_publica_producao_stripe51SIF7wFog1FXcH5v...                â”‚
â”‚ [ðŸ‘ï¸ Mostrar] [ðŸ“‹ Copiar]                    â”‚
â”‚                                              â”‚
â”‚ Secret key (Chave secreta):                 â”‚
â”‚ STRIPE_SECRET_KEY_PROD_PLACEHOLDER (oculta)       â”‚
â”‚ [ðŸ‘ï¸ Revelar] [ðŸ“‹ Copiar]                    â”‚
â”‚                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ ðŸ”µ Modo de teste (Test keys)                â”‚
â”‚ (Suas keys atuais que vocÃª jÃ¡ tem)          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### 3. Copie as 2 chaves de PRODUÃ‡ÃƒO:

**Publishable key (comeÃ§a com `chave_publica_producao_stripe`):**
```
chave_publica_producao_stripe51SIF7wFog1FXcH5v9uSLdcEArKlpzVSUEaCn2XjIoX3B98YL8y0q9kZxtZtMGhNaTz344ZLNB668nPtUG1Kk21H700Mq7mI5JP
```
ðŸ‘† Essa vai no FRONTEND (Vercel)

**Secret key (comeÃ§a com `chave_secreta_producao_stripe`):**
```
STRIPE_SECRET_KEY_PROD_PLACEHOLDER da chave]
```
ðŸ‘† Essa vai no BACKEND (Supabase) - NUNCA exponha!

---

### **PASSO 3: Obter Webhook Secret de ProduÃ§Ã£o**

#### 1. Ainda no modo produÃ§Ã£o, acesse:
```
https://dashboard.stripe.com/webhooks
```

#### 2. VocÃª verÃ¡ 2 abas:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ [ðŸ”´ Webhooks ativos] [ðŸ”µ Webhooks de teste] â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                              â”‚
â”‚ VocÃª precisa CRIAR um novo webhook para     â”‚
â”‚ produÃ§Ã£o (o de teste nÃ£o funciona aqui!)    â”‚
â”‚                                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### 3. Clique: **"+ Adicionar endpoint"**

#### 4. Preencha:

**URL do endpoint:**
```
https://tmucbwlhkffrhtexmjze.supabase.co/functions/v1/stripe-webhook
```

**DescriÃ§Ã£o:**
```
Webhook de produÃ§Ã£o - Stater Premium
```

**Eventos para escutar (IMPORTANTE!):**
```
â˜‘ï¸ checkout.session.completed
â˜‘ï¸ customer.subscription.deleted
â˜‘ï¸ invoice.payment_failed
```

**VersÃ£o da API:**
```
2023-10-16 (ou mais recente)
```

#### 5. Clique: **"Adicionar endpoint"**

#### 6. Copie o **Signing secret:**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Signing secret:                              â”‚
â”‚ segredo_assinatura_webhook[cÃ³digo de produÃ§Ã£o]                   â”‚
â”‚ [ðŸ‘ï¸ Revelar] [ðŸ“‹ Copiar]                    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Exemplo:**
```
STRIPE_WEBHOOK_SECRET_PLACEHOLDER
```

---

### **PASSO 4: Atualizar Price IDs (se necessÃ¡rio)**

#### Os Price IDs tambÃ©m mudam em produÃ§Ã£o!

#### 1. Acesse seus produtos:
```
https://dashboard.stripe.com/products
```

#### 2. Certifique-se que estÃ¡ em **Modo ativo** (ðŸ”´)

#### 3. Clique em cada produto:

**Plano Semanal:**
```
Nome: Stater Premium - Plano Semanal
PreÃ§o: R$ 8,90 / semana
Price ID: price_[cÃ³digo de produÃ§Ã£o]
```

**Plano Mensal:**
```
Nome: Stater Premium - Plano Mensal  
PreÃ§o: R$ 19,90 / mÃªs
Price ID: price_[cÃ³digo de produÃ§Ã£o]
```

#### 4. Se os produtos NÃƒO existem em produÃ§Ã£o:

VocÃª precisa CRIAR NOVAMENTE em modo produÃ§Ã£o:
- Acesse: https://dashboard.stripe.com/products
- Clique: "+ Adicionar produto"
- Preencha igual ao teste:
  - Nome: Stater Premium - Plano Semanal
  - PreÃ§o: R$ 8,90 BRL
  - RecorrÃªncia: A cada semana
  - Clique "Salvar produto"
- Copie o **Price ID** gerado

Repita para o plano mensal!

---

## ðŸ“ RESUMO DAS KEYS QUE VOCÃŠ PRECISA

Depois de seguir os passos acima, vocÃª terÃ¡:

```env
# STRIPE - PRODUÃ‡ÃƒO
VITE_STRIPE_PUBLIC_KEY=chave_publica_producao_stripe51SIF7wFog1FXcH5v...
STRIPE_SECRET_KEY=STRIPE_SECRET_KEY_PROD_PLACEHOLDER
STRIPE_WEBHOOK_SECRET=segredo_assinatura_webhook[cÃ³digo_produÃ§Ã£o]

# STRIPE PRICE IDS - PRODUÃ‡ÃƒO
VITE_STRIPE_PRICE_WEEKLY=price_[cÃ³digo_produÃ§Ã£o_semanal]
VITE_STRIPE_PRICE_MONTHLY=price_[cÃ³digo_produÃ§Ã£o_mensal]
```

---

## ðŸ”§ ONDE COLOCAR CADA KEY

### **1. Vercel (Frontend)**

Acesse: https://vercel.com/dashboard

1. Clique no seu projeto
2. Settings â†’ Environment Variables
3. Adicione/Edite:

```
VITE_STRIPE_PUBLIC_KEY
Valor: chave_publica_producao_stripe51SIF7wFog1FXcH5v...

VITE_STRIPE_PRICE_WEEKLY
Valor: price_[cÃ³digo_produÃ§Ã£o]

VITE_STRIPE_PRICE_MONTHLY
Valor: price_[cÃ³digo_produÃ§Ã£o]
```

4. Clique **"Save"**
5. VÃ¡ em: Deployments â†’ [Ãšltimo deploy] â†’ â‹® â†’ **Redeploy**

---

### **2. Supabase (Backend)**

#### Via Dashboard (Recomendado):

1. Acesse: https://supabase.com/dashboard
2. Seu projeto â†’ Project Settings â†’ Edge Functions
3. VÃ¡ em **"Secrets"** ou **"Environment Variables"**
4. Adicione:

```
STRIPE_SECRET_KEY
Valor: STRIPE_SECRET_KEY_PROD_PLACEHOLDER

STRIPE_WEBHOOK_SECRET
Valor: segredo_assinatura_webhook[cÃ³digo_produÃ§Ã£o]
```

#### Via CLI (Alternativo):

```bash
supabase secrets set STRIPE_SECRET_KEY=chave_secreta_producao_stripeXXX
supabase secrets set STRIPE_WEBHOOK_SECRET=segredo_assinatura_webhookXXX
```

---

## âœ… CHECKLIST DE VERIFICAÃ‡ÃƒO

Antes de usar as keys de produÃ§Ã£o:

- [ ] âœ… Modo produÃ§Ã£o ATIVADO no Stripe
- [ ] âœ… API Keys de produÃ§Ã£o copiadas (chave_publica_producao_stripe e chave_secreta_producao_stripe)
- [ ] âœ… Webhook de PRODUÃ‡ÃƒO criado
- [ ] âœ… Webhook secret de produÃ§Ã£o copiado (segredo_assinatura_webhook)
- [ ] âœ… Produtos existem em modo produÃ§Ã£o
- [ ] âœ… Price IDs de produÃ§Ã£o copiados
- [ ] âœ… Keys atualizadas no Vercel
- [ ] âœ… Secrets atualizados no Supabase
- [ ] âœ… Vercel redeployado

---

## ðŸ§ª TESTANDO PRODUÃ‡ÃƒO

### **âš ï¸ ATENÃ‡ÃƒO: Agora os pagamentos sÃ£o REAIS!**

1. Acesse: https://stater.app
2. FaÃ§a login
3. Clique em "Assinar Premium"
4. Use um **cartÃ£o de teste** primeiro:
   ```
   4242 4242 4242 4242
   Data: 12/28
   CVV: 123
   ```

5. Se funcionar, teste com **seu prÃ³prio cartÃ£o**
6. Cancele imediatamente se nÃ£o quiser cobrar

### **Verificar se funcionou:**

1. Stripe Dashboard â†’ Pagamentos
   - Deve aparecer o pagamento
2. Supabase â†’ Table Editor â†’ profiles
   - `plan_type` deve ser "premium"
   - `subscription_status` deve ser "active"

---

## ðŸš¨ IMPORTANTE - SEGURANÃ‡A

### **âŒ NUNCA FAÃ‡A:**
- Commitar chave_secreta_producao_stripe no Git
- Expor chave_secreta_producao_stripe no frontend
- Compartilhar segredo_assinatura_webhook publicamente

### **âœ… SEMPRE FAÃ‡A:**
- Mantenha chave_secreta_producao_stripe apenas no Supabase
- Use chave_publica_producao_stripe no frontend (essa pode ser pÃºblica)
- Rotacione keys se houver vazamento

---

## ðŸ”„ VOLTAR PARA TESTE (se precisar)

1. Stripe Dashboard â†’ Toggle no topo
2. Mude de "Modo ativo" â†’ "Modo de teste"
3. Use as keys antigas (chave_publica_teste_stripe e chave_secreta_teste_stripe)

---

## ðŸ“ž PRECISA DE AJUDA?

Se nÃ£o encontrar algo:
- Suporte Stripe: https://support.stripe.com/contact
- Chat ao vivo: DisponÃ­vel no dashboard (canto inferior direito)

---

**PRONTO!** Agora vocÃª sabe exatamente onde pegar cada key! ðŸš€

Alguma dÃºvida sobre algum passo especÃ­fico?
