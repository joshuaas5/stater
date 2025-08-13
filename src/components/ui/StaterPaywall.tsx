import React from "react";

/**
 * Stater Paywall - Versão Mobile First Otimizada
 * Fundo azul mais escuro, preços atualizados, design compacto
 */

const css = `
.rotator { position: relative; height: 2.2em; overflow: hidden; }
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
}

const StaterPaywall = ({ isOpen = true, onClose = () => {} }: StaterPaywallProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 z-50">
      <div className="w-full max-w-sm bg-gradient-blue rounded-2xl shadow-glow overflow-hidden relative max-h-[95vh] overflow-y-auto">
        {/* CSS customizado */}
        <style>{`
          ${css}
          .bg-gradient-blue { background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%); }
          .shadow-glow { box-shadow: 0 0 25px rgba(59, 130, 246, 0.4); }
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
          <Badge>🎁 TESTE GRÁTIS - 3 DIAS</Badge>
          
          <h1 className="mt-2 text-lg font-extrabold text-white" aria-live="polite">
            <div className="rotator">
              <span>Seus insights financeiros estão bloqueados... 🔒</span>
              <span>Automação financeira a 1 clique de distância... 🤖</span>
              <span>Transforme sua vida financeira com o Stater... 📈</span>
            </div>
          </h1>

          <p className="mt-3 text-xs text-blue-100 leading-relaxed">
            💬 <strong>Envie áudios, fotos, PDFs ou notas</strong> diretamente para a IA.
            <br />
            Ela organiza tudo automaticamente: despesas, assinaturas, metas e muito mais.
          </p>
        </div>

        {/* Botões de Ação */}
        <div className="px-3 pb-3 space-y-2">
          <button className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-bold py-2.5 px-3 rounded-xl text-sm shadow-xl pulse">
            🎁 INICIAR TESTE GRÁTIS - 3 DIAS
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button className="bg-green-500 hover:bg-green-400 text-white font-semibold py-2 px-2 rounded-lg shadow-lg text-xs">
              💎 MENSAL<br/>
              <span className="text-base font-bold">R$ 19,90</span>
            </button>
            <button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-2 rounded-lg shadow-lg text-xs">
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
                <span>Relatórios detalhados com insights inteligentes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">🔒</span>
                <span>Segurança total dos seus dados</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Pricing Info */}
        <div className="px-3 pb-3">
          <div className="bg-green-500 rounded-xl p-2.5 text-center">
            <div className="text-white font-bold text-sm">💎 MELHOR OFERTA: MENSAL</div>
            <div className="text-green-100 text-xs mt-1">
              Economize com o plano mensal por apenas R$ 19,90
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 pb-3">
          <div className="text-center text-blue-200 text-xs">
            🛡️ "Não gostou? Cancele quando quiser. Simples assim."
          </div>
          
          <div className="mt-2 text-center text-xs text-blue-300">
            Pagamentos seguros • Cancelamento fácil • Suporte via app
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaterPaywall;
