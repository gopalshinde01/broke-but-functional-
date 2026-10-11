import React, { useState } from 'react';
import {
  AlertOctagon,
  Stethoscope,
  Wrench,
  Compass,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import type { FinanceState, CalculationResult, ExpenseCategory } from '@/types';
import { formatINR } from '@/utils/financeCalculations';
import { Button } from '@/components/ui';

export interface EmergencySimulatorProps {
  state: FinanceState;
  baseCalc: CalculationResult;
  emergencyCalc: CalculationResult;
  emergencyAmount: number;
  setEmergencyAmount: (amt: number) => void;
  emergencyName: string;
  setEmergencyName: (name: string) => void;
  emergencyCategory: ExpenseCategory;
  setEmergencyCategory: (cat: ExpenseCategory) => void;
  onConfirmEmergency: () => boolean;
  onClearEmergency: () => void;
}

const PRESETS = [
  {
    name: 'Medical Emergency',
    amt: 1500,
    icon: Stethoscope,
    label: 'Medical ₹1,500',
    cat: 'Bills' as ExpenseCategory,
  },
  {
    name: 'Laptop / Phone Repair',
    amt: 3000,
    icon: Wrench,
    label: 'Device Repair ₹3,000',
    cat: 'Bills' as ExpenseCategory,
  },
  {
    name: 'Emergency Travel Home',
    amt: 800,
    icon: Compass,
    label: 'Urgent Travel ₹800',
    cat: 'Travel' as ExpenseCategory,
  },
];

export const EmergencySimulator: React.FC<EmergencySimulatorProps> = ({
  state,
  baseCalc,
  emergencyCalc,
  emergencyAmount,
  setEmergencyAmount,
  emergencyName,
  setEmergencyName,
  emergencyCategory,
  setEmergencyCategory,
  onConfirmEmergency,
  onClearEmergency,
}) => {
  const [toastMessage, setToastMessage] = useState('');
  const isEmergencyActive = emergencyAmount > 0;

  const handleApply = () => {
    const ok = onConfirmEmergency();
    if (ok) {
      setToastMessage('Emergency expense logged to your real budget!');
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26]">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Unexpected Expenses & Emergency Hub
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-950/60 text-red-300 border border-red-800/60">
                  Shock Absorber
                </span>
              </div>
              <p className="text-xs text-[#8e9c93]">
                Stress-test sudden real-life shocks. See how they eat your emergency reserve before
                committing real funds.
              </p>
            </div>
          </div>

          {isEmergencyActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearEmergency}
              className="text-xs font-mono"
            >
              Clear Emergency Test
            </Button>
          )}
        </div>

        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 font-medium"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            const isSelected = emergencyAmount === p.amt && emergencyName === p.name;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setEmergencyName(p.name);
                  setEmergencyAmount(p.amt);
                  setEmergencyCategory(p.cat);
                }}
                className={`p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 focus:outline-none focus:ring-1 focus:ring-red-400 ${
                  isSelected
                    ? 'bg-red-950/30 border-red-500 text-white'
                    : 'bg-[#181f1b] border-[#232b26] text-[#8e9c93] hover:text-white'
                }`}
              >
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{p.label}</div>
                  <div className="text-[11px] text-[#8e9c93] mt-0.5">{p.name}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Custom Input */}
        <div className="mt-4 pt-4 border-t border-[#232b26] grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-7">
            <label
              htmlFor="emergency-name"
              className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
            >
              Emergency Description
            </label>
            <input
              type="text"
              id="emergency-name"
              maxLength={60}
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value.slice(0, 60))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
          <div className="md:col-span-5">
            <label
              htmlFor="emergency-amount"
              className="block text-[11px] font-mono uppercase text-[#8e9c93] mb-1"
            >
              Amount (₹)
            </label>
            <input
              type="number"
              id="emergency-amount"
              min="0"
              max="50000"
              value={emergencyAmount || ''}
              onChange={(e) => setEmergencyAmount(Math.max(0, Number(e.target.value) || 0))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#181f1b] border border-[#232b26] text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>
      </div>

      {/* Impact Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Reserve Impact */}
        <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-[#8e9c93]">
            <span>Reserve Protection</span>
            {emergencyCalc.reserveIntact < state.reserve ? (
              <ShieldAlert className="w-4 h-4 text-red-400" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
          </div>
          <div className="text-xl font-bold font-mono text-white">
            {formatINR(emergencyCalc.reserveIntact)} / {formatINR(state.reserve)}
          </div>
          <p className="text-xs text-[#8e9c93]">
            {emergencyCalc.reserveIntact < state.reserve
              ? `Eats ${formatINR(state.reserve - emergencyCalc.reserveIntact)} into locked safety buffer!`
              : 'Emergency reserve remains fully intact.'}
          </p>
        </div>

        {/* Daily Allowance Drop */}
        <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-[#8e9c93]">
            <span>Daily Allowance After Shock</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              emergencyCalc.daily <= 0 ? 'text-red-400' : 'text-amber-400'
            }`}
          >
            {emergencyCalc.daily <= 0
              ? `-₹${Math.abs(Math.round(emergencyCalc.daily))}/d`
              : `${formatINR(emergencyCalc.displayDaily)}/d`}
          </div>
          <p className="text-xs text-[#8e9c93]">
            Drops from {formatINR(baseCalc.displayDaily)}/d (cut of{' '}
            {formatINR(Math.max(0, baseCalc.displayDaily - emergencyCalc.displayDaily))}/day).
          </p>
        </div>

        {/* Month-End Solvency */}
        <div className="p-5 rounded-2xl bg-[#131715] border border-[#232b26] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono uppercase text-[#8e9c93]">
            <span>Projected Day 30</span>
            <span
              className={`font-bold ${
                emergencyCalc.projected < 0 ? 'text-red-400' : 'text-purple-400'
              }`}
            >
              {emergencyCalc.risk} Risk
            </span>
          </div>
          <div
            className={`text-xl font-bold font-mono ${
              emergencyCalc.projected < 0 ? 'text-red-400' : 'text-purple-400'
            }`}
          >
            {formatINR(emergencyCalc.projected)}
          </div>
          <p className="text-xs text-[#8e9c93]">
            {emergencyCalc.projected < 0
              ? 'Deficit by end of cycle if current pace holds.'
              : 'Solvent through end of month.'}
          </p>
        </div>
      </div>

      {/* Confirmation Box */}
      <div className="p-5 rounded-2xl bg-[#131715] border border-red-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-white">Log this Shock into Real Budget?</h4>
          <p className="text-xs text-[#8e9c93]">
            Permanently logs as a transaction under category "{emergencyCategory}".
          </p>
        </div>
        <Button
          variant="danger"
          disabled={emergencyAmount <= 0}
          onClick={handleApply}
          className="whitespace-nowrap px-6"
        >
          Confirm Shock Expense ({formatINR(emergencyAmount)})
        </Button>
      </div>
    </div>
  );
};

export default EmergencySimulator;
