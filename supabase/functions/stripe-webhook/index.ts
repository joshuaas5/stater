// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@13.6.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

/**
 * 🔔 Stripe Webhook Handler
 * 
 * Processa eventos do Stripe para ativar/desativar assinaturas Premium.
 * 
 * Eventos tratados:
 * - checkout.session.completed: Ativar Premium
 * - customer.subscription.deleted: Cancelar assinatura
 * - invoice.payment_failed: Marcar pagamento falhou
 */

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
    console.error('❌ Faltando signature ou webhook secret');
    return new Response('Missing signature or secret', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log(`🎉 Webhook recebido: ${event.type}`);

    switch (event.type) {
      // Checkout completado com sucesso
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId || session.client_reference_id;

        if (!userId) {
          console.error('❌ userId não encontrado no metadata');
          break;
        }

        console.log(`✅ Ativando PREMIUM para usuário: ${userId}`);

        // Ativar plano premium
        const { error } = await supabase
          .from('users')
          .update({
            plan_type: 'premium',
            subscription_status: 'active',
            subscription_id: session.subscription,
            stripe_customer_id: session.customer,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        if (error) {
          console.error('❌ Erro ao atualizar usuário:', error);
        } else {
          console.log(`✅ Usuário ${userId} agora é PREMIUM`);
        }
        break;
      }

      // Assinatura criada
      case 'customer.subscription.created': {
        const subscription = event.data.object;
        console.log(`📝 Assinatura criada: ${subscription.id}`);
        break;
      }

      // Assinatura atualizada
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log(`🔄 Assinatura atualizada: ${subscription.id}`);

        // Se foi cancelada
        if (subscription.status === 'canceled') {
          const { error } = await supabase
            .from('users')
            .update({
              plan_type: 'free',
              subscription_status: 'canceled',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', subscription.id);

          if (error) {
            console.error('❌ Erro ao cancelar assinatura:', error);
          }
        }
        break;
      }

      // Assinatura deletada
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        console.log(`❌ Assinatura cancelada: ${subscription.id}`);

        // Cancelar no banco de dados
        const { error } = await supabase
          .from('users')
          .update({
            plan_type: 'free',
            subscription_status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('subscription_id', subscription.id);

        if (error) {
          console.error('❌ Erro ao cancelar:', error);
        } else {
          console.log(`✅ Usuário voltou para plano FREE`);
        }
        break;
      }

      // Pagamento bem-sucedido
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log(`✅ Pagamento recebido: ${invoice.id}`);

        // Garantir que assinatura está ativa
        if (invoice.subscription) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', invoice.subscription);
        }
        break;
      }

      // Falha no pagamento
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        
        console.log(`⚠️ Falha no pagamento: ${invoice.id}`);

        // Marcar como falha de pagamento
        if (invoice.subscription) {
          await supabase
            .from('users')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('subscription_id', invoice.subscription);
        }
        break;
      }

      default:
        console.log(`ℹ️ Evento não tratado: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: any) {
    console.error('❌ Webhook error:', err.message);
    return new Response(err.message, { status: 400 });
  }
});
