import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLocation } from 'react-router-dom';

/**
 * 🍪 Cookie Consent Component
 * 
 * Implementa banner de consentimento GDPR/LGPD compatível com Google AdSense.
 * Armazena preferências do usuário e configura gtag para AdSense.
 */

interface ConsentPreferences {
  analytics: boolean;
  advertising: boolean;
  timestamp: number;
}

export default function CookieConsent() {
  const location = useLocation();
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Não mostrar no dashboard
  if (location.pathname === '/dashboard') {
    return null;
  }

  useEffect(() => {
    // Verificar se já tem consentimento salvo
    const savedConsent = localStorage.getItem('cookie-consent');
    
    if (!savedConsent) {
      // Mostrar banner após 1 segundo
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Aplicar consentimento salvo
      const preferences: ConsentPreferences = JSON.parse(savedConsent);
      applyConsent(preferences);
    }
  }, []);

  const applyConsent = (preferences: ConsentPreferences) => {
    // Configurar Google AdSense consent
    if (window.gtag) {
      window.gtag('consent', 'update', {
        'ad_storage': preferences.advertising ? 'granted' : 'denied',
        'ad_user_data': preferences.advertising ? 'granted' : 'denied',
        'ad_personalization': preferences.advertising ? 'granted' : 'denied',
        'analytics_storage': preferences.analytics ? 'granted' : 'denied',
      });
    }

    // Salvar no localStorage
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

  const handleCustomize = () => {
    setShowDetails(true);
  };

  const handleSaveCustom = (analytics: boolean, advertising: boolean) => {
    const preferences: ConsentPreferences = {
      analytics,
      advertising,
      timestamp: Date.now(),
    };
    applyConsent(preferences);
    setShowBanner(false);
    setShowDetails(false);
  };

  if (!showBanner) return null;

  // Ocultar na dashboard se estiver na rota /dashboard
  if (window.location.pathname === '/dashboard') return null;

  return (
    <>
      {/* Banner Principal - Compacto e delicado */}
      {!showDetails && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-3">
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
              🍪 Usamos cookies para melhorar sua experiência.{' '}
              <a href="/privacy" className="text-theme-blue-500 hover:underline">
                Saiba mais
              </a>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCustomize}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Personalizar
              </button>
              <button
                onClick={handleRejectAll}
                className="px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Rejeitar
              </button>
              <button
                onClick={handleAcceptAll}
                className="ml-auto px-3 py-1.5 text-xs font-medium text-white bg-theme-blue-500 rounded-lg hover:bg-theme-blue-600 transition-colors"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Personalização */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Preferências de Cookies
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Cookies Essenciais */}
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Cookies Essenciais
                    </h3>
                    <span className="text-sm text-gray-500">Sempre Ativo</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Necessários para o funcionamento básico do site (login, segurança, etc).
                  </p>
                </div>

                {/* Cookies de Analytics */}
                <CookieToggle
                  id="analytics"
                  title="Cookies de Análise"
                  description="Ajudam a entender como os visitantes interagem com o site, coletando informações anônimas."
                  onToggle={(enabled) => {
                    const current = document.getElementById('analytics-toggle') as HTMLInputElement;
                    if (current) current.checked = enabled;
                  }}
                />

                {/* Cookies de Publicidade */}
                <CookieToggle
                  id="advertising"
                  title="Cookies de Publicidade"
                  description="Usados para exibir anúncios relevantes e personalizados. Ajudam a manter o site gratuito."
                  onToggle={(enabled) => {
                    const current = document.getElementById('advertising-toggle') as HTMLInputElement;
                    if (current) current.checked = enabled;
                  }}
                />
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    const analytics = (document.getElementById('analytics-toggle') as HTMLInputElement)?.checked || false;
                    const advertising = (document.getElementById('advertising-toggle') as HTMLInputElement)?.checked || false;
                    handleSaveCustom(analytics, advertising);
                  }}
                  className="flex-1 px-6 py-3 text-sm font-medium text-white bg-theme-blue-500 rounded-lg hover:bg-theme-blue-600 transition-colors"
                >
                  Salvar Preferências
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Aceitar Todos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface CookieToggleProps {
  id: string;
  title: string;
  description: string;
  onToggle: (enabled: boolean) => void;
}

function CookieToggle({ id, title, description }: CookieToggleProps) {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            id={`${id}-toggle`}
            className="sr-only peer"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-theme-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-theme-blue-500"></div>
        </label>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}

// Adicionar tipos ao window
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params: Record<string, string>
    ) => void;
  }
}
