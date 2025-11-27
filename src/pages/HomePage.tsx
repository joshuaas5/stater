import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, Camera, PieChart, Bell, Sparkles, Check, ArrowRight, Shield, Zap, Smartphone, CreditCard, Lock, Calendar } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#31518b] via-[#1e3a5f] to-[#0f172a] text-white overflow-x-hidden font-sans selection:bg-blue-500/30">
      
      {/* ========== BACKGROUND EFFECTS ========== */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] opacity-50 mix-blend-overlay"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] opacity-50 mix-blend-overlay"></div>
      </div>

      {/* ========== HEADER ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#31518b]/60 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/5">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-400 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              <img src="/stater-logo-96.png" alt="Stater" className="w-10 h-10 relative z-10 rounded-xl shadow-sm" />
            </div>
            <span className="font-bold text-2xl tracking-tight">Stater</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 text-base">
                Entrar
              </Button>
            </Link>
            <Link to="/login?view=register">
              <Button className="bg-white text-[#31518b] hover:bg-blue-50 font-bold shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95 h-10 px-6 text-base">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section className="relative z-10 pt-36 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 mb-8 animate-fade-in-up shadow-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-300 text-sm font-bold tracking-wide uppercase">Acesso grátis a funções avançadas</span>
          </div>
          
          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight mb-8 tracking-tight drop-shadow-2xl">
            Organize suas finanças <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-blue-200">
              com ajuda da IA
            </span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl text-blue-100/80 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
            Receba lembretes de contas por email, visualize seus gastos e mantenha tudo em dia. Privacidade total, sem dados bancários.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
            <Link to="/login?view=register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold h-14 px-10 rounded-2xl shadow-xl shadow-blue-900/20 transition-all hover:-translate-y-1 text-lg">
                Criar conta agora
                <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto sm:hidden">
              <Button variant="ghost" className="w-full text-white/60 hover:text-white h-14 text-lg">
                Já tenho conta
              </Button>
            </Link>
          </div>

          {/* Glassmorphism Cards Preview */}
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl blur-2xl opacity-20"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              
              {/* Card 1: Organização */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left shadow-2xl transform hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <PieChart className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Controle Total</h3>
                <p className="text-white/60 text-sm">Saiba exatamente para onde vai seu dinheiro com gráficos claros e categorias automáticas.</p>
              </div>

              {/* Card 2: Lembretes (Destaque) */}
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 text-left shadow-2xl transform scale-105 z-10">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                  NOVO
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Bell className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Nunca Atrase</h3>
                <p className="text-white/60 text-sm">Receba avisos por email antes de suas contas vencerem. Evite juros e multas desnecessárias.</p>
              </div>

              {/* Card 3: Privacidade */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-left shadow-2xl transform hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">Privacidade Absoluta</h3>
                <p className="text-white/60 text-sm">Não pedimos dados bancários e não armazenamos informações pessoais desnecessárias.</p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========== FEATURES DETAILED ========== */}
      <section className="relative z-10 py-24 px-6 bg-[#0f172a]/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
                <Bell className="w-4 h-4 text-blue-400" />
                <span className="text-blue-300 text-xs font-bold uppercase">Notificações Inteligentes</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                Durma tranquilo sabendo que suas contas estão em dia
              </h2>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                O Stater monitora seus vencimentos e envia lembretes por email e notificação push. Você nunca mais vai esquecer de pagar um boleto.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-white/80">Resumo semanal por email</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-white/80">Alertas de vencimento no dia</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <span className="text-white/80">Separação clara de contas pagas e pendentes</span>
                </li>
              </ul>
            </div>
            <div className="order-1 md:order-2 relative">
              <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-3xl opacity-30"></div>
              <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                {/* Mock Email Notification */}
                <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
                  <div>
                    <div className="text-sm font-bold text-white">Stater</div>
                    <div className="text-xs text-white/50">Resumo semanal das suas contas</div>
                  </div>
                  <div className="ml-auto text-xs text-white/30">Agora</div>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-sm text-red-200">Internet Fibra</span>
                    </div>
                    <span className="text-sm font-bold text-red-200">R$ 129,90</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-lg p-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm text-white/80">Aluguel</span>
                    </div>
                    <span className="text-sm font-bold text-white">R$ 1.800,00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Extra Feature 1 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <Mic className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Registro por Voz</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Não gosta de digitar? Apenas fale "Gastei 50 reais na padaria" e a IA faz o resto.
              </p>
            </div>

            {/* Extra Feature 2 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <Camera className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Scanner de Notas</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Tire foto dos seus recibos. O sistema extrai valores e datas automaticamente.
              </p>
            </div>

            {/* Extra Feature 3 */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <Zap className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-xl font-bold mb-3">Rápido e Leve</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Feito para abrir instantaneamente. Sem carregamentos demorados ou travamentos.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ========== PRICING ========== */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-lg mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
              
              <h2 className="text-3xl font-bold mb-4">Comece Grátis</h2>
              <p className="text-white/50 mb-8">Experimente todas as funcionalidades essenciais sem custo.</p>
              
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className="text-6xl font-extrabold text-white tracking-tighter">R$ 0</span>
                <div className="text-left">
                  <div className="text-sm text-white/40 font-medium">plano</div>
                  <div className="text-sm text-white/40 font-medium">inicial</div>
                </div>
              </div>

              <ul className="space-y-4 text-left mb-10 max-w-xs mx-auto">
                {[
                  'Lembretes de contas por email',
                  'Organização automática',
                  'Gráficos de despesas',
                  'Sem dados bancários necessários',
                  'Suporte prioritário'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              <Link to="/login?view=register" className="block">
                <Button className="w-full bg-white text-[#0f172a] hover:bg-blue-50 font-bold h-14 rounded-xl shadow-lg transition-transform hover:scale-[1.02] text-lg">
                  Criar minha conta
                </Button>
              </Link>
              <p className="mt-6 text-xs text-white/30">
                Planos Premium disponíveis para usuários avançados.
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 bg-[#0a0a0f]/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="flex items-center gap-3 hover:opacity-100 transition-opacity">
            <img src="/stater-logo-96.png" alt="Stater" className="w-8 h-8" />
            <span className="font-bold text-lg">Stater</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/40">
            <Link to="/terms" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
            <a href="mailto:staterbills@gmail.com" className="hover:text-white transition-colors">Suporte</a>
          </div>
          
          <div className="text-xs text-white/20">
            © 2025 Stater. Todos os direitos reservados.
          </div>
          
        </div>
      </footer>

    </div>
  );
};

export default HomePage;
