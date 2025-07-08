import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/mobile-first.css'

// 🔧 CORREÇÃO: Limpar fragments da URL que causam loop
if (window.location.hash) {
  console.log('🔧 Limpando fragment da URL:', window.location.hash);
  const cleanUrl = window.location.href.replace(window.location.hash, '');
  window.history.replaceState({}, document.title, cleanUrl);
  console.log('🔧 URL limpa:', window.location.href);
}

// 🔧 CORREÇÃO: Adicionar logs para debugar loop
console.log('🚀 App iniciando - URL:', window.location.href);
console.log('🚀 User Agent:', navigator.userAgent);

createRoot(document.getElementById("root")!).render(<App />);
