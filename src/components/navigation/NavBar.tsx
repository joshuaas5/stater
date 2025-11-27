import React, { useEffect, useMemo, memo, useCallback, useState } from 'react';
// Removido createPortal - causa muitos recálculos de layout
// import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, FileText, Lightbulb, Settings } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useRoutePreloading } from '@/hooks/useRoutePreloading';
import './navbar-optimized.css'; // Importando CSS pré-compilado

// ADICIONADO: Throttle para melhorar performance de eventos
const useThrottledValue = (value: any, delay = 300) => {
  const [throttledValue, setThrottledValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setThrottledValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return throttledValue;
};

// Usar NavItem como componente memoizado para evitar re-renderizações desnecessárias
const NavItem = memo(({ item, isActive, onClick, preloadProps }: {
  item: any;
  isActive: boolean;
  onClick: () => void;
  preloadProps: any;
}) => {
  const isLogo = item.isLogo;
  
  return (
    <button
      onClick={onClick}
      {...preloadProps}
      className={`navbar-button ${isActive ? 'navbar-button-active' : ''}`}
    >
      {isLogo ? (
        <div className="flex flex-col items-center">
          <div className="navbar-icon-container">
            {item.icon}
          </div>
          <span className="navbar-logo-text">
            STATER
          </span>
        </div>
      ) : (
        <>
          <div className="navbar-icon-container">
            <div className={`navbar-icon ${isActive ? 'navbar-icon-active' : ''}`}>
              {item.icon}
            </div>
          </div>
          <span className={`navbar-label ${isActive ? 'navbar-label-active' : ''}`}>
            {item.label}
          </span>
        </>
      )}
      
      {isActive && !isLogo && (
        <div className="navbar-indicator" />
      )}
    </button>
  );
});

NavItem.displayName = 'NavItem';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { preloadOnHover } = useRoutePreloading();
  const [isScrolling, setIsScrolling] = useState(false);
  
  // ADICIONADO: Throttle de scroll para reduzir operações durante rolagem
  const throttledPathname = useThrottledValue(location.pathname);
  
  const isActive = useCallback((path: string) => {
    return throttledPathname === path;
  }, [throttledPathname]);
  
  // ADICIONADO: Verificar se deve esconder navbar na página Stater IA
  const shouldHideNavbar = useMemo(() => {
    return throttledPathname === '/financial-advisor';
  }, [throttledPathname]);
  
  // Se deve esconder navbar, não renderizar
  if (shouldHideNavbar) {
    return null;
  }
  
  // Ordem: Contas → Análise IA → Logo Stater → Stater IA → Ajustes
  const navItems = [
    { icon: <FileText size={20} />, label: t('bills'), path: '/bills' },
    { icon: <Brain size={20} />, label: 'Análise IA', path: '/analise-financeira' },
    { 
      icon: <img src="/stater-logo-192.png" alt="Stater" className="h-7 w-7 object-contain drop-shadow-lg" />, 
      label: '', 
      path: '/dashboard',
      isLogo: true
    },
    { icon: <Lightbulb size={20} />, label: t('advisor'), path: '/financial-advisor' },
    { icon: <Settings size={20} />, label: t('settings'), path: '/preferences' },
  ];
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  // Remove transform from html/body/root to garantir que o fixed seja relativo ao viewport
  useEffect(() => {
    // CRÍTICO: Garantir que nada interfira com a posição fixa da navbar
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    
    // Garantir que a navbar sempre seja fixa
    if (html) {
      html.style.transform = 'none';
      html.style.overscrollBehavior = 'none';
    }
    if (body) {
      body.style.transform = 'none';
      body.style.overscrollBehavior = 'none';
      body.style.overflowX = 'hidden';
      // ADICIONADO: Padding bottom para compensar navbar fixa (64px)
      body.style.paddingBottom = '70px';
    }
    if (root) {
      root.style.transform = 'none';
    }
    
    // Cleanup ao desmontar
    return () => {
      if (body) {
        body.style.paddingBottom = '';
      }
    };
  }, []);
  
  // ADICIONADO: Detector de scroll para otimizar renderização durante rolagem
  useEffect(() => {
    const handleScroll = () => {
      if (!isScrolling) {
        setIsScrolling(true);
        document.body.classList.add('is-scrolling');
      }
      
      // Cleanup scroll state após 100ms de inatividade
      clearTimeout((window as any)._scrollTimer);
      (window as any)._scrollTimer = setTimeout(() => {
        setIsScrolling(false);
        document.body.classList.remove('is-scrolling');
      }, 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolling]);
  
  // ADICIONADO: Carregamento priorizado com IntersectionObserver
  useEffect(() => {
    if ('IntersectionObserver' in window) {
      const navbarEl = document.querySelector('.navbar-optimized');
      if (navbarEl) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              // Aplicar classe de otimização quando visível
              if (entry.isIntersecting) {
                entry.target.classList.add('navbar-optimized-visible');
              } else {
                entry.target.classList.remove('navbar-optimized-visible');
              }
            });
          },
          { threshold: 0.1 }
        );
        
        observer.observe(navbarEl);
        return () => observer.disconnect();
      }
    }
  }, []);
  
  // Memoize os itens da NavBar para evitar recálculos desnecessários
  const memoizedNavItems = useMemo(() => {
    return navItems.map((item, index) => {
      const active = isActive(item.path);
      return (
        <NavItem 
          key={index} 
          item={item} 
          isActive={active}
          onClick={() => handleNavigation(item.path)}
          preloadProps={preloadOnHover(item.path)}
        />
      );
    });
  }, [navItems, throttledPathname, handleNavigation, preloadOnHover]);

  // ALTERADO: Remover portal e renderizar diretamente com classe fixa garantida
  return (
    <nav className={`navbar-optimized navbar-fixed-bottom ${isScrolling ? 'navbar-scrolling' : ''}`}>
      <div className="navbar-content">
        {memoizedNavItems}
      </div>
    </nav>
  );
};

// Memoize o componente NavBar completo para evitar renderizações desnecessárias
const MemoizedNavBar = memo(NavBar);
MemoizedNavBar.displayName = 'MemoizedNavBar';

export default MemoizedNavBar;
