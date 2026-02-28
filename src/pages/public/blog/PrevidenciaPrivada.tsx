import React, { useState } from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const PrevidênciaPrivada: React.FC = () => {
  const [aporte, setAporte] = useState(500);
  const [anos, setAnos] = useState(25);
  const [rentabilidade, setRentabilidade] = useState(8);
  
  const calcularFuturo = () => {
    const meses = anos * 12;
    const taxaMensal = rentabilidade / 100 / 12;
    const montante = aporte * ((Math.pow(1 + taxaMensal, meses) - 1) / taxaMensal);
    return montante;
  };
  
  const montanteFinal = calcularFuturo();
  const totalInvestido = aporte * anos * 12;

  return (
    <ArticleLayout 
      title="Previdência Privada: PGBL vs VGBL - Qual Escolher?" 
      description="Guia completo sobre previdência privada no Brasil. Entenda a diferença entre PGBL é VGBL, taxas, tabelas de IR é se vale a pena." 
      canonical="/blog/previdência-privada" 
      keywords="previdência privada, PGBL, VGBL, aposentadoria, previdência complementar, investimento longo prazo" 
      date="5 de Fevereiro de 2026" 
      readTime="14 min" 
      relatedArticles={[
        { title: 'Independência Financeira', slug: 'independência-financeira' }, 
        { title: 'Imposto de Renda 2026', slug: 'imposto-de-renda' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Previdência privada não é só para aposentadoria - é uma <strong className="text-emerald-400">estratégia fiscal</strong> poderosa. Mas cuidado: escolher errado pode custar <strong className="text-red-400">milhares de reais</strong>.</p>
      <QuickSummary 
        variant="purple"
        items={[
          { label: 'PGBL', value: 'Deduz até 12% da renda no IR - para quem faz completa', icon: 'money' },
          { label: 'VGBL', value: 'Sem dedução, mas IR só sobre rendimentos - simplificada', icon: 'check' },
          { label: 'Taxas', value: 'Fuja de taxa de administração acima de 1%', icon: 'alert' },
          { label: 'Dica', value: 'Tesouro IPCA+ pode render mais com menos taxa', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-2 border-purple-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Simulador de Previdência</h3>
        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-white/60 text-sm">Aporte mensal</label>
            <input type="number" value={aporte} onChange={(e) => setAporte(Number(e.target.value))} className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-white" />
          </div>
          <div>
            <label className="text-white/60 text-sm">Anos até aposentadoria</label>
            <input type="number" value={anos} onChange={(e) => setAnos(Number(e.target.value))} className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-white" />
          </div>
          <div>
            <label className="text-white/60 text-sm">Rentabilidade anual (%)</label>
            <input type="number" value={rentabilidade} onChange={(e) => setRentabilidade(Number(e.target.value))} className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-white" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-slate-800 text-white rounded-xl p-4 text-center">
            <p className="text-white/60 text-sm">Total investido</p>
            <p className="text-2xl font-bold text-white">R$ {totalInvestido.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-emerald-500/20 rounded-xl p-4 text-center">
            <p className="text-emerald-400 text-sm">Montante final</p>
            <p className="text-3xl font-black text-emerald-400">R$ {montanteFinal.toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">PGBL vs VGBL: A Grande Diferença</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="border border-white/20 p-3 text-left">Caracteristica</th>
              <th className="border border-white/20 p-3 text-center text-blue-400">PGBL</th>
              <th className="border border-white/20 p-3 text-center text-purple-400">VGBL</th>
            </tr>
          </thead>
          <tbody className="text-white/70">
            <tr>
              <td className="border border-white/20 p-3">Dedução IR</td>
              <td className="border border-white/20 p-3 text-center text-emerald-400">Até 12% da renda bruta</td>
              <td className="border border-white/20 p-3 text-center text-red-400">Não tem</td>
            </tr>
            <tr>
              <td className="border border-white/20 p-3">IR no resgate</td>
              <td className="border border-white/20 p-3 text-center">Sobre TODO o valor</td>
              <td className="border border-white/20 p-3 text-center">Sobre RENDIMENTO apenas</td>
            </tr>
            <tr>
              <td className="border border-white/20 p-3">Ideal para quem</td>
              <td className="border border-white/20 p-3 text-center">Faz declaração completa IR</td>
              <td className="border border-white/20 p-3 text-center">Faz declaração simplificada</td>
            </tr>
            <tr>
              <td className="border border-white/20 p-3">Indicacao</td>
              <td className="border border-white/20 p-3 text-center">CLT com INSS + benefícios</td>
              <td className="border border-white/20 p-3 text-center">Autônomos, PJ, MEI</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-yellow-500/10 text-white border-2 border-yellow-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-yellow-400 mb-3">Regra de Ouro</h3>
        <p className="text-white/70">
          Se você declara IR no modelo <strong className="text-white">COMPLETO</strong> é contribui para INSS: <strong className="text-blue-400">PGBL</strong><br/>
          Se você declara IR no modelo <strong className="text-white">SIMPLIFICADO</strong> ou é PJ/MEI: <strong className="text-purple-400">VGBL</strong>
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Tabelas de IR na Previdência</h2>
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-500/10 text-white border-2 border-blue-500 rounded-xl p-5">
          <h4 className="font-bold text-blue-400 mb-3">Tabela Progressiva</h4>
          <p className="text-white/60 text-sm mb-3">IR calculado como salário. Bom para resgates pequenos.</p>
          <ul className="text-white/60 text-sm space-y-1">
            <li>Até R$2.259 = Isento</li>
            <li>R$2.260 a R$2.826 = 7,5%</li>
            <li>R$2.827 a R$3.751 = 15%</li>
            <li>R$3.752 a R$4.664 = 22,5%</li>
            <li>Acima R$4.665 = 27,5%</li>
          </ul>
        </div>
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-5">
          <h4 className="font-bold text-emerald-400 mb-3">Tabela Regressiva</h4>
          <p className="text-white/60 text-sm mb-3">IR diminui com tempo. Ideal para longo prazo.</p>
          <ul className="text-white/60 text-sm space-y-1">
            <li>Até 2 anos = 35%</li>
            <li>2 a 4 anos = 30%</li>
            <li>4 a 6 anos = 25%</li>
            <li>6 a 8 anos = 20%</li>
            <li>8 a 10 anos = 15%</li>
            <li className="text-emerald-400 font-bold">Acima 10 anos = 10%</li>
          </ul>
        </div>
      </div>

      <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-emerald-400 mb-3">Escolha Tabela REGRESSIVA se:</h3>
        <ul className="text-white/70 space-y-2">
          <li>- Vai deixar dinheiro por mais de 10 anos</li>
          <li>- Quer pagar apenas 10% de IR no resgate</li>
          <li>- Não pretende fazer resgates frequentes</li>
          <li>- Objetivo é aposentadoria de longo prazo</li>
        </ul>
        <p className="text-red-400 text-sm mt-4">ATENCAO: A escolha é IRREVOGAVEL. Não pode trocar depois!</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Taxas para Ficar de Olho</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">Taxa de Administracao</span>
            <span className="text-emerald-400">Ideal: até 1% ao ano</span>
          </div>
          <p className="text-white/50 text-sm mt-1">Taxa que a gestora cobra para administrar o fundo.</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">Taxa de Carregamento</span>
            <span className="text-emerald-400">Ideal: 0%</span>
          </div>
          <p className="text-white/50 text-sm mt-1">Taxa cobrada sobre cada aporte. Muitos fundos já zeraram.</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="font-bold text-white">Taxa de Saida</span>
            <span className="text-emerald-400">Ideal: 0%</span>
          </div>
          <p className="text-white/50 text-sm mt-1">Taxa cobrada no resgate. Evite fundos que cobram.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Vantagens da Previdência</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Benefício fiscal (PGBL)</p>
          <p className="text-white/50 text-sm">Dedução de até 12% da renda no IR</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Sem come-cotas</p>
          <p className="text-white/50 text-sm">Diferente de fundos normais, não paga IR semestral</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Portabilidade</p>
          <p className="text-white/50 text-sm">Pode trocar de fundo sem pagar IR</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Sucessao fácilitada</p>
          <p className="text-white/50 text-sm">Não entra em inventario, passa direto aos beneficiarios</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Desvantagens</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Taxas altas em muitos fundos</p>
          <p className="text-white/60 text-sm">Alguns cobram 2-3% ao ano, comendo toda a rentabilidade</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Rentabilidade baixa</p>
          <p className="text-white/60 text-sm">Muitos fundos rendem menos que Tesouro Direto</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Carencia para resgate</p>
          <p className="text-white/60 text-sm">Geralmente 60 dias para resgatar (mas pode variar)</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600/30 to-blue-600/30 border-2 border-emerald-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-3">Veredicto Final</h3>
        <p className="text-white/70">
          Previdência privada <strong className="text-emerald-400">vale a pena</strong> se: você escolhe PGBL/VGBL corretamente, encontra fundo com taxa baixa (menos de 1%), usa tabela regressiva, é tem horizonte de pelo menos 10 anos. Caso contrario, Tesouro Direto é fundos de investimento podem ser melhores.
        </p>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Qual a diferença entre PGBL é VGBL?",
                      "answer": "PGBL permite deduzir até 12% da renda bruta no IR (para quem faz declaração completa). VGBL não tem dedução, mas o IR incide só sobre os rendimentos."
              },
              {
                      "question": "Vale a pena ter previdência privada?",
                      "answer": "Depende. Pode valer se você usa declaração completa (PGBL), quer diversificar, ou precisa de disciplina para poupar. Compare sempre as taxas."
              },
              {
                      "question": "Qual a taxa de administração ideal?",
                      "answer": "Busque taxas abaixo de 1% ao ano. Muitos fundos cobram 2-3%, o que corrói significativamente seus rendimentos no longo prazo."
              },
              {
                      "question": "Posso resgatar a previdência privada antes?",
                      "answer": "Sim, mas pode haver carência inicial (geralmente 60 dias) é a tributação depende da tabela escolhida."
              }
      ]} />
    </ArticleLayout>
  );
};

export default PrevidênciaPrivada;