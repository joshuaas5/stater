import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Calculator, TrendingDown, AlertTriangle } from 'lucide-react';

const SimuladorFinanciamento: React.FC = () => {
  const [valorImóvel, setvalorImóvel] = useState<string>('400000');
  const [entrada, setEntrada] = useState<string>('80000');
  const [prazo, setPrazo] = useState<string>('360');
  const [taxaAnual, setTaxaAnual] = useState<string>('10.5');
  const [sistema, setSistema] = useState<'sac' | 'price'>('sac');

  const calcular = () => {
    const valor = parseFloat(valorImóvel) || 0;
    const ent = parseFloat(entrada) || 0;
    const meses = parseInt(prazo) || 360;
    const taxaMensal = (parseFloat(taxaAnual) || 10.5) / 100 / 12;
    const financiado = valor - ent;

    if (sistema === 'sac') {
      // SAC: Amortiza��o constante
      const amortizacao = financiado / meses;
      const primeiraParcela = amortizacao + (financiado * taxaMensal);
      const ultimaParcela = amortizacao + (amortizacao * taxaMensal);
      
      let totalJuros = 0;
      for (let i = 0; i < meses; i++) {
        const saldoDevedor = financiado - (amortizacao * i);
        totalJuros += saldoDevedor * taxaMensal;
      }
      
      return {
        financiado,
        primeiraParcela,
        ultimaParcela,
        totalPago: financiado + totalJuros,
        totalJuros,
        sistema: 'SAC'
      };
    } else {
      // PRICE: Parcelas fixas
      const parcela = financiado * (taxaMensal * Math.pow(1 + taxaMensal, meses)) / (Math.pow(1 + taxaMensal, meses) - 1);
      const totalPago = parcela * meses;
      
      return {
        financiado,
        primeiraParcela: parcela,
        ultimaParcela: parcela,
        totalPago,
        totalJuros: totalPago - financiado,
        sistema: 'PRICE'
      };
    }
  };

  const resultado = calcular();
  const percentualEntrada = ((parseFloat(entrada) || 0) / (parseFloat(valorImóvel) || 1)) * 100;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <>
      <Helmet>
        <title>Simulador de Financiamento Imobili�rio 2026 | SAC vs PRICE | Stater</title>
        <meta name="description" content="Simule seu financiamento imobili�rio gratuito. Compare SAC é PRICE, calcule parcelas, juros totais é descubra quanto vai pagar pelo im�vel." />
        <link rel="canonical" href="https://stater.app/ferramentas/simulador-financiamento" />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <header className="bg-slate-900 border-b-4 border-emerald-400 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/stater-logo-96.webp" alt="Stater" className="w-10 h-10" />
              <span 
                className="text-2xl uppercase tracking-wider"
                style={{ 
                  fontFamily: "'Fredoka One', sans-serif",
                  color: '#fff',
                  textShadow: '#3B82F6 2px 2px 0px, #1D4ED8 4px 4px 0px'
                }}
              >
                Stater
              </span>
            </Link>
            <Link to="/ferramentas" className="text-white/60 hover:text-white font-bold flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Ferramentas
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-900/300/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Home className="w-4 h-4" /> SIMULADOR GRATUITO
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
              Simulador de <span className="text-emerald-400">Financiamento</span>
            </h1>
            <p className="text-white/60 max-w-xl mx-auto">
              Descubra quanto voc� vai pagar pelo seu im�vel. Compare SAC (parcelas decrescentes) é PRICE (parcelas fixas).
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formul�rio */}
            <div className="bg-slate-900 border-2 border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" /> Dados do Financiamento
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Valor do Im�vel</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                    <input
                      type="number"
                      value={valorImóvel}
                      onChange={(e) => setvalorImóvel(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-lg focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Entrada ({percentualEntrada.toFixed(0)}%)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                    <input
                      type="number"
                      value={entrada}
                      onChange={(e) => setEntrada(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white text-lg focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  {percentualEntrada < 20 && (
                    <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Bancos exigem m�nimo 20% de entrada
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Prazo (meses)</label>
                  <select
                    value={prazo}
                    onChange={(e) => setPrazo(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-white text-lg focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="120">10 anos (120 meses)</option>
                    <option value="180">15 anos (180 meses)</option>
                    <option value="240">20 anos (240 meses)</option>
                    <option value="300">25 anos (300 meses)</option>
                    <option value="360">30 anos (360 meses)</option>
                    <option value="420">35 anos (420 meses)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Taxa de Juros Anual</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      value={taxaAnual}
                      onChange={(e) => setTaxaAnual(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 pr-12 text-white text-lg focus:border-emerald-400 focus:outline-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">% a.a.</span>
                  </div>
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-2">Sistema de Amortiza��o</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setSistema('sac')}
                      className={`py-3 px-4 rounded-xl font-bold transition-all ${
                        sistema === 'sac'
                          ? 'bg-emerald-900/300 text-white'
                          : 'bg-slate-800 text-white/60 hover:bg-slate-700'
                      }`}
                    >
                      SAC
                      <span className="block text-xs font-normal opacity-70">Parcelas decrescentes</span>
                    </button>
                    <button
                      onClick={() => setSistema('price')}
                      className={`py-3 px-4 rounded-xl font-bold transition-all ${
                        sistema === 'price'
                          ? 'bg-blue-900/300 text-white'
                          : 'bg-slate-800 text-white/60 hover:bg-slate-700'
                      }`}
                    >
                      PRICE
                      <span className="block text-xs font-normal opacity-70">Parcelas fixas</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Resultado */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-2 border-emerald-400 rounded-2xl p-6">
                <h3 className="text-white/70 text-sm mb-1">Valor Financiado</h3>
                <p className="text-3xl font-black text-white">{formatCurrency(resultado.financiado)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 border-2 border-white/10 rounded-2xl p-5">
                  <h3 className="text-white/70 text-sm mb-1">Primeira Parcela</h3>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(resultado.primeiraParcela)}</p>
                </div>
                <div className="bg-slate-900 border-2 border-white/10 rounded-2xl p-5">
                  <h3 className="text-white/70 text-sm mb-1">�ltima Parcela</h3>
                  <p className="text-2xl font-bold text-blue-400">{formatCurrency(resultado.ultimaParcela)}</p>
                </div>
              </div>

              <div className="bg-slate-900 border-2 border-red-500/30 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <h3 className="text-white/70 text-sm">Total de Juros Pagos</h3>
                </div>
                <p className="text-2xl font-bold text-red-400">{formatCurrency(resultado.totalJuros)}</p>
                <p className="text-white/50 text-sm mt-1">
                  {((resultado.totalJuros / resultado.financiado) * 100).toFixed(0)}% do valor financiado
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-2 border-purple-400 rounded-2xl p-5">
                <h3 className="text-white/70 text-sm mb-1">Custo Total do Im�vel</h3>
                <p className="text-3xl font-black text-white">{formatCurrency(resultado.totalPago + (parseFloat(entrada) || 0))}</p>
                <p className="text-white/50 text-sm mt-1">
                  Entrada + Financiamento + Juros
                </p>
              </div>

              <div className="bg-amber-900/300/10 text-white border border-yellow-500/30 rounded-xl p-4">
                <p className="text-yellow-400 text-sm">
                   <strong>Dica:</strong> O sistema SAC geralmente resulta em menos juros totais, mas as primeiras parcelas s�o mais altas. An�lise o que cabe no seu or�amento.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border-2 border-emerald-400 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Organize suas finan�as antes de financiar</h3>
            <p className="text-white/60 mb-6">Use o Stater para controlar seus gastos é garantir que a parcela cabe no bolso.</p>
            <Link 
              to="/login?view=register"
              className="inline-flex items-center gap-2 bg-emerald-900/300 hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Criar Conta Gr�tis
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default SimuladorFinanciamento;
