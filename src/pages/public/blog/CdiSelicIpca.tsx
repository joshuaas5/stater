import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const CdiSelicIpca: React.FC = () => {
  return (
    <ArticleLayout title="CDI, Selic é IPCA: Entenda de Uma Vez por Todas" description="Explicação simples é definitiva dos principais indicadores econômicos que afetam seus investimentos." canonical="/blog/cdi-selic-ipca" keywords="cdi o que e, taxa selic, ipca inflação, indicadores econômicos" date="27 de Janeiro de 2026" readTime="6 min" relatedArticles={[{ title: 'Investir com Pouco Dinheiro', slug: 'investir-com-pouco-dinheiro' }, { title: 'Reserva de Emergência', slug: 'reserva-de-emergência' }]}>
      <p className="text-xl text-white/70 mb-8">Você ve esses termos em todo lugar mas nunca entendeu direito? Vou explicar de forma simples é definitiva.</p>
      <QuickSummary 
        variant="blue"
        items={[
          { label: 'Selic', value: 'Taxa básica de juros do Brasil - afeta todos os investimentos', icon: 'trend' },
          { label: 'CDI', value: ' Selic - é o benchmark da renda fixa (100% CDI = bom)', icon: 'target' },
          { label: 'IPCA', value: 'Inflação oficial - seu investimento deve render acima', icon: 'alert' },
          { label: 'Dica', value: 'Renda fixa boa = CDI ou Selic + alguma coisa', icon: 'lightbulb' },
        ]}
      />

      <h2 className="text-2xl font-bold mt-10 mb-4 text-blue-400">Taxa Selic</h2>
      <p className="text-white/70 mb-4">E a "taxa mae" da economia brasileira. Definida pelo Banco Central a cada 45 dias. Todas as outras taxas de juros do país são baseadas nela.</p>
      <div className="bg-blue-500/10 text-white border border-blue-500/20 rounded-xl p-4 mb-6">
        <p className="text-white font-medium">Selic atual: 15% ao ano (Fevereiro 2026)</p>
        <p className="text-white/50 text-sm mt-2">Quando a Selic sobe: empréstimos ficam caros, investimentos de renda fixa rendem mais</p>
        <p className="text-white/50 text-sm">Quando a Selic cai: crédito fica barato, renda fixa rende menos</p>
      </div>
      <h2 className="text-2xl font-bold mt-10 mb-4 text-purple-400">CDI (Certificado de Depósito Interbancário)</h2>
      <p className="text-white/70 mb-4">E a taxa que os bancos usam para emprestar dinheiro entre si. Na prática, é quase igual a Selic (sempre 0,10% menor).</p>
      <div className="bg-purple-500/10 text-white border border-purple-500/20 rounded-xl p-4 mb-6">
        <p className="text-white font-medium">Por que importa?</p>
        <p className="text-white/50 text-sm mt-2">A maioria dos investimentos de renda fixa rende "X% do CDI". Então quando você ve "CDB 100% CDI", significa que rende a taxa CDI cheia.</p>
      </div>
      <h2 className="text-2xl font-bold mt-10 mb-4 text-amber-400">IPCA (Inflação)</h2>
      <p className="text-white/70 mb-4">E o índice oficial de inflação do Brasil. Mede quanto os preços subiram no período. Se a inflação é 5% ao ano, seu dinheiro precisa render mais que isso para não perder valor.</p>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
        <p className="text-white font-medium">IPCA atual: 4,5% ao ano (2025)</p>
        <p className="text-white/50 text-sm mt-2">Investimentos "IPCA+" como Tesouro IPCA rendem a inflação + uma taxa fixa. Ex: IPCA+6% = 4,5% + 6% = 10,5% ao ano</p>
      </div>
      <h2 className="text-2xl font-bold mt-10 mb-4">Resumo prático</h2>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-white"><tr><th className="text-left py-3 px-4">Indicador</th><th className="text-left py-3 px-4">O que e</th><th className="text-left py-3 px-4">Valor atual</th></tr></thead>
          <tbody className="text-white/70">
            <tr className="border-t border-white/5"><td className="py-3 px-4 text-blue-400">Selic</td><td className="py-3 px-4">Taxa básica de juros</td><td className="py-3 px-4">15% a.a.</td></tr>
            <tr className="border-t border-white/5"><td className="py-3 px-4 text-purple-400">CDI</td><td className="py-3 px-4">Taxa entre bancos</td><td className="py-3 px-4">14,9% a.a.</td></tr>
            <tr className="border-t border-white/5"><td className="py-3 px-4 text-amber-400">IPCA</td><td className="py-3 px-4">Inflação oficial</td><td className="py-3 px-4">4,5% a.a.</td></tr>
          </tbody>
        </table>
      </div>
      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-xl p-6 mt-10">
        <h3 className="text-xl font-bold mb-2">O que você precisa saber</h3>
        <p className="text-white/70">Se seu investimento rende menos que o IPCA, você está PERDENDO dinheiro. Busque sempre rendimentos acima da inflação. Um CDB 100% CDI hoje rende mais que o dobro da inflação - ótimo negócio!</p>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "O que é CDI?",
                      "answer": "CDI (Certificado de Depósito Interbancário) é a taxa de juros que os bancos usam para emprestar entre si. Serve como referência para investimentos de renda fixa."
              },
              {
                      "question": "Qual a diferença entre Selic é CDI?",
                      "answer": "Selic é a taxa básica de juros definida pelo Banco Central. CDI acompanha a Selic de perto (geralmente 0,1% abaixo). Ambas afetam seus investimentos."
              },
              {
                      "question": "O que significa 100% do CDI?",
                      "answer": "Um investimento que rende 100% do CDI acompanha exatamente a taxa CDI. Com Selic a 15%, CDI fica em ~14,9%, então você ganha 14,9% ao ano."
              },
              {
                      "question": "Como o IPCA afeta meus investimentos?",
                      "answer": "IPCA é a inflação oficial. Se seus investimentos rendem menos que o IPCA, você está perdendo poder de compra. Busque rendimento real (acima da inflação)."
              }
      ]} />
    </ArticleLayout>
  );
};

export default CdiSelicIpca;