import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const ComoNegociarDividas: React.FC = () => {
  return (
    <ArticleLayout 
      title="Como Negociar Dívidas: Guia Passo a Passo 2026" 
      description="Aprenda a negociar suas dívidas com bancos, cartão de crédito é lojas. Estratégias para conseguir até 90% de desconto." 
      canonical="/blog/como-negociar-dividas" 
      keywords="como negociar dívidas, renegociar dívidas, limpar nome, desconto dívidas, quitar dívidas" 
      date="4 de Fevereiro de 2026" 
      readTime="14 min" 
      relatedArticles={[
        { title: 'Como Sair das Dívidas', slug: 'como-sair-das-dividas' }, 
        { title: 'Cartão de Crédito: Vilão ou Aliado?', slug: 'cartao-de-crédito-vilao-ou-aliado' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Está endividado é não sabe por onde começar? Neste guia, vou te ensinar <strong className="text-emerald-400">exatamente como negociar suas dívidas</strong> é conseguir descontos que podem chegar a 90%.</p>
      <QuickSummary 
        variant="orange"
        items={[
          { label: 'Desconto', value: 'Feirões dão até 90% de desconto - aproveite!', icon: 'money' },
          { label: 'Quando', value: 'Janeiro é julho têm os melhores feirões', icon: 'clock' },
          { label: 'Como', value: 'Ligue, peça desconto para quitação, negocie parcelas', icon: 'target' },
          { label: 'Dica', value: 'Sempre peça por escrito - grave ligações se possível', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-2 border-emerald-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-emerald-400 mb-2"> Verdade que credores não contam</h3>
        <p className="text-white/80">Empresas <strong>preferem receber algo</strong> do que não receber nada. Dívidas antigas custam dinheiro para cobrar. Por isso, quanto mais velha a dívida, <strong>maior o desconto</strong> que você consegue.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 1: Levante TODAS as suas dívidas</h2>
      <p className="text-white/70 mb-4">Antes de negociar, você precisa saber exatamente o que deve:</p>
      
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <h4 className="font-bold text-white mb-2"> Consulte grátis</h4>
          <ul className="text-white/60 text-sm space-y-1">
            <li> <strong>Serasa</strong> - serasa.com.br</li>
            <li> <strong>SPC</strong> - spcbrasil.org.br</li>
            <li> <strong>Boa Vista</strong> - consumidor.boavistaserviços.com.br</li>
            <li> <strong>Registrato (Bacen)</strong> - dívidas bancárias</li>
          </ul>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <h4 className="font-bold text-white mb-2"> Anote</h4>
          <ul className="text-white/60 text-sm space-y-1">
            <li> Nome do credor</li>
            <li> Valor original</li>
            <li> Valor atualizado</li>
            <li> Data da dívida</li>
            <li> Tipo (cartão, empréstimo, etc.)</li>
          </ul>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 2: Priorize as dívidas (ordem de pagamento)</h2>
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-3 bg-red-500/10 text-white border border-red-500/30 rounded-xl p-4">
          <span className="text-2xl">1</span>
          <div>
            <p className="font-bold text-red-400">Dívidas com garantia</p>
            <p className="text-white/60 text-sm">Financiamento de carro/imóvel - podem tomar o bem</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <span className="text-2xl">2</span>
          <div>
            <p className="font-bold text-orange-400">Serviços essenciais</p>
            <p className="text-white/60 text-sm">Luz, água, aluguel - podem cortar/despejar</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-yellow-500/10 text-white border border-yellow-500/30 rounded-xl p-4">
          <span className="text-2xl">3</span>
          <div>
            <p className="font-bold text-yellow-400">Dívidas com juros altos</p>
            <p className="text-white/60 text-sm">Cartão de crédito (400% a.a.), cheque especial (300% a.a.)</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-blue-500/10 text-white border border-blue-500/30 rounded-xl p-4">
          <span className="text-2xl">4</span>
          <div>
            <p className="font-bold text-blue-400">Outras dívidas</p>
            <p className="text-white/60 text-sm">Lojas, empréstimos pessoais, carnês</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 3: Calcule quanto você pode pagar</h2>
      <p className="text-white/70 mb-4">Seja REALISTA. Não adianta fazer acordo que não vai conseguir cumprir:</p>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-6 mb-6">
        <p className="text-white/70 mb-4">Fórmula simples:</p>
        <div className="bg-slate-800 rounded-lg p-4 font-mono text-center">
          <p className="text-emerald-400">Renda - Gastos Fixos - Reserva = <strong>Valor disponível</strong></p>
        </div>
        <p className="text-white/50 text-sm mt-4">Ex: R$3.000 - R$2.200 - R$300 = <strong>R$500/mês</strong> para dívidas</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 4: Escolha o canal de negociação</h2>
      <div className="space-y-4 mb-8">
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
          <h4 className="font-bold text-emerald-400 mb-2"> Feirões de renegociação (MELHOR OPÇÃO)</h4>
          <p className="text-white/70 text-sm mb-2">Descontos de até 90%. Acontecem em:</p>
          <ul className="text-white/60 text-sm space-y-1">
            <li> <strong>Serasa Limpa Nome</strong> - online, o ano todo</li>
            <li> <strong>Mutirão do Procon</strong> - presencial, datas específicas</li>
            <li> <strong>Feirão da Febraban</strong> - bancos, geralmente em março/novembro</li>
          </ul>
        </div>
        <div className="bg-blue-500/10 text-white border border-blue-500/30 rounded-xl p-5">
          <h4 className="font-bold text-blue-400 mb-2"> Apps é sites dos credores</h4>
          <p className="text-white/60 text-sm">Nubank, Itaú, Bradesco têm opções de renegociação no app</p>
        </div>
        <div className="bg-purple-500/10 text-white border border-purple-500/30 rounded-xl p-5">
          <h4 className="font-bold text-purple-400 mb-2"> Telefone/SAC</h4>
          <p className="text-white/60 text-sm">Ligue, peça para falar com setor de cobrança/negociação</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 5: Técnicas de negociação (scripts prontos)</h2>
      
      <div className="bg-slate-800 border border-white/10 rounded-xl p-6 mb-6">
        <h4 className="font-bold text-yellow-400 mb-3"> Script 1: Pedindo desconto</h4>
        <p className="text-white/70 italic text-sm">"Olá, tenho uma dívida de R$X com vocês. Estou passando por dificuldades financeiras, mas quero muito resolver essa situação. <strong>Qual o melhor desconto que vocês podem me oferecer para pagamento à vista?</strong>"</p>
      </div>

      <div className="bg-slate-800 border border-white/10 rounded-xl p-6 mb-6">
        <h4 className="font-bold text-yellow-400 mb-3"> Script 2: Contra-proposta</h4>
        <p className="text-white/70 italic text-sm">"Entendo a proposta de R$X, mas infelizmente não consigo esse valor. O máximo que tenho disponível é R$Y. <strong>Tem como vocês aprovarem esse valor?</strong> Caso contrário, vou ter que deixar para resolver quando tiver condições."</p>
      </div>

      <div className="bg-slate-800 border border-white/10 rounded-xl p-6 mb-6">
        <h4 className="font-bold text-yellow-400 mb-3"> Script 3: Pressionar desconto maior</h4>
        <p className="text-white/70 italic text-sm">"Vi que no Serasa Limpa Nome vocês estão oferecendo X% de desconto. <strong>Consigo esse mesmo desconto negociando direto com vocês?</strong>"</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Tabela de descontos médios por tipo de dívida</h2>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="text-left p-3 text-white">Tipo de Dívida</th>
              <th className="text-center p-3 text-white">Desconto Médio</th>
              <th className="text-center p-3 text-white">Desconto Máximo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            <tr>
              <td className="p-3 text-white/70">Cartão de crédito</td>
              <td className="p-3 text-center text-emerald-400">40-60%</td>
              <td className="p-3 text-center text-emerald-400">até 90%</td>
            </tr>
            <tr>
              <td className="p-3 text-white/70">Empréstimo pessoal</td>
              <td className="p-3 text-center text-emerald-400">30-50%</td>
              <td className="p-3 text-center text-emerald-400">até 70%</td>
            </tr>
            <tr>
              <td className="p-3 text-white/70">Lojas (carnê)</td>
              <td className="p-3 text-center text-emerald-400">50-70%</td>
              <td className="p-3 text-center text-emerald-400">até 90%</td>
            </tr>
            <tr>
              <td className="p-3 text-white/70">Telefonia/Internet</td>
              <td className="p-3 text-center text-emerald-400">40-60%</td>
              <td className="p-3 text-center text-emerald-400">até 80%</td>
            </tr>
            <tr>
              <td className="p-3 text-white/70">Financiamento veículo</td>
              <td className="p-3 text-center text-yellow-400">10-20%</td>
              <td className="p-3 text-center text-yellow-400">até 30%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo 6: Feche o acordo (IMPORTANTE!)</h2>
      <div className="bg-red-500/10 text-white border-2 border-red-400 rounded-xl p-6 mb-8">
        <h4 className="font-bold text-red-400 mb-3"> NUNCA feche acordo sem isso:</h4>
        <ul className="text-white/70 space-y-2">
          <li> <strong>Documento por escrito</strong> (e-mail, contrato, print)</li>
          <li> <strong>Valor total do acordo</strong> (não só da parcela)</li>
          <li> <strong>Número de parcelas</strong> é vencimentos</li>
          <li> <strong>Quitação total</strong> - confirme que não sobra saldo</li>
          <li> <strong>Prazo para limpar nome</strong> (até 5 dias úteis após pagamento)</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Dica bônus: Dívida prescrita (mais de 5 anos)</h2>
      <div className="bg-purple-500/10 text-white border border-purple-500/30 rounded-xl p-6 mb-8">
        <p className="text-white/70 mb-3">Dívidas com mais de 5 anos <strong>prescrevem</strong> - o credor não pode mais te processar. Mas atenção:</p>
        <ul className="text-white/60 text-sm space-y-1">
          <li> Seu nome <strong>sai do SPC/Serasa</strong> automáticamente após 5 anos</li>
          <li> A dívida ainda existe, mas não pode ser cobrada judicialmente</li>
          <li> Se você pagar qualquer valor, <strong>a prescrição reinicia!</strong></li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-emerald-600/30 to-blue-600/30 border-2 border-emerald-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-2"> Resumo: Checklist da negociação</h3>
        <ol className="text-white/80 space-y-2">
          <li>1.  Levantei todas as dívidas</li>
          <li>2.  Priorizei por urgência</li>
          <li>3.  Calculei quanto posso pagar</li>
          <li>4.  Busquei feirões de desconto</li>
          <li>5.  Negociei com calma é scripts</li>
          <li>6.  Fechei acordo POR ESCRITO</li>
          <li>7.  Guardei comprovantes</li>
        </ol>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Como conseguir desconto para quitar dívida?",
                      "answer": "Aguarde feirões de renegociação (Serasa Limpa Nome), ofereça pagamento à vista, peça remoção de juros é multas."
              },
              {
                      "question": "Qual dívida pagar primeiro?",
                      "answer": "Priorize: 1) Contas essenciais (água, luz). 2) Dívidas com juros mais altos (cartão). 3) Dívidas que podem gerar processos."
              },
              {
                      "question": "Posso perder bens por dívida?",
                      "answer": "Dívidas comuns não tomam bens essenciais. Mas dívidas com garantia é dívidas fiscais podem resultar em penhora."
              },
              {
                      "question": "Dívida prescreve em quanto tempo?",
                      "answer": "A maioria das dívidas prescreve em 5 anos, mas isso não apaga a dívida - apenas impede cobrança judicial."
              }
      ]} />
    </ArticleLayout>
  );
};

export default ComoNegociarDividas;