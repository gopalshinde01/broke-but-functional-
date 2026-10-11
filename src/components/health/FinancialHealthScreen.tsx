import React from 'react';
import {
  HeartPulse,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  Info,
  Award,
} from 'lucide-react';
import type { FinanceState, CalculationResult } from '@/types';
import { formatINR } from '@/utils/financeCalculations';
import { FinancialHealth } from '@/components/dashboard/FinancialHealth';

interface FinancialHealthScreenProps {
  state: FinanceState;
  calc: CalculationResult;
}

export const FinancialHealthScreen: React.FC<FinancialHealthScreenProps> = ({ state, calc }) => {
  const { healthScore, health, risk, riskReason, remaining, projected, committed, totalSaved } = calc;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#131715] border border-[#232b26]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Financial Health & Risk Diagnostic
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                  Explainable 100-Point Index
                </span>
              </div>
              <p className="text-xs text-[#8e9c93]">
                Transparent algorithmic scoring based on budget discipline, emergency reserves, and month-end trajectory
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8e9c93] bg-[#0d100e] px-3.5 py-2 rounded-xl border border-[#1f2621]">
            <Info className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Application-generated budgeting indicator (not formal financial advice)</span>
          </div>
        </div>
      </div>

      {/* Hero Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Component Breakdown (reuse FinancialHealth component) */}
        <div className="lg:col-span-7">
          <FinancialHealth calc={calc} />
        </div>

        {/* Right: Transparent Risk Assessment Box */}
        <div className="lg:col-span-5 space-y-4">
          <div
            className={`p-6 rounded-2xl bg-[#131715] border transition-all ${
              risk === 'High'
                ? 'border-red-900/50 bg-red-950/10'
                : risk === 'Medium'
                  ? 'border-amber-900/40 bg-amber-950/10'
                  : 'border-emerald-900/30 bg-emerald-950/10'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-[#8e9c93]">Assigned Risk State</span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  risk === 'High'
                    ? 'bg-red-500/20 text-red-400'
                    : risk === 'Medium'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {risk === 'High' ? (
                  <AlertOctagon className="w-4 h-4" />
                ) : risk === 'Medium' ? (
                  <ShieldAlert className="w-4 h-4" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
              </div>
            </div>

            <div
              className={`text-2xl font-bold uppercase tracking-tight ${
                risk === 'High'
                  ? 'text-red-400'
                  : risk === 'Medium'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
              }`}
            >
              {risk} Risk Level
            </div>

            <p className="text-xs text-[#8e9c93] mt-2 leading-relaxed">
              <strong>Risk Reason:</strong> {riskReason}
            </p>

            <div className="mt-4 pt-4 border-t border-[#232b26] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#8e9c93]">
                <span>Remaining Money:</span>
                <span className="text-white font-semibold">{formatINR(remaining)}</span>
              </div>
              <div className="flex justify-between text-[#8e9c93]">
                <span>Locked Commitments:</span>
                <span className="text-blue-400 font-semibold">{formatINR(committed)}</span>
              </div>
              <div className="flex justify-between text-[#8e9c93]">
                <span>Emergency Buffer:</span>
                <span className="text-emerald-400 font-semibold">{formatINR(state.reserve)}</span>
              </div>
              <div className="flex justify-between text-[#8e9c93]">
                <span>Projected Day 30:</span>
                <span className={projected < 0 ? 'text-red-400 font-bold' : 'text-purple-400 font-bold'}>
                  {formatINR(projected)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transparent Methodology Documentation */}
      <div className="p-6 rounded-2xl bg-[#131715] border border-[#232b26] space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Documented 100-Point Scoring Methodology
          </h3>
        </div>

        <p className="text-xs text-[#8e9c93] leading-relaxed">
          The Financial Health Score is computed dynamically on every state change using five deterministic pillars with strict boundaries (0-100):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          <div className="p-3.5 rounded-xl bg-[#0e1210] border border-[#1f2823] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Budget Adherence</span>
              <span className="font-mono text-emerald-400">30 pts max</span>
            </div>
            <p className="text-[11px] text-[#8e9c93]">
              Evaluates actual spending against proportional daily pace (₹333/day ideal). Earning: <strong>{health.adherence} / 30</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e1210] border border-[#1f2823] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Month-End Outlook</span>
              <span className="font-mono text-purple-400">25 pts max</span>
            </div>
            <p className="text-[11px] text-[#8e9c93]">
              Proportion of budget projected to survive through Day 30. Earning: <strong>{health.outlook} / 25</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e1210] border border-[#1f2823] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Reserve Protection</span>
              <span className="font-mono text-amber-400">20 pts max</span>
            </div>
            <p className="text-[11px] text-[#8e9c93]">
              Safeguards your ₹{state.reserve} emergency buffer from routine depletion. Earning: <strong>{health.reserve} / 20</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e1210] border border-[#1f2823] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Savings Traction</span>
              <span className="font-mono text-emerald-400">15 pts max</span>
            </div>
            <p className="text-[11px] text-[#8e9c93]">
              Tracks goal fulfillment towards student milestones ({formatINR(totalSaved)} saved). Earning: <strong>{health.savings} / 15</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e1210] border border-[#1f2823] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Subscription Cap</span>
              <span className="font-mono text-blue-400">10 pts max</span>
            </div>
            <p className="text-[11px] text-[#8e9c93]">
              Ensures monthly auto-renewals stay under 20% of your starting budget. Earning: <strong>{health.commitments} / 10</strong>.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e1210] border border-[#1f2823] space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-white">
              <span>Total Health Score</span>
              <span className="font-mono text-emerald-400 font-bold">{healthScore} / 100</span>
            </div>
            <p className="text-[11px] text-[#8e9c93]">
              Fully recalculated on every addition, deletion, edit, or simulation scenario.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialHealthScreen;
