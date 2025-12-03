import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Termos de Uso</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. AceitaÃ§Ã£o dos Termos</h2>
              <p>
                Ao acessar e usar o Stater ("Aplicativo"), vocÃª concorda em cumprir e estar 
                vinculado a estes Termos de Uso. Se vocÃª nÃ£o concordar com algum destes termos, 
                nÃ£o deve usar o Aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. DescriÃ§Ã£o do ServiÃ§o</h2>
              <p>
                O Stater Ã© um aplicativo de gestÃ£o financeira pessoal que oferece:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Controle de receitas e despesas</li>
                <li>CategorizaÃ§Ã£o de transaÃ§Ãµes</li>
                <li>AnÃ¡lise financeira com inteligÃªncia artificial</li>
                <li>RelatÃ³rios e grÃ¡ficos financeiros</li>
                <li>IntegraÃ§Ã£o com Telegram para notificaÃ§Ãµes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Conta do UsuÃ¡rio</h2>
              <p>Para usar o Aplicativo, vocÃª deve:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Fornecer informaÃ§Ãµes precisas e atualizadas</li>
                <li>Manter a confidencialidade de sua conta</li>
                <li>Ser responsÃ¡vel por todas as atividades em sua conta</li>
                <li>Notificar-nos imediatamente sobre uso nÃ£o autorizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Uso Permitido</h2>
              <p>VocÃª pode usar o Aplicativo para:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Gerenciar suas finanÃ§as pessoais</li>
                <li>Registrar transaÃ§Ãµes financeiras</li>
                <li>Gerar relatÃ³rios de suas atividades financeiras</li>
                <li>Utilizar recursos de inteligÃªncia artificial para anÃ¡lises</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Uso Proibido</h2>
              <p>VocÃª NÃƒO pode usar o Aplicativo para:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Atividades ilegais ou fraudulentas</li>
                <li>Tentar acessar contas de outros usuÃ¡rios</li>
                <li>Interferir no funcionamento do sistema</li>
                <li>Violar direitos de propriedade intelectual</li>
                <li>Enviar spam ou conteÃºdo malicioso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Dados Financeiros</h2>
              <p>
                VocÃª Ã© totalmente responsÃ¡vel pela precisÃ£o e veracidade dos dados financeiros 
                inseridos no Aplicativo. O Stater nÃ£o se responsabiliza por:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>DecisÃµes financeiras baseadas nos dados do app</li>
                <li>Erros nos dados inseridos pelo usuÃ¡rio</li>
                <li>Perdas financeiras decorrentes do uso do app</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Propriedade Intelectual</h2>
              <p>
                O Aplicativo e todo seu conteÃºdo sÃ£o protegidos por direitos autorais e outras 
                leis de propriedade intelectual. VocÃª nÃ£o pode copiar, modificar, distribuir 
                ou criar obras derivadas sem autorizaÃ§Ã£o.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Disponibilidade</h2>
              <p>
                Embora nos esforcemos para manter o Aplicativo disponÃ­vel, nÃ£o garantimos 
                operaÃ§Ã£o ininterrupta. Podemos suspender o serviÃ§o temporariamente para 
                manutenÃ§Ã£o ou melhorias.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. LimitaÃ§Ã£o de Responsabilidade</h2>
              <p>
                O Stater Ã© fornecido "como estÃ¡". NÃ£o oferecemos garantias e nÃ£o nos 
                responsabilizamos por danos diretos, indiretos, incidentais ou consequenciais 
                decorrentes do uso do Aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Encerramento</h2>
              <p>
                Podemos encerrar ou suspender sua conta a qualquer momento, com ou sem aviso, 
                por violaÃ§Ã£o destes termos ou por outros motivos legÃ­timos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. AlteraÃ§Ãµes nos Termos</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                AlteraÃ§Ãµes significativas serÃ£o comunicadas atravÃ©s do Aplicativo ou por email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Lei AplicÃ¡vel</h2>
              <p>
                Estes termos sÃ£o regidos pelas leis brasileiras. Qualquer disputa serÃ¡ 
                resolvida nos tribunais competentes do Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contato</h2>
              <p>
                Para dÃºvidas sobre estes termos, entre em contato:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> stater@stater.app
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

