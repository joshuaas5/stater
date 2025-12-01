import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  LayoutDashboard, 
  FileText, 
  Brain, 
  Lightbulb, 
  Settings,
  Upload,
  Calendar,
  Target,
  CreditCard,
  TrendingUp,
  Bell,
  X,
  ArrowRight
} from 'lucide-react';
import { getTransactions } from '@/utils/localStorage';
import { Transaction } from '@/types';
import { formatCurrency } from '@/utils/dataProcessing';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImport?: () => void;
}

interface SearchResult {
  id: string;
  type: 'page' | 'transaction' | 'action';
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action: () => void;
  color?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose,
  onOpenImport 
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Páginas e ações disponíveis
  const pages: SearchResult[] = [
    {
      id: 'dashboard',
      type: 'page',
      icon: <LayoutDashboard size={18} />,
      title: 'Dashboard',
      subtitle: 'Visão geral das suas finanças',
      action: () => { navigate('/dashboard'); onClose(); },
      color: '#3b82f6'
    },
    {
      id: 'bills',
      type: 'page',
      icon: <FileText size={18} />,
      title: 'Contas a Pagar',
      subtitle: 'Gerencie suas contas e boletos',
      action: () => { navigate('/bills'); onClose(); },
      color: '#10b981'
    },
    {
      id: 'analysis',
      type: 'page',
      icon: <Brain size={18} />,
      title: 'Análise Financeira',
      subtitle: 'Análise com inteligência artificial',
      action: () => { navigate('/analise-financeira'); onClose(); },
      color: '#8b5cf6'
    },
    {
      id: 'advisor',
      type: 'page',
      icon: <Lightbulb size={18} />,
      title: 'Consultor Financeiro',
      subtitle: 'Converse com o assistente IA',
      action: () => { navigate('/financial-advisor'); onClose(); },
      color: '#f59e0b'
    },
    {
      id: 'recurring',
      type: 'page',
      icon: <Calendar size={18} />,
      title: 'Transações Recorrentes',
      subtitle: 'Gerencie assinaturas e recorrências',
      action: () => { navigate('/recurring'); onClose(); },
      color: '#06b6d4'
    },
    {
      id: 'settings',
      type: 'page',
      icon: <Settings size={18} />,
      title: 'Configurações',
      subtitle: 'Preferências e conta',
      action: () => { navigate('/preferences'); onClose(); },
      color: '#6b7280'
    },
    {
      id: 'notifications',
      type: 'page',
      icon: <Bell size={18} />,
      title: 'Notificações',
      subtitle: 'Ver todas as notificações',
      action: () => { navigate('/notifications'); onClose(); },
      color: '#ef4444'
    },
  ];

  const actions: SearchResult[] = [
    {
      id: 'import',
      type: 'action',
      icon: <Upload size={18} />,
      title: 'Importar Extrato OFX',
      subtitle: 'Importar transações do banco',
      action: () => { 
        onOpenImport?.(); 
        onClose(); 
      },
      color: '#ec4899'
    },
    {
      id: 'add-income',
      type: 'action',
      icon: <TrendingUp size={18} />,
      title: 'Adicionar Entrada',
      subtitle: 'Registrar nova receita',
      action: () => { 
        navigate('/dashboard?action=add-income'); 
        onClose(); 
      },
      color: '#22c55e'
    },
    {
      id: 'add-expense',
      type: 'action',
      icon: <CreditCard size={18} />,
      title: 'Adicionar Saída',
      subtitle: 'Registrar nova despesa',
      action: () => { 
        navigate('/dashboard?action=add-expense'); 
        onClose(); 
      },
      color: '#ef4444'
    },
    {
      id: 'goals',
      type: 'action',
      icon: <Target size={18} />,
      title: 'Metas Financeiras',
      subtitle: 'Definir e acompanhar metas',
      action: () => { navigate('/preferences?tab=goals'); onClose(); },
      color: '#f59e0b'
    },
  ];

  // Buscar transações
  const searchTransactions = useCallback(async (searchQuery: string): Promise<SearchResult[]> => {
    if (searchQuery.length < 2) return [];
    
    try {
      const transactions = await getTransactions();
      const filtered = transactions
        .filter((tx: Transaction) => 
          tx.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.category?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5)
        .map((tx: Transaction): SearchResult => ({
          id: tx.id,
          type: 'transaction',
          icon: tx.type === 'income' ? <TrendingUp size={18} /> : <CreditCard size={18} />,
          title: tx.title,
          subtitle: `${tx.category} • ${formatCurrency(tx.amount)}`,
          action: () => { navigate('/dashboard'); onClose(); },
          color: tx.type === 'income' ? '#22c55e' : '#ef4444'
        }));
      
      return filtered;
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      return [];
    }
  }, [navigate, onClose]);

