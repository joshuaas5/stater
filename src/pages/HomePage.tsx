import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, Camera, PieChart, Bell, Sparkles, Check, ArrowRight, Shield, Zap } from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      
      {/* ========== HEADER FIXO ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/stater-logo-96.png" alt="Stater" className="w-7 h-7" />
            <span className="font-bold text-base">Stater</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5 text-xs h-8 px-3">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-4">
                Criar conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section className="pt-24 pb-10 px-4">
        <div className="max-w-lg mx-auto text-center">
          
          {/* Badge Gratuito */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 text-xs font-semibold">100% Gratuito</span>
          </div>
          
          {/* Headline Principal */}
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-3">
            Controle suas finanças
            <span className="block text-blue-400 mt-1">falando ou tirando foto</span>
          </h1>
          
          {/* Subheadline */}
          <p className="text-sm text-white/50 mb-6 leading-relaxed max-w-sm mx-auto">
            Registre gastos por <span className="text-white/80">voz</span>, <span className="text-white/80">foto de nota fiscal</span> ou texto. 
            A inteligência artificial organiza tudo pra você.
          </p>
          
          {/* CTA Principal */}
          <Link to="/register" className="block mb-5">
            <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 px-8 text-sm rounded-xl shadow-lg shadow-blue-600/20">
              Começar grátis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          
          {/* Trust */}
          <div className="flex items-center justify-center gap-4 text-[11px] text-white/40">
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              Sem cartão
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              Pronto em 30s
            </span>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="py-10 px-4">
        <div className="max-w-lg mx-auto">
          
          <p className="text-center text-xs text-white/40 uppercase tracking-wider mb-6">
            O que o Stater faz por você
          </p>
          
          <div className="space-y-3">
            
            {/* Feature 1 */}
            <div className="flex items-start gap-4 bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="w-10 h-10 bg-blue-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white mb-0.5">Registro por Voz</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Diga "gastei 50 no mercado" e pronto. A IA entende e categoriza.
                </p>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="flex items-start gap-4 bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="w-10 h-10 bg-purple-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white mb-0.5">Foto de Nota Fiscal</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Fotografe qualquer recibo. Extraímos valor, data e categoria automaticamente.
                </p>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="flex items-start gap-4 bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="w-10 h-10 bg-emerald-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <PieChart className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white mb-0.5">Relatórios Visuais</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Gráficos que mostram para onde seu dinheiro está indo.
                </p>
              </div>
            </div>
            
            {/* Feature 4 */}
            <div className="flex items-start gap-4 bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="w-10 h-10 bg-amber-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white mb-0.5">Lembretes de Contas</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Cadastre suas contas e receba alertas antes do vencimento.
                </p>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ========== COMO FUNCIONA ========== */}
      <section className="py-10 px-4 bg-white/[0.02]">
        <div className="max-w-lg mx-auto">
          
          <h2 className="text-lg font-bold text-center mb-6">
            Simples de usar
          </h2>
          
          <div className="space-y-3">
            
            <div className="flex items-center gap-3 bg-[#0a0a0f] rounded-xl p-4">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                1
              </div>
              <p className="text-sm text-white/70">
                <span className="text-white font-medium">Registre</span> — por voz, foto ou digitando
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-[#0a0a0f] rounded-xl p-4">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                2
              </div>
              <p className="text-sm text-white/70">
                <span className="text-white font-medium">IA organiza</span> — categoria, data, valor
              </p>
            </div>
            
            <div className="flex items-center gap-3 bg-[#0a0a0f] rounded-xl p-4">
              <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                3
              </div>
              <p className="text-sm text-white/70">
                <span className="text-white font-medium">Visualize</span> — gráficos e relatórios prontos
              </p>
            </div>
            
          </div>
        </div>
      </section>

      {/* ========== TELEGRAM ========== */}
      <section className="py-10 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-[#0088cc]/10 to-transparent border border-[#0088cc]/20 rounded-2xl p-5 text-center">
            <div className="w-12 h-12 bg-[#0088cc]/15 rounded-xl flex items-center justify-center mx-auto mb-3">
              <img src="/telegram-logo.svg" alt="Telegram" className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-sm text-white mb-1.5">
              Use pelo Telegram
            </h3>
            <p className="text-xs text-white/50 mb-3 max-w-xs mx-auto">
              Envie mensagens ou áudios direto pelo Telegram. Tudo sincroniza com o app automaticamente.
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] text-[#0088cc] font-medium">
              <Zap className="w-3 h-3" />
              Conecta em segundos
            </span>
          </div>
        </div>
      </section>

      {/* ========== PREÇO / GRATUITO ========== */}
      <section className="py-10 px-4 bg-white/[0.02]">
        <div className="max-w-sm mx-auto text-center">
          
          <h2 className="text-lg font-bold mb-2">
            Gratuito. Sempre.
          </h2>
          <p className="text-xs text-white/40 mb-5">
            Sem período de teste. Sem pegadinhas.
          </p>
          
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-5">
            
            <div className="text-2xl font-bold text-white mb-0.5">R$ 0</div>
            <div className="text-[10px] text-white/30 mb-4">para sempre</div>
            
            <ul className="space-y-2.5 text-left mb-5">
              <li className="flex items-center gap-2.5 text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-white/60">Registro por voz ilimitado</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-white/60">Leitura de notas fiscais</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-white/60">Gráficos e relatórios</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-white/60">Lembretes por email</span>
              </li>
              <li className="flex items-center gap-2.5 text-xs">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="text-white/60">Integração Telegram</span>
              </li>
            </ul>
            
            <Link to="/register" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 rounded-xl text-sm">
                Criar conta gratuita
              </Button>
            </Link>
            
          </div>
        </div>
      </section>

      {/* ========== SEGURANÇA ========== */}
      <section className="py-10 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start gap-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
            <div className="w-9 h-9 bg-emerald-500/15 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white mb-0.5">Seus dados são seus</h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Não pedimos acesso bancário. Não vendemos seus dados. Simples assim.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="py-14 px-4">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-xl font-bold mb-3">
            Pronto para organizar suas finanças?
          </h2>
          <p className="text-xs text-white/40 mb-5">
            Crie sua conta em menos de 30 segundos.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 px-10 text-sm rounded-xl shadow-lg shadow-blue-600/20">
              Começar grátis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-lg mx-auto">
          
          <div className="flex items-center justify-center gap-2 mb-5">
            <img src="/stater-logo-96.png" alt="Stater" className="w-5 h-5" />
            <span className="font-semibold text-sm">Stater</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-5 text-xs">
            <Link to="/terms" className="text-white/30 hover:text-white/60 transition-colors">
              Termos
            </Link>
            <Link to="/privacy" className="text-white/30 hover:text-white/60 transition-colors">
              Privacidade
            </Link>
            <a href="mailto:staterbills@gmail.com" className="text-white/30 hover:text-white/60 transition-colors">
              Contato
            </a>
          </div>
          
          <p className="text-center text-[10px] text-white/20">
            © 2025 Stater. Todos os direitos reservados.
          </p>
          
        </div>
      </footer>
      
    </div>
  );
};

export default HomePage;
