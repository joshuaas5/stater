import React, { useEffect, useMemo, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, FileText, Lightbulb, Settings } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useRoutePreloading } from '@/hooks/useRoutePreloading';
import './navbar-optimized.css'; // Importando CSS pré-compilado

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
  
  const isActive = useCallback((path: string) => {
    return location.pathname === path;
  }, [location.pathname]);
  
  // Ordem: Contas → Análise IA → Logo Stater → Stater IA → Ajustes
  const navItems = [
    { icon: <FileText size={20} />, label: t('bills'), path: '/bills' },
    { icon: <Brain size={20} />, label: 'Análise IA', path: '/analise-financeira' },
    { 
      icon: <img src="/stater-logo-192.png" alt="Stater" className="h-8 w-8 object-contain drop-shadow-lg" />, 
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
    // Adicionamos overscroll-behavior para prevenir bounce/rubber-banding
    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    
    if (html) {
      html.style.transform = 'none';
      html.style.overscrollBehavior = 'none';
    }
    if (body) {
      body.style.transform = 'none';
      body.style.overscrollBehavior = 'none';
      body.style.overflowX = 'hidden'; // Previne scroll horizontal
    }
    if (root) {
      root.style.transform = 'none';
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
  }, [navItems, location.pathname, handleNavigation, preloadOnHover]);

  return createPortal(
    <nav className="navbar-optimized">
      <div className="navbar-content">
        {memoizedNavItems}
      </div>
    </nav>,
    document.body
  );
};

// Memoize o componente NavBar completo para evitar renderizações desnecessárias
const MemoizedNavBar = memo(NavBar);
MemoizedNavBar.displayName = 'MemoizedNavBar';

export default MemoizedNavBar;
