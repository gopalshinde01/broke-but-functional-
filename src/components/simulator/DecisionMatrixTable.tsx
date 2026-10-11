import React from 'react';
import type { CalculationResult, FinanceState } from '@/types';
import { formatINR } from '@/utils/financeCalculations';

interface DecisionMatrixTableProps {
  state: FinanceState;
  baseCalc: CalculationResult;
  simCalc: CalculationResult;
  simAmount: number;
}

export const DecisionMatrixTable: React.FC<DecisionMatrixTableProps> = ({
  state,
  baseCalc,
  simCalc,
  simAmount,
}) => {
  const isSimActive = simAmount > 0;

  return (
    <div className="overflow-x-auto rounded-xl border border-[#232b26]">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="border-b border-[#232b26] bg-[#0e1210] font-mono uppercase text-[11px] text-[#8e9c93]">
            <th className="py-3 px-4">Financial Metric</th>
            <th className="py-3 px-4">Current Reality (Before)</th>
            <th className="py-3 px-4">With Purchase (After)</th>
            <th className="py-3 px-4 text-right">Net Consequence</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e2521]">
          {/* 1. Remaining Balance */}
          <tr className="hover:bg-[#161d19]">
            <td className="py-3 px-4 font-medium text-white">Remaining Balance</td>
            <td className="py-3 px-4 font-mono font-semibold text-white">
              {formatINR(baseCalc.remaining)}
            </td>
            <td className="py-3 px-4 font-mono font-semibold text-white">
              {formatINR(simCalc.remaining)}
            </td>
            <td className="py-3 px-4 text-right font-mono font-bold text-red-400">
              {isSimActive ? `-${formatINR(simAmount)}` : '₹0'}
            </td>
          </tr>

          {/* 2. Daily Allowance */}
          <tr className="hover:bg-[#161d19]">
            <td className="py-3 px-4 font-medium text-white">Daily Allowance</td>
            <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
              {formatINR(baseCalc.displayDaily)}/d
            </td>
            <td
              className={`py-3 px-4 font-mono font-semibold ${
                simCalc.daily <= 0 ? 'text-red-400' : 'text-amber-400'
              }`}
            >
              {simCalc.daily <= 0
                ? `-₹${Math.abs(Math.round(simCalc.daily))}/d`
                : `${formatINR(simCalc.displayDaily)}/d`}
            </td>
            <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
              {isSimActive
                ? `-${formatINR(Math.max(0, baseCalc.displayDaily - simCalc.displayDaily))}/day`
                : '₹0'}
            </td>
          </tr>

          {/* 3. Emergency Reserve Intact */}
          <tr className="hover:bg-[#161d19]">
            <td className="py-3 px-4 font-medium text-white">Emergency Reserve Intact</td>
            <td className="py-3 px-4 font-mono font-semibold text-white">
              {formatINR(baseCalc.reserveIntact)} / {formatINR(state.reserve)}
            </td>
            <td className="py-3 px-4 font-mono font-semibold text-white">
              <span
                className={
                  simCalc.reserveIntact < state.reserve
                    ? 'text-red-400 font-bold'
                    : 'text-emerald-400'
                }
              >
                {formatINR(simCalc.reserveIntact)} / {formatINR(state.reserve)}
              </span>
            </td>
            <td className="py-3 px-4 text-right font-mono text-[#8e9c93]">
              {simCalc.reserveIntact < baseCalc.reserveIntact ? (
                <span className="text-red-400 font-bold">
                  -{formatINR(baseCalc.reserveIntact - simCalc.reserveIntact)}
                </span>
              ) : (
                <span className="text-emerald-400">Full Reserve Intact</span>
              )}
            </td>
          </tr>

          {/* 4. Projected Day 30 Balance */}
          <tr className="hover:bg-[#161d19]">
            <td className="py-3 px-4 font-medium text-white">Projected Day 30 Balance</td>
            <td
              className={`py-3 px-4 font-mono font-semibold ${
                baseCalc.projected < 0 ? 'text-red-400' : 'text-purple-400'
              }`}
            >
              {formatINR(baseCalc.projected)}
            </td>
            <td
              className={`py-3 px-4 font-mono font-semibold ${
                simCalc.projected < 0 ? 'text-red-400' : 'text-purple-400'
              }`}
            >
              {formatINR(simCalc.projected)}
            </td>
            <td className="py-3 px-4 text-right font-mono font-bold text-red-400">
              {isSimActive ? `-${formatINR(baseCalc.projected - simCalc.projected)}` : '₹0'}
            </td>
          </tr>

          {/* 5. Financial Risk */}
          <tr className="hover:bg-[#161d19]">
            <td className="py-3 px-4 font-medium text-white">Financial Risk</td>
            <td className="py-3 px-4">
              <span
                className={`font-semibold uppercase text-xs ${
                  baseCalc.risk === 'High'
                    ? 'text-red-400'
                    : baseCalc.risk === 'Medium'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                }`}
              >
                {baseCalc.risk}
              </span>
            </td>
            <td className="py-3 px-4">
              <span
                className={`font-semibold uppercase text-xs ${
                  simCalc.risk === 'High'
                    ? 'text-red-400'
                    : simCalc.risk === 'Medium'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                }`}
              >
                {simCalc.risk}
              </span>
            </td>
            <td className="py-3 px-4 text-right font-mono text-xs">
              {simCalc.risk !== baseCalc.risk ? (
                <span className="text-red-400 font-bold">Elevated to {simCalc.risk}</span>
              ) : (
                <span className="text-[#8e9c93]">Unchanged</span>
              )}
            </td>
          </tr>

          {/* 6. Survival Probability (Innovation) */}
          <tr className="hover:bg-[#161d19]">
            <td className="py-3 px-4 font-medium text-white">Survival Probability (500 Futures)</td>
            <td className="py-3 px-4 font-mono font-semibold text-emerald-400">
              {baseCalc.survival.probabilityPercent}%
            </td>
            <td
              className={`py-3 px-4 font-mono font-semibold ${
                simCalc.survival.probabilityPercent < 50
                  ? 'text-red-400'
                  : simCalc.survival.probabilityPercent < 80
                    ? 'text-amber-400'
                    : 'text-emerald-400'
              }`}
            >
              {simCalc.survival.probabilityPercent}%
            </td>
            <td className="py-3 px-4 text-right font-mono font-bold text-xs">
              {isSimActive ? (
                <span
                  className={
                    simCalc.survival.probabilityPercent < baseCalc.survival.probabilityPercent
                      ? 'text-red-400'
                      : 'text-emerald-400'
                  }
                >
                  {simCalc.survival.probabilityPercent - baseCalc.survival.probabilityPercent}%
                  chance
                </span>
              ) : (
                <span className="text-[#8e9c93]">0%</span>
              )}
            </td>
          </tr>

          {/* 7. Savings Progress (Projected) */}
          <tr className="hover:bg-[#161d19]">
            <td className="py-3 px-4 font-medium text-white">Savings Progress (Projected)</td>
            <td className="py-3 px-4 font-mono font-semibold text-white">
              {baseCalc.savingsProjected}%
              <span className="text-[10px] text-[#8e9c93] block">
                {baseCalc.onTrack ? 'On track' : 'At risk'}
              </span>
            </td>
            <td className="py-3 px-4 font-mono font-semibold text-white">
              <span
                className={
                  simCalc.savingsProjected < baseCalc.savingsProjected
                    ? 'text-amber-400'
                    : 'text-white'
                }
              >
                {simCalc.savingsProjected}%
              </span>
              <span className="text-[10px] text-[#8e9c93] block">
                {simCalc.onTrack ? 'On track' : 'At risk'}
              </span>
            </td>
            <td className="py-3 px-4 text-right font-mono text-xs">
              {simCalc.savingsProjected < baseCalc.savingsProjected ? (
                <span className="text-red-400 font-bold">
                  -{(baseCalc.savingsProjected - simCalc.savingsProjected).toFixed(1)}% drop
                </span>
              ) : (
                <span className="text-[#8e9c93]">Unchanged</span>
              )}
            </td>
          </tr>

          {/* 8. Health Score */}
          <tr className="hover:bg-[#161d19]">
            <td className="py-3 px-4 font-medium text-white">Financial Health Score</td>
            <td className="py-3 px-4 font-mono font-semibold text-white">
              {baseCalc.healthScore} / 100
            </td>
            <td className="py-3 px-4 font-mono font-semibold text-white">
              {simCalc.healthScore} / 100
            </td>
            <td className="py-3 px-4 text-right font-mono font-bold">
              {isSimActive ? (
                <span
                  className={
                    simCalc.healthScore < baseCalc.healthScore ? 'text-red-400' : 'text-emerald-400'
                  }
                >
                  {simCalc.healthScore - baseCalc.healthScore} pts
                </span>
              ) : (
                <span className="text-[#8e9c93]">0 pts</span>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DecisionMatrixTable;
