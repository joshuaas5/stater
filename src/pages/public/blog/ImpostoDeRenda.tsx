import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const ImpostoDeRenda: React.FC = () => {
  return (
    <ArticleLayout 
      title="Imposto de Renda 2026: Guia Completo para Declarar sem Erros" 
      description="Tudo sobre IRPF 2026: quem precisa declarar, como fazer, deduções permitidas é como pagar menos imposto legalmente." 
      canonical="/blog/imposto-de-renda-2026" 
      keywords="imposto de renda 2026, como declarar IR, dedução imposto de renda, restituição IR, IRPF" 
      date="4 de Fevereiro de 2026" 
      readTime="18 min" 
      relatedArticles={[
        { title: 'CLT vs PJ: Qual Compensa?', slug: 'calculadora-clt-pj' }, 
        { title: 'Tesouro Direto para Iniciantes', slug: 'tesouro-direto-iniciantes' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Declarar Imposto de Renda não precisa ser um bicho de sete cabeças. Este guia vai te ajudar a <strong className="text-emerald-400">declarar corretamente</strong> e, melhor ainda, <strong className="text-emerald-400">pagar menos imposto</strong> de forma legal.</p>
      <QuickSummary 
        variant="yellow"
        items={[
          { label: 'Quem', value: 'Rendeu acima de ~R$30mil no ano ou tem bens > R$300mil', icon: 'target' },
          { label: 'Prazo', value: 'Março a maio - não deixe para última hora', icon: 'clock' },
          { label: 'Dedução', value: 'Saúde, educação, previdência, dependentes', icon: 'money' },
          { label: 'Dica', value: 'Use declaração pré-preenchida - muito mais fácil', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-yellow-500/10 text-white border-2 border-yellow-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-yellow-400 mb-2"> Calendário IRPF 2026</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-black/20 rounded-xl p-3">
            <p className="text-yellow-300 text-xs">Início da declaração</p>
            <p className="text-white font-bold">15 de março de 2026</p>
          </div>
          <div className="bg-black/20 rounded-xl p-3">
            <p className="text-yellow-300 text-xs">Prazo final</p>
            <p className="text-white font-bold">31 de maio de 2026</p>
          </div>
          <div className="bg-black/20 rounded-xl p-3">
            <p className="text-yellow-300 text-xs">1º lote restituição</p>
            <p className="text-white font-bold">30 de junho de 2026</p>
          </div>
          <div className="bg-black/20 rounded-xl p-3">
            <p className="text-yellow-300 text-xs">Último lote</p>
            <p className="text-white font-bold">30 de dezembro de 2026</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Quem precisa declarar em 2026?</h2>
      <div className="space-y-3 mb-8">
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="text-xl"></span>
          <p className="text-white/70">Rendimentos tributáveis acima de <strong className="text-white">R$33.888,00</strong> no ano</p>
        </div>
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="text-xl"></span>
          <p className="text-white/70">Rendimentos isentos/tributados na fonte acima de <strong className="text-white">R$200.000,00</strong></p>
        </div>
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="text-xl"></span>
          <p className="text-white/70">Bens é direitos acima de <strong className="text-white">R$800.000,00</strong></p>
        </div>
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="text-xl"></span>
          <p className="text-white/70">Operou na bolsa de valores em qualquer valor</p>
        </div>
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="text-xl"></span>
          <p className="text-white/70">Receita bruta rural acima de <strong className="text-white">R$169.440,00</strong></p>
        </div>
        <div className="flex items-start gap-3 bg-slate-800 text-white rounded-xl p-4">
          <span className="text-xl"></span>
          <p className="text-white/70">Passou à condição de residente no Brasil em 2025</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Tabela de alíquotas 2026</h2>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-4 text-white/50">Base de cálculo mensal</th>
              <th className="text-center py-3 px-4 text-white/50">Alíquota</th>
              <th className="text-center py-3 px-4 text-white/50">Dedução</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white">Até R$2.259,20</td>
              <td className="py-3 px-4 text-center text-emerald-400 font-bold">Isento</td>
              <td className="py-3 px-4 text-center text-white/50">-</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white">R$2.259,21 a R$2.826,65</td>
              <td className="py-3 px-4 text-center text-yellow-400 font-bold">7,5%</td>
              <td className="py-3 px-4 text-center text-white/50">R$169,44</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white">R$2.826,66 a R$3.751,05</td>
              <td className="py-3 px-4 text-center text-orange-400 font-bold">15%</td>
              <td className="py-3 px-4 text-center text-white/50">R$381,44</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white">R$3.751,06 a R$4.664,68</td>
              <td className="py-3 px-4 text-center text-red-400 font-bold">22,5%</td>
              <td className="py-3 px-4 text-center text-white/50">R$662,77</td>
            </tr>
            <tr className="border-b border-white/5">
              <td className="py-3 px-4 text-white">Acima de R$4.664,68</td>
              <td className="py-3 px-4 text-center text-red-500 font-bold">27,5%</td>
              <td className="py-3 px-4 text-center text-white/50">R$896,00</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Deduções que reduzem seu imposto</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <h4 className="font-bold text-emerald-400 mb-2"> Dependentes</h4>
          <p className="text-white/60 text-sm">R$2.275,08 por dependente/ano</p>
          <p className="text-white/40 text-xs mt-1">Filhos até 21 anos, cônjuge sem renda, pais idosos</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <h4 className="font-bold text-emerald-400 mb-2"> Educação</h4>
          <p className="text-white/60 text-sm">Até R$3.561,50 por pessoa/ano</p>
          <p className="text-white/40 text-xs mt-1">Inclui faculdade, pós, técnico. NÃO inclui cursos livres.</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <h4 className="font-bold text-emerald-400 mb-2"> Saúde</h4>
          <p className="text-white/60 text-sm">SEM LIMITE de dedução</p>
          <p className="text-white/40 text-xs mt-1">Médicos, dentistas, hospitais, plano de saúde, psicólogo</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <h4 className="font-bold text-emerald-400 mb-2"> Previdência PGBL</h4>
          <p className="text-white/60 text-sm">Até 12% da renda bruta</p>
          <p className="text-white/40 text-xs mt-1">Só funciona se fizer declaração completa</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <h4 className="font-bold text-emerald-400 mb-2"> Pensão alimentícia</h4>
          <p className="text-white/60 text-sm">Valor integral pago</p>
          <p className="text-white/40 text-xs mt-1">Precisa ter decisão judicial ou acordo formal</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <h4 className="font-bold text-emerald-400 mb-2"> Livro caixa</h4>
          <p className="text-white/60 text-sm">Despesas de autônomos</p>
          <p className="text-white/40 text-xs mt-1">Aluguel de consultório, materiais, funcionários</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Simplificada vs Completa: qual escolher?</h2>
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-500/10 text-white border-2 border-blue-500 rounded-2xl p-5">
          <h4 className="font-bold text-blue-400 text-lg mb-2"> Declaração Simplificada</h4>
          <ul className="text-white/60 text-sm space-y-2">
            <li> Desconto padrão de 20%</li>
            <li> Limite de R$16.754,34</li>
            <li> Mais rápida é fácil</li>
            <li> Ignora todas suas deduções reais</li>
          </ul>
          <p className="mt-3 text-blue-300 text-sm font-bold">Melhor para: quem tem poucas deduções</p>
        </div>
        <div className="bg-purple-500/10 text-white border-2 border-purple-500 rounded-2xl p-5">
          <h4 className="font-bold text-purple-400 text-lg mb-2"> Declaração Completa</h4>
          <ul className="text-white/60 text-sm space-y-2">
            <li> Usa todas as deduções reais</li>
            <li> Pode ter desconto maior que 20%</li>
            <li> Necessária para deduzir PGBL</li>
            <li> Precisa guardar comprovantes 5 anos</li>
          </ul>
          <p className="mt-3 text-purple-300 text-sm font-bold">Melhor para: quem tem muitas despesas dedutíveis</p>
        </div>
      </div>

      <div className="bg-yellow-500/10 text-white border border-yellow-500/30 rounded-xl p-5 mb-8">
        <h4 className="font-bold text-yellow-400 mb-2"> Dica de ouro</h4>
        <p className="text-white/70 text-sm">O programa da Receita calcula automáticamente qual modelo é melhor para você. Preencha tudo é deixe ele comparar!</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Erros que levam à malha fina</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="text-white/70"><strong className="text-red-400">1.</strong> Omitir rendimentos (a Receita cruza dados!)</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="text-white/70"><strong className="text-red-400">2.</strong> Despesas médicas sem recibo ou nota fiscal</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="text-white/70"><strong className="text-red-400">3.</strong> Dependente declarado por mais de uma pessoa</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="text-white/70"><strong className="text-red-400">4.</strong> Variação patrimonial incompatível com renda</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="text-white/70"><strong className="text-red-400">5.</strong> Não declarar venda de imóveis ou veículos</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600/30 to-blue-600/30 border-2 border-emerald-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-3"> Como receber restituição mais rápido</h3>
        <ol className="text-white/70 space-y-2">
          <li><strong>1.</strong> Entregue nos primeiros dias (prioridade por ordem de entrega)</li>
          <li><strong>2.</strong> Use a declaração pré-preenchida</li>
          <li><strong>3.</strong> Cadastre chave PIX com CPF para recebimento</li>
          <li><strong>4.</strong> Não tenha pendências (malha fina atrasa tudo)</li>
        </ol>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Quem precisa declarar Imposto de Renda?",
                      "answer": "Quem recebeu mais de R$ 30.639,90 em rendimentos tributáveis em 2024, ou mais de R$ 200.000 em isentos, ou tem bens acima de R$ 800.000."
              },
              {
                      "question": "Qual o prazo para declarar IR 2025?",
                      "answer": "Geralmente de 15 de março a 31 de maio. A declaração pré-preenchida fica disponível após algumas semanas do início do prazo."
              },
              {
                      "question": "Declaração simplificada ou completa?",
                      "answer": "Simplificada: desconto padrão de 20% (limite R$ 16.754,34). Completa: some despesas dedutíveis. O programa mostra qual é mais vantajosa."
              },
              {
                      "question": "O que posso deduzir no IR?",
                      "answer": "Saúde (sem limite), educação (até R$ 3.561,50/pessoa), dependentes (R$ 2.275,08/cada), previdência privada PGBL (até 12% da renda)."
              }
      ]} />
    </ArticleLayout>
  );
};

export default ImpostoDeRenda;