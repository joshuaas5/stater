import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from '@/components/ArticleLayout';
import QuickSummary from '@/components/QuickSummary';
import FAQSchema from '@/components/FAQSchema';

const ComoSairDasDividas: React.FC = () => {
  return (
    <ArticleLayout
      title="Como Sair das Dívidas: Guia Completo para Limpar seu Nome em 2026"
      description="Passo a passo para renegociar dívidas, limpar seu nome é recuperar sua saúde financeira de vez."
      canonical="/blog/como-sair-das-dividas"
      keywords="como sair das dívidas, limpar nome, renegociar dívida, serasa limpa nome"
      date="02 de Fevereiro de 2026"
      readTime="10 min"
      relatedArticles={[
        { title: 'Regra 50-30-20', slug: 'regra-50-30-20' },
        { title: 'Cartão de Crédito: Vilão ou Aliado?', slug: 'cartao-credito-vilao-aliado' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Estar endividado não é o fim do mundo. Com um plano estruturado, você pode sair dessa situação é reconstruir sua vida financeira.</p>

      <QuickSummary 
        variant="orange"
        items={[
          { label: 'Passo 1', value: 'Liste TODAS as suas dívidas (valor, juros, credor)', icon: 'target' },
          { label: 'Passo 2', value: 'Priorize as de juros mais altos (cartão rotativo)', icon: 'alert' },
          { label: 'Passo 3', value: 'Renegocie! Feirões dão até 99% de desconto', icon: 'money' },
          { label: 'Método', value: 'Bola de neve: quite as menores primeiro para ganhar motivação', icon: 'trend' },
        ]}
      />

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 1: Encare a realidade</h2>
      <p className="text-white/70 mb-4">O primeiro passo é o mais difícil: listar TODAS as suas dívidas. Muita gente evita olhar, mas você precisa saber o tamanho do problema.</p>
      <div className="bg-slate-800 border-4 border-slate-700 rounded-xl p-4 mb-6 shadow-[4px_4px_0px_0px_#334155]">
        <p className="text-white font-bold mb-2"> Liste para cada dívida:</p>
        <ul className="list-disc list-inside text-white/70 space-y-1">
          <li>Credor (banco, loja, pessoa)</li>
          <li>Valor total devido</li>
          <li>Taxa de juros</li>
          <li>Valor da parcela mínima</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 2: Priorize as dívidas certas</h2>
      <p className="text-white/70 mb-4">Nem todas as dívidas são iguais. Pague primeiro as que têm:</p>
      <ol className="list-decimal list-inside text-white/70 space-y-2 mb-6">
        <li><strong className="text-red-400">Juros mais altos</strong> - Cartão de crédito rotativo (400% a.a.!)</li>
        <li><strong className="text-amber-400">Garantias</strong> - Financiamento de carro/casa (podem tomar o bem)</li>
        <li><strong className="text-white">Essenciais</strong> - Luz, água, aluguel</li>
      </ol>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 3: Renegocie tudo</h2>
      <p className="text-white/70 mb-4">Os credores preferem receber algo do que nada. Use isso a seu favor:</p>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li><strong className="text-white">Serasa Limpa Nome:</strong> Descontos de até 99% em feirões</li>
        <li><strong className="text-white">Acordo direto:</strong> Ligue para o banco é peça desconto para quitação</li>
        <li><strong className="text-white">Portabilidade:</strong> Troque empréstimos caros por mais baratos</li>
      </ul>
      <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4 mb-6">
        <p className="text-emerald-400 font-medium"> Dica: Em janeiro é julho costumam ter os melhores feirões de renegociação!</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 4: Corte gastos radicalmente</h2>
      <p className="text-white/70 mb-4">Enquanto estiver pagando dívidas, entre em modo sobrevivência:</p>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li>Cancele TODAS as assinaturas</li>
        <li>Cozinhe todas as refeições</li>
        <li>Evite qualquer compra não essencial</li>
        <li>Busque renda extra (freela, bico, vender coisas)</li>
      </ul>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 5: Use o método bola de neve</h2>
      <p className="text-white/70 mb-4">Pague o mínimo de todas as dívidas, exceto a menor. Coloque todo dinheiro extra na menor até quitar. Depois, vá para a próxima.</p>
      <p className="text-white/70 mb-4">Esse método funciona porque você vê resultados rápidos, o que te motiva a continuar.</p>

      <h2 className="text-2xl font-bold mt-10 mb-4">Quanto tempo leva para sair das dívidas?</h2>
      <p className="text-white/70 mb-4">Depende do tamanho da dívida é da sua renda, mas com disciplina:</p>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-500/10 border-4 border-emerald-500 rounded-xl p-4 text-center shadow-[4px_4px_0px_0px_#10b981]">
          <p className="text-white/50 text-sm">Dívida pequena</p>
          <p className="text-2xl font-black text-emerald-400">3-6 meses</p>
          <p className="text-white/50 text-xs">até R$5.000</p>
        </div>
        <div className="bg-amber-500/10 border-4 border-amber-500 rounded-xl p-4 text-center shadow-[4px_4px_0px_0px_#f59e0b]">
          <p className="text-white/50 text-sm">Dívida média</p>
          <p className="text-2xl font-black text-amber-400">1-2 anos</p>
          <p className="text-white/50 text-xs">R$5.000-30.000</p>
        </div>
        <div className="bg-red-500/10 border-4 border-red-500 rounded-xl p-4 text-center shadow-[4px_4px_0px_0px_#ef4444]">
          <p className="text-white/50 text-sm">Dívida grande</p>
          <p className="text-2xl font-black text-red-400">2-5 anos</p>
          <p className="text-white/50 text-xs">acima de R$30.000</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Depois de quitar: nunca mais!</h2>
      <p className="text-white/70 mb-4">Sair das dívidas é só metade da batalha. Para não voltar:</p>
      <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
        <li>Monte uma reserva de emergência (3-6 meses de gastos)</li>
        <li>Use cartão de crédito só se pagar 100% da fatura</li>
        <li>Siga a regra 50-30-20 para organizar o orçamento</li>
        <li>Acompanhe seus gastos com um app como o <Link to="/login?view=register" className="text-blue-400 hover:underline font-bold">Stater</Link></li>
      </ul>

      <div className="bg-gradient-to-r from-orange-500/20 to-red-500/10 border-4 border-orange-500 rounded-xl p-6 mt-10 shadow-[4px_4px_0px_0px_#f97316]">
        <h3 className="text-xl font-bold mb-3 text-orange-400"> Comece sua jornada</h3>
        <p className="text-white/80 mb-4">Use o <Link to="/login?view=register" className="text-orange-400 hover:underline font-bold">Stater</Link> para organizar suas finanças é nunca mais cair em dívidas.</p>
        <Link to="/login?view=register" className="inline-block bg-orange-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-orange-600 transition">
          Organizar minhas finanças 
        </Link>
      </div>
    
      <FAQSchema 
        faqs={[
          {
            question: "Por onde comecar para sair das dividas?",
            answer: "Primeiro, liste TODAS as suas dividas com valor, juros é credor. Depois, priorize as de juros mais altos (cartao rotativo). Entao, renegocie é corte gastos."
          },
          {
            question: "Vale a pena renegociar dividas?",
            answer: "SIM! Em feiroes como Serasa Limpa Nome, você consegue descontos de até 99%. Os credores preferem receber algo do que nada."
          },
          {
            question: "Qual metodo usar para pagar dividas?",
            answer: "Use o metodo bola de neve: pague o mínimo de todas, é coloque todo extra na menor divida até quitar. A sensacao de progresso te motiva a continuar."
          },
          {
            question: "Quanto tempo leva para sair das dividas?",
            answer: "Depende do tamanho da divida é renda. Dividas pequenas: 3-6 meses. Medias: 1-2 anos. Grandes: 2-5 anos. Com disciplina é foco, você consegue!"
          },
          {
            question: "Devo pedir emprestimo para pagar dividas?",
            answer: "So faz sentido trocar divida cara (cartao 400% a.a.) por mais barata (emprestimo consignado 2% a.m.). Nunca pegue emprestimo novo para pagar sem reduzir juros."
          }
        ]}
      />
    </ArticleLayout>
  );
};

export default ComoSairDasDividas;
