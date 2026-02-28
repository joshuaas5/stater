import { useEffect } from 'react';

/**
 * Hook de segurança REFORÇADO que previne scroll travado
 * 
 * PROBLEMA 1: Modais aplicam overflow: hidden no body.
 * PROBLEMA 2: react-remove-scroll adiciona event listeners que bloqueiam wheel/touchmove
 * PROBLEMA 3: data-scroll-locked atributo também pode travar o scroll
 * 
 * SOLUÇÃO: Verifica e corrige TODOS os mecanismos de scroll lock.
 */
export const useScrollGuard = () => {
  useEffect(() => {
    const unlockScroll = () => {
      // 1. Remove overflow: hidden do body/html
      if (document.body.style.overflow === 'hidden') {
        document.body.style.overflow = '';
      }
      if (document.documentElement.style.overflow === 'hidden') {
        document.documentElement.style.overflow = '';
      }
      
      // 2. Remove data-scroll-locked (usado pelo react-remove-scroll)
      if (document.body.hasAttribute('data-scroll-locked')) {
        document.body.removeAttribute('data-scroll-locked');
        document.body.style.paddingRight = '';
        document.body.style.marginRight = '';
      }
      
      // 3. Remove position: fixed que às vezes é aplicado
      if (document.body.style.position === 'fixed') {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
      }
      
      // 4. Remove estilos inline do html também
      if (document.documentElement.hasAttribute('data-scroll-locked')) {
        document.documentElement.removeAttribute('data-scroll-locked');
      }
    };

    const checkScrollLock = () => {
      // Verifica se há algum modal/overlay REALMENTE visível
      const hasVisibleModal = document.querySelector(
        '[role="dialog"]:not([hidden]), ' +
        '[data-state="open"], ' +
        '.modal:not([hidden]), ' +
        '[data-modal="true"]:not([hidden])'
      );
      
      // Se NÃO há modal visível, garantir scroll liberado
      if (!hasVisibleModal) {
        unlockScroll();
      }
    };
    
    // Verifica a cada 500ms (mais frequente para resposta rápida)
    const interval = setInterval(checkScrollLock, 500);
    
    // Verifica imediatamente
    checkScrollLock();
    
    // Também verifica quando URL muda (navegação)
    const handlePopState = () => {
      setTimeout(checkScrollLock, 100);
    };
    window.addEventListener('popstate', handlePopState);
    
    // Verifica quando clica fora de modais
    const handleClick = (e: MouseEvent) => {
      // Se clicou em algo que não é dentro de um modal, verifica scroll lock
      const target = e.target as Element;
      if (!target.closest('[role="dialog"], [data-state="open"]')) {
        setTimeout(checkScrollLock, 100);
      }
    };
    document.addEventListener('click', handleClick, { passive: true });
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleClick);
    };
  }, []);
};
