// 💰 STATER PAYWALL SYSTEM - VERSÃO PROFISSIONAL
// Sistema de paywalls standalone baseado no planejamento CMO-level

export class StaterPaywallSystem {
  private static isInitialized = false;
  private static config = {
    brandColors: {
      primary: '#2563eb',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#dc2626',
      purple: '#7c3aed'
    },
    pricing: {
      superPromo: 4.99,
      weekly: 8.99,
      monthly: 15.90,
      yearly: 29.90
    }
  };
  
  static async initialize(options: any = {}) {
    console.log('🚀 Inicializando Stater Paywall System Professional');
    this.isInitialized = true;
    return { success: true, platform: 'professional' };
  }
  
  static async presentPaywall(type: string, context: any = {}) {
    if (!this.isInitialized) {
      throw new Error('StaterPaywallSystem não foi inicializado.');
    }
    
    console.log(`💎 Apresentando paywall profissional: ${type}`, context);
    
    // Selecionar template baseado no tipo
    let paywallHTML = '';
    
    switch (type) {
      case 'onboarding':
        paywallHTML = this.createOnboardingPaywall();
        break;
      case 'limit_reached':
        paywallHTML = this.createLimitReachedPaywall();
        break;
      case 'super_promo':
        paywallHTML = this.createSuperPromoPaywall();
        break;
      case 'premium_upgrade':
        paywallHTML = this.createPremiumUpgradePaywall();
        break;
      default:
        paywallHTML = this.createOnboardingPaywall();
        break;
    }
    
    // Criar modal profissional
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      z-index: 10000;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.4s ease-out;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      backdrop-filter: blur(8px);
    `;
    
    modal.innerHTML = paywallHTML;
    
    // Adicionar CSS profissional
    this.injectProfessionalCSS();
    
    document.body.appendChild(modal);
    
    // Event listeners
    this.attachEventListeners(modal, type);
    
    // Auto-remove após 90 segundos
    setTimeout(() => {
      if (document.body.contains(modal)) {
        modal.remove();
      }
    }, 90000);
    
    return { success: true, paywall: type, context };
  }
  
  private static createOnboardingPaywall(): string {
    return `
      <div class="stater-paywall-container stater-onboarding">
        <!-- Header com gradiente -->
        <div class="stater-header">
          <div class="stater-badge">🔥 LANÇAMENTO</div>
          
          <h1 class="stater-title">
            Pare de Perder Dinheiro<br/>Sem Saber Onde
          </h1>
          <p class="stater-subtitle">
            Descubra os vazamentos ocultos no seu orçamento em 3 minutos
          </p>
        </div>
        
        <!-- Conteúdo principal -->
        <div class="stater-content">
          <!-- Prova Social -->
          <div class="stater-social-proof">
            💰 Nossos usuários economizam em média R$ 847/mês
          </div>
          
          <!-- Benefícios -->
          <div class="stater-benefits">
            <div class="stater-benefit-item">
              <span class="stater-check">✅</span>
              <span><strong>IA identifica</strong> exatamente onde seu dinheiro está vazando</span>
            </div>
            <div class="stater-benefit-item">
              <span class="stater-check">✅</span>
              <span><strong>Alertas inteligentes</strong> antes de estourar o orçamento</span>
            </div>
            <div class="stater-benefit-item">
              <span class="stater-check">✅</span>
              <span><strong>Bot Telegram 24h</strong> para consultas instantâneas</span>
            </div>
            <div class="stater-benefit-item">
              <span class="stater-check">✅</span>
              <span><strong>Relatórios profissionais</strong> que seu contador vai invejar</span>
            </div>
          </div>
          
          <!-- Oferta Especial -->
          <div class="stater-special-offer">
            <div class="stater-offer-title">
              🎁 TESTE 3 DIAS GRÁTIS
            </div>
            <div class="stater-offer-price">
              Depois apenas R$ 4,99
            </div>
            <div class="stater-offer-detail">
              primeira semana • depois R$ 8,99/semana
            </div>
          </div>
          
          <!-- Avaliação -->
          <div class="stater-review">
            <div class="stater-stars">⭐⭐⭐⭐⭐</div>
            <div class="stater-review-text">
              "Mudou minha vida financeira" - Maria S.
            </div>
          </div>
          
          <!-- CTAs -->
          <button class="stater-cta-primary" onclick="window.StaterPaywall.handlePurchase('onboarding', 'super_promo')">
            🚀 QUERO ECONOMIZAR R$ 847/MÊS
          </button>
          
          <button class="stater-cta-secondary" onclick="window.StaterPaywall.close()">
            Talvez depois
          </button>
          
          <p class="stater-disclaimer">
            ⏰ Promoção de lançamento • Sem compromisso • Cancele quando quiser
          </p>
        </div>
      </div>
    `;
  }
  
  private static createLimitReachedPaywall(): string {
    return `
      <div class="stater-paywall-container stater-limit-reached">
        <!-- Header de alerta -->
        <div class="stater-header stater-emergency">
          <div class="stater-warning-icon">⚠️</div>
          <h1 class="stater-title">
            Ops! Você Atingiu Seu Limite Diário
          </h1>
          <p class="stater-subtitle">
            Mas seus gastos não param... Que tal ter controle total?
          </p>
        </div>
        
        <!-- Conteúdo -->
        <div class="stater-content">
          <!-- Urgência -->
          <div class="stater-urgency-alert">
            🚨 Enquanto você está limitado, suas despesas continuam correndo soltas...
          </div>
          
          <!-- Problemas -->
          <div class="stater-problems">
            <h3 class="stater-problems-title">
              Neste exato momento você pode estar:
            </h3>
            <div class="stater-problem-item">
              <span class="stater-x">❌</span>
              <span>Perdendo dinheiro em assinaturas esquecidas</span>
            </div>
            <div class="stater-problem-item">
              <span class="stater-x">❌</span>
              <span>Pagando juros desnecessários</span>
            </div>
            <div class="stater-problem-item">
              <span class="stater-x">❌</span>
              <span>Deixando passar oportunidades de economia</span>
            </div>
            <div class="stater-problem-item">
              <span class="stater-x">❌</span>
              <span>Repetindo erros financeiros do passado</span>
            </div>
          </div>
          
          <!-- Solução -->
          <div class="stater-solution">
            <div class="stater-solution-title">
              💡 Com o Stater PRO você nunca mais ficará no escuro
            </div>
            <div class="stater-solution-subtitle">
              Por menos que um café por dia, tenha controle total
            </div>
          </div>
          
          <!-- Benefícios Pro -->
          <div class="stater-pro-benefits">
            <div class="stater-pro-benefit">
              <span class="stater-icon">🔄</span>
              <span>Análises ILIMITADAS</span>
            </div>
            <div class="stater-pro-benefit">
              <span class="stater-icon">🔔</span>
              <span>Alertas em tempo real</span>
            </div>
            <div class="stater-pro-benefit">
              <span class="stater-icon">🤖</span>
              <span>Bot Telegram 24/7</span>
            </div>
            <div class="stater-pro-benefit">
              <span class="stater-icon">🚫</span>
              <span>Zero anúncios</span>
            </div>
          </div>
          
          <!-- CTA -->
          <button class="stater-cta-emergency" onclick="window.StaterPaywall.handlePurchase('limit_reached', 'emergency_unlock')">
            🚨 DESBLOQUEAR AGORA - R$ 4,99
          </button>
          
          <button class="stater-cta-secondary" onclick="window.StaterPaywall.close()">
            Continuar limitado
          </button>
          
          <p class="stater-disclaimer">
            ⏰ Última chance • Primeira semana R$ 4,99 • Depois R$ 8,99/semana
          </p>
        </div>
      </div>
    `;
  }
  
  private static createSuperPromoPaywall(): string {
    return `
      <div class="stater-paywall-container stater-super-promo">
        <!-- Badge de oferta -->
        <div class="stater-super-badge">🔥 SUPER PROMOÇÃO 🔥</div>
        
        <!-- Header -->
        <div class="stater-header stater-promo">
          <h1 class="stater-title">
            💰 ÚLTIMA OPORTUNIDADE
          </h1>
          <p class="stater-subtitle">
            Primeira semana por apenas R$ 4,99!
          </p>
        </div>
        
        <!-- Conteúdo -->
        <div class="stater-content">
          <!-- Comparação de preços -->
          <div class="stater-price-comparison">
            <div class="stater-old-price">
              Preço normal: R$ 8,99/semana
            </div>
            <div class="stater-new-price">
              R$ 4,99
            </div>
            <div class="stater-savings">
              ECONOMIZE 44% na primeira semana!
            </div>
          </div>
          
          <!-- Urgência -->
          <div class="stater-time-urgency">
            ⏰ Oferta válida apenas HOJE • Não perca!
          </div>
          
          <!-- Benefícios exclusivos -->
          <h3 class="stater-exclusive-title">
            🎁 O que você ganha HOJE:
          </h3>
          
          <div class="stater-exclusive-benefits">
            <div class="stater-exclusive-benefit">
              <span class="stater-icon">🎯</span>
              <span>IA detecta gastos ocultos em 2 minutos</span>
            </div>
            <div class="stater-exclusive-benefit">
              <span class="stater-icon">🤖</span>
              <span>Bot Telegram exclusivo 24h</span>
            </div>
            <div class="stater-exclusive-benefit">
              <span class="stater-icon">📊</span>
              <span>Relatórios profissionais ilimitados</span>
            </div>
            <div class="stater-exclusive-benefit">
              <span class="stater-icon">🔔</span>
              <span>Alertas inteligentes de economia</span>
            </div>
          </div>
          
          <!-- Garantia -->
          <div class="stater-guarantee">
            <div class="stater-guarantee-title">
              ✅ GARANTIA TOTAL
            </div>
            <div class="stater-guarantee-text">
              Cancele quando quiser • Sem compromisso • 100% seguro
            </div>
          </div>
          
          <!-- CTA -->
          <button class="stater-cta-promo" onclick="window.StaterPaywall.handlePurchase('super_promo', 'promo_activation')">
            🚀 ATIVAR SUPER PROMOÇÃO R$ 4,99
          </button>
          
          <button class="stater-cta-secondary" onclick="window.StaterPaywall.close()">
            Deixar passar esta oportunidade
          </button>
          
          <p class="stater-disclaimer">
            ⚡ Oferta por tempo limitado • Primeira semana R$ 4,99 • Depois R$ 8,99/semana
          </p>
        </div>
      </div>
    `;
  }
  
  private static createPremiumUpgradePaywall(): string {
    return `
      <div class="stater-paywall-container stater-premium">
        <!-- Header premium -->
        <div class="stater-header stater-premium-header">
          <div class="stater-premium-badge">👑 PREMIUM</div>
          
          <div class="stater-trophy">🏆</div>
          <h1 class="stater-title">
            Seja um Expert Financeiro
          </h1>
          <p class="stater-subtitle">
            Transforme suas finanças com ferramentas profissionais
          </p>
        </div>
        
        <!-- Conteúdo -->
        <div class="stater-content">
          <!-- Status atual vs Premium -->
          <div class="stater-comparison">
            <div class="stater-current-status">
              <div class="stater-status-title">❌ Sua situação atual:</div>
              <div class="stater-status-item">• Análises limitadas por dia</div>
              <div class="stater-status-item">• Sem alertas em tempo real</div>
              <div class="stater-status-item">• Relatórios básicos</div>
            </div>
            
            <div class="stater-premium-status">
              <div class="stater-status-title">✅ Com Stater Premium:</div>
              <div class="stater-status-item">• Análises ILIMITADAS 24/7</div>
              <div class="stater-status-item">• IA monitora suas finanças 24h</div>
              <div class="stater-status-item">• Relatórios executivos completos</div>
            </div>
          </div>
          
          <!-- Planos -->
          <div class="stater-plans">
            <div class="stater-plan stater-plan-promo">
              <div class="stater-plan-badge">PRIMEIRA VEZ</div>
              <div class="stater-plan-title">
                🎉 Semanal - R$ 4,99
              </div>
              <div class="stater-plan-detail">Promoção especial • Depois R$ 8,99</div>
            </div>
            
            <div class="stater-plan stater-plan-recommended">
              <div class="stater-plan-badge">RECOMENDADO</div>
              <div class="stater-plan-title">
                👑 Mensal - R$ 15,90
              </div>
              <div class="stater-plan-detail">7 dias grátis • Cancele quando quiser</div>
            </div>
            
            <div class="stater-plan">
              <div class="stater-plan-title">
                🔥 Pro Anual - R$ 29,90
              </div>
              <div class="stater-plan-detail">Melhor custo-benefício</div>
            </div>
          </div>
          
          <!-- Prova social premium -->
          <div class="stater-premium-social">
            <div class="stater-stars">⭐⭐⭐⭐⭐</div>
            <div class="stater-testimonial">
              "Com o Premium, economizei R$ 1.200 em 2 meses!" - Carlos M.
            </div>
          </div>
          
          <!-- CTA -->
          <button class="stater-cta-premium" onclick="window.StaterPaywall.handlePurchase('premium_upgrade', 'expert_mode')">
            👑 VIRAR EXPERT FINANCEIRO AGORA
          </button>
          
          <button class="stater-cta-secondary" onclick="window.StaterPaywall.close()">
            Continuar na versão básica
          </button>
          
          <p class="stater-disclaimer">
            🔒 Seguro • Cancele quando quiser • Sem pegadinhas
          </p>
        </div>
      </div>
    `;
  }
  
  private static injectProfessionalCSS() {
    if (document.getElementById('stater-professional-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'stater-professional-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.9); }
        to { opacity: 1; transform: scale(1); }
      }
      
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      
      .stater-paywall-container {
        background: linear-gradient(135deg, #ffffff, #f8fafc);
        padding: 0;
        border-radius: 24px;
        max-width: 440px;
        width: 95%;
        color: #0f172a;
        box-shadow: 0 25px 80px rgba(0,0,0,0.15);
        position: relative;
        overflow: hidden;
        animation: slideUp 0.5s ease-out;
      }
      
      /* ONBOARDING STYLES */
      .stater-onboarding .stater-header {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        padding: 30px 30px 20px 30px;
        color: white;
        text-align: center;
        position: relative;
      }
      
      .stater-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(255,255,255,0.2);
        color: white;
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
      
      .stater-title {
        margin: 0 0 10px 0;
        font-size: 28px;
        font-weight: 800;
        line-height: 1.2;
      }
      
      .stater-subtitle {
        margin: 0;
        opacity: 0.9;
        font-size: 16px;
      }
      
      .stater-content {
        padding: 30px;
      }
      
      .stater-social-proof {
        background: linear-gradient(45deg, #10b981, #059669);
        color: white;
        padding: 15px;
        border-radius: 12px;
        text-align: center;
        margin-bottom: 25px;
        font-weight: 600;
      }
      
      .stater-benefits {
        margin-bottom: 25px;
      }
      
      .stater-benefit-item {
        display: flex;
        align-items: center;
        margin: 12px 0;
      }
      
      .stater-check {
        color: #10b981;
        font-size: 18px;
        margin-right: 10px;
      }
      
      .stater-special-offer {
        background: linear-gradient(45deg, #f59e0b, #d97706);
        color: white;
        padding: 20px;
        border-radius: 16px;
        text-align: center;
        margin-bottom: 25px;
      }
      
      .stater-offer-title {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      
      .stater-offer-price {
        font-size: 24px;
        font-weight: 800;
        margin-bottom: 5px;
      }
      
      .stater-offer-detail {
        font-size: 14px;
        opacity: 0.9;
      }
      
      .stater-review {
        text-align: center;
        margin-bottom: 20px;
        padding: 15px;
        background: #f1f5f9;
        border-radius: 12px;
      }
      
      .stater-stars {
        color: #f59e0b;
        font-size: 18px;
        margin-bottom: 5px;
      }
      
      .stater-review-text {
        font-size: 14px;
        font-style: italic;
        color: #64748b;
      }
      
      /* LIMIT REACHED STYLES */
      .stater-limit-reached {
        background: linear-gradient(135deg, #fee2e2, #fecaca);
        border: 2px solid #f87171;
        color: #7f1d1d;
        box-shadow: 0 25px 80px rgba(248, 113, 113, 0.3);
      }
      
      .stater-emergency {
        background: linear-gradient(135deg, #dc2626, #b91c1c) !important;
        padding: 25px 30px;
        color: white;
        text-align: center;
      }
      
      .stater-warning-icon {
        font-size: 48px;
        margin-bottom: 10px;
      }
      
      .stater-limit-reached .stater-title {
        font-size: 24px;
        font-weight: 800;
      }
      
      .stater-limit-reached .stater-content {
        background: white;
      }
      
      .stater-urgency-alert {
        background: linear-gradient(45deg, #fbbf24, #f59e0b);
        color: white;
        padding: 18px;
        border-radius: 12px;
        text-align: center;
        margin-bottom: 25px;
        font-weight: 600;
      }
      
      .stater-problems-title {
        margin: 0 0 15px 0;
        font-size: 16px;
        color: #dc2626;
      }
      
      .stater-problem-item {
        display: flex;
        align-items: flex-start;
        margin: 10px 0;
      }
      
      .stater-x {
        color: #dc2626;
        font-size: 16px;
        margin-right: 10px;
        margin-top: 2px;
      }
      
      .stater-solution {
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: white;
        padding: 20px;
        border-radius: 16px;
        text-align: center;
        margin-bottom: 25px;
      }
      
      .stater-solution-title {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      
      .stater-solution-subtitle {
        font-size: 14px;
        opacity: 0.9;
      }
      
      .stater-pro-benefits {
        margin-bottom: 25px;
      }
      
      .stater-pro-benefit {
        display: flex;
        align-items: center;
        margin: 10px 0;
      }
      
      .stater-icon {
        color: #10b981;
        font-size: 16px;
        margin-right: 10px;
      }
      
      /* SUPER PROMO STYLES */
      .stater-super-promo {
        background: linear-gradient(135deg, #fef3c7, #fbbf24);
        border: 3px solid #f59e0b;
        color: #78350f;
        box-shadow: 0 25px 80px rgba(245, 158, 11, 0.4);
      }
      
      .stater-super-badge {
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(45deg, #dc2626, #b91c1c);
        color: white;
        padding: 8px 20px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 800;
        z-index: 1;
        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.3);
      }
      
      .stater-promo {
        background: linear-gradient(135deg, #f59e0b, #d97706) !important;
        padding: 40px 30px 25px 30px;
        color: white;
        text-align: center;
        margin-top: 10px;
      }
      
      .stater-super-promo .stater-title {
        font-size: 32px;
        font-weight: 900;
        line-height: 1.1;
      }
      
      .stater-super-promo .stater-subtitle {
        font-size: 18px;
        font-weight: 600;
      }
      
      .stater-super-promo .stater-content {
        background: white;
      }
      
      .stater-price-comparison {
        background: linear-gradient(45deg, #fee2e2, #fecaca);
        border: 2px solid #f87171;
        padding: 20px;
        border-radius: 16px;
        text-align: center;
        margin-bottom: 25px;
      }
      
      .stater-old-price {
        font-size: 16px;
        color: #7f1d1d;
        margin-bottom: 10px;
        text-decoration: line-through;
      }
      
      .stater-new-price {
        font-size: 28px;
        font-weight: 900;
        color: #dc2626;
        margin-bottom: 5px;
      }
      
      .stater-savings {
        font-size: 14px;
        color: #7f1d1d;
        font-weight: 600;
      }
      
      .stater-time-urgency {
        background: linear-gradient(45deg, #dc2626, #b91c1c);
        color: white;
        padding: 18px;
        border-radius: 12px;
        text-align: center;
        margin-bottom: 25px;
        font-weight: 600;
      }
      
      .stater-exclusive-title {
        margin: 0 0 15px 0;
        font-size: 18px;
        color: #78350f;
        text-align: center;
      }
      
      .stater-exclusive-benefits {
        margin-bottom: 25px;
      }
      
      .stater-exclusive-benefit {
        display: flex;
        align-items: center;
        margin: 12px 0;
        padding: 12px;
        background: #fef3c7;
        border-radius: 8px;
      }
      
      .stater-exclusive-benefit .stater-icon {
        font-size: 18px;
        margin-right: 12px;
      }
      
      .stater-guarantee {
        background: #f0fdf4;
        border: 2px solid #10b981;
        padding: 15px;
        border-radius: 12px;
        text-align: center;
        margin-bottom: 25px;
      }
      
      .stater-guarantee-title {
        color: #059669;
        font-weight: 700;
        margin-bottom: 5px;
      }
      
      .stater-guarantee-text {
        font-size: 13px;
        color: #047857;
      }
      
      /* PREMIUM STYLES */
      .stater-premium {
        background: linear-gradient(135deg, #1e1b4b, #312e81);
        color: white;
        box-shadow: 0 25px 80px rgba(30, 27, 75, 0.5);
      }
      
      .stater-premium-header {
        background: linear-gradient(135deg, #7c3aed, #5b21b6) !important;
        padding: 30px;
        text-align: center;
        position: relative;
      }
      
      .stater-premium-badge {
        position: absolute;
        top: 15px;
        right: 15px;
        background: linear-gradient(45deg, #fbbf24, #f59e0b);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
      }
      
      .stater-trophy {
        font-size: 64px;
        margin-bottom: 15px;
      }
      
      .stater-comparison {
        margin-bottom: 30px;
      }
      
      .stater-current-status {
        background: rgba(239, 68, 68, 0.1);
        border: 2px solid #ef4444;
        padding: 15px;
        border-radius: 12px;
        margin-bottom: 15px;
      }
      
      .stater-premium-status {
        background: rgba(16, 185, 129, 0.1);
        border: 2px solid #10b981;
        padding: 15px;
        border-radius: 12px;
      }
      
      .stater-status-title {
        font-weight: 600;
        margin-bottom: 8px;
      }
      
      .stater-current-status .stater-status-title {
        color: #ef4444;
      }
      
      .stater-premium-status .stater-status-title {
        color: #10b981;
      }
      
      .stater-status-item {
        font-size: 14px;
        opacity: 0.8;
        margin: 4px 0;
      }
      
      .stater-plans {
        margin-bottom: 25px;
      }
      
      .stater-plan {
        background: rgba(255,255,255,0.1);
        border: 2px solid rgba(255,255,255,0.2);
        padding: 18px;
        border-radius: 16px;
        margin-bottom: 15px;
        cursor: pointer;
        transition: all 0.3s;
        position: relative;
      }
      
      .stater-plan:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(37, 99, 235, 0.3);
      }
      
      .stater-plan-recommended {
        background: linear-gradient(45deg, #7c3aed, #5b21b6) !important;
        border: 2px solid #a855f7 !important;
      }
      
      .stater-plan-badge {
        position: absolute;
        top: -8px;
        right: 15px;
        background: #ef4444;
        color: white;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 10px;
        font-weight: 700;
      }
      
      .stater-plan-recommended .stater-plan-badge {
        background: #fbbf24;
      }
      
      .stater-plan-title {
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 5px;
      }
      
      .stater-plan-detail {
        font-size: 13px;
        opacity: 0.8;
      }
      
      .stater-premium-social {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid #10b981;
        padding: 18px;
        border-radius: 12px;
        text-align: center;
        margin-bottom: 25px;
      }
      
      .stater-premium-social .stater-stars {
        color: #10b981;
        font-size: 16px;
        margin-bottom: 8px;
      }
      
      .stater-testimonial {
        font-size: 14px;
        opacity: 0.9;
      }
      
      /* BUTTON STYLES */
      .stater-cta-primary {
        width: 100%;
        background: linear-gradient(45deg, #2563eb, #1d4ed8);
        color: white;
        border: none;
        padding: 18px;
        border-radius: 12px;
        margin-bottom: 12px;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
        animation: pulse 2s infinite;
      }
      
      .stater-cta-primary:hover {
        animation: none;
        background: linear-gradient(45deg, #1d4ed8, #1e40af);
        transform: translateY(-1px);
      }
      
      .stater-cta-emergency {
        width: 100%;
        background: linear-gradient(45deg, #dc2626, #b91c1c);
        color: white;
        border: none;
        padding: 18px;
        border-radius: 12px;
        margin-bottom: 12px;
        font-weight: 700;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .stater-cta-promo {
        width: 100%;
        background: linear-gradient(45deg, #f59e0b, #d97706);
        color: white;
        border: none;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 15px;
        font-weight: 800;
        font-size: 18px;
        cursor: pointer;
        animation: pulse 1.5s infinite;
      }
      
      .stater-cta-premium {
        width: 100%;
        background: linear-gradient(45deg, #7c3aed, #5b21b6);
        color: white;
        border: none;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 15px;
        font-weight: 800;
        font-size: 18px;
        cursor: pointer;
      }
      
      .stater-cta-secondary {
        width: 100%;
        background: transparent;
        color: #64748b;
        border: 2px solid #e2e8f0;
        padding: 15px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
      }
      
      .stater-premium .stater-cta-secondary {
        color: rgba(255,255,255,0.6);
        border: 2px solid rgba(255,255,255,0.2);
      }
      
      .stater-disclaimer {
        font-size: 11px;
        color: #94a3b8;
        text-align: center;
        margin: 15px 0 0 0;
      }
      
      .stater-premium .stater-disclaimer {
        color: rgba(255,255,255,0.5);
      }
    `;
    
    document.head.appendChild(style);
  }
  
