import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Eye } from "lucide-react";

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050510] to-[#0c0c1d]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Lock className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Política de Privacidade</h1>
            <p className="text-gray-400">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>
          </div>
        </div>
        <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4"><Eye className="w-5 h-5 text-purple-400" />1. Coleta de Dados</h2>
            <p>Para fornecer nossos serviços, coletamos os seguintes dados:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Informações de identificação (nome, email)</li>
              <li>Dados financeiros inseridos por você</li>
              <li>Informações de uso da plataforma</li>
              <li>Dados de dispositivo e navegação</li>
            </ul>
          </section>
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">2. Uso dos Dados</h2>
            <p>Seus dados são utilizados exclusivamente para:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Fornecer e melhorar nossos serviços</li>
              <li>Personalizar sua experiência</li>
              <li>Enviar comunicações relevantes</li>
              <li>Garantir a segurança da plataforma</li>
            </ul>
          </section>
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">3. Proteção de Dados</h2>
            <p>Implementamos medidas de segurança técnicas e organizacionais para proteger seus dados, incluindo criptografia, controles de acesso e monitoramento contínuo.</p>
          </section>
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">4. Compartilhamento</h2>
            <p>Não vendemos seus dados. Compartilhamos apenas com:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Provedores de serviços essenciais (processamento de pagamentos)</li>
              <li>Quando exigido por lei</li>
            </ul>
          </section>
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">5. Seus Direitos (LGPD)</h2>
            <p>Você tem direito a:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar exclusão de dados</li>
              <li>Revogar consentimento</li>
              <li>Portabilidade dos dados</li>
            </ul>
          </section>
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">6. Contato</h2>
            <p>Para exercer seus direitos ou tirar dúvidas: <a href="mailto:stater@stater.app" className="text-purple-400 hover:text-purple-300">stater@stater.app</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
