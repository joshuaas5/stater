import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowLeft, TrendingDown, Calendar } from 'lucide-react';
import SEO from '@/components/SEO';

const CalculadoraInflação: React.FC = () => {
  const [valor, setValor] = useState<number>(1000);
  const [anoInicial, setAnoInicial] = useState<number>(2020);
  const [anoFinal, setAnoFinal] = useState<number>(2025);
  
  const inflaçãoAnual: Record<number, number> = {
    2015: 10.67, 2016: 6.29, 2017: 2.95, 2018: 3.75, 2019: 4.31,
    2020: 4.52, 2021: 10.06, 2022: 5.79, 2023: 4.62, 2024: 4.83, 2025: 4.50
  };
  
  const calcularInflação = () => {
    let acumulada = 1;
    for (let ano = anoInicial; ano < anoFinal; ano++) {
      const taxa = inflaçãoAnual[ano] || 4.5;
      acumulada *= (1 + taxa / 100);
    }
    return acumulada;
  };
  
  const fator = calcularInflação();
  const valorCorrigido = valor * fator;
  const perdaReal = valorCorrigido - valor;
  const percentualPerda = ((fator - 1) * 100);

  return (
    <>
      <SEO 
        title="Calculadora de Inflação - Correção Monetária" 
        description="Calcule quanto o real perdeu de valor ao longo dos anos. Veja a inflação acumulada é o poder de compra do seu dinheiro."
        canonical="/ferramentas/calculadora-inflação"
        keywords="calculadora inflação, IPCA acumulado, correção monetária, poder de compra"
      />
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        </div>
        
        <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/stater-logo-96.webp" alt="Stater" className="w-9 h-9 rounded-xl" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent" style={{ fontFamily: "'Fredoka One', sans-serif", textShadow: '#3B82F6 2px 2px 0px, #1D4ED8 4px 4px 0px' }}>Stater</span>
            </Link>
            <Link to="/ferramentas" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" /> Ferramentas
            </Link>
          </div>
        </header>
        
        <main className="relative z-10 pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 mb-4">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">Calculadora de Inflação</h1>
              <p className="text-white/60">Veja quanto o real perdeu de valor ao longo dos anos</p>
            </div>
            
            <div className="bg-slate-800 text-white border border-slate-600/10 rounded-2xl p-6 mb-8">
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Valor (R$)</label>
                  <input type="number" value={valor} onChange={(e) => setValor(Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">De (ano)</label>
                  <select value={anoInicial} onChange={(e) => setAnoInicial(Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500">
                    {Object.keys(inflaçãoAnual).map(ano => <option key={ano} value={ano} className="bg-slate-800">{ano}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Até (ano)</label>
                  <select value={anoFinal} onChange={(e) => setAnoFinal(Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500">
                    {Object.keys(inflaçãoAnual).map(ano => <option key={ano} value={ano} className="bg-slate-800">{ano}</option>)}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6 mb-8">
              <div className="bg-slate-800 text-white border border-slate-600/10 rounded-2xl p-6 text-center">
                <TrendingDown className="w-10 h-10 text-red-400 mx-auto mb-3" />
                <p className="text-white/60 text-sm mb-1">Inflação acumulada</p>
                <p className="text-3xl font-bold text-red-400">{percentualPerda.toFixed(2)}%</p>
              </div>
              <div className="bg-slate-800 text-white border border-slate-600/10 rounded-2xl p-6 text-center">
                <Calendar className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
                <p className="text-white/60 text-sm mb-1">Para ter o mesmo poder de compra</p>
                <p className="text-3xl font-bold text-cyan-400">R$ {valorCorrigido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-lg mb-2">O que isso significa?</h3>
              <p className="text-white/70">Se você tinha <strong className="text-white">R$ {valor.toLocaleString('pt-BR')}</strong> em {anoInicial}, precisaria ter <strong className="text-cyan-400">R$ {valorCorrigido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> em {anoFinal} para comprar as mesmas coisas. Você perdeu <strong className="text-red-400">R$ {perdaReal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> em poder de compra.</p>
            </div>
            
            <div className="mt-12 bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">Proteja seu dinheiro da inflação</h2>
              <p className="text-white/60 mb-6">O Stater te ajuda a investir de forma inteligente para não perder poder de compra.</p>
              <Link to="/login?view=register" className="inline-flex items-center gap-2 bg-slate-800 text-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-slate-800 text-white/90 transition-colors">
                Criar conta grátis
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default CalculadoraInflação;
