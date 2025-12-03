import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050510] to-[#0c0c1d]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Termos de Uso</h1>
            <p className="text-gray-400">Ultima atualizacao: {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <div className="prose prose-invert max-w-none space-y-8 text-gray-300">
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4"><FileText className="w-5 h-5 text-purple-400" />1. Aceitacao dos Termos</h2>
            <p>Ao acessar e utilizar o Stater, voce concorda com estes Termos de Uso e nossa Politica de Privacidade. Se voce nao concordar com algum dos termos, por favor, nao utilize nossos servicos.</p>
          </section>
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">2. Descricao do Servico</h2>
            <p>O Stater e uma plataforma de gestao financeira pessoal que oferece:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Gerenciamento de contas e transacoes financeiras</li>
              <li>Controle de despesas e receitas</li>
              <li>Definicao e acompanhamento de metas financeiras</li>
              <li>Consultor financeiro com inteligencia artificial</li>
              <li>Integracao com Telegram para lembretes</li>
            </ul>
          </section>
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">3. Cadastro e Conta</h2>
            <p>Para utilizar o Stater, voce deve criar uma conta fornecendo informacoes verdadeiras e atualizadas. Voce e responsavel por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta.</p>
          </section>
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">4. Protecao de Dados</h2>
            <p>Implementamos medidas de seguranca tecnicas e organizacionais para proteger seus dados, incluindo criptografia e controles de acesso. Seus dados nunca sao vendidos a terceiros.</p>
          </section>
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">5. Seus Direitos (LGPD)</h2>
            <p>Em conformidade com a LGPD, voce tem direito a:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou desatualizados</li>
              <li>Solicitar a exclusao de seus dados</li>
              <li>Revogar seu consentimento</li>
            </ul>
          </section>
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">6. Contato</h2>
            <p>Para questoes sobre estes termos, entre em contato atraves do email <a href="mailto:stater@stater.app" className="text-purple-400 hover:text-purple-300">stater@stater.app</a></p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;