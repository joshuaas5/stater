import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PiggyBank, ArrowLeft, TrendingUp, Percent, Calculator } from 'lucide-react';
import SEO from '@/components/SEO';

const SimuladorInvestimentos: React.FC = () => {
  const [valor, setValor] = useState<number>(1000);
  const [meses, setMeses] = useState<number>(12);
  const [aporte, setAporte] = useState<number>(100);
  
  const calcular = (taxa: number) => {
    let total = valor;
    for (let i = 0; i < meses; i++) {
      total = total * (1 + taxa / 100) + aporte;
    }
    return total;
  };
  
  const investimentos = [
    { nome: 'Poupança', taxa: 0.5, cor: 'from-gray-500 to-gray-600' },
    { nome: 'CDB 100% CDI', taxa: 0.9, cor: 'from-blue-500 to-blue-600' },
    { nome: 'Tesouro Selic', taxa: 0.95, cor: 'from-emerald-500 to-emerald-600' },
    { nome: 'LCI/LCA', taxa: 0.85, cor: 'from-purple-500 to-purple-600' },
    { nome: 'Fundo Multimercado', taxa: 1.1, cor: 'from-orange-500 to-orange-600' },
  ];

  return (
    <>
      <SEO 
        title="Simulador de Investimentos - Compare Rendimentos" 
        description="Compare quanto seu dinheiro rende na poupança, CDB, Tesouro Selic, LCI é LCA. Simulador gratuito é fácil de usar."
        canonical="/ferramentas/simulador-investimentos"
        keywords="simulador investimento, comparar investimentos, onde investir, melhor investimento"
      />
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-pink-600/10 rounded-full blur-[120px]"></div>
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 mb-4">
                <PiggyBank className="w-8 h-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">Simulador de Investimentos</h1>
              <p className="text-white/60">Compare onde seu dinheiro rende mais</p>
            </div>
            
            <div className="bg-slate-800 text-white border border-slate-600/10 rounded-2xl p-6 mb-8">
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Valor inicial (R$)</label>
                  <input type="number" value={valor} onChange={(e) => setValor(Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Aporte mensal (R$)</label>
                  <input type="number" value={aporte} onChange={(e) => setAporte(Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Período (meses)</label>
                  <input type="number" value={meses} onChange={(e) => setMeses(Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {investimentos.map((inv) => {
                const resultado = calcular(inv.taxa);
                const lucro = resultado - valor - (aporte * meses);
                return (
                  <div key={inv.nome} className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${inv.cor} flex items-center justify-center`}>
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-bold">{inv.nome}</h3>
                        <p className="text-sm text-white/50">{inv.taxa}% ao mês</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-400">R$ {resultado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <p className="text-sm text-white/50">Lucro: R$ {lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-12 bg-gradient-to-r from-purple-500/20 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">Organize todos os seus investimentos</h2>
              <p className="text-white/60 mb-6">No Stater você acompanha sua carteira completa com inteligência artificial.</p>
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

export default SimuladorInvestimentos;
