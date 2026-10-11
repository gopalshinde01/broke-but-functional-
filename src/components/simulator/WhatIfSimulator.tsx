import React, { useState } from 'react';
import { SlidersHorizontal, CheckCircle2, SplitSquareVertical } from 'lucide-react';
import type { CalculationResult, ExpenseCategory, FinanceState } from '@/types';
import { formatINR } from '@/utils/financeCalculations';
import { useSimulation } from '@/hooks/useSimulation';
import { Button } from '@/components/ui';
import { SimulatorInputs } from './SimulatorInputs';
import { DecisionMatrixTable } from './DecisionMatrixTable';
import { SurvivalProbabilityGauge } from './SurvivalProbabilityGauge';
import { ActionOptionsCards } from './ActionOptionsCards';
import { ScenarioCompareModal } from './ScenarioCompareModal';

export interface WhatIfSimulatorProps {
  state: FinanceState;
  baseCalc: CalculationResult;
  simCalc: CalculationResult;
  simAmount: number;
  setSimAmount: (amount: number) => void;
  simName: string;
  setSimName: (name: string) => void;
  simCategory: ExpenseCategory;
  setSimCategory: (cat: ExpenseCategory) => void;
  onConfirmPurchase: () => boolean;
  onClearSimulation: () => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  state,
  baseCalc,
  simCalc,
  simAmount,
  setSimAmount,
  simName,
  setSimName,
  simCategory,
  setSimCategory,
  onConfirmPurchase,
  onClearSimulation,
}) => {
  const [confirmedNotification, setConfirmedNotification] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const { scenarioComparisons, removeScenario } = useSimulation();

  const isSimActive = simAmount > 0;

  const handleConfirm = () => {
    const ok = onConfirmPurchase();
    if (ok) {
      setConfirmedNotification(true);
      setTimeout(() => setConfirmedNotification(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction Card */}
      <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Purchase Impact Simulator
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-950/60 text-amber-300 border border-amber-800/60">
                  Zero-Risk Sandbox
                </span>
              </div>
              <p className="text-xs text-[#8e9c93]">
                Test real purchases before committing a single rupee. No actual money moves until
                you confirm.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCompareOpen(true)}
              className="text-xs font-medium"
            >
              <SplitSquareVertical className="w-3.5 h-3.5 mr-1 text-amber-400" />
              <span>Compare Scenarios</span>
            </Button>
            {isSimActive && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearSimulation}
                className="text-xs font-mono"
              >
                Clear Simulation
              </Button>
            )}
          </div>
        </div>

        {confirmedNotification && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Transaction confirmed and logged to your real budget!</span>
          </div>
        )}

        <SimulatorInputs
          simName={simName}
          setSimName={setSimName}
          simAmount={simAmount}
          setSimAmount={setSimAmount}
          simCategory={simCategory}
          setSimCategory={setSimCategory}
        />
      </div>

      {/* Innovation: 500-Run Monte Carlo Survival Probability Gauge */}
      <SurvivalProbabilityGauge
        beforeSurvival={baseCalc.survival}
        afterSurvival={simCalc.survival}
        isSimActive={isSimActive}
      />

      {/* Decision Matrix Table */}
      <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Before vs After Decision Matrix
            </h3>
            <p className="text-xs text-[#8e9c93]">
              Live mathematical breakdown of committing this spend right now
            </p>
          </div>
          {isSimActive ? (
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-300 border border-amber-800/60">
              Simulating: {formatINR(simAmount)}
            </span>
          ) : (
            <span className="text-xs text-[#8e9c93] italic">
              Enter an amount above to see changes
            </span>
          )}
        </div>

        <DecisionMatrixTable
          state={state}
          baseCalc={baseCalc}
          simCalc={simCalc}
          simAmount={simAmount}
        />
      </div>

      {/* Three Action Cards */}
      <ActionOptionsCards
        state={state}
        baseCalc={baseCalc}
        simCalc={simCalc}
        simAmount={simAmount}
        onConfirmPurchase={handleConfirm}
        onClearSimulation={onClearSimulation}
      />

      {/* Scenario Compare Modal */}
      <ScenarioCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        comparisons={scenarioComparisons}
        onRemoveScenario={removeScenario}
        onSelectForSimulation={(amount, name) => {
          setSimAmount(amount);
          setSimName(name);
        }}
      />
    </div>
  );
};

export default WhatIfSimulator;
