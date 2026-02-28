import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Shield, AlertTriangle, Scale, Users, RefreshCw } from "lucide-react";

const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-8 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Termos de Uso</h1>
            <p className="text-gray-400">Última atualização: 05 de Fevereiro de 2026</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
          
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">1. Aceitação dos Termos</h2>
            <p>Ao acessar ou usar o aplicativo Stater e o site stater.app (coletivamente, o "Serviço"), você concorda em estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte dos termos, não poderá acessar o Serviço.</p>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
              <Users className="w-5 h-5 text-blue-400" />
              2. Descrição do Serviço
            </h2>
            <p>O Stater é uma plataforma de gestão financeira pessoal que oferece:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Controle de receitas e despesas</li>
              <li>Definição e acompanhamento de metas financeiras</li>
              <li>Ferramentas de cálculo (juros compostos, CDI, IPVA, IR, etc.)</li>
              <li>Conteúdo educacional sobre finanças pessoais</li>
              <li>Análises e relatórios financeiros</li>
            </ul>
            <p className="mt-4 text-amber-400 text-sm">O Stater é uma ferramenta de organização e não substitui orientação financeira profissional.</p>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">3. Conta de Usuário</h2>
            <p>Para acessar certas funcionalidades, você deve criar uma conta. Ao criar uma conta, você:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Deve fornecer informações verdadeiras e completas</li>
              <li>É responsável por manter a confidencialidade de sua senha</li>
              <li>É responsável por todas as atividades em sua conta</li>
              <li>Deve ter pelo menos 13 anos de idade</li>
              <li>Concorda em nos notificar imediatamente sobre uso não autorizado</li>
            </ul>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
              <Shield className="w-5 h-5 text-blue-400" />
              4. Uso Aceitável
            </h2>
            <p>Você concorda em não usar o Serviço para:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Violar qualquer lei ou regulamento aplicável</li>
              <li>Infringir direitos de propriedade intelectual</li>
              <li>Transmitir malware, vírus ou código malicioso</li>
              <li>Tentar acessar sistemas ou dados não autorizados</li>
              <li>Interferir no funcionamento normal do Serviço</li>
              <li>Coletar dados de outros usuários sem consentimento</li>
              <li>Enviar spam ou comunicações não solicitadas</li>
            </ul>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">5. Propriedade Intelectual</h2>
            <p>Todo o conteúdo do Serviço, incluindo textos, gráficos, logos, ícones, imagens, clipes de áudio, downloads digitais e compilações de dados, é propriedade da Stater ou de seus licenciadores e está protegido por leis de direitos autorais.</p>
            <p className="mt-3">Você recebe uma licença limitada, não exclusiva e não transferível para usar o Serviço para fins pessoais e não comerciais.</p>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">6. Conteúdo do Usuário</h2>
            <p>Você mantém todos os direitos sobre os dados que insere no Serviço. Ao usar o Serviço, você nos concede uma licença limitada para processar seus dados apenas para fornecer as funcionalidades solicitadas.</p>
            <p className="mt-3">Você é responsável pela precisão e legalidade dos dados que insere.</p>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">7. Publicidade</h2>
            <p>O Serviço pode exibir anúncios de terceiros, incluindo o Google AdSense. Esses anúncios podem ser personalizados com base em seus interesses e histórico de navegação.</p>
            <p className="mt-3">Não somos responsáveis pelo conteúdo de anúncios de terceiros ou por produtos/serviços anunciados.</p>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              8. Isenção de Responsabilidade
            </h2>
            <p>O Serviço é fornecido "como está" e "conforme disponível". Na máxima extensão permitida por lei:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Não garantimos que o Serviço será ininterrupto ou livre de erros</li>
              <li>Não garantimos a precisão de cálculos ou simulações</li>
              <li>Não oferecemos consultoria financeira, fiscal ou jurídica</li>
              <li>Decisões financeiras são de sua exclusiva responsabilidade</li>
            </ul>
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <p className="text-sm text-amber-400">Sempre consulte um profissional qualificado antes de tomar decisões financeiras importantes.</p>
            </div>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
              <Scale className="w-5 h-5 text-blue-400" />
              9. Limitação de Responsabilidade
            </h2>
            <p>Em nenhuma circunstância a Stater, seus diretores, funcionários ou afiliados serão responsáveis por:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Danos indiretos, incidentais, especiais ou consequenciais</li>
              <li>Perda de lucros, dados ou oportunidades de negócios</li>
              <li>Danos resultantes do uso ou incapacidade de usar o Serviço</li>
            </ul>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">10. Assinaturas e Pagamentos</h2>
            <p>Algumas funcionalidades podem exigir assinatura paga. Ao assinar:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Você autoriza cobranças recorrentes conforme o plano escolhido</li>
              <li>Os preços podem ser alterados com aviso prévio de 30 dias</li>
              <li>Cancelamentos devem ser feitos antes da renovação</li>
              <li>Reembolsos são concedidos conforme nossa política de reembolso</li>
            </ul>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">11. Rescisão</h2>
            <p>Podemos suspender ou encerrar seu acesso ao Serviço, sem aviso prévio, por qualquer motivo, incluindo violação destes Termos. Você pode encerrar sua conta a qualquer momento nas configurações do aplicativo.</p>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
              <RefreshCw className="w-5 h-5 text-blue-400" />
              12. Alterações nos Termos
            </h2>
            <p>Reservamo-nos o direito de modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas por email ou por aviso no Serviço. O uso continuado após alterações constitui aceitação dos novos Termos.</p>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">13. Lei Aplicável</h2>
            <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida nos tribunais da comarca de São Paulo, SP.</p>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">14. Contato</h2>
            <p>Para dúvidas sobre estes Termos:</p>
            <div className="mt-4 space-y-2">
              <p><strong className="text-white">Email:</strong> <a href="mailto:suporte@stater.app" className="text-purple-400 hover:text-purple-300">suporte@stater.app</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default TermsPage;
