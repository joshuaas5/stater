import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

/**
 * Cookie Consent Component
 * 
 * Implementa banner de consentimento GDPR/LGPD compativel com Google AdSense.
 * Armazena preferencias do usuario e configura gtag para AdSense.
 * 
 * IMPORTANTE: NAO MOSTRA EM APPS NATIVOS (Capacitor)
 */

interface ConsentPreferences {
  analytics: boolean;
  advertising: boolean;
  timestamp: number;
}

// Componente interno que usa hooks
function CookieConsentBanner() {
  const location = useLocation();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const isDashboard = location.pathname === '/dashboard';

  useEffect(() => {
    if (isDashboard) return;
    
    const savedConsent = localStorage.getItem('cookie-consent');
    
    if (!savedConsent) {
      const showBannerOnInteraction = () => {
        setShowBanner(true);
        ['mousedown', 'touchstart', 'scroll', 'keydown'].forEach(e => 
          window.removeEventListener(e, showBannerOnInteraction)
        );
      };
      
      ['mousedown', 'touchstart', 'scroll', 'keydown'].forEach(e => 
        window.addEventListener(e, showBannerOnInteraction, { once: true, passive: true })
      );
      
      return () => {
        ['mousedown', 'touchstart', 'scroll', 'keydown'].forEach(e => 
          window.removeEventListener(e, showBannerOnInteraction)
        );
      };
    } else {
      const preferences: ConsentPreferences = JSON.parse(savedConsent);
      applyConsent(preferences);
    }
  }, [isDashboard]);

  const applyConsent = (preferences: ConsentPreferences) => {
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': preferences.advertising ? 'granted' : 'denied',
        'ad_user_data': preferences.advertising ? 'granted' : 'denied',
        'ad_personalization': preferences.advertising ? 'granted' : 'denied',
        'analytics_storage': preferences.analytics ? 'granted' : 'denied',
      });
    }
    localStorage.setItem('cookie-consent', JSON.stringify(preferences));
  };

  const handleAcceptAll = () => {
    const preferences: ConsentPreferences = {
      analytics: true,
      advertising: true,
      timestamp: Date.now(),
    };
    applyConsent(preferences);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const preferences: ConsentPreferences = {
      analytics: false,
      advertising: false,
      timestamp: Date.now(),
    };
    applyConsent(preferences);
    setShowBanner(false);
  };

  const handleSavePreferences = (analytics: boolean, advertising: boolean) => {
    const preferences: ConsentPreferences = {
      analytics,
      advertising,
      timestamp: Date.now(),
    };
    applyConsent(preferences);
    setShowBanner(false);
    setShowDetails(false);
  };

  if (!showBanner || isDashboard) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg p-4 md:p-6 animate-in slide-in-from-bottom duration-300"
      role="dialog"
      aria-label="Preferencias de cookies"
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Preferencias de Cookies
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Utilizamos cookies para melhorar sua experiencia, personalizar conteudo e anuncios, 
              e analisar nosso trafego. Voce pode escolher quais cookies aceitar.
            </p>
          </div>
          <button
            onClick={handleRejectAll}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {showDetails ? (
          <CookieDetails 
            onSave={handleSavePreferences}
            onCancel={() => setShowDetails(false)}
          />
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium py-2.5 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm"
            >
              Aceitar Todos
            </button>
            <button
              onClick={() => setShowDetails(true)}
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Personalizar
            </button>
            <button
              onClick={handleRejectAll}
              className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Rejeitar Todos
            </button>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Ao continuar navegando, voce concorda com nossa{' '}
          <a href="/privacy" className="text-green-600 hover:underline">Politica de Privacidade</a>.
        </p>
      </div>
    </div>
  );
}

function CookieDetails({ 
  onSave, 
  onCancel 
}: { 
  onSave: (analytics: boolean, advertising: boolean) => void;
  onCancel: () => void;
}) {
  const [analytics, setAnalytics] = useState(true);
  const [advertising, setAdvertising] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Cookies Essenciais</h4>
          <p className="text-sm text-gray-500">Necessarios para o funcionamento do site</p>
        </div>
        <span className="text-sm text-green-600 font-medium">Sempre ativos</span>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Cookies Analiticos</h4>
          <p className="text-sm text-gray-500">Ajudam a entender como voce usa o site</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={analytics}
            onChange={(e) => setAnalytics(e.target.checked)}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        </label>
      </div>

      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div>
          <h4 className="font-medium text-gray-900 dark:text-white">Cookies de Publicidade</h4>
          <p className="text-sm text-gray-500">Usados para anuncios personalizados</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={advertising}
            onChange={(e) => setAdvertising(e.target.checked)}
            className="sr-only peer" 
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => onSave(analytics, advertising)}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium py-2.5 px-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
        >
          Salvar Preferencias
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
        >
          Voltar
        </button>
      </div>
    </div>
  );
}

// Componente exportado que verifica se e nativo ANTES de renderizar qualquer coisa
export default function CookieConsent() {
  // Verificacao simples, sem hooks - retorna null para apps nativos
  if (Capacitor.isNativePlatform()) {
    return null;
  }
  
  // So renderiza o banner em ambiente web
  return <CookieConsentBanner />;
}
