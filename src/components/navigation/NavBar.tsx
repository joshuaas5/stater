
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PieChart, FileText, Home, Lightbulb, Settings } from 'lucide-react';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { icon: <PieChart size={24} />, label: 'Gráficos', path: '/charts' },
    { icon: <FileText size={24} />, label: 'Contas', path: '/bills' },
    { icon: <Home size={24} />, label: 'Início', path: '/dashboard' },
    { icon: <Lightbulb size={24} />, label: 'Consultor', path: '/financial-advisor' },
    { icon: <Settings size={24} />, label: 'Configurações', path: '/preferences' },
  ];
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-galileo-card shadow-lg border-t border-galileo-border z-10">
      <div className="flex justify-around items-center py-1">
        {navItems.map((item, index) => {
          const active = isActive(item.path);
          
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center px-2 py-1 ${
                active 
                  ? 'text-galileo-accent' 
                  : 'text-galileo-secondaryText hover:text-galileo-text'
              } transition-colors`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
              {active && <div className="h-1 w-10 bg-galileo-accent rounded-full mt-1"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
