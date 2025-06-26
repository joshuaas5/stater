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
    title: "Bem-vindo ao ICTUS",
    subtitle: "Seu assistente financeiro inteligente",
    description: "Controle suas finanças de forma simples e automática com ajuda da Inteligência Artificial",
    icon: <Target className="w-16 h-16" />,
    color: "from-blue-500 to-purple-600",
    features: [
      "📊 Dashboard completo",
      "🤖 Assistente IA",
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
    color: "from-purple-600 to-pink-600",
    features: [
      "� Transformação digital completa",
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
    console.log('handleNext called, currentStep:', currentStep);
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log('Completing onboarding...');
      completeOnboarding();
      onComplete?.();
      // Forçar reload para garantir que o estado seja atualizado
      window.location.reload();
    }
  };
  
  const handleSkip = () => {
    console.log('handleSkip called');
    completeOnboarding();
    onComplete?.();
    // Forçar reload para garantir que o estado seja atualizado
    window.location.reload();
  };

  const step = onboardingSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header com progresso */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              {onboardingSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700"
            >
              Pular
            </Button>
          </div>
        </div>

        {/* Conteúdo principal */}
        <CardContent className="px-6 pb-6">
          {/* Ícone com gradiente */}
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
            {step.icon}
          </div>

          {/* Títulos */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step.title}
            </h2>
            <h3 className="text-lg font-semibold text-gray-600 mb-3">
              {step.subtitle}
            </h3>
            <p className="text-gray-500 leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8">
            {step.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                <span className="text-gray-700 font-medium">{feature}</span>
              </div>
            ))}
          </div>

          {/* Botões */}
          <div className="space-y-3">
            <Button
              onClick={handleNext}
              className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
            >              {currentStep === onboardingSteps.length - 1 ? (
                <>
                  🚀 Transformar Minhas Finanças!
                </>
              ) : (
                <>
                  Próximo
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            {currentStep === onboardingSteps.length - 1 && (
              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-3">
                  🎉 Pronto para começar sua jornada financeira!
                </p>
                <div className="flex flex-col space-y-2 text-xs text-gray-400">
                  <span>📱 App otimizado para mobile</span>
                  <span>🔒 Seus dados estão seguros</span>
                  <span>🚀 Interface simples e intuitiva</span>
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
