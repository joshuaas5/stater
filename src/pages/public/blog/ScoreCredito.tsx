import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from '@/components/ArticleLayout';
import QuickSummary from '@/components/QuickSummary';
import FAQSchema from '@/components/FAQSchema';

const ScoreCrédito: React.FC = () => {
  return (
    <ArticleLayout 
      title="Score de Crédito: Como Funciona é Como Aumentar em 2026" 
      description="Entenda o que é score de crédito, como é calculado é aprenda 10 estratégias para aumentar sua pontuação rapidamente." 
      canonical="/blog/score-crédito" 
      keywords="score de crédito, como aumentar score, pontuação serasa, score baixo, consultar score" 
      date="4 de Fevereiro de 2026" 
      readTime="12 min" 
      relatedArticles={[
        { title: 'Como Negociar Dívidas', slug: 'como-negociar-dividas' }, 
        { title: 'Cartão de Crédito: Vilão ou Aliado?', slug: 'cartao-de-crédito-vilao-ou-aliado' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Seu score de crédito é como sua <strong className="text-emerald-400">"nota de confiança"</strong> para o mercado. Ele determina se você consegue crédito, cartões é financiamentos - é a que taxa de juros.</p>
      <QuickSummary 
        variant="green"
        items={[
          { label: 'Bom', value: 'Acima de 700 pontos = crédito mais fácil é barato', icon: 'star' },
          { label: 'Sobe', value: 'Pagar em dia, ter contas no nome, tempo de histórico', icon: 'trend' },
          { label: 'Cai', value: 'Atraso, nome sujo, muitas consultas de crédito', icon: 'alert' },
          { label: 'Dica', value: 'Cadastro positivo ajuda - ative no Serasa/Boa Vista', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/10 border-2 border-blue-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-blue-400 mb-2"> O que é o Score?</h3>
        <p className="text-white/80">É uma pontuação de <strong>0 a 1000</strong> que indica a probabilidade de você pagar suas contas em dia nos próximos 12 meses. Quanto maior, melhor.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Faixas de Score é o que significam</h2>
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-4 bg-red-500/10 text-white border border-red-500/30 rounded-xl p-4">
          <div className="text-center min-w-[80px]">
            <p className="text-2xl font-black text-red-400">0-300</p>
            <p className="text-xs text-white/50">Muito baixo</p>
          </div>
          <div>
            <p className="text-white/70"> <strong>Alto risco.</strong> Dificuldade para conseguir qualquer crédito. Juros altíssimos.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-center min-w-[80px]">
            <p className="text-2xl font-black text-orange-400">301-500</p>
            <p className="text-xs text-white/50">Baixo</p>
          </div>
          <div>
            <p className="text-white/70"> <strong>Risco considerável.</strong> Pode conseguir crédito, mas com limites baixos é juros altos.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-yellow-500/10 text-white border border-yellow-500/30 rounded-xl p-4">
          <div className="text-center min-w-[80px]">
            <p className="text-2xl font-black text-yellow-400">501-700</p>
            <p className="text-xs text-white/50">Médio</p>
          </div>
          <div>
            <p className="text-white/70"> <strong>Risco moderado.</strong> Consegue crédito com condições médianas.</p>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
          <div className="text-center min-w-[80px]">
            <p className="text-2xl font-black text-emerald-400">701-1000</p>
            <p className="text-xs text-white/50">Excelente</p>
          </div>
          <div>
            <p className="text-white/70"> <strong>Baixo risco.</strong> Melhores taxas, limites altos, aprovação fácil.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Como o Score é calculado?</h2>
      <p className="text-white/70 mb-4">Os birôs de crédito (Serasa, SPC, Boa Vista) analisam vários fatores:</p>
      
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-500/10 text-white text-xs font-bold px-2 py-1 rounded">35%</span>
            <h4 className="font-bold text-white">Histórico de pagamento</h4>
          </div>
          <p className="text-white/60 text-sm">Paga em dia? Tem atrasos? Negativações?</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-500/10 text-white text-xs font-bold px-2 py-1 rounded">30%</span>
            <h4 className="font-bold text-white">Uso do crédito</h4>
          </div>
          <p className="text-white/60 text-sm">Quanto do limite você usa? Ideal: até 30%</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded">15%</span>
            <h4 className="font-bold text-white">Tempo de histórico</h4>
          </div>
          <p className="text-white/60 text-sm">Há quanto tempo você tem crédito no mercado?</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-orange-500/10 text-xs font-bold px-2 py-1 rounded">10%</span>
            <h4 className="font-bold text-white">Consultas recentes</h4>
          </div>
          <p className="text-white/60 text-sm">Muitas consultas = parece desesperado por crédito</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 sm:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-pink-500/10 text-xs font-bold px-2 py-1 rounded">10%</span>
            <h4 className="font-bold text-white">Mix de crédito</h4>
          </div>
          <p className="text-white/60 text-sm">Ter diferentes tipos (cartão, financiamento, etc.) mostra maturidade</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">10 Estratégias para aumentar o Score</h2>
      
      <div className="space-y-4 mb-8">
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1">1. Pague TUDO em dia</h4>
          <p className="text-white/60 text-sm">Mesmo R$10 atrasados prejudicam. Configure débito automático.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1">2. Quite dívidas negativadas</h4>
          <p className="text-white/60 text-sm">Use feirões como Serasa Limpa Nome para descontos de até 90%.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1">3. Use no máximo 30% do limite do cartão</h4>
          <p className="text-white/60 text-sm">Limite de R$5.000? Use no máximo R$1.500.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1">4. Cadastre seu CPF em contas (Cadastro Positivo)</h4>
          <p className="text-white/60 text-sm">Luz, água, telefone - pagamentos em dia contam a seu favor.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1">5. Mantenha dados atualizados</h4>
          <p className="text-white/60 text-sm">Endereço, telefone, e-mail atualizados no Serasa/SPC.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1">6. Não peça crédito demais</h4>
          <p className="text-white/60 text-sm">Cada consulta fica registrada. Espaçe pedidos de cartão/empréstimo.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1">7. Tenha um cartão de crédito (e use pouco)</h4>
          <p className="text-white/60 text-sm">Ter é não usar é melhor que não ter. Mostra disciplina.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1">8. Não cancele cartões antigos</h4>
          <p className="text-white/60 text-sm">Histórico longo é bom. Se não tem anuidade, deixe aberto.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1">9. Faça o Serasa Premium (opcional)</h4>
          <p className="text-white/60 text-sm">Monitora CPF, avisa consultas, pode acelerar aumento do score.</p>
        </div>
        <div className="bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-xl p-4">
          <h4 className="font-bold text-emerald-400 mb-1">10. Tenha paciência</h4>
          <p className="text-white/60 text-sm">Score não sobe da noite pro dia. São 3-6 meses de bons hábitos.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Onde consultar seu Score grátis?</h2>
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <a href="https://www.serasa.com.br" target="_blank" rel="noopener noreferrer" className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 text-center hover:border-blue-500/50 transition-colors">
          <p className="text-2xl mb-2"></p>
          <p className="font-bold text-white">Serasa</p>
          <p className="text-white/50 text-xs">serasa.com.br</p>
        </a>
        <a href="https://www.spcbrasil.org.br" target="_blank" rel="noopener noreferrer" className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 text-center hover:border-blue-500/50 transition-colors">
          <p className="text-2xl mb-2"></p>
          <p className="font-bold text-white">SPC Brasil</p>
          <p className="text-white/50 text-xs">spcbrasil.org.br</p>
        </a>
        <a href="https://www.consumidor.boavistaserviços.com.br" target="_blank" rel="noopener noreferrer" className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 text-center hover:border-blue-500/50 transition-colors">
          <p className="text-2xl mb-2"></p>
          <p className="font-bold text-white">Boa Vista</p>
          <p className="text-white/50 text-xs">boavistaserviços.com.br</p>
        </a>
      </div>

      <div className="bg-yellow-500/10 text-white border border-yellow-500/30 rounded-xl p-5 mb-8">
        <h4 className="font-bold text-yellow-400 mb-2"> Mitos sobre Score</h4>
        <ul className="text-white/70 space-y-2 text-sm">
          <li> "Consultar score baixa a pontuação" - <strong>FALSO.</strong> Você pode consultar à vontade.</li>
          <li> "Dá para comprar score alto" - <strong>GOLPE!</strong> Não existe isso.</li>
          <li> "Score 1000 garante aprovação" - <strong>FALSO.</strong> Cada banco tem critérios próprios.</li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-2 border-blue-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-2"> Quanto tempo demora para subir?</h3>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-emerald-400">30 dias</p>
            <p className="text-white/60 text-sm">Primeiras mudanças após quitar dívida</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-400">3-6 meses</p>
            <p className="text-white/60 text-sm">Aumento significativo com bons hábitos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-400">1-2 anos</p>
            <p className="text-white/60 text-sm">Para atingir score excelente (700+)</p>
          </div>
        </div>
      </div>
    
      <FAQSchema 
        faqs={[
          {
            question: "O que é score de credito?",
            answer: "E uma pontuacao de 0 a 1000 que indica seu risco de inadimplencia. Quanto maior o score, mais facil conseguir crédito com juros menores."
          },
          {
            question: "Como aumentar meu score?",
            answer: "Pague contas em dia, limpe dividas antigas, mantenha seu cadastro atualizado, use crédito de forma responsavel é ative o Cadastro Positivo."
          },
          {
            question: "Qual score é considerado bom?",
            answer: "Acima de 700 é considerado bom. Entre 500-700 é medio. Abaixo de 500 é baixo é pode dificultar aprovacao de credito."
          },
          {
            question: "Consultar o score diminui a pontuacao?",
            answer: "Nao! Voce pode consultar seu proprio score quantas vezes quiser sem afetar. O que pode diminuir é ter muitas consultas de EMPRESAS em pouco tempo."
          }
        ]}
      />
    </ArticleLayout>
  );
};

export default ScoreCrédito;