import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const EducaçãoFinanceiraCrianças: React.FC = () => {
  return (
    <ArticleLayout title="Educação Financeira para Crianças: Ensinando seu Filho sobre Dinheiro" description="Dicas práticas para criar filhos financeiramente inteligentes desde cedo. Aprenda a ensinar sobre dinheiro por idade." canonical="/blog/educação-financeira-crianças" keywords="educação financeira crianças, ensinar dinheiro filhos, mesada, crianças é dinheiro" date="28 de Janeiro de 2026" readTime="8 min" relatedArticles={[{ title: 'Regra 50-30-20', slug: 'regra-50-30-20' }, { title: 'Metas Financeiras SMART', slug: 'metas-financeiras' }]}>
      <p className="text-xl text-white/70 mb-8">Crianças que aprendem sobre dinheiro desde cedo se tornam adultos financeiramente saudáveis. Veja como ensinar em cada fase.</p>
      <QuickSummary 
        variant="purple"
        items={[
          { label: '3-5 anos', value: 'Conceito de dinheiro, cofrinho, esperar para comprar', icon: 'target' },
          { label: '6-10', value: 'Mesada, escolhas, poupança para objetivos', icon: 'money' },
          { label: '11-15', value: 'Conta própria, orçamento, juros compostos', icon: 'trend' },
          { label: 'Dica', value: 'Dê exemplo - crianças aprendem observando', icon: 'lightbulb' },
        ]}
      />

      <h2 className="text-2xl font-bold mt-10 mb-4">3 a 5 anos: Conceitos básicos</h2>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li>Mostre moedas é notas, explique que servem para comprar coisas</li>
        <li>Brinque de "lojinha" com produtos é preços</li>
        <li>Ensine que o dinheiro acaba - quando acabou, acabou</li>
        <li>Use cofrinhos transparentes para ver o dinheiro crescer</li>
      </ul>
      <h2 className="text-2xl font-bold mt-10 mb-4">6 a 10 anos: Mesada é escolhas</h2>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li>Comece a dar mesada semanal (idade x R$1 por semana)</li>
        <li>Deixe a criança decidir como gastar</li>
        <li>Ensine sobre poupar: "Se guardar 4 semanas, pode comprar X"</li>
        <li>Mostre a diferença entre "querer" é "precisar"</li>
      </ul>
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
        <p className="text-amber-400 font-medium">Dica: Divida o cofrinho em 3 partes: Gastar, Poupar, Doar</p>
      </div>
      <h2 className="text-2xl font-bold mt-10 mb-4">11 a 14 anos: Orcamento é metas</h2>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li>Aumente a mesada para mensal</li>
        <li>Inclua responsabilidades (material escolar, lanche)</li>
        <li>Ensine a fazer orçamento simples</li>
        <li>Abra uma conta digital no nome dele (com seu acompanhamento)</li>
        <li>Defina metas de médio prazo (videogame, celular)</li>
      </ul>
      <h2 className="text-2xl font-bold mt-10 mb-4">15 a 17 anos: Investimentos é trabalho</h2>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li>Explique como funcionam juros compostos</li>
        <li>Mostre investimentos simples (Tesouro Direto, CDB)</li>
        <li>Incentive primeiro emprego ou freelas</li>
        <li>Ensine sobre impostos é descontos</li>
        <li>Converse sobre faculdade, carreira é independência financeira</li>
      </ul>
      <h2 className="text-2xl font-bold mt-10 mb-4">Erros para evitar</h2>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li><strong className="text-red-400">Dar tudo que pede:</strong> Frustracao faz parte do aprendizado</li>
        <li><strong className="text-red-400">Esconder problemas financeiros:</strong> Crianças percebem é precisam entender</li>
        <li><strong className="text-red-400">Pagar por tarefas domésticas básicas:</strong> Isso é obrigação, não trabalho</li>
        <li><strong className="text-red-400">Cortar mesada como castigo:</strong> Mesada é ferramenta de ensino</li>
      </ul>
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/10 border border-blue-500/30 rounded-xl p-6 mt-10">
        <h3 className="text-xl font-bold mb-2">O melhor exemplo é você</h3>
        <p className="text-white/70">Crianças aprendem observando. Se você controla seus gastos, conversa sobre dinheiro abertamente é planeja antes de comprar, seu filho vai absorver esses hábitos naturalmente.</p>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Com que idade ensinar finanças para crianças?",
                      "answer": "A partir dos 3 anos com conceitos básicos (dinheiro compra coisas). Aos 6-7 anos pode começar mesada é aos 10+ explicar investimentos simples."
              },
              {
                      "question": "Criança deve ter mesada?",
                      "answer": "Sim, mesada é ferramenta educativa. Ensina a escolher, poupar é lidar com frustrações. Comece com valores pequenos é aumente com a idade."
              },
              {
                      "question": "Como ensinar criança a poupar?",
                      "answer": "Use cofrinhos transparentes para ver o progresso, defina metas com imagens (brinquedo desejado), é comemore quando alcançar."
              },
              {
                      "question": "Devo dar tudo que meu filho pede?",
                      "answer": "Não. Dizer não ensina sobre limites é escolhas. Deixe a criança desejar, poupar é valorizar as conquistas."
              }
      ]} />
    </ArticleLayout>
  );
};

export default EducaçãoFinanceiraCrianças;