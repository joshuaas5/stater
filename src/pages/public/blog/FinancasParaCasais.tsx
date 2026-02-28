import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const FinancasParaCasais: React.FC = () => {
  return (
    <ArticleLayout 
      title="Financas para Casais: Como Organizar o Dinheiro a Dois sem Brigas" 
      description="Dicas práticas para casais organizarem as financas, dividirem gastos é construirem patrimônio juntos. Evite os erros mais comuns!" 
      canonical="/blog/financas-para-casais" 
      keywords="financas para casais, como dividir gastos casal, dinheiro no casamento, conta conjunta, organização financeira casal" 
      date="4 de Fevereiro de 2026" 
      readTime="12 min" 
      relatedArticles={[
        { title: 'Orcamento Famíliar', slug: 'orcamento-famíliar' }, 
        { title: 'Metas Financeiras', slug: 'metas-financeiras' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Dinheiro é a <strong className="text-red-400">principal causa de brigas</strong> entre casais. Mas não precisa ser assim. Com comúnicacao é organizacao, voces podem <strong className="text-emerald-400">construir riqueza juntos</strong>.</p>
      <QuickSummary 
        variant="purple"
        items={[
          { label: 'Modelos', value: 'Junto, separado, ou híbrido - escolham juntos', icon: 'target' },
          { label: 'Regra', value: 'Gastos acima de X reais = conversar antes', icon: 'check' },
          { label: 'Reunião', value: 'Mensal para revisar gastos é metas do casal', icon: 'clock' },
          { label: 'Dica', value: 'Transparência total - esconder dívida destrói confiança', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-red-500/10 text-white border-2 border-red-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-red-400 mb-3">Estatisticas que assustam</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-black text-red-400">70%</p>
            <p className="text-white/50 text-sm">dos casais brigam por dinheiro</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-red-400">45%</p>
            <p className="text-white/50 text-sm">escondem compras do parceiro</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-red-400">36%</p>
            <p className="text-white/50 text-sm">dos divorcios envolvem financas</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">4 modelos de gestao financeira</h2>
      <div className="space-y-4 mb-8">
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-emerald-400">1. Tudo junto (conta única)</h4>
            <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">Recomendado</span>
          </div>
          <p className="text-white/60 text-sm mb-2">Todo dinheiro entra numa conta conjunta. Decisoes sao tomadas juntos.</p>
          <div className="flex gap-4 text-xs">
            <span className="text-emerald-400">Transparencia total</span>
            <span className="text-emerald-400">Metas alinhadas</span>
            <span className="text-red-400">Exige muita confiança</span>
          </div>
        </div>
        
        <div className="bg-blue-500/10 text-white border-2 border-blue-500 rounded-xl p-5">
          <h4 className="font-bold text-blue-400 mb-2">2. Proporcional a renda</h4>
          <p className="text-white/60 text-sm mb-2">Cada um contribui proporcionalmente ao que ganha para despesas compartilhadas.</p>
          <div className="bg-black/30 rounded-lg p-3 text-sm text-white/70">
            Exemplo: Ele ganha R$8.000, ela R$4.000. Total: R$12.000.<br/>
            Despesas da casa: R$6.000. Ele paga 67% (R$4.000), ela 33% (R$2.000).
          </div>
        </div>
        
        <div className="bg-purple-500/10 text-white border-2 border-purple-500 rounded-xl p-5">
          <h4 className="font-bold text-purple-400 mb-2">3. 50/50 (metade cada)</h4>
          <p className="text-white/60 text-sm mb-2">Cada um paga exatamente metade de tudo.</p>
          <div className="flex gap-4 text-xs">
            <span className="text-emerald-400">Simples de calcular</span>
            <span className="text-red-400">Injusto se rendas diferem muito</span>
          </div>
        </div>
        
        <div className="bg-orange-500/10 border-2 border-orange-500 rounded-xl p-5">
          <h4 className="font-bold text-orange-400 mb-2">4. Hibrido (o melhor dos mundos)</h4>
          <p className="text-white/60 text-sm mb-2">Conta conjunta para despesas + contas individuais para gastos pessoais.</p>
          <div className="bg-black/30 rounded-lg p-3 text-sm text-white/70">
            70% da renda de cada um vai para conta conjunta (casa, filhos, investimentos)<br/>
            30% fica individual = liberdade para gastar como quiser
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">A conversa que todo casal precisa ter</h2>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 mb-8">
        <p className="text-white/70 mb-4">Antes de juntar as financas, respondam <strong className="text-white">juntos</strong>:</p>
        <ul className="text-white/60 space-y-3">
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">1.</span>
            <span>Quanto cada um ganha? (sem mentiras!)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">2.</span>
            <span>Quanto cada um tem de dividas?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">3.</span>
            <span>Quais sao os sonhos individuais é do casal?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">4.</span>
            <span>Como cada família lidava com dinheiro?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">5.</span>
            <span>Qual valor é muito para gastar sem consultar?</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-400">6.</span>
            <span>Quem vai pagar o que?</span>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Checklist do casal financeiro</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <h4 className="font-bold text-white mb-3">Todo mes</h4>
          <ul className="text-white/60 text-sm space-y-2">
            <li>Revisar gastos do mês anterior</li>
            <li>Definir orcamento do proximo mes</li>
            <li>Verificar metas de poupança</li>
            <li>Pagar contas juntos (mesmo app)</li>
          </ul>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <h4 className="font-bold text-white mb-3">Todo ano</h4>
          <ul className="text-white/60 text-sm space-y-2">
            <li>Revisar metas de longo prazo</li>
            <li>Atualizar seguros é planos</li>
            <li>Revisar investimentos</li>
            <li>Fazer declaração de IR juntos</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Erros que destroem casais</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Mentir sobre dividas</p>
          <p className="text-white/60 text-sm">Descobrir depois é muito pior. Transparencia desde o início.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Esconder compras</p>
          <p className="text-white/60 text-sm">A famosa conta secreta destroi a confiança.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Um controla, outro nem sabe</p>
          <p className="text-white/60 text-sm">Os dois precisam participar das decisoes financeiras.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Não ter reserva de emergência</p>
          <p className="text-white/60 text-sm">Imprevistos acontecem. Sem reserva, vira crise no relacionamento.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Gastar demais para impressionar</p>
          <p className="text-white/60 text-sm">Casamento caro não significa casamento feliz. Vida de aparencias gera dividas.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Dicas práticas</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
          <p className="font-bold text-emerald-400 text-sm">Agende date financeiro</p>
          <p className="text-white/50 text-xs mt-1">1x por mes, jantar + revisão das financas. Torne divertido!</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
          <p className="font-bold text-emerald-400 text-sm">Usem o mesmo app</p>
          <p className="text-white/50 text-xs mt-1">Stater, Mobills, Organizze - escolham um é usem juntos.</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
          <p className="font-bold text-emerald-400 text-sm">Tenham metas compartilhadas</p>
          <p className="text-white/50 text-xs mt-1">Casa própria, viagem, aposentadoria - sonhem juntos.</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
          <p className="font-bold text-emerald-400 text-sm">Definam limite de consulta</p>
          <p className="text-white/50 text-xs mt-1">Ex: gastos acima de R$300 precisam de aprovacao dos dois.</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
          <p className="font-bold text-emerald-400 text-sm">Tenham mesada individual</p>
          <p className="text-white/50 text-xs mt-1">Cada um tem X para gastar como quiser, sem dar satisfacao.</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
          <p className="font-bold text-emerald-400 text-sm">Celebrem conquistas</p>
          <p className="text-white/50 text-xs mt-1">Quitaram uma divida? Comemore! Bateram meta? Celebre!</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-600/30 to-purple-600/30 border-2 border-pink-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-3">Lembre-se</h3>
        <p className="text-white/70">
          Voces sao um <strong className="text-pink-400">time</strong>, não adversarios. O objetivo não é ganhar a discussão sobre dinheiro - é <strong className="text-emerald-400">construir uma vida juntos</strong>. Comúnicacao é mais importante que conta bancária.
        </p>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Casal deve ter conta conjunta?",
                      "answer": "Depende do estilo do casal. Opções: tudo junto, tudo separado, ou híbrido (conta conjunta para despesas compartilhadas + contas individuais)."
              },
              {
                      "question": "Como dividir despesas no casamento?",
                      "answer": "Métodos comuns: 50/50, proporcional à renda de cada um, ou um paga fixas é outro variáveis. O importante é transparência é acordo mútuo."
              },
              {
                      "question": "Como falar de dinheiro com o parceiro?",
                      "answer": "Escolha momento tranquilo, não acuse, use 'nós' em vez de 'você', foque em objetivos comuns é façam reuniões financeiras mensais."
              },
              {
                      "question": "Devo saber quanto meu parceiro ganha?",
                      "answer": "Transparência financeira fortalece o relacionamento. Conhecer a renda total permite planejar melhor é evita surpresas desagradáveis."
              }
      ]} />
    </ArticleLayout>
  );
};

export default FinancasParaCasais;