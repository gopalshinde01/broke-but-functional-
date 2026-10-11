import React from 'react';
import { ShieldCheck, AlertTriangle, Activity } from 'lucide-react';
import type { SurvivalSimulationResult } from '@/types';
import { ProgressBar } from '@/components/ui';

interface SurvivalProbabilityGaugeProps {
  beforeSurvival: SurvivalSimulationResult;
  afterSurvival: SurvivalSimulationResult;
  isSimActive: boolean;
}

export const SurvivalProbabilityGauge: React.FC<SurvivalProbabilityGaugeProps> = ({
  beforeSurvival,
  afterSurvival,
  isSimActive,
}) => {
  const currentProb = isSimActive
    ? afterSurvival.probabilityPercent
    : beforeSurvival.probabilityPercent;
  const isHighRisk = currentProb < 50;
  const isModerateRisk = currentProb < 80;

  const color = isHighRisk ? 'red' : isModerateRisk ? 'amber' : 'emerald';
  const textColor = isHighRisk
    ? 'text-red-400'
    : isModerateRisk
      ? 'text-amber-400'
      : 'text-emerald-400';

  return (
    <div className="p-4 rounded-2xl bg-[#0e1210] border border-[#232b26] space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Month-End Survival Probability
            </h4>
            <span className="text-[11px] text-[#8e9c93]">
              Monte Carlo simulation across 500 randomized daily spending paths
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-black font-mono tabular-nums leading-none ${textColor}`}>
            {currentProb}%
          </div>
          <span className="text-[10px] text-[#8e9c93] font-mono">
            {isSimActive
              ? `Was ${beforeSurvival.probabilityPercent}% before spend`
              : 'Chance of Day 30 solvency'}
          </span>
        </div>
      </div>

      <ProgressBar
        value={currentProb}
        max={100}
        color={color}
        heightClass="h-2.5"
        label="Survival Probability"
      />

      <div className="flex flex-wrap items-center justify-between text-[11px] text-[#8e9c93] pt-1">
        <span className="flex items-center gap-1 font-mono">
          {currentProb >= 80 ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>
            {currentProb >= 80
              ? 'Strong runway buffer against variance'
              : currentProb >= 50
                ? 'Elevated vulnerability to irregular spending shocks'
                : 'Imminent deficit danger: spending cuts urgently advised'}
          </span>
        </span>
        <span className="font-mono text-[10px]">
          Runs: {beforeSurvival.simulatedRuns} | P10: ₹{Math.round(afterSurvival.p10EndBalance)}
        </span>
      </div>
    </div>
  );
};

export default SurvivalProbabilityGauge;
