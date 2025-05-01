
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, PieChart, PlusCircle, User, FileText, Lightbulb } from 'lucide-react';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    { icon: <Home size={24} />, label: 'Início', path: '/dashboard' },
    { icon: <PieChart size={24} />, label: 'Gráficos', path: '/charts' },
    { icon: <PlusCircle size={32} className="text-galileo-accent" />, label: '', path: '/add-transaction' },
    { icon: <FileText size={24} />, label: 'Contas', path: '/bills' },
    { icon: <Lightbulb size={24} />, label: 'Consultor', path: '/financial-advisor' },
  ];
  
  const handleNavigation = (path: string) => {
    if (path === '/add-transaction') {
      navigate('/dashboard'); // Navigate back to dashboard but open the add transaction dialog
    } else {
      navigate(path);
    }
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
              } transition-colors ${index === 2 ? '-mt-4' : ''}`}
            >
              {item.icon}
              <span className={`text-xs mt-1 ${index === 2 ? 'hidden' : ''}`}>{item.label}</span>
              {active && <div className="h-1 w-10 bg-galileo-accent rounded-full mt-1"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
