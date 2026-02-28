// Templates de email do Stater
// Design premium dark mode glassmorphism

// Logo Stater
const STATER_LOGO_URL = 'https://stater.app/stater-logo-96.png';

// ============================================
// TEMPLATE BASE - DESIGN PREMIUM
// ============================================
export const baseTemplate = (content: string, previewText: string = '') => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Stater</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; background-color: #050510; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;">
  
  <div style="display: none; max-height: 0; overflow: hidden;">${previewText}</div>

  <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #050510 0%, #0c0c1d 50%, #0f0a1e 100%); padding: 40px 16px;">
    <tr>
      <td align="center">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 440px;">
          
          <!-- Logo / Brand -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td colspan="2" align="center">
                    <img src="${STATER_LOGO_URL}" alt="Stater" width="64" height="64" style="display: block; border-radius: 16px; margin-bottom: 12px;" />
                  </td>
                </tr>
                <tr>
                  <td colspan="2" align="center">
                    <p style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Stater</p>
                    <p style="margin: 4px 0 0; color: #a78bfa; font-size: 12px; font-weight: 500; letter-spacing: 0.5px;">Inteligência para Prosperar</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CONTENT -->
          ${content}
          
          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 28px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <p style="margin: 0 0 8px; color: #475569; font-size: 12px;">
                      Enviado automaticamente pelo Stater
                    </p>
                    <p style="margin: 0; color: #334155; font-size: 11px;">
                      Não quer mais receber? <a href="https://stater.app/bills" style="color: #6366f1; text-decoration: none;">Desative na aba Contas</a>
                      &nbsp;&nbsp;•&nbsp;&nbsp;
                      <a href="https://stater.app" style="color: #475569; text-decoration: none;">stater.app</a>
                    </p>
                  </td>
                </tr>
              </table>
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

// Formatar data curta (27 Nov)
const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
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

