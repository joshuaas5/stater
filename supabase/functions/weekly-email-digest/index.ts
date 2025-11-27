import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { billsDigestTemplate, type BillForEmail } from '../_shared/emailTemplates.ts';

/**
 * Edge Function: weekly-email-digest
 * 
 * Envia emails semanais para TODOS os usuários que:
 * 1. Têm contas a vencer nos próximos 7 dias
 * 2. Têm email_notifications = true (ou não têm preferência definida, default = true)
 * 
 * Esta função pode ser chamada via:
 * - CRON job (Supabase scheduled functions) - 1x por semana (ex: domingo 8h)
 * - Manualmente via API para testes
 */

interface Bill {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  due_date: string;
  category: string;
  is_paid: boolean;
}

interface UserPreference {
  user_id: string;
  email_notifications: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Variáveis de ambiente não configuradas');
    }

    // Usar service role para acessar dados de todos os usuários
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Calcular datas
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    console.log('📧 [WEEKLY DIGEST] Iniciando envio semanal de emails...');
    console.log(`📅 Período: ${today.toISOString()} até ${sevenDaysFromNow.toISOString()}`);

    // 1. Buscar todas as contas não pagas com vencimento nos próximos 7 dias
    const { data: upcomingBills, error: billsError } = await supabase
      .from('bills')
      .select('id, user_id, title, amount, due_date, category, is_paid')
      .eq('is_paid', false)
      .gte('due_date', today.toISOString())
      .lte('due_date', sevenDaysFromNow.toISOString())
      .order('due_date', { ascending: true });

    if (billsError) {
      throw new Error(`Erro ao buscar contas: ${billsError.message}`);
    }

    // 2. Buscar contas vencidas (últimos 30 dias não pagas)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: overdueBillsData, error: overdueError } = await supabase
      .from('bills')
      .select('id, user_id, title, amount, due_date, category, is_paid')
      .eq('is_paid', false)
      .gte('due_date', thirtyDaysAgo.toISOString())
      .lt('due_date', today.toISOString())
      .order('due_date', { ascending: true });

    if (overdueError) {
      console.error('Erro ao buscar contas vencidas:', overdueError);
    }

    const allBills = [...(upcomingBills || []), ...(overdueBillsData || [])];
    
    if (allBills.length === 0) {
      console.log('✅ Nenhuma conta a vencer ou vencida. Nenhum email será enviado.');
      return new Response(
        JSON.stringify({ success: true, emailsSent: 0, message: 'Nenhuma conta encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Agrupar contas por usuário
    const billsByUser: Record<string, { upcoming: Bill[], overdue: Bill[] }> = {};
    
    for (const bill of (upcomingBills || [])) {
      if (!billsByUser[bill.user_id]) {
        billsByUser[bill.user_id] = { upcoming: [], overdue: [] };
      }
      billsByUser[bill.user_id].upcoming.push(bill);
    }
    
    for (const bill of (overdueBillsData || [])) {
      if (!billsByUser[bill.user_id]) {
        billsByUser[bill.user_id] = { upcoming: [], overdue: [] };
      }
      billsByUser[bill.user_id].overdue.push(bill);
    }

    const userIds = Object.keys(billsByUser);
    console.log(`👥 ${userIds.length} usuários com contas encontrados`);

    // 4. Buscar preferências de notificação de todos os usuários
    const { data: preferences, error: prefError } = await supabase
      .from('user_notification_preferences')
      .select('user_id, email_notifications')
      .in('user_id', userIds);

    if (prefError) {
      console.error('Erro ao buscar preferências:', prefError);
    }

    // Criar mapa de preferências
    const preferencesMap: Record<string, boolean> = {};
    for (const pref of (preferences || [])) {
      preferencesMap[pref.user_id] = pref.email_notifications;
    }

    // 5. Enviar emails para cada usuário
    let emailsSent = 0;
    let emailsSkipped = 0;
    const errors: string[] = [];

    for (const userId of userIds) {
      try {
        // Verificar se usuário quer receber emails (default = true se não tiver preferência)
        const wantsEmail = preferencesMap[userId] ?? true;
        
        if (!wantsEmail) {
          console.log(`⏭️ Usuário ${userId} optou por não receber emails`);
          emailsSkipped++;
          continue;
        }

        // Buscar dados do usuário
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
        
        if (userError || !userData?.user?.email) {
          console.error(`❌ Erro ao buscar usuário ${userId}:`, userError);
          errors.push(`Usuário ${userId}: ${userError?.message || 'Email não encontrado'}`);
          continue;
        }

        const user = userData.user;
        const userName = user.user_metadata?.username || 
                        user.user_metadata?.full_name || 
                        user.email?.split('@')[0] || 
                        'Usuário';

        const userBills = billsByUser[userId];
        
        // Converter para o formato do template
        const billsForEmail: BillForEmail[] = userBills.upcoming.map(bill => ({
          name: bill.title,
          amount: bill.amount,
          dueDate: bill.due_date,
          category: bill.category
        }));

        const overdueBillsForEmail: BillForEmail[] = userBills.overdue.map(bill => ({
          name: bill.title,
          amount: bill.amount,
          dueDate: bill.due_date,
          category: bill.category
        }));

        // Gerar HTML do email usando o novo template
        const emailHtml = billsDigestTemplate(userName, billsForEmail, overdueBillsForEmail);
        
        // Gerar subject dinâmico
        const totalBills = billsForEmail.length + overdueBillsForEmail.length;
        const subject = overdueBillsForEmail.length > 0
          ? `⚠️ Stater: ${overdueBillsForEmail.length} conta${overdueBillsForEmail.length > 1 ? 's' : ''} vencida${overdueBillsForEmail.length > 1 ? 's' : ''} + ${billsForEmail.length} para a semana`
          : `📬 Stater: Lembrete da semana (${totalBills} conta${totalBills > 1 ? 's' : ''})`;

        // Enviar email via Resend
        const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
        
        if (!RESEND_API_KEY) {
          throw new Error('RESEND_API_KEY não configurada');
        }

        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Stater <stater@stater.app>',
            to: [user.email],
            subject,
            html: emailHtml,
          }),
        });

        if (!emailResponse.ok) {
          const errorText = await emailResponse.text();
          console.error(`❌ Erro ao enviar email para ${user.email}:`, errorText);
          errors.push(`${user.email}: ${errorText}`);
          continue;
        }

        console.log(`✅ Email enviado para ${user.email} (${totalBills} contas)`);
        emailsSent++;

      } catch (error) {
        console.error(`❌ Erro processando usuário ${userId}:`, error);
        errors.push(`Usuário ${userId}: ${error.message}`);
      }
    }

    console.log(`📧 [WEEKLY DIGEST] Finalizado!`);
    console.log(`   ✅ Emails enviados: ${emailsSent}`);
    console.log(`   ⏭️ Emails pulados (opt-out): ${emailsSkipped}`);
    console.log(`   ❌ Erros: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailsSent,
        emailsSkipped,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ [WEEKLY DIGEST] Erro fatal:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
