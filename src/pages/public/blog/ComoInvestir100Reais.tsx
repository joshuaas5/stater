import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const ComoInvestir100Reais: React.FC = () => {
  return (
    <ArticleLayout 
      title="Como Começar a Investir com R$100: Guia Completo 2026" 
      description="Aprenda a dar os primeiros passos no mundo dos investimentos com apenas R$100. Opções seguras é rentáveis para iniciantes." 
      canonical="/blog/como-investir-100-reais" 
      keywords="como investir 100 reais, investir com pouco dinheiro, investimentos para iniciantes, primeiro investimento" 
      date="4 de Fevereiro de 2026" 
      readTime="12 min" 
      relatedArticles={[
        { title: 'Tesouro Direto para Iniciantes', slug: 'tesouro-direto-iniciantes' }, 
        { title: 'Reserva de Emergência', slug: 'reserva-de-emergência' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Você não precisa ser rico para começar a investir. Com apenas <strong className="text-emerald-400">R$100</strong> já é possível fazer seu dinheiro trabalhar para você. Neste guia, vou te mostrar exatamente como.</p>
      <QuickSummary 
        variant="green"
        items={[
          { label: 'Onde', value: 'Tesouro Direto aceita a partir de R$30', icon: 'target' },
          { label: 'Opções', value: 'CDB liquidez diária, Tesouro Selic, fundos de RF', icon: 'check' },
          { label: 'Evite', value: 'Cripto é ações no início - muito risco para pouco', icon: 'alert' },
          { label: 'Dica', value: 'R$100/mês por 20 anos a 10% = R$72.000+', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-2 border-emerald-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-emerald-400 mb-2"> A verdade que ninguém conta</h3>
        <p className="text-white/80">O maior erro de quem está começando é achar que precisa de muito dinheiro. <strong>R$100 investidos todo mês, com 10% ao ano, viram R$20.000 em 10 anos.</strong> O segredo é começar AGORA.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 1: Antes de investir, organize a casa</h2>
      <p className="text-white/70 mb-4">Não adianta investir se você tem dívidas com juros altos. Priorize:</p>
      <ol className="list-decimal list-inside text-white/70 space-y-2 mb-6">
        <li><strong className="text-white">Quite dívidas caras</strong> - Cartão de crédito (400% ao ano) é cheque especial (300% ao ano)</li>
        <li><strong className="text-white">Monte uma reserva mínima</strong> - Pelo menos R$500-1000 para emergências</li>
        <li><strong className="text-white">Organize seu orçamento</strong> - Saiba exatamente quanto entra é quanto sai</li>
      </ol>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 2: Onde investir R$100 (do mais seguro ao mais arriscado)</h2>
      
      <div className="space-y-4 mb-8">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">MAIS SEGURO</span>
            <h3 className="text-lg font-bold text-white">1. Tesouro Selic</h3>
          </div>
          <p className="text-white/70 mb-2">O investimento mais seguro do Brasil. Garantido pelo governo federal.</p>
          <ul className="text-white/60 text-sm space-y-1">
            <li> Mínimo: R$30</li>
            <li> Rendimento: ~13% ao ano (Selic atual)</li>
            <li> Liquidez: D+1 (resgata em 1 dia útil)</li>
            <li> Ideal para: Reserva de emergência</li>
          </ul>
        </div>

        <div className="bg-blue-500/10 text-white border border-blue-500/30 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-500/10 text-white text-xs font-bold px-2 py-1 rounded">SEGURO</span>
            <h3 className="text-lg font-bold text-white">2. CDB de Banco Digital</h3>
          </div>
          <p className="text-white/70 mb-2">Nubank, Inter, PicPay oferecem CDBs com liquidez diária.</p>
          <ul className="text-white/60 text-sm space-y-1">
            <li> Mínimo: R$1</li>
            <li> Rendimento: 100-110% do CDI</li>
            <li> Liquidez: Imédiata</li>
            <li> Protegido pelo FGC até R$250.000</li>
          </ul>
        </div>

        <div className="bg-purple-500/10 text-white border border-purple-500/30 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-purple-500/10 text-white text-xs font-bold px-2 py-1 rounded">MODERADO</span>
            <h3 className="text-lg font-bold text-white">3. Fundos de Investimento</h3>
          </div>
          <p className="text-white/70 mb-2">Fundos DI ou Renda Fixa com taxa zero em corretoras.</p>
          <ul className="text-white/60 text-sm space-y-1">
            <li> Mínimo: R$100</li>
            <li> Diversificação automática</li>
            <li> Gestão profissional</li>
            <li> Cuidado com taxas de administração altas</li>
          </ul>
        </div>

        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-orange-500/10 text-xs font-bold px-2 py-1 rounded">MAIS RISCO</span>
            <h3 className="text-lg font-bold text-white">4. ETFs (Fundos de Índice)</h3>
          </div>
          <p className="text-white/70 mb-2">BOVA11 (Ibovespa) ou IVVB11 (S&P 500 em reais).</p>
          <ul className="text-white/60 text-sm space-y-1">
            <li> Mínimo: ~R$100 (1 cota)</li>
            <li> Diversificação em dezenas de empresas</li>
            <li> Taxa baixíssima (0,1-0,3% ao ano)</li>
            <li> Renda variável - pode oscilar</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 3: Abra conta em uma corretora (grátis)</h2>
      <p className="text-white/70 mb-4">As melhores corretoras para iniciantes são gratuitas:</p>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 text-center">
          <p className="font-bold text-white mb-1">Nubank</p>
          <p className="text-white/50 text-sm">CDB, Tesouro, fundos. Mais simples.</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 text-center">
          <p className="font-bold text-white mb-1">Rico/XP</p>
          <p className="text-white/50 text-sm">Mais opções, ações, FIIs.</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 text-center">
          <p className="font-bold text-white mb-1">Inter</p>
          <p className="text-white/50 text-sm">Banco + corretora. Prático.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Simulação: R$100/mês por 10 anos</h2>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-6 mb-8">
        <p className="text-white/70 mb-4">Investindo R$100 todo mês:</p>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/70">Poupança (6% a.a.)</span>
            <span className="text-white font-bold">R$16.387</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">CDB 100% CDI (10% a.a.)</span>
            <span className="text-emerald-400 font-bold">R$20.484</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/70">Tesouro IPCA+ (IPCA+6%)</span>
            <span className="text-blue-400 font-bold">R$22.103</span>
          </div>
        </div>
        <p className="text-white/50 text-sm mt-4">* Valores aproximados, sem considerar IR</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Erros que iniciantes cometem (evite!)</h2>
      <div className="bg-red-500/10 text-white border border-red-500/30 rounded-xl p-5 mb-8">
        <ul className="text-white/70 space-y-2">
          <li> <strong className="text-red-400">Esperar ter "dinheiro sobrando"</strong> - Nunca vai sobrar, separe primeiro</li>
          <li> <strong className="text-red-400">Deixar na poupança</strong> - Perde para inflação</li>
          <li> <strong className="text-red-400">Investir sem reserva de emergência</strong> - Vai precisar resgatar na hora errada</li>
          <li> <strong className="text-red-400">Seguir "dicas quentes"</strong> - Day trade, cripto duvidosa, promessas de lucro rápido</li>
          <li> <strong className="text-red-400">Não estudar</strong> - Invista tempo antes de investir dinheiro</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Minha recomendação para você</h2>
      <p className="text-white/70 mb-4">Se você tem R$100 é nunca investiu:</p>
      <ol className="list-decimal list-inside text-white/70 space-y-2 mb-6">
        <li>Abra conta no <strong className="text-white">Nubank ou Inter</strong> (mais fácil)</li>
        <li>Coloque os R$100 em <strong className="text-white">CDB com liquidez diária</strong></li>
        <li>Mês que vem, coloque mais R$100</li>
        <li>Quando tiver R$1.000, diversifique para Tesouro Selic</li>
        <li>Com R$5.000+, considere ETFs se tiver estômago para volatilidade</li>
      </ol>

      <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-2 border-blue-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-2"> O mais importante</h3>
        <p className="text-white/80">Não importa se são R$100 ou R$10.000. O que importa é <strong className="text-yellow-400">COMEÇAR</strong> é ser <strong className="text-yellow-400">CONSISTENTE</strong>. Quem investe R$100/mês por 30 anos, vira milionário. Quem fica esperando, não vira nada.</p>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Dá para investir com apenas R$ 100?",
                      "answer": "Sim! Tesouro Direto aceita a partir de R$ 30. CDBs é LCIs a partir de R$ 1. ETFs é ações fracionárias também."
              },
              {
                      "question": "Onde investir R$ 100 por mês?",
                      "answer": "Opções: Tesouro Selic (segurança), CDB 100% CDI (liquidez), ETFs como BOVA11 (diversificação) ou ações fracionárias."
              },
              {
                      "question": "Quanto R$ 100/mês viram em 10 anos?",
                      "answer": "A 10% ao ano: aproximadamente R$ 20.000. A 12% ao ano: cerca de R$ 23.000. O tempo é a consistência são poderosos."
              },
              {
                      "question": "Qual o melhor investimento para iniciante?",
                      "answer": "Tesouro Selic para reserva de emergência. Depois, diversifique com CDBs, fundos de índice é ações gradualmente."
              }
      ]} />
    </ArticleLayout>
  );
};

export default ComoInvestir100Reais;