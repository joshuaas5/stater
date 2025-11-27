import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
import { 
  billReminderTemplate, 
  billsDigestTemplate,
  welcomeTemplate, 
  weeklyReportTemplate,
  testEmailTemplate,
  type BillForEmail
} from '../_shared/emailTemplates.ts';

interface EmailRequest {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  template?: 'bill-reminder' | 'bills-digest' | 'welcome' | 'weekly-report' | 'test';
  data?: {
    userName?: string;
    billName?: string;
    billAmount?: number;
    dueDate?: string;
    daysUntilDue?: number;
    totalBills?: number;
    totalAmount?: number;
    paidBills?: number;
    pendingBills?: number;
    upcomingBills?: { name: string; amount: number; dueDate: string }[];
    bills?: BillForEmail[];
    overdueBills?: BillForEmail[]; // Contas vencidas
  };
}

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
// Domínio próprio verificado no Resend
const FROM_EMAIL = 'Stater <noreply@stater.app>';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY não configurada');
    }

    const { to, subject, html, text, template, data }: EmailRequest = await req.json();

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: 'Email e assunto são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Gerar HTML baseado no template se especificado
    let emailHtml = html;
    
    if (template) {
      switch (template) {
        case 'bill-reminder':
          emailHtml = billReminderTemplate(
            data?.userName || '',
            data?.billName || 'Conta',
            data?.billAmount || 0,
            data?.dueDate || new Date().toISOString(),
            data?.daysUntilDue ?? 7
          );
          break;
        case 'bills-digest':
          emailHtml = billsDigestTemplate(
            data?.userName || '',
            data?.bills || data?.upcomingBills || [],
            data?.overdueBills || [] // Contas vencidas
          );
          break;
        case 'welcome':
          emailHtml = welcomeTemplate(data?.userName || '');
          break;
        case 'weekly-report':
          emailHtml = weeklyReportTemplate(
            data?.userName || '',
            data?.totalBills || 0,
            data?.totalAmount || 0,
            data?.paidBills || 0,
            data?.pendingBills || 0,
            data?.upcomingBills || []
          );
          break;
        case 'test':
          emailHtml = testEmailTemplate();
          break;
      }
    }

    // Enviar email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html: emailHtml || undefined,
        text: text || undefined,
      }),
    });

    const responseText = await response.text();
    console.log('Resend response status:', response.status);
    console.log('Resend response body:', responseText);

    if (!response.ok) {
      throw new Error(`Falha ao enviar email: ${response.status} - ${responseText}`);
    }

    // Parse o resultado depois de ter verificado que está OK
    const result = JSON.parse(responseText);

    // Parse o resultado depois de ter verificado que está OK

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Erro na função send-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
