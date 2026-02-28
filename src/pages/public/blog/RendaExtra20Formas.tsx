import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const RendaExtra20Formas: React.FC = () => {
  return (
    <ArticleLayout 
      title="20 Formas de Ganhar Dinheiro Extra em 2026 (Testadas)" 
      description="Ideias práticas é realistas para ganhar renda extra em 2026. De freelancer a vendas online, encontre a opção ideal para você." 
      canonical="/blog/renda-extra-20-formas" 
      keywords="renda extra, ganhar dinheiro extra, trabalho extra, dinheiro em casa, freelancer, vender online" 
      date="4 de Fevereiro de 2026" 
      readTime="18 min" 
      relatedArticles={[
        { title: 'Como Juntar Dinheiro Rápido', slug: 'como-juntar-dinheiro-rápido' }, 
        { title: 'Regra 50-30-20', slug: 'regra-50-30-20' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Quer aumentar sua renda mas não sabe por onde começar? Separei <strong className="text-emerald-400">20 formas testadas</strong> de ganhar dinheiro extra, desde opções que você pode começar hoje até negócios que podem virar sua renda principal.</p>
      
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/10 border-2 border-yellow-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-yellow-400 mb-2"> Antes de começar</h3>
        <p className="text-white/80">A melhor renda extra é aquela que você <strong>consegue manter</strong>. Escolha algo que combine com seu tempo disponível, suas habilidades é seu estilo de vida.</p>
      </div>

      <QuickSummary 
        variant="orange"
        items={[
          { label: 'Online', value: 'Freelancer, aulas, afiliados - trabalhe de casa', icon: 'star' },
          { label: 'Presencial', value: 'Uber, entregas, bicos - ganhe nas horas livres', icon: 'clock' },
          { label: 'Valores', value: 'De R$200 a R$5.000/mês dependendo da dedicação', icon: 'money' },
          { label: 'Dica', value: 'Comece com o que você já sabe fazer, depois expanda', icon: 'lightbulb' },
        ]}
      />


      <h2 className="text-2xl font-bold mt-10 mb-4"> Online (trabalhe de casa)</h2>
      
      <div className="space-y-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">1</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Freelancer (Redação, Design, Programação)</h3>
              <p className="text-white/60 text-sm mb-2">Plataformas: Workana, 99Freelas, Fiverr, Upwork</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$500-5000/mês</span>
                <span className="bg-blue-500/10 text-white/20 text-blue-400 text-xs px-2 py-1 rounded">Flexível</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">2</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Aulas Particulares Online</h3>
              <p className="text-white/60 text-sm mb-2">Idiomas, matemática, música, reforço escolar via Zoom/Meet</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$50-150/hora</span>
                <span className="bg-purple-500/10 text-white/20 text-purple-400 text-xs px-2 py-1 rounded">Conhecimento</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">3</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Gestor de Redes Sociais</h3>
              <p className="text-white/60 text-sm mb-2">Cuide do Instagram/TikTok de pequenos negócios locais</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$500-2000/cliente</span>
                <span className="bg-orange-500/10 text-white/60 text-orange-400 text-xs px-2 py-1 rounded">Alta demanda</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">4</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Transcrição de Áudio/Vídeo</h3>
              <p className="text-white/60 text-sm mb-2">Transcreva podcasts, entrevistas, reuniões</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$3-10/min de áudio</span>
                <span className="bg-blue-500/10 text-white/20 text-blue-400 text-xs px-2 py-1 rounded">Fácil começar</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">5</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Assistente Virtual</h3>
              <p className="text-white/60 text-sm mb-2">E-mails, agendamentos, organização para empresários</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$1500-4000/mês</span>
                <span className="bg-purple-500/10 text-white/20 text-purple-400 text-xs px-2 py-1 rounded">Pode virar CLT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Vendas (produtos físicos ou digitais)</h2>
      
      <div className="space-y-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">6</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Vender no Mercado Livre/Shopee</h3>
              <p className="text-white/60 text-sm mb-2">Revenda, dropshipping ou produtos próprios</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$1000-10000+/mês</span>
                <span className="bg-red-500/10 text-white/20 text-red-400 text-xs px-2 py-1 rounded">Requer investimento</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">7</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Brechó Online (Enjoei, OLX)</h3>
              <p className="text-white/60 text-sm mb-2">Venda roupas é itens que você não usa mais</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$200-2000/mês</span>
                <span className="bg-blue-500/10 text-white/20 text-blue-400 text-xs px-2 py-1 rounded">Zero investimento</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">8</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Produtos Artesanais (Elo7)</h3>
              <p className="text-white/60 text-sm mb-2">Bijuterias, velas, sabonetes, bordados, crochê</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$500-5000/mês</span>
                <span className="bg-purple-500/10 text-white/20 text-purple-400 text-xs px-2 py-1 rounded">Criativo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">9</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Afiliado Digital (Hotmart, Monetizze)</h3>
              <p className="text-white/60 text-sm mb-2">Divulgue cursos é ganhe comissão por venda</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$100-10000+/mês</span>
                <span className="bg-orange-500/10 text-white/60 text-orange-400 text-xs px-2 py-1 rounded">Escalável</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl"></span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Criar é Vender E-book/Curso</h3>
              <p className="text-white/60 text-sm mb-2">Transforme seu conhecimento em produto digital</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$500-50000+/mês</span>
                <span className="bg-yellow-500/10 text-white/20 text-yellow-400 text-xs px-2 py-1 rounded">Renda passiva</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Serviços Presenciais</h2>
      
      <div className="space-y-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">11</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Motorista de App (Uber, 99)</h3>
              <p className="text-white/60 text-sm mb-2">Horários flexíveis, especialmente fins de semana</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$1500-5000/mês</span>
                <span className="bg-red-500/10 text-white/20 text-red-400 text-xs px-2 py-1 rounded">Precisa de carro</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">12</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Entregador (iFood, Rappi)</h3>
              <p className="text-white/60 text-sm mb-2">De bike, moto ou carro. Horário de pico paga mais</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$1000-4000/mês</span>
                <span className="bg-blue-500/10 text-white/20 text-blue-400 text-xs px-2 py-1 rounded">Início imédiato</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">13</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Dog Walker / Pet Sitter</h3>
              <p className="text-white/60 text-sm mb-2">Passeie com cachorros ou cuide de pets</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$30-80/passeio</span>
                <span className="bg-purple-500/10 text-white/20 text-purple-400 text-xs px-2 py-1 rounded">Divertido</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">14</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Fotógrafo de Eventos</h3>
              <p className="text-white/60 text-sm mb-2">Aniversários, casamentos, formaturas</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$300-2000/evento</span>
                <span className="bg-red-500/10 text-white/20 text-red-400 text-xs px-2 py-1 rounded">Precisa equipamento</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
          <div className="flex items-start gap-4">
            <span className="text-2xl">15</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Pequenos Reparos (Marido de Aluguel)</h3>
              <p className="text-white/60 text-sm mb-2">Trocar chuveiro, montar móveis, pintura</p>
              <div className="flex gap-2 flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded">R$80-300/serviço</span>
                <span className="bg-orange-500/10 text-white/60 text-orange-400 text-xs px-2 py-1 rounded">Alta demanda</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Alimentação</h2>
      
      <div className="space-y-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <span className="text-2xl">16</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Marmitas Fit / Congeladas</h3>
              <p className="text-white/60 text-sm">Comece vendendo para vizinhos é colegas de trabalho</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <span className="text-2xl">17</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Doces é Bolos por Encomenda</h3>
              <p className="text-white/60 text-sm">Brigadeiro gourmet, bolo de pote, festa na caixa</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <span className="text-2xl">18</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Café da Manhã Delivery</h3>
              <p className="text-white/60 text-sm">Cestas de café da manhã para datas especiais</p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4"> Investimentos é Finanças</h2>
      
      <div className="space-y-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <span className="text-2xl">19</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Dividendos de Ações/FIIs</h3>
              <p className="text-white/60 text-sm">Receba renda passiva mensal de investimentos</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5">
          <div className="flex items-start gap-4">
            <span className="text-2xl">20</span>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Alugar Quarto/Vaga (Airbnb)</h3>
              <p className="text-white/60 text-sm">Monetize espaço ocioso em sua casa</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600/30 to-blue-600/30 border-2 border-emerald-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-2"> Por onde começar?</h3>
        <ol className="text-white/80 space-y-2">
          <li>1. Escolha <strong>UMA</strong> opção que combine com você</li>
          <li>2. Dedique pelo menos <strong>5 horas por semana</strong></li>
          <li>3. Reinvista os primeiros ganhos no negócio</li>
          <li>4. Só depois de 3 meses, avalie se quer expandir ou trocar</li>
        </ol>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Qual a melhor forma de ganhar renda extra?",
                      "answer": "Depende das suas habilidades. Opções populares: freelancer, motorista de app, vendas online, aulas particulares."
              },
              {
                      "question": "Quanto posso ganhar com renda extra?",
                      "answer": "Freelancers podem ganhar de R$ 500 a R$ 5.000+ por mês. Motoristas de app faturam R$ 2.000-4.000."
              },
              {
                      "question": "Preciso declarar renda extra no IR?",
                      "answer": "Sim, toda renda deve ser declarada. Se ultrapassar o limite mensal, pode haver imposto via carnê-leão."
              },
              {
                      "question": "Como conciliar renda extra com emprego CLT?",
                      "answer": "Verifique se seu contrato permite atividades externas. Use horários livres é cuidado para não prejudicar o trabalho principal."
              }
      ]} />
    </ArticleLayout>
  );
};

export default RendaExtra20Formas;
