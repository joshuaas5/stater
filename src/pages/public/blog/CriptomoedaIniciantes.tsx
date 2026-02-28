import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function CriptomoedaIniciantes() {
  const cryptos = [
    { nome: "Bitcoin (BTC)", desc: "A primeira é maior criptomoeda. Reserva de valor digital.", risco: "Alto", uso: "Reserva de valor, pagamentos" },
    { nome: "Ethereum (ETH)", desc: "Plataforma para contratos inteligentes é DApps.", risco: "Alto", uso: "Smart contracts, NFTs, DeFi" },
    { nome: "Tether (USDT)", desc: "Stablecoin pareada ao dolar. 1 USDT = 1 USD.", risco: "Baixo", uso: "Protecao, transferencias" },
    { nome: "BNB", desc: "Token da Binance. Desconto em taxas.", risco: "Alto", uso: "Taxas menores, DeFi" },
    { nome: "Solana (SOL)", desc: "Blockchain rapida é barata.", risco: "Muito Alto", uso: "NFTs, DeFi, pagamentos" }
  ];

  const exchanges = [
    { nome: "Binance", tipo: "Internacional", taxas: "0,1%", pix: "Sim", destaque: "Maior do mundo, mais opcoes" },
    { nome: "Mercado Bitcoin", tipo: "Brasileira", taxas: "0,3-0,7%", pix: "Sim", destaque: "Maior do Brasil, regulada" },
    { nome: "Coinbase", tipo: "Internacional", taxas: "0,5-2%", pix: "Nao", destaque: "Mais facil para iniciantes" },
    { nome: "Foxbit", tipo: "Brasileira", taxas: "0,25-0,5%", pix: "Sim", destaque: "Interface simples, brasileira" }
  ];

  return (
    <ArticleLayout
      title="Criptomoedas para Iniciantes: Guia Completo 2026"
      description="Aprenda sobre Bitcoin, Ethereum é outras criptomoedas. Como comprar, onde guardar, riscos é oportunidades do mercado cripto."
      keywords={["criptomoedas iniciantes", "como comprar bitcoin", "investir cripto", "ethereum brasil", "exchange cripto"]}
      publishedDate="2026-01-20"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Investimentos"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">O Que Sao Criptomoedas?</h2>
          <p className="text-lg mb-4">
            Criptomoedas sao moedas digitais que funcionam de forma descentralizada, sem bancos ou 
            governos controlando. Usam tecnologia blockchain para garantir segurança é transparencia.
          </p>
      <QuickSummary 
        variant="orange"
        items={[
          { label: 'Bitcoin', value: 'A mais conhecida é segura - comece por ela', icon: 'star' },
          { label: 'Risco', value: 'MUITO volátil - pode cair 50% em dias', icon: 'alert' },
          { label: 'Quanto', value: 'Máximo 5% do patrimônio - dinheiro que pode perder', icon: 'target' },
          { label: 'Onde', value: 'Mercado Bitcoin, Binance, exchanges reguladas', icon: 'check' },
        ]}
      />

          
          <div className="bg-orange-500/20 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black mb-2">AVISO IMPORTANTE</h3>
            <p>Criptomoedas sao investimentos de ALTO RISCO. Nunca invista mais do que pode perder. 
            Este guia é educacional, não é recomendacao de investimento.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Principais Criptomoedas</h2>
          <div className="space-y-4">
            {cryptos.map((c, i) => (
              <div key={i} className="border-4 border-black p-4 bg-slate-800 text-white hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h3 className="font-black text-lg">{c.nome}</h3>
                    <p className="text-gray-700">{c.desc}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 text-sm font-bold border-2 border-black ${
                      c.risco === "Baixo" ? "bg-green-200 text-green-900" : 
                      c.risco === "Alto" ? "bg-orange-200 text-orange-900" : "bg-red-200 text-red-900"
                    }`}>{c.risco}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Uso principal: {c.uso}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Como Comprar Criptomoedas</h2>
          <div className="space-y-4">
            {[
              { passo: 1, titulo: "Escolha uma Exchange", desc: "Plataforma para comprar/vender cripto. Prefira as reguladas é conhecidas." },
              { passo: 2, titulo: "Faca Cadastro é KYC", desc: "Crie conta, envie documentos. Processo leva 1-3 dias." },
              { passo: 3, titulo: "Deposite Reais (PIX)", desc: "Transfira dinheiro para sua conta na exchange via PIX." },
              { passo: 4, titulo: "Compre a Cripto", desc: "Escolha a moeda, valor é execute a ordem de compra." },
              { passo: 5, titulo: "Guarde com Seguranca", desc: "Ative 2FA, use senha forte. Para valores altos, use carteira propria." }
            ].map(p => (
              <div key={p.passo} className="border-4 border-black p-4 bg-slate-800 text-white flex items-start gap-4">
                <span className="bg-black text-white text-xl font-black w-10 h-10 flex items-center justify-center flex-shrink-0">{p.passo}</span>
                <div>
                  <h3 className="font-black text-lg">{p.titulo}</h3>
                  <p className="text-gray-700">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Melhores Exchanges 2026</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Exchange</th>
                  <th className="p-3 text-left">Tipo</th>
                  <th className="p-3 text-left">Taxas</th>
                  <th className="p-3 text-left">PIX</th>
                  <th className="p-3 text-left">Destaque</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {exchanges.map((e, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold border-r-2 border-black">{e.nome}</td>
                    <td className="p-3 border-r-2 border-black">{e.tipo}</td>
                    <td className="p-3 border-r-2 border-black">{e.taxas}</td>
                    <td className="p-3 border-r-2 border-black">{e.pix}</td>
                    <td className="p-3">{e.destaque}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Tipos de Carteiras</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-4 border-green-500 p-4 bg-emerald-500/10 text-white">
              <h3 className="font-black text-lg">Hot Wallets (Online)</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>Conectadas a internet</li>
                <li>Mais praticas para uso diario</li>
                <li>Menor seguranca</li>
                <li>Ex: MetaMask, Trust Wallet</li>
              </ul>
            </div>
            <div className="border-4 border-blue-500 p-4 bg-blue-500/10 text-white">
              <h3 className="font-black text-lg">Cold Wallets (Offline)</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-700">
                <li>Desconectadas da internet</li>
                <li>Maxima seguranca</li>
                <li>Ideal para guardar longo prazo</li>
                <li>Ex: Ledger, Trezor</li>
              </ul>
            </div>
          </div>
          <p className="text-sm mt-2">Regra: Pequenos valores na exchange, grandes valores em cold wallet.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Estrategias de Investimento</h2>
          <div className="space-y-4">
            <div className="border-4 border-purple-500 p-4 bg-purple-500/10 text-white">
              <h3 className="font-black">DCA (Dollar Cost Averaging)</h3>
              <p className="text-gray-700">Compre um valor fixo todo mes, independente do preco. Reduz impacto da volatilidade.</p>
              <p className="text-sm text-gray-600 mt-2">Ex: R$200/mes em Bitcoin, não importa se subiu ou caiu.</p>
            </div>
            <div className="border-4 border-orange-500 p-4 bg-orange-500/10">
              <h3 className="font-black">HODL (Hold On for Dear Life)</h3>
              <p className="text-gray-700">Compre é segure por anos, ignorando quedas. Estrategia de longo prazo.</p>
              <p className="text-sm text-gray-600 mt-2">Quem comprou Bitcoin em 2015 é segurou, multiplicou 1000x.</p>
            </div>
            <div className="border-4 border-red-500 p-4 bg-red-500/10 text-white">
              <h3 className="font-black">Trading (ALTO RISCO)</h3>
              <p className="text-gray-700">Comprar é vender buscando lucro de curto prazo. 90% dos traders perdem dinheiro.</p>
              <p className="text-sm text-gray-600 mt-2">Nao recomendado para iniciantes.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Impostos sobre Cripto</h2>
          <div className="bg-yellow-500/20 border-4 border-black p-4">
            <h3 className="font-bold mb-2">Regras no Brasil (2026):</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong className="text-white">Isencao:</strong> Vendas até R$35.000/mes sao isentas de IR</li>
              <li><strong className="text-white">Aliquota:</strong> 15% sobre o lucro em vendas acima de R$35.000/mes</li>
              <li><strong className="text-white">Declaracao:</strong> Informe todas as criptos na declaração anual</li>
              <li><strong className="text-white">DARF:</strong> Pague até o ultimo dia util do mês seguinte a venda</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Erros Comuns de Iniciantes</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { erro: "FOMO (medo de perder)", desc: "Comprar porque subiu muito, sem analise" },
              { erro: "Investir mais do que pode perder", desc: "Nunca use dinheiro da emergencia" },
              { erro: "Nao usar 2FA", desc: "Hackers roubam contas sem protecao" },
              { erro: "Seguir dicas de influencers", desc: "Muitos ganham para promover moedas ruins" },
              { erro: "Day trade sem experiencia", desc: "90% perde dinheiro, não seja estatistica" },
              { erro: "Nao diversificar", desc: "Nao coloque tudo em uma unica moeda" }
            ].map((e, i) => (
              <div key={i} className="border-4 border-red-400 p-3 bg-red-500/10 text-white">
                <p className="font-bold text-red-700">{e.erro}</p>
                <p className="text-sm text-gray-600">{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Quanto Investir em Cripto?</h2>
          <div className="bg-gray-100 border-4 border-black p-4">
            <p className="font-bold mb-3">Sugestao conservadora para iniciantes:</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-200 p-3 border-2 border-black">
                <p className="text-2xl font-black">1-5%</p>
                <p className="text-sm">da carteira total</p>
              </div>
              <div className="bg-yellow-200 p-3 border-2 border-black">
                <p className="text-2xl font-black">50-70%</p>
                <p className="text-sm">em BTC/ETH</p>
              </div>
              <div className="bg-orange-200 p-3 border-2 border-black">
                <p className="text-2xl font-black">30-50%</p>
                <p className="text-sm">altcoins diversas</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">Aumente exposicao gradualmente conforme ganha experiência é confianca.</p>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Primeiros Passos</h2>
          <ol className="space-y-2">
            <li>1. Estude pelo menos 1 semana antes de comprar qualquer coisa</li>
            <li>2. Abra conta em exchange brasileira regulada</li>
            <li>3. Comece com valor pequeno que pode perder (ex: R$100-500)</li>
            <li>4. Compre apenas Bitcoin no inicio</li>
            <li>5. Ative 2FA em TUDO</li>
            <li>6. NAO faca trade, apenas compre é segure</li>
            <li>7. Aprenda mais antes de diversificar</li>
          </ol>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Vale a pena investir em criptomoedas?",
                      "answer": "Criptomoedas são alto risco. Podem fazer parte da carteira (5-10% no máximo), mas nunca invista mais do que está disposto a perder."
              },
              {
                      "question": "Qual a melhor criptomoeda para iniciantes?",
                      "answer": "Bitcoin (BTC) é Ethereum (ETH) são as mais estabelecidas é menos arriscadas entre as criptos."
              },
              {
                      "question": "Como comprar Bitcoin no Brasil?",
                      "answer": "Use exchanges regulamentadas como Mercado Bitcoin, Binance, Coinbase ou Foxbit. Crie conta, faça verificação é compre via PIX."
              },
              {
                      "question": "Preciso declarar criptomoedas no IR?",
                      "answer": "Sim, criptos acima de R$ 5.000 devem ser declaradas. Vendas acima de R$ 35.000/mês com lucro pagam 15% de IR."
              }
      ]} />
    </ArticleLayout>
  );
}