import React from "react";

/**
 * Stater Paywall - Versão Mobile First
 * Fundo azul mais escuro, preços atualizados, design mais chamativo
 */

const css = `
.rotator { position: relative; height: 2.8em; overflow: hidden; }
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" data-testid="stater-paywall">
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

      <div className="max-w-md mx-auto bg-gradient-blue rounded-3xl shadow-glow overflow-hidden relative">
        {/* Botão de fechar */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white z-10 text-2xl"
          >
            ×
          </button>
        )}

        {/* Header */}
        <div className="p-6 text-center">
          <Badge>🎁 TESTE GRÁTIS - 3 DIAS</Badge>
          
          <h1 className="mt-4 text-2xl font-extrabold text-white" aria-live="polite">
            <div className="rotator">
              <span>Seus insights financeiros estão bloqueados... 🔒</span>
              <span>Automação financeira a 1 clique de distância... 🤖</span>
              <span>Transforme sua vida financeira com o Stater... 📈</span>
            </div>
          </h1>

          <p className="mt-4 text-blue-100 leading-relaxed">
            💬 <strong>Envie áudios, fotos, PDFs ou notas</strong> diretamente para a IA.
            <br />
            Ela organiza tudo automaticamente: despesas, assinaturas, metas e muito mais.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="px-6 pb-4 space-y-3">
          <button 
            onClick={() => handleSubscribe('trial')}
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold py-4 px-6 rounded-2xl text-lg shadow-xl pulse"
          >
            🎁 INICIAR TESTE GRÁTIS - 3 DIAS
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleSubscribe('monthly')}
              className="bg-green-500 hover:bg-green-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg"
            >
              💎 MENSAL<br/>
              <span className="text-lg font-bold">R$ 19,90</span>
            </button>
            <button 
              onClick={() => handleSubscribe('weekly')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg"
            >
              📅 SEMANAL<br/>
              <span className="text-lg font-bold">R$ 8,90</span>
            </button>
          </div>
        </div>

        {/* Garantias */}
        <div className="px-6 pb-4">
          <div className="bg-blue-800/50 rounded-2xl p-4 text-center">
            <div className="text-sm text-blue-200">
              ✅ Acesso completo por 3 dias • ✅ Cancele quando quiser • ✅ Sem compromisso
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="px-6 pb-4">
          <div className="bg-white/10 rounded-2xl p-5">
            <div className="text-lg font-bold text-white mb-4 text-center">✨ Benefícios Premium</div>
            <ul className="space-y-3 text-blue-100">
              <li className="flex items-start gap-3">
                <span className="text-xl">🎙️</span>
                <span>Envie áudios — IA transcreve e registra automaticamente</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">📄</span>
                <span>Envie PDFs, fotos e notas — tudo é processado e categorizado</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">🚀</span>
                <span>Não se preocupe mais com limites de mensagens, arquivos, relatórios ou transações</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">📱</span>
                <span>Controle total pelo Telegram ou app</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">📊</span>
                <span>Relatórios detalhados com insights inteligentes</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">🔒</span>
                <span>Segurança total dos seus dados</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="px-6 pb-4">
          <div className="bg-green-500 rounded-2xl p-4 text-center">
            <div className="text-white font-bold">💎 MELHOR OFERTA: MENSAL</div>
            <div className="text-green-100 text-sm mt-1">
              Economize com o plano mensal por apenas R$ 19,90
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-center text-blue-200 text-sm">
            🛡️ "Não gostou? Cancele quando quiser. Simples assim."
          </div>
          
          <div className="mt-4 text-center text-xs text-blue-300">
            Pagamentos seguros • Cancelamento fácil • Suporte via app
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaterPaywall;
