import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Crown, User, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlanManager } from '@/utils/userPlanManager';
import { PlanType } from '@/types';
import PremiumModal from '@/components/PremiumModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DesktopHeaderProps {
  sidebarWidth: number;
  onOpenSearch?: () => void;
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({ sidebarWidth, onOpenSearch }) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isPro, setIsPro] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  // Verificar status PRO
  useEffect(() => {
    const checkProStatus = async () => {
      if (!user?.id) return;
      try {
        const userPlan = await UserPlanManager.getUserPlan(user.id);
        setIsPro(userPlan.planType !== PlanType.FREE);
      } catch (error) {
        console.error('Erro ao verificar status PRO:', error);
      }
    };
    
    checkProStatus();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <header 
      className="hidden lg:flex items-center justify-between h-16 px-6 fixed top-0 right-0 z-40 transition-all duration-300"
      style={{
        left: `${sidebarWidth}px`,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}
    >
      {/* Search Bar */}
      <button 
        onClick={onOpenSearch}
        className="flex items-center gap-3 px-4 py-2 rounded-xl w-96 text-left transition-all hover:bg-white/12"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Search size={18} className="text-white/50" />
        <span className="flex-1 text-sm text-white/40">
          Buscar transações, contas...
        </span>
        <kbd 
          className="px-2 py-0.5 rounded text-[10px] font-mono text-white/40"
          style={{ background: 'rgba(255, 255, 255, 0.1)' }}
        >
          Ctrl+K
        </kbd>
      </button>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Pro Badge */}
        {isPro ? (
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.2), rgba(245, 158, 11, 0.1))',
              border: '1px solid rgba(250, 204, 21, 0.4)'
            }}
          >
            <Crown size={14} className="text-yellow-400" />
            <span className="text-xs font-semibold text-yellow-400">PRO</span>
          </div>
        ) : (
          <button 
            onClick={() => setShowPremiumModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
            }}
          >
            <Crown size={14} className="text-white" />
            <span className="text-xs font-semibold text-white">Assinar PRO</span>
          </button>
        )}

        {/* Notifications */}
        <button 
          onClick={() => navigate('/notifications')}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Bell size={18} className="text-white/70" />
          <span 
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ background: '#ef4444' }}
          />
        </button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover:bg-white/10"
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)'
                }}
              >
                {user?.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt="Avatar"
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <User size={16} className="text-white" />
                )}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium text-white">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'}
                </span>
                <span className="text-[10px] text-white/50">
                  {user?.email}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56"
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <DropdownMenuItem 
              onClick={() => navigate('/preferences')}
              className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <User size={16} className="mr-2" />
              Minha Conta
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/preferences?tab=subscription')}
              className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <Crown size={16} className="mr-2 text-yellow-400" />
              Assinatura
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
            >
              <LogOut size={16} className="mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Premium Modal */}
      <PremiumModal 
        isOpen={showPremiumModal} 
        onClose={() => setShowPremiumModal(false)} 
      />
    </header>
  );
};

export default DesktopHeader;
