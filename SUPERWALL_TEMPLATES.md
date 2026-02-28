# 🚀 SUPERWALL TEMPLATES - IMPLEMENTAÇÃO DIRETA

## 🎯 **TEMPLATE 1: ONBOARDING PAYWALL**

### **📝 Configuração no Dashboard:**
```
Name: "onboarding_premium"
Trigger: "user_journey_day_1"
Type: Modal
Template: Custom
```

### **🎨 HTML/TEXT Template:**
```html
<div class="paywall-container">
  <div class="header-promo">
    🔥 LANÇAMENTO: Primeira semana R$ 4,99
    <span class="original-price">Preço normal: R$ 8,99</span>
  </div>
  
  <h1 class="main-headline">
    Pare de Perder Dinheiro Sem Saber Onde
  </h1>
  
  <h2 class="sub-headline">
    Descubra os vazamentos ocultos no seu orçamento em 3 minutos
  </h2>
  
  <div class="social-proof">
    <div class="rating">⭐⭐⭐⭐⭐ 4.8/5</div>
    <div class="testimonial">"Mudou minha vida financeira" - Maria S.</div>
    <div class="savings">"Nossos usuários economizam em média R$ 847/mês"</div>
  </div>
  
  <div class="benefits">
    <div class="benefit">✅ Identifica EXATAMENTE onde seu dinheiro vaza</div>
    <div class="benefit">✅ Alertas inteligentes antes de estourar orçamento</div>
    <div class="benefit">✅ Bot Telegram 24h para consultas instantâneas</div>
    <div class="benefit">✅ Relatórios que seu contador vai invejar</div>
  </div>
  
  <div class="offer-box">
    <div class="trial">🎁 TESTE 3 DIAS GRÁTIS</div>
    <div class="price">Depois apenas R$ 4,99 na primeira semana</div>
    <div class="guarantee">Cancele quando quiser, sem pegadinhas</div>
  </div>
  
  <div class="urgency">
    ⏰ Promoção de lançamento - Só hoje!
  </div>
  
  <button class="cta-primary">
    QUERO ECONOMIZAR R$ 847/MÊS
  </button>
  
  <button class="cta-secondary">
    Começar teste grátis
  </button>
  
  <div class="objection-handling">
    Sem compromisso • Cancele a qualquer momento • 100% seguro
  </div>
</div>
```

---

## ⚡ **TEMPLATE 2: LIMITE ATINGIDO**

### **📝 Configuração no Dashboard:**
```
Name: "limit_reached_urgent"
Trigger: "daily_limit_reached"
Type: Full Screen
Template: Custom
```

### **🎨 HTML/TEXT Template:**
```html
<div class="paywall-urgent">
  <div class="alert-header">
    🚨 OPS! VOCÊ ATINGIU SEU LIMITE DIÁRIO
  </div>
  
  <h1 class="urgency-headline">
    Mas seus gastos não param... Que tal ter controle total?
  </h1>
  
  <div class="emotional-hook">
    <p>Enquanto você está limitado, suas despesas continuam correndo soltas...</p>
    
    <div class="reality-check">
      <h3>Neste exato momento você pode estar:</h3>
      <div class="problem">❌ Perdendo dinheiro em assinaturas esquecidas</div>
      <div class="problem">❌ Pagando juros desnecessários</div>
      <div class="problem">❌ Deixando passar oportunidades de economia</div>
      <div class="problem">❌ Repetindo erros financeiros do passado</div>
    </div>
  </div>
  
  <div class="solution-box">
    <h2>💡 SOLUÇÃO IMEDIATA:</h2>
    <p>Com o Stater PRO você nunca mais ficará no escuro sobre seu dinheiro</p>
    
    <div class="special-offer">
      🎉 ÚLTIMA CHANCE: R$ 4,99 primeira semana
      <small>Por menos que um café por dia, tenha controle total</small>
    </div>
  </div>
  
  <div class="benefits-immediate">
    <h3>✅ BENEFÍCIOS IMEDIATOS:</h3>
    <div>• Análises ILIMITADAS</div>
    <div>• Alertas em tempo real</div>
    <div>• Bot Telegram 24/7</div>
    <div>• Relatórios profissionais</div>
    <div>• Zero anúncios</div>
  </div>
  
  <div class="value-calculator">
    💰 Se você economizar apenas R$ 50 neste mês, já pagou o app inteiro!
  </div>
  
  <div class="countdown">
    ⏰ Promoção R$ 4,99 expira em:
    <div class="timer">23:59:47</div>
  </div>
  
  <button class="cta-urgent">
    SIM! QUERO CONTROLE TOTAL
  </button>
  
  <button class="cta-alternative">
    Aproveitar R$ 4,99
  </button>
  
  <div class="fomo">
    Voltar para limite diário (não recomendado)
  </div>
</div>
```

