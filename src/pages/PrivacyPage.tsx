import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Eye, Shield, Database, UserCheck, Mail, Cookie, Globe } from "lucide-react";

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950">
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
            <p className="text-gray-400">Última atualização: 05 de Fevereiro de 2026</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-gray-300">
          
          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
              <Globe className="w-5 h-5 text-purple-400" />
              Introdução
            </h2>
            <p>A Stater ("nós", "nosso" ou "empresa") opera o aplicativo Stater e o site stater.app (coletivamente, o "Serviço"). Esta página informa sobre nossas políticas de coleta, uso e divulgação de dados pessoais quando você usa nosso Serviço.</p>
            <p className="mt-3">Ao usar o Serviço, você concorda com a coleta e uso de informações de acordo com esta política. Os dados pessoais coletados são usados para fornecer e melhorar o Serviço.</p>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
              <Eye className="w-5 h-5 text-purple-400" />
              1. Coleta de Dados
            </h2>
            <p>Para fornecer nossos serviços, coletamos os seguintes tipos de dados:</p>
            <h3 className="text-lg font-medium text-white mt-4 mb-2">1.1 Dados fornecidos por você:</h3>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li>Informações de identificação (nome, email)</li>
              <li>Dados financeiros inseridos manualmente (transações, metas, orçamentos)</li>
              <li>Preferências e configurações do aplicativo</li>
            </ul>
            <h3 className="text-lg font-medium text-white mt-4 mb-2">1.2 Dados coletados automaticamente:</h3>
            <ul className="space-y-2 list-disc list-inside text-gray-400">
              <li>Endereço IP e informações do dispositivo</li>
              <li>Tipo de navegador e sistema operacional</li>
              <li>Páginas visitadas e tempo de uso</li>
              <li>Dados de crash e erros para melhorar a estabilidade</li>
            </ul>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
              <Database className="w-5 h-5 text-purple-400" />
              2. Uso dos Dados
            </h2>
            <p>Seus dados são utilizados para:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Fornecer, manter e melhorar nossos serviços</li>
              <li>Personalizar sua experiência no aplicativo</li>
              <li>Processar transações e enviar notificações relacionadas</li>
              <li>Enviar comunicações sobre atualizações, ofertas e novidades (com seu consentimento)</li>
              <li>Detectar, prevenir e resolver problemas técnicos e de segurança</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
              <Cookie className="w-5 h-5 text-purple-400" />
              3. Cookies e Publicidade
            </h2>
            <p>Utilizamos cookies e tecnologias similares para:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Manter você conectado ao serviço</li>
              <li>Lembrar suas preferências</li>
              <li>Analisar o uso do serviço para melhorias</li>
              <li>Exibir anúncios personalizados através do Google AdSense</li>
            </ul>
            <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <h4 className="font-medium text-amber-400 mb-2">Sobre o Google AdSense:</h4>
              <p className="text-sm text-gray-400">Terceiros, incluindo o Google, usam cookies para veicular anúncios com base em visitas anteriores do usuário ao seu website ou a outros websites. O uso de cookies de publicidade pelo Google permite que ele e seus parceiros veiculem anúncios aos seus usuários com base na visita que eles fizeram aos seus sites e/ou a outros sites na Internet.</p>
              <p className="text-sm text-gray-400 mt-2">Os usuários podem desativar a publicidade personalizada acessando as <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">Configurações de anúncios</a>.</p>
            </div>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
              <Shield className="w-5 h-5 text-purple-400" />
              4. Proteção e Segurança dos Dados
            </h2>
            <p>A segurança dos seus dados é importante para nós. Implementamos medidas técnicas e organizacionais, incluindo:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Criptografia de dados em trânsito e em repouso (SSL/TLS)</li>
              <li>Autenticação segura com verificação em duas etapas opcional</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Acesso restrito aos dados apenas a funcionários autorizados</li>
              <li>Backups regulares e planos de recuperação de desastres</li>
            </ul>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">5. Compartilhamento de Dados</h2>
            <p><strong className="text-white">Não vendemos seus dados pessoais.</strong> Compartilhamos dados apenas nas seguintes situações:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li><strong className="text-white">Provedores de serviços:</strong> Empresas que nos auxiliam (hospedagem, processamento de pagamentos, análise)</li>
              <li><strong className="text-white">Parceiros de publicidade:</strong> Google AdSense para exibição de anúncios</li>
              <li><strong className="text-white">Requisitos legais:</strong> Quando exigido por lei, processo judicial ou autoridade governamental</li>
              <li><strong className="text-white">Proteção de direitos:</strong> Para proteger nossos direitos, propriedade ou segurança</li>
            </ul>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
              <UserCheck className="w-5 h-5 text-purple-400" />
              6. Seus Direitos (LGPD)
            </h2>
            <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li><strong className="text-white">Acesso:</strong> Solicitar cópia dos seus dados pessoais</li>
              <li><strong className="text-white">Correção:</strong> Corrigir dados incompletos ou incorretos</li>
              <li><strong className="text-white">Exclusão:</strong> Solicitar a exclusão dos seus dados</li>
              <li><strong className="text-white">Portabilidade:</strong> Receber seus dados em formato estruturado</li>
              <li><strong className="text-white">Revogação:</strong> Retirar consentimento a qualquer momento</li>
              <li><strong className="text-white">Oposição:</strong> Se opor ao tratamento de dados em certas situações</li>
            </ul>
            <p className="mt-4">Para exercer esses direitos, entre em contato conosco pelo email abaixo.</p>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">7. Retenção de Dados</h2>
            <p>Retemos seus dados pessoais apenas pelo tempo necessário para os fins descritos nesta política, ou conforme exigido por lei. Quando você exclui sua conta:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-gray-400">
              <li>Dados pessoais são removidos em até 30 dias</li>
              <li>Backups podem conter dados por até 90 dias</li>
              <li>Alguns dados podem ser retidos para cumprimento de obrigações legais</li>
            </ul>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">8. Menores de Idade</h2>
            <p>Nosso Serviço não se destina a menores de 13 anos. Não coletamos intencionalmente dados de menores de 13 anos. Se você é pai/mãe ou responsável e sabe que seu filho nos forneceu dados pessoais, entre em contato conosco.</p>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">9. Alterações nesta Política</h2>
            <p>Podemos atualizar nossa Política de Privacidade periodicamente. Notificaremos sobre alterações significativas por email ou por aviso no Serviço antes que as alterações entrem em vigor.</p>
            <p className="mt-3">Recomendamos revisar esta política periodicamente. Alterações entram em vigor quando publicadas nesta página.</p>
          </section>

          <section className="bg-white/5 rounded-xl p-6 border border-white/10">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-white mb-4">
              <Mail className="w-5 h-5 text-purple-400" />
              10. Contato
            </h2>
            <p>Para exercer seus direitos, tirar dúvidas ou fazer reclamações sobre esta política:</p>
            <div className="mt-4 space-y-2">
              <p><strong className="text-white">Email:</strong> <a href="mailto:privacidade@stater.app" className="text-purple-400 hover:text-purple-300">privacidade@stater.app</a></p>
              <p><strong className="text-white">Suporte:</strong> <a href="mailto:suporte@stater.app" className="text-purple-400 hover:text-purple-300">suporte@stater.app</a></p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
