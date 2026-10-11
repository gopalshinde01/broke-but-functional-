import React from 'react';
import { Sparkles, RotateCcw, Plus, Minus, FileSpreadsheet, Flame } from 'lucide-react';
import type { FinanceState, CalculationResult } from '@/types';
import { formatINR } from '@/utils/financeCalculations';
import { Button } from '@/components/ui';

interface DashboardHeaderProps {
  state: FinanceState;
  calc: CalculationResult;
  hasActiveSim: boolean;
  simAmount: number;
  survivalStreak?: number;
  onUpdateDay: (day: number) => void;
  onResetToBlank: () => void;
  onLoadDemoMonth: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  state,
  calc,
  hasActiveSim,
  simAmount,
  survivalStreak = 0,
  onUpdateDay,
  onResetToBlank,
  onLoadDemoMonth,
}) => {
  const daysLeft = calc.daysLeft;
  const isBlankMonth = (state.expenses || []).length === 0;

  return (
    <div className="space-y-3">
      {/* Friendly Banner if Month is Blank */}
      {isBlankMonth && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/20 via-emerald-950/15 to-transparent border border-amber-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Fresh 30-Day Cycle Ready (₹10,000 Budget)
              </div>
              <div className="text-[11px] text-[#8e9c93]">
                Start fresh with zero expenses, or load the pre-configured Day 10 demo month to
                explore shortfall warnings and emergency shock tests.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onLoadDemoMonth}
            className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs transition-all shadow-sm whitespace-nowrap flex items-center gap-1.5 shrink-0 focus:outline-none focus:ring-2 focus:ring-amber-300"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Load Demo Month</span>
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#232b26]">
        {/* Title & Tagline */}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Broke But Functional</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Survive the Month
            </span>
            {survivalStreak > 0 && (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/60"
                title={`${survivalStreak} consecutive days spent under daily allowance`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{survivalStreak}d Streak</span>
              </span>
            )}
          </div>
          <p className="text-xs text-[#8e9c93] mt-1 flex items-center gap-2">
            <span>30 days. ₹10,000. Make every rupee count.</span>
            <span className="text-[#8e9c93]/40">•</span>
            <span className="text-[#8e9c93]/80">Student & Gen Z Financial Survival Engine</span>
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {hasActiveSim && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 text-amber-300 border border-amber-800/60 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulating +{formatINR(simAmount)}</span>
            </div>
          )}

          {/* Quick Demo Month Button if not already blank */}
          {!isBlankMonth && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadDemoMonth}
              title="Reload the pre-set demo month scenario"
              className="h-8 text-xs font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 mr-1" />
              <span>Demo Month</span>
            </Button>
          )}

          {/* Day Stepper */}
          <div className="flex items-center rounded-xl bg-[#131715] border border-[#232b26] p-1 text-xs">
            <button
              type="button"
              onClick={() => onUpdateDay(Math.max(0, state.day - 1))}
              disabled={state.day <= 0}
              className="p-1 rounded text-[#8e9c93] hover:text-white disabled:opacity-30 disabled:hover:text-[#8e9c93] transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="px-2.5 font-mono text-center">
              <span className="font-bold text-white tabular-nums">Day {state.day}</span>
              <span className="text-[10px] text-[#8e9c93] block -mt-0.5">{daysLeft}d left</span>
            </div>

            <button
              type="button"
              onClick={() => onUpdateDay(Math.min(29, state.day + 1))}
              disabled={state.day >= 29}
              className="p-1 rounded text-[#8e9c93] hover:text-white disabled:opacity-30 disabled:hover:text-[#8e9c93] transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400"
              title="Next Day"
              aria-label="Next Day"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset to Blank Month */}
          <button
            type="button"
            onClick={onResetToBlank}
            title="Reset to blank month"
            className="p-2 rounded-xl bg-[#131715] border border-[#232b26] text-[#8e9c93] hover:text-white hover:border-[#38453e] transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
            aria-label="Reset to blank month"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>
    </div>
  );
};

export default DashboardHeader;
