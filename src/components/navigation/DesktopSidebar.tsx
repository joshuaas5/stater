import React, { useState, useEffect, useMemo } from 'react';
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
  Sparkles,
  Monitor,
  Smartphone,
  Calendar,
  PieChart,
  Target,
  Quote
} from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

// Banco de frases motivacionais sobre inteligência financeira
const FINANCIAL_QUOTES = [
  { text: "O dinheiro que você guarda hoje é a liberdade de amanhã.", author: "Warren Buffett" },
  { text: "Não é sobre quanto você ganha, mas quanto você mantém.", author: "Robert Kiyosaki" },
  { text: "Quem não controla seu dinheiro, é controlado por ele.", author: "Dave Ramsey" },
  { text: "A riqueza não é ter muito dinheiro, é ter muitas opções.", author: "Chris Rock" },
  { text: "Gaste menos do que ganha. É simples assim.", author: "Thomas Stanley" },
  { text: "Investir em conhecimento rende os melhores juros.", author: "Benjamin Franklin" },
  { text: "O segredo da riqueza? Gastar menos do que recebe.", author: "Paul Getty" },
  { text: "Planeje seus gastos ou seus gastos planejam você.", author: "Larry Burkett" },
  { text: "Dinheiro é um excelente servo, mas um péssimo mestre.", author: "Francis Bacon" },
  { text: "A educação financeira é o passaporte para a liberdade.", author: "Gustavo Cerbasi" },
  { text: "Quem poupa na abundância, não passa necessidade na escassez.", author: "Provérbio Chinês" },
  { text: "Organize suas finanças antes que elas organizem sua vida.", author: "Anônimo" },
  { text: "O melhor momento para começar a poupar foi ontem. O segundo melhor é hoje.", author: "Provérbio" },
  { text: "Disciplina financeira é escolher o que você quer mais sobre o que quer agora.", author: "Dave Ramsey" },
  { text: "A liberdade financeira é disponível para aqueles que aprendem e trabalham por ela.", author: "Robert Kiyosaki" },
  { text: "Cuide dos centavos e os reais cuidarão de si mesmos.", author: "Benjamin Franklin" },
  { text: "Orçamento não é restrição, é direção.", author: "Dave Ramsey" },
  { text: "Pequenos vazamentos afundam grandes navios.", author: "Benjamin Franklin" },
  { text: "Não trabalhe pelo dinheiro. Faça o dinheiro trabalhar por você.", author: "Robert Kiyosaki" },
  { text: "A melhor hora de plantar uma árvore foi há 20 anos. A segunda melhor é agora.", author: "Provérbio Chinês" },
  { text: "O hábito de poupar é a base de toda fortuna.", author: "Andrew Carnegie" },
  { text: "Fique longe de dívidas que compram depreciação.", author: "Mark Cuban" },
  { text: "Enriquecer é um hábito. Empobrecer também.", author: "Thiago Nigro" },
  { text: "Nunca gaste seu dinheiro antes de tê-lo.", author: "Thomas Jefferson" },
  { text: "A paz financeira não é sobre acumular riqueza, mas eliminar preocupações.", author: "Suze Orman" },
  { text: "Quem compra o que não precisa, vende o que precisa.", author: "Provérbio Árabe" },
  { text: "Dinheiro guardado é dinheiro ganho duas vezes.", author: "Provérbio Italiano" },
  { text: "O primeiro passo para a riqueza é saber quanto você gasta.", author: "Ramit Sethi" },
  { text: "Sua situação financeira de amanhã é decidida pelas suas escolhas de hoje.", author: "Tony Robbins" },
  { text: "A simplicidade é a sofisticação suprema - inclusive nas finanças.", author: "Leonardo da Vinci" }
];

// Componente de Frase Motivacional
const FinancialQuote: React.FC = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  useEffect(() => {
    // Muda a frase a cada 30 segundos
    const interval = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % FINANCIAL_QUOTES.length);
    }, 30000);
    
    // Escolhe uma frase aleatória na montagem
    setQuoteIndex(Math.floor(Math.random() * FINANCIAL_QUOTES.length));
    
    return () => clearInterval(interval);
  }, []);
  
  const quote = FINANCIAL_QUOTES[quoteIndex];
  
  return (
    <div 
      className="mt-4 mx-2 p-3 rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02]"
      onClick={() => setQuoteIndex(prev => (prev + 1) % FINANCIAL_QUOTES.length)}
      style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(59, 130, 246, 0.1))',
        border: '1px solid rgba(139, 92, 246, 0.25)'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Quote size={14} className="text-purple-400" />
        <span className="text-[10px] font-semibold text-white/60 uppercase tracking-wider">Reflexão</span>
      </div>
      <p className="text-[11px] text-white/80 leading-relaxed italic mb-1.5">
        "{quote.text}"
      </p>
      <p className="text-[10px] text-purple-300/70 font-medium">
        — {quote.author}
      </p>
    </div>
  );
};

