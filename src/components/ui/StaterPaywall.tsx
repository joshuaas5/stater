import React, { useEffect } from "react";

/**
 * Stater Paywall - Versão Mobile First Otimizada
 * Fundo azul mais escuro, preços atualizados, design compacto
 * CORRIGIDO: Layout robusto sem deslocamento + rodapé limpo
 */

const css = `
.rotator { position: relative; height: 3.2em; overflow: hidden; margin-bottom: 0.5rem; }
.rotator > span { position: absolute; inset: 0; opacity: 0; transform: translateY(8px); animation: swap 12s infinite; }
.rotator > span:nth-child(1){ animation-delay: 0s; }
.rotator > span:nth-child(2){ animation-delay: 4s; }
.rotator > span:nth-child(3){ animation-delay: 8s; }
@keyframes swap {
  0%{ opacity:0; transform: translateY(8px) }
  6%{ opacity:1; transform: translateY(0) }
  28%{ opacity:1; transform: translateY(0) }
  33%{ opacity:0; transform: translateY(-6px) }
  100%{ opacity:0; transform: translateY(-6px) }
}
.pulse { animation: pulse 2s infinite; }
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}
`;

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 text-yellow-900 px-3 py-1 text-xs font-bold shadow-lg">
    {children}
  </span>
);

interface StaterPaywallProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSubscribe?: (plan: 'weekly' | 'monthly' | 'trial') => void;
}

const StaterPaywall = ({ isOpen = true, onClose = () => {}, onSubscribe }: StaterPaywallProps) => {
  // Esconder navbar quando paywall estiver aberto
  useEffect(() => {
    if (isOpen) {
      // Esconder navbar
      const navbar = document.querySelector('.stater-navbar-force');
      const navbarOptimized = document.querySelector('.navbar-optimized');
      const navbarElements = document.querySelectorAll('[class*="navbar"], nav');
      
      if (navbar) (navbar as HTMLElement).style.display = 'none';
      if (navbarOptimized) (navbarOptimized as HTMLElement).style.display = 'none';
      navbarElements.forEach(el => {
        (el as HTMLElement).style.display = 'none';
      });
      
      // Adicionar classe para esconder outros elementos que possam ser barras
      document.body.classList.add('paywall-open');
      
      // Remover padding-bottom do body para não haver espaço vazio
      document.body.style.paddingBottom = '0';
    }
    
    return () => {
      if (isOpen) {
        // Restaurar navbar quando fechar
        const navbar = document.querySelector('.stater-navbar-force');
        const navbarOptimized = document.querySelector('.navbar-optimized');
        const navbarElements = document.querySelectorAll('[class*="navbar"], nav');
        
        if (navbar) (navbar as HTMLElement).style.display = 'flex';
        if (navbarOptimized) (navbarOptimized as HTMLElement).style.display = 'flex';
        navbarElements.forEach(el => {
          (el as HTMLElement).style.display = '';
        });
        
        document.body.classList.remove('paywall-open');
        document.body.style.paddingBottom = '64px';
      }
    };
  }, [isOpen]);

  // ✅ ISOLAMENTO DE EVENTOS - Impede propagação para componentes pais
  const handleModalInteraction = (e: React.SyntheticEvent) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm min-h-screen flex items-center justify-center p-4 z-[2147483649] overflow-y-auto">
      <div 
        className="w-full max-w-md bg-gradient-blue rounded-2xl shadow-glow overflow-hidden relative mx-auto"
        onClick={handleModalInteraction}
        onTouchStart={handleModalInteraction}
        onTouchMove={handleModalInteraction}
        onScroll={handleModalInteraction}
      >
        {/* CSS customizado */}
        <style>{`
          ${css}
          .bg-gradient-blue { background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); }
          .shadow-glow { box-shadow: 0 0 25px rgba(59, 130, 246, 0.4); }
          
          /* Esconder elementos durante paywall */
          .paywall-open .stater-navbar-force,
          .paywall-open .navbar-optimized,
          .paywall-open [class*="navbar"],
          .paywall-open nav,
          .paywall-open header {
            display: none !important;
          }
          
          /* Remover barras cinzas e outros elementos que ficam por trás */
          .paywall-open .sticky,
          .paywall-open [class*="header"],
          .paywall-open [class*="top-bar"],
          .paywall-open [class*="mobile-header"] {
            display: none !important;
          }
          
          /* Esconder especificamente o MobileHeader e componentes similares */
          .paywall-open .z-40,
          .paywall-open .bg-white,
          .paywall-open .border-gray-200 {
            display: none !important;
          }
        `}</style>

        {/* Botão Fechar - DENTRO do paywall */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-white/80 hover:text-white z-10 bg-black/20 hover:bg-black/40 rounded-full w-6 h-6 flex items-center justify-center text-sm transition-all"
        >
          ✕
        </button>

        {/* Header */}
        <div className="p-3 text-center">
          <Badge>🎁 3 DIAS GRÁTIS!</Badge>
          
          <h1 className="mt-3 text-lg font-extrabold text-white" aria-live="polite">
            <div className="rotator">
              <span>Seus insights financeiros estão bloqueados... 🔒</span>
              <span>Automação financeira a 1 clique de distância... 🤖</span>
              <span>Transforme sua vida financeira com o Stater... 📈</span>
            </div>
          </h1>

          <p className="mt-2 text-xs text-blue-100 leading-relaxed">
            💬 <strong>Envie áudios, fotos, PDFs</strong> — tudo organizado automaticamente.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="px-3 pb-3 space-y-2">
          <button 
            onClick={() => onSubscribe && onSubscribe('trial')}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold py-2.5 px-3 rounded-xl text-sm shadow-xl pulse"
          >
            🎁 INICIAR PREMIUM GRÁTIS
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onSubscribe && onSubscribe('monthly')}
              className="bg-green-500 hover:bg-green-400 text-white font-semibold py-2 px-2 rounded-lg shadow-lg text-xs"
            >
              💎 MENSAL<br/>
              <span className="text-base font-bold">R$ 14,90</span>
            </button>
            <button 
              onClick={() => onSubscribe && onSubscribe('weekly')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-2 rounded-lg shadow-lg text-xs"
            >
              📅 SEMANAL<br/>
              <span className="text-base font-bold">R$ 8,90</span>
            </button>
          </div>
        </div>

        {/* Garantias */}
        <div className="px-3 pb-3">
          <div className="bg-blue-800/50 rounded-xl p-2.5 text-center">
            <div className="text-xs text-blue-200">
              ✅ Acesso completo por 3 dias • ✅ Cancele quando quiser • ✅ Sem compromisso
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="px-3 pb-3">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-sm font-bold text-white mb-2 text-center">✨ Benefícios Premium</div>
            <ul className="space-y-1.5 text-xs text-blue-100">
              <li className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">🎙️</span>
                <span>Envie áudios — IA transcreve e registra automaticamente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">📄</span>
                <span>Envie PDFs, fotos e notas — tudo é processado e categorizado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">🚀</span>
                <span>Não se preocupe mais com limites de mensagens, áudios, arquivos, relatórios ou transações</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">🚫</span>
                <span>Livre de anúncios — experiência premium sem interrupções</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">📱</span>
                <span>Controle total pelo Telegram ou app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">📊</span>
                <span>Relatórios detalhados e avançados</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="px-3 pb-4">
          <div className="bg-green-500 rounded-xl p-2.5 text-center">
            <div className="text-white font-bold text-sm">💎 MELHOR OFERTA: MENSAL</div>
            <div className="text-green-100 text-xs mt-1">
              Assine o plano PRO por apenas R$ 14,90/mês
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaterPaywall;
