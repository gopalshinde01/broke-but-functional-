import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  TrendingDown,
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Scale
} from 'lucide-react';
import { CalculationResult, FinanceState } from '../types/finance';
import { formatINR } from '../utils/financeCalculations';

interface BudgetCardsProps {
  state: FinanceState;
  calc: CalculationResult;
  onOpenSimulator?: () => void;
}

export const BudgetCards: React.FC<BudgetCardsProps> = ({ state, calc }) => {
  const {
    spent,
    remaining,
    committed,
    daysLeft,
    available,
    daily,
    displayDaily,
    projected,
    risk,
    pace,
  } = calc;

  const isDailyNegative = daily <= 0;
  const isPaceOver = spent > pace;
  const paceDiff = Math.abs(spent - pace);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
      {/* 1. Total Budget */}
      <div className="p-4 rounded-2xl bg-dark-card border border-dark-border hover:border-dark-muted/40 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-dark-muted">Month Budget</span>
          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-dark-muted group-hover:text-white transition-colors">
            <Wallet className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-white tabular-nums">
          {formatINR(state.budget)}
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-dark-muted">
          <span>Target</span>
          <span className="text-white font-medium">₹10,000 / 30d</span>
        </div>
      </div>

      {/* 2. Spent */}
      <div className="p-4 rounded-2xl bg-dark-card border border-dark-border hover:border-dark-muted/40 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-dark-muted">Spent So Far</span>
          <div className="w-7 h-7 rounded-lg bg-fintech-amber/10 flex items-center justify-center text-fintech-amber">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-white tabular-nums">
          {formatINR(spent)}
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] tabular-nums">
          {isPaceOver ? (
            <span className="text-fintech-red font-medium">+{formatINR(paceDiff)} vs pace</span>
          ) : (
            <span className="text-fintech-emerald font-medium">-{formatINR(paceDiff)} under pace</span>
          )}
        </div>
      </div>

      {/* 3. Remaining */}
      <div className="p-4 rounded-2xl bg-dark-card border border-dark-border hover:border-dark-muted/40 transition-all duration-200 group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-dark-muted">Remaining</span>
          <div className="w-7 h-7 rounded-lg bg-fintech-emerald/10 flex items-center justify-center text-fintech-emerald">
            <Scale className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-fintech-emerald tabular-nums">
          {formatINR(remaining)}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-dark-muted">
          <span>Locked: {formatINR(state.reserve + committed)}</span>
        </div>
      </div>

      {/* 4. Daily Allowance */}
      <div
        className={`p-4 rounded-2xl bg-dark-card border transition-all duration-200 group ${
          isDailyNegative
            ? 'border-fintech-red/50 shadow-glow-red bg-fintech-red/5'
            : daily < 150
            ? 'border-fintech-amber/40 shadow-glow-amber'
            : 'border-dark-border hover:border-fintech-lime/40'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-dark-muted">Daily Allowance</span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDailyNegative
                ? 'bg-fintech-red/20 text-fintech-red'
                : 'bg-fintech-lime/10 text-fintech-lime'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
          </div>
        </div>
        <div
          className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${
            isDailyNegative ? 'text-fintech-red' : 'text-fintech-lime'
          }`}
        >
          {isDailyNegative ? `-₹${Math.abs(Math.round(daily))}` : formatINR(displayDaily)}
          <span className="text-xs font-normal text-dark-muted ml-0.5">/day</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-dark-muted">
          <span>{daysLeft} days left</span>
          <span className="font-mono text-[10px]">{formatINR(available)} avail</span>
        </div>
      </div>

      {/* 5. Projected End Balance */}
      <div
        className={`p-4 rounded-2xl bg-dark-card border transition-all duration-200 group ${
          projected < 0
            ? 'border-fintech-red/50 bg-fintech-red/5'
            : projected < state.reserve
            ? 'border-fintech-amber/30'
            : 'border-dark-border'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-dark-muted">Projected Day 30</span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              projected < 0
                ? 'bg-fintech-red/20 text-fintech-red'
                : 'bg-fintech-violet/10 text-fintech-violet'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
        <div
          className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${
            projected < 0 ? 'text-fintech-red' : 'text-fintech-violet'
          }`}
        >
          {formatINR(projected)}
        </div>
        <div className="mt-1.5 text-[11px] truncate text-dark-muted">
          {projected < 0
            ? `Deficit by day 30`
            : projected >= state.reserve
            ? 'Safe reserve intact'
            : 'Eats into reserve'}
        </div>
      </div>

      {/* 6. Financial Risk Badge */}
      <div
        className={`p-4 rounded-2xl bg-dark-card border transition-all duration-200 flex flex-col justify-between ${
          risk === 'High'
            ? 'border-fintech-red/50 bg-fintech-red/5 shadow-glow-red'
            : risk === 'Medium'
            ? 'border-fintech-amber/40 bg-fintech-amber/5'
            : 'border-fintech-emerald/30 bg-fintech-emerald/5'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-dark-muted">Financial Risk</span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              risk === 'High'
                ? 'bg-fintech-red/20 text-fintech-red'
                : risk === 'Medium'
                ? 'bg-fintech-amber/20 text-fintech-amber'
                : 'bg-fintech-emerald/20 text-fintech-emerald'
            }`}
          >
            {risk === 'High' ? (
              <AlertOctagon className="w-3.5 h-3.5" />
            ) : risk === 'Medium' ? (
              <ShieldAlert className="w-3.5 h-3.5" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xl sm:text-2xl font-bold tracking-tight uppercase ${
              risk === 'High'
                ? 'text-fintech-red'
                : risk === 'Medium'
                ? 'text-fintech-amber'
                : 'text-fintech-emerald'
            }`}
          >
            {risk}
          </span>
        </div>

        <div className="mt-1.5 text-[11px] leading-tight text-dark-muted" title={calc.riskReason}>
          {calc.riskReason}
        </div>
      </div>
    </div>
  );
};
