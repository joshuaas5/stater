/**
 * mobile-optimizations.js - Detecção e otimizações específicas para mobile
 */

(function() {
  // Detectar dispositivo móvel
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
  
  // Função para aplicar classe de otimização mobile
  function applyMobileOptimizations() {
    const body = document.body;
    
    if (isMobile) {
      body.classList.add('mobile-device', 'performance-mode');
      
      // Desativar efeitos custosos em mobile
      const style = document.createElement('style');
      style.textContent = `
        .mobile-device * {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
        }
        
        .mobile-device .dashboard-card,
        .mobile-device .chart-container {
          box-shadow: none !important;
          filter: none !important;
          transform: none !important;
        }
        
        .mobile-device .navbar-optimized {
          backdrop-filter: none !important;
          box-shadow: 0 -1px 3px rgba(0,0,0,0.1) !important;
        }
      `;
      document.head.appendChild(style);
    }
    
    if (isTablet) {
      body.classList.add('tablet-device');
    }
  }
  
  // Função para otimizar durante scroll
  function optimizeScrollPerformance() {
    let isScrolling = false;
    let scrollTimeout;
    
    const throttledScrollHandler = () => {
      if (!isScrolling) {
        isScrolling = true;
        document.body.classList.add('is-scrolling');
        
        // Notificar componentes React sobre início do scroll
        if (window.ReactScrollOptimizer) {
          window.ReactScrollOptimizer.onScrollStart();
        }
      }
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        document.body.classList.remove('is-scrolling');
        
        // Notificar componentes React sobre fim do scroll
        if (window.ReactScrollOptimizer) {
          window.ReactScrollOptimizer.onScrollEnd();
        }
      }, 150);
    };
    
    // Event listeners otimizados
    window.addEventListener('scroll', throttledScrollHandler, { passive: true });
    
    if (isMobile) {
      window.addEventListener('touchmove', throttledScrollHandler, { passive: true });
    }
  }
  
  // Função para lazy loading de recursos não críticos
  function setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      const lazyImages = document.querySelectorAll('img[data-src]');
      const lazyComponents = document.querySelectorAll('.lazy-component');
      
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => imageObserver.observe(img));
      
      // Observer para componentes lazy
      const componentObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lazy-loaded');
            componentObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '100px' });
      
      lazyComponents.forEach(component => componentObserver.observe(component));
    }
  }
  
  // Função para monitorar performance
  function setupPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      // Monitorar layout shifts
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          
          // Se CLS for alto, aplicar medidas corretivas
          if (entry.value > 0.1) {
            console.warn('🐌 Layout shift detectado:', entry.value);
            // Aplicar classe de estabilização
            document.body.classList.add('layout-stabilize');
            setTimeout(() => {
              document.body.classList.remove('layout-stabilize');
            }, 1000);
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }
  
  // Aplicar otimizações baseadas em network
  function applyNetworkOptimizations() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        document.body.classList.add('slow-network');
        // Desativar animações e efeitos em conexões lentas
        const style = document.createElement('style');
        style.textContent = `
          .slow-network * {
            animation: none !important;
            transition: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }
  
  // Inicialização
  function init() {
    applyMobileOptimizations();
    optimizeScrollPerformance();
    setupLazyLoading();
    setupPerformanceMonitoring();
    applyNetworkOptimizations();
    
    console.log('📱 Otimizações mobile ativadas:', {
      isMobile,
      isTablet,
      effectiveType: navigator.connection?.effectiveType || 'unknown'
    });
  }
  
  // Executar quando DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expor interface para React
  window.MobileOptimizer = {
    isMobile,
    isTablet,
    applyMobileOptimizations,
    setupLazyLoading
  };
})();
