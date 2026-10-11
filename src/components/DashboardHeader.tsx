import React from 'react';
import {
  Calendar,
  Sparkles,
  RotateCcw,
  Plus,
  Minus,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { FinanceState, CalculationResult } from '../types/finance';
import { formatINR } from '../utils/financeCalculations';

interface DashboardHeaderProps {
  state: FinanceState;
  calc: CalculationResult;
  hasActiveSim: boolean;
  simAmount: number;
  onUpdateDay: (day: number) => void;
  onResetToBlank: () => void;
  onLoadDemoMonth: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  state,
  calc,
  hasActiveSim,
  simAmount,
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
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-fintech-amber/15 via-fintech-lime/10 to-transparent border border-fintech-amber/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-glow-amber">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-fintech-amber/20 flex items-center justify-center text-fintech-amber shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                Fresh 30-Day Cycle Ready (₹10,000 Budget)
              </div>
              <div className="text-[11px] text-dark-muted">
                Start fresh with zero expenses, or load the pre-configured Day 10 demo month to explore shortfall warnings and emergency shock tests.
              </div>
            </div>
          </div>
          <button
            onClick={onLoadDemoMonth}
            className="px-3.5 py-1.5 rounded-xl bg-fintech-amber hover:bg-[#ffd166] text-black font-semibold text-xs transition-all shadow-glow-amber whitespace-nowrap flex items-center gap-1.5 shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Load Demo Month</span>
          </button>
        </div>
      )}

      {/* Main Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-dark-borderSubtle">
        {/* Title & Tagline */}
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Broke But Functional</span>
            </h1>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-fintech-lime/15 text-fintech-lime border border-fintech-lime/30">
              Survive the Month
            </span>
          </div>
          <p className="text-xs text-dark-muted mt-1 flex items-center gap-2">
            <span>30 days. ₹10,000. Make every rupee count.</span>
            <span className="text-dark-muted/40">•</span>
            <span className="text-dark-muted/80">Student & Gen Z Financial Survival Engine</span>
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          {hasActiveSim && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-fintech-amber/15 text-fintech-amber border border-fintech-amber/30 text-xs font-semibold animate-pulse-subtle">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulating +{formatINR(simAmount)}</span>
            </div>
          )}

          {/* Quick Demo Month Button if not already blank */}
          {!isBlankMonth && (
            <button
              onClick={onLoadDemoMonth}
              title="Reload the pre-set demo month scenario"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-dark-card border border-dark-border text-dark-muted hover:text-fintech-amber hover:border-fintech-amber/40 text-xs font-medium transition-colors"
            >
              <Sparkles className="w-3 h-3 text-fintech-amber" />
              <span>Demo Month</span>
            </button>
          )}

          {/* Day Stepper */}
          <div className="flex items-center rounded-xl bg-dark-card border border-dark-border p-1 text-xs">
            <button
              onClick={() => onUpdateDay(Math.max(0, state.day - 1))}
              disabled={state.day <= 0}
              className="p-1 rounded text-dark-muted hover:text-white disabled:opacity-30 disabled:hover:text-dark-muted transition-colors"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <div className="px-2.5 font-mono text-center">
              <span className="font-bold text-white tabular-nums">Day {state.day}</span>
              <span className="text-[10px] text-dark-muted block -mt-0.5">
                {daysLeft}d left
              </span>
            </div>

            <button
              onClick={() => onUpdateDay(Math.min(29, state.day + 1))}
              disabled={state.day >= 29}
              className="p-1 rounded text-dark-muted hover:text-white disabled:opacity-30 disabled:hover:text-dark-muted transition-colors"
              title="Next Day"
              aria-label="Next Day"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset to Blank Month */}
          <button
            onClick={onResetToBlank}
            title="Reset to blank month"
            className="p-2 rounded-xl bg-dark-card border border-dark-border text-dark-muted hover:text-white hover:border-dark-muted/40 transition-colors"
            aria-label="Reset to blank"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>
    </div>
  );
};
