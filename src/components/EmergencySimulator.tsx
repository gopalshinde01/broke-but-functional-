import React, { useState } from 'react';
import {
  AlertOctagon,
  Stethoscope,
  Wrench,
  Compass,
  Zap,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { FinanceState, CalculationResult, ExpenseCategory } from '../types/finance';
import { formatINR } from '../utils/financeCalculations';

interface EmergencySimulatorProps {
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
  { name: 'Medical Emergency', amt: 1500, icon: Stethoscope, label: 'Medical ₹1,500', cat: 'Bills' as ExpenseCategory },
  { name: 'Laptop / Phone Repair', amt: 3000, icon: Wrench, label: 'Device Repair ₹3,000', cat: 'Bills' as ExpenseCategory },
  { name: 'Emergency Travel Home', amt: 800, icon: Compass, label: 'Urgent Travel ₹800', cat: 'Travel' as ExpenseCategory },
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
      <div className="p-5 rounded-2xl bg-dark-card border border-dark-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fintech-red/15 border border-fintech-red/30 flex items-center justify-center text-fintech-red shadow-glow-red">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Unexpected Expenses & Emergency Hub
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-fintech-red/20 text-fintech-red border border-fintech-red/40">
                  Shock Absorber
                </span>
              </div>
              <p className="text-xs text-dark-muted">
                Stress-test sudden real-life shocks. See how they eat your emergency reserve before committing real funds.
              </p>
            </div>
          </div>

          {isEmergencyActive && (
            <button
              onClick={onClearEmergency}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-dark-muted hover:text-white transition-colors"
            >
              Clear Emergency Test
            </button>
          )}
        </div>

        {toastMessage && (
          <div className="mt-4 p-3 rounded-xl bg-fintech-emerald/15 border border-fintech-emerald/30 text-fintech-emerald text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Presets */}
        <div className="mt-5 pt-4 border-t border-dark-borderSubtle">
          <div className="text-xs text-dark-muted mb-2 font-medium">
            Choose an Emergency Preset or Enter Custom Amount:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESETS.map((p) => {
              const Icon = p.icon;
              const isSelected = emergencyAmount === p.amt && emergencyName === p.name;
              return (
                <button
                  key={p.name}
                  onClick={() => {
                    setEmergencyName(p.name);
                    setEmergencyAmount(p.amt);
                    setEmergencyCategory(p.cat);
                  }}
                  className={`p-3.5 rounded-xl text-left border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-fintech-red/15 border-fintech-red text-white shadow-glow-red'
                      : 'bg-dark-input hover:bg-[#202723] border-dark-borderSubtle text-dark-muted hover:text-white'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-fintech-red text-black'
                        : 'bg-white/5 text-fintech-red'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-white">{p.name}</div>
                    <div className="font-mono text-sm font-bold text-fintech-red mt-0.5">
                      {formatINR(p.amt)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Input */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-dark-borderSubtle">
          <div className="sm:col-span-6">
            <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
              Custom Emergency Description
            </label>
            <input
              type="text"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              placeholder="e.g. Broken glasses, Lab fee, Stolen charger"
              className="w-full px-3 py-2 rounded-xl bg-dark-input border border-dark-border text-white text-xs focus:outline-none focus:border-fintech-red"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
              Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted text-xs font-mono">
                ₹
              </span>
              <input
                type="number"
                min="0"
                step="50"
                value={emergencyAmount || ''}
                onChange={(e) => setEmergencyAmount(Math.max(0, Number(e.target.value) || 0))}
                placeholder="1500"
                className="w-full pl-7 pr-3 py-2 rounded-xl bg-dark-input border border-dark-border text-white text-xs font-mono focus:outline-none focus:border-fintech-red"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
              Category
            </label>
            <select
              value={emergencyCategory}
              onChange={(e) => setEmergencyCategory(e.target.value as ExpenseCategory)}
              className="w-full px-2.5 py-2 rounded-xl bg-dark-input border border-dark-border text-white text-xs focus:outline-none focus:border-fintech-red"
            >
              <option value="Bills">Bills</option>
              <option value="Travel">Travel</option>
              <option value="Food">Food</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Impact Assessment Card */}
      <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Emergency Shock Impact Matrix
            </h3>
            <p className="text-xs text-dark-muted">
              Live simulation of this unexpected hit against your ₹{state.budget} runway
            </p>
          </div>

          {isEmergencyActive ? (
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-fintech-red/20 text-fintech-red border border-fintech-red/30">
              Testing: {formatINR(emergencyAmount)}
            </span>
          ) : (
            <span className="text-xs text-dark-muted italic">
              Select or enter an emergency amount above
            </span>
          )}
        </div>

        {/* Impact Table */}
        <div className="overflow-x-auto rounded-xl border border-dark-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-dark-border bg-[#0e1210] font-mono uppercase text-[11px] text-dark-muted">
                <th className="py-3 px-4">Financial Pillar</th>
                <th className="py-3 px-4">Normal Runway</th>
                <th className="py-3 px-4">After Emergency Hit</th>
                <th className="py-3 px-4 text-right">Emergency Shock Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-borderSubtle">
              {/* 1. Remaining Cash */}
              <tr className="hover:bg-dark-cardHover">
                <td className="py-3 px-4 font-medium text-white">Remaining Cash</td>
                <td className="py-3 px-4 font-mono font-semibold text-white">
                  {formatINR(baseCalc.remaining)}
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-white">
                  {formatINR(emergencyCalc.remaining)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-fintech-red">
                  {isEmergencyActive ? `-${formatINR(emergencyAmount)}` : '₹0'}
                </td>
              </tr>

              {/* 2. Daily Allowance */}
              <tr className="hover:bg-dark-cardHover">
                <td className="py-3 px-4 font-medium text-white">Daily Allowance</td>
                <td className="py-3 px-4 font-mono font-semibold text-fintech-lime">
                  {formatINR(baseCalc.displayDaily)}/day
                </td>
                <td
                  className={`py-3 px-4 font-mono font-semibold ${
                    emergencyCalc.daily <= 0 ? 'text-fintech-red' : 'text-fintech-amber'
                  }`}
                >
                  {emergencyCalc.daily <= 0
                    ? `-₹${Math.abs(Math.round(emergencyCalc.daily))}/day`
                    : `${formatINR(emergencyCalc.displayDaily)}/day`}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-fintech-amber">
                  {isEmergencyActive
                    ? `-${formatINR(Math.max(0, baseCalc.displayDaily - emergencyCalc.displayDaily))}/day`
                    : '₹0'}
                </td>
              </tr>

              {/* 3. Emergency Reserve Intact */}
              <tr className="hover:bg-dark-cardHover">
                <td className="py-3 px-4 font-medium text-white">Emergency Reserve Intact</td>
                <td className="py-3 px-4 font-mono font-semibold text-fintech-emerald">
                  {formatINR(baseCalc.reserveIntact)} / {formatINR(state.reserve)}
                </td>
                <td className="py-3 px-4 font-mono font-semibold">
                  <span
                    className={
                      emergencyCalc.reserveIntact < state.reserve
                        ? 'text-fintech-red font-bold'
                        : 'text-fintech-emerald'
                    }
                  >
                    {formatINR(emergencyCalc.reserveIntact)} / {formatINR(state.reserve)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold">
                  {emergencyCalc.reserveIntact < baseCalc.reserveIntact ? (
                    <span className="text-fintech-red">
                      -{formatINR(baseCalc.reserveIntact - emergencyCalc.reserveIntact)} cushion consumed
                    </span>
                  ) : (
                    <span className="text-dark-muted">Cushion Intact</span>
                  )}
                </td>
              </tr>

              {/* 4. Projected Day 30 */}
              <tr className="hover:bg-dark-cardHover">
                <td className="py-3 px-4 font-medium text-white">Projected Day 30 Finish</td>
                <td
                  className={`py-3 px-4 font-mono font-semibold ${
                    baseCalc.projected < 0 ? 'text-fintech-red' : 'text-fintech-violet'
                  }`}
                >
                  {formatINR(baseCalc.projected)}
                </td>
                <td
                  className={`py-3 px-4 font-mono font-semibold ${
                    emergencyCalc.projected < 0 ? 'text-fintech-red' : 'text-fintech-violet'
                  }`}
                >
                  {formatINR(emergencyCalc.projected)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-fintech-red">
                  {isEmergencyActive
                    ? `-${formatINR(baseCalc.projected - emergencyCalc.projected)}`
                    : '₹0'}
                </td>
              </tr>

              {/* 5. Health Score */}
              <tr className="hover:bg-dark-cardHover">
                <td className="py-3 px-4 font-medium text-white">Financial Health Score</td>
                <td className="py-3 px-4 font-mono font-semibold text-white">
                  {baseCalc.healthScore} / 100
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-white">
                  {emergencyCalc.healthScore} / 100
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold">
                  {isEmergencyActive ? (
                    <span
                      className={
                        emergencyCalc.healthScore < baseCalc.healthScore
                          ? 'text-fintech-red'
                          : 'text-dark-muted'
                      }
                    >
                      {emergencyCalc.healthScore - baseCalc.healthScore} pts
                    </span>
                  ) : (
                    <span className="text-dark-muted">0 pts</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Action Panel */}
        <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-dark-borderSubtle">
          <div className="flex items-center gap-2 text-xs text-dark-muted">
            <Zap className="w-4 h-4 text-fintech-amber shrink-0" />
            <span>
              Real expenses are strictly untouched until you click "Apply as Real Expense".
            </span>
          </div>

          <button
            onClick={handleApply}
            disabled={emergencyAmount <= 0}
            className={`py-2.5 px-6 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
              emergencyAmount > 0
                ? 'bg-fintech-red hover:bg-[#ff8080] text-black shadow-glow-red hover:scale-[1.01]'
                : 'bg-white/10 text-dark-muted cursor-not-allowed'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Apply as Real Expense ({formatINR(emergencyAmount)})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
