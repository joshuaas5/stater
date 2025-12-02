import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/dataProcessing';
import { ChevronDown, ChevronUp, Info, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

export const ProjectedBalanceCard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProjection = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_financial_projection', { user_id_param: user.id });
        
        if (error) throw error;
        setData(data);
      } catch (error) {
        console.error('Error fetching projection:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjection();
    
    // Listen for updates
    const handleUpdate = () => fetchProjection();
    window.addEventListener('transactionsUpdated', handleUpdate);
    window.addEventListener('billsUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('transactionsUpdated', handleUpdate);
      window.removeEventListener('billsUpdated', handleUpdate);
    };
  }, [user]);

  if (loading || !data) return null;
  
  // Don't show if no pending bills
  if (data.pending_bills === 0) return null;

  const isPositive = data.projected_balance >= 0;

  return (
    <div className="px-8 mb-4 lg:px-0 flex justify-center">
      <div className="inline-block">
        {/* Compact Pill */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2.5 py-2 px-4 rounded-full transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: isPositive 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.08))'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.08))',
            border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            boxShadow: `0 2px 12px ${isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`
          }}
        >
          <div 
            className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-red-400'}`}
            style={{ boxShadow: `0 0 6px ${isPositive ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'}` }}
          />
          <span className="text-white/50 text-[10px] uppercase tracking-wider">Projeção</span>
          <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(data.projected_balance)}
          </span>
          {expanded ? (
            <ChevronUp size={14} className="text-white/40" />
          ) : (
            <ChevronDown size={14} className="text-white/40" />
          )}
        </button>

        {/* Expanded Details Panel */}
        {expanded && (
          <div 
            className="mt-2 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              minWidth: '280px'
            }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
              <Info size={14} className="text-blue-400" />
              <span className="text-white/80 text-xs font-medium">Como funciona a projeção?</span>
            </div>
            
            {/* Explanation */}
            <p className="text-white/50 text-[11px] leading-relaxed mb-4">
              Calculamos quanto você terá no fim do mês subtraindo todas as contas pendentes do seu saldo atual.
            </p>

            {/* Breakdown */}
            <div className="space-y-2.5">
              {/* Current Balance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Wallet size={12} className="text-blue-400" />
                  </div>
                  <span className="text-white/70 text-xs">Saldo Atual</span>
                </div>
                <span className="text-white font-semibold text-sm">
                  {formatCurrency(data.current_balance)}
                </span>
              </div>

              {/* Pending Bills */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <TrendingDown size={12} className="text-red-400" />
                  </div>
                  <span className="text-white/70 text-xs">Contas Pendentes</span>
                </div>
                <span className="text-red-400 font-semibold text-sm">
                  - {formatCurrency(data.pending_bills)}
                </span>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/10 my-1" />

              {/* Projected Balance */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isPositive ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    <TrendingUp size={12} className={isPositive ? 'text-emerald-400' : 'text-red-400'} />
                  </div>
                  <span className="text-white/70 text-xs font-medium">Projeção Final</span>
                </div>
                <span className={`font-bold text-base ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {formatCurrency(data.projected_balance)}
                </span>
              </div>
            </div>

            {/* Status Message */}
            <div 
              className={`mt-4 p-2.5 rounded-xl text-center text-[11px] ${
                isPositive 
                  ? 'bg-emerald-500/10 text-emerald-300' 
                  : 'bg-red-500/10 text-red-300'
              }`}
            >
              {isPositive 
                ? '✓ Você está no verde! Continue assim.' 
                : '⚠ Atenção: seu saldo pode ficar negativo.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