---

## 💎 **TEMPLATE 3: COMPARAÇÃO DE PLANOS**

### **📝 Configuração no Dashboard:**
```
Name: "premium_upgrade_comparison"
Trigger: "upgrade_prompt"
Type: Modal
Template: Plans Comparison
```

### **🎨 Plans Configuration:**
```javascript
{
  "plans": [
    {
      "id": "weekly_promo",
      "name": "SEMANAL",
      "price": "R$ 4,99",
      "period": "primeira vez",
      "originalPrice": "R$ 8,99",
      "badge": "PROMOÇÃO",
      "description": "Ideal para quem está começando",
      "features": [
        "10 análises/dia",
        "Bot Telegram",
        "Zero ads",
        "3 dias grátis"
      ],
      "highlight": false
    },
    {
      "id": "monthly",
      "name": "MENSAL",
      "price": "R$ 15,90",
      "period": "/mês",
      "badge": "MAIS POPULAR",
      "description": "Para quem quer resultados sérios",
      "features": [
        "20 análises/dia",
        "Relatórios exportáveis",
        "Análises avançadas",
        "Economia média: R$ 847/mês"
      ],
      "highlight": true
    },
    {
      "id": "pro",
      "name": "PRO",
      "price": "R$ 29,90",
      "period": "/mês",
      "badge": "RECOMENDADO",
      "description": "Para mestres das finanças",
      "features": [
        "30 análises/dia",
        "Análise de PDFs/faturas",
        "OCR inteligente",
        "Insights personalizados",
        "Economia média: R$ 1.547/mês",
        "Consultoria gratuita (R$ 200)"
      ],
      "highlight": false
    }
  ]
}
```

### **🎨 Copy para Comparison:**
```html
<div class="comparison-paywall">
  <h1>Você Está Pronto Para o Próximo Nível?</h1>
  <h2>Usuários Premium economizam 3x mais que usuários básicos</h2>
  
  <div class="testimonial">
    <blockquote>
      "Marina, contadora de SP: 'Com o plano Pro economizei R$ 2.847 em 3 meses. O app se pagou 95x!'"
    </blockquote>
  </div>
  
  <div class="transformation">
    <h3>🎯 VOCÊ AGORA vs VOCÊ PREMIUM</h3>
    <div class="comparison-grid">
      <div class="before">😰 Análises limitadas</div>
      <div class="after">🚀 Análises ilimitadas</div>
      
      <div class="before">😓 Sem relatórios</div>
      <div class="after">📊 Relatórios profissionais</div>
      
      <div class="before">😱 Sem análise PDF</div>
      <div class="after">🔍 OCR de faturas/extratos</div>
      
      <div class="before">🤔 Dúvidas sozinho</div>
      <div class="after">🤖 IA 24h via Telegram</div>
    </div>
  </div>
  
  <!-- Plans grid será inserido aqui pelo Superwall -->
  
  <div class="financial-logic">
    💡 Se você ganha mais de R$ 3.000/mês, o plano PRO se paga em 2 dias
  </div>
  
  <div class="proof-results">
    📈 Usuários PRO identificam em média 7,3 vazamentos por mês
    <br>Usuários Básicos identificam apenas 2,1
  </div>
  
  <div class="guarantee">
    💸 Garantia: Se não economizar pelo menos R$ 100 no primeiro mês, devolvemos seu dinheiro
  </div>
</div>
```

