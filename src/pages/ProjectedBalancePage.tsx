import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/dataProcessing';
import { getBills } from '@/utils/localStorage';
import { Bill } from '@/types';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Info,
  Receipt
} from 'lucide-react';

const ProjectedBalancePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [pendingBills, setPendingBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch projection data
        const { data: projectionData, error } = await supabase
          .rpc('get_financial_projection', { user_id_param: user.id });
        
        if (error) throw error;
        setData(projectionData);

        // Fetch pending bills for breakdown
        const allBills = getBills(false); // Get all bills including paid
        const today = new Date();
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        const pending = allBills.filter(bill => {
          const dueDate = new Date(bill.dueDate);
          return !bill.isPaid && dueDate <= monthEnd;
        });
        
        // Sort by due date
        pending.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setPendingBills(pending);
        
      } catch (error) {
        console.error('Error fetching projection data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <button onClick={() => navigate(-1)} className="text-white/70 hover:text-white flex items-center gap-2 mb-6">
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <p className="text-white/60 text-center">Não foi possível carregar os dados.</p>
      </div>
    );
  }

  const isPositive = data.projected_balance >= 0;
  const today = new Date();
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysRemaining = Math.ceil((monthEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
        <div className="px-6 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-white font-semibold text-lg">Projeção Orçamentária</h1>
            <p className="text-white/50 text-xs">Análise detalhada do seu mês</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 pb-24">
        
        {/* Hero Card - Main Projection */}
        <div 
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: isPositive 
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))',
            border: `1px solid ${isPositive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
          }}
        >
          {/* Decorative circles */}
          <div 
            className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`}
          />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              {isPositive ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <AlertCircle size={18} className="text-red-400" />
              )}
              <span className="text-white/60 text-sm uppercase tracking-wider">Saldo Projetado</span>
            </div>
            
            <div className={`text-4xl font-bold mb-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatCurrency(data.projected_balance)}
            </div>
            
            <p className="text-white/50 text-sm">
              Estimativa para o fim do mês ({daysRemaining} dias restantes)
            </p>
          </div>
        </div>

        {/* Explanation Box */}
        <div 
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info size={16} className="text-blue-400" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm mb-1">Como calculamos?</h3>
              <p className="text-white/60 text-xs leading-relaxed">
                Pegamos seu <strong className="text-white/80">saldo atual</strong> e subtraímos todas as <strong className="text-white/80">contas pendentes</strong> com vencimento até o fim do mês. 
                Isso mostra quanto você terá disponível se pagar todas as suas obrigações.
              </p>
            </div>
          </div>
        </div>

        {/* Breakdown Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* Current Balance */}
          <div 
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
              <Wallet size={20} className="text-blue-400" />
            </div>
            <span className="text-white/50 text-xs uppercase tracking-wider">Saldo Atual</span>
            <div className="text-white font-bold text-xl mt-1">
              {formatCurrency(data.current_balance)}
            </div>
          </div>

          {/* Pending Bills Total */}
          <div 
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mb-3">
              <TrendingDown size={20} className="text-red-400" />
            </div>
            <span className="text-white/50 text-xs uppercase tracking-wider">Contas Pendentes</span>
            <div className="text-red-400 font-bold text-xl mt-1">
              - {formatCurrency(data.pending_bills)}
            </div>
          </div>
        </div>

        {/* Pending Bills List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Composição das Contas</h2>
            <span className="text-white/40 text-sm">{pendingBills.length} pendente{pendingBills.length !== 1 ? 's' : ''}</span>
          </div>

          {pendingBills.length === 0 ? (
            <div 
              className="rounded-2xl p-6 text-center"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
              <p className="text-white/70">Nenhuma conta pendente este mês!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBills.map((bill, index) => {
                const dueDate = new Date(bill.dueDate);
                const isOverdue = dueDate < today;
                const isDueSoon = !isOverdue && dueDate <= new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
                
                return (
                  <div 
                    key={bill.id}
                    className="rounded-xl p-4 flex items-center gap-4"
                    style={{
                      background: isOverdue 
                        ? 'rgba(239, 68, 68, 0.1)' 
                        : isDueSoon 
                          ? 'rgba(245, 158, 11, 0.1)'
                          : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isOverdue 
                        ? 'rgba(239, 68, 68, 0.2)' 
                        : isDueSoon 
                          ? 'rgba(245, 158, 11, 0.2)'
                          : 'rgba(255,255,255,0.1)'}`
                    }}
                  >
                    <div 
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isOverdue 
                          ? 'bg-red-500/20' 
                          : isDueSoon 
                            ? 'bg-amber-500/20'
                            : 'bg-white/10'
                      }`}
                    >
                      <Receipt 
                        size={18} 
                        className={isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-white/60'} 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">{bill.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar size={12} className="text-white/40" />
                        <span className={`text-xs ${isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-white/50'}`}>
                          {isOverdue ? 'Vencida em ' : isDueSoon ? 'Vence em ' : ''}
                          {dueDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                        {bill.category && (
                          <span className="text-white/30 text-xs">• {bill.category}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`font-bold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                        {formatCurrency(bill.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Formula */}
        <div 
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <h3 className="text-white/60 text-xs uppercase tracking-wider mb-4">Resumo do Cálculo</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Saldo Atual</span>
              <span className="text-white font-medium">{formatCurrency(data.current_balance)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Contas Pendentes</span>
              <span className="text-red-400 font-medium">- {formatCurrency(data.pending_bills)}</span>
            </div>
            
            <div className="h-px bg-white/10 my-2" />
            
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Projeção Final</span>
              <span className={`text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(data.projected_balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div 
          className={`rounded-2xl p-4 text-center ${
            isPositive 
              ? 'bg-emerald-500/10 border border-emerald-500/20' 
              : 'bg-red-500/10 border border-red-500/20'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-1">
            {isPositive ? (
              <TrendingUp size={18} className="text-emerald-400" />
            ) : (
              <AlertCircle size={18} className="text-red-400" />
            )}
            <span className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? 'Situação Positiva' : 'Atenção Necessária'}
            </span>
          </div>
          <p className={`text-sm ${isPositive ? 'text-emerald-300/70' : 'text-red-300/70'}`}>
            {isPositive 
              ? 'Você está no caminho certo! Mantenha o controle dos gastos.' 
              : 'Seu saldo pode ficar negativo. Considere adiar alguns pagamentos ou buscar renda extra.'}
          </p>
        </div>

      </div>
    </div>
  );
};

export default ProjectedBalancePage;
