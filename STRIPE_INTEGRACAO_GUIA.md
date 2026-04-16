# ðŸ’³ INTEGRAÃ‡ÃƒO STRIPE - PLANO PREMIUM STATER

**Data:** 14 de Outubro de 2025  
**Objetivo:** Implementar pagamentos recorrentes com Stripe  
**Planos:** Semanal (R$ 8,90) e Mensal (R$ 19,90)

---

## ðŸŽ¯ RESUMO DA IMPLEMENTAÃ‡ÃƒO

### âœ… **O que vamos criar:**

1. **Conta Stripe** (grÃ¡tis para comeÃ§ar)
2. **Produtos e PreÃ§os** configurados no Stripe
3. **Stripe Checkout** para processar pagamentos
4. **Webhook** para receber confirmaÃ§Ãµes
5. **Gerenciamento de assinaturas** no Dashboard

---

## ðŸ“‹ PASSO A PASSO COMPLETO

### **ETAPA 1: Criar Conta Stripe**

#### 1. Acesse: https://dashboard.stripe.com/register

#### 2. Preencha dados:
```
Nome: [Seu Nome]
Email: [Seu Email]
Senha: [Senha forte]
PaÃ­s: Brasil
```

#### 3. **Ative modo Teste** (sem precisar de docs ainda)
```
VocÃª vai ver no topo: ðŸ”„ Modo de teste
Isso permite testar tudo sem cobranÃ§as reais
```

---

### **ETAPA 2: Obter API Keys**

#### 1. Acesse: https://dashboard.stripe.com/apikeys

#### 2. Copie as chaves:

**Chave PublicÃ¡vel (Frontend):**
```
pk_test_XXXXXXXXXXXXXXXXXXXXXXXX
```
â˜‘ï¸ Pode ser exposta no cÃ³digo JavaScript

**Chave Secreta (Backend):**
```
sk_test_REDACTED
```
âš ï¸ NUNCA exponha esta no frontend!

---

### **ETAPA 3: Criar Produtos no Stripe**

#### 1. Acesse: https://dashboard.stripe.com/products

#### 2. Crie **PRODUTO 1: Stater Premium Semanal**

```
Nome: Stater Premium - Plano Semanal
DescriÃ§Ã£o: Acesso completo Ã s funcionalidades premium por 7 dias
PreÃ§o: R$ 8,90 BRL
RecorrÃªncia: Semanal
ID do Produto: prod_stater_weekly
ID do PreÃ§o: price_stater_weekly_890
```

#### 3. Crie **PRODUTO 2: Stater Premium Mensal**

```
Nome: Stater Premium - Plano Mensal  
DescriÃ§Ã£o: Acesso completo Ã s funcionalidades premium por 30 dias
PreÃ§o: R$ 19,90 BRL
RecorrÃªncia: Mensal
ID do Produto: prod_stater_monthly
ID do PreÃ§o: price_stater_monthly_1990
```

#### 4. **Anote os Price IDs!**
```
price_stater_weekly_890 â†’ Semanal
price_stater_monthly_1990 â†’ Mensal
```

---

### **ETAPA 4: Configurar Webhook**

#### 1. Acesse: https://dashboard.stripe.com/webhooks

#### 2. Clique: **"Adicionar endpoint"**

#### 3. Configure:

**URL do Endpoint:**
```
https://stater.app/api/stripe-webhook
```
(Vamos criar essa API route)

**Eventos para escutar:**
```
â˜‘ï¸ checkout.session.completed
â˜‘ï¸ customer.subscription.created
â˜‘ï¸ customer.subscription.updated
â˜‘ï¸ customer.subscription.deleted
â˜‘ï¸ invoice.payment_succeeded
â˜‘ï¸ invoice.payment_failed
```

#### 4. **Copie o Signing Secret:**
```
whsec_YOUR_WEBHOOK_SECRET
```

---

### **ETAPA 5: VariÃ¡veis de Ambiente**

Crie arquivo `.env.local` na raiz do projeto:

```env
# STRIPE API KEYS (TESTE)
VITE_STRIPE_PUBLIC_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX
STRIPE_SECRET_KEY=sk_test_REDACTED
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

# STRIPE PRICE IDS
VITE_STRIPE_PRICE_WEEKLY=price_stater_weekly_890
VITE_STRIPE_PRICE_MONTHLY=price_stater_monthly_1990

# SUPABASE (jÃ¡ existente)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

âš ï¸ **IMPORTANTE:** Adicione `.env.local` no `.gitignore`!

---

## ðŸ’» CÃ“DIGO - IMPLEMENTAÃ‡ÃƒO

### **1. Instalar Stripe SDK**

```bash
npm install @stripe/stripe-js stripe
```

### **2. Configurar Stripe (Frontend)**

Crie: `src/lib/stripe.ts`

```typescript
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      import.meta.env.VITE_STRIPE_PUBLIC_KEY || ''
    );
  }
  return stripePromise;
};

