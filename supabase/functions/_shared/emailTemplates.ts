// Templates de email REVOLUCIONÁRIOS para o Stater
// Design moderno dark mode com logo real

// Logo Stater em Base64 (40x40 PNG otimizado)
const STATER_LOGO_URL = 'https://stater.app/stater-logo-96.png';

// ============================================
// TEMPLATE BASE - DESIGN REVOLUCIONÁRIO
// ============================================
export const baseTemplate = (content: string, previewText: string = '') => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Stater</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background-color: #0a0a0f; }
    @media (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .card { padding: 20px !important; }
      .bill-item { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #0a0a0f;">
    <tr>
      <td align="center" style="padding: 24px 12px;">
        
        <table class="container" width="440" cellpadding="0" cellspacing="0" border="0" style="max-width: 440px;">
          
          <!-- HEADER -->
          <tr>
            <td style="padding: 8px 0 28px; text-align: center;">
              <img src="${STATER_LOGO_URL}" alt="Stater" width="36" height="36" style="display: inline-block; vertical-align: middle; border-radius: 10px;" />
              <span style="display: inline-block; vertical-align: middle; margin-left: 10px; font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.3px;">Stater</span>
            </td>
          </tr>
          
          <!-- CONTENT -->
          <tr>
            <td>
              ${content}
            </td>
          </tr>
          
          <!-- FOOTER -->
          <tr>
            <td style="padding: 32px 0 8px; text-align: center;">
              <p style="margin: 0 0 4px; font-size: 11px; color: #525264; letter-spacing: 0.3px;">
                STATER • SEU ASSISTENTE FINANCEIRO
              </p>
              <a href="https://stater.app" style="color: #525264; text-decoration: none; font-size: 11px;">stater.app</a>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Formatar moeda
const formatCurrency = (value: number): string => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// Formatar data curta
const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, '0');
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  return `${day} ${months[date.getMonth()]}`;
};

// Calcular dias até vencimento
const getDaysUntil = (dateStr: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dateStr);
  dueDate.setHours(0, 0, 0, 0);
  return Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

// ============================================
// INTERFACE: Conta para o email
// ============================================
export interface BillForEmail {
  name: string;
  amount: number;
  dueDate: string;
  category?: string;
}

