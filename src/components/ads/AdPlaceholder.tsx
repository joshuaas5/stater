import React, { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';

interface AdPlaceholderProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: () => void;
  type: 'bills' | 'transactions' | 'messages' | 'financial_analysis' | 'report_downloads' | 'recurring_transactions';
  duration?: number; // duração em segundos
}

export const AdPlaceholder: React.FC<AdPlaceholderProps> = ({
  isOpen,
  onClose,
  onReward,
  type,
  duration = 8
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(duration);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(false);
      setTimeLeft(duration);
      setCanSkip(false);
    }
  }, [isOpen, duration]);

  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= 3) {
          setCanSkip(true);
        }
        if (newTime <= 0) {
          handleAdComplete();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft]);

  const handlePlayAd = () => {
    setIsPlaying(true);
  };

  const handleAdComplete = () => {
    onReward();
    onClose();
  };

  const handleSkip = () => {
    if (canSkip) {
      handleAdComplete();
    }
  };

  const getAdTypeText = () => {
    switch (type) {
      case 'transactions':
        return 'Continue adicionando transações';
      case 'bills':
        return 'Continue adicionando contas';
      case 'recurring_transactions':
        return 'Ganhe transações recorrentes extras';
      case 'messages':
        return 'Continue enviando mensagens';
      default:
        return 'Continue usando o Stater';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">
            🎬 Anúncio Premiado
          </h3>
          {!isPlaying && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Ad Content */}
        <div className="p-6 text-center">
          {!isPlaying ? (
            <>
              <div className="mb-4">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Play className="text-white h-8 w-8 ml-1" />
                </div>
              </div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">
                Assista e ganhe recompensas!
              </h4>
              <p className="text-gray-600 mb-6">
                {getAdTypeText()}
              </p>
              <button
                onClick={handlePlayAd}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                ▶️ Assistir Anúncio ({duration}s)
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <div className="w-full h-40 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center relative overflow-hidden">
                  {/* Simulação de anúncio */}
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold mb-2">🎯 Anúncio Demo</div>
                    <div className="text-lg">Stater - Sua vida financeira organizada</div>
                    <div className="text-sm opacity-80 mt-2">
                      (Este é um placeholder para Google Ads)
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/20 h-1">
                    <div 
                      className="bg-white h-full transition-all duration-1000 ease-linear"
                      style={{ width: `${((duration - timeLeft) / duration) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-gray-600">
                  ⏱️ {timeLeft}s restantes
                </div>
                
                {canSkip ? (
                  <button
                    onClick={handleSkip}
                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    ✅ Concluir
                  </button>
                ) : (
                  <div className="bg-gray-200 text-gray-500 font-semibold py-2 px-4 rounded-lg">
                    Aguarde...
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 pb-4">
          <div className="text-xs text-gray-500 text-center">
            🎁 Assista até o final para ganhar recompensas
          </div>
        </div>
      </div>
    </div>
  );
};
