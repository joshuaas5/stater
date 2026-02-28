import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Banknote, Calculator, TrendingUp, Heart, Coffee, Shield } from 'lucide-react';

const CalculadoraSalarioCLTPJ: React.FC = () => {
  const [salarioBruto, setSalarioBruto] = useState<string>('8000');
  const [dependentes, setDependentes] = useState<string>('0');
  const [valeTransporte, setValeTransporte] = useState<boolean>(true);
  const [valeRefeicaoCLT, setValeRefeicaoCLT] = useState<string>('800');
  const [planoSaudeCLT, setPlanoSaudeCLT] = useState<string>('400');
  
  // PJ também pode ter benefícios!
  const [valeRefeicaoPJ, setValeRefeicaoPJ] = useState<string>('0');
  const [planoSaudePJ, setPlanoSaudePJ] = useState<string>('500');
  const [contadorPJ, setContadorPJ] = useState<string>('200');

  // Tabela INSS 2026
  const calcularINSS = (salario: number) => {
    let inss = 0;
    if (salario <= 1412.00) {
      inss = salário * 0.075;
    } else if (salario <= 2666.68) {
      inss = 1412.00 * 0.075 + (salario - 1412.00) * 0.09;
    } else if (salario <= 4000.03) {
      inss = 1412.00 * 0.075 + (2666.68 - 1412.00) * 0.09 + (salario - 2666.68) * 0.12;
    } else if (salario <= 7786.02) {
      inss = 1412.00 * 0.075 + (2666.68 - 1412.00) * 0.09 + (4000.03 - 2666.68) * 0.12 + (salario - 4000.03) * 0.14;
    } else {
      inss = 1412.00 * 0.075 + (2666.68 - 1412.00) * 0.09 + (4000.03 - 2666.68) * 0.12 + (7786.02 - 4000.03) * 0.14;
    }
    return Math.min(inss, 908.85);
  };

  // NOVA Tabela IRRF 2026 - ISENCAO ATE R$ 5.000/mes!
  const calcularIRRF = (baseCalculo: number) => {
    if (baseCalculo <= 5000.00) return 0; // ISENTO até R$ 5.000
    if (baseCalculo <= 6500.00) return (baseCalculo - 5000) * 0.075;
    if (baseCalculo <= 8500.00) return 112.50 + (baseCalculo - 6500) * 0.15;
    if (baseCalculo <= 10500.00) return 412.50 + (baseCalculo - 8500) * 0.225;
    return 862.50 + (baseCalculo - 10500) * 0.275;
  };

  const salário = parseFloat(salarioBruto) || 0;
  const deps = parseInt(dependentes) || 0;
  const vrCLT = parseFloat(valeRefeicaoCLT) || 0;
  const psCLT = parseFloat(planoSaudeCLT) || 0;
  const vrPJ = parseFloat(valeRefeicaoPJ) || 0;
  const psPJ = parseFloat(planoSaudePJ) || 0;
  const contador = parseFloat(contadorPJ) || 0;

  // CLT
  const inss = calcularINSS(salario);
  const deducaoDependentes = deps * 189.59;
  const baseIRRF = salário - inss - deducaoDependentes;
  const irrf = calcularIRRF(baseIRRF);
  const descontoVT = valeTransporte ? salário * 0.06 : 0;
  const liquidoCLT = salário - inss - irrf - descontoVT;
  const beneficiosCLT = vrCLT + psCLT;
  const totalCLT = liquidoCLT + beneficiosCLT;
  const fgts = salário * 0.08;
  const decimoTerceiro = salário / 12;
  const férias = (salario * 1.33) / 12;
  const custoEmpresaCLT = salário + fgts + (salario * 0.2);

  // PJ (Simples Nacional - faixa aproximada)
  const aliquotaSimples = salário <= 5000 ? 0.06 : salário <= 10000 ? 0.112 : 0.135;
  const impostoPJ = salário * aliquotaSimples;
  const prolabore = salário * 0.28;
  const inssPJ = Math.min(prolabore * 0.11, 908.85);
  const gastosPJ = impostoPJ + inssPJ + contador + psPJ + vrPJ;
  const liquidoPJ = salário - gastosPJ;

  // Comparacao
  const diferencaMensal = liquidoPJ - totalCLT;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <>
      <Helmet>
        <title>Calculadora CLT vs PJ 2026 | Nova Tabela IR Isencao R$ 5.000 | Stater</title>
        <meta name="description" content="Compare salário CLT vs PJ com a NOVA tabela IR 2026 (isencao até R$ 5.000). Calcule INSS, IRRF, benefícios é descubra qual regime compensa mais." />
        <meta name="keywords" content="CLT vs PJ, calculadora salario, IRRF 2026, isencao imposto renda, PJ vale a pena, comparar CLT PJ" />
        <link rel="canonical" href="https://stater.app/ferramentas/calculadora-clt-pj" />
      </Helmet>

      <div className="min-h-screen bg-slate-950">
        <header className="bg-slate-900 border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/stater-logo-96.webp" alt="Stater" className="w-10 h-10" />
              <span className="text-2xl uppercase tracking-wider font-bold text-white">Stater</span>
            </Link>
            <Link to="/ferramentas" className="text-white/60 hover:text-white font-bold flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Ferramentas
            </Link>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-900/300/20 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Banknote className="w-4 h-4" /> ATUALIZADO 2026 - NOVA LEI IR
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
              CLT vs <span className="text-blue-400">PJ</span>
            </h1>
            <p className="text-white/60 max-w-2xl mx-auto">
              Descubra qual regime compensa mais! <strong className="text-emerald-400">Agora com a nova isencao de IR até R$ 5.000/mes</strong> é opção de benefícios para PJ.
            </p>
          </div>

          {/* Aviso Nova Lei */}
          <div className="bg-emerald-900/300/20 border-2 border-emerald-400 rounded-2xl p-4 mb-8 text-center">
            <p className="text-emerald-400 font-bold text-lg">
              NOVIDADE 2026: Quem ganha até R$ 5.000/mes está ISENTO de IR!
            </p>
            <p className="text-white/60 text-sm mt-1">
              A nova lei beneficia mais de 16 milhoes de brasileiros. Esta calculadora já está atualizada!
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-slate-900 border-2 border-white/10 rounded-2xl p-6 mb-8">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-400" /> Seus Dados
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">Salario Bruto (CLT) / Faturamento (PJ)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                  <input
                    type="number"
                    value={salarioBruto}
                    onChange={(e) => setSalarioBruto(e.target.value)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Dependentes (IRRF)</label>
                <select
                  value={dependentes}
                  onChange={(e) => setDependentes(e.target.value)}
                  className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-blue-400 focus:outline-none"
                >
                  <option value="0">Nenhum</option>
                  <option value="1">1 dependente</option>
                  <option value="2">2 dependentes</option>
                  <option value="3">3 dependentes</option>
                </select>
              </div>
              <div>
                <label className="block text-white/70 text-sm mb-2">Vale Transporte (CLT)</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setValeTransporte(true)}
                    className={`flex-1 py-3 rounded-xl font-bold ${valeTransporte ? 'bg-blue-900/300 text-white' : 'bg-slate-800 text-white/60'}`}
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => setValeTransporte(false)}
                    className={`flex-1 py-3 rounded-xl font-bold ${!valeTransporte ? 'bg-blue-900/300 text-white' : 'bg-slate-800 text-white/60'}`}
                  >
                    Nao
                  </button>
                </div>
              </div>
            </div>

            {/* Beneficios CLT */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-400" /> Beneficios CLT (pagos pela empresa)
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Vale Refeicao/Alimentacao</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                    <input
                      type="number"
                      value={valeRefeicaoCLT}
                      onChange={(e) => setValeRefeicaoCLT(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Plano de Saude</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                    <input
                      type="number"
                      value={planoSaudeCLT}
                      onChange={(e) => setPlanoSaudeCLT(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Gastos PJ */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" /> Gastos/Beneficios PJ (voce paga)
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">Plano de Saude</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                    <input
                      type="number"
                      value={planoSaudePJ}
                      onChange={(e) => setPlanoSaudePJ(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Vale Refeicao (proprio)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                    <input
                      type="number"
                      value={valeRefeicaoPJ}
                      onChange={(e) => setValeRefeicaoPJ(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">Contador</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">R$</span>
                    <input
                      type="number"
                      value={contadorPJ}
                      onChange={(e) => setContadorPJ(e.target.value)}
                      className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-blue-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comparacao lado a lado */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* CLT */}
            <div className="bg-gradient-to-br from-emerald-600/10 to-teal-600/10 border-2 border-emerald-400 rounded-2xl p-6">
              <h3 className="text-2xl font-black text-emerald-400 mb-6">CLT</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Salario Bruto</span>
                  <span className="text-white font-medium">{formatCurrency(salario)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>(-) INSS</span>
                  <span>- {formatCurrency(inss)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>(-) IRRF {irrf === 0 && <span className="text-emerald-400 text-xs">(ISENTO!)</span>}</span>
                  <span>- {formatCurrency(irrf)}</span>
                </div>
                {valeTransporte && (
                  <div className="flex justify-between text-red-400">
                    <span>(-) VT (6%)</span>
                    <span>- {formatCurrency(descontoVT)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="text-white font-medium">Liquido</span>
                  <span className="text-white font-bold">{formatCurrency(liquidoCLT)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>(+) VR/VA</span>
                  <span>+ {formatCurrency(vrCLT)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>(+) Plano Saude</span>
                  <span>+ {formatCurrency(psCLT)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-emerald-400/30">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">TOTAL MENSAL</span>
                  <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalCLT)}</span>
                </div>
              </div>

              <div className="mt-4 bg-emerald-900/300/10 rounded-xl p-4 text-sm">
                <p className="text-white/70 mb-2">Beneficios extras:</p>
                <div className="flex justify-between text-emerald-400">
                  <span>FGTS/mes</span>
                  <span>{formatCurrency(fgts)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>13o (prop./mes)</span>
                  <span>{formatCurrency(decimoTerceiro)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Ferias (prop./mes)</span>
                  <span>{formatCurrency(ferias)}</span>
                </div>
              </div>
            </div>

            {/* PJ */}
            <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-2 border-blue-400 rounded-2xl p-6">
              <h3 className="text-2xl font-black text-blue-400 mb-6">PJ (Simples Nacional)</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Faturamento</span>
                  <span className="text-white font-medium">{formatCurrency(salario)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>(-) Simples ({(aliquotaSimples * 100).toFixed(1)}%)</span>
                  <span>- {formatCurrency(impostoPJ)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>(-) INSS Pro-labore</span>
                  <span>- {formatCurrency(inssPJ)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>(-) Contador</span>
                  <span>- {formatCurrency(contador)}</span>
                </div>
                {psPJ > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>(-) Plano Saude</span>
                    <span>- {formatCurrency(psPJ)}</span>
                  </div>
                )}
                {vrPJ > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>(-) Vale Refeicao</span>
                    <span>- {formatCurrency(vrPJ)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="text-white font-medium">Liquido Final</span>
                  <span className="text-white font-bold">{formatCurrency(liquidoPJ)}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-blue-400/30">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">TOTAL MENSAL</span>
                  <span className="text-2xl font-black text-blue-400">{formatCurrency(liquidoPJ)}</span>
                </div>
              </div>

              <div className="mt-4 bg-amber-900/300/10 rounded-xl p-4 text-sm">
                <p className="text-yellow-400 font-medium mb-2">Lembre-se como PJ:</p>
                <ul className="text-white/60 space-y-1">
                  <li> Sem FGTS, 13o, férias remuneradas</li>
                  <li> Reserve para emergencias</li>
                  <li> Considere aposentadoria privada</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Veredicto */}
          <div className={`mt-8 p-6 rounded-2xl border-2 ${diferencaMensal > 0 ? 'bg-blue-900/300/10 border-blue-400' : 'bg-emerald-900/300/10 border-emerald-400'}`}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {diferencaMensal > 0 ? 'PJ rende mais!' : 'CLT compensa mais!'}
                </h3>
                <p className="text-white/60">
                  Diferenca: <strong className={diferencaMensal > 0 ? 'text-blue-400' : 'text-emerald-400'}>
                    {formatCurrency(Math.abs(diferencaMensal))}/mes
                  </strong>
                </p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-sm">Custo para empresa (CLT)</p>
                <p className="text-xl font-bold text-white">{formatCurrency(custoEmpresaCLT)}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-2 border-blue-400 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">Organize suas financas em qualquer regime</h3>
            <p className="text-white/60 mb-6">Use o Stater para controlar gastos, seja CLT ou PJ.</p>
            <Link 
              to="/login?view=register"
              className="inline-flex items-center gap-2 bg-blue-900/300 hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl transition-colors"
            >
              Criar Conta Gratis
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default CalculadoraSalarioCLTPJ;