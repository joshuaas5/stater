import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao App
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Política de Privacidade</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Informações Gerais</h2>
              <p>
                Esta Política de Privacidade descreve como o Stater ("nós", "nosso" ou "aplicativo") 
                coleta, usa e protege suas informações pessoais quando você utiliza nosso serviço.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Informações que Coletamos</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Informações de conta: Nome, email e foto do perfil (via Google OAuth)</li>
                <li>Dados financeiros: Transações, categorias e valores inseridos por você</li>
                <li>Dados de uso: Como você interage com o aplicativo</li>
                <li>Informações técnicas: IP, navegador, dispositivo (para segurança)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Como Usamos suas Informações</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Fornecer e melhorar nossos serviços financeiros</li>
                <li>Personalizar sua experiência no aplicativo</li>
                <li>Enviar notificações e atualizações importantes</li>
                <li>Garantir a segurança e prevenir fraudes</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Compartilhamento de Informações</h2>
              <p>
                Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                exceto quando necessário para:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Cumprir obrigações legais</li>
                <li>Proteger nossos direitos e segurança</li>
                <li>Prestar serviços essenciais (ex: autenticação via Google)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Segurança dos Dados</h2>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais adequadas para 
                proteger suas informações contra acesso não autorizado, alteração, divulgação 
                ou destruição.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Seus Direitos (LGPD)</h2>
              <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Acesso aos seus dados pessoais</li>
                <li>Correção de dados incompletos ou incorretos</li>
                <li>Exclusão de dados desnecessários ou tratados em desconformidade</li>
                <li>Portabilidade dos dados</li>
                <li>Revogação do consentimento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Retenção de Dados</h2>
              <p>
                Mantemos suas informações pelo tempo necessário para cumprir os propósitos 
                descritos nesta política, atender requisitos legais e resolver disputas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contato</h2>
              <p>
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, 
                entre em contato conosco:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> staterbills@gmail.com
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Alterações</h2>
              <p>
                Esta política pode ser atualizada periodicamente. Notificaremos sobre 
                mudanças significativas através do aplicativo ou por email.
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
