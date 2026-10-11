import React from 'react';
import type { FinanceState, CalculationResult } from '@/types';
import { useFinanceContext } from '@/context/FinanceContext';
import { InsightsRulesCards } from './InsightsRulesCards';
import { CycleSettingsForm } from './CycleSettingsForm';
import { DataExportImport } from './DataExportImport';

export interface SmartInsightsProps {
  state: FinanceState;
  calc: CalculationResult;
  onUpdateSettings: (
    settings: Partial<Pick<FinanceState, 'budget' | 'reserve' | 'day' | 'income'>>
  ) => void;
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
  const { importState } = useFinanceContext();

  return (
    <div className="space-y-6">
      {/* 1. Rule-Based Smart Insights */}
      <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] space-y-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Deterministic Financial Intelligence
          </h2>
          <p className="text-xs text-[#8e9c93]">
            Mathematical insights derived directly from your spending patterns
          </p>
        </div>
        <InsightsRulesCards state={state} calc={calc} />
      </div>

      {/* 2. Cycle & Budget Settings */}
      <CycleSettingsForm
        state={state}
        onUpdateSettings={onUpdateSettings}
        onLoadDemoMonth={onLoadDemoMonth}
        onResetToBlank={onResetToBlank}
      />

      {/* 3. Data Backup, Export & Portability (Innovation) */}
      <DataExportImport state={state} onImportState={importState} />
    </div>
  );
};

export default SmartInsights;
