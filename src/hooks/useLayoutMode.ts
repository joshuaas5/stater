import { useOutletContext } from 'react-router-dom';

interface LayoutContext {
  isSimpleMode: boolean;
  toggleSimpleMode: () => void;
}

/**
 * Hook para acessar o contexto do layout (modo simples/avançado)
 * Usar nas páginas que precisam reagir ao toggle de modo
 */
export function useLayoutMode(): LayoutContext {
  try {
    const context = useOutletContext<LayoutContext>();
    return context || { isSimpleMode: false, toggleSimpleMode: () => {} };
  } catch {
    // Fallback se não estiver dentro de um Outlet
    return { isSimpleMode: false, toggleSimpleMode: () => {} };
  }
}

export default useLayoutMode;