---

## 🔥 **TEMPLATE 4: SUPER PROMOÇÃO**

### **📝 Configuração no Dashboard:**
```
Name: "super_promo_limited"
Trigger: "first_time_user"
Type: Full Screen
Template: Limited Time Offer
```

### **🎨 HTML/TEXT Template:**
```html
<div class="super-promo-paywall">
  <div class="alert-banner">
    🚨 ALERTA VERMELHO: OFERTA ESPECIAL DISPONÍVEL 🚨
  </div>
  
  <div class="promo-header">
    <h1 class="mega-headline">🔥 ÚLTIMA CHANCE: R$ 4,99 🔥</h1>
    <h2>Esta oferta nunca mais voltará para sua conta</h2>
  </div>
  
  <div class="exclusivity-box">
    <div class="warning">⚡ ATENÇÃO:</div>
    <p>Esta é literalmente sua única chance de conseguir o Stater por R$ 4,99</p>
    <p><strong>Esta oferta especial só aparece UMA VEZ na vida para cada usuário</strong></p>
  </div>
  
  <div class="value-prop">
    <h3>💰 Pelo preço de um café, você terá:</h3>
    <div class="benefit">✅ Controle total dos seus gastos</div>
    <div class="benefit">✅ Bot IA 24 horas no Telegram</div>
    <div class="benefit">✅ Identificação de vazamentos ocultos</div>
    <div class="benefit">✅ Relatórios que impressionam</div>
    <div class="benefit">✅ 3 dias para testar GRÁTIS</div>
  </div>
  
  <div class="scarcity-extreme">
    <h3>🔥 SCARCITY EXTREMA:</h3>
    <div class="countdown-container">
      ⏰ Esta janela fecha em:
      <div class="countdown">14:27:33</div>
    </div>
    
    <div class="warnings">
      <div class="warning">❌ Depois será R$ 8,99 (sem exceções)</div>
      <div class="warning">❌ Esta oferta NUNCA mais aparecerá para você</div>
      <div class="warning">❌ Sem código de desconto futuro</div>
    </div>
  </div>
  
  <div class="fomo-section">
    <div class="warning-box">
      ⚠️ AVISO: 87% dos usuários que fecham esta tela se arrependem
    </div>
    
    <div class="social-proof-temporal">
      <h4>📊 Nas últimas 2 horas:</h4>
      <div class="stat">✅ 127 pessoas aproveitaram esta oferta</div>
      <div class="stat">⏰ 34 pessoas perderam por esperar</div>
    </div>
  </div>
  
  <div class="logic-section">
    <h3>💡 Pense assim: R$ 4,99 é menos que:</h3>
    <div class="comparison">• 1 refrigerante no cinema (R$ 7,00)</div>
    <div class="comparison">• 1 passagem de ônibus (R$ 5,50)</div>
    <div class="comparison">• 1 café na padaria (R$ 6,00)</div>
    <p><strong>E pode te economizar centenas por mês</strong></p>
  </div>
  
  <div class="bonus-surprise">
    🎁 BÔNUS EXCLUSIVO: Guia 'Os 7 Vazamentos Que Destroem Seu Orçamento' (R$ 47)
  </div>
  
  <button class="cta-super-urgent">
    SIM! QUERO POR R$ 4,99
  </button>
  
  <button class="cta-alternative">
    PAGAR R$ 8,99 (preço normal)
  </button>
  
  <div class="risk-reversal">
    🛡️ Garantia de 7 dias ou dinheiro de volta
    <br>🔒 Cancele quando quiser pelo app
  </div>
</div>

<!-- Exit Intent Overlay -->
<div class="exit-intent-overlay" style="display: none;">
  <div class="exit-content">
    <h2>Espera! Não perca esta chance única...</h2>
    <button class="exit-cta">APROVEITAR R$ 4,99 AGORA</button>
  </div>
</div>
```

