import React, { useState } from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const IndependênciaFinanceira: React.FC = () => {
  const [idade, setIdade] = useState<number>(30);
  const [gastoMensal, setGastoMensal] = useState<number>(5000);
  const [investido, setInvestido] = useState<number>(50000);
  const [aporteMensal, setAporteMensal] = useState<number>(2000);
  
  const necessárioFIRE = gastoMensal * 12 * 25;
  const falta = Math.max(0, necessárioFIRE - investido);
  const rendaPassiva = investido * 0.004;
  const percentual = Math.min(100, (investido / necessárioFIRE) * 100);
  
  const calcularAnosRestantes = () => {
    if (aporteMensal <= 0) return Infinity;
    let patrimônio = investido;
    let anos = 0;
    const taxaMensal = 0.008;
    while (patrimônio < necessárioFIRE && anos < 60) {
      patrimônio = patrimônio * (1 + taxaMensal) + aporteMensal;
      anos += 1/12;
    }
    return Math.ceil(anos);
  };
  
  const anosRestantes = calcularAnosRestantes();
  const idadeFIRE = idade + anosRestantes;

  return (
    <ArticleLayout 
      title="Independência Financeira: O Guia Completo para Viver de Renda em 2026" 
      description="Aprenda o que é FIRE, quanto você precisa para se aposentar cedo é como calcular seu número mágico." 
      canonical="/blog/independência-financeira" 
      keywords="independência financeira, FIRE, viver de renda, aposentadoria antecipada, quanto preciso para aposentar" 
      date="4 de Fevereiro de 2026" 
      readTime="15 min" 
      relatedArticles={[
        { title: 'Tesouro Direto para Iniciantes', slug: 'tesouro-direto-iniciantes' }, 
        { title: 'Como Investir com R$100', slug: 'como-investir-100-reais' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Imagine acordar todo dia sabendo que você <strong className="text-emerald-400">não precisa trabalhar</strong> por dinheiro. Isso é independência financeira - é é mais acessível do que você imagina.</p>
      <QuickSummary 
        variant="green"
        items={[
          { label: 'Meta', value: 'Patrimônio = 25x seus gastos anuais (regra dos 4%)', icon: 'target' },
          { label: 'Tempo', value: 'Taxa de poupança de 50% = ~17 anos para IF', icon: 'clock' },
          { label: 'Invista', value: 'Diversifique: ações, FIIs, renda fixa, internacional', icon: 'trend' },
          { label: 'FIRE', value: 'Financial Independence, Retire Early - é possível!', icon: 'star' },
        ]}
      />

      
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/10 border-2 border-purple-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-purple-400 mb-2"> O que é o movimento FIRE?</h3>
        <p className="text-white/80"><strong>F</strong>inancial <strong>I</strong>ndependence, <strong>R</strong>etire <strong>E</strong>arly = Independência Financeira, Aposentadoria Antecipada.</p>
        <p className="text-white/60 text-sm mt-2">Não significa parar de trabalhar - significa ter a <em>liberdade de escolher</em> se quer ou não trabalhar.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Simulador FIRE</h2>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-2xl p-6 mb-8">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-white/70 mb-2 text-sm">Sua idade atual</label>
            <input 
              type="number" 
              value={idade} 
              onChange={(e) => setIdade(Number(e.target.value))}
              className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white font-bold"
            />
          </div>
          <div>
            <label className="block text-white/70 mb-2 text-sm">Gasto mensal desejado (R$)</label>
            <input 
              type="number" 
              value={gastoMensal} 
              onChange={(e) => setGastoMensal(Number(e.target.value))}
              className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white font-bold"
            />
          </div>
          <div>
            <label className="block text-white/70 mb-2 text-sm">Já investido (R$)</label>
            <input 
              type="number" 
              value={investido} 
              onChange={(e) => setInvestido(Number(e.target.value))}
              className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white font-bold"
            />
          </div>
          <div>
            <label className="block text-white/70 mb-2 text-sm">Aporte mensal (R$)</label>
            <input 
              type="number" 
              value={aporteMensal} 
              onChange={(e) => setAporteMensal(Number(e.target.value))}
              className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white font-bold"
            />
          </div>
        </div>
        
        <div className="bg-black/30 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white/60 text-sm">Progresso para FIRE</span>
            <span className="text-emerald-400 font-bold">{percentual.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-slate-800 text-white rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all" style={{ width: `${percentual}%` }}></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-purple-500/10 text-white rounded-xl p-3 text-center">
            <p className="text-purple-300 text-xs mb-1">Você precisa de</p>
            <p className="text-lg font-black text-purple-400">R$ {(necessárioFIRE/1000000).toFixed(2)}M</p>
          </div>
          <div className="bg-red-500/10 text-white rounded-xl p-3 text-center">
            <p className="text-red-300 text-xs mb-1">Ainda falta</p>
            <p className="text-lg font-black text-red-400">R$ {(falta/1000).toFixed(0)}k</p>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-3 text-center">
            <p className="text-emerald-300 text-xs mb-1">Renda passiva atual</p>
            <p className="text-lg font-black text-emerald-400">R$ {rendaPassiva.toFixed(0)}/mês</p>
          </div>
          <div className="bg-blue-500/10 text-white rounded-xl p-3 text-center">
            <p className="text-blue-300 text-xs mb-1">FIRE aos</p>
            <p className="text-lg font-black text-blue-400">{anosRestantes > 50 ? '60+' : idadeFIRE} anos</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">A regra dos 4% (ou 25x)</h2>
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 mb-6">
        <p className="text-white/70 mb-3">A base do movimento FIRE é simples:</p>
        <div className="bg-black/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-black text-emerald-400 mb-1">Patrimônio necessário = Gasto anual  25</p>
          <p className="text-white/50 text-sm">ou: Retire 4% ao ano que seu dinheiro nunca acaba</p>
        </div>
      </div>

      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 mb-8">
        <h4 className="font-bold text-white mb-3">Exemplo prático:</h4>
        <ul className="text-white/70 space-y-2">
          <li> Quer viver com <strong className="text-white">R$5.000/mês</strong> = R$60.000/ano</li>
          <li> Precisa de: R$60.000  25 = <strong className="text-emerald-400">R$1.500.000</strong></li>
          <li> Retirando 4% ao ano: R$1.500.000  4% = R$60.000</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Variantes do FIRE</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-red-500/10 text-white border border-red-500/30 rounded-xl p-5">
          <h4 className="font-bold text-red-400 mb-2"> Fat FIRE</h4>
          <p className="text-white/60 text-sm">Aposentar com alto padrão de vida. Gasto R$15.000+/mês. Precisa de R$4.5M+.</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-5">
          <h4 className="font-bold text-orange-400 mb-2"> Lean FIRE</h4>
          <p className="text-white/60 text-sm">Aposentar com estilo mínimalista. Gasto R$2.500/mês. Precisa de ~R$750k.</p>
        </div>
        <div className="bg-yellow-500/10 text-white border border-yellow-500/30 rounded-xl p-5">
          <h4 className="font-bold text-yellow-400 mb-2"> Coast FIRE</h4>
          <p className="text-white/60 text-sm">Investir forte cedo, deixar render. Trabalhar só para gastos atuais.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <h4 className="font-bold text-emerald-400 mb-2"> Barista FIRE</h4>
          <p className="text-white/60 text-sm">Semi-aposentado. Trabalho leve cobre gastos, investimentos crescem.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">5 passos para alcançar FIRE</h2>
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-4 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-purple-500/10 text-white text-lg font-black w-8 h-8 rounded-full flex items-center justify-center">1</span>
          <div>
            <p className="font-bold text-white">Calcule seu número</p>
            <p className="text-white/60 text-sm">Gasto mensal  12  25. Esse é seu alvo.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-purple-500/10 text-white text-lg font-black w-8 h-8 rounded-full flex items-center justify-center">2</span>
          <div>
            <p className="font-bold text-white">Aumente sua taxa de poupança</p>
            <p className="text-white/60 text-sm">Ideal: 50%+ da renda. Quanto mais, mais rápido.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-purple-500/10 text-white text-lg font-black w-8 h-8 rounded-full flex items-center justify-center">3</span>
          <div>
            <p className="font-bold text-white">Invista de forma inteligente</p>
            <p className="text-white/60 text-sm">ETFs globais, ações, FIIs. Diversifique é deixe o tempo trabalhar.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-purple-500/10 text-white text-lg font-black w-8 h-8 rounded-full flex items-center justify-center">4</span>
          <div>
            <p className="font-bold text-white">Otimize impostos</p>
            <p className="text-white/60 text-sm">Use previdência privada, isenção de FIIs, tabela regressiva.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 bg-slate-800 text-white rounded-xl p-4">
          <span className="bg-purple-500/10 text-white text-lg font-black w-8 h-8 rounded-full flex items-center justify-center">5</span>
          <div>
            <p className="font-bold text-white">Mantenha a consistência</p>
            <p className="text-white/60 text-sm">Aportes regulares por anos. Não tente atalhos.</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-2 border-purple-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-3"> A matemática que muda tudo</h3>
        <p className="text-white/70 mb-4">Sua taxa de poupança importa mais que seu salário:</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-red-400">10%</p>
            <p className="text-white/50 text-xs">poupança = 51 anos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">30%</p>
            <p className="text-white/50 text-xs">poupança = 28 anos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">50%</p>
            <p className="text-white/50 text-xs">poupança = 17 anos</p>
          </div>
        </div>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Quanto preciso para independência financeira?",
                      "answer": "Uma regra comum é ter 25x seus gastos anuais investidos (regra dos 4%). Se gasta R$ 5.000/mês, precisa de R$ 1.500.000."
              },
              {
                      "question": "É possível alcançar independência financeira ganhando pouco?",
                      "answer": "Sim, mas leva mais tempo. O segredo é maximizar a taxa de poupança é investir consistentemente."
              },
              {
                      "question": "O que é o movimento FIRE?",
                      "answer": "FIRE (Financial Independence, Retire Early) busca independência financeira cedo através de alta taxa de poupança (50%+) é investimentos."
              },
              {
                      "question": "Em quanto tempo posso alcançar independência financeira?",
                      "answer": "Depende da taxa de poupança: 10% = ~51 anos, 25% = ~32 anos, 50% = ~17 anos, 75% = ~7 anos."
              }
      ]} />
    </ArticleLayout>
  );
};

export default IndependênciaFinanceira;