export const STRIPE_PRICES = {
  weekly: import.meta.env.VITE_STRIPE_PRICE_WEEKLY,
  monthly: import.meta.env.VITE_STRIPE_PRICE_MONTHLY,
} as const;
```

### **3. Componente de Checkout**

Crie: `src/components/StripeCheckout.tsx`

```typescript
import { useState } from 'react';
import { getStripe, STRIPE_PRICES } from '@/lib/stripe';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface StripeCheckoutProps {
  plan: 'weekly' | 'monthly';
  onSuccess?: () => void;
}

export default function StripeCheckout({ plan, onSuccess }: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user) {
      alert('VocÃª precisa estar logado para assinar');
      return;
    }

    setLoading(true);

    try {
      // 1. Criar Checkout Session via API
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId: STRIPE_PRICES[plan],
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/dashboard?canceled=true`,
        },
      });

      if (error) throw error;

      // 2. Redirecionar para Stripe Checkout
      const stripe = await getStripe();
      if (!stripe) throw new Error('Stripe nÃ£o carregado');

      const { error: redirectError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (redirectError) throw redirectError;

    } catch (err) {
      console.error('Erro ao iniciar checkout:', err);
      alert('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? 'Processando...' : `Assinar ${plan === 'weekly' ? 'Semanal' : 'Mensal'}`}
    </button>
  );
}
```

### **4. Edge Function (Supabase) - create-checkout**

Crie: `supabase/functions/create-checkout/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { priceId, userId, userEmail, successUrl, cancelUrl } = await req.json();

    // Criar Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId, // Vincular ao usuÃ¡rio
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
```

### **5. Webhook Handler**

Crie: `supabase/functions/stripe-webhook/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response('Missing signature or secret', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('ðŸŽ‰ Webhook received:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId || session.client_reference_id;

        if (userId) {
          // Ativar plano premium
          await supabase
            .from('users')
            .update({
              plan_type: 'premium',
              subscription_status: 'active',
              subscription_id: session.subscription,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          console.log(`âœ… Usuario ${userId} ativado como PREMIUM`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // Cancelar assinatura no banco
        await supabase
          .from('users')
          .update({
            plan_type: 'free',
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('subscription_id', subscription.id);

        console.log(`âŒ Assinatura ${subscription.id} cancelada`);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        
        // Marcar como falha de pagamento
        await supabase
          .from('users')
          .update({
            subscription_status: 'past_due',
            updated_at: new Date().toISOString(),
          })
          .eq('subscription_id', invoice.subscription);

        console.log(`âš ï¸ Pagamento falhou para: ${invoice.subscription}`);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    console.error('âŒ Webhook error:', err.message);
    return new Response(err.message, { status: 400 });
  }
});
```

---

## ðŸ—„ï¸ BANCO DE DADOS (Supabase)

Adicione colunas na tabela `users`:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
```

---

## ðŸ§ª TESTANDO

### **1. Modo Teste (CartÃµes)**

Use esses cartÃµes de teste do Stripe:

```
âœ… Sucesso:
   4242 4242 4242 4242
   Validade: Qualquer data futura
   CVV: Qualquer 3 dÃ­gitos

âŒ Falha:
   4000 0000 0000 0002
```

### **2. Fluxo de Teste:**

1. UsuÃ¡rio clica "Assinar Mensal"
2. Abre Stripe Checkout
3. Preenche cartÃ£o teste
4. Webhook ativa conta Premium
5. UsuÃ¡rio redirecionado para Dashboard

---

## ðŸš€ DEPLOY

### **1. Deploy Edge Functions:**

```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

### **2. Configurar Secrets:**

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_XXX
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_XXX
```

---

## ðŸ’° CUSTOS STRIPE

### **Taxas (Brasil):**
```
3,99% + R$ 0,40 por transaÃ§Ã£o
```

### **Exemplo:**
```
Venda de R$ 19,90:
- Taxa Stripe: R$ 1,19
- VocÃª recebe: R$ 18,71
```

---

## âœ… CHECKLIST FINAL

- [ ] Conta Stripe criada
- [ ] Produtos criados (Semanal + Mensal)
- [ ] API Keys copiadas
- [ ] `.env.local` configurado
- [ ] Stripe SDK instalado
- [ ] Componente StripeCheckout criado
- [ ] Edge Functions criadas
- [ ] Webhook configurado
- [ ] Banco de dados atualizado
- [ ] Testado com cartÃ£o teste

---

**PRÃ“XIMO PASSO:** Vou criar os arquivos agora!

