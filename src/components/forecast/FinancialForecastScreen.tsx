import React, { useMemo } from 'react';
import {
  TrendingUp,
  Calendar,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import type { FinanceState, CalculationResult, BalancePoint } from '@/types';
import { formatINR } from '@/utils/financeCalculations';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';

interface FinancialForecastScreenProps {
  state: FinanceState;
  calc: CalculationResult;
  chartSeries: BalancePoint[];
}

export const FinancialForecastScreen: React.FC<FinancialForecastScreenProps> = ({
  state,
  calc,
  chartSeries,
}) => {
  const { remaining, committed, projected, daysLeft, daily, displayDaily, risk } = calc;

  // Day-by-day deterministic forecast schedule
  const forecastSchedule = useMemo(() => {
    const list: Array<{
      day: number;
      label: string;
      expectedBalance: number;
      status: 'actual' | 'safe' | 'low' | 'danger';
    }> = [];

    let running = remaining;
    for (let d = state.day + 1; d <= 30; d++) {
      running = Math.max(-5000, running - daily);
      list.push({
        day: d,
        label: `Day ${d}`,
        expectedBalance: Math.round(running),
        status:
          running > state.reserve
            ? 'safe'
            : running >= 0
              ? 'low'
              : 'danger',
      });
    }
    return list;
  }, [state.day, state.reserve, remaining, daily]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#131715] border border-[#232b26]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  30-Day Monthly Financial Forecast
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-purple-950/60 text-purple-300 border border-purple-800/60">
                  Deterministic Model
                </span>
              </div>
              <p className="text-xs text-[#8e9c93]">
                Explainable mathematical projection of your ₹10,000 budget from Day {state.day} through Day 30
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#8e9c93] bg-[#0d100e] px-3 py-1.5 rounded-xl border border-[#1f2621]">
            <Calendar className="w-3.5 h-3.5 text-purple-400" />
            <span>{daysLeft} days remaining in cycle</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Forecast Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#131715] border border-[#232b26]">
          <span className="text-[11px] font-mono uppercase text-[#8e9c93] block mb-1">
            Current Position
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
            {formatINR(remaining)}
          </div>
          <span className="text-[11px] text-[#8e9c93] mt-1 block">
            Actual balance on Day {state.day}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131715] border border-[#232b26]">
          <span className="text-[11px] font-mono uppercase text-[#8e9c93] block mb-1">
            Upcoming Commitments
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-blue-400">
            {formatINR(committed)}
          </div>
          <span className="text-[11px] text-[#8e9c93] mt-1 block">
            Auto-deducted subscriptions
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#131715] border border-[#232b26]">
          <span className="text-[11px] font-mono uppercase text-[#8e9c93] block mb-1">
            Paced Daily Spend
          </span>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white">
            {formatINR(displayDaily)}/day
          </div>
          <span className="text-[11px] text-[#8e9c93] mt-1 block">
            Allowed burn rate
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl bg-[#131715] border ${
            projected < 0
              ? 'border-red-900/50 bg-red-950/10'
              : projected < state.reserve
                ? 'border-amber-900/30'
                : 'border-[#232b26]'
          }`}
        >
          <span className="text-[11px] font-mono uppercase text-[#8e9c93] block mb-1">
            Predicted Day 30 Balance
          </span>
          <div
            className={`text-xl sm:text-2xl font-bold font-mono ${
              projected < 0 ? 'text-red-400' : 'text-purple-400'
            }`}
          >
            {formatINR(projected)}
          </div>
          <span className="text-[11px] text-[#8e9c93] mt-1 block truncate">
            {projected < 0
              ? 'Projected deficit'
              : projected >= state.reserve
                ? 'Safe reserve intact'
                : 'Eats into reserve'}
          </span>
        </div>
      </div>

      {/* Main Forecast Line Chart */}
      <div className="p-6 rounded-2xl bg-[#131715] border border-[#232b26] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              30-Day Balance Trajectory & Forecast Corridor
            </h3>
            <p className="text-xs text-[#8e9c93]">
              Solid line represents recorded ledger balance; dashed line represents deterministic forecast
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
              Actual Past
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 inline-block" />
              Forecast Future
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-0.5 bg-amber-400 inline-block" />
              Safe Reserve (₹{state.reserve})
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#1c2420" strokeDasharray="3 3" />
              <XAxis dataKey="dayLabel" stroke="#5a6860" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#5a6860"
                fontSize={11}
                tickFormatter={(v) => `₹${v}`}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length || !payload[0]?.payload) return null;
                  const data = payload[0].payload as BalancePoint;
                  return (
                    <div className="p-3 bg-[#0d100e] border border-[#232b26] rounded-xl text-xs font-mono shadow-xl space-y-1">
                      <div className="text-white font-bold">{data.dayLabel}</div>
                      {data.actual !== null && (
                        <div className="text-emerald-400">Actual: {formatINR(data.actual)}</div>
                      )}
                      {data.projected !== null && (
                        <div className="text-purple-400">Forecast: {formatINR(data.projected)}</div>
                      )}
                    </div>
                  );
                }}
              />
              <ReferenceLine y={state.reserve} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth={1.5} />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#2ee6a0"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2ee6a0' }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="projected"
                stroke="#a855f7"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 2, fill: '#a855f7' }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecasting Methodology & Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Scale className="w-4 h-4 text-purple-400" />
            <span>Deterministic Forecast Model</span>
          </div>
          <p className="text-xs text-[#8e9c93] leading-relaxed">
            The projection engine is completely deterministic and strictly follows double-entry budgeting rules. Unlike random simulations, it projects forward using your calibrated burn rate and verified upcoming commitments:
          </p>
          <div className="p-3 rounded-xl bg-[#0e1210] border border-[#1f2621] text-xs font-mono text-purple-300 space-y-1">
            <div>Projected Balance = Actual Balance - Future Commitments - (RunRate × DaysLeft)</div>
            <div className="text-[#8e9c93] text-[10px] mt-1">
              Current: {formatINR(remaining)} - {formatINR(committed)} - ({formatINR(displayDaily)} × {daysLeft}d) = <strong>{formatINR(projected)}</strong>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Risk Status & Reserve Protection</span>
          </div>
          <p className="text-xs text-[#8e9c93] leading-relaxed">
            Your emergency reserve of <strong>{formatINR(state.reserve)}</strong> is locked from everyday spending. The forecast engine flags any outcome where Day 30 balance threatens to breach this reserve threshold.
          </p>
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0e1210] border border-[#1f2621] text-xs">
            <span className="text-[#8e9c93]">Assigned Risk Tier:</span>
            <span
              className={`font-mono font-bold uppercase ${
                risk === 'High' ? 'text-red-400' : risk === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {risk} Risk
            </span>
          </div>
        </div>
      </div>

      {/* Day by Day Forecast Timeline Table */}
      <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Upcoming Daily Trajectory (Day {state.day + 1} to 30)
          </h3>
          <span className="text-xs text-[#8e9c93] font-mono">
            Estimated daily burn: -{formatINR(daily)}/d
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#232b26]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#232b26] bg-[#0e1210] font-mono uppercase text-[11px] text-[#8e9c93]">
                <th className="py-2.5 px-3">Timeline</th>
                <th className="py-2.5 px-3">Projected End-of-Day Balance</th>
                <th className="py-2.5 px-3">Safety Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2521]">
              {forecastSchedule.map((row) => (
                <tr key={row.day} className="hover:bg-[#161d19]">
                  <td className="py-2.5 px-3 font-mono text-white">{row.label}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-white">
                    {formatINR(row.expectedBalance)}
                  </td>
                  <td className="py-2.5 px-3">
                    {row.status === 'safe' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                        Safe Reserve Intact
                      </span>
                    )}
                    {row.status === 'low' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/60">
                        Dipping into Reserve
                      </span>
                    )}
                    {row.status === 'danger' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950/60 text-red-300 border border-red-800/60">
                        Projected Deficit
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialForecastScreen;
