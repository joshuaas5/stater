import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '@/components/navigation/NavBar';
import DesktopSidebar from '@/components/navigation/DesktopSidebar';
import DesktopHeader from '@/components/navigation/DesktopHeader';
import GlobalImportModal from '@/components/import/GlobalImportModal';
import CommandPalette from '@/components/search/CommandPalette';

const PersistentLayout: React.FC = () => {
  const location = useLocation();
  const noNavBarRoutes = ['/financial-advisor'];
  
  // Estado para modo simples (menos funcionalidades visíveis)
  const [isSimpleMode, setIsSimpleMode] = useState(() => {
    const saved = localStorage.getItem('stater-simple-mode');
    return saved === 'true';
  });
  
  // Estado para o modal de importação global
  const [showImportModal, setShowImportModal] = useState(false);
  
  // Estado para o Command Palette (busca global)
  const [showCommandPalette, setShowCommandPalette] = useState(false);

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

  // Listener para abrir Command Palette via evento global ou Ctrl+K
  useEffect(() => {
    const handleOpenCommandPalette = () => setShowCommandPalette(true);
    const handleOpenImportModal = () => setShowImportModal(true);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };

    window.addEventListener('open-command-palette', handleOpenCommandPalette);
    window.addEventListener('open-import-modal', handleOpenImportModal);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('open-command-palette', handleOpenCommandPalette);
      window.removeEventListener('open-import-modal', handleOpenImportModal);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleSimpleMode = () => {
    const newValue = !isSimpleMode;
    setIsSimpleMode(newValue);
    localStorage.setItem('stater-simple-mode', String(newValue));
  };

  // Largura da sidebar baseada no estado
  const sidebarWidth = isSidebarCollapsed ? 80 : 240;

  return (
    <div 
      className="min-h-screen"
      style={{
        // Mobile: azul padrão | Desktop: gradiente escuro igual sidebar
        background: '#31518b'
      }}
    >
      {/* Desktop Background Override - aplica gradiente escuro */}
      <style>{`
        @media (min-width: 1024px) {
          .desktop-dark-bg {
            background: linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%) !important;
          }
        }
      `}</style>
      
      {/* Overlay para desktop com gradiente */}
      <div className="hidden lg:block fixed inset-0 -z-10" style={{
        background: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)'
      }} />
      {/* Desktop: Sidebar + Header */}
      <DesktopSidebar 
        onToggleSimpleMode={toggleSimpleMode}
        isSimpleMode={isSimpleMode}
        onOpenImportModal={() => setShowImportModal(true)}
      />
      <DesktopHeader 
        sidebarWidth={sidebarWidth}
        onOpenSearch={() => setShowCommandPalette(true)}
      />
      
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
      
      {/* Modal de Importação Global */}
      <GlobalImportModal 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
      
      {/* Command Palette (Busca Global - Ctrl+K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onOpenImport={() => {
          setShowCommandPalette(false);
          setShowImportModal(true);
        }}
      />
    </div>
  );
};

export default PersistentLayout;
