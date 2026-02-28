import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target, ArrowLeft, Calendar, Wallet, TrendingUp } from 'lucide-react';
import SEO from '@/components/SEO';

const CalculadoraMetas: React.FC = () => {
  const [meta, setMeta] = useState<number>(10000);
  const [prazo, setPrazo] = useState<number>(12);
  const [temInicial, setTemInicial] = useState<number>(0);
  const [rendimento, setRendimento] = useState<number>(0.8);
  
  const valorRestante = meta - temInicial;
  
  const calcularAporteSemRendimento = () => valorRestante / prazo;
  
  const calcularAporteComRendimento = () => {
    const taxaMensal = rendimento / 100;
    if (taxaMensal === 0) return valorRestante / prazo;
    const fator = Math.pow(1 + taxaMensal, prazo);
    return (valorRestante * taxaMensal) / (fator - 1);
  };
  
  const aporteSem = calcularAporteSemRendimento();
  const aporteCom = calcularAporteComRendimento();
  const economia = (aporteSem - aporteCom) * prazo;

  return (
    <>
      <SEO 
        title="Calculadora de Metas Financeiras - Quanto Poupar por Mês" 
        description="Descubra quanto você precisa guardar por mês para atingir seu objetivo financeiro. Calculadora gratuita é fácil."
        canonical="/ferramentas/calculadora-metas"
        keywords="calculadora metas, quanto poupar, planejamento financeiro, objetivo financeiro"
      />
      <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white">
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px]"></div>
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
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 mb-4">
                <Target className="w-8 h-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">Calculadora de Metas</h1>
              <p className="text-white/60">Descubra quanto poupar por mês para atingir seu objetivo</p>
            </div>
            
            <div className="bg-slate-800 text-white border border-slate-600/10 rounded-2xl p-6 mb-8">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-white/60 mb-2">Qual é a sua meta? (R$)</label>
                  <input type="number" value={meta} onChange={(e) => setMeta(Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Já tem guardado? (R$)</label>
                  <input type="number" value={temInicial} onChange={(e) => setTemInicial(Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Em quantos meses?</label>
                  <input type="number" value={prazo} onChange={(e) => setPrazo(Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500" />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">Rendimento esperado (% ao mês)</label>
                  <input type="number" step="0.1" value={rendimento} onChange={(e) => setRendimento(Number(e.target.value))} className="w-full bg-slate-800 text-white border border-slate-600/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500" />
                </div>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800 text-white border border-slate-600/10 rounded-2xl p-6 text-center">
                <Wallet className="w-10 h-10 text-white/40 mx-auto mb-3" />
                <p className="text-white/60 text-sm mb-1">Sem investir</p>
                <p className="text-2xl font-bold">R$ {aporteSem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-2xl p-6 text-center">
                <TrendingUp className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-emerald-300 text-sm mb-1">Investindo a {rendimento}% a.m.</p>
                <p className="text-2xl font-bold text-emerald-400">R$ {aporteCom.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</p>
              </div>
              <div className="bg-slate-800 text-white border border-slate-600/10 rounded-2xl p-6 text-center">
                <Calendar className="w-10 h-10 text-blue-400 mx-auto mb-3" />
                <p className="text-white/60 text-sm mb-1">Economia total</p>
                <p className="text-2xl font-bold text-blue-400">R$ {economia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-6 mb-8">
              <h3 className="font-bold text-lg mb-2">Dica de ouro</h3>
              <p className="text-white/70">Investindo seu dinheiro enquanto poupa, você economiza <strong className="text-emerald-400">R$ {economia.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> no total. É o poder dos juros compostos trabalhando para você!</p>
            </div>
            
            <div className="mt-12 bg-gradient-to-r from-rose-500/20 to-red-500/10 border border-rose-500/30 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-3">Acompanhe suas metas com inteligência</h2>
              <p className="text-white/60 mb-6">No Stater você cria metas, acompanha o progresso é recebe lembretes automáticos.</p>
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

export default CalculadoraMetas;
