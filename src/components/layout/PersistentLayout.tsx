import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import NavBar from '@/components/navigation/NavBar';
import DesktopSidebar from '@/components/navigation/DesktopSidebar';
import DesktopHeader from '@/components/navigation/DesktopHeader';
import GlobalImportModal from '@/components/import/GlobalImportModal';
import CommandPalette from '@/components/search/CommandPalette';
import { Monitor } from 'lucide-react';

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

  // No modo simples, comporta-se como mobile mesmo no desktop
  const showDesktopUI = !isSimpleMode;

  return (
    <div 
      className="min-h-screen"
      style={{
        // Mobile/Modo Simples: azul padrão | Desktop Avançado: gradiente escuro
        background: '#31518b'
      }}
    >
      {/* Desktop Background Override - aplica gradiente escuro (apenas modo avançado) */}
      {showDesktopUI && (
        <>
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
        </>
      )}
      
      {/* Desktop: Sidebar + Header (apenas modo avançado) */}
      {showDesktopUI && (
        <>
          <DesktopSidebar 
            onToggleSimpleMode={toggleSimpleMode}
            isSimpleMode={isSimpleMode}
            onOpenImportModal={() => setShowImportModal(true)}
          />
          <DesktopHeader 
            sidebarWidth={sidebarWidth}
            onOpenSearch={() => setShowCommandPalette(true)}
          />
        </>
      )}
      
      {/* Main Content Area */}
      <main 
        className="transition-all duration-300"
        style={{
          // No desktop avançado: offset da sidebar e header
          // No mobile ou modo simples: sem offset
          marginLeft: showDesktopUI ? 'var(--sidebar-width, 0px)' : '0px',
          paddingTop: showDesktopUI ? 'var(--header-height, 0px)' : '0px',
          minHeight: '100vh'
        }}
      >
        {/* CSS Variables para responsividade (apenas modo avançado) */}
        {showDesktopUI && (
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
        )}
        
        <Outlet context={{ isSimpleMode, toggleSimpleMode }} />
      </main>
      
      {/* NavBar: Mobile sempre | Desktop apenas no modo simples */}
      {!noNavBarRoutes.includes(location.pathname) && (
        <div className={showDesktopUI ? 'lg:hidden' : ''}>
          <NavBar />
        </div>
      )}
      
      {/* Botão flutuante para ativar modo avançado (apenas desktop no modo simples) */}
      {isSimpleMode && (
        <button
          onClick={toggleSimpleMode}
          className="hidden lg:flex fixed bottom-6 right-6 z-50 items-center gap-2 px-4 py-3 rounded-xl transition-all hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
          title="Ativar modo avançado"
        >
          <Monitor size={18} className="text-white" />
          <span className="text-sm font-medium text-white">Modo Avançado</span>
        </button>
      )}
      
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
