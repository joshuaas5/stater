# 🚀 GUIA RÁPIDO - DEPLOY STRIPE EDGE FUNCTIONS VIA DASHBOARD

**Situação:** Não conseguimos instalar Supabase CLI, então vamos fazer deploy manual.

---

## ✅ SOLUÇÃO: Modificar função existente + Criar webhook manualmente

### **PASSO 1: Renomear "bright-responder" para "create-checkout"**

1. Acesse: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/functions

2. Clique em **"bright-responder"**

3. Procure opção **"Settings"** ou **"⋮" (três pontos)**

4. Clique em **"Rename"** e mude para: `create-checkout`

5. Salve

---

### **PASSO 2: Editar o código da função "create-checkout"**

1. Na mesma tela, clique na aba **"Code"** ou **"Editor"**

2. **APAGUE TODO o código** que está lá

3. **Cole este código completo:**

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

    console.log('🛒 Criando sessão de checkout:', { priceId, userId });

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

    console.log('✅ Sessão criada:', session.id);

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
\`\`\`

4. Clique em **"Deploy"** ou **"Save"**

---

### **PASSO 3: Configurar Secrets (Variáveis de Ambiente)**

1. Vá em: https://supabase.com/dashboard/project/tmucbwlhkffrhtexmjze/settings/vault

2. Procure a seção **"Secrets"** ou **"Environment variables"**

3. Adicione esses secrets (se não existirem):

**Secret 1:**
\`\`\`
Nome: STRIPE_SECRET_KEY
Valor: sk_test_REDACTED
\`\`\`

**Secret 2:**
\`\`\`
Nome: STRIPE_WEBHOOK_SECRET
Valor: whsec_REDACTED
\`\`\`

**Secret 3:**
\`\`\`
Nome: SUPABASE_URL
Valor: https://tmucbwlhkffrhtexmjze.supabase.co
\`\`\`

4. Salve

---

### **PASSO 4: Criar segunda função "stripe-webhook"**

**PROBLEMA:** Não tem botão "Create new function"

**SOLUÇÃO TEMPORÁRIA:** Por enquanto, vamos PULAR a criação do webhook handler.

O sistema vai funcionar **SEM** o webhook por enquanto, mas você não vai ter ativação automática do Premium.

**O que funciona:**
- ✅ Usuário pode comprar assinatura
- ✅ Pagamento é processado no Stripe
- ❌ Usuário NÃO fica Premium automaticamente (precisa ativar manual)

**Solução definitiva:** Criar a função webhook depois via CLI ou pedir suporte do Supabase.

---

## 🧪 TESTAR AGORA

1. Abra o site: https://stater.app

2. Faça login

3. Clique em "Assinar Premium"

4. Vai abrir o Stripe Checkout

5. Use cartão teste: `4242 4242 4242 4242`

6. Se funcionar = **SUCESSO!** ✅

---

## ❓ PERGUNTAS

1. Conseguiu renomear a função para `create-checkout`?
2. Conseguiu colar o código novo?
3. Conseguiu adicionar os Secrets?
4. Quer tentar criar a segunda função (webhook) depois?

**Me avisa o que conseguiu fazer!** 🚀
