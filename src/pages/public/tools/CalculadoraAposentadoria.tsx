import { Link } from 'react-router-dom';
import React, { useState } from 'react';

const CalculadoraAposentadoria: React.FC = () => {
  const [idadeAtual, setIdadeAtual] = useState(30);
  const [idadeAposentadoria, setIdadeAposentadoria] = useState(65);
  const [rendaMensal, setRendaMensal] = useState(10000);
  const [patrimônioAtual, setPatrimônioAtual] = useState(50000);
  const [aporteMensal, setAporteMensal] = useState(1500);
  const [rentabilidade, setRentabilidade] = useState(8);
  const [inflação, setInflação] = useState(4);
  
  const calcular = () => {
    const anosAteAposentar = idadeAposentadoria - idadeAtual;
    const mesesAteAposentar = anosAteAposentar * 12;
    
    const rentabilidadeReal = ((1 + rentabilidade / 100) / (1 + inflação / 100) - 1);
    const taxaMensal = Math.pow(1 + rentabilidadeReal, 1/12) - 1;
    
    // Patrimônio acumulado
    let patrimônio = patrimônioAtual;
    for (let i = 0; i < mesesAteAposentar; i++) {
      patrimônio = patrimônio * (1 + taxaMensal) + aporteMensal;
    }
    
    // Renda mensal passiva (regra 4%)
    const rendaPassiva4 = patrimônio * 0.04 / 12;
    const rendaPassiva3 = patrimônio * 0.03 / 12;
    
    // Patrimônio necessário para manter renda atual
    const patrimônioNecessário = rendaMensal * 12 / 0.04;
    
    // Anos de renda garantidos
    const anosGarantidos = patrimônio / (rendaMensal * 12);
    
    // Gap (quanto falta por mes)
    const gap = rendaMensal - rendaPassiva4;
    
    return {
      patrimônioProjetado: patrimônio,
      rendaPassiva4,
      rendaPassiva3,
      patrimônioNecessário,
      anosGarantidos,
      gap: Math.max(0, gap),
      suficiente: rendaPassiva4 >= rendaMensal
    };
  };
  
  const resultado = calcular();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/stater-logo-96.webp" alt="Stater" className="w-9 h-9 rounded-xl" />
            <span className="text-2xl font-bold uppercase" style={{ fontFamily: "'Fredoka One', sans-serif", textShadow: '#3B82F6 2px 2px 0px, #1D4ED8 4px 4px 0px' }}>Stater</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/ferramentas" className="text-white/60 hover:text-white text-sm hidden sm:block">Ferramentas</Link>
            <Link to="/login?view=register" className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg text-sm font-medium">Criar Conta</Link>
          </div>
        </div>
      </header>
      <div className="pt-20 mb-4">
        <Link to="/ferramentas" className="text-emerald-400 hover:text-emerald-300 transition-colors"> Voltar para Ferramentas</Link>
      </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Calculadora de <span className="text-emerald-400">Aposentadoria</span>
          </h1>
          <p className="text-white/60 text-lg">Descubra se você vai conseguir se aposentar com conforto</p>
        </div>
        
        <div className="bg-slate-800 text-white backdrop-blur-sm border-4 border-white/20 rounded-3xl p-6 sm:p-8 mb-8">
          <h3 className="font-bold text-white mb-6 text-lg">Seus dados</h3>
          
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-white/60 text-sm mb-2">Idade atual</label>
              <input type="number" value={idadeAtual} onChange={(e) => setIdadeAtual(Number(e.target.value))} className="w-full bg-black/30 border-2 border-white/20 rounded-xl p-4 text-xl font-bold text-white focus:border-emerald-500 transition-colors" />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Idade que quer aposentar</label>
              <input type="number" value={idadeAposentadoria} onChange={(e) => setIdadeAposentadoria(Number(e.target.value))} className="w-full bg-black/30 border-2 border-white/20 rounded-xl p-4 text-xl font-bold text-white focus:border-emerald-500 transition-colors" />
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-white/60 text-sm mb-2">Renda mensal desejada na aposentadoria</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">R$</span>
                <input type="number" value={rendaMensal} onChange={(e) => setRendaMensal(Number(e.target.value))} className="w-full bg-black/30 border-2 border-white/20 rounded-xl p-4 pl-12 text-xl font-bold text-white focus:border-emerald-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Patrimônio atual investido</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">R$</span>
                <input type="number" value={patrimônioAtual} onChange={(e) => setPatrimônioAtual(Number(e.target.value))} className="w-full bg-black/30 border-2 border-white/20 rounded-xl p-4 pl-12 text-xl font-bold text-white focus:border-emerald-500 transition-colors" />
              </div>
            </div>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-white/60 text-sm mb-2">Aporte mensal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">R$</span>
                <input type="number" value={aporteMensal} onChange={(e) => setAporteMensal(Number(e.target.value))} className="w-full bg-black/30 border-2 border-white/20 rounded-xl p-4 pl-12 text-white focus:border-emerald-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Rentabilidade anual (%)</label>
              <input type="number" step="0.5" value={rentabilidade} onChange={(e) => setRentabilidade(Number(e.target.value))} className="w-full bg-black/30 border-2 border-white/20 rounded-xl p-4 text-white focus:border-emerald-500 transition-colors" />
            </div>
            <div>
              <label className="block text-white/60 text-sm mb-2">Inflação anual (%)</label>
              <input type="number" step="0.5" value={inflação} onChange={(e) => setInflação(Number(e.target.value))} className="w-full bg-black/30 border-2 border-white/20 rounded-xl p-4 text-white focus:border-emerald-500 transition-colors" />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-gradient-to-br from-emerald-600/30 to-blue-600/30 border-2 border-emerald-400 rounded-2xl p-6 text-center">
            <p className="text-white/60 text-sm mb-2">Patrimônio projetado aos {idadeAposentadoria} anos</p>
            <p className="text-4xl font-black text-emerald-400">
              R$ {resultado.patrimônioProjetado.toLocaleString('pt-BR', {maximumFractionDigits: 0})}
            </p>
            <p className="text-white/40 text-xs mt-2">Valores em reais de hoje (descontada inflação)</p>
          </div>
          
          <div className={`border-2 rounded-2xl p-6 text-center ${resultado.suficiente ? 'bg-emerald-900/300/20 border-emerald-500' : 'bg-red-900/300/20 border-red-500'}`}>
            <p className="text-white/60 text-sm mb-2">Status da aposentadoria</p>
            <p className={`text-2xl font-black ${resultado.suficiente ? 'text-emerald-400' : 'text-red-400'}`}>
              {resultado.suficiente ? 'VIAVEL!' : 'INSUFICIENTE'}
            </p>
            {!resultado.suficiente && (
              <p className="text-white/60 text-sm mt-2">Faltam R$ {resultado.gap.toLocaleString('pt-BR', {maximumFractionDigits: 0})}/mes</p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-800 text-white border-2 border-white/20 rounded-2xl p-5 text-center">
            <p className="text-white/60 text-sm mb-2">Renda passiva (regra 4%)</p>
            <p className="text-2xl font-bold text-white">
              R$ {resultado.rendaPassiva4.toLocaleString('pt-BR', {maximumFractionDigits: 0})}/mes
            </p>
          </div>
          <div className="bg-slate-800 text-white border-2 border-white/20 rounded-2xl p-5 text-center">
            <p className="text-white/60 text-sm mb-2">Renda conservadora (3%)</p>
            <p className="text-2xl font-bold text-white">
              R$ {resultado.rendaPassiva3.toLocaleString('pt-BR', {maximumFractionDigits: 0})}/mes
            </p>
          </div>
          <div className="bg-slate-800 text-white border-2 border-white/20 rounded-2xl p-5 text-center">
            <p className="text-white/60 text-sm mb-2">Anos de renda garantidos</p>
            <p className="text-2xl font-bold text-white">
              {resultado.anosGarantidos.toFixed(1)} anos
            </p>
          </div>
        </div>

        <div className="bg-blue-900/300/10 text-white border-2 border-blue-500 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-blue-400 mb-4">Patrimônio necessário para sua meta</h3>
          <p className="text-white/70 mb-4">
            Para ter R$ {rendaMensal.toLocaleString('pt-BR')}/mes de renda passiva (regra 4%), você precisa de:
          </p>
          <p className="text-3xl font-black text-blue-400 text-center">
            R$ {resultado.patrimônioNecessário.toLocaleString('pt-BR', {maximumFractionDigits: 0})}
          </p>
        </div>

        <div className="bg-slate-800 text-white border-2 border-white/20 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-white mb-4">O que é a Regra dos 4%?</h3>
          <p className="text-white/70 text-sm mb-4">
            Estudos mostram que você pode sacar 4% do patrimônio por ano sem acabar o dinheiro por pelo menos 30 anos. Exemplo: R$1 milhao permite sacar R$40.000/ano (R$3.333/mes).
          </p>
          <p className="text-white/70 text-sm">
            A regra dos 3% é mais conservadora é adequada para quem quer mais segurança ou planeja viver mais tempo da renda passiva.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-emerald-900/300/10 border-2 border-emerald-500 rounded-2xl p-6">
            <h3 className="font-bold text-emerald-400 mb-3">Como melhorar seu resultado</h3>
            <ul className="text-white/70 text-sm space-y-2">
              <li>- Aumente o aporte mensal</li>
              <li>- Comece a investir mais cedo</li>
              <li>- Busque investimentos com maior rentabilidade</li>
              <li>- Reduza gastos na aposentadoria</li>
              <li>- Trabalhe mais alguns anos</li>
            </ul>
          </div>
          <div className="bg-amber-900/300/10 text-white border-2 border-yellow-500 rounded-2xl p-6">
            <h3 className="font-bold text-yellow-400 mb-3">Não esqueca</h3>
            <ul className="text-white/70 text-sm space-y-2">
              <li>- INSS pode complementar sua renda</li>
              <li>- Previdência privada com benefício fiscal</li>
              <li>- Imóveis podem gerar aluguel</li>
              <li>- Dividendos de ações é FIIs</li>
              <li>- Possivel trabalho parcial</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-white/40 text-sm">
          <p>Simulação para fins de planejamento. Rentabilidade passada não garante retorno futuro.</p>
        </div>
      </div>
    </div>
  );
};

export default CalculadoraAposentadoria;