// Emoji baseado na categoria
const getCategoryEmoji = (category?: string): string => {
  const categoryMap: Record<string, string> = {
    'Moradia': '🏠',
    'Aluguel': '🏠',
    'Casa': '🏠',
    'Utilidades': '⚡',
    'Luz': '⚡',
    'Energia': '⚡',
    'Água': '💧',
    'Internet': '🌐',
    'Telefone': '📱',
    'Celular': '📱',
    'Cartões': '💳',
    'Cartão': '💳',
    'Nubank': '💜',
    'Saúde': '🏥',
    'Plano de Saúde': '🏥',
    'Educação': '📚',
    'Streaming': '📺',
    'Netflix': '🎬',
    'Spotify': '🎵',
    'Transporte': '🚗',
    'Combustível': '⛽',
    'Gasolina': '⛽',
    'Seguro': '🛡️',
    'Alimentação': '🍽️',
    'Mercado': '🛒',
    'Assinatura': '📦',
    'Academia': '💪',
    'Lazer': '🎮',
    'Outros': '📄'
  };
  
  if (!category) return '📄';
  
  // Busca exata ou parcial
  for (const [key, emoji] of Object.entries(categoryMap)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return emoji;
    }
  }
  
  return '📄';
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
// TEMPLATE PRINCIPAL: RESUMO SEMANAL DE CONTAS
// Enviado 1x por semana com contas a vencer nos próximos 7 dias + vencidas
// ============================================
export const billsDigestTemplate = (
  userName: string,
  bills: BillForEmail[],
  overdueBills: BillForEmail[] = [] // Contas já vencidas (não pagas)
) => {
  const firstName = userName ? userName.split(' ')[0] : '';
  
  // Separar contas A VENCER por urgência (0 a 7 dias)
  const today: BillForEmail[] = [];
  const tomorrow: BillForEmail[] = [];
  const thisWeek: BillForEmail[] = [];
  
  bills.forEach(bill => {
    const days = getDaysUntil(bill.dueDate);
    if (days === 0) today.push(bill);
    else if (days === 1) tomorrow.push(bill);
    else if (days >= 2 && days <= 7) thisWeek.push(bill);
  });

  // Total de contas
  const upcomingBills = [...today, ...tomorrow, ...thisWeek];
  const totalCount = upcomingBills.length + overdueBills.length;

  // Gerar card de uma conta individual
  const generateBillCard = (bill: BillForEmail, urgency: 'overdue' | 'today' | 'tomorrow' | 'week') => {
    const days = getDaysUntil(bill.dueDate);
    
    // Cores baseadas na urgência
    const configs = {
      overdue: { 
        bg: 'linear-gradient(135deg, rgba(220, 38, 38, 0.12) 0%, rgba(220, 38, 38, 0.04) 100%)',
        border: 'rgba(220, 38, 38, 0.2)',
        iconBg: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
        badge: '#dc2626',
        badgeText: `⚠️ ${Math.abs(days)} dia${Math.abs(days) > 1 ? 's' : ''} atrás`
      },
      today: { 
        bg: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(239, 68, 68, 0.03) 100%)',
        border: 'rgba(239, 68, 68, 0.15)',
        iconBg: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
        badge: '#ef4444',
        badgeText: '⚠️ HOJE'
      },
      tomorrow: { 
        bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.03) 100%)',
        border: 'rgba(245, 158, 11, 0.15)',
        iconBg: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
        badge: '#f59e0b',
        badgeText: 'em 1 dia'
      },
      week: { 
        bg: 'rgba(99, 102, 241, 0.05)',
        border: 'rgba(99, 102, 241, 0.12)',
        iconBg: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
        badge: '#818cf8',
        badgeText: `em ${days} dias`
      }
    };
    
    const config = configs[urgency];
    
    return `
      <table width="100%" cellpadding="0" cellspacing="0" style="background: ${config.bg}; border-radius: 16px; border: 1px solid ${config.border}; overflow: hidden; margin-bottom: 12px;">
        <tr>
          <td style="padding: 18px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td valign="middle">
                  <p style="margin: 0 0 4px; color: #ffffff; font-size: 16px; font-weight: 700;">
                    ${bill.name}
                  </p>
                  <p style="margin: 0; color: #64748b; font-size: 13px;">
                    ${formatDateShort(bill.dueDate)}${bill.category ? ` • ${bill.category}` : ''}
                  </p>
                </td>
                <td align="right" valign="middle" style="white-space: nowrap;">
                  <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">
                    ${formatCurrency(bill.amount)}
                  </p>
                  <p style="margin: 4px 0 0; color: ${config.badge}; font-size: 11px; font-weight: 600;">
                    ${config.badgeText}
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  };

  // Gerar seção com label
  const generateSection = (
    title: string, 
    dotColor: string, 
    textColor: string, 
    billList: BillForEmail[], 
    urgency: 'overdue' | 'today' | 'tomorrow' | 'week'
  ) => {
    if (billList.length === 0) return '';
    
    return `
      <!-- ${title.toUpperCase()} -->
      <tr>
        <td style="padding-bottom: 24px;">
          <!-- Section Label -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">
            <tr>
              <td>
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="width: 8px; height: 8px; background: ${dotColor}; border-radius: 50%; box-shadow: 0 0 12px ${dotColor}99;"></td>
                    <td style="padding-left: 10px; color: ${textColor}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                      ${title}
                    </td>
                  </tr>
                </table>
              </td>
              <td align="right">
                <span style="color: #475569; font-size: 12px; font-weight: 500;">${billList.length} conta${billList.length > 1 ? 's' : ''}</span>
              </td>
            </tr>
          </table>
          
          <!-- Bill Cards -->
          ${billList.map(bill => generateBillCard(bill, urgency)).join('')}
        </td>
      </tr>
    `;
  };

  // Mensagem de saudação
  let greetingText = 'Lembrete da semana';
  let subText = 'Confira suas contas para os próximos dias.';
  
  if (overdueBills.length > 0) {
    greetingText = 'Atenção às suas contas';
    subText = 'Você tem contas que precisam de atenção. Vamos organizar?';
  } else if (today.length > 0) {
    subText = 'Você tem contas vencendo hoje. Que tal resolver agora?';
  }

  const content = `
    <!-- Hero Section com Gradiente -->
    <tr>
      <td style="padding-bottom: 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%); border-radius: 24px; border: 1px solid rgba(139, 92, 246, 0.2); overflow: hidden;">
          <tr>
            <td style="padding: 32px 28px;">
              <p style="margin: 0 0 6px; color: #a78bfa; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                Olá, ${firstName || 'usuário'} 👋
              </p>
              <h1 style="margin: 0 0 12px; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.2;">
                ${greetingText}
              </h1>
              <p style="margin: 0; color: #94a3b8; font-size: 15px; line-height: 1.5;">
                ${subText}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Stats Card - Apenas quantidade, sem total -->
    <tr>
      <td style="padding-bottom: 28px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <tr>
            <td style="padding: 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  ${overdueBills.length > 0 ? `
                  <td width="50%" style="border-right: 1px solid rgba(255,255,255,0.08);">
                    <p style="margin: 0 0 4px; color: #f87171; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ Em aberto</p>
                    <p style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">${overdueBills.length}</p>
                    <p style="margin: 4px 0 0; color: #64748b; font-size: 12px;">conta${overdueBills.length > 1 ? 's' : ''} vencida${overdueBills.length > 1 ? 's' : ''}</p>
                  </td>
                  <td width="50%" style="padding-left: 20px;">
                    <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Próximos 7 dias</p>
                    <p style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">${upcomingBills.length}</p>
                    <p style="margin: 4px 0 0; color: #64748b; font-size: 12px;">conta${upcomingBills.length > 1 ? 's' : ''} programada${upcomingBills.length > 1 ? 's' : ''}</p>
                  </td>
                  ` : `
                  <td style="text-align: center;">
                    <p style="margin: 0 0 4px; color: #64748b; font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">📅 Próximos 7 dias</p>
                    <p style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800;">${upcomingBills.length}</p>
                    <p style="margin: 4px 0 0; color: #64748b; font-size: 12px;">conta${upcomingBills.length > 1 ? 's' : ''} programada${upcomingBills.length > 1 ? 's' : ''}</p>
                  </td>
                  `}
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- LISTA DE CONTAS POR URGÊNCIA -->
    ${generateSection('Contas vencidas', '#dc2626', '#f87171', overdueBills, 'overdue')}
    ${generateSection('Vence hoje', '#ef4444', '#ef4444', today, 'today')}
    ${generateSection('Vence amanhã', '#f59e0b', '#f59e0b', tomorrow, 'tomorrow')}
    ${generateSection('Próximos 7 dias', '#6366f1', '#818cf8', thisWeek, 'week')}
    
    <!-- CTA Button -->
    <tr>
      <td align="center" style="padding-bottom: 40px;">
        <a href="https://stater.app/bills" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 16px 48px; border-radius: 14px; box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35); letter-spacing: 0.3px;">
          Gerenciar contas →
        </a>
      </td>
    </tr>
  `;

  const previewText = overdueBills.length > 0 
    ? `⚠️ Você tem ${overdueBills.length} conta${overdueBills.length > 1 ? 's' : ''} vencida${overdueBills.length > 1 ? 's' : ''} e ${upcomingBills.length} para a semana`
    : `📬 ${totalCount} conta${totalCount > 1 ? 's' : ''} para esta semana`;

  return baseTemplate(content, previewText);
};

