import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  ChevronRight, 
  Camera, 
  MessageSquare, 
  Zap, 
  Bell, 
  TrendingUp,
  Sparkles,
  Check,
  X
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
  benefits: { emoji: string; text: string }[];
  tip?: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Olá! 👋",
    subtitle: "Bem-vindo ao Stater",
    description: "O app que faz o trabalho chato por você. Chega de digitar cada gasto manualmente!",
    icon: <Sparkles className="w-12 h-12" />,
    gradient: "from-blue-500 via-purple-500 to-pink-500",
    benefits: [
      { emoji: "📸", text: "Tire foto do recibo → gasto registrado" },
      { emoji: "🎤", text: "Fale com o app → ele entende" },
      { emoji: "🤖", text: "Pergunte qualquer dúvida financeira" }
    ],
    tip: "Você não precisa decorar nada. É só usar naturalmente!"
  },
  {
    id: 2,
    title: "Jeito Fácil de Registrar",
    subtitle: "Escolha como você prefere",
    description: "Múltiplas formas de adicionar seus gastos sem esforço:",
    icon: <Camera className="w-12 h-12" />,
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    benefits: [
      { emoji: "📷", text: "Foto de nota fiscal ou recibo" },
      { emoji: "📄", text: "PDF de fatura de cartão" },
      { emoji: "🏦", text: "Arquivo OFX do seu banco" },
      { emoji: "💬", text: "Digitar ou falar naturalmente" }
    ],
    tip: "A IA entende \"gastei 50 no uber\" e cria a transação!"
  },
  {
    id: 3,
    title: "Telegram: Seu Atalho",
    subtitle: "Controle financeiro no chat",
    description: "Conecte nosso bot e registre gastos direto do Telegram, sem abrir o app:",
    icon: <MessageSquare className="w-12 h-12" />,
    gradient: "from-sky-500 via-blue-500 to-indigo-500",
    benefits: [
      { emoji: "⚡", text: "\"Gastei 30 no almoço\" → Pronto!" },
      { emoji: "📊", text: "\"Quanto gastei hoje?\" → Resposta na hora" },
      { emoji: "🔄", text: "Sincroniza automático com o app" }
    ],
    tip: "Vá em Ajustes → Telegram para conectar"
  },
  {
    id: 4,
    title: "Nunca Esqueça uma Conta",
    subtitle: "Alertas inteligentes",
    description: "Configure suas contas fixas e receba lembretes antes do vencimento:",
    icon: <Bell className="w-12 h-12" />,
    gradient: "from-amber-500 via-orange-500 to-red-500",
    benefits: [
      { emoji: "📅", text: "Cadastre contas recorrentes" },
      { emoji: "🔔", text: "Notificação 3 dias antes" },
      { emoji: "✅", text: "Marque como paga com 1 clique" }
    ],
    tip: "Acesse 'Contas' no menu para começar"
  },
  {
    id: 5,
    title: "Pronto para Começar! 🚀",
    subtitle: "Sua jornada financeira começa agora",
    description: "Você tem tudo que precisa para controlar suas finanças de forma inteligente.",
    icon: <TrendingUp className="w-12 h-12" />,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    benefits: [
      { emoji: "💡", text: "Dica: Comece adicionando seu saldo atual" },
      { emoji: "📈", text: "Registre seus gastos dos últimos dias" },
      { emoji: "🎯", text: "Crie uma meta de economia" }
    ],
    tip: "Quanto mais você usar, mais inteligente o app fica!"
  }
];

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { completeOnboarding } = useOnboarding();

  const handleNext = () => {
    if (isAnimating) return;
    
    if (currentStep < onboardingSteps.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    completeOnboarding();
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    if (onComplete) {
      onComplete();
    }
  };

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;

  const modalContent = (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)'
      }}
    >
      <div 
        className={`w-full max-w-md mx-auto rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${isAnimating ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          maxHeight: '90vh'
        }}
      >
        {/* Progress Bar */}
        <div className="h-1 bg-white/10">
          <div 
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)`
            }}
          />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index < currentStep 
                    ? 'bg-green-400' 
                    : index === currentStep 
                      ? 'bg-white w-6' 
                      : 'bg-white/30'
                }`}
              />
            ))}
          </div>
          <button
            onClick={handleSkip}
            className="text-white/60 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
          >
            Pular
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {/* Icon */}
          <div 
            className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-2xl`}
            style={{
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}
          >
            {step.icon}
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {step.title}
            </h2>
            <h3 className="text-lg font-semibold text-white/70 mb-3">
              {step.subtitle}
            </h3>
            <p className="text-white/60 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            {step.benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-xl transition-all duration-300"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <span className="text-2xl flex-shrink-0">{benefit.emoji}</span>
                <span className="text-white/90 text-sm font-medium">
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>

          {/* Tip */}
          {step.tip && (
            <div 
              className="p-4 rounded-xl mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(139, 92, 246, 0.15))',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}
            >
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-white/80 text-sm">
                  <span className="font-semibold text-yellow-400">Dica: </span>
                  {step.tip}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="px-6 py-4 border-t"
          style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <Button
            onClick={handleNext}
            className="w-full py-4 text-base font-bold text-white rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: isLastStep 
                ? 'linear-gradient(135deg, #10b981, #059669)' 
                : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              border: 'none',
              boxShadow: isLastStep 
                ? '0 8px 24px rgba(16, 185, 129, 0.4)' 
                : '0 8px 24px rgba(59, 130, 246, 0.4)'
            }}
          >
            {isLastStep ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                Começar a Usar!
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Continuar
                <ChevronRight className="w-5 h-5" />
              </span>
            )}
          </Button>

          {isLastStep && (
            <p className="text-center text-white/40 text-xs mt-3">
              Você pode rever este tutorial em Ajustes
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default OnboardingFlow;