// ============================================
// TEMPLATE PRINCIPAL: RESUMO DE CONTAS A VENCER
// Um único email com todas as contas organizadas por urgência
// ============================================
export const billsDigestTemplate = (
  userName: string,
  bills: BillForEmail[]
) => {
  const firstName = userName ? userName.split(' ')[0] : '';
  
  // Separar contas por urgência
  const today: BillForEmail[] = [];
  const tomorrow: BillForEmail[] = [];
  const thisWeek: BillForEmail[] = [];
  const later: BillForEmail[] = [];
  
  bills.forEach(bill => {
    const days = getDaysUntil(bill.dueDate);
    if (days <= 0) today.push(bill);
    else if (days === 1) tomorrow.push(bill);
    else if (days <= 7) thisWeek.push(bill);
    else later.push(bill);
  });

  // Calcular total
  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const urgentCount = today.length + tomorrow.length;

  // Gerar seção de contas
  const generateBillSection = (title: string, emoji: string, color: string, bgColor: string, billList: BillForEmail[]) => {
    if (billList.length === 0) return '';
    
    const billRows = billList.map(bill => `
      <tr>
        <td style="padding: 14px 16px; border-bottom: 1px solid #1a1a24;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="vertical-align: middle;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: 600; color: #ffffff;">${bill.name}</p>
                <p style="margin: 0; font-size: 11px; color: #64647a;">${formatDateShort(bill.dueDate)}${bill.category ? ` • ${bill.category}` : ''}</p>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <p style="margin: 0; font-size: 16px; font-weight: 700; color: #ffffff;">${formatCurrency(bill.amount)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join('');

    return `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
        <tr>
          <td style="padding: 10px 16px; background-color: ${bgColor}; border-radius: 12px 12px 0 0;">
            <span style="font-size: 12px; font-weight: 700; color: ${color}; text-transform: uppercase; letter-spacing: 0.5px;">
              ${emoji} ${title}
            </span>
            <span style="float: right; font-size: 12px; color: ${color}; font-weight: 600;">${billList.length} ${billList.length === 1 ? 'conta' : 'contas'}</span>
          </td>
        </tr>
        <tr>
          <td style="background-color: #12121a; border-radius: 0 0 12px 12px; overflow: hidden;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${billRows}
            </table>
          </td>
        </tr>
      </table>
    `;
  };

  // Mensagem de saudação baseada na urgência
  let greetingEmoji = '📊';
  let greetingText = 'Confira suas contas a vencer';
  
  if (today.length > 0) {
    greetingEmoji = '🚨';
    greetingText = `Você tem ${today.length} conta${today.length > 1 ? 's' : ''} vencendo hoje!`;
  } else if (tomorrow.length > 0) {
    greetingEmoji = '⚠️';
    greetingText = `Atenção! ${tomorrow.length} conta${tomorrow.length > 1 ? 's' : ''} vence${tomorrow.length > 1 ? 'm' : ''} amanhã`;
  } else if (thisWeek.length > 0) {
    greetingEmoji = '📅';
    greetingText = 'Suas contas desta semana';
  }

  const content = `
    <!-- CARD PRINCIPAL -->
    <table class="card" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(180deg, #14141e 0%, #0f0f17 100%); border-radius: 24px; border: 1px solid #1f1f2e; overflow: hidden;">
      
      <!-- HEADER DO CARD -->
      <tr>
        <td style="padding: 28px 24px 20px;">
          <p style="margin: 0 0 6px; font-size: 13px; color: #64647a;">
            ${firstName ? `Olá, ${firstName}` : 'Olá'} 👋
          </p>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.3;">
            ${greetingEmoji} ${greetingText}
          </h1>
        </td>
      </tr>
      
      <!-- RESUMO RÁPIDO -->
      <tr>
        <td style="padding: 0 24px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #31518b 0%, #1e3a5f 100%); border-radius: 16px;">
            <tr>
              <td style="padding: 20px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td width="50%">
                      <p style="margin: 0 0 2px; font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">Total a pagar</p>
                      <p style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">${formatCurrency(totalAmount)}</p>
                    </td>
                    <td width="50%" style="text-align: right;">
                      <p style="margin: 0 0 2px; font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 1px;">Contas</p>
                      <p style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">${bills.length}</p>
                    </td>
                  </tr>
                </table>
                ${urgentCount > 0 ? `
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                  <tr>
                    <td>
                      <span style="display: inline-block; background-color: rgba(239,68,68,0.2); color: #fca5a5; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600;">
                        ⚡ ${urgentCount} urgente${urgentCount > 1 ? 's' : ''}
                      </span>
                    </td>
                  </tr>
                </table>
                ` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <!-- LISTA DE CONTAS POR URGÊNCIA -->
      <tr>
        <td style="padding: 0 24px 24px;">
          ${generateBillSection('Vence hoje', '🚨', '#fca5a5', '#2a1a1a', today)}
          ${generateBillSection('Vence amanhã', '⚠️', '#fdba74', '#2a2214', tomorrow)}
          ${generateBillSection('Esta semana', '📅', '#93c5fd', '#1a1f2a', thisWeek)}
          ${generateBillSection('Próximas', '📋', '#a1a1aa', '#1a1a1f', later)}
        </td>
      </tr>
      
      <!-- BOTÃO CTA -->
      <tr>
        <td style="padding: 0 24px 28px; text-align: center;">
          <a href="https://stater.app/bills" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);">
            Gerenciar contas →
          </a>
        </td>
      </tr>
      
    </table>
  `;

  const previewText = urgentCount > 0 
    ? `🚨 ${urgentCount} conta${urgentCount > 1 ? 's' : ''} urgente${urgentCount > 1 ? 's' : ''} - Total: ${formatCurrency(totalAmount)}`
    : `📊 ${bills.length} contas a vencer - Total: ${formatCurrency(totalAmount)}`;

  return baseTemplate(content, previewText);
};

// ============================================
// TEMPLATE: BOAS-VINDAS
// ============================================
export const welcomeTemplate = (userName: string) => {
  const firstName = userName ? userName.split(' ')[0] : '';

  const content = `
    <table class="card" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(180deg, #14141e 0%, #0f0f17 100%); border-radius: 24px; border: 1px solid #1f1f2e; overflow: hidden;">
      
      <tr>
        <td style="padding: 40px 28px 0; text-align: center;">
          <div style="font-size: 52px; margin-bottom: 16px;">🚀</div>
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #ffffff;">
            Bem-vindo ao Stater${firstName ? `, ${firstName}` : ''}!
          </h1>
          <p style="margin: 0; font-size: 14px; color: #64647a; line-height: 1.6;">
            Seu controle financeiro inteligente começa agora
          </p>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #12121a; border-radius: 16px; overflow: hidden;">
            <tr>
              <td style="padding: 18px 20px; border-bottom: 1px solid #1a1a24;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right: 14px;"><span style="font-size: 22px;">📊</span></td>
                    <td>
                      <p style="margin: 0 0 1px; font-size: 14px; font-weight: 600; color: #ffffff;">Controle total</p>
                      <p style="margin: 0; font-size: 12px; color: #64647a;">Veja para onde vai seu dinheiro</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 18px 20px; border-bottom: 1px solid #1a1a24;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right: 14px;"><span style="font-size: 22px;">🔔</span></td>
                    <td>
                      <p style="margin: 0 0 1px; font-size: 14px; font-weight: 600; color: #ffffff;">Lembretes inteligentes</p>
                      <p style="margin: 0; font-size: 12px; color: #64647a;">Nunca esqueça uma conta</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding: 18px 20px;">
                <table cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-right: 14px;"><span style="font-size: 22px;">🤖</span></td>
                    <td>
                      <p style="margin: 0 0 1px; font-size: 14px; font-weight: 600; color: #ffffff;">IA Financeira</p>
                      <p style="margin: 0; font-size: 12px; color: #64647a;">Converse sobre suas finanças</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      
      <tr>
        <td style="padding: 0 28px 36px; text-align: center;">
          <a href="https://stater.app" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);">
            Começar agora →
          </a>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(content, `🚀 Bem-vindo ao Stater${firstName ? `, ${firstName}` : ''}! Seu assistente financeiro.`);
};

// ============================================
// TEMPLATE: TESTE
// ============================================
export const testEmailTemplate = () => {
  const content = `
    <table class="card" width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(180deg, #14141e 0%, #0f0f17 100%); border-radius: 24px; border: 1px solid #1f1f2e; overflow: hidden;">
      
      <tr>
        <td style="padding: 40px 28px; text-align: center;">
          <table width="56" height="56" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto 20px;">
            <tr>
              <td align="center" valign="middle" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%;">
                <span style="font-size: 24px; color: #ffffff;">✓</span>
              </td>
            </tr>
          </table>
          
          <h1 style="margin: 0 0 8px; font-size: 20px; font-weight: 700; color: #ffffff;">
            Tudo pronto!
          </h1>
          <p style="margin: 0 0 24px; font-size: 14px; color: #64647a;">
            Sistema de notificações <span style="color: #4ade80;">100% operacional</span>
          </p>
          
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #12121a; border-radius: 12px;">
            <tr>
              <td style="padding: 16px 20px;">
                <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #ffffff;">📬 Você receberá:</p>
                <p style="margin: 0; font-size: 12px; color: #64647a; line-height: 1.7;">
                  Um resumo diário com todas as suas contas próximas do vencimento, organizadas por urgência.
                </p>
              </td>
            </tr>
          </table>
          
          <a href="https://stater.app" style="display: inline-block; margin-top: 24px; background: linear-gradient(135deg, #3B82F6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-size: 14px; font-weight: 600;">
            Acessar Stater →
          </a>
        </td>
      </tr>
    </table>
  `;

  return baseTemplate(content, '✅ Sistema de emails do Stater configurado com sucesso!');
};

// ============================================
// TEMPLATES LEGADOS (para compatibilidade)
// ============================================
export const billReminderTemplate = (
  userName: string,
  billName: string,
  billAmount: number,
  dueDate: string,
  daysUntilDue: number
) => {
  // Converter para o novo formato de digest com uma única conta
  return billsDigestTemplate(userName, [{
    name: billName,
    amount: billAmount,
    dueDate: dueDate
  }]);
};

export const weeklyReportTemplate = (
  userName: string,
  totalBills: number,
  totalAmount: number,
  paidBills: number,
  pendingBills: number,
  upcomingBills: { name: string; amount: number; dueDate: string }[]
) => {
  return billsDigestTemplate(userName, upcomingBills);
};
