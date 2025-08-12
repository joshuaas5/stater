/**
 * STATER PAYWALL SYSTEM - VERSÃO MODERNA
 * Design dark/purple inspirado na imagem do usuário
 * Apenas funcionalidades REAIS do app
 * Sem fake testimonials ou métricas inventadas
 */

export class StaterPaywallModern {
  
  static async presentPaywall(identifier: string, options: any = {}) {
    console.log('🎨 Apresentando paywall moderno:', identifier);
    
    // Inject CSS moderno
    this.injectModernCSS();
    
    // Criar modal
    const modal = document.createElement('div');
    modal.id = 'stater-paywall-modal';
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
      animation: fadeIn 0.3s ease-out;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Escolher paywall baseado no identifier
    let paywallHTML = '';
    switch (identifier) {
      case 'onboarding':
        paywallHTML = this.createOnboardingPaywall();
        break;
      case 'super_promo':
        paywallHTML = this.createSuperPromoPaywall();
        break;
      case 'limit_reached':
        paywallHTML = this.createLimitReachedPaywall();
        break;
      case 'premium_upgrade':
        paywallHTML = this.createPremiumUpgradePaywall();
        break;
      default:
        paywallHTML = this.createOnboardingPaywall();
    }
    
    modal.innerHTML = paywallHTML;
    document.body.appendChild(modal);
    
    // Event listeners
    this.attachEventListeners(modal, identifier);
    
    return { success: true };
  }
  
  /* CSS MODERNO DARK/PURPLE */
  private static injectModernCSS() {
    if (document.getElementById('stater-modern-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'stater-modern-styles';
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
      
      /* CONTAINER PRINCIPAL */
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
        z-index: 10;
      }
      
      /* CÍRCULO DE DESCONTO */
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
      
      /* CONTEÚDO */
      .stater-modern-content {
        padding: 30px 25px;
        background: rgba(10, 10, 26, 0.95);
        backdrop-filter: blur(20px);
      }
      
      /* PREÇOS */
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
    `;
    
    document.head.appendChild(style);
  }
  
  /* MÉTODO PARA CRIAR PAYWALL DE ONBOARDING */
  private static createOnboardingPaywall(): string {
    return `
      <div class="stater-paywall-container">
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
      <div class="stater-paywall-container">
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
      <div class="stater-paywall-container">
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
  
  /* EVENTOS E UTILIDADES */
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
    
    console.log(`💎 Paywall moderno apresentado: ${type}`);
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
export class SuperwallWeb extends StaterPaywallModern {
  static async presentPaywall(identifier: string, options: any = {}) {
    return super.presentPaywall(identifier, options);
  }
}
