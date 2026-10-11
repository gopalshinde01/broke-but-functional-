import React from 'react';
import { Percent, TrendingDown, CalendarDays, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/utils/financeCalculations';

interface SubscriptionMetricsProps {
  activeMonthlyTotal: number;
  activeAnnualTotal: number;
  totalDailyDrain: number;
  savedAnnual: number;
  activeBudgetPct: number;
}

export const SubscriptionMetrics: React.FC<SubscriptionMetricsProps> = ({
  activeMonthlyTotal,
  activeAnnualTotal,
  totalDailyDrain,
  savedAnnual,
  activeBudgetPct,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
      <div className="p-4 rounded-xl bg-[#0f1311] border border-[#232b26]">
        <div className="flex items-center justify-between text-xs text-[#8e9c93] mb-1">
          <span className="font-mono uppercase text-[10px]">Monthly Burn</span>
          <Percent className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div className="text-xl font-bold font-mono text-white tabular-nums">
          {formatINR(activeMonthlyTotal)}
        </div>
        <span className="text-[11px] text-[#8e9c93]">{activeBudgetPct}% of total budget</span>
      </div>

      <div className="p-4 rounded-xl bg-[#0f1311] border border-[#232b26]">
        <div className="flex items-center justify-between text-xs text-[#8e9c93] mb-1">
          <span className="font-mono uppercase text-[10px]">Annual Drain</span>
          <TrendingDown className="w-3.5 h-3.5 text-red-400" />
        </div>
        <div className="text-xl font-bold font-mono text-red-400 tabular-nums">
          {formatINR(activeAnnualTotal)}
        </div>
        <span className="text-[11px] text-[#8e9c93]">Projected 12-month drain</span>
      </div>

      <div className="p-4 rounded-xl bg-[#0f1311] border border-[#232b26]">
        <div className="flex items-center justify-between text-xs text-[#8e9c93] mb-1">
          <span className="font-mono uppercase text-[10px]">Daily Allowance Tax</span>
          <CalendarDays className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
          -{formatINR(totalDailyDrain)}/d
        </div>
        <span className="text-[11px] text-[#8e9c93]">Diverted from free spending</span>
      </div>

      <div className="p-4 rounded-xl bg-[#0f1311] border border-[#232b26]">
        <div className="flex items-center justify-between text-xs text-[#8e9c93] mb-1">
          <span className="font-mono uppercase text-[10px]">Paused Annual Savings</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
          +{formatINR(savedAnnual)}
        </div>
        <span className="text-[11px] text-[#8e9c93]">Preserved from paused subs</span>
      </div>
    </div>
  );
};

export default SubscriptionMetrics;