  private static attachEventListeners(modal: HTMLElement, type: string) {
    // Sistema de callbacks globais
    (window as any).StaterPaywall = {
      handlePurchase: (paywallType: string, action: string) => {
        console.log(`💳 Compra iniciada: ${paywallType} - ${action}`);
        
        // Simular sucesso da compra
        setTimeout(() => {
          modal.remove();
          this.showSuccessMessage(paywallType, action);
        }, 500);
      },
      
      close: () => {
        modal.remove();
        console.log(`❌ Paywall fechado: ${type}`);
      }
    };
    
    // Clique fora para fechar
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        console.log(`❌ Paywall fechado (clique fora): ${type}`);
      }
    });
    
    // ESC para fechar
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        modal.remove();
        document.removeEventListener('keydown', handleEscape);
        console.log(`❌ Paywall fechado (ESC): ${type}`);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    console.log(`💎 Paywall profissional apresentado: ${type}`);
  }
  
  private static showSuccessMessage(paywallType: string, action: string) {
    const successModal = document.createElement('div');
    successModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      z-index: 10001;
      display: flex;
      justify-content: center;
      align-items: center;
      animation: fadeIn 0.3s ease-out;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    successModal.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #10b981, #059669);
        padding: 40px;
        border-radius: 24px;
        text-align: center;
        color: white;
        max-width: 400px;
        width: 90%;
        animation: slideUp 0.5s ease-out;
      ">
        <div style="font-size: 64px; margin-bottom: 20px;">🎉</div>
        <h2 style="margin: 0 0 15px 0; font-size: 24px; font-weight: 800;">
          Parabéns!
        </h2>
        <p style="margin: 0 0 25px 0; font-size: 16px; opacity: 0.9;">
          Sua assinatura foi ativada com sucesso!
        </p>
        <div style="
          background: rgba(255,255,255,0.2);
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 25px;
        ">
          <strong>✅ Paywall: ${paywallType}</strong><br>
          <small>Ação: ${action}</small>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="
                  background: white;
                  color: #059669;
                  border: none;
                  padding: 15px 30px;
                  border-radius: 12px;
                  font-weight: 700;
                  cursor: pointer;
                ">
          Continuar
        </button>
      </div>
    `;
    
    document.body.appendChild(successModal);
    
    // Auto-remove após 5 segundos
    setTimeout(() => {
      if (document.body.contains(successModal)) {
        successModal.remove();
      }
    }, 5000);
  }
  
  // Métodos de utilidade
  static async setUserAttributes(attributes: Record<string, any>) {
    console.log('👤 Definindo atributos do usuário:', attributes);
    
    if (typeof window !== 'undefined') {
      (window as any).StaterUserAttributes = {
        ...attributes,
        timestamp: new Date().toISOString()
      };
    }
    
    return { success: true };
  }
  
  static async trackEvent(event: string, parameters?: Record<string, any>) {
    console.log('📊 Evento rastreado:', event, parameters);
    
    if (typeof window !== 'undefined') {
      const events = (window as any).StaterEvents || [];
      events.push({
        event,
        parameters,
        timestamp: new Date().toISOString()
      });
      (window as any).StaterEvents = events;
    }
    
    return { success: true };
  }
}

// Compatibilidade com sistema antigo
export class SuperwallWeb extends StaterPaywallSystem {
  static async presentPaywall(identifier: string, options: any = {}) {
    return super.presentPaywall(identifier, options);
  }
}
