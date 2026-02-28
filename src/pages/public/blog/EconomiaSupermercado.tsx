import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const EconomiaSupermercado: React.FC = () => {
  return (
    <ArticleLayout 
      title="30 Dicas para Economizar no Supermercado em 2026" 
      description="Estratégias comprovadas para cortar gastos nas compras do mes. Economize até 40% no supermercado com essas técnicas." 
      canonical="/blog/economia-supermercado" 
      keywords="economizar supermercado, como gastar menos compras, dicas economia mercado, lista de compras, promoções supermercado" 
      date="5 de Fevereiro de 2026" 
      readTime="10 min" 
      relatedArticles={[
        { title: 'Orcamento Famíliar', slug: 'orcamento-famíliar' }, 
        { title: 'Como Sair das Dividas', slug: 'como-sair-das-dividas' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Supermercado é onde <strong className="text-red-400">mais se desperdicha dinheiro</strong>. A média brasileira gasta 30% mais do que precisa. Veja como <strong className="text-emerald-400">economizar até 40%</strong>.</p>
      <QuickSummary 
        variant="green"
        items={[
          { label: 'Lista', value: 'SEMPRE vá com lista - evita 40% de compras por impulso', icon: 'target' },
          { label: 'Marcas', value: 'Marcas próprias são 30-50% mais baratas', icon: 'money' },
          { label: 'Dia', value: 'Terça é quarta têm mais promoções de hortifruti', icon: 'clock' },
          { label: 'Apps', value: 'Méliuz, Picpay, Ame dão cashback em mercados', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-emerald-400 mb-3">Economia Potencial</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-400">R$500</p>
            <p className="text-white/50 text-sm">economia mensal</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-400">R$6.000</p>
            <p className="text-white/50 text-sm">economia anual</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-emerald-400">40%</p>
            <p className="text-white/50 text-sm">reducao possível</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Antes de Ir ao Mercado</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
          <div>
            <p className="font-bold text-white">Faça lista é siga ela</p>
            <p className="text-white/60 text-sm">90% das compras por impulso acontecem por falta de lista.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
          <div>
            <p className="font-bold text-white">Va alimentado</p>
            <p className="text-white/60 text-sm">Fome = compras desnecessárias. Estudo mostra 30% mais gastos com fome.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
          <div>
            <p className="font-bold text-white">Defina orcamento máximo</p>
            <p className="text-white/60 text-sm">Leve dinheiro contado ou limite no cartao. Sem flexibilidade.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">4</span>
          <div>
            <p className="font-bold text-white">Confira dispensa antes</p>
            <p className="text-white/60 text-sm">Quantas vezes você comprou algo que já tinha em casa?</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">5</span>
          <div>
            <p className="font-bold text-white">Compare preços online</p>
            <p className="text-white/60 text-sm">Apps como Menor Preco mostram onde está mais barato.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Dentro do Supermercado</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-blue-500/10 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">6</span>
          <div>
            <p className="font-bold text-white">Olhe para baixo é para cima</p>
            <p className="text-white/60 text-sm">Produtos mais caros ficam na altura dos olhos. Baratos ficam em cima é embaixo.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-blue-500/10 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">7</span>
          <div>
            <p className="font-bold text-white">Calcule preço por kg/litro</p>
            <p className="text-white/60 text-sm">Embalagem maior nem sempre é mais barata. Faça a conta.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-blue-500/10 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">8</span>
          <div>
            <p className="font-bold text-white">Evite pontas de gondola</p>
            <p className="text-white/60 text-sm">Produtos em destaque raramente sao os mais baratos. E marketing.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-blue-500/10 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">9</span>
          <div>
            <p className="font-bold text-white">Experimente marcas próprias</p>
            <p className="text-white/60 text-sm">Qualidade similar, preço 20-40% menor. Teste antes de rejeitar.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-blue-500/10 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">10</span>
          <div>
            <p className="font-bold text-white">Fuja do caixa com doces</p>
            <p className="text-white/60 text-sm">Caixa preferêncial não tem tentações. Use sempre.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Estratégias Avancadas</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-purple-500/10 text-white border-2 border-purple-500 rounded-xl p-4">
          <p className="font-bold text-purple-400">11. Compre da estacao</p>
          <p className="text-white/60 text-sm">Frutas é verduras da epoca sao até 50% mais baratas.</p>
        </div>
        <div className="bg-purple-500/10 text-white border-2 border-purple-500 rounded-xl p-4">
          <p className="font-bold text-purple-400">12. Va em dias específicos</p>
          <p className="text-white/60 text-sm">Terça é quarta tem promoção de hortifruti em muitas redes.</p>
        </div>
        <div className="bg-purple-500/10 text-white border-2 border-purple-500 rounded-xl p-4">
          <p className="font-bold text-purple-400">13. Aproveite vencimento proximo</p>
          <p className="text-white/60 text-sm">Se for usar rápido, produtos perto do vencimento tem desconto.</p>
        </div>
        <div className="bg-purple-500/10 text-white border-2 border-purple-500 rounded-xl p-4">
          <p className="font-bold text-purple-400">14. Compre a granel</p>
          <p className="text-white/60 text-sm">Leve só o que precisa. Evita desperdicio é sobra.</p>
        </div>
        <div className="bg-purple-500/10 text-white border-2 border-purple-500 rounded-xl p-4">
          <p className="font-bold text-purple-400">15. Faça substituicoes inteligentes</p>
          <p className="text-white/60 text-sm">Ovo no lugar de carne, aveia no lugar de cereal importado.</p>
        </div>
        <div className="bg-purple-500/10 text-white border-2 border-purple-500 rounded-xl p-4">
          <p className="font-bold text-purple-400">16. Congele em porcoes</p>
          <p className="text-white/60 text-sm">Compre em quantidade maior na promoção é congele dividido.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Armadilhas do Supermercado</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Leve 3 pague 2</p>
          <p className="text-white/60 text-sm">So vale se você realmente ia comprar 3. Se não, é prejuízo.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Produtos na entrada</p>
          <p className="text-white/60 text-sm">Flores, paes frescos, frutas bonitas - preparados para você gastar antes de pensar.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Musica ambiente</p>
          <p className="text-white/60 text-sm">Musica lenta faz você andar devagar é comprar mais. Use fone se precisar.</p>
        </div>
        <div className="bg-red-500/10 text-white border-l-4 border-red-500 rounded-r-xl p-4">
          <p className="font-bold text-red-400">Carrinho grande</p>
          <p className="text-white/60 text-sm">Carrinho vazio parece que falta coisa. Use cesta se compras pequenas.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Mais Dicas Praticas</h2>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 mb-8">
        <ul className="text-white/60 space-y-2">
          <li><strong className="text-white">17.</strong> Cadastre-se em programas de fidelidade (Pao de Acucar Mais, Carrefour, etc)</li>
          <li><strong className="text-white">18.</strong> Use cashback (Meliuz, Ame, PicPay)</li>
          <li><strong className="text-white">19.</strong> Compare entre atacadao, supermercado é feira</li>
          <li><strong className="text-white">20.</strong> Faça compras mensais de não pereciveis + semanais de frescos</li>
          <li><strong className="text-white">21.</strong> Evite levar crianças (aumenta compras em média 30%)</li>
          <li><strong className="text-white">22.</strong> Va sozinho ou com parceiro alinhado</li>
          <li><strong className="text-white">23.</strong> Aprenda a ler etiquetas nutricionais</li>
          <li><strong className="text-white">24.</strong> Cozinhe mais, compre menos processados</li>
          <li><strong className="text-white">25.</strong> Planeje cardapio semanal antes de fazer lista</li>
          <li><strong className="text-white">26.</strong> Congele restos de comida antes de estragar</li>
          <li><strong className="text-white">27.</strong> Use apps de cupons (Cuponeria, Picodi)</li>
          <li><strong className="text-white">28.</strong> Compre carne no acougue (mais barato que bandeja)</li>
          <li><strong className="text-white">29.</strong> Verifique nota fiscal antes de sair</li>
          <li><strong className="text-white">30.</strong> Registre gastos para ver onde pode cortar mais</li>
        </ul>
      </div>

      <div className="bg-gradient-to-r from-emerald-600/30 to-blue-600/30 border-2 border-emerald-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-3">Desafio de 30 Dias</h3>
        <p className="text-white/70">
          Aplique essas dicas durante <strong className="text-emerald-400">30 dias</strong> é compare o total gasto com o mês anterior. A maioria das pessoas economiza entre <strong className="text-emerald-400">R$300 é R$600</strong> por mes. Esse dinheiro pode ir direto para sua reserva de emergência!
        </p>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Como economizar no supermercado?",
                      "answer": "Faça lista é siga, compare preço por kg/L, evite ir com fome, use cashback é cupons, é considere marcas próprias."
              },
              {
                      "question": "Qual dia é mais barato ir ao mercado?",
                      "answer": "Geralmente terça é quarta têm promoções de hortifruti. Evite fins de semana quando os preços costumam ser mais altos."
              },
              {
                      "question": "Vale a pena comprar em atacado?",
                      "answer": "Para produtos não perecíveis é de alto consumo, sim. Mas compare preço por unidade é cuidado para não desperdiçar."
              },
              {
                      "question": "Apps de cashback funcionam mesmo?",
                      "answer": "Sim, apps como Méliuz, Ame é PicPay devolvem 1-20% das compras. Pequenas economias somam ao longo do tempo."
              }
      ]} />
    </ArticleLayout>
  );
};

export default EconomiaSupermercado;