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
  
  // Detectar se é desktop (≥1024px)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return false;
  });

  // Modo simples forçado pelo usuário (apenas funciona no desktop)
  const [forceSimpleMode, setForceSimpleMode] = useState(() => {
    const saved = localStorage.getItem('stater-force-simple-mode');
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

  // Detectar redimensionamento da janela
  useEffect(() => {
    const handleResize = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Checar no mount
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const newValue = !forceSimpleMode;
    setForceSimpleMode(newValue);
    localStorage.setItem('stater-force-simple-mode', String(newValue));
  };

  // Largura da sidebar baseada no estado
  const sidebarWidth = isSidebarCollapsed ? 80 : 240;

  // LÓGICA PRINCIPAL:
  // - Mobile (<1024px): SEMPRE modo simples (mobile)
  // - Desktop (≥1024px): Modo completo por padrão, mas pode forçar simples
  const showDesktopUI = isDesktop && !forceSimpleMode;

  return (
    <div 
      className="min-h-screen"
      style={{
        // Mobile/Modo Simples: azul padrão | Desktop Avançado: gradiente escuro
        background: '#31518b'
      }}
    >
      {/* Desktop Background Override - aplica azul escuro igual à sidebar (apenas modo avançado) */}
      {showDesktopUI && (
        <>
          {/* Overlay para desktop com azul escuro */}
          <div className="hidden lg:block fixed inset-0 -z-10" style={{
            background: '#1e3a5f'
          }} />
        </>
      )}
      
      {/* Desktop: Sidebar + Header (apenas modo avançado) */}
      {showDesktopUI && (
        <>
          <DesktopSidebar 
            onToggleSimpleMode={toggleSimpleMode}
            isSimpleMode={forceSimpleMode}
            onOpenImportModal={() => setShowImportModal(true)}
          />
          <DesktopHeader 
            sidebarWidth={sidebarWidth}
            onOpenSearch={() => setShowCommandPalette(true)}
            onToggleSimpleMode={toggleSimpleMode}
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
        
        <Outlet context={{ isSimpleMode: !showDesktopUI, toggleSimpleMode }} />
      </main>
      
      {/* NavBar: Mobile sempre | Desktop apenas no modo simples forçado */}
      {!noNavBarRoutes.includes(location.pathname) && (
        <div className={showDesktopUI ? 'lg:hidden' : ''}>
          <NavBar />
        </div>
      )}
      
      {/* Botão flutuante para voltar ao modo completo (apenas desktop com modo simples forçado) */}
      {isDesktop && forceSimpleMode && (
        <button
          onClick={toggleSimpleMode}
          className="fixed bottom-24 right-6 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl transition-all hover:scale-105 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            boxShadow: '0 4px 25px rgba(59, 130, 246, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.3)'
          }}
          title="Voltar ao modo completo"
        >
          <Monitor size={20} className="text-white" />
          <span className="text-sm font-semibold text-white">Modo Completo</span>
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