// ============================================
// TEMPLATE: BOAS-VINDAS
// ============================================
export const welcomeTemplate = (userName: string) => {
  const firstName = userName ? userName.split(' ')[0] : '';

  const content = `
    <!-- Hero Section -->
    <tr>
      <td style="padding-bottom: 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%); border-radius: 24px; border: 1px solid rgba(16, 185, 129, 0.2); overflow: hidden;">
          <tr>
            <td style="padding: 32px 28px; text-align: center;">
              <div style="font-size: 52px; margin-bottom: 16px;">🚀</div>
              <h1 style="margin: 0 0 12px; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                Bem-vindo ao Stater${firstName ? `, ${firstName}` : ''}!
              </h1>
              <p style="margin: 0; color: #94a3b8; font-size: 15px; line-height: 1.5;">
                Seu controle financeiro inteligente começa agora
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Features Cards -->
    <tr>
      <td style="padding-bottom: 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); overflow: hidden;">
          
          <!-- Feature 1 -->
          <tr>
            <td style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48" valign="top">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-radius: 14px; text-align: center; line-height: 48px; font-size: 22px;">
                      📊
                    </div>
                  </td>
                  <td style="padding-left: 16px;" valign="middle">
                    <p style="margin: 0 0 4px; color: #ffffff; font-size: 16px; font-weight: 700;">
                      Controle total
                    </p>
                    <p style="margin: 0; color: #64748b; font-size: 13px;">
                      Veja para onde vai seu dinheiro com clareza
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Feature 2 -->
          <tr>
            <td style="padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.05);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48" valign="top">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 14px; text-align: center; line-height: 48px; font-size: 22px;">
                      🔔
                    </div>
                  </td>
                  <td style="padding-left: 16px;" valign="middle">
                    <p style="margin: 0 0 4px; color: #ffffff; font-size: 16px; font-weight: 700;">
                      Lembretes inteligentes
                    </p>
                    <p style="margin: 0; color: #64748b; font-size: 13px;">
                      Nunca mais esqueça uma conta importante
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Feature 3 -->
          <tr>
            <td style="padding: 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="48" valign="top">
                    <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%); border-radius: 14px; text-align: center; line-height: 48px; font-size: 22px;">
                      🤖
                    </div>
                  </td>
                  <td style="padding-left: 16px;" valign="middle">
                    <p style="margin: 0 0 4px; color: #ffffff; font-size: 16px; font-weight: 700;">
                      IA Financeira
                    </p>
                    <p style="margin: 0; color: #64748b; font-size: 13px;">
                      Converse sobre suas finanças com inteligência
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
    
    <!-- CTA Button -->
    <tr>
      <td align="center" style="padding-bottom: 40px;">
        <a href="https://stater.app" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 16px 48px; border-radius: 14px; box-shadow: 0 8px 32px rgba(16, 185, 129, 0.35); letter-spacing: 0.3px;">
          Começar agora →
        </a>
      </td>
    </tr>
  `;

  return baseTemplate(content, `🚀 Bem-vindo ao Stater${firstName ? `, ${firstName}` : ''}! Seu assistente financeiro.`);
};

