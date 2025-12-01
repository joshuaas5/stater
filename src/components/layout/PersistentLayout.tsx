import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '@/components/navigation/NavBar';
import DesktopSidebar from '@/components/navigation/DesktopSidebar';
import DesktopHeader from '@/components/navigation/DesktopHeader';

const PersistentLayout: React.FC = () => {
  const location = useLocation();
  const noNavBarRoutes = ['/financial-advisor'];
  
  // Estado para modo simples (menos funcionalidades visíveis)
  const [isSimpleMode, setIsSimpleMode] = useState(() => {
    const saved = localStorage.getItem('stater-simple-mode');
    return saved === 'true';
  });

  // Estado para saber se a sidebar está colapsada
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  // Detectar mudanças no localStorage para sincronizar estado
  useEffect(() => {
    const handleStorageChange = () => {
      const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      setIsSidebarCollapsed(collapsed);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Também verificar periodicamente (para mudanças na mesma tab)
    const interval = setInterval(() => {
      const collapsed = localStorage.getItem('sidebar-collapsed') === 'true';
      if (collapsed !== isSidebarCollapsed) {
        setIsSidebarCollapsed(collapsed);
      }
    }, 100);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [isSidebarCollapsed]);

  const toggleSimpleMode = () => {
    const newValue = !isSimpleMode;
    setIsSimpleMode(newValue);
    localStorage.setItem('stater-simple-mode', String(newValue));
  };

  // Largura da sidebar baseada no estado
  const sidebarWidth = isSidebarCollapsed ? 80 : 240;

  return (
    <div className="min-h-screen bg-[#31518b]">
      {/* Desktop: Sidebar + Header */}
      <DesktopSidebar 
        onToggleSimpleMode={toggleSimpleMode}
        isSimpleMode={isSimpleMode}
      />
      <DesktopHeader sidebarWidth={sidebarWidth} />
      
      {/* Main Content Area */}
      <main 
        className="transition-all duration-300"
        style={{
          // No desktop: offset da sidebar e header
          // No mobile: sem offset
          marginLeft: 'var(--sidebar-width, 0px)',
          paddingTop: 'var(--header-height, 0px)',
          minHeight: '100vh'
        }}
      >
        {/* CSS Variables para responsividade */}
        <style>{`
          @media (min-width: 1024px) {
            main {
              --sidebar-width: ${sidebarWidth}px;
              --header-height: 64px;
            }
          }
          @media (max-width: 1023px) {
            main {
              --sidebar-width: 0px;
              --header-height: 0px;
            }
          }
        `}</style>
        
        <Outlet context={{ isSimpleMode, toggleSimpleMode }} />
      </main>
      
      {/* Mobile: NavBar no rodapé */}
      {!noNavBarRoutes.includes(location.pathname) && <NavBar />}
    </div>
  );
};

export default PersistentLayout;
