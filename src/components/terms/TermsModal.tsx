import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Shield, FileText, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setHasScrolledToEnd(false);
      setAcceptedTerms(false);
      setAcceptedPrivacy(false);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const scrolledToBottom = Math.abs(element.scrollHeight - element.clientHeight - element.scrollTop) < 50;
    if (scrolledToBottom && !hasScrolledToEnd) setHasScrolledToEnd(true);
  };

  const canAccept = acceptedTerms && acceptedPrivacy;
  if (!isOpen) return null;

  const cbBase = "flex-shrink-0 w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center mt-0.5";
  const cbOn = "bg-purple-500 border-purple-500";
  const cbOff = "border-gray-500 group-hover:border-purple-400";

  const modalContent = (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(5, 5, 16, 0.95)" }}>
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0c0c1d 0%, #1a1a2e 100%)", border: "1px solid rgba(139, 92, 246, 0.3)", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.8)" }}>
          <div className="relative p-6 border-b border-white/10">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10" />
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30"><Shield className="w-6 h-6 text-purple-400" /></div>
              <div><h2 className="text-xl font-bold text-white">Termos de Uso e Privacidade</h2><p className="text-sm text-gray-400">Por favor, leia e aceite para continuar</p></div>
            </div>
          </div>
          <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 280px)" }} onScroll={handleScroll}>
            <div className="space-y-6 text-gray-300">
              <section><h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-3"><FileText className="w-5 h-5 text-purple-400" />1. Aceitação dos Termos</h3><p className="text-sm leading-relaxed">Ao acessar e utilizar o Stater, você concorda com estes Termos de Uso e nossa Política de Privacidade.</p></section>
              <section><h3 className="text-lg font-semibold text-white mb-3">2. Descrição do Serviço</h3><p className="text-sm leading-relaxed">O Stater é uma plataforma de gestão financeira pessoal que oferece:</p><ul className="mt-2 space-y-1 text-sm list-disc list-inside text-gray-400"><li>Gerenciamento de contas e transações financeiras</li><li>Controle de despesas e receitas</li><li>Consultor financeiro com inteligência artificial</li></ul></section>
              <section><h3 className="text-lg font-semibold text-white mb-3">3. Proteção de Dados (LGPD)</h3><p className="text-sm leading-relaxed">Seus dados são protegidos com criptografia. Você tem direito a acessar, corrigir e excluir seus dados.</p></section>
              <section><h3 className="text-lg font-semibold text-white mb-3">4. Contato</h3><p className="text-sm leading-relaxed">Email: <a href="mailto:stater@stater.app" className="text-purple-400 hover:text-purple-300">stater@stater.app</a></p></section>
            </div>
            {!hasScrolledToEnd && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="sticky bottom-0 left-0 right-0 flex justify-center py-2 bg-gradient-to-t from-[#0c0c1d] to-transparent"><motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="flex items-center gap-2 text-sm text-purple-400"><ChevronDown className="w-4 h-4" />Role para ler tudo</motion.div></motion.div>)}
          </div>
          <div className="p-6 border-t border-white/10 bg-black/20">
            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-3 cursor-pointer group"><div onClick={() => setAcceptedTerms(!acceptedTerms)} className={cbBase + " " + (acceptedTerms ? cbOn : cbOff)}>{acceptedTerms && <Check className="w-3 h-3 text-white" />}</div><span className="text-sm text-gray-300 group-hover:text-white transition-colors">Li e aceito os <span className="text-purple-400">Termos de Uso</span> do Stater</span></label>
              <label className="flex items-start gap-3 cursor-pointer group"><div onClick={() => setAcceptedPrivacy(!acceptedPrivacy)} className={cbBase + " " + (acceptedPrivacy ? cbOn : cbOff)}>{acceptedPrivacy && <Check className="w-3 h-3 text-white" />}</div><span className="text-sm text-gray-300 group-hover:text-white transition-colors">Li e aceito a <span className="text-purple-400">Política de Privacidade</span></span></label>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 px-6 py-3 rounded-xl font-medium text-gray-400 bg-white/5 hover:bg-white/10 border border-white/10 transition-all">Recusar</button>
              <button onClick={() => canAccept && onAccept()} disabled={!canAccept} className={"flex-1 px-6 py-3 rounded-xl font-medium transition-all " + (canAccept ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg" : "bg-gray-700 text-gray-500 cursor-not-allowed")}>Aceitar e Continuar</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default TermsModal;
