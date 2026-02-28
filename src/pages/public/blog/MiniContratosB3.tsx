import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function MiniContratosB3() {
  return (
    <ArticleLayout
      title="Mini Contratos na B3: Guia Completo para Iniciantes"
      description="Aprenda sobre mini índice é mini dolar. Como funcionam, quanto precisa para começar, riscos, é por que 90% dos traders perdem dinheiro."
      keywords={["mini contratos B3", "mini índice", "mini dolar", "day trade", "como operar minicontratos"]}
      publishedDate="2026-01-21"
      modifiedDate="2026-01-21"
      author="Stater"
      category="Investimentos"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">O Que Sao Mini Contratos?</h2>
          <p className="text-lg mb-4">
            Mini contratos sao derivativos negociados na B3 que permitem operar o Ibovespa (mini índice) 
            é o dolar (mini dolar) com valores menores que os contratos cheios.
          </p>
      <QuickSummary 
        variant="orange"
        items={[
          { label: 'O que', value: 'Mini índice é mini dólar - derivativos da B3', icon: 'target' },
          { label: 'Risco', value: 'MUITO ALTO - pode perder mais do que investiu', icon: 'alert' },
          { label: 'Margem', value: 'Precisa de garantia, alavancagem é perigosa', icon: 'money' },
          { label: 'Dica', value: 'Só para experientes - comece por ações primeiro', icon: 'lightbulb' },
        ]}
      />

          
          <div className="bg-red-500/20 border-4 border-red-500 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black text-red-800 mb-2">AVISO SERIO</h3>
            <p className="text-red-800">
              <strong>90% dos traders de mini contratos PERDEM dinheiro.</strong> Este guia é educacional. 
              Não é recomendacao de investimento. Day trade é extremamente arriscado.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Tipos de Mini Contratos</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-4 border-blue-500 p-4 bg-blue-500/10 text-white">
              <h3 className="font-black text-lg">Mini Índice (WIN)</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li><strong>O que e:</strong> Acompanha o Ibovespa</li>
                <li><strong>Codigo:</strong> WIN + mês + ano (ex: WING26)</li>
                <li><strong>Cada ponto:</strong> R$ 0,20</li>
                <li><strong>Variacao mínima:</strong> 5 pontos = R$ 1,00</li>
                <li><strong>Margem:</strong> ~R$ 100 por contrato (day trade)</li>
                <li><strong>Vencimento:</strong> Bimestral</li>
              </ul>
            </div>
            <div className="border-4 border-green-500 p-4 bg-emerald-500/10 text-white">
              <h3 className="font-black text-lg">Mini Dolar (WDO)</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li><strong>O que e:</strong> Acompanha cotacao USD/BRL</li>
                <li><strong>Codigo:</strong> WDO + mês + ano (ex: WDOG26)</li>
                <li><strong>Cada ponto:</strong> R$ 10,00</li>
                <li><strong>Variacao mínima:</strong> 0,5 ponto = R$ 5,00</li>
                <li><strong>Margem:</strong> ~R$ 150 por contrato (day trade)</li>
                <li><strong>Vencimento:</strong> Mensal</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Como Funciona na Pratica</h2>
          <div className="bg-gray-100 border-4 border-black p-4">
            <h3 className="font-bold mb-3">Exemplo: Mini Índice</h3>
            <div className="space-y-2 text-sm">
              <p>1. Ibovespa está em 130.000 pontos</p>
              <p>2. Você COMPRA 1 mini contrato a 130.000</p>
              <p>3. O índice SOBE para 130.100 (+100 pontos)</p>
              <p>4. Seu lucro: 100 pontos x R$0,20 = <strong className="text-green-600">R$ 20,00</strong></p>
              <p className="mt-2 border-t pt-2">Se o índice CAIR 100 pontos, você perde R$ 20,00</p>
            </div>
          </div>
          
          <div className="bg-gray-100 border-4 border-black p-4 mt-4">
            <h3 className="font-bold mb-3">Exemplo: Mini Dolar</h3>
            <div className="space-y-2 text-sm">
              <p>1. Dolar está a 5.000 pontos (R$ 5,00)</p>
              <p>2. Você COMPRA 1 mini contrato a 5.000</p>
              <p>3. O dolar SOBE para 5.010 (+10 pontos)</p>
              <p>4. Seu lucro: 10 pontos x R$10,00 = <strong className="text-green-600">R$ 100,00</strong></p>
              <p className="mt-2 border-t pt-2">Se o dolar CAIR 10 pontos, você perde R$ 100,00</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Custos das Operações</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-4 border-black text-sm">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-left">Custo</th>
                  <th className="p-3 text-left">Mini Índice</th>
                  <th className="p-3 text-left">Mini Dolar</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { custo: "Taxa de Corretagem", win: "R$ 0,30-1,00/contrato", wdo: "R$ 0,30-1,00/contrato" },
                  { custo: "Emolumentos B3", win: "~R$ 0,03/contrato", wdo: "~R$ 0,03/contrato" },
                  { custo: "Taxa de Registro", win: "~R$ 0,02/contrato", wdo: "~R$ 0,02/contrato" },
                  { custo: "IR Day Trade", win: "20% sobre lucro", wdo: "20% sobre lucro" },
                  { custo: "IR Swing Trade", win: "15% sobre lucro", wdo: "15% sobre lucro" }
                ].map((c, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-slate-800 text-white"}>
                    <td className="p-3 font-bold border-r-2 border-black">{c.custo}</td>
                    <td className="p-3 border-r-2 border-black">{c.win}</td>
                    <td className="p-3">{c.wdo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Por Que 90% Perde Dinheiro?</h2>
          <div className="space-y-3">
            {[
              { motivo: "Alavancagem excessiva", desc: "Operam muitos contratos para o capital que tem" },
              { motivo: "Sem gerênciamento de risco", desc: "Não usam stop loss ou arriscam demais por operação" },
              { motivo: "Falta de preparo", desc: "Começam sem estudar, achando que é fácil" },
              { motivo: "Emocional descontrolado", desc: "Medo é ganancia levam a decisoes erradas" },
              { motivo: "Overtrading", desc: "Operam demais, pagam muita corretagem" },
              { motivo: "Não respeitam o plano", desc: "Mudam estratégia no meio da operação" }
            ].map((m, i) => (
              <div key={i} className="border-4 border-red-400 p-3 bg-red-500/10 text-white">
                <h4 className="font-black text-red-700">{m.motivo}</h4>
                <p className="text-sm">{m.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Se For Operar, Siga Estas Regras</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { regra: "Arrisque no máximo 1% do capital por operação", desc: "Se tem R$10.000, arrisque R$100 por trade" },
              { regra: "Use SEMPRE stop loss", desc: "Defina antes de entrar onde vai sair se der errado" },
              { regra: "Opere no simulador primeiro", desc: "Mínimo 3 meses lucrando no simulador antes de operar real" },
              { regra: "Tenha uma estratégia testada", desc: "Não invente. Use algo que funciona estatisticamente" },
              { regra: "Anote todas as operações", desc: "Diario de trading para analisar erros é acertos" },
              { regra: "Não faça mais de 3 operações/dia", desc: "Qualidade é melhor que quantidade" }
            ].map((r, i) => (
              <div key={i} className="border-4 border-green-500 p-4 bg-emerald-500/10 text-white">
                <h4 className="font-black">{r.regra}</h4>
                <p className="text-sm text-gray-700">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Quanto Precisa para Começar</h2>
          <div className="bg-yellow-500/20 border-4 border-black p-4">
            <p className="font-bold mb-3">Capital mínimo recomendado para day trade:</p>
            <ul className="space-y-2">
              <li><strong>Mínimo absoluto:</strong> R$ 5.000 (muito arriscado)</li>
              <li><strong>Recomendado para iniciante:</strong> R$ 10.000-20.000</li>
              <li><strong>Ideal para operar bem:</strong> R$ 50.000+</li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              <strong>Importante:</strong> Use apenas dinheiro que pode perder 100%. Nunca use reserva de emergência ou dinheiro para contas.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Horários de Negociacao</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-4 border-black p-4">
              <h3 className="font-black">Mini Índice (WIN)</h3>
              <p className="text-sm">Pregao: 9h00 - 18h00</p>
              <p className="text-sm">After Market: 18h30 - 18h45</p>
              <p className="text-sm text-green-600">Melhores horários: 9h-11h é 14h-17h</p>
            </div>
            <div className="border-4 border-black p-4">
              <h3 className="font-black">Mini Dolar (WDO)</h3>
              <p className="text-sm">Pregao: 9h00 - 18h00</p>
              <p className="text-sm text-green-600">Melhores horários: 9h-12h (abertura EUA)</p>
            </div>
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Minha Recomendacao Honesta</h2>
          <div className="space-y-4">
            <p>
              Day trade é extremamente difícil. A grande maioria perde dinheiro. Se você quer 
              construir patrimônio, existem caminhos mais seguros:
            </p>
            <ul className="space-y-1">
              <li>- Investir em ações de boas empresas (buy and hold)</li>
              <li>- Fundos Imobiliários para renda passiva</li>
              <li>- Tesouro Direto para segurança</li>
              <li>- ETFs para diversificacao</li>
            </ul>
            <p className="bg-yellow-400 text-black p-3 font-bold mt-4">
              Se ainda assim quiser operar mini contratos, estude MUITO antes. Opere em simulador 
              por meses. E use apenas dinheiro que pode perder totalmente.
            </p>
          </div>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "O que são mini contratos?",
                      "answer": "Mini contratos são derivativos da B3 com valor menor que contratos cheios. Permitem operar índice (mini índice) é dólar (mini dólar) com menos capital."
              },
              {
                      "question": "Quanto preciso para operar mini contratos?",
                      "answer": "A margem de garantia varia, mas com R$ 100-300 já é possível operar 1 mini contrato. Cuidado: é alavancado é arriscado."
              },
              {
                      "question": "Mini contrato é para iniciante?",
                      "answer": "Não recomendado. Requer conhecimento de análise técnica, gestão de risco é controle emocional. A maioria dos iniciantes perde dinheiro."
              },
              {
                      "question": "Qual a diferença entre mini índice é mini dólar?",
                      "answer": "Mini índice segue o Ibovespa (ações brasileiras). Mini dólar segue a cotação do dólar. Ambos permitem lucrar na alta ou na queda."
              }
      ]} />
    </ArticleLayout>
  );
}