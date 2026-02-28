import { useEffect } from 'react';

/**
 * Hook para corrigir problemas de altura em dispositivos móveis
 * Soluciona o problema do 100vh quando a barra de endereço aparece/desaparece
 */
export const useStableHeight = () => {
  useEffect(() => {
    const setViewportHeight = () => {
      // Calcula a altura real do viewport
      const vh = window.innerHeight * 0.01;
      // Define a variável CSS customizada
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Define a altura inicial
    setViewportHeight();

    // Atualiza a altura quando a janela é redimensionada
    // Throttle para melhorar performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(setViewportHeight, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', setViewportHeight);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', setViewportHeight);
      clearTimeout(timeoutId);
    };
  }, []);
};
