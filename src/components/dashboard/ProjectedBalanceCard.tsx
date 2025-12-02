import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/dataProcessing';
import { ChevronRight } from 'lucide-react';

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
  
  // Don't show if no pending bills
  if (data.pending_bills === 0) return null;

  const isPositive = data.projected_balance >= 0;

  return (
    <div className="px-8 mb-4 lg:px-0">
      <div 
        className="flex items-center justify-between py-2.5 px-4 rounded-xl"
        style={{
          background: isPositive 
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))',
          border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-red-400'}`}
            style={{ boxShadow: `0 0 8px ${isPositive ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'}` }}
          />
          <div className="flex flex-col">
            <span className="text-white/60 text-[10px] uppercase tracking-wider leading-none">
              Projeção fim do mês
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-base font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(data.projected_balance)}
              </span>
              <span className="text-white/30 text-[10px]">
                (-{formatCurrency(data.pending_bills)} pendente)
              </span>
            </div>
          </div>
        </div>
        <ChevronRight size={16} className="text-white/30" />
      </div>
    </div>
  );
};
