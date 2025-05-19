import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PieChart, FileText, Home, Lightbulb, Star } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { icon: <PieChart size={24} />, label: t('charts'), path: '/charts' },
    { icon: <FileText size={24} />, label: t('bills'), path: '/bills' },
    { icon: <Home size={24} />, label: t('home'), path: '/dashboard' },
    { icon: <Lightbulb size={24} />, label: t('advisor'), path: '/financial-advisor' },
    { icon: <Star size={24} />, label: t('recomendacoes'), path: '/recomendacoes' },
  ];
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-galileo-card shadow-lg border-t border-galileo-border z-10">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item, index) => {
          const active = isActive(item.path);
          
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center w-1/5 ${
                active 
                  ? 'text-galileo-accent' 
                  : 'text-galileo-secondaryText hover:text-galileo-text'
              } transition-colors`}
            >
              <div className="flex justify-center">
                {item.icon}
              </div>
              <span className="text-xs mt-1 text-center">{item.label}</span>
              {active && <div className="h-1 w-10 bg-galileo-accent rounded-full mt-1"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
