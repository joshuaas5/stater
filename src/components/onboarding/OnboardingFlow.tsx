import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronRight, 
  ChevronLeft,
  Camera, 
  MessageSquare, 
  Zap, 
  Bell, 
  Target,
  Wallet,
  Sparkles,
  Check,
  X,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnboarding } from '@/hooks/useOnboarding';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  bgGradient: string;
  benefits: { emoji: string; text: string }[];
  tip?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Bem-vindo ao Stater! ",
    subtitle: "Inteligência para Prosperar",
    description: "Você deu o primeiro passo para transformar sua vida financeira. Prepare-se para uma experiência única!",
    icon: <Sparkles className="w-14 h-14" />,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    bgGradient: "from-violet-900/20 via-purple-900/10 to-transparent",
    benefits: [
      { emoji: "", text: "Controle inteligente com IA" },
      { emoji: "", text: "Visão completa das suas finanças" },
      { emoji: "", text: "Metas personalizadas" }
    ],
    tip: "Vamos conhecer tudo que o Stater pode fazer por você!"
  },
  {
    id: 2,
    title: "Registre em Segundos",
    subtitle: "Múltiplas formas de adicionar gastos",
    description: "Escolha a maneira mais fácil para você. Todas funcionam perfeitamente:",
    icon: <Camera className="w-14 h-14" />,
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    bgGradient: "from-emerald-900/20 via-green-900/10 to-transparent",
    benefits: [
      { emoji: "", text: "Foto de nota fiscal ou recibo" },
      { emoji: "", text: "Fale: \"Gastei 50 no mercado\"" },
      { emoji: "", text: "Importe PDF de fatura" },
      { emoji: "", text: "Arquivo OFX do seu banco" }
    ],
    tip: "A IA entende linguagem natural e cria a transação automaticamente!"
  },
  {
    id: 3,
    title: "Consultor de IA",
    subtitle: "Sua inteligência financeira pessoal",
    description: "Converse naturalmente sobre suas finanças. A IA analisa, sugere e responde tudo:",
    icon: <Brain className="w-14 h-14" />,
    gradient: "from-blue-500 via-indigo-500 to-purple-500",
    bgGradient: "from-blue-900/20 via-indigo-900/10 to-transparent",
    benefits: [
      { emoji: "", text: "\"Como posso economizar mais?\"" },
      { emoji: "", text: "\"Analise meus gastos do mês\"" },
      { emoji: "", text: "\"Qual categoria gasto mais?\"" }
    ],
    tip: "Acesse o chat de IA tocando no ícone de mensagem"
  },
  {
    id: 4,
    title: "Bot no Telegram",
    subtitle: "Registre direto do chat",
    description: "Conecte nosso bot e controle suas finanças sem abrir o app:",
    icon: <MessageSquare className="w-14 h-14" />,
    gradient: "from-sky-500 via-blue-500 to-cyan-500",
    bgGradient: "from-sky-900/20 via-blue-900/10 to-transparent",
    benefits: [
      { emoji: "", text: "\"Gastei 30 no almoço\"  Registrado!" },
      { emoji: "", text: "\"Quanto gastei hoje?\"  Resposta" },
      { emoji: "", text: "Receba alertas de contas" }
    ],
    tip: "Configure em Ajustes  Telegram"
  },
  {
    id: 5,
    title: "Lembrete de Contas",
    subtitle: "Nunca mais pague multa",
    description: "Cadastre suas contas fixas e receba alertas inteligentes:",
    icon: <Bell className="w-14 h-14" />,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    bgGradient: "from-amber-900/20 via-orange-900/10 to-transparent",
    benefits: [
      { emoji: "", text: "Cadastre contas recorrentes" },
      { emoji: "", text: "Alerta 3 dias antes do vencimento" },
      { emoji: "", text: "Marque como paga com 1 toque" }
    ],
    tip: "Comece adicionando suas contas fixas mensais"
  },
  {
    id: 6,
    title: "Metas Financeiras",
    subtitle: "Realize seus sonhos",
    description: "Defina objetivos e acompanhe seu progresso visualmente:",
    icon: <Target className="w-14 h-14" />,
    gradient: "from-pink-500 via-rose-500 to-red-500",
    bgGradient: "from-pink-900/20 via-rose-900/10 to-transparent",
    benefits: [
      { emoji: "", text: "Crie metas personalizadas" },
      { emoji: "", text: "Acompanhe o progresso" },
      { emoji: "", text: "Celebre suas conquistas" }
    ],
    tip: "Comece com uma meta pequena e vá aumentando!"
  },
  {
    id: 7,
    title: "Tudo Pronto! ",
    subtitle: "Sua jornada começa agora",
    description: "Você está pronto para transformar sua vida financeira. Comece já:",
    icon: <Wallet className="w-14 h-14" />,
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    bgGradient: "from-green-900/20 via-emerald-900/10 to-transparent",
    benefits: [
      { emoji: "1", text: "Adicione seu saldo atual" },
      { emoji: "2", text: "Registre gastos recentes" },
      { emoji: "3", text: "Crie sua primeira meta" }
    ],
    tip: "Quanto mais você usar, mais inteligente o Stater fica!"
  }
];

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [animatedStep, setAnimatedStep] = useState(0);
  const { completeOnboarding } = useOnboarding();

  useEffect(() => {
    setAnimatedStep(-1);
    const timer = setTimeout(() => setAnimatedStep(currentStep), 50);
    return () => clearTimeout(timer);
  }, [currentStep]);

  const handleNext = () => {
    if (isAnimating) return;
    if (currentStep < onboardingSteps.length - 1) {
      setDirection('next');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 200);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (isAnimating || currentStep === 0) return;
    setDirection('prev');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsAnimating(false);
    }, 200);
  };

  const handleGoToStep = (stepIndex: number) => {
    if (isAnimating || stepIndex === currentStep) return;
    setDirection(stepIndex > currentStep ? 'next' : 'prev');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(stepIndex);
      setIsAnimating(false);
    }, 200);
  };

  const handleComplete = () => {
    completeOnboarding();
    if (onComplete) onComplete();
  };

  const handleSkip = () => {
    completeOnboarding();
    if (onComplete) onComplete();
  };

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const isStepVisible = animatedStep === currentStep;

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999, background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(16px)' }}
    >
      <div 
        className={`w-full max-w-md mx-auto rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isAnimating ? (direction === 'next' ? 'opacity-50 translate-x-4' : 'opacity-50 -translate-x-4') : 'opacity-100 translate-x-0'
        }`}
        style={{
          background: 'linear-gradient(180deg, #0a0a1a 0%, #0c0c1d 50%, #0f0a1e 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          maxHeight: '92vh',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(139, 92, 246, 0.1)'
        }}
      >
        <style>{`@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }`}</style>

        <div className="h-1.5 bg-white/5 relative overflow-hidden">
          <div 
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #8b5cf6, #06b6d4, #10b981, #8b5cf6)',
              backgroundSize: '200% auto',
              animation: 'shimmer 3s linear infinite'
            }}
          />
        </div>

        <div className="flex justify-between items-center px-5 py-4">
          <div className="flex items-center gap-1.5">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => handleGoToStep(index)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer hover:opacity-80 ${
                  index < currentStep ? 'bg-emerald-400 w-2' : index === currentStep ? 'bg-white w-6' : 'bg-white/20 w-2'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-xs font-medium">{currentStep + 1}/{onboardingSteps.length}</span>
            <button onClick={handleSkip} className="text-white/50 hover:text-white/80 text-sm font-medium transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5">
              Pular <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-6 overflow-y-auto relative" style={{ maxHeight: 'calc(92vh - 180px)' }}>
          <div className={`absolute inset-0 bg-gradient-to-b ${step.bgGradient} pointer-events-none transition-opacity duration-500`} style={{ opacity: isStepVisible ? 1 : 0 }} />

          <div 
            className={`relative w-28 h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isStepVisible ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}
            style={{ boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.2)' }}
          >
            {step.icon}
            <div className="absolute inset-0 rounded-3xl border border-white/20" />
          </div>

          <div className={`text-center mb-6 transition-all duration-500 delay-100 ${isStepVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h2 className="text-2xl font-bold text-white mb-2">{step.title}</h2>
            <h3 className="text-base font-semibold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent mb-3">{step.subtitle}</h3>
            <p className="text-white/60 text-sm leading-relaxed">{step.description}</p>
          </div>

          <div className="space-y-2.5 mb-6">
            {step.benefits.map((benefit, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3.5 rounded-2xl transition-all duration-500 hover:scale-[1.02] ${isStepVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}
                style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.06)', transitionDelay: `${150 + index * 75}ms` }}
              >
                <span className="text-2xl flex-shrink-0">{benefit.emoji}</span>
                <span className="text-white/90 text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {step.tip && (
            <div className={`p-4 rounded-2xl transition-all duration-500 delay-300 ${isStepVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
              style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(6, 182, 212, 0.08))', border: '1px solid rgba(139, 92, 246, 0.2)' }}
            >
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/80 text-sm leading-relaxed"><span className="font-semibold text-amber-400">Dica: </span>{step.tip}</p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
          {!isFirstStep && (
            <Button onClick={handlePrev} className="px-4 py-3 font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.8)' }}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1 py-3.5 text-base font-bold text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: isLastStep ? 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
              border: 'none',
              boxShadow: isLastStep ? '0 8px 32px rgba(16, 185, 129, 0.4)' : '0 8px 32px rgba(139, 92, 246, 0.3)'
            }}>
            {isLastStep ? (
              <span className="flex items-center justify-center gap-2"><Check className="w-5 h-5" />Começar Agora!</span>
            ) : (
              <span className="flex items-center justify-center gap-2">Continuar<ChevronRight className="w-5 h-5" /></span>
            )}
          </Button>
        </div>

        {isLastStep && <p className="text-center text-white/30 text-xs pb-4">Você pode rever este tutorial em Ajustes  Sobre</p>}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default OnboardingFlow;
