import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/mobile-first.css'

// 🔧 CORREÇÃO: Processar tokens de autenticação ANTES de limpar fragment
if (window.location.hash) {
  console.log('🔧 Fragment detectado:', window.location.hash);
  
  // Verificar se contém tokens de autenticação do Supabase
  const fragment = window.location.hash;
  const hasAuthTokens = fragment.includes('access_token=') || 
                       fragment.includes('refresh_token=') ||
                       fragment.includes('error=');
  
  if (hasAuthTokens) {
    console.log('🔧 Tokens de autenticação detectados - MANTENDO fragment temporariamente');
    console.log('🔧 O Supabase processará os tokens e limpará depois');
    // NÃO remover ainda - deixar o Supabase processar primeiro
  } else {
    console.log('🔧 Fragment sem tokens - limpando imediatamente:', fragment);
    const cleanUrl = window.location.href.replace(window.location.hash, '');
    window.history.replaceState({}, document.title, cleanUrl);
    console.log('🔧 URL limpa:', window.location.href);
  }
} else {
  console.log('🔧 Nenhum fragment detectado na URL');
}

// 🔧 CORREÇÃO: Adicionar logs para debugar
console.log('🚀 App iniciando - URL:', window.location.href);
console.log('🚀 User Agent:', navigator.userAgent);

createRoot(document.getElementById("root")!).render(<App />);
