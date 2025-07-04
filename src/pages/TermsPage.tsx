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
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
              <p>
                Ao acessar e usar o Stater ("Aplicativo"), você concorda em cumprir e estar 
                vinculado a estes Termos de Uso. Se você não concordar com algum destes termos, 
                não deve usar o Aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Descrição do Serviço</h2>
              <p>
                O Stater é um aplicativo de gestão financeira pessoal que oferece:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Controle de receitas e despesas</li>
                <li>Categorização de transações</li>
                <li>Análise financeira com inteligência artificial</li>
                <li>Relatórios e gráficos financeiros</li>
                <li>Integração com Telegram para notificações</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Conta do Usuário</h2>
              <p>Para usar o Aplicativo, você deve:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Fornecer informações precisas e atualizadas</li>
                <li>Manter a confidencialidade de sua conta</li>
                <li>Ser responsável por todas as atividades em sua conta</li>
                <li>Notificar-nos imediatamente sobre uso não autorizado</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Uso Permitido</h2>
              <p>Você pode usar o Aplicativo para:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Gerenciar suas finanças pessoais</li>
                <li>Registrar transações financeiras</li>
                <li>Gerar relatórios de suas atividades financeiras</li>
                <li>Utilizar recursos de inteligência artificial para análises</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Uso Proibido</h2>
              <p>Você NÃO pode usar o Aplicativo para:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Atividades ilegais ou fraudulentas</li>
                <li>Tentar acessar contas de outros usuários</li>
                <li>Interferir no funcionamento do sistema</li>
                <li>Violar direitos de propriedade intelectual</li>
                <li>Enviar spam ou conteúdo malicioso</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Dados Financeiros</h2>
              <p>
                Você é totalmente responsável pela precisão e veracidade dos dados financeiros 
                inseridos no Aplicativo. O Stater não se responsabiliza por:
              </p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Decisões financeiras baseadas nos dados do app</li>
                <li>Erros nos dados inseridos pelo usuário</li>
                <li>Perdas financeiras decorrentes do uso do app</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Propriedade Intelectual</h2>
              <p>
                O Aplicativo e todo seu conteúdo são protegidos por direitos autorais e outras 
                leis de propriedade intelectual. Você não pode copiar, modificar, distribuir 
                ou criar obras derivadas sem autorização.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Disponibilidade</h2>
              <p>
                Embora nos esforcemos para manter o Aplicativo disponível, não garantimos 
                operação ininterrupta. Podemos suspender o serviço temporariamente para 
                manutenção ou melhorias.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitação de Responsabilidade</h2>
              <p>
                O Stater é fornecido "como está". Não oferecemos garantias e não nos 
                responsabilizamos por danos diretos, indiretos, incidentais ou consequenciais 
                decorrentes do uso do Aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Encerramento</h2>
              <p>
                Podemos encerrar ou suspender sua conta a qualquer momento, com ou sem aviso, 
                por violação destes termos ou por outros motivos legítimos.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Alterações nos Termos</h2>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                Alterações significativas serão comunicadas através do Aplicativo ou por email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Lei Aplicável</h2>
              <p>
                Estes termos são regidos pelas leis brasileiras. Qualquer disputa será 
                resolvida nos tribunais competentes do Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contato</h2>
              <p>
                Para dúvidas sobre estes termos, entre em contato:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> staterbills@gmail.com
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
