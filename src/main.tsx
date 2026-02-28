import { createRoot } from 'react-dom/client'
import App from './App'

//  PRIMEIRO: Desbloqueia scroll e detecta ambiente ANTES de qualquer outra coisa
import './utils/unlockScroll';

// CSS Base
import './index.css'

// CSS de Performance (ordem importa!)
import './styles/mobile-first.css'
import './styles/critical-performance.css'
import './styles/force-scroll-fix.css'

// CSS de UI específicos
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
    const urlWithoutFragment = currentUrl.split('#')[0];
    const fragmentPart = currentUrl.split('#')[1];
    
    // Se o fragment está vazio ou é apenas '/', limpar
    if (!fragmentPart || fragmentPart === '' || fragmentPart === '/') {
      window.history.replaceState({}, '', urlWithoutFragment);
    }
  }
};

handleUrlFragments();

createRoot(document.getElementById('root')!).render(<App />);