// CSS para ocultar scrollbar completamente
const sidebarStyles = `
  .sidebar-scroll::-webkit-scrollbar {
    display: none;
    width: 0;
  }
  .sidebar-scroll {
    scrollbar-width: none;
    -ms-overflow-style: none;
    overflow-x: hidden;
  }
`;

interface DesktopSidebarProps {
  onToggleSimpleMode?: () => void;
  isSimpleMode?: boolean;
  onOpenImportModal?: () => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ 
  onToggleSimpleMode, 
  isSimpleMode = false,
  onOpenImportModal
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
      action: () => {
        if (onOpenImportModal) {
          onOpenImportModal();
        } else {
          window.dispatchEvent(new CustomEvent('open-import-modal'));
        }
      },
      color: '#ec4899',
      description: 'PDF, CSV, OFX'
    },
    {
      icon: Calendar,
      label: 'Recorrentes',
      action: () => navigate('/recurring'),
      color: '#06b6d4',
      description: 'Automatize gastos'
    },
    {
      icon: Target,
      label: 'Metas',
      action: () => navigate('/goals'),
      color: '#f59e0b',
      description: 'Objetivos financeiros'
    },
    {
      icon: PieChart,
      label: 'Relatórios',
      action: () => navigate('/export'),
      color: '#8b5cf6',
      description: 'Exporte em PDF, CSV...'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside 
      className="hidden lg:flex flex-col h-screen fixed left-0 top-0 z-50 transition-all duration-300 overflow-hidden"
      style={{
        width: isCollapsed ? '80px' : '240px',
        background: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '4px 0 20px rgba(0, 0, 0, 0.3)',
        overflowX: 'hidden'
      }}
    >
      {/* Inject scrollbar styles */}
      <style>{sidebarStyles}</style>
      
      {/* Logo */}
      <div 
        className="flex items-center gap-3 p-4 border-b"
        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        <img 
          src="/stater-logo-192.png" 
          alt="Stater" 
          className="flex-shrink-0 object-contain"
          style={{
            width: isCollapsed ? '48px' : '56px',
            height: isCollapsed ? '48px' : '56px',
            filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.4))'
          }}
        />
        {!isCollapsed && (
          <div className="flex flex-col">
            <span 
              className="text-xl font-bold text-white"
              style={{ fontFamily: '"Fredoka One", sans-serif' }}
            >
              STATER
            </span>
            <span className="text-[10px] text-white/50">Controle Financeiro</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto overflow-x-hidden sidebar-scroll">
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

        {/* Funcionalidades */}
        <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
          {!isCollapsed && (
            <div className="px-3 mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
              <span className="text-[11px] uppercase tracking-wider text-white/50 font-semibold">
                Funcionalidades
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent"></div>
            </div>
          )}
          <div className="space-y-1.5">
            {quickActions.map((action, idx) => {
              const Icon = action.icon;
              return (
                <button
                  key={idx}
                  onClick={action.action}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-xl
                    transition-all duration-200 hover:scale-[1.02] group
                    ${isCollapsed ? 'justify-center' : ''}
                  `}
                  style={{
                    background: `linear-gradient(135deg, ${action.color}15, transparent)`,
                    border: `1px solid ${action.color}20`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${action.color}30, ${action.color}10)`;
                    e.currentTarget.style.borderColor = `${action.color}50`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${action.color}15, transparent)`;
                    e.currentTarget.style.borderColor = `${action.color}20`;
                  }}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${action.color}, ${action.color}cc)`
                    }}
                  >
                    <Icon size={16} className="text-white" />
                  </div>
                  {!isCollapsed && (
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium text-white/90 block leading-tight">
                        {action.label}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {action.description}
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Frase Motivacional */}
        {!isCollapsed && <FinancialQuote />}
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
