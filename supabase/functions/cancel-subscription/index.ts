// supabase/functions/cancel-subscription/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

/**
 * ❌ Cancel Subscription
 * 
 * Cancela a assinatura do usuário no Stripe e atualiza o banco de dados.
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

    console.log('❌ Cancelando assinatura para:', { userId, userEmail });

    if (!userEmail) {
      throw new Error('userEmail é obrigatório');
    }

    // 1. Buscar customer no Stripe pelo email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Cliente não encontrado no Stripe' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const customer = customers.data[0];

    // 2. Buscar assinaturas ativas do cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
    });

    if (subscriptions.data.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Nenhuma assinatura ativa encontrada' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // 3. Cancelar todas as assinaturas ativas (no fim do período)
    const cancelledSubscriptions = [];
    for (const subscription of subscriptions.data) {
      const cancelled = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true, // Cancela no fim do período pago
      });
      cancelledSubscriptions.push({
        id: cancelled.id,
        cancelAt: new Date(cancelled.current_period_end * 1000).toISOString(),
      });
      console.log(`✅ Assinatura ${subscription.id} marcada para cancelamento`);
    }

    // 4. Atualizar status no banco de dados
    if (userId) {
      const { error } = await supabase
        .from('user_plans')
        .update({
          payment_status: 'cancelling', // Marcado para cancelar
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('⚠️ Erro ao atualizar banco:', error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Assinatura será cancelada ao fim do período atual',
        cancelledSubscriptions,
        // O acesso PRO continua até o fim do período pago
        accessUntil: cancelledSubscriptions[0]?.cancelAt,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Erro ao cancelar assinatura:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
