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
      z-index: 2147483645;
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
      <div class="stater-paywall-container stater-modern-dark">
        <!-- Header moderno com gradiente roxo -->
        <div class="stater-header-modern">
          <div class="stater-lifetime-badge">🔥 OFERTA ESPECIAL</div>
          
          <div class="stater-discount-circle">
            <div class="stater-discount-percent">50<span class="stater-percent">%</span></div>
            <div class="stater-discount-text">OFF</div>
          </div>
          
          <h1 class="stater-modern-title">
            Stater Premium
          </h1>
          <p class="stater-modern-subtitle">
            Organize suas finanças com IA
          </p>
        </div>
        
        <!-- Conteúdo moderno -->
        <div class="stater-modern-content">
          <!-- Preços comparativos -->
          <div class="stater-price-display">
            <div class="stater-old-price-line">De R$ 8,99/semana</div>
            <div class="stater-new-price-display">Por apenas <span class="stater-big-price">R$ 4,99</span></div>
            <div class="stater-price-detail">primeira semana</div>
          </div>
          
          <!-- Benefícios REAIS do app -->
          <div class="stater-real-benefits">
            <h3 class="stater-benefits-title">✨ O que você vai ter acesso:</h3>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">🎙️</span>
              <div>
                <strong>Comando de Voz IA</strong>
                <div class="stater-benefit-desc">Fale "gastei 50 reais no mercado" e a IA organiza automaticamente</div>
              </div>
            </div>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">📱</span>
              <div>
                <strong>Scan de Documentos</strong>
                <div class="stater-benefit-desc">Fotografe notas fiscais e a IA digitaliza tudo em segundos</div>
              </div>
            </div>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">🤖</span>
              <div>
                <strong>Bot Telegram Incluído</strong>
                <div class="stater-benefit-desc">Consulte seus gastos de qualquer lugar pelo Telegram</div>
              </div>
            </div>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">📊</span>
              <div>
                <strong>Análises Ilimitadas</strong>
                <div class="stater-benefit-desc">Relatórios completos sem limites de uso</div>
              </div>
            </div>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">🚫</span>
              <div>
                <strong>Zero Anúncios</strong>
                <div class="stater-benefit-desc">Use o app sem interrupções ou propagandas</div>
              </div>
            </div>
          </div>
          
          <!-- CTA moderno -->
          <button class="stater-cta-modern" onclick="window.StaterPaywall.handlePurchase('onboarding', 'promo_start')">
            <div class="stater-cta-text">Ativar Oferta Especial</div>
            <div class="stater-cta-price">R$ 4,99 • primeira semana</div>
          </button>
          
          <button class="stater-cta-skip" onclick="window.StaterPaywall.close()">
            Continuar com versão gratuita
          </button>
          
          <p class="stater-modern-disclaimer">
            Cancele quando quiser • Sem compromisso • Dados seguros
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
      <div class="stater-paywall-container stater-modern-dark stater-lifetime">
        <!-- Badge flutuante -->
        <div class="stater-floating-badge">🔥 OFERTA POR TEMPO LIMITADO</div>
        
        <!-- Header com círculo de desconto grande -->
        <div class="stater-header-lifetime">
          <div class="stater-mega-discount">
            <div class="stater-discount-number">60<span class="stater-percent-large">%</span></div>
            <div class="stater-discount-label">OFF</div>
          </div>
          
          <h1 class="stater-lifetime-title">
            Lifetime Discount
          </h1>
          <p class="stater-lifetime-subtitle">
            Stater Premium com desconto vitalício
          </p>
        </div>
        
        <!-- Conteúdo da oferta especial -->
        <div class="stater-lifetime-content">
          <!-- Preço destacado -->
          <div class="stater-lifetime-pricing">
            <div class="stater-was-price">Era R$ 8,99/semana</div>
            <div class="stater-now-price">
              Agora <span class="stater-mega-price">R$ 4,99</span>
            </div>
            <div class="stater-forever-text">para sempre na primeira semana</div>
          </div>
          
          <!-- O que está incluído (REAL) -->
          <div class="stater-included-section">
            <h3 class="stater-included-title">🎁 Tudo incluído no Stater Premium:</h3>
            
            <div class="stater-included-grid">
              <div class="stater-included-item">
                <div class="stater-included-icon">🎙️</div>
                <div class="stater-included-text">Comando de voz IA</div>
              </div>
              
              <div class="stater-included-item">
                <div class="stater-included-icon">📸</div>
                <div class="stater-included-text">Scan de documentos</div>
              </div>
              
              <div class="stater-included-item">
                <div class="stater-included-icon">🤖</div>
                <div class="stater-included-text">Bot Telegram</div>
              </div>
              
              <div class="stater-included-item">
                <div class="stater-included-icon">📊</div>
                <div class="stater-included-text">Análises ilimitadas</div>
              </div>
              
              <div class="stater-included-item">
                <div class="stater-included-icon">�</div>
                <div class="stater-included-text">Zero anúncios</div>
              </div>
              
              <div class="stater-included-item">
                <div class="stater-included-icon">☁️</div>
                <div class="stater-included-text">Backup automático</div>
              </div>
            </div>
          </div>
          
          <!-- Urgência -->
          <div class="stater-urgency-timer">
            ⏰ Esta oferta expira em breve
          </div>
          
          <!-- CTA principal -->
          <button class="stater-cta-lifetime" onclick="window.StaterPaywall.handlePurchase('super_promo', 'lifetime_discount')">
            <div class="stater-cta-main-text">Ativar Desconto Vitalício</div>
            <div class="stater-cta-sub-text">R$ 4,99 • Economia de 60%</div>
          </button>
          
          <button class="stater-cta-skip" onclick="window.StaterPaywall.close()">
            Não quero economizar
          </button>
          
          <p class="stater-lifetime-disclaimer">
            Oferta por tempo limitado • Preço especial mantido para sempre
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
        50% { transform: scale(1.02); }
      }
      
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(168, 85, 247, 0.4); }
        50% { box-shadow: 0 0 30px rgba(168, 85, 247, 0.6); }
      }
      
      /* DESIGN MODERNO DARK INSPIRADO NA IMAGEM */
      .stater-paywall-container {
        background: linear-gradient(145deg, #0f0f23, #1a1a2e, #16213e);
        padding: 0;
        border-radius: 24px;
        max-width: 400px;
        width: 95%;
        color: white;
        box-shadow: 0 30px 80px rgba(0,0,0,0.8);
        position: relative;
        overflow: hidden;
        animation: slideUp 0.6s ease-out;
        border: 1px solid rgba(168, 85, 247, 0.2);
      }
      
      .stater-modern-dark {
        background: linear-gradient(145deg, #0a0a1a, #1a0a2e, #2a1a3e) !important;
      }
      
      /* HEADER MODERNO */
      .stater-header-modern {
        background: linear-gradient(145deg, #a855f7, #ec4899, #f97316);
        padding: 30px 25px 40px 25px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      
      .stater-header-modern::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
        opacity: 0.3;
      }
      
      .stater-lifetime-badge {
        position: absolute;
        top: 15px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(10px);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border: 1px solid rgba(255,255,255,0.2);
      }
      
      /* CÍRCULO DE DESCONTO GRANDE */
      .stater-discount-circle {
        width: 120px;
        height: 120px;
        background: linear-gradient(145deg, #fff, #f8f9fa);
        border-radius: 50%;
        margin: 20px auto 25px auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        position: relative;
        z-index: 2;
      }
      
      .stater-discount-percent {
        font-size: 36px;
        font-weight: 900;
        color: #1a1a2e;
        line-height: 1;
        margin-bottom: -5px;
      }
      
      .stater-percent {
        font-size: 20px;
        font-weight: 700;
      }
      
      .stater-discount-text {
        font-size: 14px;
        font-weight: 800;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .stater-modern-title {
        font-size: 32px;
        font-weight: 900;
        margin: 0 0 8px 0;
        color: white;
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        position: relative;
        z-index: 2;
      }
      
      .stater-modern-subtitle {
        font-size: 16px;
        opacity: 0.9;
        margin: 0;
        position: relative;
        z-index: 2;
      }
      
      /* CONTEÚDO MODERNO */
      .stater-modern-content {
        padding: 30px 25px;
        background: rgba(10, 10, 26, 0.95);
        backdrop-filter: blur(20px);
      }
      
      /* PREÇOS MODERNOS */
      .stater-price-display {
        text-align: center;
        margin-bottom: 30px;
        padding: 20px;
        background: linear-gradient(145deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1));
        border-radius: 16px;
        border: 1px solid rgba(168, 85, 247, 0.2);
      }
      
      .stater-old-price-line {
        font-size: 14px;
        color: #9ca3af;
        text-decoration: line-through;
        margin-bottom: 8px;
      }
      
      .stater-new-price-display {
        font-size: 18px;
        color: white;
        margin-bottom: 5px;
      }
      
      .stater-big-price {
        font-size: 32px;
        font-weight: 900;
        background: linear-gradient(145deg, #a855f7, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .stater-price-detail {
        font-size: 13px;
        color: #d1d5db;
        opacity: 0.8;
      }
      
      /* BENEFÍCIOS REAIS */
      .stater-real-benefits {
        margin-bottom: 25px;
      }
      
      .stater-benefits-title {
        font-size: 18px;
        font-weight: 700;
        color: white;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .stater-benefit-real {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16px;
        padding: 12px;
        background: rgba(168, 85, 247, 0.05);
        border-radius: 12px;
        border-left: 3px solid #a855f7;
      }
      
      .stater-icon-real {
        font-size: 20px;
        margin-right: 12px;
        margin-top: 2px;
        flex-shrink: 0;
      }
      
      .stater-benefit-real strong {
        color: white;
        font-weight: 600;
        font-size: 15px;
        display: block;
        margin-bottom: 4px;
      }
      
      .stater-benefit-desc {
        font-size: 13px;
        color: #d1d5db;
        opacity: 0.9;
        line-height: 1.4;
      }
      
      /* LIFETIME DESIGN */
      .stater-lifetime {
        max-width: 420px;
      }
      
      .stater-floating-badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(145deg, #dc2626, #b91c1c);
        color: white;
        padding: 8px 20px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        z-index: 10;
        box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
        animation: pulse 2s infinite;
      }
      
      .stater-header-lifetime {
        background: linear-gradient(145deg, #1a1a2e, #2a1a3e);
        padding: 40px 25px 30px 25px;
        text-align: center;
        position: relative;
        border-bottom: 1px solid rgba(168, 85, 247, 0.2);
      }
      
      .stater-mega-discount {
        width: 140px;
        height: 140px;
        background: linear-gradient(145deg, #a855f7, #ec4899);
        border-radius: 50%;
        margin: 0 auto 25px auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow: 0 15px 40px rgba(168, 85, 247, 0.4);
        animation: glow 3s infinite;
      }
      
      .stater-discount-number {
        font-size: 44px;
        font-weight: 900;
        color: white;
        line-height: 1;
        text-shadow: 0 2px 10px rgba(0,0,0,0.3);
      }
      
      .stater-percent-large {
        font-size: 24px;
        font-weight: 700;
      }
      
      .stater-discount-label {
        font-size: 16px;
        font-weight: 800;
        color: white;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: -2px;
      }
      
      .stater-lifetime-title {
        font-size: 28px;
        font-weight: 900;
        color: white;
        margin: 0 0 8px 0;
      }
      
      .stater-lifetime-subtitle {
        font-size: 16px;
        color: #d1d5db;
        opacity: 0.9;
        margin: 0;
      }
      
      .stater-lifetime-content {
        padding: 30px 25px;
        background: rgba(10, 10, 26, 0.98);
      }
      
      /* PREÇOS LIFETIME */
      .stater-lifetime-pricing {
        text-align: center;
        margin-bottom: 30px;
        padding: 25px;
        background: linear-gradient(145deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.15));
        border-radius: 20px;
        border: 2px solid rgba(168, 85, 247, 0.3);
      }
      
      .stater-was-price {
        font-size: 14px;
        color: #9ca3af;
        text-decoration: line-through;
        margin-bottom: 10px;
      }
      
      .stater-now-price {
        font-size: 20px;
        color: white;
        margin-bottom: 8px;
        font-weight: 600;
      }
      
      .stater-mega-price {
        font-size: 36px;
        font-weight: 900;
        background: linear-gradient(145deg, #a855f7, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .stater-forever-text {
        font-size: 13px;
        color: #d1d5db;
        opacity: 0.8;
      }
      
      /* INCLUDED SECTION */
      .stater-included-section {
        margin-bottom: 25px;
      }
      
      .stater-included-title {
        font-size: 16px;
        font-weight: 700;
        color: white;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .stater-included-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      
      .stater-included-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 15px 10px;
        background: rgba(168, 85, 247, 0.08);
        border-radius: 12px;
        border: 1px solid rgba(168, 85, 247, 0.2);
      }
      
      .stater-included-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }
      
      .stater-included-text {
        font-size: 12px;
        color: #d1d5db;
        font-weight: 500;
        line-height: 1.3;
      }
      
      .stater-urgency-timer {
        background: linear-gradient(145deg, #dc2626, #b91c1c);
        color: white;
        padding: 12px;
        border-radius: 12px;
        text-align: center;
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 25px;
        animation: pulse 2s infinite;
      }
      
      /* BOTÕES MODERNOS */
      .stater-cta-modern {
        width: 100%;
        background: linear-gradient(145deg, #a855f7, #ec4899);
        color: white;
        border: none;
        padding: 20px;
        border-radius: 16px;
        margin-bottom: 15px;
        cursor: pointer;
        transition: all 0.3s;
        text-align: center;
        font-weight: 700;
        box-shadow: 0 8px 25px rgba(168, 85, 247, 0.4);
        animation: glow 3s infinite;
      }
      
      .stater-cta-modern:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(168, 85, 247, 0.6);
      }
      
      .stater-cta-text {
        font-size: 18px;
        font-weight: 800;
        margin-bottom: 4px;
      }
      
      .stater-cta-price {
        font-size: 14px;
        opacity: 0.9;
      }
      
      .stater-cta-lifetime {
        width: 100%;
        background: linear-gradient(145deg, #a855f7, #ec4899);
        color: white;
        border: none;
        padding: 22px;
        border-radius: 16px;
        margin-bottom: 15px;
        cursor: pointer;
        transition: all 0.3s;
        text-align: center;
        font-weight: 700;
        box-shadow: 0 10px 30px rgba(168, 85, 247, 0.5);
        animation: glow 2s infinite;
      }
      
      .stater-cta-lifetime:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 40px rgba(168, 85, 247, 0.7);
      }
      
      .stater-cta-main-text {
        font-size: 18px;
        font-weight: 900;
        margin-bottom: 5px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .stater-cta-sub-text {
        font-size: 14px;
        opacity: 0.9;
      }
      
      .stater-cta-skip {
        width: 100%;
        background: transparent;
        color: #9ca3af;
        border: 1px solid rgba(156, 163, 175, 0.3);
        padding: 15px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s;
        margin-bottom: 15px;
      }
      
      .stater-cta-skip:hover {
        background: rgba(156, 163, 175, 0.1);
        color: white;
      }
      
      .stater-modern-disclaimer {
        font-size: 11px;
        color: #9ca3af;
        text-align: center;
        margin: 0;
        opacity: 0.8;
      }
      
      .stater-lifetime-disclaimer {
        font-size: 11px;
        color: #9ca3af;
        text-align: center;
        margin: 0;
        opacity: 0.8;
      }
      
      /* RESPONSIVO */
      @media (max-width: 480px) {
        .stater-paywall-container {
          max-width: 95%;
          margin: 10px;
        }
        
        .stater-discount-circle {
          width: 100px;
          height: 100px;
        }
        
        .stater-discount-percent {
          font-size: 32px;
        }
        
        .stater-mega-discount {
          width: 120px;
          height: 120px;
        }
        
        .stater-discount-number {
          font-size: 38px;
        }
        
        .stater-included-grid {
          grid-template-columns: 1fr;
        }
      }
      
      /* LEGACY COMPATIBILITY */
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
    `;
    
    document.head.appendChild(style);
  }
  
  /* MÉTODO PARA CRIAR PAYWALL DE ONBOARDING */
  private static createOnboardingPaywall(): string {
    return `
      <div class="stater-paywall-container stater-modern-dark">
        <div class="stater-header-modern">
          <div class="stater-lifetime-badge">🚀 BOAS-VINDAS</div>
          
          <div class="stater-discount-circle">
            <div class="stater-discount-percent">
              <span class="stater-percent">FREE</span>
            </div>
            <div class="stater-discount-text">7 DIAS</div>
          </div>
          
          <h2 class="stater-modern-title">Bem-vindo ao Stater!</h2>
          <p class="stater-modern-subtitle">Comece sua jornada financeira inteligente</p>
        </div>
        
        <div class="stater-modern-content">
          <div class="stater-real-benefits">
            <h3 class="stater-benefits-title">✨ Funcionalidades Reais do App</h3>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">🎤</span>
              <div>
                <strong>Comandos de Voz Inteligentes</strong>
                <p class="stater-benefit-desc">Diga "Gastei 200 reais abastecendo o carro" e registre automaticamente</p>
              </div>
            </div>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">📷</span>
              <div>
                <strong>OCR de Documentos</strong>
                <p class="stater-benefit-desc">Fotografe notas fiscais e extratos - dados extraídos automaticamente</p>
              </div>
            </div>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">🤖</span>
              <div>
                <strong>Bot do Telegram</strong>
                <p class="stater-benefit-desc">Gerencie finanças direto pelo Telegram com limite compartilhado</p>
              </div>
            </div>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">🧠</span>
              <div>
                <strong>IA Financeira</strong>
                <p class="stater-benefit-desc">Análise inteligente de padrões e sugestões personalizadas</p>
              </div>
            </div>
          </div>
          
          <button class="stater-cta-modern" onclick="StaterPaywall.handlePurchase('onboarding', 'trial')">
            <div class="stater-cta-text">COMEÇAR TESTE GRÁTIS</div>
            <div class="stater-cta-price">7 dias • Sem compromisso</div>
          </button>
          
          <button class="stater-cta-skip" onclick="StaterPaywall.close()">
            Continuar sem premium
          </button>
          
          <p class="stater-modern-disclaimer">
            Cancele a qualquer momento. Sem taxas ocultas.
          </p>
        </div>
      </div>
    `;
  }
  
  /* MÉTODO PARA CRIAR PAYWALL SUPER PROMOÇÃO */
  private static createSuperPromoPaywall(): string {
    return `
      <div class="stater-paywall-container stater-lifetime">
        <div class="stater-floating-badge">⚡ OFERTA LIMITADA</div>
        
        <div class="stater-header-lifetime">
          <div class="stater-mega-discount">
            <div class="stater-discount-number">
              70<span class="stater-percent-large">%</span>
            </div>
            <div class="stater-discount-label">OFF</div>
          </div>
          
          <h2 class="stater-lifetime-title">Acesso Vitalício</h2>
          <p class="stater-lifetime-subtitle">Pague uma vez, use para sempre</p>
        </div>
        
        <div class="stater-lifetime-content">
          <div class="stater-urgency-timer">
            ⏰ Oferta válida apenas HOJE
          </div>
          
          <div class="stater-lifetime-pricing">
            <div class="stater-was-price">Era R$ 299,90</div>
            <div class="stater-now-price">
              Hoje: <span class="stater-mega-price">R$ 89,90</span>
            </div>
            <div class="stater-forever-text">Pagamento único • Acesso vitalício</div>
          </div>
          
          <div class="stater-included-section">
            <h3 class="stater-included-title">🎯 Tudo Incluído Para Sempre</h3>
            
            <div class="stater-included-grid">
              <div class="stater-included-item">
                <span class="stater-included-icon">🎤</span>
                <div class="stater-included-text">Comandos de Voz Ilimitados</div>
              </div>
              
              <div class="stater-included-item">
                <span class="stater-included-icon">📷</span>
                <div class="stater-included-text">OCR Ilimitado de Documentos</div>
              </div>
              
              <div class="stater-included-item">
                <span class="stater-included-icon">🤖</span>
                <div class="stater-included-text">Bot Telegram Premium</div>
              </div>
              
              <div class="stater-included-item">
                <span class="stater-included-icon">🧠</span>
                <div class="stater-included-text">IA Financeira Avançada</div>
              </div>
            </div>
          </div>
          
          <button class="stater-cta-lifetime" onclick="StaterPaywall.handlePurchase('super_promo', 'lifetime')">
            <div class="stater-cta-main-text">GARANTIR ACESSO VITALÍCIO</div>
            <div class="stater-cta-sub-text">R$ 89,90 • Pague uma vez só</div>
          </button>
          
          <button class="stater-cta-skip" onclick="StaterPaywall.close()">
            Continuar com limitações
          </button>
          
          <p class="stater-lifetime-disclaimer">
            Oferta especial limitada. Aproveite enquanto está disponível.
          </p>
        </div>
      </div>
    `;
  }
  
  /* MÉTODO PARA CRIAR PAYWALL LIMITE ATINGIDO */
  private static createLimitReachedPaywall(): string {
    return `
      <div class="stater-paywall-container stater-modern-dark">
        <div class="stater-header-modern">
          <div class="stater-lifetime-badge">⚠️ LIMITE ATINGIDO</div>
          
          <div class="stater-discount-circle">
            <div class="stater-discount-percent">
              <span class="stater-percent">50%</span>
            </div>
            <div class="stater-discount-text">OFF</div>
          </div>
          
          <h2 class="stater-modern-title">Ops! Limite Atingido</h2>
          <p class="stater-modern-subtitle">Upgrade para continuar usando</p>
        </div>
        
        <div class="stater-modern-content">
          <div class="stater-price-display">
            <div class="stater-old-price-line">Era R$ 15,90/mês</div>
            <div class="stater-new-price-display">
              Hoje: <span class="stater-big-price">R$ 7,99</span>
            </div>
            <div class="stater-price-detail">por mês • Cancele quando quiser</div>
          </div>
          
          <div class="stater-real-benefits">
            <h3 class="stater-benefits-title">🔓 Libere Todas as Funcionalidades</h3>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">🎤</span>
              <div>
                <strong>Comandos de Voz Ilimitados</strong>
                <p class="stater-benefit-desc">Registre gastos falando naturalmente, sem limites</p>
              </div>
            </div>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">📷</span>
              <div>
                <strong>OCR Sem Limites</strong>
                <p class="stater-benefit-desc">Processe quantas notas fiscais precisar</p>
              </div>
            </div>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">🤖</span>
              <div>
                <strong>Bot Telegram Premium</strong>
                <p class="stater-benefit-desc">Acesso completo via Telegram</p>
              </div>
            </div>
          </div>
          
          <button class="stater-cta-modern" onclick="StaterPaywall.handlePurchase('limit_reached', 'monthly')">
            <div class="stater-cta-text">LIBERAR AGORA</div>
            <div class="stater-cta-price">R$ 7,99/mês • 50% OFF</div>
          </button>
          
          <button class="stater-cta-skip" onclick="StaterPaywall.close()">
            Voltar com limitações
          </button>
          
          <p class="stater-modern-disclaimer">
            Oferta limitada. Preço normal R$ 15,90/mês.
          </p>
        </div>
      </div>
    `;
  }
  
  /* MÉTODO PARA CRIAR PAYWALL UPGRADE PREMIUM */
  private static createPremiumUpgradePaywall(): string {
    return `
      <div class="stater-paywall-container stater-modern-dark">
        <div class="stater-header-modern">
          <div class="stater-lifetime-badge">👑 UPGRADE PREMIUM</div>
          
          <div class="stater-discount-circle">
            <div class="stater-discount-percent">
              <span class="stater-percent">PRO</span>
            </div>
            <div class="stater-discount-text">PLANOS</div>
          </div>
          
          <h2 class="stater-modern-title">Escolha Seu Plano</h2>
          <p class="stater-modern-subtitle">Potencialize seu controle financeiro</p>
        </div>
        
        <div class="stater-modern-content">
          <div class="stater-real-benefits">
            <h3 class="stater-benefits-title">🎯 Funcionalidades Premium</h3>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">🎤</span>
              <div>
                <strong>Comandos de Voz Avançados</strong>
                <p class="stater-benefit-desc">Processamento inteligente de linguagem natural</p>
              </div>
            </div>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">📊</span>
              <div>
                <strong>Análises IA Detalhadas</strong>
                <p class="stater-benefit-desc">Insights personalizados sobre seus gastos</p>
              </div>
            </div>
            
            <div class="stater-benefit-real">
              <span class="stater-icon-real">🔒</span>
              <div>
                <strong>Backup em Nuvem</strong>
                <p class="stater-benefit-desc">Seus dados seguros e sincronizados</p>
              </div>
            </div>
          </div>
          
          <div class="stater-price-display">
            <div class="stater-new-price-display">
              <span class="stater-big-price">R$ 15,90</span>
            </div>
            <div class="stater-price-detail">por mês • Cancele quando quiser</div>
          </div>
          
          <button class="stater-cta-modern" onclick="StaterPaywall.handlePurchase('premium_upgrade', 'monthly')">
            <div class="stater-cta-text">ATIVAR PREMIUM</div>
            <div class="stater-cta-price">R$ 15,90/mês</div>
          </button>
          
          <button class="stater-cta-skip" onclick="StaterPaywall.close()">
            Continuar versão básica
          </button>
          
          <p class="stater-modern-disclaimer">
            Planos flexíveis. Atualize ou cancele a qualquer momento.
          </p>
        </div>
      </div>
    `;
  }
