/**
 * scroll-performance.js - Otimizações críticas para performance de scroll
 * Este script detecta scroll e desativa animações/efeitos durante rolagem
 */

(function() {
  // Não execute em browsers antigos ou sem suporte
  if (!window || !document || !document.body) return;
  
  // Variáveis de estado
  let isScrolling = false;
  let scrollTimeout = null;
  let lastScrollTime = Date.now();
  let scrollThreshold = 100; // ms
  let body = document.body;
  
  // Função para adicionar classe durante scroll
  function onScrollStart() {
    if (!isScrolling) {
      isScrolling = true;
      body.classList.add('scrolling');
      
      // Notificar o performance worker sobre início do scroll
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SCROLL_START',
          timestamp: Date.now()
        });
      }
    }
    
    lastScrollTime = Date.now();
    
    // Limpar o timeout existente
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    // Configurar novo timeout
    scrollTimeout = setTimeout(onScrollEnd, scrollThreshold);
  }
  
  // Função para remover classe após scroll
  function onScrollEnd() {
    if (Date.now() - lastScrollTime >= scrollThreshold) {
      isScrolling = false;
      body.classList.remove('scrolling');
      
      // Notificar o performance worker sobre fim do scroll
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SCROLL_END',
          timestamp: Date.now()
        });
      }
    }
  }
  
  // Otimizador de event listeners - throttle para evitar callbacks excessivos
  function throttle(fn, delay) {
    let last = 0;
    return function() {
      const now = Date.now();
      if (now - last >= delay) {
        last = now;
        return fn.apply(this, arguments);
      }
    };
  }
  
  // Detectar dispositivo móvel para otimizações específicas
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobile) {
    // Em mobile usamos um throttle mais agressivo
    window.addEventListener('scroll', throttle(onScrollStart, 16), { passive: true });
    
    // Detectar scroll com touch events
    window.addEventListener('touchmove', throttle(onScrollStart, 16), { passive: true });
    window.addEventListener('touchend', function() {
      // Pequeno timeout para não terminar o estado de scroll prematuramente
      setTimeout(onScrollEnd, scrollThreshold);
    }, { passive: true });
    
    // Adicionar classe mobile ao body para CSS específico
    body.classList.add('mobile-device');
  } else {
    // Em desktop podemos ser menos agressivos
    window.addEventListener('scroll', throttle(onScrollStart, 32), { passive: true });
  }
  
  // Broadcast channel para comunicação
  if (window.BroadcastChannel) {
    const scrollChannel = new BroadcastChannel('scroll-performance');
    
    // Escutar mensagens de outras partes do app
    scrollChannel.onmessage = function(event) {
      if (event.data && event.data.type === 'OPTIMIZE_RENDERING') {
        // Forçar otimização temporária
        body.classList.add('optimize-rendering');
        setTimeout(() => {
          body.classList.remove('optimize-rendering');
        }, 1000);
      }
    };
  }
  
  // Notificar que script foi carregado
  console.log('🚀 Otimizações de scroll ativadas');
})();
