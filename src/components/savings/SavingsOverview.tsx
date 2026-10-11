import React from 'react';
import { Target, TrendingUp, Sparkles, PiggyBank } from 'lucide-react';
import type { CalculationResult } from '@/types';
import { formatINR } from '@/utils/financeCalculations';

interface SavingsOverviewProps {
  calc: CalculationResult;
  goalCount: number;
}

export const SavingsOverview: React.FC<SavingsOverviewProps> = ({ calc, goalCount }) => {
  const { totalTarget, totalSaved, totalNeed, savingsProgressNow } = calc;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
      <div className="p-4 rounded-xl bg-[#0f1311] border border-[#232b26]">
        <div className="flex items-center justify-between text-xs text-[#8e9c93] mb-1">
          <span className="font-mono uppercase text-[10px]">Total Target</span>
          <Target className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-xl font-bold font-mono text-white tabular-nums">
          {formatINR(totalTarget)}
        </div>
        <span className="text-[11px] text-[#8e9c93]">{goalCount} active goals</span>
      </div>

      <div className="p-4 rounded-xl bg-[#0f1311] border border-[#232b26]">
        <div className="flex items-center justify-between text-xs text-[#8e9c93] mb-1">
          <span className="font-mono uppercase text-[10px]">Total Saved</span>
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
          {formatINR(totalSaved)}
        </div>
        <span className="text-[11px] text-[#8e9c93]">{savingsProgressNow}% funded</span>
      </div>

      <div className="p-4 rounded-xl bg-[#0f1311] border border-[#232b26]">
        <div className="flex items-center justify-between text-xs text-[#8e9c93] mb-1">
          <span className="font-mono uppercase text-[10px]">Remaining Need</span>
          <PiggyBank className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
          {formatINR(totalNeed)}
        </div>
        <span className="text-[11px] text-[#8e9c93]">Deficit to reach 100%</span>
      </div>

      <div className="p-4 rounded-xl bg-[#0f1311] border border-[#232b26]">
        <div className="flex items-center justify-between text-xs text-[#8e9c93] mb-1">
          <span className="font-mono uppercase text-[10px]">Pace Status</span>
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        </div>
        <div
          className={`text-xl font-bold font-mono ${
            calc.onTrack ? 'text-emerald-400' : 'text-amber-400'
          }`}
        >
          {calc.onTrack ? 'On Track' : 'Needs Push'}
        </div>
        <span className="text-[11px] text-[#8e9c93]">Projected: {calc.savingsProjected}%</span>
      </div>
    </div>
  );
};

export default SavingsOverview;
