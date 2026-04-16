# ðŸš€ DEPLOY MANUAL DAS EDGE FUNCTIONS - STRIPE

Como o Supabase CLI nÃ£o pode ser instalado globalmente via npm, vamos fazer deploy manual via Dashboard.

---

## ðŸ“‹ PASSO A PASSO COMPLETO

### **ETAPA 1: Configurar Secrets no Supabase**

1. Acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/settings/vault

2. Clique em **"Add new secret"** (ou similar)

3. Adicione esses 3 secrets:

```
Nome: STRIPE_SECRET_KEY
Valor: sk_test_REDACTED
```

```
Nome: STRIPE_WEBHOOK_SECRET
Valor: whsec_YOUR_WEBHOOK_SECRET
```

```
Nome: SUPABASE_URL
Valor: https://tmucbwlhkffrhtexmjze.supabase.co
```

**IMPORTANTE:** O `SUPABASE_SERVICE_ROLE_KEY` jÃ¡ deve existir. Se nÃ£o existir, adicione tambÃ©m.

---

### **ETAPA 2: Modificar a funÃ§Ã£o "bright-responder" para criar checkout**

1. Acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/functions

2. Clique na funÃ§Ã£o **"bright-responder"**

3. VocÃª vai ver 2 abas: **"Details"** e **"Code"** (ou similar)

4. Clique em **"Code"** ou **"Edit"**

5. **APAGUE TODO o cÃ³digo existente**

6. **Cole este cÃ³digo:**

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

    console.log('ðŸ›’ Creating checkout session:', { priceId, userId, userEmail });

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
      client_reference_id: userId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: userId,
        timestamp: new Date().toISOString(),
      },
    });

    console.log('âœ… Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('âŒ Error creating checkout:', error.message);
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

7. Clique em **"Save"** ou **"Deploy"**

8. **Renomeie a funÃ§Ã£o** para `create-checkout`:
   - Procure a opÃ§Ã£o de "Settings" ou "Rename"
   - Mude o nome de `bright-responder` para `create-checkout`

---

### **ETAPA 3: Criar a segunda Edge Function (stripe-webhook)**

Como nÃ£o tem botÃ£o "Create", vamos usar outra abordagem:

1. Acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/sql-editor

2. Cole e execute este SQL:

```sql
-- Este comando cria uma nova Edge Function via SQL
-- Infelizmente, isso nÃ£o funciona direto. Precisamos criar via API REST.
```

**ALTERNATIVA:** Criar via cURL (PowerShell):

Vou criar um script PowerShell que faz isso!

---

### **ETAPA 4: Script PowerShell para criar Edge Functions**

Vou criar um arquivo `.ps1` que vocÃª pode executar.

---

## âš ï¸ PROBLEMA IDENTIFICADO

O Supabase Dashboard **nÃ£o permite criar novas Edge Functions manualmente** sem o CLI.

**SOLUÃ‡ÃƒO:** Vou criar um script que usa a API REST do Supabase para fazer o deploy.

**Quer que eu crie esse script ou prefere uma soluÃ§Ã£o mais simples?**

---

## âœ… SOLUÃ‡ÃƒO MAIS SIMPLES: Usar npx

Vou tentar usar `npx supabase` (que nÃ£o precisa instalaÃ§Ã£o global):

```powershell
npx supabase functions deploy create-checkout --project-ref tmucbwlhkffrhtexmjze
```

Quer que eu tente essa abordagem?

