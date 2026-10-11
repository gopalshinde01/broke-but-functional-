import React, { useState } from 'react';
import { Sliders, RotateCcw, Sparkles } from 'lucide-react';
import type { FinanceState } from '@/types';
import { Button } from '@/components/ui';

interface CycleSettingsFormProps {
  state: FinanceState;
  onUpdateSettings: (
    settings: Partial<Pick<FinanceState, 'budget' | 'reserve' | 'day' | 'income'>>
  ) => void;
  onLoadDemoMonth: () => void;
  onResetToBlank: () => void;
}

export const CycleSettingsForm: React.FC<CycleSettingsFormProps> = ({
  state,
  onUpdateSettings,
  onLoadDemoMonth,
  onResetToBlank,
}) => {
  const [dayVal, setDayVal] = useState(state.day);
  const [budgetVal, setBudgetVal] = useState(state.budget);
  const [reserveVal, setReserveVal] = useState(state.reserve);
  const [incomeVal, setIncomeVal] = useState(state.income);
  const [toast, setToast] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      day: Math.min(29, Math.max(0, Number(dayVal) || 0)),
      budget: Math.max(100, Number(budgetVal) || 1000),
      reserve: Math.max(0, Number(reserveVal) || 0),
      income: Math.max(0, Number(incomeVal) || 0),
    });
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Cycle & Budget Settings</h3>
          <p className="text-xs text-[#8e9c93]">
            Customize cycle day, monthly allowance, and emergency buffer
          </p>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="p-2.5 rounded-lg bg-emerald-950/40 text-emerald-300 text-xs font-mono"
        >
          Settings saved successfully!
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3"
      >
        <div>
          <label
            htmlFor="settings-day"
            className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
          >
            Current Day (0–29)
          </label>
          <input
            type="number"
            id="settings-day"
            min="0"
            max="29"
            value={dayVal}
            onChange={(e) => setDayVal(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label
            htmlFor="settings-budget"
            className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
          >
            Total Budget (₹)
          </label>
          <input
            type="number"
            id="settings-budget"
            min="100"
            value={budgetVal}
            onChange={(e) => setBudgetVal(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label
            htmlFor="settings-reserve"
            className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
          >
            Locked Reserve (₹)
          </label>
          <input
            type="number"
            id="settings-reserve"
            min="0"
            value={reserveVal}
            onChange={(e) => setReserveVal(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        <div>
          <label
            htmlFor="settings-income"
            className="block text-xs font-mono uppercase text-[#8e9c93] mb-1"
          >
            Side Income (₹)
          </label>
          <input
            type="number"
            id="settings-income"
            min="0"
            value={incomeVal}
            onChange={(e) => setIncomeVal(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-emerald-400"
          />
        </div>

        <div className="sm:col-span-2 md:col-span-4 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#232b26]">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onLoadDemoMonth}>
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-400" /> Load Demo Month
            </Button>
            <Button variant="ghost" size="sm" type="button" onClick={onResetToBlank}>
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset to Blank
            </Button>
          </div>
          <Button variant="primary" size="sm" type="submit">
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CycleSettingsForm;
