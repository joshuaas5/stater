import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, FileText, Lightbulb, Settings } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { useRoutePreloading } from '@/hooks/useRoutePreloading';
import './navbar-optimized.css'; // Importando CSS pré-compilado

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { preloadOnHover } = useRoutePreloading();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
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
  
  return createPortal(
    <nav className="navbar-optimized">
      <div className="navbar-content">
        {navItems.map((item, index) => {
          const active = isActive(item.path);
          const isLogo = item.isLogo;
          
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              {...preloadOnHover(item.path)} // Preload route on hover/focus
              className={`navbar-button ${active ? 'navbar-button-active' : ''}`}
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
                    <div className={`navbar-icon ${active ? 'navbar-icon-active' : ''}`}>
                      {item.icon}
                    </div>
                  </div>
                  <span className={`navbar-label ${active ? 'navbar-label-active' : ''}`}>
                    {item.label}
                  </span>
                </>
              )}
              
              {/* Indicador de ativo */}
              {active && !isLogo && (
                <div className="navbar-indicator" />
              )}
            </button>
          );
        })}
      </div>
    </nav>,
    document.body
  );
};

export default NavBar;
