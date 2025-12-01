import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Brain, 
  Lightbulb, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Upload,
  BookOpen,
  Sparkles,
  Monitor,
  Smartphone
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface DesktopSidebarProps {
  onToggleSimpleMode?: () => void;
  isSimpleMode?: boolean;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ 
  onToggleSimpleMode, 
  isSimpleMode = false 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Salvar estado do collapse no localStorage
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved) setIsCollapsed(saved === 'true');
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const navItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/dashboard',
      color: '#3b82f6'
    },
    { 
      icon: FileText, 
      label: t('bills'), 
      path: '/bills',
      color: '#10b981'
    },
    { 
      icon: Brain, 
      label: 'Análise IA', 
      path: '/analise-financeira',
      color: '#8b5cf6'
    },
    { 
      icon: Lightbulb, 
      label: t('advisor'), 
      path: '/financial-advisor',
      color: '#f59e0b'
    },
    { 
      icon: Settings, 
      label: t('settings'), 
      path: '/preferences',
      color: '#6b7280'
    },
  ];

  const quickActions = [
    {
      icon: Upload,
      label: 'Importar Extrato',
      action: () => navigate('/bills?import=true'),
      color: '#ec4899'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside 
      className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300"
      style={{
        width: isCollapsed ? '80px' : '240px',
        background: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Logo */}
      <div 
        className="flex items-center gap-3 p-4 border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
          }}
        >
          <img 
            src="/stater-logo-192.png" 
            alt="Stater" 
            className="w-7 h-7 object-contain"
          />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span 
              className="text-lg font-bold text-white"
              style={{ fontFamily: '"Fredoka One", sans-serif' }}
            >
              STATER
            </span>
            <span className="text-[10px] text-white/50">Controle Financeiro</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const hovered = hoveredItem === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredItem(item.path)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 relative group
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                style={{
                  background: active 
                    ? `linear-gradient(135deg, ${item.color}30, ${item.color}15)`
                    : hovered 
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'transparent',
                  border: active ? `1px solid ${item.color}50` : '1px solid transparent',
                  boxShadow: active ? `0 4px 15px ${item.color}20` : 'none'
                }}
              >
                <div 
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: active 
                      ? `linear-gradient(135deg, ${item.color}, ${item.color}cc)`
                      : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: active ? `0 4px 12px ${item.color}40` : 'none'
                  }}
                >
                  <Icon 
                    size={20} 
                    className={active ? 'text-white' : 'text-white/70'}
                  />
                </div>
                
                {!isCollapsed && (
                  <span 
                    className={`text-sm font-medium transition-colors ${
                      active ? 'text-white' : 'text-white/70'
                    }`}
                  >
                    {item.label}
                  </span>
                )}

                {/* Active indicator */}
                {active && (
                  <div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                    style={{ background: item.color }}
                  />
                )}

                {/* Tooltip for collapsed */}
                {isCollapsed && (
                  <div 
                    className="absolute left-full ml-2 px-3 py-1.5 rounded-lg text-sm font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
                    style={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          {!isCollapsed && (
            <span className="px-3 text-[10px] uppercase tracking-wider text-white/40 font-semibold">
              Ações Rápidas
            </span>
          )}
          <div className="mt-2 space-y-1">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={action.action}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                    transition-all duration-200 hover:scale-[1.02]
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  style={{
                    background: `linear-gradient(135deg, ${action.color}25, ${action.color}10)`,
                    border: `1px solid ${action.color}40`
                  }}
                >
                  <div 
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${action.color}, ${action.color}cc)`
                    }}
                  >
                    <Icon size={18} className="text-white" />
                  </div>
                  {!isCollapsed && (
                    <span className="text-sm font-medium text-white/90">
                      {action.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Book of the Week Mini */}
        {!isCollapsed && (
          <div 
            className="mt-4 mx-2 p-3 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1))',
              border: '1px solid rgba(139, 92, 246, 0.3)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={16} className="text-purple-400" />
              <span className="text-xs font-semibold text-white/80">Livro da Semana</span>
            </div>
            <p className="text-[11px] text-white/60 leading-relaxed">
              Clique em Análise IA para ver a recomendação
            </p>
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div 
        className="p-3 border-t space-y-2"
        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        {/* Toggle Simple Mode */}
        <button
          onClick={onToggleSimpleMode}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-xl
            transition-all duration-200 hover:bg-white/10
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          {isSimpleMode ? (
            <Monitor size={18} className="text-cyan-400" />
          ) : (
            <Smartphone size={18} className="text-white/60" />
          )}
          {!isCollapsed && (
            <div className="flex flex-col items-start">
              <span className="text-xs font-medium text-white/80">
                {isSimpleMode ? 'Modo Avançado' : 'Modo Simples'}
              </span>
              <span className="text-[10px] text-white/40">
                {isSimpleMode ? 'Todas as funcionalidades' : 'Interface simplificada'}
              </span>
            </div>
          )}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={toggleCollapse}
          className={`
            w-full flex items-center gap-3 px-3 py-2 rounded-xl
            transition-all duration-200 hover:bg-white/10
            ${isCollapsed ? 'justify-center' : ''}
          `}
        >
          {isCollapsed ? (
            <ChevronRight size={18} className="text-white/60" />
          ) : (
            <>
              <ChevronLeft size={18} className="text-white/60" />
              <span className="text-xs text-white/60">Recolher menu</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
