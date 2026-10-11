import React from 'react';
import { Modal, Button } from '@/components/ui';
import type { ScenarioComparison } from '@/types';
import { formatINR } from '@/utils/financeCalculations';
import { ArrowRight, Trash2 } from 'lucide-react';

interface ScenarioCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  comparisons: ScenarioComparison[];
  onRemoveScenario: (id: string) => void;
  onSelectForSimulation: (amount: number, name: string) => void;
}

export const ScenarioCompareModal: React.FC<ScenarioCompareModalProps> = ({
  isOpen,
  onClose,
  comparisons,
  onRemoveScenario,
  onSelectForSimulation,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Scenario Compare (Side-by-Side)"
      className="max-w-3xl"
    >
      <p className="text-xs text-[#8e9c93] -mt-2 mb-4">
        Evaluate up to 3 candidate purchases side by side before deciding which one makes the cut
        this month.
      </p>

      {comparisons.length === 0 ? (
        <div className="py-8 text-center text-xs text-[#8e9c93]">
          No scenarios configured. Add up to 3 candidate purchases to compare.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {comparisons.map(({ scenario, calc }) => (
            <div
              key={scenario.id}
              className="p-4 rounded-xl bg-[#0f1411] border border-[#232b26] flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="text-sm font-bold text-white truncate" title={scenario.name}>
                    {scenario.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => onRemoveScenario(scenario.id)}
                    className="text-[#64746b] hover:text-red-400 p-1 rounded transition-colors"
                    aria-label={`Remove scenario ${scenario.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-lg font-bold font-mono text-amber-400 mb-2">
                  {formatINR(scenario.amount)}
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-[#1b231e] pb-1">
                    <span className="text-[#8e9c93]">Daily:</span>
                    <span
                      className={calc.daily <= 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}
                    >
                      {calc.daily <= 0
                        ? `-₹${Math.abs(Math.round(calc.daily))}`
                        : formatINR(calc.displayDaily)}
                      /d
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-[#1b231e] pb-1">
                    <span className="text-[#8e9c93]">End Balance:</span>
                    <span
                      className={calc.projected < 0 ? 'text-red-400 font-bold' : 'text-purple-400'}
                    >
                      {formatINR(calc.projected)}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-[#1b231e] pb-1">
                    <span className="text-[#8e9c93]">Risk Level:</span>
                    <span
                      className={`font-semibold uppercase text-[11px] ${
                        calc.risk === 'High'
                          ? 'text-red-400'
                          : calc.risk === 'Medium'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                      }`}
                    >
                      {calc.risk}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#8e9c93]">Survival:</span>
                    <span
                      className={`font-bold ${
                        calc.survival.probabilityPercent < 50
                          ? 'text-red-400'
                          : calc.survival.probabilityPercent < 80
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                      }`}
                    >
                      {calc.survival.probabilityPercent}%
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs font-medium"
                onClick={() => {
                  onSelectForSimulation(scenario.amount, scenario.name);
                  onClose();
                }}
              >
                <span>Simulate In Detail</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-[#232b26] flex justify-end">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};

export default ScenarioCompareModal;
