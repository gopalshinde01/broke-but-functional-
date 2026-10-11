import React from 'react';
import {
  Activity,
  Shield,
  Compass,
  PiggyBank,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';
import { CalculationResult } from '../types/finance';

interface FinancialHealthProps {
  calc: CalculationResult;
}

export const FinancialHealth: React.FC<FinancialHealthProps> = ({ calc }) => {
  const { health, healthScore } = calc;

  // Grade descriptor
  let gradeText = 'Critical';
  let gradeColor = 'text-fintech-red';
  let bgBadge = 'bg-fintech-red/10 border-fintech-red/30';

  if (healthScore >= 80) {
    gradeText = 'Rock Solid';
    gradeColor = 'text-fintech-lime';
    bgBadge = 'bg-fintech-lime/10 border-fintech-lime/30';
  } else if (healthScore >= 65) {
    gradeText = 'Stable';
    gradeColor = 'text-fintech-emerald';
    bgBadge = 'bg-fintech-emerald/10 border-fintech-emerald/30';
  } else if (healthScore >= 45) {
    gradeText = 'Under Pressure';
    gradeColor = 'text-fintech-amber';
    bgBadge = 'bg-fintech-amber/10 border-fintech-amber/30';
  }

  const components = [
    {
      name: 'Budget Pace & Adherence',
      score: health.adherence,
      max: 30,
      icon: Activity,
      desc: 'Spending velocity vs elapsed month days',
    },
    {
      name: 'Projected Month-End Outlook',
      score: health.outlook,
      max: 25,
      icon: Compass,
      desc: 'Projected balance buffer relative to budget',
    },
    {
      name: 'Emergency Reserve Buffer',
      score: health.reserve,
      max: 20,
      icon: Shield,
      desc: 'Free cash above mandatory emergency reserve',
    },
    {
      name: 'Savings Goal Traction',
      score: health.savings,
      max: 15,
      icon: PiggyBank,
      desc: 'Progress toward target savings milestone',
    },
    {
      name: 'Subscription Discipline',
      score: health.commitments,
      max: 10,
      icon: CheckCircle,
      desc: 'Fixed recurring subscriptions under 20% cap',
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-dark-card border border-dark-border">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Financial Health Score
            </h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bgBadge} ${gradeColor}`}
            >
              {gradeText}
            </span>
          </div>
          <p className="text-xs text-dark-muted flex items-center gap-1 mt-1">
            <Info className="w-3.5 h-3.5 text-dark-muted shrink-0" />
            <span>App-generated indicator, not professional financial advice</span>
          </p>
        </div>

        {/* Score Ring Display */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-3xl font-extrabold tracking-tight text-white font-mono tabular-nums leading-none">
              {healthScore}
              <span className="text-xs text-dark-muted font-normal">/100</span>
            </div>
            <span className="text-[10px] uppercase font-mono text-dark-muted">
              Holistic Index
            </span>
          </div>
        </div>
      </div>

      {/* Per-component Progress Breakdown */}
      <div className="space-y-3.5">
        {components.map((item) => {
          const Icon = item.icon;
          const pct = Math.min(100, Math.round((item.score / item.max) * 100));
          const isStruggling = pct < 50;

          return (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-dark-muted" />
                  <span className="text-white font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span
                    className={`font-semibold tabular-nums ${
                      isStruggling ? 'text-fintech-amber' : 'text-white'
                    }`}
                  >
                    {item.score}
                  </span>
                  <span className="text-dark-muted text-[11px]">/ {item.max} pts</span>
                </div>
              </div>

              {/* Bar */}
              <div className="w-full bg-[#1b221e] rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pct >= 80
                      ? 'bg-fintech-lime'
                      : pct >= 50
                      ? 'bg-fintech-emerald'
                      : 'bg-fintech-amber'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="text-[11px] text-dark-muted flex justify-between">
                <span>{item.desc}</span>
                <span className="font-mono text-[10px]">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
