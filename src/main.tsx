import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/mobile-first.css'
import './styles/paywall-fixes.css'
import './styles/status-bar-global.css'
import './styles/stater-ia-keyboard.css'

// Importa o logger para silenciar console em produção
import './utils/logger';

// Função global para processar callbacks de autenticação (usado pelo MainActivity)
(window as any).handleAuthCallback = async (url: string) => {
  try {
    const { handleAuthCallback } = await import('./utils/googleAuth');
    const user = await handleAuthCallback(url);
    if (user) {
      window.location.reload();
    }
  } catch (error) {
    // Erro silenciado em produção
  }
};

// Detectar e remover fragments vazios de forma segura
const handleUrlFragments = () => {
  const currentUrl = window.location.href;
  const hasFragment = currentUrl.includes('#');

  if (hasFragment) {
    const fragment = window.location.hash;
    
    const hasAuthTokens = fragment.includes('access_token=') || 
                         fragment.includes('refresh_token=') ||
                         fragment.includes('error=') ||
                         fragment.includes('type=');
    
    if (!hasAuthTokens && (fragment === '#' || fragment === '#/')) {
      const cleanUrl = currentUrl.split('#')[0];
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }
};

// Configurar comunicação com Service Worker
const setupServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update().catch(() => {});
    });
  }
};

// Limpar fragments no carregamento
handleUrlFragments();

// Configurar service worker após o app carregar
window.addEventListener('load', () => {
  setupServiceWorker();
  setTimeout(() => handleUrlFragments(), 200);
});

createRoot(document.getElementById("root")!).render(<App />);
