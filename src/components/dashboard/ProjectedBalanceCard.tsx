import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/dataProcessing';
import { ChevronRight } from 'lucide-react';

export const ProjectedBalanceCard = () => {
  const navigate = useNavigate();
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
    <div className="px-8 mb-4 lg:px-0 flex justify-center">
      <button
        onClick={() => navigate('/projecao')}
        className="inline-flex items-center gap-2.5 py-2 px-4 rounded-full transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
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
        <ChevronRight size={14} className="text-white/40" />
      </button>
    </div>
  );
};
