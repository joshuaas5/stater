
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart, CreditCard, Home, User } from 'lucide-react';

const NavBar: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="flex gap-2 border-t border-galileo-border bg-galileo-card px-4 pb-3 pt-2 fixed bottom-0 left-0 right-0 z-10">
      <Link 
        to="/dashboard" 
        className={`nav-item ${isActive('/dashboard') ? 'nav-item-active' : 'nav-item-inactive'}`}
      >
        <div className="flex h-8 items-center justify-center">
          <BarChart size={24} />
        </div>
        <span className="text-xs">Gráficos</span>
      </Link>
      
      <Link 
        to="/transactions" 
        className={`nav-item ${isActive('/transactions') ? 'nav-item-active' : 'nav-item-inactive'}`}
      >
        <div className="flex h-8 items-center justify-center">
          <CreditCard size={24} />
        </div>
        <span className="text-xs">Transações</span>
      </Link>
      
      <Link 
        to="/" 
        className={`nav-item ${isActive('/') ? 'nav-item-active' : 'nav-item-inactive'}`}
      >
        <div className="flex h-8 items-center justify-center">
          <Home size={24} />
        </div>
        <span className="text-xs">Início</span>
      </Link>
      
      <Link 
        to="/profile" 
        className={`nav-item ${isActive('/profile') ? 'nav-item-active' : 'nav-item-inactive'}`}
      >
        <div className="flex h-8 items-center justify-center">
          <User size={24} />
        </div>
        <span className="text-xs">Perfil</span>
      </Link>
    </div>
  );
};

export default NavBar;
