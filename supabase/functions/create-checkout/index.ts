// supabase/functions/create-checkout/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';

/**
 * 💳 Create Stripe Checkout Session
 * 
 * Edge Function para criar sessão de checkout no Stripe.
 * Usado para processar assinaturas do Stater Premium.
 */

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { priceId, userId, userEmail, successUrl, cancelUrl } = await req.json();

    console.log('💳 Criando checkout session:', { priceId, userId, userEmail });
    console.log('💳 STRIPE_SECRET_KEY configurada:', Deno.env.get('STRIPE_SECRET_KEY') ? 'SIM (primeiros chars: ' + Deno.env.get('STRIPE_SECRET_KEY')?.substring(0, 10) + ')' : 'NÃO');

    // Validar parâmetros
    if (!priceId || !userId || !userEmail) {
      console.error('❌ Parâmetros faltando:', { priceId: !!priceId, userId: !!userId, userEmail: !!userEmail });
      throw new Error('Parâmetros obrigatórios faltando: ' + JSON.stringify({ priceId: !!priceId, userId: !!userId, userEmail: !!userEmail }));
    }

    // Verificar se o preço existe
    console.log('🔍 Verificando preço no Stripe:', priceId);
    
    try {
      const price = await stripe.prices.retrieve(priceId);
      console.log('✅ Preço encontrado:', { id: price.id, active: price.active, currency: price.currency, unit_amount: price.unit_amount });
    } catch (priceError: any) {
      console.error('❌ Preço não encontrado:', priceError.message);
      throw new Error(`Preço não encontrado no Stripe: ${priceId}. Erro: ${priceError.message}`);
    }

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
      client_reference_id: userId, // Vincular ao usuário Supabase
      success_url: successUrl || `${req.headers.get('origin')}/dashboard?payment=success`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/dashboard?payment=canceled`,
      metadata: {
        userId: userId,
        timestamp: new Date().toISOString(),
      },
      allow_promotion_codes: true, // Permitir cupons de desconto
      billing_address_collection: 'required',
    });

    console.log('✅ Checkout session criada:', session.id);

    return new Response(
      JSON.stringify({ 
        sessionId: session.id,
        url: session.url // URL completa para redirecionar
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('❌ Erro ao criar checkout:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro ao processar pagamento',
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
