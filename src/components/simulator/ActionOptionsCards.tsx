import React from 'react';
import { ShoppingCart, Clock, Ban, ShieldCheck } from 'lucide-react';
import type { CalculationResult, FinanceState } from '@/types';
import { formatINR } from '@/utils/financeCalculations';

interface ActionOptionsCardsProps {
  state: FinanceState;
  baseCalc: CalculationResult;
  simCalc: CalculationResult;
  simAmount: number;
  onConfirmPurchase: () => void;
  onClearSimulation: () => void;
}

export const ActionOptionsCards: React.FC<ActionOptionsCardsProps> = ({
  state,
  baseCalc,
  simCalc,
  simAmount,
  onConfirmPurchase,
  onClearSimulation,
}) => {
  const daysLeft = baseCalc.daysLeft;
  const canWait7Days = daysLeft > 7;
  const wait7NewDaily = canWait7Days
    ? (baseCalc.available - baseCalc.daily * 7 - simAmount) / (daysLeft - 7)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Option 1: BUY NOW */}
      <div className="p-5 rounded-2xl bg-[#131715] border border-red-900/40 flex flex-col justify-between hover:border-red-800/60 transition-all">
        <div>
          <div className="flex items-center gap-2 mb-2 text-red-400">
            <ShoppingCart className="w-5 h-5" />
            <h4 className="font-bold text-sm text-white">Option 1: Buy Right Now</h4>
          </div>
          <p className="text-xs text-[#8e9c93] leading-relaxed">
            Accept the instant gratification and absorb the financial hit immediately.
          </p>

          <div className="mt-4 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-white">
              <span>Immediate Cost:</span>
              <span className="font-bold">{formatINR(simAmount)}</span>
            </div>
            <div className="flex justify-between text-red-400">
              <span>Daily allowance drops to:</span>
              <span className="font-bold">
                {simCalc.daily <= 0
                  ? `-₹${Math.abs(Math.round(simCalc.daily))}`
                  : formatINR(simCalc.displayDaily)}
                /d
              </span>
            </div>
            <div className="flex justify-between text-[#8e9c93]">
              <span>New Day 30 deficit:</span>
              <span className="text-white">{formatINR(simCalc.projected)}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-[#232b26]">
          <button
            type="button"
            onClick={onConfirmPurchase}
            disabled={simAmount <= 0}
            id="confirm-simulated-purchase-btn"
            className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-400 ${
              simAmount > 0
                ? 'bg-red-500 hover:bg-red-400 text-black shadow-sm'
                : 'bg-white/10 text-[#8e9c93] cursor-not-allowed'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Confirm Purchase ({formatINR(simAmount)})</span>
          </button>
          <span className="block text-[10px] text-[#8e9c93] text-center mt-1.5">
            Permanently logs this as an actual transaction
          </span>
        </div>
      </div>

      {/* Option 2: WAIT 7 DAYS */}
      <div className="p-5 rounded-2xl bg-[#131715] border border-amber-900/40 flex flex-col justify-between hover:border-amber-800/60 transition-all">
        <div>
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <Clock className="w-5 h-5" />
            <h4 className="font-bold text-sm text-white">Option 2: Wait 7 Days</h4>
          </div>
          <p className="text-xs text-[#8e9c93] leading-relaxed">
            The 7-Day Rule: cool off impulsive desires while preserving your current budget runway.
          </p>

          <div className="mt-4 p-3 rounded-xl bg-amber-950/20 border border-amber-900/30 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-white">
              <span>Next 7 days allowance:</span>
              <span className="font-bold text-emerald-400">
                {formatINR(baseCalc.displayDaily)}/day (kept)
              </span>
            </div>
            {canWait7Days ? (
              <div className="flex justify-between text-amber-300">
                <span>If bought after 7 days:</span>
                <span className="font-bold">
                  {wait7NewDaily <= 0 ? '₹0/d' : `${formatINR(Math.max(0, wait7NewDaily))}/d`}
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-amber-300 leading-snug">
                Only {daysLeft} days left in cycle. Waiting 7 days rolls this purchase into next
                month!
              </div>
            )}
            <div className="text-[11px] text-[#8e9c93] pt-1">
              83% of impulsive student desires dissolve within 7 days.
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-[#232b26]">
          <button
            type="button"
            onClick={() => {
              alert(
                `Cooling-off initiated! Revisit this purchase on Day ${Math.min(30, state.day + 7)}.`
              );
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-800/40 font-semibold text-xs transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <Clock className="w-4 h-4" />
            <span>Adopt 7-Day Cooling Period</span>
          </button>
          <span className="block text-[10px] text-[#8e9c93] text-center mt-1.5">
            Leaves actual budget completely safe for 1 week
          </span>
        </div>
      </div>

      {/* Option 3: SKIP IT */}
      <div className="p-5 rounded-2xl bg-[#131715] border border-emerald-900/40 flex flex-col justify-between hover:border-emerald-800/60 transition-all">
        <div>
          <div className="flex items-center gap-2 mb-2 text-emerald-400">
            <Ban className="w-5 h-5" />
            <h4 className="font-bold text-sm text-white">Option 3: Skip It</h4>
          </div>
          <p className="text-xs text-[#8e9c93] leading-relaxed">
            Walk away. Put the money directly toward your freedom, savings goal, and safety net.
          </p>

          <div className="mt-4 p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-white">
              <span>Rupees Kept:</span>
              <span className="font-bold text-emerald-400">+{formatINR(simAmount)} Saved</span>
            </div>
            <div className="flex justify-between text-white">
              <span>End Balance (Skipped):</span>
              <span className="font-bold text-purple-400">{formatINR(baseCalc.projected)}</span>
            </div>
            <div className="flex justify-between text-[#8e9c93]">
              <span>End Balance (If Bought):</span>
              <span className="text-red-400">{formatINR(simCalc.projected)}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-[#232b26]">
          <button
            type="button"
            onClick={onClearSimulation}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Skip It & Keep My Money</span>
          </button>
          <span className="block text-[10px] text-[#8e9c93] text-center mt-1.5">
            Zero guilt. Instant peace of mind.
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActionOptionsCards;
