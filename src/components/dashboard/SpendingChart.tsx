import React, { useMemo, memo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { BalancePoint, ExpenseCategory, FinanceState } from '@/types';
import { formatINR } from '@/utils/financeCalculations';
import { Sparkles, PieChart as PieIcon, LineChart as ChartIcon } from 'lucide-react';

interface SpendingChartProps {
  series: BalancePoint[];
  state: FinanceState;
  hasActiveSim: boolean;
  simAmount: number;
}

const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#2ee6a0',
  Travel: '#38bdf8',
  Shopping: '#f472b6',
  Entertainment: '#a78bfa',
  Bills: '#fb923c',
  Education: '#facc15',
  Health: '#34d399',
  Subscriptions: '#818cf8',
  Emergency: '#f87171',
  Savings: '#c6ff3d',
  Other: '#94a3b8',
};

export const SpendingChart: React.FC<SpendingChartProps> = memo(
  ({ series, state, hasActiveSim, simAmount }) => {
    const categoryData = useMemo(() => {
      const map: Partial<Record<ExpenseCategory, number>> = {};
      (state.expenses || []).forEach((e) => {
        map[e.cat] = (map[e.cat] || 0) + (Number(e.amt) || 0);
      });

      return Object.entries(map)
        .map(([name, value]) => ({
          name: name as ExpenseCategory,
          value: value as number,
          color: CATEGORY_COLORS[name as ExpenseCategory] || '#94a3b8',
        }))
        .sort((a, b) => b.value - a.value);
    }, [state.expenses]);

    const totalSpent = useMemo(() => {
      return categoryData.reduce((sum, item) => sum + item.value, 0);
    }, [categoryData]);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Accessible Table for Screen Readers */}
        <div className="sr-only">
          <h4>30-Day Financial Trajectory Data Table</h4>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Actual Balance</th>
                <th>Projected Balance</th>
                <th>Simulated Balance</th>
              </tr>
            </thead>
            <tbody>
              {series.map((point) => (
                <tr key={point.day}>
                  <td>Day {point.day}</td>
                  <td>{point.actual !== null ? `₹${point.actual}` : 'N/A'}</td>
                  <td>{point.projected !== null ? `₹${point.projected}` : 'N/A'}</td>
                  <td>{point.simulated !== null ? `₹${point.simulated}` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 1. Line Chart: 30-Day Balance Trajectory */}
        <div className="lg:col-span-8 p-5 rounded-2xl bg-[#131715] border border-[#232b26] flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ChartIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    30-Day Balance Trajectory
                  </h3>
                  <p className="text-xs text-[#8e9c93]">
                    Actual spending curve vs projected month-end forecast
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 rounded bg-[#2ee6a0] inline-block" />
                  <span className="text-[#8e9c93]">Actual</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-[#a78bfa] inline-block" />
                  <span className="text-[#8e9c93]">Projected</span>
                </div>
                {hasActiveSim && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300">
                    <Sparkles className="w-3 h-3" />
                    <span className="font-medium">+₹{simAmount} Sim</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={series} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tickFormatter={(val) => `D${val}`}
                  stroke="#4a554e"
                  tick={{ fill: '#84948a', fontSize: 11 }}
                  interval={4}
                />
                <YAxis
                  stroke="#4a554e"
                  tick={{ fill: '#84948a', fontSize: 11 }}
                  tickFormatter={(val) => `₹${val}`}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const dataPoint = payload[0]?.payload as BalancePoint;
                      if (!dataPoint) return null;
                      return (
                        <div className="p-3 rounded-xl bg-[#141816] border border-[#232b26] shadow-xl text-xs space-y-1.5 min-w-[140px]">
                          <div className="font-mono text-[#8e9c93] border-b border-[#232b26] pb-1 font-semibold">
                            Day {label} of 30
                          </div>
                          {dataPoint.actual !== null && (
                            <div className="flex items-center justify-between text-[#2ee6a0]">
                              <span>Actual Balance:</span>
                              <span className="font-bold tabular-nums">
                                {formatINR(dataPoint.actual)}
                              </span>
                            </div>
                          )}
                          {dataPoint.projected !== null && (
                            <div className="flex items-center justify-between text-[#a78bfa]">
                              <span>Projected:</span>
                              <span className="font-bold tabular-nums">
                                {formatINR(dataPoint.projected)}
                              </span>
                            </div>
                          )}
                          {dataPoint.simulated !== null && (
                            <div className="flex items-center justify-between text-[#ffc247]">
                              <span>With Sim:</span>
                              <span className="font-bold tabular-nums">
                                {formatINR(dataPoint.simulated)}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={0} stroke="#ff6b6b" strokeDasharray="2 2" strokeOpacity={0.6} />
                <ReferenceLine
                  y={state.reserve}
                  stroke="#ffc247"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                  label={{
                    value: `Reserve (₹${state.reserve})`,
                    position: 'right',
                    fill: '#ffc247',
                    fontSize: 10,
                    opacity: 0.7,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#2ee6a0"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#2ee6a0' }}
                  activeDot={{ r: 5, fill: '#2ee6a0' }}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls={false}
                />
                {hasActiveSim && (
                  <Line
                    type="monotone"
                    dataKey="simulated"
                    stroke="#ffc247"
                    strokeWidth={2.5}
                    strokeDasharray="3 3"
                    dot={false}
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Doughnut Chart: Expense Breakdown */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#131715] border border-[#232b26] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <PieIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">Expense Mix</h3>
                  <p className="text-xs text-[#8e9c93]">Category distribution</p>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-white">
                {formatINR(totalSpent)}
              </span>
            </div>

            <div className="h-[180px] w-full relative flex items-center justify-center my-1">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0]?.payload;
                          if (!item) return null;
                          const pct =
                            totalSpent > 0 ? ((item.value / totalSpent) * 100).toFixed(1) : '0';
                          return (
                            <div className="p-2.5 rounded-lg bg-[#141816] border border-[#232b26] text-xs">
                              <span className="font-semibold text-white">{item.name}</span>
                              <div className="text-[#8e9c93] mt-0.5">
                                {formatINR(item.value)} ({pct}%)
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-[#8e9c93] text-center">No expenses recorded yet</div>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-mono text-[#8e9c93]">Total</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {formatINR(totalSpent)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mt-2 max-h-[110px] overflow-y-auto pr-1">
            {categoryData.map((cat) => {
              const pct = totalSpent > 0 ? Math.round((cat.value / totalSpent) * 100) : 0;
              return (
                <div
                  key={cat.name}
                  className="flex items-center justify-between text-xs py-1 border-b border-[#1c2420] last:border-none"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-white font-medium">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#8e9c93] font-mono text-[11px]">{pct}%</span>
                    <span className="text-white font-mono tabular-nums">
                      {formatINR(cat.value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
);

SpendingChart.displayName = 'SpendingChart';
export default SpendingChart;
