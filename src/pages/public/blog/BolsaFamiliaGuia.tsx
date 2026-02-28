import { useState } from "react";
import ArticleLayout from "@/components/ArticleLayout";
import FAQSchema from '@/components/FAQSchema';

export default function BolsaFamiliaGuia() {
  const [rendaFamiliar, setRendaFamiliar] = useState<string>("");
  const [qtdMembros, setQtdMembros] = useState<string>("4");
  const [qtdCriancas07, setQtdCriancas07] = useState<string>("0");
  const [qtdCriancas718, setQtdCriancas718] = useState<string>("1");
  const [gestante, setGestante] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const calcular = () => {
    const renda = parseFloat(rendaFamiliar) || 0;
    const membros = parseInt(qtdMembros) || 4;
    const criancas07 = parseInt(qtdCriancas07) || 0;
    const criancas718 = parseInt(qtdCriancas718) || 0;

    const rendaPerCapita = renda / membros;

    // Regras Bolsa Família 2026
    const elegivel = rendaPerCapita <= 218; // R$ 218 per capita

    if (!elegivel) {
      setResult({
        elegivel: false,
        rendaPerCapita,
        motivo: "Renda per capita acima de R$ 218"
      });
      return;
    }

    // Cálculo do benefício
    let beneficioBase = 600; // Mínimo garantido
    let complementoCrianca07 = criancas07 * 150;
    let complementoCrianca718 = criancas718 * 50;
    let complementoGestante = gestante ? 50 : 0;

    // Garantia de renda mínima de R$ 218 per capita
    const rendaComBeneficio = renda + beneficioBase + complementoCrianca07 + complementoCrianca718 + complementoGestante;
    const rendaPerCapitaNova = rendaComBeneficio / membros;

    if (rendaPerCapitaNova < 218) {
      beneficioBase += (218 * membros) - rendaComBeneficio;
    }

    const total = beneficioBase + complementoCrianca07 + complementoCrianca718 + complementoGestante;

    setResult({
      elegivel: true,
      rendaPerCapita,
      beneficioBase,
      complementoCrianca07,
      complementoCrianca718,
      complementoGestante,
      total
    });
  };

  const documentosNecessarios = [
    "CPF de todos os membros da família",
    "Certidão de nascimento das crianças",
    "Comprovante de residência",
    "Carteira de trabalho (se tiver)",
    "Comprovante de renda (se tiver)",
    "Comprovante de matrícula escolar"
  ];

  const condicionalidades = [
    { area: "Educação", requisito: "Frequência escolar mínima de 60% para crianças de 4-5 anos" },
    { area: "Educação", requisito: "Frequência escolar mínima de 75% para crianças/jovens de 6-18 anos" },
    { area: "Saúde", requisito: "Vacinação em dia para crianças até 7 anos" },
    { area: "Saúde", requisito: "Acompanhamento pré-natal para gestantes" },
    { area: "Saúde", requisito: "Acompanhamento nutricional para crianças até 7 anos" }
  ];

  return (
    <ArticleLayout
      title="Bolsa Família 2026: Quem Tem Direito, Valor é Como Cadastrar"
      description="Guia completo do Bolsa Família: simulador de valor, documentos necessários, cadastro no CRAS é condicionalidades."
      keywords={["Bolsa Família 2026", "quem tem direito Bolsa Família", "valor Bolsa Família", "cadastro CRAS", "CadÚnico"]}
      publishedDate="2026-02-04"
      modifiedDate="2026-02-04"
      author="Stater"
      category="Benefícios Sociais"
    >
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">O Que é o Bolsa Família?</h2>
          <p className="text-lg mb-4">
            O <strong>Bolsa Família</strong> é o maior programa de transferência de renda do Brasil.
            Beneficia famílias em situação de pobreza é extrema pobreza, garantindo renda mínima 
            de <strong>R$ 218 por pessoa</strong>.
          </p>
      <QuickSummary 
        variant="green"
        items={[
          { label: 'Quem', value: 'Famílias com renda per capita até R$218/mês', icon: 'target' },
          { label: 'Valor', value: 'R$600 base + adicionais por criança, gestante, etc.', icon: 'money' },
          { label: 'Cadastro', value: 'CRAS da sua cidade com RG, CPF é comprovante de renda', icon: 'check' },
          { label: 'Dica', value: 'Mantenha CadÚnico atualizado para não perder benefício', icon: 'lightbulb' },
        ]}
      />

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-emerald-500/20 border-4 border-green-500 p-4 text-center">
              <span className="text-3xl"></span>
              <p className="font-bold mt-2">21,3 milhões</p>
              <p className="text-sm">de famílias beneficiadas</p>
            </div>
            <div className="bg-blue-500/20 border-4 border-blue-500 p-4 text-center">
              <span className="text-3xl"></span>
              <p className="font-bold mt-2">R$ 600</p>
              <p className="text-sm">valor mínimo garantido</p>
            </div>
            <div className="bg-yellow-500/20 border-4 border-yellow-500 p-4 text-center">
              <span className="text-3xl"></span>
              <p className="font-bold mt-2">Todo mês</p>
              <p className="text-sm">pagamento regular</p>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-green-100 to-blue-100 border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-4"> Simulador Bolsa Família</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block font-bold mb-2">Renda Familiar Total (R$)</label>
              <input
                type="number"
                value={rendaFamiliar}
                onChange={(e) => setRendaFamiliar(e.target.value)}
                placeholder="Ex: 800"
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Membros da Família</label>
              <input
                type="number"
                value={qtdMembros}
                onChange={(e) => setQtdMembros(e.target.value)}
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Crianças 0-6 anos</label>
              <input
                type="number"
                value={qtdCriancas07}
                onChange={(e) => setQtdCriancas07(e.target.value)}
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Crianças/Jovens 7-18 anos</label>
              <input
                type="number"
                value={qtdCriancas718}
                onChange={(e) => setQtdCriancas718(e.target.value)}
                className="w-full p-3 border-4 border-black"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gestante}
                  onChange={(e) => setGestante(e.target.checked)}
                  className="w-6 h-6"
                />
                <span className="font-bold">Gestante na família</span>
              </label>
            </div>
          </div>

          <button
            onClick={calcular}
            disabled={!rendaFamiliar}
            className="w-full bg-black text-white font-black py-4 text-lg hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
          >
            SIMULAR BENEFÍCIO
          </button>

          {result && (
            <div className={`mt-6 border-4 p-4 ${result.elegivel ? "bg-emerald-500/20 border-green-500" : "bg-red-500/20 border-red-500"}`}>
              {result.elegivel ? (
                <>
                  <h3 className="font-black text-xl mb-3 text-green-700"> Sua família tem direito!</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p>Renda per capita: <strong>R$ {result.rendaPerCapita.toFixed(2)}</strong></p>
                      <p className="text-sm text-gray-600">(Limite: R$ 218)</p>
                    </div>
                    <div className="bg-slate-800 text-white border-2 border-black p-3">
                      <p>Benefício base: R$ {result.beneficioBase.toFixed(0)}</p>
                      {result.complementoCrianca07 > 0 && <p>+ Crianças 0-6: R$ {result.complementoCrianca07}</p>}
                      {result.complementoCrianca718 > 0 && <p>+ Crianças 7-18: R$ {result.complementoCrianca718}</p>}
                      {result.complementoGestante > 0 && <p>+ Gestante: R$ {result.complementoGestante}</p>}
                      <hr className="my-2" />
                      <p className="font-black text-xl text-green-600">TOTAL: R$ {result.total.toFixed(0)}/mês</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-black text-xl mb-2 text-red-700"> Não elegível no momento</h3>
                  <p>Renda per capita: R$ {result.rendaPerCapita.toFixed(2)}</p>
                  <p className="text-red-600">{result.motivo}</p>
                </>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Valores do Bolsa Família 2026</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-emerald-500/20 border-4 border-green-500 p-4">
              <h3 className="font-bold text-lg mb-2">Benefício Básico</h3>
              <p className="text-3xl font-black">R$ 600</p>
              <p className="text-sm">Mínimo garantido por família</p>
            </div>
            <div className="bg-blue-500/20 border-4 border-blue-500 p-4">
              <h3 className="font-bold text-lg mb-2">Criança 0-6 anos</h3>
              <p className="text-3xl font-black">+ R$ 150</p>
              <p className="text-sm">Por criança nessa faixa</p>
            </div>
            <div className="bg-yellow-500/20 border-4 border-yellow-500 p-4">
              <h3 className="font-bold text-lg mb-2">Criança/Jovem 7-18</h3>
              <p className="text-3xl font-black">+ R$ 50</p>
              <p className="text-sm">Por criança/jovem na escola</p>
            </div>
            <div className="bg-pink-500/20 border-4 border-pink-500 p-4">
              <h3 className="font-bold text-lg mb-2">Gestante/Nutriz</h3>
              <p className="text-3xl font-black">+ R$ 50</p>
              <p className="text-sm">Durante gestação/amamentação</p>
            </div>
          </div>
        </section>

        <section className="bg-blue-500/10 text-white border-4 border-blue-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Como se Cadastrar</h2>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="bg-blue-500/10 text-white w-8 h-8 flex items-center justify-center font-black shrink-0">1</span>
              <span>Vá ao <strong>CRAS</strong> (Centro de Referência de Assistência Social) mais próximo</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-blue-500/10 text-white w-8 h-8 flex items-center justify-center font-black shrink-0">2</span>
              <span>Leve <strong>todos os documentos</strong> de todos os membros da família</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-blue-500/10 text-white w-8 h-8 flex items-center justify-center font-black shrink-0">3</span>
              <span>Faça o cadastro no <strong>CadÚnico</strong> (Cadastro Único)</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-blue-500/10 text-white w-8 h-8 flex items-center justify-center font-black shrink-0">4</span>
              <span>Aguarde a <strong>análise</strong> do Ministério do Desenvolvimento Social</span>
            </li>
            <li className="flex gap-3">
              <span className="bg-blue-500/10 text-white w-8 h-8 flex items-center justify-center font-black shrink-0">5</span>
              <span>Se aprovado, receberá cartão <strong>Caixa Tem</strong> ou Bolsa Família</span>
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-black mb-4 border-b-4 border-black pb-2">Documentos Necessários</h2>
          <div className="grid md:grid-cols-2 gap-2">
            {documentosNecessarios.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-100 p-2 border-2 border-black">
                <span className="text-green-500"></span>
                <span>{doc}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-yellow-500/10 text-white border-4 border-yellow-500 p-6">
          <h2 className="text-2xl font-black mb-4"> Condicionalidades (Obrigações)</h2>
          <p className="mb-4">Para continuar recebendo, a família deve cumprir:</p>
          <div className="space-y-3">
            {condicionalidades.map((c, i) => (
              <div key={i} className="bg-slate-800 text-white border-2 border-black p-3">
                <span className="font-bold text-yellow-700">{c.area}:</span>
                <span className="ml-2">{c.requisito}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-black text-white p-6">
          <h2 className="text-2xl font-black mb-4">Calendário de Pagamento</h2>
          <p className="mb-4">O pagamento é feito conforme o <strong>final do NIS</strong> (Número de Identificação Social):</p>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
              <div key={n} className="bg-slate-800 text-white text-black p-2 font-bold">
                NIS final {n}
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm">Consulte o calendário completo no app Caixa Tem ou site do governo.</p>
        </section>
      </div>
      <FAQSchema faqs={[
              {
                      "question": "Quem tem direito ao Bolsa Família?",
                      "answer": "Famílias com renda per capita de até R$ 218/mês. É necessário estar inscrito no CadÚnico com dados atualizados."
              },
              {
                      "question": "Quanto recebe quem ganha Bolsa Família?",
                      "answer": "Benefício básico de R$ 600 + adicionais por criança (R$ 150), gestante (R$ 50) é outros. Valor varia por composição familiar."
              },
              {
                      "question": "Como manter o Bolsa Família?",
                      "answer": "Mantenha CadÚnico atualizado, cumpra condicionalidades (vacinação, frequência escolar) é atualize dados a cada 2 anos."
              },
              {
                      "question": "Pode ter Bolsa Família é trabalhar?",
                      "answer": "Sim, desde que a renda familiar não ultrapasse o limite. Há regra de transição que permite manter o benefício por um período se conseguir emprego."
              }
      ]} />
    </ArticleLayout>
  );
}