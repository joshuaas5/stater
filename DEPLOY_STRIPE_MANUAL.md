# 🚀 DEPLOY MANUAL DAS EDGE FUNCTIONS - STRIPE

Como o Supabase CLI não pode ser instalado globalmente via npm, vamos fazer deploy manual via Dashboard.

---

## 📋 PASSO A PASSO COMPLETO

### **ETAPA 1: Configurar Secrets no Supabase**

1. Acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/settings/vault

2. Clique em **"Add new secret"** (ou similar)

3. Adicione esses 3 secrets:

```
Nome: STRIPE_SECRET_KEY
Valor: sk_test_51SIF7wFog1FXcH5vCjqHMtpwD5ft5YmJMgAqpnYDe63dmf2Uu5RLpbxlGPyWuNADT8jXFY1jRdTxE5nikxKMXUuT00W6zRbUwK
```

```
Nome: STRIPE_WEBHOOK_SECRET
Valor: whsec_vS8VG1hxgOZdbsBoWIynieYh8mrx1P75
```

```
Nome: SUPABASE_URL
Valor: https://tmucbwlhkffrhtexmjze.supabase.co
```

**IMPORTANTE:** O `SUPABASE_SERVICE_ROLE_KEY` já deve existir. Se não existir, adicione também.

---

### **ETAPA 2: Modificar a função "bright-responder" para criar checkout**

1. Acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/functions

2. Clique na função **"bright-responder"**

3. Você vai ver 2 abas: **"Details"** e **"Code"** (ou similar)

4. Clique em **"Code"** ou **"Edit"**

5. **APAGUE TODO o código existente**

6. **Cole este código:**

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

    console.log('🛒 Creating checkout session:', { priceId, userId, userEmail });

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

    console.log('✅ Checkout session created:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Error creating checkout:', error.message);
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

8. **Renomeie a função** para `create-checkout`:
   - Procure a opção de "Settings" ou "Rename"
   - Mude o nome de `bright-responder` para `create-checkout`

---

### **ETAPA 3: Criar a segunda Edge Function (stripe-webhook)**

Como não tem botão "Create", vamos usar outra abordagem:

1. Acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/sql-editor

2. Cole e execute este SQL:

```sql
-- Este comando cria uma nova Edge Function via SQL
-- Infelizmente, isso não funciona direto. Precisamos criar via API REST.
```

**ALTERNATIVA:** Criar via cURL (PowerShell):

Vou criar um script PowerShell que faz isso!

---

### **ETAPA 4: Script PowerShell para criar Edge Functions**

Vou criar um arquivo `.ps1` que você pode executar.

---

## ⚠️ PROBLEMA IDENTIFICADO

O Supabase Dashboard **não permite criar novas Edge Functions manualmente** sem o CLI.

**SOLUÇÃO:** Vou criar um script que usa a API REST do Supabase para fazer o deploy.

**Quer que eu crie esse script ou prefere uma solução mais simples?**

---

## ✅ SOLUÇÃO MAIS SIMPLES: Usar npx

Vou tentar usar `npx supabase` (que não precisa instalação global):

```powershell
npx supabase functions deploy create-checkout --project-ref tmucbwlhkffrhtexmjze
```

Quer que eu tente essa abordagem?
