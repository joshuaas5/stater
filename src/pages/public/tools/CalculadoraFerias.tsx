import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowLeft, Plane, Sun, Calendar, DollarSign, AlertCircle } from 'lucide-react';

import { Helmet } from 'react-helmet-async';

const CalculadoraFerias: React.FC = () => {
  const [salárioBruto, setSalárioBruto] = useState<number>(3000);
  const [diasFerias, setDiasFerias] = useState<number>(30);
  const [vendeAbono, setVendeAbono] = useState<boolean>(false);
  const [dependentes, setDependentes] = useState<number>(0);
  
  const TETO_INSS_2026 = 8157.41;
  const DEDUCAO_DEPENDENTE = 189.59;

  const faixasINSS = [
    { ate: 1518.00, alíquota: 0.075 },
    { ate: 2793.88, alíquota: 0.09 },
    { ate: 4190.83, alíquota: 0.12 },
    { ate: 8157.41, alíquota: 0.14 },
  ];

  const faixasIR = [
    { ate: 2259.20, alíquota: 0, dedução: 0 },
    { ate: 2826.65, alíquota: 0.075, dedução: 169.44 },
    { ate: 3751.05, alíquota: 0.15, dedução: 381.44 },
    { ate: 4664.68, alíquota: 0.225, dedução: 662.77 },
    { ate: Infinity, alíquota: 0.275, dedução: 896.00 },
  ];

  const calcularINSS = (salário: number): number => {
    let inss = 0;
    let salárioRestante = Math.min(salário, TETO_INSS_2026);
    let faixaAnterior = 0;
    
    for (const faixa of faixasINSS) {
      if (salárioRestante <= 0) break;
      const baseCálculo = Math.min(salárioRestante, faixa.ate - faixaAnterior);
      inss += baseCálculo * faixa.alíquota;
      salárioRestante -= baseCálculo;
      faixaAnterior = faixa.ate;
    }
    return inss;
  };

  const calcularIR = (baseIR: number): number => {
    for (const faixa of faixasIR) {
      if (baseIR <= faixa.ate) {
        return Math.max(0, baseIR * faixa.alíquota - faixa.dedução);
      }
    }
    return 0;
  };

  const salárioDia = salárioBruto / 30;
  const feriasBruto = salárioDia * diasFerias;
  const tercoConstitucional = feriasBruto / 3;
  const abonoPecuniario = vendeAbono ? (salárioBruto / 3) + (salárioBruto / 9) : 0;
  
  const totalBruto = feriasBruto + tercoConstitucional + abonoPecuniario;
  const baseINSS = feriasBruto + tercoConstitucional;
  const inss = calcularINSS(baseINSS);
  const baseIR = baseINSS - inss - (dependentes * DEDUCAO_DEPENDENTE);
  const ir = calcularIR(baseIR);
  
  const totalLíquido = totalBruto - inss - ir;
  const diasDescansados = vendeAbono ? diasFerias - 10 : diasFerias;

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      <Helmet>
        <title>Calculadora de Férias 2026 | Quanto vou receber? | Stater</title>
        <meta name="description" content="Calcule suas férias CLT com 1/3 constitucional. Simule abono pecuniário, descontos de INSS é IR. Atualizado 2026." />
        <link rel="canonical" href="https://stfraga.com/ferramentas/calculadora-ferias" />
      </Helmet>
      
      <header className="bg-[#1a1a2e]/95 backdrop-blur-md border-b-4 border-emerald-400 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-3"><img src="/stater-logo-96.webp" alt="Stater" className="w-9 h-9 rounded-xl" /><span className="text-2xl font-bold uppercase" style={{ fontFamily: "'Fredoka One', sans-serif", textShadow: '#3B82F6 2px 2px 0px, #1D4ED8 4px 4px 0px' }}>Stater</span></Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/ferramentas" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 font-bold">
          <ArrowLeft size={20} /> Voltar para Ferramentas
        </Link>

        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-3xl p-8 mb-8 border-4 border-slate-600 shadow-[8px_8px_0px_0px_#000]">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-black/20 p-4 rounded-2xl">
              <Plane size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black">Calculadora de Férias</h1>
              <p className="text-white/70 font-medium">Com 1/3 constitucional  Tabelas 2026</p>
            </div>
          </div>
          <p className="text-lg text-white/80">Descubra quanto vai receber de férias é se vale a pena vender dias.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 text-white border-4 border-white/20 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#374151]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="text-emerald-400" /> Dados do seu salário
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-white/70 mb-2 font-medium">Salário bruto mensal (R$)</label>
                <input 
                  type="number" 
                  value={salárioBruto} 
                  onChange={(e) => setSalárioBruto(Number(e.target.value))}
                  className="w-full bg-slate-800 text-white border-2 border-white/20 rounded-xl px-4 py-3 text-xl font-bold focus:border-emerald-400 outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-white/70 mb-2 font-medium">Dias de férias</label>
                <div className="flex gap-2">
                  {[10, 15, 20, 30].map(d => (
                    <button 
                      key={d}
                      onClick={() => setDiasFerias(d)}
                      className={`flex-1 py-3 rounded-xl font-bold transition-all ${diasFerias === d ? 'bg-emerald-400 text-white' : 'bg-slate-800/10 hover:bg-slate-800/20'}`}
                    >
                      {d} dias
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-900/300/10 text-white border border-yellow-500/30 rounded-xl">
                <input 
                  type="checkbox" 
                  id="abono"
                  checked={vendeAbono}
                  onChange={(e) => setVendeAbono(e.target.checked)}
                  className="w-5 h-5 accent-yellow-400"
                />
                <label htmlFor="abono" className="text-white/70">
                  <span className="font-bold text-yellow-400">Vender 10 dias</span> (abono pecuniário)
                </label>
              </div>
              
              <div>
                <label className="block text-white/70 mb-2 font-medium">Número de dependentes</label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <button 
                      key={n}
                      onClick={() => setDependentes(n)}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all ${dependentes === n ? 'bg-emerald-400 text-white' : 'bg-slate-800/10 hover:bg-slate-800/20'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border-4 border-emerald-500 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#059669]">
              <p className="text-emerald-300 text-sm font-medium mb-1">Total líquido a receber</p>
              <p className="text-4xl font-black text-emerald-400">
                R$ {totalLíquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-emerald-300/60 text-sm mt-2">
                <Sun size={14} className="inline mr-1" /> {diasDescansados} dias de descanso
              </p>
            </div>

            <div className="bg-slate-800 text-white border-2 border-white/10 rounded-2xl p-4">
              <h3 className="font-bold text-white/80 mb-3">Composição das férias</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">Férias ({diasFerias} dias)</span>
                  <span className="text-white">R$ {feriasBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>(+) 1/3 constitucional</span>
                  <span>+ R$ {tercoConstitucional.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                {vendeAbono && (
                  <div className="flex justify-between text-yellow-400">
                    <span>(+) Abono pecuniário</span>
                    <span>+ R$ {abonoPecuniario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold border-t border-white/10 pt-2">
                  <span className="text-white">Total bruto</span>
                  <span className="text-white">R$ {totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800 text-white border-2 border-white/10 rounded-2xl p-4">
              <h3 className="font-bold text-white/80 mb-3">Descontos</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-red-400">
                  <span>(-) INSS</span>
                  <span>- R$ {inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>(-) IRRF</span>
                  <span>- R$ {ir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-white/10 pt-2">
                  <span className="text-white">Total líquido</span>
                  <span className="text-emerald-400">R$ {totalLíquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div className="bg-emerald-900/300/10 border-2 border-emerald-500/30 rounded-2xl p-5">
            <h3 className="font-bold text-emerald-400 mb-2 flex items-center gap-2">
              <Calendar size={18} /> Quando recebo?
            </h3>
            <p className="text-white/60 text-sm">
              O pagamento das férias deve ser feito <strong className="text-white">até 2 dias antes</strong> do início do período de descanso.
            </p>
          </div>
          <div className="bg-amber-900/300/10 text-white border-2 border-yellow-500/30 rounded-2xl p-5">
            <h3 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <AlertCircle size={18} /> Vale vender férias?
            </h3>
            <p className="text-white/60 text-sm">
              Abono pecuniário é <strong className="text-white">isento de IR</strong>. Pode valer a pena se você precisa do dinheiro.
            </p>
          </div>
        </div>

        <div className="mt-8 bg-blue-900/300/10 text-white border border-blue-500/30 rounded-2xl p-6">
          <h3 className="font-bold text-blue-400 mb-3"> Regras das férias CLT</h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <ul className="text-white/60 space-y-2">
              <li> Direito após 12 meses de trabalho</li>
              <li> Pode dividir em até 3 períodos</li>
              <li> Um período mínimo de 14 dias</li>
            </ul>
            <ul className="text-white/60 space-y-2">
              <li> Não pode começar em feriado/fim de semana</li>
              <li> Férias vencidas = pagamento em dobro</li>
              <li> Pode vender no máximo 10 dias</li>
            </ul>
          </div>
        </div>
      </main>
      
      
    </div>
  );
};

export default CalculadoraFerias;
