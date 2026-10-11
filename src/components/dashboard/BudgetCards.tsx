import React from 'react';
import {
  Wallet,
  ArrowUpRight,
  TrendingDown,
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Scale,
} from 'lucide-react';
import type { CalculationResult, FinanceState } from '@/types';
import { formatINR } from '@/utils/financeCalculations';

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
      <div className="p-4 rounded-2xl bg-[#131715] border border-[#232b26] hover:border-[#38453e] transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-[#8e9c93]">Month Budget</span>
          <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[#8e9c93]">
            <Wallet className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-white tabular-nums">
          {formatINR(state.budget)}
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#8e9c93]">
          <span>Target</span>
          <span className="text-white font-medium">₹10,000 / 30d</span>
        </div>
      </div>

      {/* 2. Spent */}
      <div className="p-4 rounded-2xl bg-[#131715] border border-[#232b26] hover:border-[#38453e] transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-[#8e9c93]">Spent So Far</span>
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
            <TrendingDown className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-white tabular-nums">
          {formatINR(spent)}
        </div>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] tabular-nums">
          {isPaceOver ? (
            <span className="text-red-400 font-medium">+{formatINR(paceDiff)} vs pace</span>
          ) : (
            <span className="text-emerald-400 font-medium">-{formatINR(paceDiff)} under pace</span>
          )}
        </div>
      </div>

      {/* 3. Remaining */}
      <div className="p-4 rounded-2xl bg-[#131715] border border-[#232b26] hover:border-[#38453e] transition-all duration-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-[#8e9c93]">Remaining</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Scale className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-400 tabular-nums">
          {formatINR(remaining)}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#8e9c93]">
          <span>Locked: {formatINR(state.reserve + committed)}</span>
        </div>
      </div>

      {/* 4. Daily Allowance */}
      <div
        className={`p-4 rounded-2xl bg-[#131715] border transition-all duration-200 ${
          isDailyNegative
            ? 'border-red-900/50 bg-red-950/10'
            : daily < 150
              ? 'border-amber-900/40'
              : 'border-[#232b26] hover:border-emerald-500/40'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-[#8e9c93]">Daily Allowance</span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDailyNegative ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
          </div>
        </div>
        <div
          className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${
            isDailyNegative ? 'text-red-400' : 'text-emerald-400'
          }`}
        >
          {isDailyNegative ? `-₹${Math.abs(Math.round(daily))}` : formatINR(displayDaily)}
          <span className="text-xs font-normal text-[#8e9c93] ml-0.5">/day</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#8e9c93]">
          <span>{daysLeft} days left</span>
          <span className="font-mono text-[10px]">{formatINR(available)} avail</span>
        </div>
      </div>

      {/* 5. Projected End Balance */}
      <div
        className={`p-4 rounded-2xl bg-[#131715] border transition-all duration-200 ${
          projected < 0
            ? 'border-red-900/50 bg-red-950/10'
            : projected < state.reserve
              ? 'border-amber-900/30'
              : 'border-[#232b26]'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-[#8e9c93]">Projected Day 30</span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              projected < 0 ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/10 text-purple-400'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
        <div
          className={`text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${
            projected < 0 ? 'text-red-400' : 'text-purple-400'
          }`}
        >
          {formatINR(projected)}
        </div>
        <div className="mt-1.5 text-[11px] truncate text-[#8e9c93]">
          {projected < 0
            ? 'Deficit by day 30'
            : projected >= state.reserve
              ? 'Safe reserve intact'
              : 'Eats into reserve'}
        </div>
      </div>

      {/* 6. Financial Risk Badge */}
      <div
        className={`p-4 rounded-2xl bg-[#131715] border transition-all duration-200 flex flex-col justify-between ${
          risk === 'High'
            ? 'border-red-900/50 bg-red-950/10'
            : risk === 'Medium'
              ? 'border-amber-900/40 bg-amber-950/10'
              : 'border-emerald-900/30 bg-emerald-950/10'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-[#8e9c93]">Financial Risk</span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              risk === 'High'
                ? 'bg-red-500/20 text-red-400'
                : risk === 'Medium'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
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

        <div>
          <span
            className={`text-xl sm:text-2xl font-bold tracking-tight uppercase ${
              risk === 'High'
                ? 'text-red-400'
                : risk === 'Medium'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
            }`}
          >
            {risk}
          </span>
        </div>

        <div className="mt-1.5 text-[11px] leading-tight text-[#8e9c93]" title={calc.riskReason}>
          {calc.riskReason}
        </div>
      </div>
    </div>
  );
};

export default BudgetCards;
