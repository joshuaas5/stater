# ðŸš€ GUIA RÃPIDO - DEPLOY STRIPE EDGE FUNCTIONS VIA DASHBOARD

**SituaÃ§Ã£o:** NÃ£o conseguimos instalar Supabase CLI, entÃ£o vamos fazer deploy manual.

---

## âœ… SOLUÃ‡ÃƒO: Modificar funÃ§Ã£o existente + Criar webhook manualmente

### **PASSO 1: Renomear "bright-responder" para "create-checkout"**

1. Acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/functions

2. Clique em **"bright-responder"**

3. Procure opÃ§Ã£o **"Settings"** ou **"â‹®" (trÃªs pontos)**

4. Clique em **"Rename"** e mude para: `create-checkout`

5. Salve

---

### **PASSO 2: Editar o cÃ³digo da funÃ§Ã£o "create-checkout"**

1. Na mesma tela, clique na aba **"Code"** ou **"Editor"**

2. **APAGUE TODO o cÃ³digo** que estÃ¡ lÃ¡

3. **Cole este cÃ³digo completo:**

\`\`\`typescript
// supabase/functions/create-checkout/index.ts
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

    console.log('ðŸ›’ Criando sessÃ£o de checkout:', { priceId, userId });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail,
      client_reference_id: userId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { userId, timestamp: new Date().toISOString() },
    });

    console.log('âœ… SessÃ£o criada:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('âŒ Erro:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
\`\`\`

4. Clique em **"Deploy"** ou **"Save"**

---

### **PASSO 3: Configurar Secrets (VariÃ¡veis de Ambiente)**

1. VÃ¡ em: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/settings/vault

2. Procure a seÃ§Ã£o **"Secrets"** ou **"Environment variables"**

3. Adicione esses secrets (se nÃ£o existirem):

**Secret 1:**
\`\`\`
Nome: STRIPE_SECRET_KEY
Valor: sk_test_REDACTED
\`\`\`

**Secret 2:**
\`\`\`
Nome: STRIPE_WEBHOOK_SECRET
Valor: whsec_YOUR_WEBHOOK_SECRET
\`\`\`

**Secret 3:**
\`\`\`
Nome: SUPABASE_URL
Valor: https://tmucbwlhkffrhtexmjze.supabase.co
\`\`\`

4. Salve

---

### **PASSO 4: Criar segunda funÃ§Ã£o "stripe-webhook"**

**PROBLEMA:** NÃ£o tem botÃ£o "Create new function"

**SOLUÃ‡ÃƒO TEMPORÃRIA:** Por enquanto, vamos PULAR a criaÃ§Ã£o do webhook handler.

O sistema vai funcionar **SEM** o webhook por enquanto, mas vocÃª nÃ£o vai ter ativaÃ§Ã£o automÃ¡tica do Premium.

**O que funciona:**
- âœ… UsuÃ¡rio pode comprar assinatura
- âœ… Pagamento Ã© processado no Stripe
- âŒ UsuÃ¡rio NÃƒO fica Premium automaticamente (precisa ativar manual)

**SoluÃ§Ã£o definitiva:** Criar a funÃ§Ã£o webhook depois via CLI ou pedir suporte do Supabase.

---

## ðŸ§ª TESTAR AGORA

1. Abra o site: https://stater.app

2. FaÃ§a login

3. Clique em "Assinar Premium"

4. Vai abrir o Stripe Checkout

5. Use cartÃ£o teste: `4242 4242 4242 4242`

6. Se funcionar = **SUCESSO!** âœ…

---

## â“ PERGUNTAS

1. Conseguiu renomear a funÃ§Ã£o para `create-checkout`?
2. Conseguiu colar o cÃ³digo novo?
3. Conseguiu adicionar os Secrets?
4. Quer tentar criar a segunda funÃ§Ã£o (webhook) depois?

**Me avisa o que conseguiu fazer!** ðŸš€

