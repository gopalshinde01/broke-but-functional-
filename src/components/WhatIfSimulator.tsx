import React, { useState } from 'react';
import {
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
  ShoppingCart,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Stethoscope,
  Wrench,
  Compass,
  Coffee
} from 'lucide-react';
import { CalculationResult, ExpenseCategory, FinanceState } from '../types/finance';
import { formatINR } from '../utils/financeCalculations';

interface WhatIfSimulatorProps {
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

const EMERGENCY_PRESETS = [
  { name: 'Medical Emergency', amt: 1500, icon: Stethoscope, label: 'Medical ₹1,500' },
  { name: 'Laptop / Phone Repair', amt: 3000, icon: Wrench, label: 'Repair ₹3,000' },
  { name: 'Emergency Travel', amt: 800, icon: Compass, label: 'Travel ₹800' },
  { name: 'Weekend Outing', amt: 600, icon: Coffee, label: 'Outing ₹600' },
];

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

  const isSimActive = simAmount > 0;
  const daysLeft = baseCalc.daysLeft;

  // Wait 7 days calculations:
  // keep current daily allowance for 7 days; if still bought then,
  // new allowance = (available − daily×7 − amount) ÷ (daysLeft − 7)
  const canWait7Days = daysLeft > 7;
  let wait7NewDaily = 0;
  if (canWait7Days) {
    const rawNewDaily =
      (baseCalc.available - baseCalc.daily * 7 - simAmount) / (daysLeft - 7);
    wait7NewDaily = rawNewDaily;
  }

  const handleConfirm = () => {
    const ok = onConfirmPurchase();
    if (ok) {
      setConfirmedNotification(true);
      setTimeout(() => setConfirmedNotification(false), 4000);
    }
  };