  // Atualizar resultados quando a query muda
  useEffect(() => {
    const updateResults = async () => {
      if (!query.trim()) {
        // Mostrar páginas e ações por padrão
        setResults([...pages, ...actions]);
        return;
      }

      const queryLower = query.toLowerCase();
      
      // Filtrar páginas
      const filteredPages = pages.filter(p => 
        p.title.toLowerCase().includes(queryLower) ||
        p.subtitle?.toLowerCase().includes(queryLower)
      );
      
      // Filtrar ações
      const filteredActions = actions.filter(a => 
        a.title.toLowerCase().includes(queryLower) ||
        a.subtitle?.toLowerCase().includes(queryLower)
      );
      
      // Buscar transações
      const transactionResults = await searchTransactions(query);
      
      setResults([...filteredPages, ...filteredActions, ...transactionResults]);
    };

    updateResults();
    setSelectedIndex(0);
  }, [query, searchTransactions]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            results[selectedIndex].action();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  // Focus input quando abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
    }
  }, [isOpen]);

  // Ctrl+K global
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Disparar evento para abrir
          window.dispatchEvent(new CustomEvent('open-command-palette'));
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[15vh]">
        <div 
          className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input */}
          <div 
            className="flex items-center gap-3 p-4 border-b"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <Search size={20} className="text-white/50" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar páginas, ações, transações..."
              className="flex-1 bg-transparent border-none outline-none text-white text-base placeholder:text-white/40"
            />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-white/50" />
            </button>
          </div>
          
          {/* Results */}
          <div 
            className="max-h-[60vh] overflow-y-auto p-2"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(255, 255, 255, 0.15) transparent'
            }}
          >
            {results.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-white/50">Nenhum resultado encontrado</p>
              </div>
            ) : (
              <>
                {/* Agrupar por tipo */}
                {results.some(r => r.type === 'page') && (
                  <div className="mb-2">
                    <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                      Páginas
                    </p>
                    {results.filter(r => r.type === 'page').map((result, idx) => {
                      const globalIdx = results.indexOf(result);
                      return (
                        <button
                          key={result.id}
                          onClick={result.action}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            transition-all duration-150
                            ${globalIdx === selectedIndex ? 'bg-white/15' : 'hover:bg-white/10'}
                          `}
                        >
                          <div 
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ 
                              background: `${result.color}25`,
                              border: `1px solid ${result.color}40`
                            }}
                          >
                            <span style={{ color: result.color }}>{result.icon}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-white">{result.title}</p>
                            <p className="text-xs text-white/50">{result.subtitle}</p>
                          </div>
                          <ArrowRight size={14} className="text-white/30" />
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {results.some(r => r.type === 'action') && (
                  <div className="mb-2">
                    <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                      Ações Rápidas
                    </p>
                    {results.filter(r => r.type === 'action').map((result) => {
                      const globalIdx = results.indexOf(result);
                      return (
                        <button
                          key={result.id}
                          onClick={result.action}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            transition-all duration-150
                            ${globalIdx === selectedIndex ? 'bg-white/15' : 'hover:bg-white/10'}
                          `}
                        >
                          <div 
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ 
                              background: `${result.color}25`,
                              border: `1px solid ${result.color}40`
                            }}
                          >
                            <span style={{ color: result.color }}>{result.icon}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-white">{result.title}</p>
                            <p className="text-xs text-white/50">{result.subtitle}</p>
                          </div>
                          <ArrowRight size={14} className="text-white/30" />
                        </button>
                      );
                    })}
                  </div>
                )}
                
                {results.some(r => r.type === 'transaction') && (
                  <div className="mb-2">
                    <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-white/40 font-semibold">
                      Transações
                    </p>
                    {results.filter(r => r.type === 'transaction').map((result) => {
                      const globalIdx = results.indexOf(result);
                      return (
                        <button
                          key={result.id}
                          onClick={result.action}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                            transition-all duration-150
                            ${globalIdx === selectedIndex ? 'bg-white/15' : 'hover:bg-white/10'}
                          `}
                        >
                          <div 
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ 
                              background: `${result.color}25`,
                              border: `1px solid ${result.color}40`
                            }}
                          >
                            <span style={{ color: result.color }}>{result.icon}</span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-white">{result.title}</p>
                            <p className="text-xs text-white/50">{result.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Footer */}
          <div 
            className="flex items-center justify-between px-4 py-2 border-t text-[10px] text-white/40"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <div className="flex items-center gap-4">
              <span>↑↓ Navegar</span>
              <span>↵ Selecionar</span>
              <span>Esc Fechar</span>
            </div>
            <span>Ctrl+K para buscar</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommandPalette;
