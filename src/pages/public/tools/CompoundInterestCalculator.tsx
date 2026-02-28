import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, TrendingUp, Share2, ChevronDown } from 'lucide-react';
import SEO from '@/components/SEO';

const CompoundInterestCalculator: React.FC = () => {
  const [initial, setInitial] = useState(1000);
  const [monthly, setMonthly] = useState(500);
  const [rate, setRate] = useState(1);
  const [months, setMonths] = useState(60);
  const [showDetails, setShowDetails] = useState(false);

  const result = useMemo(() => {
    let total = initial;
    let totalInvested = initial;
    const monthlyRate = rate / 100;
    const history: { month: number; total: number; invested: number; profit: number }[] = [];
    for (let i = 1; i <= months; i++) {
      total = total * (1 + monthlyRate) + monthly;
      totalInvested += monthly;
      if (i % 12 === 0 || i === months) { history.push({ month: i, total, invested: totalInvested, profit: total - totalInvested }); }
    }
    return { finalAmount: total, totalInvested, totalProfit: total - totalInvested, history };
  }, [initial, monthly, rate, months]);

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const annualRate = ((Math.pow(1 + rate / 100, 12) - 1) * 100).toFixed(2);

  const shareResults = () => {
    const text = "Simulei no Stater: investindo " + formatCurrency(initial) + " + " + formatCurrency(monthly) + "/mes a " + rate + "% a.m. por " + months + " meses = " + formatCurrency(result.finalAmount) + "! Calcule: https://www.stater.app/ferramentas/calculadora-juros-compostos";
    if (navigator.share) { navigator.share({ title: 'Calculadora de Juros Compostos', text }); } else { navigator.clipboard.writeText(text); alert('Link copiado!'); }
  };

  return (
    <>
      <SEO title="Calculadora de Juros Compostos 2026 - Simulador Gratis" description="Calcule juros compostos online gratis. Simule rendimentos de CDB, Tesouro Direto, poupança é investimentos." canonical="/ferramentas/calculadora-juros-compostos" keywords="calculadora juros compostos, simulador investimento, quanto rende" />
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden"><div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px]"></div><div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div></div>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5"><div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between"><Link to="/" className="flex items-center gap-3"><img src="/stater-logo-96.webp" alt="Stater" className="w-9 h-9 rounded-xl" /><span className="text-2xl font-bold" style={{ fontFamily: "'Fredoka One', sans-serif", textShadow: '#3B82F6 2px 2px 0px, #1D4ED8 4px 4px 0px' }}>Stater</span></Link><div className="flex items-center gap-3"><Link to="/ferramentas" className="text-white/60 hover:text-white text-sm hidden sm:block">Ferramentas</Link><Link to="/login?view=register" className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg text-sm font-medium">Criar Conta</Link></div></div></header>
        <main className="relative z-10 pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <nav className="text-sm text-white/40 mb-6"><Link to="/" className="hover:text-white">Stater</Link> &gt; <Link to="/ferramentas" className="hover:text-white">Ferramentas</Link> &gt; <span className="text-white/70">Juros Compostos</span></nav>
            <div className="flex items-center gap-4 mb-8"><div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><Calculator className="w-7 h-7" /></div><div><h1 className="text-3xl sm:text-4xl font-bold">Calculadora de Juros Compostos</h1><p className="text-white/50">Simule o crescimento do seu dinheiro</p></div></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-slate-800 text-white border border-slate-600/10 rounded-2xl p-6 space-y-6">
                <div><label className="flex items-center justify-between text-sm text-white/70 mb-2"><span>Valor Inicial</span><span className="text-emerald-400 font-mono">{formatCurrency(initial)}</span></label><input type="range" min="0" max="100000" step="100" value={initial} onChange={(e) => setInitial(Number(e.target.value))} className="w-full accent-emerald-500" /><input type="number" value={initial} onChange={(e) => setInitial(Number(e.target.value))} className="w-full mt-2 bg-slate-800 text-white border border-slate-600/10 rounded-lg px-4 py-3 text-lg focus:border-emerald-500 outline-none" /></div>
                <div><label className="flex items-center justify-between text-sm text-white/70 mb-2"><span>Aporte Mensal</span><span className="text-emerald-400 font-mono">{formatCurrency(monthly)}</span></label><input type="range" min="0" max="10000" step="50" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="w-full accent-emerald-500" /><input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="w-full mt-2 bg-slate-800 text-white border border-slate-600/10 rounded-lg px-4 py-3 text-lg focus:border-emerald-500 outline-none" /></div>
                <div><label className="flex items-center justify-between text-sm text-white/70 mb-2"><span>Taxa de Juros (% ao mes)</span><span className="text-emerald-400 font-mono">{rate}% a.m. = {annualRate}% a.a.</span></label><input type="range" min="0.1" max="3" step="0.05" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full accent-emerald-500" /><input type="number" step="0.01" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full mt-2 bg-slate-800 text-white border border-slate-600/10 rounded-lg px-4 py-3 text-lg focus:border-emerald-500 outline-none" /></div>
                <div><label className="flex items-center justify-between text-sm text-white/70 mb-2"><span>Período</span><span className="text-emerald-400">{months} meses ({(months / 12).toFixed(1)} anos)</span></label><input type="range" min="6" max="360" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full accent-emerald-500" /></div>
                <div className="pt-4 border-t border-white/10 text-xs text-white/40 space-y-1"><p><strong>Exemplos de taxas:</strong></p><p>Poupança: ~0.5% a.m. | CDB 100% CDI: ~0.9% a.m. | Tesouro IPCA+: ~0.8% a.m.</p></div>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6"><p className="text-white/60 text-sm mb-1">Valor Final Estimado</p><p className="text-4xl sm:text-5xl font-bold text-emerald-400">{formatCurrency(result.finalAmount)}</p><button onClick={shareResults} className="mt-4 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"><Share2 className="w-4 h-4" /> Compartilhar resultado</button></div>
                <div className="grid grid-cols-2 gap-4"><div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4"><p className="text-white/50 text-sm">Total Investido</p><p className="text-xl font-bold">{formatCurrency(result.totalInvested)}</p></div><div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4"><p className="text-white/50 text-sm">Rendimento</p><p className="text-xl font-bold text-emerald-400">+{formatCurrency(result.totalProfit)}</p><p className="text-xs text-white/40">+{((result.totalProfit / result.totalInvested) * 100).toFixed(1)}%</p></div></div>
                <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl overflow-hidden"><button onClick={() => setShowDetails(!showDetails)} className="w-full p-4 flex items-center justify-between hover:bg-slate-800 text-white transition-colors"><span className="font-medium">Evolucao Anual</span><ChevronDown className={showDetails ? 'w-5 h-5 rotate-180 transition-transform' : 'w-5 h-5 transition-transform'} /></button>{showDetails && <div className="px-4 pb-4 space-y-2">{result.history.map((item) => (<div key={item.month} className="flex items-center justify-between text-sm py-2 border-t border-white/5"><span className="text-white/60">{item.month >= 12 ? Math.floor(item.month / 12) + ' ano' + (Math.floor(item.month / 12) > 1 ? 's' : '') : item.month + ' meses'}</span><div className="text-right"><p className="font-mono">{formatCurrency(item.total)}</p><p className="text-xs text-emerald-400">+{formatCurrency(item.profit)}</p></div></div>))}</div>}</div>
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4"><p className="text-sm text-white/70 mb-3">Acompanhe seus investimentos reais no Stater</p><Link to="/login?view=register" className="inline-flex items-center gap-2 bg-slate-800 text-white text-slate-900 font-medium px-4 py-2 rounded-lg text-sm hover:bg-slate-800 text-white/90 transition-colors">Criar Conta Gratis <ArrowRight className="w-4 h-4" /></Link></div>
              </div>
            </div>
            <article className="mt-16 space-y-8">
              <section><h2 className="text-2xl font-bold mb-4">O que sao Juros Compostos?</h2><p className="text-white/70 leading-relaxed">Juros compostos sao conhecidos como "juros sobre juros". Diferente dos juros simples, onde você ganha apenas sobre o valor inicial, nos juros compostos o rendimento é calculado sobre o montante total (capital + juros acumulados). Isso cria um efeito "bola de neve" que faz seu dinheiro crescer exponencialmente ao longo do tempo.</p></section>
              <section><h2 className="text-2xl font-bold mb-4">Formula dos Juros Compostos</h2><div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-6"><p className="text-2xl font-mono text-center mb-4 text-emerald-400">M = C x (1 + i)^t</p><ul className="space-y-2 text-white/70"><li><strong className="text-white">M</strong> = Montante final</li><li><strong className="text-white">C</strong> = Capital inicial</li><li><strong className="text-white">i</strong> = Taxa de juros (em decimal)</li><li><strong className="text-white">t</strong> = Tempo (número de períodos)</li></ul></div></section>
              <section><h2 className="text-2xl font-bold mb-4">Onde os Juros Compostos sao Aplicados?</h2><div className="grid sm:grid-cols-2 gap-4">{['CDB é CDI', 'Tesouro Direto', 'Fundos de Investimento', 'Ações (dividendos reinvestidos)', 'Previdência Privada', 'Staking de Criptomoedas'].map((item) => (<div key={item} className="flex items-center gap-3 bg-slate-800 text-white border border-slate-600/10 rounded-lg p-3"><TrendingUp className="w-5 h-5 text-emerald-400" /><span>{item}</span></div>))}</div></section>
            </article>
          </div>
        </main>
        <footer className="relative z-10 border-t border-white/5 py-8 px-4"><div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40"><p>2026 Stater. Todos os direitos reservados.</p><div className="flex gap-6"><Link to="/ferramentas" className="hover:text-white">Mais Ferramentas</Link><Link to="/privacy" className="hover:text-white">Privacidade</Link></div></div></footer>
      </div>
    </>
  );
};

export default CompoundInterestCalculator;
