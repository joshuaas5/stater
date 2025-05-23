import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface EmailData {
  to: string;
  subject: string;
  html: string;
  userId: string; // Adicionado para registrar logs
}

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  category: string;
}

interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
}

interface UserPreferences {
  theme: string;
  currency: string;
  dateFormat: string;
  notifications_bills_due_soon: boolean;
  notifications_bills_overdue: boolean;
  notifications_large_transactions: boolean;
  notifications_weekly_email: boolean;
  notifications_push: boolean;
  notifications_in_app: boolean;
  notifications_email: boolean;
}

const formatCurrency = (amount: number, currency = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const generateWeeklySummaryEmail = async (userId: string, userEmail: string): Promise<EmailData | null> => {
  try {
    // Buscar preferências do usuário
    const { data: userPrefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (prefsError) {
      console.error('Erro ao buscar preferências do usuário:', prefsError);
      return null;
    }
    
    const preferences = userPrefs as UserPreferences;
    
    // Verificar se o usuário deseja receber emails semanais
    if (!preferences.notifications_weekly_email || !preferences.notifications_email) {
      console.log(`Usuário ${userId} optou por não receber emails semanais`);
      return null;
    }
    
    // Definir período da semana (últimos 7 dias)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    // Buscar transações da semana
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate.toISOString())
      .lte('date', endDate.toISOString())
      .order('date', { ascending: false });
    
    if (transactionsError) {
      console.error('Erro ao buscar transações:', transactionsError);
      return null;
    }
    
    // Buscar contas a vencer nos próximos 7 dias
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const { data: upcomingBills, error: billsError } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .eq('is_paid', false)
      .gte('due_date', new Date().toISOString())
      .lte('due_date', nextWeek.toISOString())
      .order('due_date', { ascending: true });
    
    if (billsError) {
      console.error('Erro ao buscar contas a vencer:', billsError);
      return null;
    }
    
    // Calcular totais
    const totalIncome = transactions
      .filter((t: Transaction) => t.type === 'income')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter((t: Transaction) => t.type === 'expense')
      .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpense;
    
    // Gerar HTML do email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Resumo Semanal - ICTUS</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #4a6cf7;
          }
          .summary {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
          .positive {
            color: #28a745;
          }
          .negative {
            color: #dc3545;
          }
          .neutral {
            color: #6c757d;
          }
          .section {
            margin-bottom: 30px;
          }
          h2 {
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
            color: #4a6cf7;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f5f5f5;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ICTUS</div>
          <p>Seu Assistente Financeiro Pessoal</p>
        </div>
        
        <div class="summary">
          <h2>Resumo da Semana (${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')})</h2>
          <p><strong>Receitas:</strong> <span class="positive">${formatCurrency(totalIncome, preferences.currency)}</span></p>
          <p><strong>Despesas:</strong> <span class="negative">${formatCurrency(totalExpense, preferences.currency)}</span></p>
          <p><strong>Saldo:</strong> <span class="${balance >= 0 ? 'positive' : 'negative'}">${formatCurrency(balance, preferences.currency)}</span></p>
        </div>
        
        <div class="section">
          <h2>Transações Recentes</h2>
          ${transactions.length > 0 ? `
          <table>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
            </tr>
            ${transactions.map((t: Transaction) => `
            <tr>
              <td>${new Date(t.date).toLocaleDateString('pt-BR')}</td>
              <td>${t.title}</td>
              <td>${t.category}</td>
              <td class="${t.type === 'income' ? 'positive' : 'negative'}">${formatCurrency(t.amount, preferences.currency)}</td>
            </tr>
            `).join('')}
          </table>
          ` : '<p>Nenhuma transação registrada nesta semana.</p>'}
        </div>
        
        ${upcomingBills.length > 0 ? `
        <div class="section">
          <h2>Contas a Vencer</h2>
          <table>
            <tr>
              <th>Vencimento</th>
              <th>Descrição</th>
              <th>Valor</th>
            </tr>
            ${upcomingBills.map((b: Bill) => `
            <tr>
              <td>${new Date(b.dueDate).toLocaleDateString('pt-BR')}</td>
              <td>${b.title}</td>
              <td class="negative">${formatCurrency(b.amount, preferences.currency)}</td>
            </tr>
            `).join('')}
          </table>
        </div>
        ` : ''}
        
        <div class="section">
          <h2>Dicas Financeiras</h2>
          <p>💡 Lembre-se de revisar suas despesas recorrentes e verificar se todas são necessárias.</p>
          <p>💡 Estabeleça metas de economia para o próximo mês.</p>
          <p>💡 Não se esqueça de pagar suas contas em dia para evitar juros e multas.</p>
        </div>
      
        <div class="footer">
          <p>Este email foi enviado automaticamente pelo ICTUS - Seu Assistente Financeiro Pessoal.</p>
          <p>Para ajustar suas preferências de notificação, acesse a página de Preferências no aplicativo.</p>
        </div>
      </body>
      </html>
    `;
    
    return {
      to: userEmail,
      subject: 'Seu Resumo Semanal - ICTUS',
      html: emailHtml,
      userId: userId
    };
  } catch (error) {
    console.error('Erro ao gerar resumo semanal:', error);
    return null;
  }
};

const sendEmail = async (emailData: EmailData) => {
  try {
    // Obter a chave de API do SendGrid das variáveis de ambiente
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY não está configurada nas variáveis de ambiente');
    }
    
    // Registrar a tentativa de envio no log
    console.log(`Tentando enviar email para ${emailData.to} com assunto "${emailData.subject}"`);
    
    // Preparar os dados para a API do SendGrid
    const sendgridData = {
      personalizations: [
        {
          to: [{ email: emailData.to }],
          subject: emailData.subject,
        },
      ],
      from: { email: 'noreply@ictusapp.com', name: 'ICTUS - Assistente Financeiro' },
      content: [
        {
          type: 'text/html',
          value: emailData.html,
        },
      ],
    };
    
    // Enviar a requisição para a API do SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendgridData),
    });
    
    // Registrar o resultado no banco de dados
    const { data: logData, error: logError } = await supabase
      .from('email_logs')
      .insert([
        {
          user_id: emailData.userId,
          email_to: emailData.to,
          subject: emailData.subject,
          status: response.ok ? 'sent' : 'failed',
          error_message: response.ok ? null : await response.text(),
          type: 'weekly_summary'
        }
      ]);
    
    if (logError) {
      console.error('Erro ao registrar log de email:', logError);
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ao enviar email: ${response.status} ${errorText}`);
    }
    
    console.log(`Email enviado com sucesso para ${emailData.to}`);
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
};

serve(async (req) => {
  // Lidar com requisições OPTIONS para CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Verificar se é uma requisição POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Método não permitido' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Obter dados da requisição
    const { userId } = await req.json();
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'ID do usuário não fornecido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .auth.admin.getUserById(userId);
    
    if (userError || !userData || !userData.user) {
      return new Response(JSON.stringify({ error: 'Usuário não encontrado' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Gerar e enviar email
    const emailData = await generateWeeklySummaryEmail(userId, userData.user.email);
    
    if (!emailData) {
      return new Response(JSON.stringify({ message: 'Nenhum email enviado - usuário optou por não receber ou não há dados suficientes' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const result = await sendEmail(emailData);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
