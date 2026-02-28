import { Link } from 'react-router-dom';
import React, { useState } from 'react';

const CalculadoraEmprestimo: React.FC = () => {
  const [valor, setValor] = useState(10000);
  const [parcelas, setParcelas] = useState(24);
  const [taxa, setTaxa] = useState(2.5);
  const [tipoTaxa, setTipoTaxa] = useState<'mensal' | 'anual'>('mensal');
  
  const calcularPrice = () => {
    const taxaMensal = tipoTaxa === 'mensal' ? taxa / 100 : Math.pow(1 + taxa / 100, 1/12) - 1;
    const parcela = valor * (taxaMensal * Math.pow(1 + taxaMensal, parcelas)) / (Math.pow(1 + taxaMensal, parcelas) - 1);
    const totalPago = parcela * parcelas;
    const jurosTotal = totalPago - valor;
    const cetAnual = (Math.pow(1 + taxaMensal, 12) - 1) * 100;
    
    // Tabela de amortizacao
    let saldoDevedor = valor;
    const tabela = [];
    for (let i = 1; i <= Math.min(parcelas, 12); i++) {
      const juros = saldoDevedor * taxaMensal;
      const amortizacao = parcela - juros;
      saldoDevedor -= amortizacao;
      tabela.push({ parcela: i, valorParcela: parcela, juros, amortizacao, saldo: Math.max(0, saldoDevedor) });
    }
    
    return { parcela, totalPago, jurosTotal, taxaMensal: taxaMensal * 100, cetAnual, tabela };
  };
  
  const resultado = calcularPrice();

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
            Calculadora de <span className="text-blue-400">Emprestimo</span>
          </h1>
          <p className="text-white/60 text-lg">Simule parcelas é custo total do emprestimo</p>
        </div>
        
        <div className="bg-slate-800 text-white backdrop-blur-sm border-4 border-white/20 rounded-3xl p-6 sm:p-8 mb-8">
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-white/60 text-sm mb-2">Valor do emprestimo</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">R$</span>
                <input
                  type="number"
                  value={valor}
                  onChange={(e) => setValor(Number(e.target.value))}
                  className="w-full bg-black/30 border-2 border-white/20 rounded-xl p-4 pl-12 text-xl font-bold text-white focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-white/60 text-sm mb-2">Número de parcelas</label>
              <input
                type="number"
                value={parcelas}
                onChange={(e) => setParcelas(Number(e.target.value))}
                className="w-full bg-black/30 border-2 border-white/20 rounded-xl p-4 text-xl font-bold text-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-white/60 text-sm mb-2">Taxa de juros (%)</label>
              <input
                type="number"
                step="0.1"
                value={taxa}
                onChange={(e) => setTaxa(Number(e.target.value))}
                className="w-full bg-black/30 border-2 border-white/20 rounded-xl p-4 text-xl font-bold text-white focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-white/60 text-sm mb-2">Tipo de taxa</label>
              <div className="flex gap-2">
                <button onClick={() => setTipoTaxa('mensal')} className={`flex-1 py-4 rounded-xl font-bold transition-all ${tipoTaxa === 'mensal' ? 'bg-blue-900/300 text-white' : 'bg-slate-800/10 text-white/60 hover:bg-slate-800/20'}`}>
                  Mensal
                </button>
                <button onClick={() => setTipoTaxa('anual')} className={`flex-1 py-4 rounded-xl font-bold transition-all ${tipoTaxa === 'anual' ? 'bg-blue-900/300 text-white' : 'bg-slate-800/10 text-white/60 hover:bg-slate-800/20'}`}>
                  Anual
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-900/300/10 text-white border-2 border-blue-500 rounded-2xl p-6 text-center">
            <p className="text-blue-400 text-sm mb-2">Parcela mensal</p>
            <p className="text-3xl font-black text-blue-400">
              R$ {resultado.parcela.toLocaleString('pt-BR', {maximumFractionDigits: 2})}
            </p>
          </div>
          <div className="bg-slate-800 text-white border-2 border-white/20 rounded-2xl p-6 text-center">
            <p className="text-white/60 text-sm mb-2">Total a pagar</p>
            <p className="text-2xl font-black text-white">
              R$ {resultado.totalPago.toLocaleString('pt-BR', {maximumFractionDigits: 2})}
            </p>
          </div>
          <div className="bg-red-900/300/10 text-white border-2 border-red-500 rounded-2xl p-6 text-center">
            <p className="text-red-400 text-sm mb-2">Total em juros</p>
            <p className="text-2xl font-black text-red-400">
              R$ {resultado.jurosTotal.toLocaleString('pt-BR', {maximumFractionDigits: 2})}
            </p>
          </div>
          <div className="bg-amber-900/300/10 text-white border-2 border-yellow-500 rounded-2xl p-6 text-center">
            <p className="text-yellow-400 text-sm mb-2">CET anual aprox.</p>
            <p className="text-2xl font-black text-yellow-400">
              {resultado.cetAnual.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="bg-slate-800 text-white border-2 border-white/20 rounded-2xl p-6 mb-8">
          <h3 className="font-bold text-white mb-4">Tabela de Amortizacao (primeiras 12 parcelas)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left p-2 text-white/60">Parcela</th>
                  <th className="text-right p-2 text-white/60">Valor</th>
                  <th className="text-right p-2 text-white/60">Juros</th>
                  <th className="text-right p-2 text-white/60">Amortizacao</th>
                  <th className="text-right p-2 text-white/60">Saldo</th>
                </tr>
              </thead>
              <tbody className="text-white/70">
                {resultado.tabela.map((linha) => (
                  <tr key={linha.parcela} className="border-b border-white/10">
                    <td className="p-2">{linha.parcela}</td>
                    <td className="text-right p-2">R$ {linha.valorParcela.toFixed(2)}</td>
                    <td className="text-right p-2 text-red-400">R$ {linha.juros.toFixed(2)}</td>
                    <td className="text-right p-2 text-emerald-400">R$ {linha.amortizacao.toFixed(2)}</td>
                    <td className="text-right p-2">R$ {linha.saldo.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-emerald-900/300/10 border-2 border-emerald-500 rounded-2xl p-6">
            <h3 className="font-bold text-emerald-400 mb-3">Dicas para Pagar Menos</h3>
            <ul className="text-white/70 text-sm space-y-2">
              <li>Compare CET entre bancos, não apenas juros</li>
              <li>Negocie taxa com gerente do seu banco</li>
              <li>Prefira parcelas menores é prazo curto</li>
              <li>Amortize antecipado quando possível</li>
              <li>Evite parcelas com IOF embutido</li>
            </ul>
          </div>
          <div className="bg-red-900/300/10 text-white border-2 border-red-500 rounded-2xl p-6">
            <h3 className="font-bold text-red-400 mb-3">Taxas Médias do Mercado</h3>
            <ul className="text-white/70 text-sm space-y-2">
              <li>Consignado INSS: 1,7% a 2,1% a.m.</li>
              <li>Consignado CLT: 2,0% a 2,8% a.m.</li>
              <li>Pessoal banco: 3% a 7% a.m.</li>
              <li>Fintech: 2,5% a 6% a.m.</li>
              <li>Cartao de crédito: 12% a 15% a.m.</li>
            </ul>
          </div>
        </div>

        <div className="bg-amber-900/300/10 text-white border-2 border-yellow-400 rounded-2xl p-6">
          <h3 className="font-bold text-yellow-400 mb-2">Antes de pegar emprestimo...</h3>
          <p className="text-white/70 text-sm">
            Certifique-se que o emprestimo é realmente necessário. Venda algo, corte gastos, ou espere um pouco mais para juntar o dinheiro. Emprestimo deve ser ultima opção. Parcela não pode comprometer mais de 30% da sua renda.
          </p>
        </div>

        <div className="mt-8 text-center text-white/40 text-sm">
          <p>Cálculo usando Sistema Price (parcelas fixas). CET aproximado, consulte o banco para valor exato.</p>
        </div>
      </div>
    </div>
  );
};

export default CalculadoraEmprestimo;
