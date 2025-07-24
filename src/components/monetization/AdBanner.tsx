import React, { useState, useEffect } from 'react';
import { X, ExternalLink, ShoppingBag, Coffee, Car, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserPlanManager } from '@/utils/userPlanManager';
import { PlanType } from '@/types';
import { getCurrentUser } from '@/utils/localStorage';

interface AdBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

interface AdContent {
  id: string;
  title: string;
  description: string;
  cta: string;
  icon: React.ComponentType<any>;
  gradient: string;
  link?: string;
  sponsor: string;
}

const AD_CONTENTS: AdContent[] = [
  {
    id: 'shopping',
    title: 'Economize nas Compras!',
    description: 'Até 50% OFF em produtos selecionados',
    cta: 'Ver Ofertas',
    icon: ShoppingBag,
    gradient: 'from-blue-500 to-purple-600',
    link: '#',
    sponsor: 'Marketplace'
  },
  {
    id: 'food',
    title: 'Delivery com Desconto',
    description: 'Frete grátis em pedidos acima de R$ 30',
    cta: 'Pedir Agora',
    icon: Coffee,
    gradient: 'from-orange-500 to-red-600',
    link: '#',
    sponsor: 'FoodApp'
  },
  {
    id: 'transport',
    title: 'Viaje Gastando Menos',
    description: 'Primeiras 3 corridas com 20% OFF',
    cta: 'Usar Cupom',
    icon: Car,
    gradient: 'from-green-500 to-teal-600',
    link: '#',
    sponsor: 'RideShare'
  },
  {
    id: 'home',
    title: 'Casa Organizada',
    description: 'Produtos para organização com desconto',
    cta: 'Comprar',
    icon: Home,
    gradient: 'from-pink-500 to-purple-600',
    link: '#',
    sponsor: 'HomeStore'
  }
];

export const AdBanner: React.FC<AdBannerProps> = ({
  position = 'bottom',
  className = '',
  onClose,
  showCloseButton = true
}) => {
  const [currentAd, setCurrentAd] = useState<AdContent>(AD_CONTENTS[0]);
  const [isVisible, setIsVisible] = useState(true);
  const [shouldShow, setShouldShow] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Verificar se deve mostrar o banner
  useEffect(() => {
    const checkShouldShow = async () => {
      try {
        const user = getCurrentUser();
        if (!user?.id) {
          setShouldShow(false);
          return;
        }

        const userPlan = await UserPlanManager.getUserPlan(user.id);
        
        // Só mostrar para usuários FREE
        if (userPlan.planType === PlanType.FREE) {
          setShouldShow(true);
        } else {
          setShouldShow(false);
        }
      } catch (error) {
        console.error('Erro ao verificar plano do usuário:', error);
        setShouldShow(false);
      }
    };

    checkShouldShow();
  }, []);

  // Rotacionar anúncios automaticamente
  useEffect(() => {
    if (!shouldShow) return;

    const interval = setInterval(() => {
      setIsAnimating(true);
      
      setTimeout(() => {
        setCurrentAd(prev => {
          const currentIndex = AD_CONTENTS.findIndex(ad => ad.id === prev.id);
          const nextIndex = (currentIndex + 1) % AD_CONTENTS.length;
          return AD_CONTENTS[nextIndex];
        });
        setIsAnimating(false);
      }, 150);
    }, 8000); // Trocar a cada 8 segundos

    return () => clearInterval(interval);
  }, [shouldShow]);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  const handleAdClick = () => {
    // Aqui você integraria com analytics
    console.log('🔗 Ad clicked:', currentAd.id);
    
    // Por enquanto, apenas abre um link placeholder
    if (currentAd.link) {
      window.open(currentAd.link, '_blank');
    }
  };

  // Não renderizar se não deve mostrar ou não está visível
  if (!shouldShow || !isVisible) {
    return null;
  }

  const Icon = currentAd.icon;
  const positionClasses = position === 'top' 
    ? 'top-0 border-b' 
    : 'bottom-0 border-t';

  return (
    <div className={`
      fixed left-0 right-0 z-40 bg-white/95 backdrop-blur-sm 
      ${positionClasses} ${className}
    `}>
      <Card className="mx-2 my-2 overflow-hidden border-0 shadow-lg">
        <div 
          className={`
            relative bg-gradient-to-r ${currentAd.gradient} p-3 cursor-pointer
            transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
            ${isAnimating ? 'opacity-70' : 'opacity-100'}
          `}
          onClick={handleAdClick}
        >
          {/* Botão de fechar */}
          {showCloseButton && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="absolute top-2 right-2 h-6 w-6 p-0 text-white/80 hover:text-white hover:bg-white/20"
            >
              <X size={14} />
            </Button>
          )}

          <div className="flex items-center space-x-3">
            {/* Ícone */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Icon size={20} className="text-white" />
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-white text-sm truncate">
                  {currentAd.title}
                </h3>
                <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                  {currentAd.sponsor}
                </Badge>
              </div>
              <p className="text-white/90 text-xs leading-tight">
                {currentAd.description}
              </p>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-1 bg-white/20 px-3 py-1.5 rounded-full">
                <span className="text-white text-xs font-medium">
                  {currentAd.cta}
                </span>
                <ExternalLink size={12} className="text-white" />
              </div>
            </div>
          </div>

          {/* Indicador de progresso */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
            <div 
              className="h-full bg-white/40 transition-all duration-[8000ms] ease-linear"
              style={{ 
                width: isAnimating ? '0%' : '100%',
                transition: isAnimating ? 'width 150ms ease-out' : 'width 8000ms linear'
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdBanner;
