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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="stater-paywall">
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

      {/* Mobile First Container - Otimizado */}
      <div className="w-full h-full sm:max-w-md sm:h-auto sm:mx-4 bg-gradient-blue sm:rounded-2xl shadow-glow overflow-hidden relative flex flex-col max-h-screen">
        {/* Botão de fechar */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-white/70 hover:text-white z-10 text-xl w-7 h-7 flex items-center justify-center rounded-full bg-black/20"
          >
            ×
          </button>
        )}

        {/* Header Mais Compacto */}
        <div className="p-3 text-center flex-shrink-0">
          <Badge>🎁 TESTE GRÁTIS - 3 DIAS</Badge>
          
          <h1 className="mt-2 text-lg sm:text-xl font-extrabold text-white" aria-live="polite">
            <div className="rotator">
              <span>Seus insights financeiros estão bloqueados... 🔒</span>
              <span>Automação financeira a 1 clique de distância... 🤖</span>
              <span>Transforme sua vida financeira com o Stater... 📈</span>
            </div>
          </h1>

          <p className="mt-2 text-blue-100 text-xs sm:text-sm leading-relaxed">
            💬 <strong>Envie áudios, fotos, PDFs ou notas</strong> diretamente para a IA.
            <br />
            Ela organiza tudo automaticamente.
          </p>
        </div>

        {/* Botões de Ação Mais Compactos */}
        <div className="px-3 pb-2 space-y-2 flex-shrink-0">
          <button 
            onClick={() => handleSubscribe('trial')}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold py-2.5 px-3 rounded-xl text-sm shadow-xl pulse"
          >
            🎁 TESTE GRÁTIS - 3 DIAS
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => handleSubscribe('monthly')}
              className="bg-green-500 hover:bg-green-400 text-white font-semibold py-2 px-2 rounded-lg shadow-lg text-xs"
            >
              💎 MENSAL<br/>
              <span className="text-sm font-bold">R$ 19,90</span>
            </button>
            <button 
              onClick={() => handleSubscribe('weekly')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-2 rounded-lg shadow-lg text-xs"
            >
              📅 SEMANAL<br/>
              <span className="text-sm font-bold">R$ 8,90</span>
            </button>
          </div>
        </div>

        {/* Garantias Mais Compactas */}
        <div className="px-3 pb-2 flex-shrink-0">
          <div className="bg-blue-800/50 rounded-xl p-2 text-center">
            <div className="text-xs text-blue-200">
              ✅ Acesso completo • ✅ Cancele quando quiser • ✅ Sem compromisso
            </div>
          </div>
        </div>

        {/* Benefícios Scrolláveis Compactos */}
        <div className="px-3 pb-2 flex-1 overflow-y-auto">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-sm font-bold text-white mb-2 text-center">✨ Benefícios Premium</div>
            <ul className="space-y-1.5 text-blue-100 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-sm">🎙️</span>
                <span>Envie áudios — IA transcreve automaticamente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm">📄</span>
                <span>Envie PDFs, fotos — tudo é processado</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm">🚀</span>
                <span>Não se preocupe com limites</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm">📱</span>
                <span>Controle total pelo Telegram</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm">📊</span>
                <span>Relatórios detalhados</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm">🚫</span>
                <span>Livre de anúncios</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Mais Compacto */}
        <div className="px-3 pb-3 flex-shrink-0">
          <div className="text-center text-blue-200 text-xs">
            🛡️ "Não gostou? Cancele quando quiser."
          </div>
          
          <div className="mt-1 text-center text-xs text-blue-300">
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