  const handleSelectPreset = (preset: { name: string; amt: number }) => {
    setSimName(preset.name);
    setSimAmount(preset.amt);
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="p-5 rounded-2xl bg-dark-card border border-dark-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fintech-amber/15 border border-fintech-amber/30 flex items-center justify-center text-fintech-amber shadow-glow-amber">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Purchase Impact Simulator
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-fintech-amber/20 text-fintech-amber border border-fintech-amber/40">
                  Zero-Risk Sandbox
                </span>
              </div>
              <p className="text-xs text-dark-muted">
                Test real purchases before committing a single rupee. No actual money moves until you confirm.
              </p>
            </div>
          </div>

          {isSimActive && (
            <button
              onClick={onClearSimulation}
              className="px-3 py-1.5 rounded-lg text-xs font-mono bg-white/5 hover:bg-white/10 text-dark-muted hover:text-white transition-colors"
            >
              Clear Simulation
            </button>
          )}
        </div>

        {confirmedNotification && (
          <div className="mt-4 p-3 rounded-xl bg-fintech-emerald/15 border border-fintech-emerald/30 text-fintech-emerald text-xs flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>Transaction confirmed and logged to your real budget!</span>
          </div>
        )}

        {/* Purchase Inputs */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-5">
            <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
              What do you want to buy?
            </label>
            <input
              type="text"
              id="sim-name-input"
              placeholder="e.g. Noise cancelling headphones, Shoes, Swiggy party"
              value={simName}
              onChange={(e) => setSimName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-dark-input border border-dark-border text-white text-sm placeholder:text-dark-muted/50 focus:outline-none focus:border-fintech-amber transition-colors"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
              Purchase Amount (₹)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted text-sm font-mono">
                ₹
              </span>
              <input
                type="number"
                id="sim-amount-input"
                min="0"
                step="50"
                placeholder="1500"
                value={simAmount || ''}
                onChange={(e) => setSimAmount(Math.max(0, Number(e.target.value) || 0))}
                className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-dark-input border border-dark-border text-white text-sm font-mono placeholder:text-dark-muted/50 focus:outline-none focus:border-fintech-amber transition-colors"
              />
            </div>
          </div>

          <div className="md:col-span-3">
            <label className="block text-[11px] font-mono uppercase text-dark-muted mb-1">
              Category
            </label>
            <select
              id="sim-category-select"
              value={simCategory}
              onChange={(e) => setSimCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3 py-2.5 rounded-xl bg-dark-input border border-dark-border text-white text-sm focus:outline-none focus:border-fintech-amber transition-colors"
            >
              <option value="Shopping">Shopping</option>
              <option value="Food">Food</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Travel">Travel</option>
              <option value="Bills">Bills</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Emergency Presets */}
        <div className="mt-4 pt-3.5 border-t border-dark-borderSubtle">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-dark-muted font-medium mr-1">
              Stress-test scenarios:
            </span>
            {EMERGENCY_PRESETS.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.name}
                  onClick={() => handleSelectPreset(preset)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    simAmount === preset.amt && simName === preset.name
                      ? 'bg-fintech-amber text-black font-semibold shadow-glow-amber'
                      : 'bg-dark-input hover:bg-[#202723] text-dark-muted hover:text-white border border-dark-borderSubtle'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Before vs After Comparison Table */}
      <div className="p-5 rounded-2xl bg-dark-card border border-dark-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Before vs After Decision Matrix
            </h3>
            <p className="text-xs text-dark-muted">
              Live mathematical breakdown of committing this spend right now
            </p>
          </div>
          {isSimActive ? (
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-fintech-amber/15 text-fintech-amber border border-fintech-amber/30">
              Simulating: {formatINR(simAmount)}
            </span>
          ) : (
            <span className="text-xs text-dark-muted italic">
              Enter an amount above to see changes
            </span>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border border-dark-border">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-dark-border bg-[#0e1210] font-mono uppercase text-[11px] text-dark-muted">
                <th className="py-3 px-4">Financial Metric</th>
                <th className="py-3 px-4">Current Reality (Before)</th>
                <th className="py-3 px-4">With Purchase (After)</th>
                <th className="py-3 px-4 text-right">Net Consequence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-borderSubtle">
              {/* 1. Remaining Balance */}
              <tr className="hover:bg-dark-cardHover">
                <td className="py-3 px-4 font-medium text-white">Remaining Balance</td>
                <td className="py-3 px-4 font-mono font-semibold text-white">
                  {formatINR(baseCalc.remaining)}
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-white">
                  {formatINR(simCalc.remaining)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-fintech-red">
                  {isSimActive ? `-${formatINR(simAmount)}` : '₹0'}
                </td>
              </tr>

              {/* 2. Daily Allowance */}
              <tr className="hover:bg-dark-cardHover">
                <td className="py-3 px-4 font-medium text-white">Daily Allowance</td>
                <td className="py-3 px-4 font-mono font-semibold text-fintech-lime">
                  {formatINR(baseCalc.displayDaily)}/d
                </td>
                <td
                  className={`py-3 px-4 font-mono font-semibold ${
                    simCalc.daily <= 0 ? 'text-fintech-red' : 'text-fintech-amber'
                  }`}
                >
                  {simCalc.daily <= 0
                    ? `-₹${Math.abs(Math.round(simCalc.daily))}/d`
                    : `${formatINR(simCalc.displayDaily)}/d`}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-fintech-amber">
                  {isSimActive
                    ? `-${formatINR(Math.max(0, baseCalc.displayDaily - simCalc.displayDaily))}/day`
                    : '₹0'}
                </td>
              </tr>

              {/* 3. Emergency Reserve */}
              {/* 3. Emergency Reserve Intact */}
              <tr className="hover:bg-dark-cardHover">
                <td className="py-3 px-4 font-medium text-white">Emergency Reserve Intact</td>
                <td className="py-3 px-4 font-mono font-semibold text-white">
                  {formatINR(baseCalc.reserveIntact)} / {formatINR(state.reserve)}
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-white">
                  <span
                    className={
                      simCalc.reserveIntact < state.reserve
                        ? 'text-fintech-red font-bold'
                        : 'text-fintech-emerald'
                    }
                  >
                    {formatINR(simCalc.reserveIntact)} / {formatINR(state.reserve)}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-dark-muted">
                  {simCalc.reserveIntact < baseCalc.reserveIntact ? (
                    <span className="text-fintech-red font-bold">
                      -{formatINR(baseCalc.reserveIntact - simCalc.reserveIntact)}
                    </span>
                  ) : (
                    <span className="text-fintech-emerald">Full Reserve Intact</span>
                  )}
                </td>
              </tr>

              {/* 4. Projected End Balance */}
              <tr className="hover:bg-dark-cardHover">
                <td className="py-3 px-4 font-medium text-white">Projected Day 30 Balance</td>
                <td
                  className={`py-3 px-4 font-mono font-semibold ${
                    baseCalc.projected < 0 ? 'text-fintech-red' : 'text-fintech-violet'
                  }`}
                >
                  {formatINR(baseCalc.projected)}
                </td>
                <td
                  className={`py-3 px-4 font-mono font-semibold ${
                    simCalc.projected < 0 ? 'text-fintech-red' : 'text-fintech-violet'
                  }`}
                >
                  {formatINR(simCalc.projected)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-fintech-red">
                  {isSimActive
                    ? `-${formatINR(baseCalc.projected - simCalc.projected)}`
                    : '₹0'}
                </td>
              </tr>

              {/* 5. Financial Risk */}
              <tr className="hover:bg-dark-cardHover">
                <td className="py-3 px-4 font-medium text-white">Financial Risk</td>
                <td className="py-3 px-4">
                  <span
                    className={`font-semibold uppercase text-xs ${
                      baseCalc.risk === 'High'
                        ? 'text-fintech-red'
                        : baseCalc.risk === 'Medium'
                        ? 'text-fintech-amber'
                        : 'text-fintech-emerald'
                    }`}
                  >
                    {baseCalc.risk}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`font-semibold uppercase text-xs ${
                      simCalc.risk === 'High'
                        ? 'text-fintech-red'
                        : simCalc.risk === 'Medium'
                        ? 'text-fintech-amber'
                        : 'text-fintech-emerald'
                    }`}
                  >
                    {simCalc.risk}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-xs">
                  {simCalc.risk !== baseCalc.risk ? (
                    <span className="text-fintech-red font-bold">
                      Elevated to {simCalc.risk}
                    </span>
                  ) : (
                    <span className="text-dark-muted">Unchanged</span>
                  )}
                </td>
              </tr>

              {/* 6. Savings Progress (Projected) */}
              <tr className="hover:bg-dark-cardHover">
                <td className="py-3 px-4 font-medium text-white">
                  Savings Progress (Projected)
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-white">
                  {baseCalc.savingsProjected}%
                  <span className="text-[10px] text-dark-muted block">
                    {baseCalc.onTrack ? 'On track' : 'At risk'}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-semibold text-white">
                  <span
                    className={
                      simCalc.savingsProjected < baseCalc.savingsProjected
                        ? 'text-fintech-amber'
                        : 'text-white'
                    }
                  >
                    {simCalc.savingsProjected}%
                  </span>
                  <span className="text-[10px] text-dark-muted block">
                    {simCalc.onTrack ? 'On track' : 'At risk'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right font-mono text-xs">
                  {simCalc.savingsProjected < baseCalc.savingsProjected ? (
                    <span className="text-fintech-red font-bold">
                      -{(baseCalc.savingsProjected - simCalc.savingsProjected).toFixed(1)}% drop
                    </span>
                  ) : (
                    <span className="text-dark-muted">Unchanged</span>
                  )}
                </td>
              </tr>

              {/* 7. Health Score */}
              <tr className="hover:bg-dark-cardHover">
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
                        simCalc.healthScore < baseCalc.healthScore
                          ? 'text-fintech-red'
                          : 'text-fintech-emerald'
                      }
                    >
                      {simCalc.healthScore - baseCalc.healthScore} pts
                    </span>
                  ) : (
                    <span className="text-dark-muted">0 pts</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Three Action Cards: Buy Now, Wait 7 Days, Skip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: BUY NOW */}
        <div className="p-5 rounded-2xl bg-dark-card border border-fintech-red/30 flex flex-col justify-between hover:border-fintech-red/50 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-2 text-fintech-red">
              <ShoppingCart className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white">Option 1: Buy Right Now</h4>
            </div>
            <p className="text-xs text-dark-muted leading-relaxed">
              Accept the instant gratification and absorb the financial hit immediately.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-fintech-red/10 border border-fintech-red/20 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-white">
                <span>Immediate Cost:</span>
                <span className="font-bold">{formatINR(simAmount)}</span>
              </div>
              <div className="flex justify-between text-fintech-red">
                <span>Daily allowance drops to:</span>
                <span className="font-bold">
                  {simCalc.daily <= 0 ? `-₹${Math.abs(Math.round(simCalc.daily))}` : formatINR(simCalc.displayDaily)}/d
                </span>
              </div>
              <div className="flex justify-between text-dark-muted">
                <span>New Day 30 deficit:</span>
                <span className="text-white">{formatINR(simCalc.projected)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-dark-borderSubtle">
            <button
              onClick={handleConfirm}
              disabled={simAmount <= 0}
              id="confirm-simulated-purchase-btn"
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                simAmount > 0
                  ? 'bg-fintech-red hover:bg-[#ff8080] text-black shadow-glow-red hover:scale-[1.01]'
                  : 'bg-white/10 text-dark-muted cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Confirm Purchase ({formatINR(simAmount)})</span>
            </button>
            <span className="block text-[10px] text-dark-muted text-center mt-1.5">
              Permanently logs this as an actual transaction
            </span>
          </div>
        </div>

        {/* Card 2: WAIT 7 DAYS */}
        <div className="p-5 rounded-2xl bg-dark-card border border-fintech-amber/30 flex flex-col justify-between hover:border-fintech-amber/50 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-2 text-fintech-amber">
              <Clock className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white">Option 2: Wait 7 Days</h4>
            </div>
            <p className="text-xs text-dark-muted leading-relaxed">
              The 7-Day Rule: cool off impulsive desires while preserving your current budget runway.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-fintech-amber/10 border border-fintech-amber/20 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-white">
                <span>Next 7 days allowance:</span>
                <span className="font-bold text-fintech-lime">
                  {formatINR(baseCalc.displayDaily)}/day (kept)
                </span>
              </div>
              {canWait7Days ? (
                <div className="flex justify-between text-fintech-amber">
                  <span>If bought after 7 days:</span>
                  <span className="font-bold">
                    {wait7NewDaily <= 0
                      ? `₹0/d`
                      : `${formatINR(Math.max(0, wait7NewDaily))}/d`}
                  </span>
                </div>
              ) : (
                <div className="text-[11px] text-fintech-amber leading-snug">
                  Only {daysLeft} days left in cycle. Waiting 7 days rolls this purchase cleanly into next month!
                </div>
              )}
              <div className="text-[11px] text-dark-muted pt-1">
                83% of impulsive student desires dissolve within 7 days.
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-dark-borderSubtle">
            <button
              onClick={() => {
                alert(`Cooling-off initiated! Revisit this purchase on Day ${Math.min(30, state.day + 7)}.`);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-fintech-amber/20 hover:bg-fintech-amber/30 text-fintech-amber border border-fintech-amber/40 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>Adopt 7-Day Cooling Period</span>
            </button>
            <span className="block text-[10px] text-dark-muted text-center mt-1.5">
              Leaves actual budget completely safe for 1 week
            </span>
          </div>
        </div>

        {/* Card 3: SKIP IT */}
        <div className="p-5 rounded-2xl bg-dark-card border border-fintech-emerald/30 flex flex-col justify-between hover:border-fintech-emerald/50 transition-all">
          <div>
            <div className="flex items-center gap-2 mb-2 text-fintech-emerald">
              <Ban className="w-5 h-5" />
              <h4 className="font-bold text-sm text-white">Option 3: Skip It</h4>
            </div>
            <p className="text-xs text-dark-muted leading-relaxed">
              Walk away. Put the money directly toward your freedom, savings goal, and safety net.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-fintech-emerald/10 border border-fintech-emerald/20 text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-white">
                <span>Rupees Kept:</span>
                <span className="font-bold text-fintech-emerald">
                  +{formatINR(simAmount)} Saved
                </span>
              </div>
              <div className="flex justify-between text-white">
                <span>End Balance (Skipped):</span>
                <span className="font-bold text-fintech-violet">
                  {formatINR(baseCalc.projected)}
                </span>
              </div>
              <div className="flex justify-between text-dark-muted">
                <span>End Balance (If Bought):</span>
                <span className="text-fintech-red">{formatINR(simCalc.projected)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-dark-borderSubtle">
            <button
              onClick={() => {
                onClearSimulation();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-fintech-emerald hover:bg-[#40f5ad] text-black font-semibold text-xs transition-all shadow-glow-emerald flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Skip It & Keep My Money</span>
            </button>
            <span className="block text-[10px] text-dark-muted text-center mt-1.5">
              Zero guilt. Instant peace of mind.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
