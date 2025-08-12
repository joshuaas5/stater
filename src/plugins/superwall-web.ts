// Plugin Superwall para Web - Simulação para desenvolvimento
export class SuperwallWeb {
  
  static async initialize(apiKey: string) {
    console.log('🌐 Iniciando Superwall Web com API:', apiKey);
    
    // Para web, simulamos a inicialização
    if (typeof window !== 'undefined') {
      (window as any).SuperwallConfig = {
        apiKey,
        platform: 'web',
        initialized: true,
        timestamp: new Date().toISOString()
      };
      console.log('✅ Superwall Web inicializado com sucesso');
    }
  }
  
  static async presentPaywall(options: { name: string }) {
    console.log('🎯 Apresentando paywall:', options.name);
    
    // Criar modal do paywall
    const mockPaywall = document.createElement('div');
    mockPaywall.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 2147483645;
      animation: fadeIn 0.3s ease-in-out;
    `;
    
    mockPaywall.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px;
        border-radius: 20px;
        text-align: center;
        max-width: 400px;
        width: 90%;
        color: white;
        box-shadow: 0 20px 40px rgba(0,0,0,0.3);
      ">
        <h2 style="margin: 0 0 10px 0; font-size: 24px;">🚀 ${options.name}</h2>
        <p style="margin: 0 0 30px 0; opacity: 0.9;">Desbloqueie o poder completo do Stater!</p>
        
        <div style="margin: 20px 0;">
          <div style="
            padding: 15px; 
            margin: 10px 0; 
            border: 2px solid rgba(255,255,255,0.2); 
            border-radius: 12px;
            background: rgba(255,255,255,0.1);
            cursor: pointer;
            transition: all 0.3s;
          " onclick="this.style.borderColor='#4ade80'; this.style.background='rgba(74,222,128,0.2)';">
            🎉 <strong>Semanal PROMO</strong> - R$ 4,99
            <br><small style="opacity: 0.8;">1ª assinatura | Normal: R$ 8,99</small>
          </div>
          
          <div style="
            padding: 15px; 
            margin: 10px 0; 
            border: 2px solid #4ade80; 
            border-radius: 12px;
            background: rgba(74,222,128,0.2);
            cursor: pointer;
            position: relative;
          " onclick="console.log('Selecionou Mensal');">
            <div style="
              position: absolute;
              top: -8px;
              right: 10px;
              background: #f59e0b;
              color: white;
              padding: 2px 8px;
              border-radius: 10px;
              font-size: 10px;
              font-weight: bold;
            ">POPULAR</div>
            📅 <strong>Mensal</strong> - R$ 15,90
            <br><small style="opacity: 0.8;">7 dias grátis</small>
          </div>
          
          <div style="
            padding: 15px; 
            margin: 10px 0; 
            border: 2px solid rgba(255,255,255,0.2); 
            border-radius: 12px;
            background: rgba(255,255,255,0.1);
            cursor: pointer;
            transition: all 0.3s;
          " onclick="this.style.borderColor='#4ade80'; this.style.background='rgba(74,222,128,0.2)';">
            🔥 <strong>Pro</strong> - R$ 29,90
            <br><small style="opacity: 0.8;">Melhor valor</small>
          </div>
        </div>
        
        <button onclick="console.log('✅ Compra simulada!'); this.parentElement.parentElement.remove();" 
                style="
                  background: linear-gradient(45deg, #4ade80, #22c55e);
                  color: white; 
                  border: none; 
                  padding: 15px 30px; 
                  border-radius: 12px; 
                  margin: 10px 5px;
                  font-weight: bold;
                  cursor: pointer;
                  box-shadow: 0 4px 15px rgba(74,222,128,0.4);
                ">
          ✅ Começar Teste Grátis
        </button>
        
        <button onclick="this.parentElement.parentElement.remove()" 
                style="
                  background: rgba(255,255,255,0.2); 
                  color: white; 
                  border: none; 
                  padding: 15px 30px; 
                  border-radius: 12px; 
                  margin: 10px 5px;
                  cursor: pointer;
                ">
          ❌ Fechar
        </button>
        
        <p style="font-size: 12px; opacity: 0.7; margin: 20px 0 0 0;">
          🧪 Modo de desenvolvimento - Paywall: ${options.name}
        </p>
      </div>
    `;
    
    // Adicionar CSS da animação
    if (!document.getElementById('superwall-animations')) {
      const style = document.createElement('style');
      style.id = 'superwall-animations';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(mockPaywall);
    
    // Remover automaticamente após 30 segundos se não interagir
    setTimeout(() => {
      if (document.body.contains(mockPaywall)) {
        mockPaywall.remove();
      }
    }, 30000);
    
    return { success: true, paywall: options.name };
  }
  
  static async setUserAttributes(attributes: Record<string, any>) {
    console.log('👤 Definindo atributos do usuário:', attributes);
    
    if (typeof window !== 'undefined') {
      (window as any).SuperwallUserAttributes = {
        ...attributes,
        timestamp: new Date().toISOString()
      };
    }
    
    return { success: true };
  }
  
  static async trackEvent(event: string, parameters?: Record<string, any>) {
    console.log('📊 Evento rastreado:', event, parameters);
    
    if (typeof window !== 'undefined') {
      const events = (window as any).SuperwallEvents || [];
      events.push({
        event,
        parameters,
        timestamp: new Date().toISOString()
      });
      (window as any).SuperwallEvents = events;
    }
    
    return { success: true };
  }
}
