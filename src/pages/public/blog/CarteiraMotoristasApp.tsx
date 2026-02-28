import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function CarteiraMotoristasApp() {
  const apps = [
    { nome: "99", tipo: "Corridas", ganho: "R$25-45/h (horário pico)", taxa: "20-25%", bonus: "Ganhos extras por metas" },
    { nome: "Uber", tipo: "Corridas", ganho: "R$20-40/h (horário pico)", taxa: "25%", bonus: "Promocoes semanais" },
    { nome: "iFood", tipo: "Entregas", ganho: "R$15-30/h", taxa: "Variavel", bonus: "Bonus por entrega rapida" },
    { nome: "Rappi", tipo: "Entregas", ganho: "R$12-25/h", taxa: "Variavel", bonus: "Gorjetas diretas" },
    { nome: "Uber Eats", tipo: "Entregas", ganho: "R$15-28/h", taxa: "25%", bonus: "Junta com Uber corridas" },
    { nome: "Loggi", tipo: "Entregas pacotes", ganho: "R$150-300/dia", taxa: "Fixa por entrega", bonus: "Rotas otimizadas" }
  ];

  return (
    <ArticleLayout
      title="Ganhar Dinheiro com Apps: Uber, 99, iFood - Guia Completo"
      description="Guia completo para motoristas é entregadores de app. Quanto da para ganhar, custos reais, melhores horários é dicas para maximizar lucro."
      keywords={["ganhar dinheiro uber", "motorista 99", "entregador ifood", "renda extra app", "quanto ganha uber"]}
      publishedDate="2026-01-21"
      modifiedDate="2026-01-21"
      author="Stater"
      category="Renda Extra"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Realidade dos Apps de Mobilidade</h2>
          <p className="text-lg mb-4">
            Trabalhar com apps pode ser uma otima fonte de renda, mas é preciso entender os custos 
            reais para não ter surpresas. Este guia mostra a verdade sobre ganhos é despesas.
          </p>
      <QuickSummary 
        variant="orange"
        items={[
          { label: 'Ganhos', value: 'R$2.000-6.000/mês dependendo das horas é cidade', icon: 'money' },
          { label: 'Custos', value: 'Gasolina, manutenção, seguro, IPVA = 40-50% do bruto', icon: 'alert' },
          { label: 'Horários', value: 'Pico manhã (7-9h) é noite (18-22h) pagam mais', icon: 'clock' },
          { label: 'Dica', value: 'Trabalhe em 2-3 apps simultaneamente para maximizar corridas', icon: 'lightbulb' },
        ]}
      />

          
          <div className="bg-yellow-500/20 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold">VERDADE INCONVENIENTE:</p>
            <p>O valor bruto que aparece no app NAO é seu lucro. Você precisa descontar combustivel, manutenção, depreciacao, impostos é mais.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Comparativo de Apps</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">App</th>
                  <th className="p-3 text-left">Tipo</th>
                  <th className="p-3 text-left">Ganho/Hora</th>
                  <th className="p-3 text-left">Taxa</th>
                  <th className="p-3 text-left">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold border-r-2 border-black">{a.nome}</td>
                    <td className="p-3 border-r-2 border-black">{a.tipo}</td>
                    <td className="p-3 border-r-2 border-black text-green-700">{a.ganho}</td>
                    <td className="p-3 border-r-2 border-black text-red-600">{a.taxa}</td>
                    <td className="p-3">{a.bonus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Custos Reais - Motorista de App</h2>
          <div className="bg-red-500/10 text-white border-4 border-red-400 p-4">
            <p className="font-bold mb-3">Exemplo: Uber/99 com carro popular (Onix, HB20)</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span>Ganho Bruto Mensal (40h/semana):</span>
                <span className="font-bold text-green-700">R$ 6.000</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-red-600">
                <span>(-) Combustivel (~R$1.200):</span>
                <span>-R$ 1.200</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-red-600">
                <span>(-) Manutenção/Pneus/Oleo:</span>
                <span>-R$ 400</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-red-600">
                <span>(-) Depreciacao do veiculo:</span>
                <span>-R$ 500</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-red-600">
                <span>(-) Seguro + IPVA proporcional:</span>
                <span>-R$ 350</span>
              </div>
              <div className="flex justify-between border-b pb-1 text-red-600">
                <span>(-) INSS (MEI ou Autônomo):</span>
                <span>-R$ 150</span>
              </div>
              <div className="flex justify-between font-black text-lg mt-2">
                <span>= LUCRO REAL:</span>
                <span className="text-blue-700">R$ 3.400</span>
              </div>
            </div>
            <p className="mt-3 text-xs">*Valores aproximados. Variam por cidade, tipo de carro é estilo de conducao.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Melhores Horários para Trabalhar</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="border-4 border-green-500 p-4 bg-emerald-500/10 text-white">
              <h3 className="font-black text-green-800">MELHORES</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>- Segunda a sexta 7h-9h</li>
                <li>- Segunda a sexta 17h-20h</li>
                <li>- Sexta/Sabado 22h-3h</li>
                <li>- Dias de chuva (qualquer hora)</li>
                <li>- Eventos grandes na cidade</li>
              </ul>
            </div>
            <div className="border-4 border-yellow-500 p-4 bg-yellow-500/10 text-white">
              <h3 className="font-black text-yellow-800">MEDIANOS</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>- Segunda a sexta 12h-14h</li>
                <li>- Sabado pela manha</li>
                <li>- Domingo a noite</li>
              </ul>
            </div>
            <div className="border-4 border-red-500 p-4 bg-red-500/10 text-white">
              <h3 className="font-black text-red-800">EVITAR</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>- Segunda a sexta 10h-11h</li>
                <li>- Segunda a sexta 14h-16h</li>
                <li>- Domingo de manha</li>
                <li>- Feriados sem eventos</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Dicas para Maximizar Ganhos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { dica: "Trabalhe nos horários de pico", desc: "Tarifa dinamica pode dobrar ou triplicar ganhos" },
              { dica: "Fique em regioes estrategicas", desc: "Perto de aeroportos, shoppings, bairros nobres" },
              { dica: "Mantenha avaliacao alta", desc: "Nota acima de 4.9 = mais corridas é melhores passageiros" },
              { dica: "Use vários apps simultaneamente", desc: "99 é Uber juntos aumentam demanda" },
              { dica: "Carro econômico", desc: "Combustivel é 30-40% do custo. Carro 1.0 economiza muito" },
              { dica: "Dirija com economia", desc: "Ar-condicionado ligado = +20% combustivel" },
              { dica: "Cumprimente metas de bonus", desc: "Muitos apps pagam extra por X corridas" },
              { dica: "Evite corridas muito longas para fora", desc: "Pode demorar para conseguir passageiro de volta" }
            ].map((d, i) => (
              <div key={i} className="border-4 border-black p-4 bg-slate-800 text-white">
                <h4 className="font-black">{d.dica}</h4>
                <p className="text-sm text-gray-700">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Entregador de Moto vs Carro</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-4 border-blue-500 p-4 bg-blue-500/10 text-white">
              <h3 className="font-black text-blue-800">MOTO</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>+ Combustivel mais barato</li>
                <li>+ Passa no transito</li>
                <li>+ Manutenção mais barata</li>
                <li>+ Estaciona fácil</li>
                <li>- Mais perigoso</li>
                <li>- Chuva atrapalha muito</li>
                <li>- Cansaco fisico maior</li>
              </ul>
            </div>
            <div className="border-4 border-purple-500 p-4 bg-purple-500/10 text-white">
              <h3 className="font-black text-purple-800">CARRO</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>+ Mais seguro</li>
                <li>+ Funciona na chuva</li>
                <li>+ Pode fazer corridas tambem</li>
                <li>+ Mais confortavel</li>
                <li>- Combustivel mais caro</li>
                <li>- Transito atrapalha</li>
                <li>- Estacionamento difícil</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Quanto Guardar por Mes</h2>
          <div className="bg-gray-100 border-4 border-black p-4">
            <p className="font-bold mb-3">Distribuicao recomendada do ganho BRUTO:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
              <div className="bg-red-200 p-2 border-2 border-black">
                <p className="font-black">30%</p>
                <p>Combustivel</p>
              </div>
              <div className="bg-orange-200 p-2 border-2 border-black">
                <p className="font-black">15%</p>
                <p>Manutenção</p>
              </div>
              <div className="bg-yellow-200 p-2 border-2 border-black">
                <p className="font-black">10%</p>
                <p>Reserva Emergência</p>
              </div>
              <div className="bg-green-200 p-2 border-2 border-black">
                <p className="font-black">45%</p>
                <p>Seu Lucro</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Vale a Pena?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-green-400 mb-2">SIM, SE:</h3>
              <ul className="space-y-1 text-sm">
                <li>- Precisa de flexibilidade</li>
                <li>- Tem carro/moto quitado</li>
                <li>- Trabalha nos horários certos</li>
                <li>- Controla bem os custos</li>
                <li>- E renda complementar</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-red-400 mb-2">NAO, SE:</h3>
              <ul className="space-y-1 text-sm">
                <li>- Vai financiar carro para isso</li>
                <li>- Espera ganhar muito fácil</li>
                <li>- Não controla custos</li>
                <li>- Trabalha horários ruins</li>
                <li>- Tem opção CLT melhor</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Como baixar a CNH Digital?",
                      "answer": "Baixe o app Carteira Digital de Trânsito (CDT) nas lojas oficiais, faça login com gov.br é solicite sua CNH Digital. É gratuito."
              },
              {
                      "question": "CNH Digital vale em todo Brasil?",
                      "answer": "Sim, a CNH Digital tem a mesma validade da física em todo território nacional. Pode apresentar na abordagem de trânsito."
              },
              {
                      "question": "Preciso da CNH física se tenho a digital?",
                      "answer": "Não obrigatoriamente, mas recomenda-se ter a física como backup caso o celular fique sem bateria ou internet."
              },
              {
                      "question": "A CNH Digital funciona offline?",
                      "answer": "Sim, depois de baixada, a CNH fica salva no app é pode ser apresentada mesmo sem internet."
              }
      ]} />
    </ArticleLayout>
  );
}