---

## 📱 **EVENTOS PARA DISPARAR**

### **🎯 JavaScript Events:**
```javascript
// Configurar no seu app
window.Superwall = {
  // Evento 1: Onboarding
  showOnboarding: () => {
    Superwall.presentPaywall('onboarding_premium', {
      user_attributes: {
        is_first_time: true,
        platform: 'mobile',
        source: 'onboarding'
      }
    });
  },
  
  // Evento 2: Limite atingido
  showLimitReached: () => {
    Superwall.presentPaywall('limit_reached_urgent', {
      user_attributes: {
        limit_type: 'daily_messages',
        current_usage: 10,
        source: 'limit_hit'
      }
    });
  },
  
  // Evento 3: Upgrade
  showUpgrade: () => {
    Superwall.presentPaywall('premium_upgrade_comparison', {
      user_attributes: {
        current_plan: 'free',
        usage_level: 'high',
        source: 'upgrade_prompt'
      }
    });
  },
  
  // Evento 4: Super Promoção
  showSuperPromo: () => {
    Superwall.presentPaywall('super_promo_limited', {
      user_attributes: {
        is_first_time: true,
        offer_type: 'limited_time',
        source: 'first_visit'
      }
    });
  }
};
```

---

## 🎨 **CSS STYLING SUGERIDO**

```css
/* Cores principais */
:root {
  --primary-color: #4ade80;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --success-color: #10b981;
  --text-dark: #1f2937;
  --text-light: #6b7280;
}

/* Containers */
.paywall-container {
  max-width: 400px;
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  text-align: center;
}

/* Headlines */
.main-headline {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 8px;
  line-height: 1.2;
}

.sub-headline {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 20px;
}

/* CTAs */
.cta-primary {
  background: linear-gradient(45deg, var(--primary-color), #22c55e);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 16px;
  width: 100%;
  margin: 12px 0;
  cursor: pointer;
  transition: transform 0.2s;
}

.cta-primary:hover {
  transform: scale(1.05);
}

.cta-urgent {
  background: linear-gradient(45deg, var(--danger-color), #dc2626);
  animation: pulse 2s infinite;
}

/* Animations */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Countdown */
.countdown {
  font-size: 24px;
  font-weight: bold;
  color: var(--danger-color);
  text-align: center;
  font-family: monospace;
}

/* Benefits */
.benefit {
  text-align: left;
  margin: 8px 0;
  padding-left: 4px;
}

/* Social Proof */
.social-proof {
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 8px;
  margin: 16px 0;
}

/* Urgency elements */
.urgency, .scarcity-extreme {
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid var(--danger-color);
  padding: 12px;
  border-radius: 8px;
  margin: 16px 0;
}
```

---

## 📊 **MÉTRICAS DE CONVERSÃO ESPERADAS**

### **🎯 Targets com essas copies:**
- **Onboarding**: 8-12% conversão
- **Limite Atingido**: 15-25% conversão  
- **Upgrade**: 20-30% conversão
- **Super Promoção**: 25-40% conversão

### **📈 KPIs para acompanhar:**
1. **Click-through Rate**: % que clica nos CTAs
2. **Trial Start Rate**: % que inicia teste grátis
3. **Trial-to-Paid**: % que converte após trial
4. **Time on Paywall**: Tempo médio visualizando
5. **Exit Rate**: % que fecha sem ação

**🚀 Resultado final esperado: 15-25% de conversão geral com ROI de 300-500%!**
