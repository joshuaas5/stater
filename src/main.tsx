import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/mobile-first.css'
import './styles/paywall-fixes.css'
import './styles/status-bar-global.css'
import './styles/stater-ia-keyboard.css'
import { handleAuthCallback } from './utils/googleAuth'

// Função global para processar callbacks de autenticação (usado pelo MainActivity)
(window as any).handleAuthCallback = async (url: string) => {
  console.log('🔄 Callback de autenticação recebido globalmente:', url);
  try {
    const user = await handleAuthCallback(url);
    if (user) {
      console.log('✅ Usuário autenticado:', user.email);
      // Recarregar a página para atualizar o estado da aplicação
      window.location.reload();
    }
  } catch (error) {
    console.error('❌ Erro ao processar callback global:', error);
  }
};

// 🔧 CORREÇÃO FINAL: Detectar e remover fragments vazios de forma segura
const handleUrlFragments = () => {
  const currentUrl = window.location.href;
  const hasFragment = currentUrl.includes('#');

  if (hasFragment) {
    const fragment = window.location.hash;
    console.log('🔧 Fragment detectado:', fragment || '(vazio)');
    
    // Verificar se contém tokens de autenticação do Supabase
    const hasAuthTokens = fragment.includes('access_token=') || 
                         fragment.includes('refresh_token=') ||
                         fragment.includes('error=') ||
                         fragment.includes('type=');
    
    if (hasAuthTokens) {
      console.log('🔧 Tokens de autenticação detectados - MANTENDO fragment para processamento');
      // Apenas registrar - não alteramos nada, o AuthContext vai limpar depois
    } else if (fragment === '#' || fragment === '#/') {
      // Fragment vazio ou barra - remover imediatamente
      console.log('🔧 Fragment vazio detectado - limpando URL');
      const cleanUrl = currentUrl.split('#')[0];
      window.history.replaceState({}, document.title, cleanUrl);
      console.log('🔧 URL limpa de fragment vazio:', cleanUrl);
    }
  } else {
    console.log('🔧 Nenhum fragment detectado na URL');
  }
};

// 🔧 CORREÇÃO FINAL: Configurar comunicação com Service Worker
const setupServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    // Registrar canal de comunicação com o Service Worker
    navigator.serviceWorker.ready.then(registration => {
      console.log('🔧 Service Worker pronto:', registration.active?.scriptURL);
      
      // Verificar se precisamos atualizar o SW
      registration.update().catch(err => 
        console.error('Erro ao atualizar SW:', err)
      );
    });

    // Escutar por mensagens do Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('🔧 Mensagem do Service Worker:', event.data);
    });
    
    // Tratar erros de controllerchange
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔧 Service Worker controlador alterado');
    });
  }
};

// 🔧 CORREÇÃO FINAL: Limpar qualquer fragment vazio no carregamento
handleUrlFragments();

// 🔧 CORREÇÃO FINAL: Configurar service worker após o app carregar
window.addEventListener('load', () => {
  setupServiceWorker();
  
  // Verificar e tratar fragments novamente (casos raros de alteração durante carga)
  setTimeout(() => handleUrlFragments(), 200);
});

// 🔧 CORREÇÃO FINAL: Logs para debug
console.log('🚀 App iniciando - URL:', window.location.href);
console.log('🚀 User Agent:', navigator.userAgent);

createRoot(document.getElementById("root")!).render(<App />);