// ============================================
// TEMPLATE: TESTE
// ============================================
export const testEmailTemplate = () => {
  const content = `
    <!-- Hero Section -->
    <tr>
      <td style="padding-bottom: 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%); border-radius: 24px; border: 1px solid rgba(16, 185, 129, 0.2); overflow: hidden;">
          <tr>
            <td style="padding: 32px 28px; text-align: center;">
              <table width="56" height="56" cellpadding="0" cellspacing="0" style="margin: 0 auto 20px;">
                <tr>
                  <td align="center" valign="middle" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; width: 56px; height: 56px;">
                    <span style="font-size: 24px; color: #ffffff;">✓</span>
                  </td>
                </tr>
              </table>
              
              <h1 style="margin: 0 0 12px; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                Tudo pronto!
              </h1>
              <p style="margin: 0; color: #94a3b8; font-size: 15px; line-height: 1.5;">
                Sistema de notificações <span style="color: #4ade80; font-weight: 600;">100% operacional</span>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Info Card -->
    <tr>
      <td style="padding-bottom: 32px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: rgba(255,255,255,0.03); border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <tr>
            <td style="padding: 20px;">
              <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #ffffff;">📬 Você receberá:</p>
              <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                Um resumo semanal com todas as suas contas próximas do vencimento, organizadas por urgência.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- CTA Button -->
    <tr>
      <td align="center" style="padding-bottom: 40px;">
        <a href="https://stater.app" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #4f46e5 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 16px 48px; border-radius: 14px; box-shadow: 0 8px 32px rgba(99, 102, 241, 0.35); letter-spacing: 0.3px;">
          Acessar Stater →
        </a>
      </td>
    </tr>
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
