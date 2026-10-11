import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Repeat,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import type { FinanceState, CalculationResult } from '@/types';

interface InsightsRulesCardsProps {
  state: FinanceState;
  calc: CalculationResult;
}

export const InsightsRulesCards: React.FC<InsightsRulesCardsProps> = ({ state, calc }) => {
  const { spent, remaining, committed, daysLeft, projected, totalNeed } = calc;

  const isShortfall = projected < 0;
  const shortfallAmt = Math.abs(projected);
  const dailyTrimNeeded = daysLeft > 0 ? Math.ceil(shortfallAmt / daysLeft) : 0;
  const isReserveBreached = remaining - committed < state.reserve;

  const categorySpending = React.useMemo(() => {
    const map: Record<string, number> = {};
    (state.expenses || []).forEach((e) => {
      map[e.cat] = (map[e.cat] || 0) + (Number(e.amt) || 0);
    });
    return Object.entries(map)
      .map(([name, amt]) => ({ name, amt }))
      .sort((a, b) => b.amt - a.amt);
  }, [state.expenses]);

  const topCategory = categorySpending[0];
  const topCategoryPct = spent > 0 && topCategory ? Math.round((topCategory.amt / spent) * 100) : 0;
  const isTopCategoryHeavy = topCategoryPct > 40;

  const activeSubsMonthly = (state.subs || [])
    .filter((s) => s.active)
    .reduce((sum, s) => sum + (Number(s.amt) || 0), 0);

  const goalDailyNeeded = daysLeft > 0 ? Math.ceil(totalNeed / daysLeft) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
      {/* 1. Runway */}
      <div
        className={`p-4 rounded-xl border flex gap-3 ${
          isShortfall
            ? 'bg-red-950/20 border-red-900/40'
            : 'bg-emerald-950/20 border-emerald-900/40'
        }`}
      >
        {isShortfall ? (
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
            {isShortfall ? 'Runway Warning' : 'Runway Pacing Healthy'}
          </h4>
          <p className="text-xs text-[#8e9c93] mt-1 leading-relaxed">
            {isShortfall
              ? `Current spending pace projects a ₹${shortfallAmt} deficit by day 30. Trim ₹${dailyTrimNeeded}/day to stay solvent.`
              : `At your current pace, you will finish Day 30 with a healthy ₹${projected} surplus.`}
          </p>
        </div>
      </div>

      {/* 2. Emergency Reserve Health */}
      <div
        className={`p-4 rounded-xl border flex gap-3 ${
          isReserveBreached
            ? 'bg-amber-950/20 border-amber-900/40'
            : 'bg-[#151b17] border-[#253229]'
        }`}
      >
        {isReserveBreached ? (
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div>
          <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
            {isReserveBreached ? 'Reserve Buffer Breached' : 'Reserve Cushion Intact'}
          </h4>
          <p className="text-xs text-[#8e9c93] mt-1 leading-relaxed">
            {isReserveBreached
              ? `You have eaten into your ₹${state.reserve} safety buffer. Discretionary spending should be frozen.`
              : `Your full ₹${state.reserve} safety cushion remains 100% untouched for genuine emergencies.`}
          </p>
        </div>
      </div>

      {/* 3. Category Concentration */}
      <div className="p-4 rounded-xl bg-[#151b17] border border-[#253229] flex gap-3">
        <TrendingDown className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
            Category Concentration
          </h4>
          <p className="text-xs text-[#8e9c93] mt-1 leading-relaxed">
            {topCategory
              ? `${topCategory.name} accounts for ${topCategoryPct}% of all spending (₹${topCategory.amt}). ${
                  isTopCategoryHeavy ? 'High concentration risk.' : 'Well-diversified.'
                }`
              : 'No expense concentration recorded.'}
          </p>
        </div>
      </div>

      {/* 4. Subscriptions & Goal Traction */}
      <div className="p-4 rounded-xl bg-[#151b17] border border-[#253229] flex gap-3">
        <Repeat className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wide">
            Recurring & Goals Traction
          </h4>
          <p className="text-xs text-[#8e9c93] mt-1 leading-relaxed">
            {activeSubsMonthly > 0
              ? `Active subscriptions lock ₹${activeSubsMonthly}/month. Set aside ₹${goalDailyNeeded}/day to reach active savings targets.`
              : `Zero recurring subscriptions locking your daily cash runway. Great discipline!`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsightsRulesCards;
