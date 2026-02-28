/**
 *  SCRIPT DE DESBLOQUEIO E OTIMIZAÇÃO DE SCROLL
 * 
 * Otimizado para Mobile Web e Capacitor APK
 */

// Detecta se está rodando no Capacitor
const isCapacitor = (): boolean => {
  return !!(
    (window as any).Capacitor ||
    (window as any).capacitor ||
    navigator.userAgent.includes('Capacitor') ||
    document.URL.startsWith('capacitor://') ||
    document.URL.startsWith('https://localhost')
  );
};

// Detecta se é mobile
const isMobile = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

// 1. Adiciona classes de ambiente
const setupEnvironmentClasses = () => {
  if (isCapacitor()) {
    document.documentElement.classList.add('capacitor');
    document.body.classList.add('capacitor');
    console.log('Capacitor environment detected');
  }
  
  if (isMobile()) {
    document.documentElement.classList.add('mobile');
    document.body.classList.add('mobile');
  }
};

// 2. Remove estilos de scroll lock
const unlockScrollStyles = () => {
  // Remove data-scroll-locked
  document.body.removeAttribute('data-scroll-locked');
  document.documentElement.removeAttribute('data-scroll-locked');
  
  // Remove estilos inline problemáticos
  const problematicStyles = ['overflow', 'position', 'top', 'left', 'right', 'bottom'];
  problematicStyles.forEach(prop => {
    document.body.style.removeProperty(prop);
  });
  
  // Força scroll ativo
  document.body.style.overflowY = 'auto';
  document.documentElement.style.overflowY = 'auto';
};

// 3. Otimiza performance durante scroll
const optimizeScrollPerformance = () => {
  let scrollTimeout: number | null = null;
  let isScrolling = false;
  
  const handleScrollStart = () => {
    if (!isScrolling) {
      isScrolling = true;
      document.body.classList.add('scrolling');
    }
    
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    scrollTimeout = window.setTimeout(() => {
      isScrolling = false;
      document.body.classList.remove('scrolling');
    }, 150);
  };
  
  // Usa passive: true para melhor performance
  window.addEventListener('scroll', handleScrollStart, { passive: true });
  window.addEventListener('touchmove', handleScrollStart, { passive: true });
};

// 4. Intercepta tentativas de bloquear scroll (apenas para libraries problemáticas)
const preventScrollBlocking = () => {
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  
  EventTarget.prototype.addEventListener = function(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    // Intercepta apenas eventos que podem bloquear scroll com passive:false
    if ((type === 'wheel' || type === 'touchmove' || type === 'touchstart')) {
      const opts = options as AddEventListenerOptions;
      if (opts && opts.passive === false) {
        // Força passive: true
        return originalAddEventListener.call(this, type, listener, { ...opts, passive: true });
      }
    }
    return originalAddEventListener.call(this, type, listener, options);
  };
};

// 5. Fix específico para Capacitor WebView
const fixCapacitorScroll = () => {
  if (!isCapacitor()) return;
  
  // Garante que o viewport está correto
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }
  
  // Força scroll no container principal
  const root = document.getElementById('root');
  if (root) {
    root.style.overflowY = 'auto';
    root.style.height = 'auto';
    root.style.minHeight = '100vh';
    root.style.touchAction = 'pan-x pan-y';
  }
  
  // Remove qualquer listener que bloqueie scroll no document
  document.addEventListener('touchmove', () => {}, { passive: true });
  
  console.log('Capacitor scroll fixes applied');
};

// 6. Executa todas as correções
const initScrollFixes = () => {
  setupEnvironmentClasses();
  unlockScrollStyles();
  preventScrollBlocking();
  optimizeScrollPerformance();
  fixCapacitorScroll();
  
  console.log('Scroll optimizations initialized');
};

// Executa imediatamente
initScrollFixes();

// Também executa quando DOM estiver pronto (para garantir)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initScrollFixes);
} else {
  // DOM já carregou
  setTimeout(initScrollFixes, 0);
}

// Monitor contínuo para corrigir bloqueios dinâmicos
setInterval(() => {
  // Verifica se scroll foi bloqueado dinamicamente
  const bodyStyle = window.getComputedStyle(document.body);
  if (bodyStyle.overflow === 'hidden' && !document.querySelector('[data-state="open"]')) {
    unlockScrollStyles();
  }
}, 2000);

export { isCapacitor, isMobile };
