import React from 'react';
import { Zap, CheckCircle2, AlertTriangle, Lightbulb, Target, Clock, DollarSign, TrendingUp, Shield, Star } from 'lucide-react';

export interface SummaryItem {
  label: string;
  value: string;
  icon?: 'check' | 'alert' | 'lightbulb' | 'target' | 'clock' | 'money' | 'trend' | 'shield' | 'star';
}

interface QuickSummaryProps {
  items: SummaryItem[];
  variant?: 'yellow' | 'blue' | 'green' | 'purple' | 'orange';
}

const iconMap = {
  check: CheckCircle2,
  alert: AlertTriangle,
  lightbulb: Lightbulb,
  target: Target,
  clock: Clock,
  money: DollarSign,
  trend: TrendingUp,
  shield: Shield,
  star: Star,
};

const variantStyles = {
  yellow: {
    bg: 'bg-yellow-400',
    border: 'border-yellow-500',
    headerBg: 'bg-yellow-500',
    text: 'text-slate-900',
    labelBg: 'bg-yellow-500/30',
  },
  blue: {
    bg: 'bg-blue-400',
    border: 'border-blue-500',
    headerBg: 'bg-blue-500',
    text: 'text-slate-900',
    labelBg: 'bg-blue-500/30',
  },
  green: {
    bg: 'bg-emerald-400',
    border: 'border-emerald-500',
    headerBg: 'bg-emerald-500',
    text: 'text-slate-900',
    labelBg: 'bg-emerald-500/30',
  },
  purple: {
    bg: 'bg-purple-400',
    border: 'border-purple-500',
    headerBg: 'bg-purple-500',
    text: 'text-white',
    labelBg: 'bg-purple-500/30',
  },
  orange: {
    bg: 'bg-orange-400',
    border: 'border-orange-500',
    headerBg: 'bg-orange-500',
    text: 'text-slate-900',
    labelBg: 'bg-orange-500/30',
  },
};

const QuickSummary: React.FC<QuickSummaryProps> = ({ items, variant = 'yellow' }) => {
  const styles = variantStyles[variant];

  return (
    <div className={`${styles.bg} border-4 border-slate-900 shadow-[6px_6px_0px_0px_#000] my-8`}>
      {/* Header */}
      <div className={`${styles.headerBg} border-b-4 border-slate-900 px-4 py-3 flex items-center gap-2`}>
        <Zap className="w-5 h-5 text-slate-900" />
        <span className="font-black text-slate-900 uppercase tracking-wide">Resumo Rápido</span>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-3">
        {items.map((item, index) => {
          const IconComponent = item.icon ? iconMap[item.icon] : CheckCircle2;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className={`${styles.labelBg} border-2 border-slate-900 px-2 py-1 flex items-center gap-1.5 shrink-0`}>
                <IconComponent className="w-4 h-4 text-slate-900" />
                <span className="font-black text-xs text-slate-900 uppercase whitespace-nowrap">
                  {item.label}
                </span>
              </div>
              <p className={`${styles.text} font-medium text-sm leading-relaxed pt-1`}>
                {item.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuickSummary;
