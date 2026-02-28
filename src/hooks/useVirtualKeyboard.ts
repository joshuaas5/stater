import { useState, useEffect } from 'react';

interface VirtualKeyboardState {
  isVisible: boolean;
  height: number;
  availableHeight: number;
}

export const useVirtualKeyboard = (): VirtualKeyboardState => {
  const [keyboardState, setKeyboardState] = useState<VirtualKeyboardState>({
    isVisible: false,
    height: 0,
    availableHeight: window.innerHeight
  });

  useEffect(() => {
    const initialHeight = window.innerHeight;
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        const currentHeight = window.innerHeight;
        const heightDiff = initialHeight - currentHeight;
        
        // Considera que o teclado está visível se a altura diminuiu mais que 150px
        const isKeyboardVisible = heightDiff > 150;
        
        setKeyboardState({
          isVisible: isKeyboardVisible,
          height: isKeyboardVisible ? heightDiff : 0,
          availableHeight: currentHeight
        });
      }, 100);
    };

    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const keyboardHeight = window.innerHeight - window.visualViewport.height;
        const isVisible = keyboardHeight > 150;
        
        setKeyboardState({
          isVisible,
          height: isVisible ? keyboardHeight : 0,
          availableHeight: window.visualViewport.height
        });
      }
    };

    // Escutar mudanças no viewport visual (melhor para detectar teclado)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    }

    // Fallback para dispositivos que não suportam visualViewport
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return keyboardState;
};
