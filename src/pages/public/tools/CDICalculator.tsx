import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowRight, Calculator, Percent, Building2, Landmark } from 'lucide-react';
import SEO from '@/components/SEO';

const CDICalculator: React.FC = () => {
  const [amount, setAmount] = useState(10000);
  const [cdiPercent, setCdiPercent] = useState(100);
  const [months, setMonths] = useState(12);
  const [investmentType, setInvestmentType] = useState<'cdb' | 'lci' | 'lca'>('cdb');

  const CDI_ANNUAL = 14.9;

  const getIRRate = (m: number): number => {
    if (m <= 6) return 22.5;
    if (m <= 12) return 20;
    if (m <= 24) return 17.5;
    return 15;
  };

  const result = useMemo(() => {
    const monthlyRate = (Math.pow(1 + CDI_ANNUAL / 100, 1 / 12) - 1) * (cdiPercent / 100);
    let gross = amount;
    for (let i = 0; i < months; i++) { gross = gross * (1 + monthlyRate); }
    const grossProfit = gross - amount;
    const irRate = investmentType === 'cdb' ? getIRRate(months) : 0;
    const irAmount = grossProfit * (irRate / 100);
    const netProfit = grossProfit - irAmount;
    const netTotal = amount + netProfit;
    const effectiveRate = Math.pow(netTotal / amount, 12 / months) - 1;
    return { grossTotal: gross, grossProfit, irRate, irAmount, netProfit, netTotal, effectiveRate: effectiveRate * 100, monthlyRate: monthlyRate * 100 };
  }, [amount, cdiPercent, months, investmentType]);

  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const investments = [
    { id: 'cdb', name: 'CDB', icon: Building2, desc: 'Com IR' },
    { id: 'lci', name: 'LCI', icon: Landmark, desc: 'Isento IR' },
    { id: 'lca', name: 'LCA', icon: TrendingUp, desc: 'Isento IR' },
  ];

  return (
    <>
      <SEO title="Calculadora CDI 2026 - Simule CDB, LCI é LCA Gratis" description="Calcule rendimentos em CDI, CDB, LCI é LCA. Simulador com cálculo de IR automático. Descubra quanto seu dinheiro rende." canonical="/ferramentas/calculadora-cdi" keywords="calculadora cdi, simulador cdb, lci lca, quanto rende cdi" />
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden"><div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div><div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div></div>
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5"><div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between"><Link to="/" className="flex items-center gap-3"><img src="/stater-logo-96.webp" alt="Stater" className="w-9 h-9 rounded-xl" /><span className="text-2xl font-bold" style={{ fontFamily: "'Fredoka One', sans-serif", textShadow: '#3B82F6 2px 2px 0px, #1D4ED8 4px 4px 0px' }}>Stater</span></Link><div className="flex items-center gap-3"><Link to="/ferramentas" className="text-white/60 hover:text-white text-sm hidden sm:block">Ferramentas</Link><Link to="/login?view=register" className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg text-sm font-medium">Criar Conta</Link></div></div></header>
        <main className="relative z-10 pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <nav className="text-sm text-white/40 mb-6"><Link to="/" className="hover:text-white">Stater</Link> &gt; <Link to="/ferramentas" className="hover:text-white">Ferramentas</Link> &gt; <span className="text-white/70">Calculadora CDI</span></nav>
            <div className="flex items-center gap-4 mb-8"><div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center"><Percent className="w-7 h-7" /></div><div><h1 className="text-3xl sm:text-4xl font-bold">Calculadora CDI</h1><p className="text-white/50">Simule CDB, LCI é LCA com cálculo de IR</p></div></div>
            <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-2 mb-8"><p className="text-xs text-white/50 text-center">CDI atual: <span className="text-purple-400 font-bold">{CDI_ANNUAL}% a.a.</span> (Taxa Selic - 0.1%)</p></div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-slate-800 text-white border border-slate-600/10 rounded-2xl p-6 space-y-6">
                <div><p className="text-sm text-white/70 mb-3">Tipo de Investimento</p><div className="grid grid-cols-3 gap-2">{investments.map((inv) => (<button key={inv.id} onClick={() => setInvestmentType(inv.id as any)} className={investmentType === inv.id ? "p-4 rounded-xl border text-center transition-all bg-purple-900/300/20 border-purple-500" : "p-4 rounded-xl border text-center transition-all bg-slate-800/5 border-white/10 hover:border-white/20"}><inv.icon className="w-6 h-6 mx-auto mb-2" /><p className="font-medium text-sm">{inv.name}</p><p className="text-xs text-white/40">{inv.desc}</p></button>))}</div></div>
                <div><label className="flex items-center justify-between text-sm text-white/70 mb-2"><span>Valor a Investir</span><span className="text-purple-400 font-mono">{formatCurrency(amount)}</span></label><input type="range" min="1000" max="500000" step="1000" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full accent-purple-500" /><input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="w-full mt-2 bg-slate-800 text-white border border-slate-600/10 rounded-lg px-4 py-3 focus:border-purple-500 outline-none" /></div>
                <div><label className="flex items-center justify-between text-sm text-white/70 mb-2"><span>Rentabilidade (% do CDI)</span><span className="text-purple-400 font-mono">{cdiPercent}% do CDI</span></label><input type="range" min="80" max="150" value={cdiPercent} onChange={(e) => setCdiPercent(Number(e.target.value))} className="w-full accent-purple-500" /><div className="flex gap-2 mt-2">{[90, 100, 110, 120].map((p) => (<button key={p} onClick={() => setCdiPercent(p)} className={cdiPercent === p ? "flex-1 py-2 rounded-lg text-sm bg-purple-900/300 text-white" : "flex-1 py-2 rounded-lg text-sm bg-slate-800/5 hover:bg-slate-800/10"}>{p}%</button>))}</div></div>
                <div><label className="flex items-center justify-between text-sm text-white/70 mb-2"><span>Período</span><span className="text-purple-400">{months} meses ({(months / 12).toFixed(1)} anos)</span></label><input type="range" min="1" max="60" value={months} onChange={(e) => setMonths(Number(e.target.value))} className="w-full accent-purple-500" /></div>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 rounded-2xl p-6"><p className="text-white/60 text-sm mb-1">Valor Final Líquido</p><p className="text-4xl sm:text-5xl font-bold text-purple-400">{formatCurrency(result.netTotal)}</p><p className="text-sm text-white/40 mt-2">Rentabilidade efetiva: {result.effectiveRate.toFixed(2)}% a.a.</p></div>
                <div className="grid grid-cols-2 gap-4"><div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4"><p className="text-white/50 text-sm">Rendimento Bruto</p><p className="text-xl font-bold text-green-400">+{formatCurrency(result.grossProfit)}</p></div><div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4"><p className="text-white/50 text-sm">{investmentType === 'cdb' ? 'IR (' + result.irRate + '%)' : 'IR (Isento)'}</p><p className="text-xl font-bold text-red-400">{investmentType === 'cdb' ? '-' + formatCurrency(result.irAmount) : 'R$ 0,00'}</p></div></div>
                <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4"><p className="text-white/50 text-sm mb-3">Rendimento Líquido</p><p className="text-2xl font-bold text-purple-400">+{formatCurrency(result.netProfit)}</p><div className="mt-3 h-2 bg-slate-800 text-white rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: (result.netProfit / result.grossProfit) * 100 + '%' }}></div></div><p className="text-xs text-white/40 mt-2">Taxa mensal efetiva: {result.monthlyRate.toFixed(3)}% a.m.</p></div>
                {investmentType === 'cdb' && (<div className="bg-amber-900/300/10 border border-amber-500/20 rounded-xl p-4"><p className="text-sm text-amber-400 font-medium">Tabela Regressiva de IR</p><div className="mt-2 text-xs text-white/60 space-y-1"><p>Até 180 dias: 22.5%</p><p>181-360 dias: 20%</p><p>361-720 dias: 17.5%</p><p>Acima de 720 dias: 15%</p></div></div>)}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4"><p className="text-sm text-white/70 mb-3">Controle todos seus investimentos no Stater</p><Link to="/login?view=register" className="inline-flex items-center gap-2 bg-slate-800 text-white text-slate-900 font-medium px-4 py-2 rounded-lg text-sm hover:bg-slate-800 text-white/90 transition-colors">Criar Conta Gratis <ArrowRight className="w-4 h-4" /></Link></div>
              </div>
            </div>
            <article className="mt-16 space-y-8">
              <section><h2 className="text-2xl font-bold mb-4">O que é CDI?</h2><p className="text-white/70 leading-relaxed">O CDI (Certificado de Deposito Interbancário) é a taxa de juros que os bancos usam para emprestar dinheiro entre si. Ele é muito proximo da taxa Selic é serve como referência para a maioria dos investimentos de renda fixa no Brasil, como CDBs, LCIs é LCAs.</p></section>
              <section><h2 className="text-2xl font-bold mb-4">CDB vs LCI vs LCA</h2><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-white/10"><th className="text-left py-3 px-4"></th><th className="text-left py-3 px-4">CDB</th><th className="text-left py-3 px-4">LCI</th><th className="text-left py-3 px-4">LCA</th></tr></thead><tbody className="text-white/70"><tr className="border-b border-white/5"><td className="py-3 px-4 text-white">Imposto de Renda</td><td className="py-3 px-4">15% a 22.5%</td><td className="py-3 px-4 text-green-400">Isento</td><td className="py-3 px-4 text-green-400">Isento</td></tr><tr className="border-b border-white/5"><td className="py-3 px-4 text-white">FGC</td><td className="py-3 px-4">Sim, até 250k</td><td className="py-3 px-4">Sim, até 250k</td><td className="py-3 px-4">Sim, até 250k</td></tr><tr className="border-b border-white/5"><td className="py-3 px-4 text-white">Lastro</td><td className="py-3 px-4">Divida do banco</td><td className="py-3 px-4">Crédito imobiliário</td><td className="py-3 px-4">Agronegócio</td></tr></tbody></table></div></section>
            </article>
          </div>
        </main>
        <footer className="relative z-10 border-t border-white/5 py-8 px-4"><div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40"><p>2026 Stater. Todos os direitos reservados.</p><div className="flex gap-6"><Link to="/ferramentas" className="hover:text-white">Mais Ferramentas</Link><Link to="/privacy" className="hover:text-white">Privacidade</Link></div></div></footer>
      </div>
    </>
  );
};

export default CDICalculator;
