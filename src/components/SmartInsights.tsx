import React, { useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Repeat,
  Target,
  Sliders,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  Sparkles
} from 'lucide-react';
import { FinanceState, CalculationResult } from '../types/finance';
import { formatINR } from '../utils/financeCalculations';

interface SmartInsightsProps {
  state: FinanceState;
  calc: CalculationResult;
  onUpdateSettings: (settings: Partial<Pick<FinanceState, 'budget' | 'reserve' | 'day' | 'income'>>) => void;
  onLoadDemoMonth: () => void;
  onResetToBlank: () => void;
}

export const SmartInsights: React.FC<SmartInsightsProps> = ({
  state,
  calc,
  onUpdateSettings,
  onLoadDemoMonth,
  onResetToBlank,
}) => {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Settings local state
  const [dayVal, setDayVal] = useState(state.day);
  const [budgetVal, setBudgetVal] = useState(state.budget);
  const [reserveVal, setReserveVal] = useState(state.reserve);
  const [incomeVal, setIncomeVal] = useState(state.income);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  const {
    spent,
    remaining,
    committed,
    daysLeft,
    projected,
    pace,
    totalNeed,
  } = calc;

  // 1. Pacing & Shortfall rule
  const isShortfall = projected < 0;
  const shortfallAmt = Math.abs(projected);
  const dailyTrimNeeded = daysLeft > 0 ? Math.ceil(shortfallAmt / daysLeft) : 0;

  // 2. Reserve Breached rule
  const isReserveBreached = remaining - committed < state.reserve;

  // 3. Top category rule (> 40%)
  const categorySpending = React.useMemo(() => {
    const map: Record<string, number> = {};
    (state.expenses || []).forEach((e) => {
      map[e.cat] = (map[e.cat] || 0) + (Number(e.amt) || 0);
    });
    const entries = Object.entries(map).map(([name, amt]) => ({ name, amt }));
    entries.sort((a, b) => b.amt - a.amt);
    return entries;
  }, [state.expenses]);

  const topCategory = categorySpending[0];
  const topCategoryPct =
    spent > 0 && topCategory ? Math.round((topCategory.amt / spent) * 100) : 0;
  const isTopCategoryHeavy = topCategoryPct > 40;

  // 4. Subscriptions rule
  const activeSubsMonthly = (state.subs || [])
    .filter((s) => s.active)
    .reduce((sum, s) => sum + (Number(s.amt) || 0), 0);
  const activeSubsAnnual = activeSubsMonthly * 12;

  // 5. Goal status
  const goalDailyNeeded = daysLeft > 0 ? Math.ceil(totalNeed / daysLeft) : 0;
  const primaryGoal = state.goals && state.goals.length > 0 ? state.goals[0] : null;

  // 6. Spent vs Pace rule
  const isAheadOfPace = spent > pace;
  const paceGap = Math.abs(Math.round(spent - pace));

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      day: Number(dayVal),
      budget: Number(budgetVal),
      reserve: Number(reserveVal),
      income: Number(incomeVal),
    });
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Rule-Based Smart Insights Section */}
      <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-fintech-amber/15 border border-fintech-amber/30 flex items-center justify-center text-fintech-amber">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Deterministic Financial Intelligence
            </h2>
            <p className="text-xs text-dark-muted">
              Mathematical insights derived directly from your spending patterns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Insight 1: Projected Runway / Shortfall */}
          <div
            className={`p-4 rounded-xl border flex gap-3 ${
              isShortfall
                ? 'bg-fintech-red/10 border-fintech-red/30'
                : 'bg-fintech-emerald/10 border-fintech-emerald/30'
            }`}
          >
            {isShortfall ? (
              <AlertTriangle className="w-5 h-5 text-fintech-red shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-fintech-emerald shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                {isShortfall ? 'Runway Warning' : 'Runway Pacing Healthy'}
              </h4>
              <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                {isShortfall ? (
                  <>
                    At this pace you could be{' '}
                    <span className="font-bold text-fintech-red">
                      {formatINR(shortfallAmt)}
                    </span>{' '}
                    short by day 30. Trimming{' '}
                    <span className="font-bold text-white">
                      {formatINR(dailyTrimNeeded)}/day
                    </span>{' '}
                    of non-essential spending would close the gap.
                  </>
                ) : (
                  <>
                    You are pacing well! At your current burn rate, you are projected to reach Day 30 with a healthy{' '}
                    <span className="font-bold text-fintech-emerald">
                      {formatINR(projected)}
                    </span>{' '}
                    surplus.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Insight 2: Emergency Reserve Status */}
          <div
            className={`p-4 rounded-xl border flex gap-3 ${
              isReserveBreached
                ? 'bg-fintech-amber/10 border-fintech-amber/30'
                : 'bg-dark-input border-dark-borderSubtle'
            }`}
          >
            {isReserveBreached ? (
              <ShieldAlert className="w-5 h-5 text-fintech-amber shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-fintech-emerald shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                Emergency Reserve Status
              </h4>
              <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                {isReserveBreached ? (
                  <>
                    Uncommitted cash ({formatINR(remaining - committed)}) is below your mandatory emergency reserve ({formatINR(state.reserve)}). Avoid non-essential expenses to restore safety.
                  </>
                ) : (
                  <>
                    Your {formatINR(state.reserve)} emergency cushion remains fully locked and untouched. You have sufficient liquidity.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Insight 3: Category Dominance (> 40%) */}
          <div className="p-4 rounded-xl bg-dark-input border border-dark-borderSubtle flex gap-3">
            <TrendingDown className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                Category Concentration
              </h4>
              <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                {isTopCategoryHeavy && topCategory ? (
                  <>
                    <span className="font-semibold text-white">{topCategory.name}</span> accounts for{' '}
                    <span className="font-bold text-fintech-amber">{topCategoryPct}%</span> of all spending ({formatINR(topCategory.amt)}). Trimming this specific bucket will yield the greatest runway relief.
                  </>
                ) : (
                  <>
                    Your spending is relatively diversified across categories with no single area exceeding 40% of total outlay.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Insight 4: Subscriptions Drain */}
          <div className="p-4 rounded-xl bg-dark-input border border-dark-borderSubtle flex gap-3">
            <Repeat className="w-5 h-5 text-fintech-violet shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                Recurring Commitments
              </h4>
              <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                You have{' '}
                <span className="font-bold text-white">
                  {formatINR(activeSubsMonthly)}/month
                </span>{' '}
                committed to recurring subscriptions, totaling{' '}
                <span className="font-bold text-fintech-amber">
                  {formatINR(activeSubsAnnual)} per year
                </span>
                . Pausing any inactive sub adds straight to your daily allowance.
              </p>
            </div>
          </div>

          {/* Insight 5: Savings Goal Progress */}
          <div className="p-4 rounded-xl bg-dark-input border border-dark-borderSubtle flex gap-3">
            <Target className="w-5 h-5 text-fintech-lime shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                Savings Target Roadmap
              </h4>
              <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                {totalNeed > 0 ? (
                  <>
                    <span className="font-bold text-white">{formatINR(totalNeed)}</span> remaining across your {state.goals?.length || 0} savings target(s). You need to save approximately{' '}
                    <span className="font-bold text-fintech-lime">
                      {formatINR(goalDailyNeeded)}/day
                    </span>{' '}
                    over the remaining {daysLeft} days to reach full completion.
                  </>
                ) : (
                  <>
                    Congratulations! All your active savings goals have been 100% achieved!
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Insight 6: Spending Pace vs Month Day */}
          <div className="p-4 rounded-xl bg-dark-input border border-dark-borderSubtle flex gap-3">
            <Calendar className="w-5 h-5 text-fintech-emerald shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
                Pacing Velocity
              </h4>
              <p className="text-xs text-dark-muted mt-1 leading-relaxed">
                {isAheadOfPace ? (
                  <>
                    You're{' '}
                    <span className="font-bold text-fintech-red">
                      {formatINR(paceGap)}
                    </span>{' '}
                    ahead of an even spending pace (benchmark: {formatINR(pace)}). Slow down over the next few days to normalize.
                  </>
                ) : (
                  <>
                    You're{' '}
                    <span className="font-bold text-fintech-emerald">
                      {formatINR(paceGap)}
                    </span>{' '}
                    under an even spending pace. Outstanding discipline!
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Settings & Simulation Controls */}
      <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Settings & Month Parameters
            </h2>
            <p className="text-xs text-dark-muted">
              Configure cycle budget, emergency cushion floor, and day completed
            </p>
          </div>
        </div>

        {settingsSavedToast && (
          <div className="p-3 rounded-xl bg-fintech-emerald/15 border border-fintech-emerald/30 text-fintech-emerald text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Day completed (0 to 29) */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
                Day Completed ({dayVal} of 30)
              </label>
              <input
                type="range"
                min="0"
                max="29"
                value={dayVal}
                onChange={(e) => setDayVal(Number(e.target.value))}
                className="w-full cursor-pointer mt-2"
              />
              <span className="text-[10px] text-dark-muted block mt-1 font-mono">
                {30 - dayVal} days remaining in cycle
              </span>
            </div>

            {/* Total Budget */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
                Monthly Budget (₹)
              </label>
              <input
                type="number"
                min="1000"
                step="500"
                value={budgetVal}
                onChange={(e) => setBudgetVal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-dark-input border border-dark-border text-white text-xs font-mono focus:outline-none focus:border-fintech-lime"
              />
            </div>

            {/* Emergency Reserve */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
                Emergency Reserve (₹)
              </label>
              <input
                type="number"
                min="0"
                step="250"
                value={reserveVal}
                onChange={(e) => setReserveVal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-dark-input border border-dark-border text-white text-xs font-mono focus:outline-none focus:border-fintech-lime"
              />
            </div>

            {/* Additional Income */}
            <div>
              <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
                Additional Income (₹)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={incomeVal}
                onChange={(e) => setIncomeVal(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-dark-input border border-dark-border text-white text-xs font-mono focus:outline-none focus:border-fintech-lime"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-dark-borderSubtle">
            <button
              type="submit"
              className="py-2 px-5 rounded-xl bg-fintech-lime hover:bg-[#d6ff66] text-black font-semibold text-xs transition-all shadow-glow-lime"
            >
              Apply Settings
            </button>

            {/* Action buttons: Load Demo Month & Reset */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onLoadDemoMonth();
                  setDayVal(10);
                  setBudgetVal(10000);
                  setReserveVal(1500);
                  setIncomeVal(0);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-fintech-amber/15 hover:bg-fintech-amber/25 text-fintech-amber border border-fintech-amber/30 text-xs font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Demo Month</span>
              </button>

              {resetConfirmOpen ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-fintech-red">Reset all data?</span>
                  <button
                    type="button"
                    onClick={() => {
                      onResetToBlank();
                      setResetConfirmOpen(false);
                      setDayVal(1);
                      setBudgetVal(10000);
                      setReserveVal(1500);
                      setIncomeVal(0);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-fintech-red text-black font-bold text-xs"
                  >
                    Confirm Blank Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetConfirmOpen(false)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 text-dark-muted hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  id="reset-demo-data-btn"
                  onClick={() => setResetConfirmOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-dark-muted hover:text-white text-xs font-medium transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset to Blank Month</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
