import React from 'react';
import { Link } from 'react-router-dom';
import ArticleLayout from '@/components/ArticleLayout';
import QuickSummary from '@/components/QuickSummary';
import FAQSchema from '@/components/FAQSchema';

const TesouroDiretoIniciantes: React.FC = () => {
  return (
    <ArticleLayout 
      title="Tesouro Direto para Iniciantes: Guia Completo 2026" 
      description="Aprenda tudo sobre Tesouro Direto: como funciona, quanto rende, qual escolher é como investir passo a passo." 
      canonical="/blog/tesouro-direto-iniciantes" 
      keywords="tesouro direto, como investir tesouro direto, tesouro selic, tesouro ipca, tesouro prefixado" 
      date="4 de Fevereiro de 2026" 
      readTime="15 min" 
      relatedArticles={[
        { title: 'Como Investir com R$100', slug: 'como-investir-100-reais' }, 
        { title: 'CDI, Selic é IPCA Explicados', slug: 'cdi-selic-ipca' }
      ]}
    >
      <p className="text-xl text-white/70 mb-8">O Tesouro Direto é o <strong className="text-emerald-400">investimento mais seguro do Brasil</strong>. Você empresta dinheiro para o governo é recebe de volta com juros. Neste guia, vou te explicar tudo que você precisa saber.</p>
      <QuickSummary 
        variant="green"
        items={[
          { label: 'Selic', value: 'Reserva de emergência - liquidez diária, baixo risco', icon: 'shield' },
          { label: 'IPCA+', value: 'Longo prazo - protege da inflação, rende mais', icon: 'trend' },
          { label: 'Prefixado', value: 'Taxa definida - bom quando Selic vai cair', icon: 'target' },
          { label: 'Mínimo', value: 'A partir de R$30 - qualquer um pode investir', icon: 'money' },
        ]}
      />

      
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border-2 border-blue-400 rounded-2xl p-6 mb-8">
        <h3 className="text-xl font-bold text-blue-400 mb-2"> Por que é tão seguro?</h3>
        <p className="text-white/80">O Tesouro Direto é garantido pelo <strong>Tesouro Nacional</strong> (governo federal). Para você perder dinheiro, o Brasil inteiro teria que quebrar. É mais seguro que qualquer banco.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Os 3 tipos de Tesouro Direto</h2>
      
      <div className="space-y-6 mb-8">
        <div className="bg-emerald-500/10 border-l-4 border-emerald-500 rounded-r-xl p-5">
          <h3 className="text-xl font-bold text-emerald-400 mb-2">1. Tesouro Selic (LFT)</h3>
          <p className="text-white/70 mb-3">Rende de acordo com a taxa Selic. Ideal para <strong className="text-white">reserva de emergência</strong>.</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/50">Rendimento atual:</p>
              <p className="text-emerald-400 font-bold text-lg">~13,25% ao ano</p>
            </div>
            <div>
              <p className="text-white/50">Liquidez:</p>
              <p className="text-white font-bold">D+1 (1 dia útil)</p>
            </div>
          </div>
          <p className="text-emerald-400/80 text-sm mt-3"> Recomendado para: Quem precisa de liquidez é segurança</p>
        </div>

        <div className="bg-blue-500/10 text-white border-l-4 border-blue-500 rounded-r-xl p-5">
          <h3 className="text-xl font-bold text-blue-400 mb-2">2. Tesouro IPCA+ (NTN-B)</h3>
          <p className="text-white/70 mb-3">Rende IPCA (inflação) + taxa fixa. Protege seu dinheiro da <strong className="text-white">perda de valor</strong>.</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/50">Rendimento atual:</p>
              <p className="text-blue-400 font-bold text-lg">IPCA + 6,5% ao ano</p>
            </div>
            <div>
              <p className="text-white/50">Vencimento:</p>
              <p className="text-white font-bold">2029, 2035, 2045...</p>
            </div>
          </div>
          <p className="text-blue-400/80 text-sm mt-3"> Recomendado para: Aposentadoria, objetivos de longo prazo</p>
        </div>

        <div className="bg-purple-500/10 text-white border-l-4 border-purple-500 rounded-r-xl p-5">
          <h3 className="text-xl font-bold text-purple-400 mb-2">3. Tesouro Prefixado (LTN)</h3>
          <p className="text-white/70 mb-3">Taxa fixa definida na compra. Você sabe <strong className="text-white">exatamente quanto vai receber</strong>.</p>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/50">Rendimento atual:</p>
              <p className="text-purple-400 font-bold text-lg">~14% ao ano</p>
            </div>
            <div>
              <p className="text-white/50">Vencimento:</p>
              <p className="text-white font-bold">2027, 2029, 2031</p>
            </div>
          </div>
          <p className="text-purple-400/80 text-sm mt-3"> Recomendado para: Quem acredita que juros vão cair</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Qual escolher? Depende do seu objetivo</h2>
      <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead className="bg-slate-800 text-white">
            <tr>
              <th className="text-left p-3 text-white">Objetivo</th>
              <th className="text-left p-3 text-white">Título recomendado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            <tr>
              <td className="p-3 text-white/70">Reserva de emergência</td>
              <td className="p-3 text-emerald-400 font-medium">Tesouro Selic</td>
            </tr>
            <tr>
              <td className="p-3 text-white/70">Aposentadoria (20+ anos)</td>
              <td className="p-3 text-blue-400 font-medium">Tesouro IPCA+ 2045</td>
            </tr>
            <tr>
              <td className="p-3 text-white/70">Comprar carro em 3 anos</td>
              <td className="p-3 text-purple-400 font-medium">Tesouro Prefixado 2029</td>
            </tr>
            <tr>
              <td className="p-3 text-white/70">Faculdade do filho (10 anos)</td>
              <td className="p-3 text-blue-400 font-medium">Tesouro IPCA+ 2035</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Passo a passo: Como investir no Tesouro Direto</h2>
      <ol className="space-y-4 mb-8">
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-white flex items-center justify-center font-bold text-white">1</span>
          <div>
            <p className="text-white font-medium">Abra conta em uma corretora</p>
            <p className="text-white/60 text-sm">Rico, XP, Nubank, Inter - todas são gratuitas para Tesouro Direto</p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-white flex items-center justify-center font-bold text-white">2</span>
          <div>
            <p className="text-white font-medium">Transfira o dinheiro</p>
            <p className="text-white/60 text-sm">Via Pix ou TED para sua conta na corretora</p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-white flex items-center justify-center font-bold text-white">3</span>
          <div>
            <p className="text-white font-medium">Escolha o título</p>
            <p className="text-white/60 text-sm">Tesouro Selic para começar é a melhor opção</p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-white flex items-center justify-center font-bold text-white">4</span>
          <div>
            <p className="text-white font-medium">Defina o valor (mínimo R$30)</p>
            <p className="text-white/60 text-sm">Você pode comprar frações de título</p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 text-white flex items-center justify-center font-bold text-white">5</span>
          <div>
            <p className="text-white font-medium">Confirme a compra</p>
            <p className="text-white/60 text-sm">Pronto! Seu título fica custodiado na B3</p>
          </div>
        </li>
      </ol>

      <h2 className="text-2xl font-bold mt-10 mb-4">Taxas é Impostos</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <h4 className="font-bold text-white mb-2">Taxa de custódia (B3)</h4>
          <p className="text-2xl font-bold text-yellow-400">0,20% ao ano</p>
          <p className="text-white/50 text-sm">Isento até R$10.000 em Tesouro Selic</p>
        </div>
        <div className="bg-slate-800 text-white border border-slate-600/10 rounded-xl p-4">
          <h4 className="font-bold text-white mb-2">Imposto de Renda</h4>
          <p className="text-white/70 text-sm">Tabela regressiva:</p>
          <ul className="text-white/60 text-sm mt-2 space-y-1">
            <li>Até 180 dias: 22,5%</li>
            <li>181-360 dias: 20%</li>
            <li>361-720 dias: 17,5%</li>
            <li>Acima de 720 dias: <strong className="text-emerald-400">15%</strong></li>
          </ul>
        </div>
      </div>

      <div className="bg-red-500/10 text-white border border-red-500/30 rounded-xl p-5 mb-8">
        <h4 className="font-bold text-red-400 mb-2"> Cuidado com o resgate antecipado</h4>
        <p className="text-white/70">No Tesouro IPCA+ é Prefixado, se você vender antes do vencimento, o preço varia conforme o mercado. Você pode ter <strong>prejuízo</strong> se vender na hora errada. Só o Tesouro Selic não tem esse problema.</p>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Simulação: R$500/mês por 10 anos</h2>
      <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/30 rounded-xl p-6 mb-8">
        <div className="grid sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-white/50 text-sm">Tesouro Selic</p>
            <p className="text-2xl font-bold text-emerald-400">R$102.420</p>
          </div>
          <div>
            <p className="text-white/50 text-sm">Tesouro IPCA+6%</p>
            <p className="text-2xl font-bold text-blue-400">R$110.529</p>
          </div>
          <div>
            <p className="text-white/50 text-sm">Poupança</p>
            <p className="text-2xl font-bold text-white/50">R$81.939</p>
          </div>
        </div>
        <p className="text-center text-white/50 text-sm mt-4">Total investido: R$60.000 | Diferença Tesouro vs Poupança: <strong className="text-emerald-400">+R$20.481</strong></p>
      </div>

      <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-2 border-blue-400 rounded-2xl p-6 mt-10">
        <h3 className="text-xl font-bold text-white mb-2"> Minha recomendação</h3>
        <p className="text-white/80">Comece com <strong className="text-emerald-400">Tesouro Selic</strong> para sua reserva de emergência. Quando tiver pelo menos 6 meses de gastos guardados, diversifique para <strong className="text-blue-400">Tesouro IPCA+</strong> pensando no longo prazo.</p>
      </div>
    
      <FAQSchema 
        faqs={[
          {
            question: "Tesouro Direto é seguro?",
            answer: "Sim! E o investimento mais seguro do Brasil. Voce está emprestando dinheiro para o governo federal, que tem o menor risco de calote do pais."
          },
          {
            question: "Qual Tesouro escolher?",
            answer: "Tesouro Selic para reserva de emergencia é curto prazo. Tesouro IPCA+ para proteger da inflacao no longo prazo. Tesouro Prefixado se acredita que juros vão cair."
          },
          {
            question: "Quanto rende o Tesouro Direto?",
            answer: "O Tesouro Selic rende cerca de 15% ao ano (fevereiro 2026). O Tesouro IPCA+ rende inflacao + 6-7% ao ano. Muito mais que a poupanca!"
          },
          {
            question: "Posso resgatar o Tesouro a qualquer momento?",
            answer: "Sim, o Tesouro tem liquidez diaria. O dinheiro cai na conta em 1 dia util. Porem, resgatar antes do vencimento pode ter variacao no valor."
          },
          {
            question: "Qual o valor mínimo para investir no Tesouro?",
            answer: "Cerca de R$ 30. Voce pode comprar fracoes de titulos, não precisa comprar o titulo inteiro."
          }
        ]}
      />
    </ArticleLayout>
  );
};

export default TesouroDiretoIniciantes;