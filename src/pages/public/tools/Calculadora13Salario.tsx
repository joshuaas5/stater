import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowLeft, Gift, DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

import { Helmet } from 'react-helmet-async';

const Calculadora13Salário: React.FC = () => {
  const [salárioBruto, setSalárioBruto] = useState<number>(3000);
  const [mesesTrabalhados, setMesesTrabalhados] = useState<number>(12);
  const [dependentes, setDependentes] = useState<number>(0);
  const [temAdiantamento, setTemAdiantamento] = useState<boolean>(false);
  
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

  const decimoTerceiroBruto = (salárioBruto * mesesTrabalhados) / 12;
  const inss = calcularINSS(decimoTerceiroBruto);
  const baseIR = decimoTerceiroBruto - inss - (dependentes * DEDUCAO_DEPENDENTE);
  const ir = calcularIR(baseIR);
  const decimoTerceiroLíquido = decimoTerceiroBruto - inss - ir;
  
  const primeiraParcela = decimoTerceiroBruto / 2;
  const segundaParcela = decimoTerceiroLíquido - (temAdiantamento ? primeiraParcela : 0);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      <Helmet>
        <title>Calculadora 13º Salário 2026 | Quanto vou receber? | Stater</title>
        <meta name="description" content="Calcule quanto vai receber de 13º salário em 2026. Simule parcelas, descontos de INSS é IR. Atualizado com tabelas 2026." />
        <link rel="canonical" href="https://stfraga.com/ferramentas/calculadora-13-salário" />
      </Helmet>
      
      <header className="bg-[#1a1a2e]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-3"><img src="/stater-logo-96.webp" alt="Stater" className="w-9 h-9 rounded-xl" /><span className="text-2xl font-bold uppercase" style={{ fontFamily: "'Fredoka One', sans-serif", textShadow: '#3B82F6 2px 2px 0px, #1D4ED8 4px 4px 0px' }}>Stater</span></Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/ferramentas" className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6 font-bold">
          <ArrowLeft size={20} /> Voltar para Ferramentas
        </Link>

        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-3xl p-8 mb-8 border-4 border-slate-600 shadow-[8px_8px_0px_0px_#000]">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-black/20 p-4 rounded-2xl">
              <Gift size={40} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black">Calculadora 13º Salário</h1>
              <p className="text-white/70 font-medium">Tabelas atualizadas 2026</p>
            </div>
          </div>
          <p className="text-lg text-white/80">Descubra quanto vai receber de décimo terceiro é quando cada parcela cai.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800 text-white border-4 border-white/20 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#374151]">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="text-yellow-400" /> Dados do seu salário
            </h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-white/70 mb-2 font-medium">Salário bruto mensal (R$)</label>
                <input 
                  type="number" 
                  value={salárioBruto} 
                  onChange={(e) => setSalárioBruto(Number(e.target.value))}
                  className="w-full bg-slate-800 text-white border-2 border-white/20 rounded-xl px-4 py-3 text-xl font-bold focus:border-yellow-400 outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-white/70 mb-2 font-medium">Meses trabalhados no ano</label>
                <input 
                  type="range" 
                  min="1" 
                  max="12" 
                  value={mesesTrabalhados} 
                  onChange={(e) => setMesesTrabalhados(Number(e.target.value))}
                  className="w-full h-3 rounded-full appearance-none bg-slate-800 text-white/20 accent-yellow-400"
                />
                <div className="flex justify-between text-sm text-white/50 mt-1">
                  <span>1 mês</span>
                  <span className="text-yellow-400 font-bold">{mesesTrabalhados} {mesesTrabalhados === 1 ? 'mês' : 'meses'}</span>
                  <span>12 meses</span>
                </div>
              </div>
              
              <div>
                <label className="block text-white/70 mb-2 font-medium">Número de dependentes</label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3, 4, 5].map(n => (
                    <button 
                      key={n}
                      onClick={() => setDependentes(n)}
                      className={`flex-1 py-2 rounded-xl font-bold transition-all ${dependentes === n ? 'bg-yellow-400 text-white' : 'bg-slate-800/10 hover:bg-slate-800/20'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-800 text-white rounded-xl">
                <input 
                  type="checkbox" 
                  id="adiantamento"
                  checked={temAdiantamento}
                  onChange={(e) => setTemAdiantamento(e.target.checked)}
                  className="w-5 h-5 accent-yellow-400"
                />
                <label htmlFor="adiantamento" className="text-white/70">Já recebi adiantamento (1ª parcela)</label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-4 border-emerald-500 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#059669]">
              <p className="text-emerald-300 text-sm font-medium mb-1">Seu 13º líquido total</p>
              <p className="text-4xl font-black text-emerald-400">
                R$ {decimoTerceiroLíquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-900/300/10 text-white border-2 border-blue-500/50 rounded-2xl p-4">
                <p className="text-blue-300 text-xs mb-1">1ª Parcela (até 30/nov)</p>
                <p className="text-xl font-black text-blue-400">
                  R$ {primeiraParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-blue-300/60 text-xs mt-1">Sem descontos</p>
              </div>
              <div className="bg-purple-900/300/10 text-white border-2 border-purple-500/50 rounded-2xl p-4">
                <p className="text-purple-300 text-xs mb-1">2ª Parcela (até 20/dez)</p>
                <p className="text-xl font-black text-purple-400">
                  R$ {segundaParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-purple-300/60 text-xs mt-1">Com descontos</p>
              </div>
            </div>

            <div className="bg-slate-800 text-white border-2 border-white/10 rounded-2xl p-4">
              <h3 className="font-bold text-white/80 mb-3">Detalhamento</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/50">13º bruto ({mesesTrabalhados}/12 avos)</span>
                  <span className="text-white">R$ {decimoTerceiroBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>(-) INSS</span>
                  <span>- R$ {inss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>(-) IRRF</span>
                  <span>- R$ {ir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-white/10 pt-2">
                  <span className="text-white">13º líquido</span>
                  <span className="text-emerald-400">R$ {decimoTerceiroLíquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4">
          <div className="bg-amber-900/300/10 text-white border-2 border-yellow-500/30 rounded-2xl p-5">
            <h3 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <Calendar size={18} /> Datas importantes
            </h3>
            <ul className="text-white/60 text-sm space-y-1">
              <li> <strong>1ª parcela:</strong> até 30 de novembro</li>
              <li> <strong>2ª parcela:</strong> até 20 de dezembro</li>
              <li> <strong>Parcela única:</strong> até 30 de novembro</li>
            </ul>
          </div>
          <div className="bg-blue-900/300/10 text-white border-2 border-blue-500/30 rounded-2xl p-5">
            <h3 className="font-bold text-blue-400 mb-2 flex items-center gap-2">
              <AlertCircle size={18} /> Quem tem direito?
            </h3>
            <ul className="text-white/60 text-sm space-y-1">
              <li> Trabalhadores CLT (carteira assinada)</li>
              <li> Domésticas, rurais, temporários</li>
              <li> Aposentados é pensionistas INSS</li>
              <li> MEI, PJ, autônomos não têm</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 bg-emerald-900/300/10 border border-emerald-500/30 rounded-2xl p-6">
          <h3 className="font-bold text-emerald-400 mb-3"> O que fazer com o 13º?</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl mb-1"></p>
              <p className="font-bold text-white text-sm">Quitar dívidas</p>
              <p className="text-white/50 text-xs">Prioridade se tiver</p>
            </div>
            <div className="text-center">
              <p className="text-2xl mb-1"></p>
              <p className="font-bold text-white text-sm">Reserva de emergência</p>
              <p className="text-white/50 text-xs">Se não tiver 6 meses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl mb-1"></p>
              <p className="font-bold text-white text-sm">Investir</p>
              <p className="text-white/50 text-xs">Faça render!</p>
            </div>
          </div>
        </div>
      </main>
      
      
    </div>
  );
};

export default Calculadora13Salário;
