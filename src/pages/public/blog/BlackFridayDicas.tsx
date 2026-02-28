import React from 'react';
import ArticleLayout from '@/components/ArticleLayout';
import FAQSchema from '@/components/FAQSchema';
import QuickSummary from '@/components/QuickSummary';

const BlackFridayDicas: React.FC = () => {
  return (
    <ArticleLayout 
      title="Black Friday: 15 Dicas para Não Cair em Ciladas" 
      description="Como identificar promoções falsas, preparar sua lista é realmente economizar na Black Friday. Não seja enganado!" 
      canonical="/blog/black-friday-dicas" 
      keywords="black friday dicas, promoções black friday, como economizar black friday, ciladas black friday, desconto falso" 
      date="6 de Fevereiro de 2026" 
      readTime="8 min" 
      relatedArticles={[
        { title: 'Economia no Supermercado', slug: 'economia-supermercado' }, 
        { title: 'Cartao de Crédito', slug: 'cartao-crédito-vilao-aliado' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">Black Friday pode ser uma <strong className="text-emerald-400">oportunidade de ouro</strong> ou uma <strong className="text-red-400">armadilha perfeita</strong>. Aprenda a diferenciar as duas.</p>
      <QuickSummary 
        variant="orange"
        items={[
          { label: 'Antes', value: 'Pesquise preços 30 dias antes - use Zoom é Buscapé', icon: 'target' },
          { label: 'Cuidado', value: 'Metade da metade do dobro NÃO é desconto real', icon: 'alert' },
          { label: 'Sites', value: 'Pelando, Promobit é Hardmob mostram promoções reais', icon: 'check' },
          { label: 'Dica', value: 'Só compre o que já estava planejado - faça lista antes', icon: 'lightbulb' },
        ]}
      />

      
      <div className="bg-red-500/10 text-white border-2 border-red-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-red-400 mb-3">A Black Fraude</h3>
        <p className="text-white/70">
          Estudos mostram que <strong className="text-white">60% dos produtos</strong> tem preço aumentado antes da Black Friday para depois dar desconto falso. A famosa <strong className="text-red-400">metade do dobro</strong>.
        </p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Antes da Black Friday</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">1</span>
          <div>
            <p className="font-bold text-white">Faça lista do que precisa</p>
            <p className="text-white/60 text-sm">Compre APENAS o que já estava planejando. Promoção de algo que você não precisa é prejuízo.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">2</span>
          <div>
            <p className="font-bold text-white">Monitore preços com antecedencia</p>
            <p className="text-white/60 text-sm">Use sites como Zoom, Buscape, JaCotei para ver histórico de preço desde setembro.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">3</span>
          <div>
            <p className="font-bold text-white">Defina orcamento máximo</p>
            <p className="text-white/60 text-sm">Não comprometa o 13o inteiro. Tenha limite é não extrapole.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">4</span>
          <div>
            <p className="font-bold text-white">Cadastre-se nas lojas favoritas</p>
            <p className="text-white/60 text-sm">Muitas lojas dao desconto extra para clientes cadastrados ou enviam ofertas antecipadas.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-emerald-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">5</span>
          <div>
            <p className="font-bold text-white">Limpe cookies do navegador</p>
            <p className="text-white/60 text-sm">Algumas lojas mostram preços diferentes baseado no seu histórico de navegacao.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Durante a Black Friday</h2>
      <div className="space-y-3 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-blue-500/10 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">6</span>
          <div>
            <p className="font-bold text-white">Compare preço total</p>
            <p className="text-white/60 text-sm">Inclua frete! As vezes o frete caro come todo o desconto.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-blue-500/10 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">7</span>
          <div>
            <p className="font-bold text-white">Desconfie de descontos absurdos</p>
            <p className="text-white/60 text-sm">70%, 80% de desconto? Provavelmente é golpe ou produto com defeito.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-blue-500/10 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">8</span>
          <div>
            <p className="font-bold text-white">Verifique reputacao da loja</p>
            <p className="text-white/60 text-sm">Reclame Aqui, avaliações, CNPJ. Lojas desconhecidas podem ser golpe.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-blue-500/10 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">9</span>
          <div>
            <p className="font-bold text-white">Não compre por impulso</p>
            <p className="text-white/60 text-sm">Cronometro de urgência é técnica de marketing. Respire antes de clicar.</p>
          </div>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4 flex items-start gap-3">
          <span className="bg-blue-500/10 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">10</span>
          <div>
            <p className="font-bold text-white">Use cartao virtual</p>
            <p className="text-white/60 text-sm">Gere cartao virtual no app do banco para cada compra. Mais segurança.</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Pagamento Inteligente</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-xl p-4">
          <p className="font-bold text-emerald-400">PIX com desconto</p>
          <p className="text-white/60 text-sm">Muitas lojas dao 5-10% off no PIX. Se tem o dinheiro, vale a pena.</p>
        </div>
        <div className="bg-blue-500/10 text-white border-2 border-blue-500 rounded-xl p-4">
          <p className="font-bold text-blue-400">Cartao com cashback</p>
          <p className="text-white/60 text-sm">Se parcelar, use cartao que da cashback ou milhas.</p>
        </div>
        <div className="bg-yellow-500/10 text-white border-2 border-yellow-500 rounded-xl p-4">
          <p className="font-bold text-yellow-400">Parcelar SEM juros</p>
          <p className="text-white/60 text-sm">So parcele se for sem juros. Com juros, promoção vira prejuízo.</p>
        </div>
        <div className="bg-red-500/10 text-white border-2 border-red-500 rounded-xl p-4">
          <p className="font-bold text-red-400">Nunca use boleto em loja desconhecida</p>
          <p className="text-white/60 text-sm">Dificil estornar. Use cartao para ter protecao.</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Mais Dicas Essenciais</h2>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-5 mb-8">
        <ul className="text-white/70 space-y-2">
          <li><strong className="text-white">11.</strong> Print tudo! Preco, descricao, prazo de entrega. Serve como prova.</li>
          <li><strong className="text-white">12.</strong> Verifique garantia é politica de troca antes de comprar.</li>
          <li><strong className="text-white">13.</strong> Não clique em links de email/WhatsApp. Va direto ao site da loja.</li>
          <li><strong className="text-white">14.</strong> Verifique se o site tem cadeado (HTTPS) é dominio correto.</li>
          <li><strong className="text-white">15.</strong> Lembre-se: você tem 7 dias para devolver compras online (CDC).</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">O que Geralmente TEM Desconto Real</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-xl p-4">
          <p className="font-bold text-emerald-400">Vale</p>
          <ul className="text-white/60 text-sm mt-2 space-y-1">
            <li>- Eletronicos (TVs, celulares)</li>
            <li>- Eletrodomésticos</li>
            <li>- Games é consoles</li>
            <li>- Roupas de marca</li>
          </ul>
        </div>
        <div className="bg-red-500/10 text-white border border-red-500/30 rounded-xl p-4">
          <p className="font-bold text-red-400">Cuidado</p>
          <ul className="text-white/60 text-sm mt-2 space-y-1">
            <li>- Moveis (geralmente não tem desconto real)</li>
            <li>- Cursos online (tem promoção o ano todo)</li>
            <li>- Passagens aéreas (raramente vale)</li>
            <li>- Produtos de beleza (verifique validade)</li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-600/30 to-blue-600/30 border-2 border-emerald-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-3">Resumo Final</h3>
        <p className="text-white/70">
          A melhor Black Friday é aquela onde você compra <strong className="text-emerald-400">o que já ia comprar</strong>, por um preço <strong className="text-emerald-400">realmente menor</strong>, com dinheiro que <strong className="text-emerald-400">ja tinha guardado</strong>. Se não for assim, você não economizou - gastou dinheiro que não tinha planejado.
        </p>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Como saber se o desconto é real?",
                      "answer": "Monitore preços semanas antes com sites como Zoom, Buscapé é JáCotei. Desconfie de descontos acima de 50% em produtos caros."
              },
              {
                      "question": "Quando comprar na Black Friday?",
                      "answer": "Eletrônicos, eletrodomésticos é tecnologia costumam ter bons descontos reais. Roupas é cosméticos podem ser armadilha."
              },
              {
                      "question": "Devo usar cartão de crédito ou débito?",
                      "answer": "Cartão de crédito oferece mais proteção contra fraudes é possibilidade de parcelamento. Mas só compre se puder pagar à vista."
              },
              {
                      "question": "Como evitar compras por impulso?",
                      "answer": "Faça lista com antecedência, defina orçamento máximo, espere 24h antes de comprar é pergunte: eu compraria sem desconto?"
              }
      ]} />
    </ArticleLayout>
  );
};

export default BlackFridayDicas;