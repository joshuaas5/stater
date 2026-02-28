import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const PixTudoQuePrecisaSaber: React.FC = () => {
  return (
    <ArticleLayout 
      title="PIX: Tudo que Você Precisa Saber em 2026" 
      description="Guia completo do PIX: como usar, limites, segurança, PIX parcelado, PIX por aproximação é todas as novidades de 2026." 
      canonical="/blog/pix-guia-completo" 
      keywords="pix, como fazer pix, pix seguro, limite pix, pix parcelado, pix nfc, pix aproximação, golpe pix" 
      date="4 de Fevereiro de 2026" 
      readTime="12 min" 
      relatedArticles={[
        { title: 'Apps de Controle Financeiro', slug: 'apps-controle-financeiro' }, 
        { title: 'Cartão de Crédito: Vilão ou Aliado?', slug: 'cartao-de-crédito-vilao-ou-aliado' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">O PIX revolucionou a forma como os brasileiros movimentam dinheiro. Este guia cobre <strong className="text-emerald-400">tudo</strong> sobre o sistema - desde o básico até as novidades de 2026.</p>
      <QuickSummary 
        variant="green"
        items={[
          { label: 'Limites', value: 'Configure limites no app do banco para segurança', icon: 'shield' },
          { label: 'Horário', value: 'Limite noturno é menor - configure o seu', icon: 'clock' },
          { label: 'Golpes', value: 'Nunca faça PIX por pressão ou para desconhecidos', icon: 'alert' },
          { label: 'Dica', value: 'QR Code pode ser fraudado - confira dados antes', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl"></span>
          <div>
            <h3 className="text-xl font-bold text-emerald-400">O que é o PIX?</h3>
            <p className="text-white/70">Sistema de pagamentos instantâneos do Banco Central. Funciona 24h, 7 dias, todos os dias - incluindo feriados.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">10s</p>
            <p className="text-white/50 text-xs">Tempo máximo</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">R$0</p>
            <p className="text-white/50 text-xs">Taxa para PF</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">24/7</p>
            <p className="text-white/50 text-xs">Disponibilidade</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Tipos de chaves PIX</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl"></span>
            <p className="font-bold text-white">Celular</p>
          </div>
          <p className="text-white/50 text-sm">+55 11 99999-9999</p>
          <p className="text-white/40 text-xs mt-1">Fácil de lembrar, mas expõe seu número</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl"></span>
            <p className="font-bold text-white">E-mail</p>
          </div>
          <p className="text-white/50 text-sm">voce@email.com</p>
          <p className="text-white/40 text-xs mt-1">Bom para profissionais</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl"></span>
            <p className="font-bold text-white">CPF/CNPJ</p>
          </div>
          <p className="text-white/50 text-sm">123.456.789-00</p>
          <p className="text-white/40 text-xs mt-1">Único por documento</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl"></span>
            <p className="font-bold text-emerald-400">Aleatória (recomendada)</p>
          </div>
          <p className="text-white/50 text-sm">abc123-xyz-789...</p>
          <p className="text-white/40 text-xs mt-1">Não expõe dados pessoais</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Limites do PIX (2026)</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-white/50">Período</th>
              <th className="text-center py-3 px-4 text-white/50">Limite padrão</th>
              <th className="text-center py-3 px-4 text-white/50">Pode aumentar?</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white"> Dia (6h-20h)</td>
              <td className="py-3 px-4 text-center text-emerald-400 font-bold">Até R$100.000</td>
              <td className="py-3 px-4 text-center text-white/50">Sim, pelo app</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white"> Noite (20h-6h)</td>
              <td className="py-3 px-4 text-center text-yellow-400 font-bold">R$1.000</td>
              <td className="py-3 px-4 text-center text-white/50">Sim, leva 24-48h</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white"> Novo dispositivo</td>
              <td className="py-3 px-4 text-center text-orange-400 font-bold">R$200</td>
              <td className="py-3 px-4 text-center text-white/50">Aumenta com o tempo</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Novidades do PIX em 2026</h2>
      <div className="space-y-4 mb-8">
        <div className="bg-purple-500/10 text-white border-l-4 border-purple-500 rounded-r-xl p-4">
          <h4 className="font-bold text-purple-400 mb-1">PIX por aproximação (NFC)</h4>
          <p className="text-white/60 text-sm">Encoste o celular na maquininha para pagar. Já disponível em vários bancos.</p>
        </div>
        <div className="bg-blue-500/10 text-white border-l-4 border-blue-500 rounded-r-xl p-4">
          <h4 className="font-bold text-blue-400 mb-1">PIX Parcelado</h4>
          <p className="text-white/60 text-sm">Parcele compras em até 12x usando seu limite de crédito. Juros menores que cartão.</p>
        </div>
        <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1">PIX Automático</h4>
          <p className="text-white/60 text-sm">Autorize débitos recorrentes (assinaturas, mensalidades) direto via PIX.</p>
        </div>
        <div className="bg-orange-500/10 border-l-4 border-orange-500 rounded-r-xl p-4">
          <h4 className="font-bold text-orange-400 mb-1">PIX Internacional</h4>
          <p className="text-white/60 text-sm">Em testes! Transferências para outros países em segundos.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Segurança: Como se proteger</h2>
      <div className="bg-red-500/10 text-white border border-red-500/30 rounded-xl p-5 mb-6">
        <h4 className="font-bold text-red-400 mb-3"> Golpes mais comuns</h4>
        <ul className="text-white/70 space-y-2 text-sm">
          <li> <strong>PIX falso por WhatsApp:</strong> "Oi mãe, troquei de número..."</li>
          <li> <strong>QR Code adulterado:</strong> Colado por cima do original em estabelecimentos</li>
          <li> <strong>Comprovante falso:</strong> "Já fiz o PIX", mas é montagem</li>
          <li> <strong>Sequestro relâmpago:</strong> Pedem transferências sob ameaça</li>
        </ul>
      </div>

      <div className="space-y-3 mb-8">
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1"> Configure limite noturno baixo</h4>
          <p className="text-white/60 text-sm">R$100-500 é suficiente para emergências. Protege contra sequestros.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1"> Ative biometria é PIN</h4>
          <p className="text-white/60 text-sm">Não deixe o app do banco abrir só com desbloqueio da tela.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1"> Verifique antes de confirmar</h4>
          <p className="text-white/60 text-sm">Sempre confira o nome do destinatário antes de finalizar.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1"> Use chave aleatória</h4>
          <p className="text-white/60 text-sm">Para receber de desconhecidos, evita expor CPF ou celular.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1"> Cadastre contatos frequentes</h4>
          <p className="text-white/60 text-sm">Pagamentos para favoritos podem ter limites maiores.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">PIX vs outros meios de pagamento</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-white/50">Critério</th>
              <th className="text-center py-3 px-4 text-emerald-400">PIX</th>
              <th className="text-center py-3 px-4 text-white/50">TED</th>
              <th className="text-center py-3 px-4 text-white/50">Boleto</th>
              <th className="text-center py-3 px-4 text-white/50">Cartão</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white">Velocidade</td>
              <td className="py-3 px-4 text-center text-emerald-400"> 10 seg</td>
              <td className="py-3 px-4 text-center text-white/50">30 min - 1h</td>
              <td className="py-3 px-4 text-center text-white/50">1-3 dias</td>
              <td className="py-3 px-4 text-center text-white/50">Instantâneo</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white">Taxa (PF)</td>
              <td className="py-3 px-4 text-center text-emerald-400">R$0</td>
              <td className="py-3 px-4 text-center text-white/50">R$10-25</td>
              <td className="py-3 px-4 text-center text-white/50">R$0-5</td>
              <td className="py-3 px-4 text-center text-white/50">R$0*</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white">Disponibilidade</td>
              <td className="py-3 px-4 text-center text-emerald-400">24/7</td>
              <td className="py-3 px-4 text-center text-white/50">Dias úteis</td>
              <td className="py-3 px-4 text-center text-white/50">Dias úteis</td>
              <td className="py-3 px-4 text-center text-white/50">24/7</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white">Limite</td>
              <td className="py-3 px-4 text-center text-emerald-400">Configurável</td>
              <td className="py-3 px-4 text-center text-white/50">Alto</td>
              <td className="py-3 px-4 text-center text-white/50">Sem limite</td>
              <td className="py-3 px-4 text-center text-white/50">Limite do cartão</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-gradient-to-r from-emerald-600/30 to-blue-600/30 border-2 border-emerald-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-3"> Dica do especialista</h3>
        <p className="text-white/70">
          <strong className="text-emerald-400">Combine PIX + Cartão de crédito:</strong> Use PIX para transferências é pagamentos onde não tem benefício. Use cartão para compras que acumulam pontos/cashback. O melhor dos dois mundos!
        </p>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "PIX é seguro?",
                      "answer": "Sim, o PIX usa os mesmos protocolos de segurança do sistema bancário brasileiro. Tem criptografia é autenticação em duas etapas."
              },
              {
                      "question": "Tem limite para PIX?",
                      "answer": "Sim, os bancos definem limites. O limite noturno (20h-6h) padrão é de R$ 1.000 para pessoas físicas."
              },
              {
                      "question": "PIX tem taxa?",
                      "answer": "Para pessoas físicas, o PIX é gratuito. Para empresas (PJ), os bancos podem cobrar taxas."
              },
              {
                      "question": "Como recuperar dinheiro de PIX errado?",
                      "answer": "Use o MED (Mecanismo Especial de Devolução) pelo seu banco em até 80 dias."
              }
      ]} />
    </ArticleLayout>
  );
};

export default PixTudoQuePrecisaSaber;