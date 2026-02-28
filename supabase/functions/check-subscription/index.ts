// supabase/functions/check-subscription/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

/**
 * 🔍 Check Subscription Status
 * 
 * Verifica se o usuário tem uma assinatura ativa no Stripe
 * e sincroniza com o banco de dados.
 */

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

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
    const { userId, userEmail } = await req.json();

    console.log('🔍 Verificando assinatura para:', { userId, userEmail });

    if (!userEmail) {
      throw new Error('userEmail é obrigatório');
    }

    // 1. Buscar customer no Stripe pelo email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      console.log('❌ Cliente não encontrado no Stripe');
      return new Response(
        JSON.stringify({ 
          isPro: false, 
          message: 'Cliente não encontrado no Stripe' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    const customer = customers.data[0];
    console.log('✅ Cliente encontrado:', customer.id);

    // 2. Buscar assinaturas ativas do cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1,
    });

    const hasActiveSubscription = subscriptions.data.length > 0;
    console.log('📊 Assinatura ativa:', hasActiveSubscription);

    if (hasActiveSubscription && userId) {
      const subscription = subscriptions.data[0];
      const now = new Date();
      const expiresAt = new Date(subscription.current_period_end * 1000);

      // 3. Sincronizar com banco de dados
      const { error } = await supabase
        .from('user_plans')
        .upsert({
          user_id: userId,
          plan_type: 'pro',
          is_active: true,
          start_date: new Date(subscription.start_date * 1000).toISOString(),
          expires_at: expiresAt.toISOString(),
          is_on_trial: subscription.status === 'trialing',
          payment_status: 'active',
          purchase_token: subscription.id,
          product_id: 'stater_pro_1490',
          updated_at: now.toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Erro ao atualizar user_plans:', error);
      } else {
        console.log(`✅ Usuário ${userId} sincronizado como PRO`);
      }
    }

    return new Response(
      JSON.stringify({ 
        isPro: hasActiveSubscription,
        subscription: hasActiveSubscription ? {
          id: subscriptions.data[0].id,
          status: subscriptions.data[0].status,
          currentPeriodEnd: subscriptions.data[0].current_period_end,
        } : null,
        customerId: customer.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Erro ao verificar assinatura:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        isPro: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
