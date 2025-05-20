import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PieChart, FileText, Home, Lightbulb, Settings } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  // Reorganizando para que o Home fique no meio
  const navItems = [
    { icon: <PieChart size={24} />, label: t('charts'), path: '/charts' },
    { icon: <FileText size={24} />, label: t('bills'), path: '/bills' },
    { icon: <Home size={28} />, label: t('home'), path: '/dashboard' }, // Tamanho maior para destacar
    { icon: <Lightbulb size={24} />, label: t('advisor'), path: '/financial-advisor' },
    { icon: <Settings size={24} />, label: t('settings'), path: '/preferences' },
  ];
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-galileo-card shadow-lg border-t border-galileo-border z-50 w-full">
      <div className="flex justify-center items-center py-2 px-1 md:px-4 max-w-screen-xl mx-auto">
        {navItems.map((item, index) => {
          const active = isActive(item.path);
          const isHome = item.path === '/dashboard';
          
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center min-w-[60px] px-2 md:px-4 ${
                active 
                  ? 'text-galileo-accent' 
                  : 'text-galileo-secondaryText hover:text-galileo-text'
              } transition-colors`}
            >
              <div className="flex justify-center">
                {item.icon}
              </div>
              <span className={`text-xs mt-1 text-center whitespace-nowrap ${isHome ? 'font-medium' : ''}`}>{item.label}</span>
              {active && <div className="h-1 w-8 md:w-10 bg-galileo-accent rounded-full mt-1"></div>}
            </button>
          );
        })}
      </div>
      {/* Espaço adicional para evitar que o conteúdo fique escondido atrás da navbar */}
      <div className="h-2"></div>
    </div>
  );
};

export default NavBar;
