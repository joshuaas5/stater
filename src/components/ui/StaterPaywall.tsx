import React from "react";

/**
 * Stater Paywall - Versão Mobile First
 * Fundo azul mais escuro, preços atualizados, design mais chamativo
 */
const css = `
.rotator { position: relative; height: 2.2em; overflow: hidden; }
.rotator > span { position: absolute; inset: 0; opacity: 0; transform: translateY(12px); animation: swap 12s infinite; }
.rotator > span:nth-child(1){ animation-delay: 0s; }
.rotator > span:nth-child(2){ animation-delay: 4s; }
.rotator > span:nth-child(3){ animation-delay: 8s; }
@keyframes swap {
  0%{ opacity:0; transform: translateY(12px) }
  6%{ opacity:1; transform: translateY(0) }
  28%{ opacity:1; transform: translateY(0) }
  33%{ opacity:0; transform: translateY(-8px) }
  100%{ opacity:0; transform: translateY(-8px) }
}
.pulse { animation: pulse 2s infinite; }
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
`;

interface StaterPaywallProps {
  onClose?: () => void;
  onSubscribe?: (plan: 'weekly' | 'monthly' | 'trial') => void;
}

const Badge = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-yellow-400 text-yellow-900 px-4 py-2 text-sm font-bold shadow-lg">
    {children}
  </span>
);

const StaterPaywall: React.FC<StaterPaywallProps> = ({ onClose, onSubscribe }) => {
  const handleSubscribe = (plan: 'weekly' | 'monthly' | 'trial') => {
    if (onSubscribe) {
      onSubscribe(plan);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6" data-testid="stater-paywall">
      {/* CSS customizado */}
      <style>{`
        ${css}
        .bg-primary-dark { background: #1e40af; }
        .bg-gradient-blue { background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); }
        .text-primary { color: #3b82f6; }
        .text-success { color: #10b981; }
        .bg-success { background: #10b981; }
        .bg-warning { background: #f59e0b; }
        .text-warning { color: #92400e; }
        .shadow-glow { box-shadow: 0 0 30px rgba(59, 130, 246, 0.3); }
      `}</style>

      {/* Mobile First Container - 100% Responsivo */}
      <div className="w-full max-w-sm mx-auto bg-gradient-blue rounded-2xl shadow-glow overflow-hidden relative flex flex-col max-h-[90vh] min-h-[85vh] sm:min-h-0 sm:max-h-[85vh]">
        {/* Botão de fechar - Mobile otimizado */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-all duration-200"
            style={{ fontSize: '20px', lineHeight: '1' }}
          >
            ×
          </button>
        )}

        {/* Header Responsivo e Compacto */}
        <div className="p-4 text-center flex-shrink-0">
          <Badge>🎁 TESTE GRÁTIS - 3 DIAS</Badge>
          
          <h1 className="mt-3 text-xl sm:text-2xl font-extrabold text-white leading-tight" aria-live="polite">
            <div className="rotator">
              <span>Seus insights financeiros estão bloqueados... 🔒</span>
              <span>Automação financeira a 1 clique de distância... 🤖</span>
              <span>Transforme sua vida financeira com o Stater... 📈</span>
            </div>
          </h1>

          <p className="mt-3 text-blue-100 text-sm leading-relaxed px-2">
            💬 <strong>Envie áudios, fotos, PDFs ou notas</strong> diretamente para a IA.
            <br />
            Ela organiza tudo automaticamente.
          </p>
        </div>

        {/* Botões de Ação Mobile Otimizados */}
        <div className="px-4 pb-3 space-y-3 flex-shrink-0">
          <button 
            onClick={() => handleSubscribe('trial')}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold py-4 px-4 rounded-xl text-base shadow-xl pulse transition-all duration-200 min-h-[48px]"
          >
            🎁 TESTE GRÁTIS - 3 DIAS
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleSubscribe('monthly')}
              className="bg-green-500 hover:bg-green-400 text-white font-semibold py-3 px-3 rounded-lg shadow-lg text-sm transition-all duration-200 min-h-[48px]"
            >
              💎 MENSAL<br/>
              <span className="text-base font-bold">R$ 19,90</span>
            </button>
            <button 
              onClick={() => handleSubscribe('weekly')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-3 rounded-lg shadow-lg text-sm transition-all duration-200 min-h-[48px]"
            >
              📅 SEMANAL<br/>
              <span className="text-base font-bold">R$ 8,90</span>
            </button>
          </div>
        </div>

        {/* Garantias Mobile Otimizadas */}
        <div className="px-4 pb-3 flex-shrink-0">
          <div className="bg-blue-800/50 rounded-xl p-3 text-center">
            <div className="text-sm text-blue-200 leading-relaxed">
              ✅ Acesso completo • ✅ Cancele quando quiser • ✅ Sem compromisso
            </div>
          </div>
        </div>

        {/* Benefícios Mobile Otimizados */}
        <div className="px-4 pb-3 flex-1 overflow-y-auto">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="text-base font-bold text-white mb-3 text-center">✨ Benefícios Premium</div>
            <ul className="space-y-2.5 text-blue-100 text-sm leading-relaxed">
              <li className="flex items-start gap-3">
                <span className="text-base flex-shrink-0">🎙️</span>
                <span>Envie áudios — IA transcreve automaticamente</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-base flex-shrink-0">📄</span>
                <span>Envie PDFs, fotos — tudo é processado</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-base flex-shrink-0">🚀</span>
                <span>Não se preocupe com limites</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-base flex-shrink-0">📱</span>
                <span>Controle total pelo Telegram</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-base flex-shrink-0">📊</span>
                <span>Relatórios detalhados</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-base flex-shrink-0">🚫</span>
                <span>Livre de anúncios</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Mobile Otimizado */}
        <div className="px-4 pb-4 flex-shrink-0">
          <div className="text-center text-blue-200 text-sm font-medium">
            🛡️ "Não gostou? Cancele quando quiser."
          </div>
          
          <div className="mt-2 text-center text-sm text-blue-300 leading-relaxed">
            Pagamentos seguros • Cancelamento fácil
            <br />
            <span className="text-xs opacity-75">
              Transações via Google Play
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaterPaywall;
