import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface Bill {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  due_date: string;
  category: string;
  is_paid: boolean;
  notifications_enabled?: boolean;
  notification_days?: number[];
}

interface User {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
  };
}

interface NotificationPreference {
  email_notifications: boolean;
  push_notifications: boolean;
  in_app_notifications: boolean;
  bills_due_soon: boolean;
  bills_overdue: boolean;
  weekly_summary: boolean;
  notification_days: number[];
}

const createEmailContent = (bills: Bill[], username: string, dayType: 'today' | 'tomorrow' | 'week') => {
  let subject = '';
  let intro = '';
  
  switch (dayType) {
    case 'today':
      subject = 'ICTUS - Contas que vencem hoje';
      intro = `Olu00e1 ${username},\n\nVocu00ea tem ${bills.length} conta(s) vencendo hoje:`;
      break;
    case 'tomorrow':
      subject = 'ICTUS - Contas que vencem amanhu00e3';
      intro = `Olu00e1 ${username},\n\nVocu00ea tem ${bills.length} conta(s) vencendo amanhu00e3:`;
      break;
    case 'week':
      subject = 'ICTUS - Resumo semanal de contas a pagar';
      intro = `Olu00e1 ${username},\n\nAqui estu00e1 seu resumo semanal de contas a pagar:`;
      break;
  }
  
  let billsList = bills.map(bill => {
    return `- ${bill.title}: R$ ${bill.amount.toFixed(2)} (vence em ${new Date(bill.due_date).toLocaleDateString('pt-BR')})`;
  }).join('\n');
  
  const totalAmount = bills.reduce((sum, bill) => sum + bill.amount, 0);
  
  const emailBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4A6FFF; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
    .bill-item { padding: 10px; margin-bottom: 10px; border-bottom: 1px solid #eee; }
    .bill-title { font-weight: bold; }
    .bill-amount { color: #e74c3c; font-weight: bold; }
    .bill-date { color: #7f8c8d; font-size: 0.9em; }
    .total { margin-top: 20px; padding-top: 10px; border-top: 2px solid #eee; font-weight: bold; }
    .footer { margin-top: 30px; font-size: 0.8em; color: #7f8c8d; text-align: center; }
    .cta-button { display: inline-block; background-color: #4A6FFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ICTUS</h1>
    <p>${dayType === 'week' ? 'Resumo Semanal de Contas' : 'Lembrete de Contas a Pagar'}</p>
  </div>
  <div class="content">
    <p>Olu00e1 ${username},</p>
    <p>${dayType === 'today' ? 'Vocu00ea tem contas vencendo hoje!' : 
         dayType === 'tomorrow' ? 'Vocu00ea tem contas vencendo amanhu00e3!' : 
         'Aqui estu00e1 seu resumo semanal de contas a pagar:'}</p>
    
    ${bills.map(bill => `
    <div class="bill-item">
      <div class="bill-title">${bill.title}</div>
      <div class="bill-amount">R$ ${bill.amount.toFixed(2)}</div>
      <div class="bill-date">Vencimento: ${new Date(bill.due_date).toLocaleDateString('pt-BR')}</div>
    </div>`).join('')}
    
    <div class="total">Total: R$ ${totalAmount.toFixed(2)}</div>
    
    <a href="https://ictus-app.vercel.app" class="cta-button">Abrir o ICTUS</a>
  </div>
  <div class="footer">
    <p>Este u00e9 um e-mail automu00e1tico, por favor nu00e3o responda.</p>
    <p>u00a9 ${new Date().getFullYear()} ICTUS - Gerenciador Financeiro</p>
  </div>
</body>
</html>
`;

  return { subject, emailBody };
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
    }});
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // Verificar se u00e9 uma chamada agendada ou manual
    const isScheduled = req.headers.get('X-Scheduled-Function') === 'true';
    
    // Obter todos os usuu00e1rios com contas ativas
    const { data: users, error: usersError } = await supabaseClient
      .from('bills')
      .select('user_id')
      .eq('is_paid', false)
      .is('notifications_enabled', true);
    
    if (usersError) {
      throw new Error(`Erro ao buscar usuu00e1rios: ${usersError.message}`);
    }
    
    // Obter IDs de usuu00e1rios u00fanicos
    const uniqueUserIds = [...new Set(users.map(user => user.user_id))];
    
    for (const userId of uniqueUserIds) {
      // Obter preferu00eancias de notificau00e7u00e3o do usuu00e1rio
      const { data: preferences, error: preferencesError } = await supabaseClient
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (preferencesError && preferencesError.code !== 'PGRST116') { // Ignorar erro de nu00e3o encontrado
        console.error(`Erro ao buscar preferu00eancias para usuu00e1rio ${userId}: ${preferencesError.message}`);
        continue;
      }
      
      // Usar preferu00eancias padru00e3o se nu00e3o encontradas
      const userPreferences: NotificationPreference = preferences || {
        email_notifications: true,
        push_notifications: true,
        in_app_notifications: true,
        bills_due_soon: true,
        bills_overdue: true,
        weekly_summary: true,
        notification_days: [7, 1, 0]
      };
      
      // Pular usuu00e1rio se notificau00e7u00f5es estiverem desativadas
      if (!userPreferences.email_notifications && 
          !userPreferences.push_notifications && 
          !userPreferences.in_app_notifications) {
        continue;
      }
      
      // Obter informau00e7u00f5es do usuu00e1rio
      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
      
      if (userError || !userData?.user) {
        console.error(`Erro ao buscar dados do usuu00e1rio ${userId}: ${userError?.message || 'Usuu00e1rio nu00e3o encontrado'}`);
        continue;
      }
      
      const user = userData.user;
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Usuu00e1rio';
      
      // Obter contas do usuu00e1rio
      const { data: bills, error: billsError } = await supabaseClient
        .from('bills')
        .select('*')
        .eq('user_id', userId)
        .eq('is_paid', false)
        .order('due_date', { ascending: true });
      
      if (billsError) {
        console.error(`Erro ao buscar contas para usuu00e1rio ${userId}: ${billsError.message}`);
        continue;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Filtrar contas por data de vencimento
      const dueTodayBills = bills.filter(bill => {
        const dueDate = new Date(bill.due_date);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
      });
      
      const dueTomorrowBills = bills.filter(bill => {
        const dueDate = new Date(bill.due_date);
        dueDate.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return dueDate.getTime() === tomorrow.getTime();
      });
      
      const dueThisWeekBills = bills.filter(bill => {
        const dueDate = new Date(bill.due_date);
        dueDate.setHours(0, 0, 0, 0);
        const oneWeekLater = new Date(today);
        oneWeekLater.setDate(oneWeekLater.getDate() + 7);
        return dueDate >= today && dueDate <= oneWeekLater;
      });
      
      // Enviar e-mails de notificau00e7u00e3o
      if (userPreferences.email_notifications) {
        // Enviar e-mail para contas que vencem hoje
        if (dueTodayBills.length > 0 && userPreferences.bills_due_soon) {
          const { subject, emailBody } = createEmailContent(dueTodayBills, username, 'today');
          
          await supabaseClient.functions.invoke('send-email', {
            body: {
              to: user.email,
              subject,
              html: emailBody
            }
          });
        }
        
        // Enviar e-mail para contas que vencem amanhu00e3
        if (dueTomorrowBills.length > 0 && userPreferences.bills_due_soon) {
          const { subject, emailBody } = createEmailContent(dueTomorrowBills, username, 'tomorrow');
          
          await supabaseClient.functions.invoke('send-email', {
            body: {
              to: user.email,
              subject,
              html: emailBody
            }
          });
        }
        
        // Enviar resumo semanal (apenas aos domingos ou se for uma chamada manual)
        if ((today.getDay() === 0 || !isScheduled) && dueThisWeekBills.length > 0 && userPreferences.weekly_summary) {
          const { subject, emailBody } = createEmailContent(dueThisWeekBills, username, 'week');
          
          await supabaseClient.functions.invoke('send-email', {
            body: {
              to: user.email,
              subject,
              html: emailBody
            }
          });
        }
      }
      
      // Criar notificau00e7u00f5es in-app
      if (userPreferences.in_app_notifications) {
        for (const bill of bills) {
          const dueDate = new Date(bill.due_date);
          dueDate.setHours(0, 0, 0, 0);
          
          const diffTime = dueDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          // Verificar se ju00e1 existe notificau00e7u00e3o para esta conta
          const { data: existingNotifications } = await supabaseClient
            .from('notifications')
            .select('*')
            .eq('bill_id', bill.id)
            .eq('user_id', userId);
          
          const notificationTypes: Record<string, string> = {
            '-7': 'sevenDaysBefore',
            '-5': 'fiveDaysBefore',
            '-1': 'oneDayBefore',
            '0': 'dueDay',
          };
          
          // Verificar se o dia atual corresponde a um dos dias de notificau00e7u00e3o configurados
          if (userPreferences.notification_days.includes(Math.abs(diffDays)) || diffDays < 0) {
            const notificationType = diffDays < 0 ? 'overdue' : notificationTypes[`-${diffDays}`] || 'fiveDaysBefore';
            
            // Verificar se ju00e1 existe notificau00e7u00e3o deste tipo para esta conta
            const existingNotification = existingNotifications?.find(
              n => n.type === notificationType
            );
            
            if (!existingNotification) {
              let message = '';
              
              if (diffDays < 0) {
                message = `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} estu00e1 vencida hu00e1 ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'dia' : 'dias'}.`;
              } else if (diffDays === 0) {
                message = `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} vence hoje!`;
              } else if (diffDays === 1) {
                message = `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} vence amanhu00e3.`;
              } else if (diffDays === 5) {
                message = `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} vence em 5 dias.`;
              } else if (diffDays === 7) {
                message = `A conta "${bill.title}" de R$ ${bill.amount.toFixed(2)} vence em 7 dias.`;
              }
              
              if (message) {
                await supabaseClient
                  .from('notifications')
                  .insert({
                    user_id: userId,
                    bill_id: bill.id,
                    type: notificationType,
                    message,
                    date: new Date().toISOString(),
                    read: false
                  });
              }
            }
          }
        }
      }
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json' 
      },
      status: 200,
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json' 
      },
      status: 500,
    });
  }
});
