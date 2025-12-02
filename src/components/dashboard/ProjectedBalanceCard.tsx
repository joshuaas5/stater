import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/dataProcessing';
import { TrendingDown, Target, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ProjectedBalanceCard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  const isPositive = data.projected_balance >= 0;
  const projectionColor = isPositive ? 'text-emerald-400' : 'text-red-400';

  return (
    <div className="px-8 mb-6 lg:px-0">
      <div 
        className="rounded-2xl p-4 relative overflow-hidden transition-all duration-300 hover:bg-white/10"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-white/70" />
            <span className="text-white/70 text-sm font-medium uppercase tracking-wider">Saldo Projetado (Fim do Mês)</span>
          </div>
          {isPositive ? (
            <CheckCircle2 size={18} className="text-emerald-400" />
          ) : (
            <AlertCircle size={18} className="text-red-400" />
          )}
        </div>

        <div className="flex items-baseline gap-3">
          <span className={`text-2xl font-bold ${projectionColor}`}>
            {formatCurrency(data.projected_balance)}
          </span>
          <span className="text-white/40 text-xs">
            (Atual: {formatCurrency(data.current_balance)})
          </span>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5 text-red-300/80">
            <TrendingDown size={12} />
            <span>Contas Pendentes: {formatCurrency(data.pending_bills)}</span>
          </div>
        </div>
        
        {/* Progress Bar Visual */}
        <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
            style={{ 
              width: '100%',
              opacity: 0.6
            }}
          />
        </div>
      </div>
    </div>
  );
};
