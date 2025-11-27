import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, Camera, PieChart, Bell, Sparkles, Check, ArrowRight, Shield, Zap, Smartphone, CreditCard } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#31518b] via-[#1e3a5f] to-[#0f172a] text-white overflow-x-hidden font-sans selection:bg-blue-500/30">
      
      {/* ========== BACKGROUND EFFECTS ========== */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] opacity-50 mix-blend-overlay"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] opacity-50 mix-blend-overlay"></div>
      </div>

      {/* ========== HEADER ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#31518b]/80 backdrop-blur-md border-b border-white/10 shadow-lg shadow-black/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <img src="/stater-logo-96.png" alt="Stater" className="w-8 h-8 relative z-10 rounded-lg shadow-sm" />
            </div>
            <span className="font-bold text-lg tracking-tight">Stater</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-white text-[#31518b] hover:bg-blue-50 font-semibold shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section className="relative z-10 pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-300 text-xs font-bold tracking-wide uppercase">100% Gratuito para sempre</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight mb-6 tracking-tight drop-shadow-xl">
            Suas finanças, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200">
              simplificadas pela IA
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg text-blue-100/80 mb-10 leading-relaxed max-w-2xl mx-auto font-light">
            Esqueça as planilhas complexas. Apenas fale ou tire uma foto, e o Stater organiza tudo automaticamente para você.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold h-14 px-8 rounded-2xl shadow-xl shadow-blue-900/20 transition-all hover:-translate-y-1">
                Criar conta agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto sm:hidden">
              <Button variant="ghost" className="w-full text-white/60 hover:text-white">
                Já tenho conta
              </Button>
            </Link>
          </div>

          {/* App Preview / Mockup Placeholder */}
          <div className="relative mx-auto max-w-[300px] sm:max-w-[800px]">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-8 shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                {/* Mockup Item 1 */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Mic className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-xs font-medium text-white/60">Você diz:</div>
                  </div>
                  <p className="text-sm text-white italic">"Gastei 45 reais no almoço hoje"</p>
                </div>
                {/* Arrow */}
                <div className="hidden sm:flex items-center justify-center text-white/20">
                  <ArrowRight className="w-6 h-6" />
                </div>
                {/* Mockup Item 2 */}
                <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-xs font-medium text-emerald-400/80">Stater cria:</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Almoço</span>
                      <span className="text-red-400">- R$ 45,00</span>
                    </div>
                    <div className="text-xs text-white/40">Categoria: Alimentação</div>
                    <div className="text-xs text-white/40">Hoje, 12:30</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========== FEATURES GRID ========== */}
      <section className="relative z-10 py-20 px-6 bg-[#0f172a]/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Tudo o que você precisa</h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Ferramentas poderosas em uma interface simples e intuitiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature Card 1 */}
            <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Mic className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comando de Voz</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Registre gastos enquanto caminha. Nossa IA entende contexto, datas e categorias automaticamente.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scanner de Notas</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Tire foto da notinha do mercado. O Stater extrai todos os itens e valores em segundos.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <PieChart className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Insights Inteligentes</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Entenda para onde seu dinheiro vai com gráficos claros e relatórios mensais automáticos.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Bell className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lembretes de Contas</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Nunca mais pague juros. Receba avisos por email antes de suas contas vencerem.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-sky-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Integração Telegram</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Envie áudios ou textos direto pelo Telegram. É como conversar com um assistente pessoal.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacidade Total</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Seus dados são seus. Não pedimos senhas de banco e não vendemos suas informações.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section className="relative z-10 py-20 px-6">
        <div className="max-w-lg mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#0f172a] border border-white/10 rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
              
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                OFERTA LIMITADA
              </div>

              <h2 className="text-2xl font-bold mb-2">Plano Vitalício Gratuito</h2>
              <p className="text-white/40 mb-8 text-sm">Aproveite enquanto estamos em beta público.</p>
              
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-5xl font-extrabold text-white">R$ 0</span>
                <span className="text-xl text-white/40 font-medium self-end mb-1">/mês</span>
              </div>

              <ul className="space-y-4 text-left mb-10 max-w-xs mx-auto">
                {[
                  'Lançamentos ilimitados',
                  'Reconhecimento de voz',
                  'Leitura de notas fiscais',
                  'Relatórios completos',
                  'Sem anúncios'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link to="/register" className="block">
                <Button className="w-full bg-white text-[#0f172a] hover:bg-blue-50 font-bold h-12 rounded-xl shadow-lg transition-transform hover:scale-[1.02]">
                  Garantir minha conta grátis
                </Button>
              </Link>
              <p className="mt-4 text-xs text-white/30">
                Não é necessário cartão de crédito.
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 bg-[#0a0a0f]/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <img src="/stater-logo-96.png" alt="Stater" className="w-6 h-6 grayscale" />
            <span className="font-semibold text-sm">Stater</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/40">
            <Link to="/terms" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <a href="mailto:staterbills@gmail.com" className="hover:text-white transition-colors">Suporte</a>
          </div>
          
          <div className="text-xs text-white/20">
            © 2025 Stater. Feito com 💙 para você.
          </div>
          
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
