import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Brain, FileText, Lightbulb, Settings } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
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
  
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 w-full"
      style={{
        background: '#31518b',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.3), 0 -2px 16px rgba(49, 81, 139, 0.2)'
      }}
    >
      <div className="flex justify-around items-center h-16 py-2 px-2 md:px-4 max-w-screen-xl mx-auto">
        {navItems.map((item, index) => {
          const active = isActive(item.path);
          const isLogo = item.isLogo;
          
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center min-w-[60px] px-2 py-1 rounded-xl transition-all duration-300 ${
                active 
                  ? 'bg-white/20 backdrop-blur-sm' 
                  : 'hover:bg-white/10'
              }`}
              style={{
                // Aplicar cor especial para as abas "Análise IA" e "Stater IA" sempre - com cor mais escura para contraste
                ...(item.path === '/analise-financeira' || item.path === '/financial-advisor') && {
                  backgroundColor: '#1e3a5f !important', // Cor mais escura que #31518b para contraste visível
                  boxShadow: '0 2px 8px rgba(30, 58, 95, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                },
                ...(active && {
                  boxShadow: '0 4px 16px rgba(255, 255, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  // Sobrescrever para as abas IA quando ativas - sem borders que criam squares
                  ...(item.path === '/analise-financeira' || item.path === '/financial-advisor') && {
                    backgroundColor: '#1e3a5f !important', // Mantém cor mais escura
                    border: 'none', // Remove borders que criam aparência de squares
                    boxShadow: '0 4px 16px rgba(30, 58, 95, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 0 2px rgba(255, 255, 255, 0.2)' // Glow ao invés de border
                  }
                })
              }}
            >
              {isLogo ? (
                <div className="flex flex-col items-center">
                  <div className="mb-1">
                    {item.icon}
                  </div>
                  <span 
                    className="text-xs font-bold text-white"
                    style={{
                      fontFamily: '"Fredoka One", "Comic Sans MS", Poppins, sans-serif',
                      textShadow: '1px 1px 0px rgba(0, 0, 0, 0.5)',
                      letterSpacing: '0.5px'
                    }}
                  >
                    STATER
                  </span>
                </div>
              ) : (
                <>
                  <div className="mb-1">
                    <div 
                      className="text-white transition-all duration-300"
                      style={{
                        filter: active ? 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3))' : 'none'
                      }}
                    >
                      {item.icon}
                    </div>
                  </div>
                  <span 
                    className="text-xs text-white font-medium transition-all duration-300"
                    style={{
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                      opacity: active ? 1 : 0.9
                    }}
                  >
                    {item.label}
                  </span>
                </>
              )}
              
              {/* Indicador de ativo */}
              {active && !isLogo && (
                <div 
                  className="w-6 h-0.5 bg-white rounded-full mt-1"
                  style={{
                    boxShadow: '0 0 8px rgba(255, 255, 255, 0.8)'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavBar;
