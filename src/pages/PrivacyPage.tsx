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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">PolÃ­tica de Privacidade</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. InformaÃ§Ãµes Gerais</h2>
              <p>
                Esta PolÃ­tica de Privacidade descreve como o Stater ("nÃ³s", "nosso" ou "aplicativo") 
                coleta, usa e protege suas informaÃ§Ãµes pessoais quando vocÃª utiliza nosso serviÃ§o.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. InformaÃ§Ãµes que Coletamos</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>InformaÃ§Ãµes de conta: Nome, email e foto do perfil (via Google OAuth)</li>
                <li>Dados financeiros: TransaÃ§Ãµes, categorias e valores inseridos por vocÃª</li>
                <li>Dados de uso: Como vocÃª interage com o aplicativo</li>
                <li>InformaÃ§Ãµes tÃ©cnicas: IP, navegador, dispositivo (para seguranÃ§a)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Como Usamos suas InformaÃ§Ãµes</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Fornecer e melhorar nossos serviÃ§os financeiros</li>
                <li>Personalizar sua experiÃªncia no aplicativo</li>
                <li>Enviar notificaÃ§Ãµes e atualizaÃ§Ãµes importantes</li>
                <li>Garantir a seguranÃ§a e prevenir fraudes</li>
                <li>Cumprir obrigaÃ§Ãµes legais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Compartilhamento de InformaÃ§Ãµes</h2>
              <p>
                NÃ£o vendemos, alugamos ou compartilhamos suas informaÃ§Ãµes pessoais com terceiros, 
                exceto quando necessÃ¡rio para:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Cumprir obrigaÃ§Ãµes legais</li>
                <li>Proteger nossos direitos e seguranÃ§a</li>
                <li>Prestar serviÃ§os essenciais (ex: autenticaÃ§Ã£o via Google)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. SeguranÃ§a dos Dados</h2>
              <p>
                Implementamos medidas de seguranÃ§a tÃ©cnicas e organizacionais adequadas para 
                proteger suas informaÃ§Ãµes contra acesso nÃ£o autorizado, alteraÃ§Ã£o, divulgaÃ§Ã£o 
                ou destruiÃ§Ã£o.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Seus Direitos (LGPD)</h2>
              <p>De acordo com a Lei Geral de ProteÃ§Ã£o de Dados (LGPD), vocÃª tem direito a:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Acesso aos seus dados pessoais</li>
                <li>CorreÃ§Ã£o de dados incompletos ou incorretos</li>
                <li>ExclusÃ£o de dados desnecessÃ¡rios ou tratados em desconformidade</li>
                <li>Portabilidade dos dados</li>
                <li>RevogaÃ§Ã£o do consentimento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. RetenÃ§Ã£o de Dados</h2>
              <p>
                Mantemos suas informaÃ§Ãµes pelo tempo necessÃ¡rio para cumprir os propÃ³sitos 
                descritos nesta polÃ­tica, atender requisitos legais e resolver disputas.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Contato</h2>
              <p>
                Para exercer seus direitos ou esclarecer dÃºvidas sobre esta polÃ­tica, 
                entre em contato conosco:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> stater@stater.app
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. AlteraÃ§Ãµes</h2>
              <p>
                Esta polÃ­tica pode ser atualizada periodicamente. Notificaremos sobre 
                mudanÃ§as significativas atravÃ©s do aplicativo ou por email.
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Ãšltima atualizaÃ§Ã£o: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

