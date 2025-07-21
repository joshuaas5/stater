import React, { useState } from 'react';
import { ChevronRight, Smartphone, Bot, BarChart3, Camera, MessageSquare, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useOnboarding } from '@/hooks/useOnboarding';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  features: string[];
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 1,
    title: "Bem-vindo ao Stater",
    subtitle: "Seu assistente financeiro inteligente",
    description: "Controle suas finanças de forma simples e automática com ajuda da Inteligência Artificial",
    icon: <Target className="w-16 h-16" />,
    color: "from-blue-500 to-purple-600",
    features: [
      "📊 Dashboard completo",
      "🤖 Stater IA",
      "📈 Relatórios automáticos"
    ]
  },
  {
    id: 2,
    title: "Adicione Gastos Facilmente",
    subtitle: "Múltiplas formas de registrar",
    description: "Digite, tire fotos ou use nosso bot do Telegram para registrar seus gastos instantaneamente",
    icon: <Camera className="w-16 h-16" />,
    color: "from-green-500 to-teal-600",
    features: [
      "📝 Digite diretamente",
      "📷 Tire fotos de notas",
      "🤖 Use o bot Telegram"
    ]
  },  {
    id: 3,
    title: "🎉 Sua Vida Financeira Transformada!",
    subtitle: "A revolução chegou ao seu bolso",
    description: "Com IA avançada e automação inteligente, você terá o controle total das suas finanças sem esforço",
    icon: <Target className="w-16 h-16" />,
    color: "from-purple-600 to-pink-600",    features: [
      "💎 Transformação digital completa",
      "⚡ Decisões financeiras inteligentes",
      "🎯 Objetivos financeiros alcançáveis"
    ]
  }
];

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useOnboarding();  const handleNext = () => {
    console.log('handleNext called, currentStep:', currentStep, 'total steps:', onboardingSteps.length);
    
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Completing onboarding - apenas fechar popup...');
      
      // SIMPLES: Apenas marcar como concluído e fechar
      completeOnboarding();
      
      // Chamar callback se fornecido (que vai esconder o onboarding)
      if (onComplete) {
        console.log('Calling onComplete callback - fechando popup');
        onComplete();
      }
      
      console.log('✅ Onboarding concluído - popup fechado');
    }
  };
  
  const handleSkip = () => {
    console.log('handleSkip called - apenas fechar popup...');
    
    // SIMPLES: Apenas marcar como concluído e fechar
    completeOnboarding();
    
    // Chamar callback se fornecido (que vai esconder o onboarding)
    if (onComplete) {
      console.log('Calling onComplete callback from skip - fechando popup');
      onComplete();
    }
    
    console.log('✅ Onboarding pulado - popup fechado');
  };

  const step = onboardingSteps[currentStep];

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4"
      style={{
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <Card 
        className="w-full max-w-sm sm:max-w-md mx-auto rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
        style={{
          background: 'rgba(49, 81, 139, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif'
        }}
      >
        {/* Header com progresso */}
        <div 
          className="p-4 sm:p-6 pb-3 sm:pb-4"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <div className="flex space-x-1.5 sm:space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-white' : 'bg-white/30'
                  }`}
                  style={{
                    backgroundColor: index <= currentStep ? '#ffffff' : 'rgba(255, 255, 255, 0.3)'
                  }}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-white/70 hover:text-white hover:bg-white/20 text-xs sm:text-sm px-2 py-1"
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontWeight: 500
              }}
            >
              Pular
            </Button>
          </div>
        </div>

        {/* Conteúdo principal */}
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {/* Ícone com gradiente */}
          <div className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
            <div className="flex items-center justify-center">
              {React.cloneElement(step.icon as React.ReactElement, {
                className: "w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
              })}
            </div>
          </div>

          {/* Títulos */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 
              className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2"
              style={{
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                fontWeight: 600
              }}
            >
              {step.title}
            </h2>
            <h3 
              className="text-base sm:text-lg font-semibold text-white/80 mb-2 sm:mb-3"
              style={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 500
              }}
            >
              {step.subtitle}
            </h3>
            <p 
              className="text-sm sm:text-base text-white/70 leading-relaxed px-2"
              style={{
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              {step.description}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            {step.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <div 
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: '#3b82f6'
                  }}
                />
                <span 
                  className="text-sm sm:text-base font-medium"
                  style={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 500
                  }}
                >
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <Button
              onClick={handleNext}
              className="w-full py-2.5 sm:py-3 text-base sm:text-lg font-semibold text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontWeight: 600
              }}
            >              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  🚀 Transformar Minhas Finanças!
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </>
              )}
            </Button>

            {currentStep === onboardingSteps.length - 1 && (
              <div 
                className="text-center pt-3 sm:pt-4 border-t"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <p 
                  className="text-xs sm:text-sm mb-2 sm:mb-3"
                  style={{
                    color: 'rgba(255, 255, 255, 0.8)'
                  }}
                >
                  🎉 Pronto para começar sua jornada financeira!
                </p>
                <div className="flex flex-col space-y-1 sm:space-y-2 text-xs">
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>📱 App otimizado para mobile</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>🔒 Seus dados estão seguros</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>🚀 Interface simples e intuitiva</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
